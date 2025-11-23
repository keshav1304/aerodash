import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'
import { setCorsHeaders } from '../../../lib/cors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = verifyToken(token)
    const { originAirport, destinationAirport, packageWeight, packageType, description, receiverEmail } = req.body

    if (!originAirport || !destinationAirport || !packageWeight || !packageType || !description || !receiverEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate description is not empty after trimming
    if (!description.trim()) {
      return res.status(400).json({ error: 'Description is required and cannot be empty' })
    }

    // Validate receiver email is not empty after trimming
    if (!receiverEmail.trim()) {
      return res.status(400).json({ error: 'Receiver email is required' })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(receiverEmail.trim())) {
      return res.status(400).json({ error: 'Invalid receiver email format' })
    }

    if (!['carry-on', 'checked', 'either'].includes(packageType)) {
      return res.status(400).json({ error: 'Invalid package type. Must be carry-on, checked, or either' })
    }

    // Find receiver user - receiver email is required
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail.trim().toLowerCase() },
    })
    
    if (!receiver) {
      return res.status(400).json({ error: 'Receiver email must belong to an existing user account' })
    }
    
    const receiverId = receiver.id

    const listing = await prisma.senderListing.create({
      data: {
        userId: payload.userId,
        receiverEmail: receiverEmail.trim(),
        receiverId: receiverId,
        originAirport: originAirport.toUpperCase(),
        destinationAirport: destinationAirport.toUpperCase(),
        packageWeight: parseFloat(packageWeight),
        packageType,
        description: description.trim(),
      },
    })

    // Trigger matching (don't fail if matching fails)
    try {
      await findMatches(listing.id)
    } catch (matchError) {
      console.error('Error in findMatches (non-fatal):', matchError)
      // Continue anyway - listing was created successfully
    }

    res.status(201).json({ listing })
  } catch (error: any) {
    console.error('Error creating sender listing:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    })
  }
}

async function findMatches(senderListingId: string) {
  const senderListing = await prisma.senderListing.findUnique({
    where: { id: senderListingId },
    include: { user: true },
  })

  if (!senderListing) return

  // Only match with travelers whose flights are at least 24 hours away
  const minDepartureTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  
  const travelerListings = await prisma.travelerListing.findMany({
    where: {
      isActive: true,
      originAirport: senderListing.originAirport,
      destinationAirport: senderListing.destinationAirport,
      availableWeight: { gte: senderListing.packageWeight },
      userId: { not: senderListing.userId }, // Exclude user's own listings
      departureTime: { gte: minDepartureTime }, // Flight must be at least 24 hours away
    },
    include: { user: true },
  })

  for (const travelerListing of travelerListings) {
    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        travelerListingId: travelerListing.id,
        senderListingId: senderListing.id,
      },
    })

    if (!existingMatch) {
      // Ensure receiverId is set (should always be set since receiverEmail is required)
      if (!senderListing.receiverId) {
        console.error(`Warning: senderListing ${senderListing.id} has no receiverId. Skipping match creation.`)
        continue
      }
      
      const match = await prisma.match.create({
        data: {
          travelerListingId: travelerListing.id,
          senderListingId: senderListing.id,
          travelerId: travelerListing.userId,
          senderId: senderListing.userId,
          receiverId: senderListing.receiverId, // Now always required
        },
        include: {
          traveler: true,
          sender: true,
          travelerListing: true,
          senderListing: true,
        },
      })

      // Send SMS notifications (non-blocking)
      try {
        const { sendSMS, formatMatchNotification } = await import('../../../lib/sms')
        await sendSMS(
          senderListing.user.phone,
          formatMatchNotification(
            travelerListing.user.name,
            senderListing.user.name,
            senderListing.originAirport,
            senderListing.destinationAirport
          )
        )
        await sendSMS(
          travelerListing.user.phone,
          `You have a new match! ${senderListing.user.name} needs to send a package from ${senderListing.originAirport} to ${senderListing.destinationAirport}. Check the app for details.`
        )
      } catch (smsError) {
        console.error('Error sending SMS (non-fatal):', smsError)
        // Continue anyway - match was created successfully
      }
    }
  }
}

