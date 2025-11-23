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
    const { 
      originAirport, 
      destinationAirport, 
      flightNumber, 
      departureTime, 
      arrivalTime, 
      availableWeight 
    } = req.body

    // Validate all required fields
    if (!originAirport || !destinationAirport || !departureTime || !arrivalTime || !availableWeight) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: {
          originAirport: !originAirport,
          destinationAirport: !destinationAirport,
          departureTime: !departureTime,
          arrivalTime: !arrivalTime,
          availableWeight: !availableWeight,
        }
      })
    }

    // Validate and parse dates
    const departureDate = new Date(departureTime)
    const arrivalDate = new Date(arrivalTime)
    
    if (isNaN(departureDate.getTime())) {
      return res.status(400).json({ error: 'Invalid departure time format' })
    }
    
    if (isNaN(arrivalDate.getTime())) {
      return res.status(400).json({ error: 'Invalid arrival time format' })
    }

    // Must be at least 24 hours in advance
    const now = new Date()
    const minDepartureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    
    if (departureDate < minDepartureTime) {
      return res.status(400).json({ 
        error: 'Departure time must be at least 24 hours from now' 
      })
    }

    if (arrivalDate <= departureDate) {
      return res.status(400).json({ error: 'Arrival time must be after departure time' })
    }

    // Validate weight
    const weight = parseFloat(availableWeight)
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({ error: 'Invalid weight. Must be a positive number' })
    }

    // Validate airport codes (after trimming and uppercasing)
    const originCode = originAirport.toUpperCase().trim()
    const destCode = destinationAirport.toUpperCase().trim()
    
    if (originCode.length !== 3 || !/^[A-Z]{3}$/.test(originCode)) {
      return res.status(400).json({ error: 'Origin airport must be a valid 3-letter IATA code' })
    }
    
    if (destCode.length !== 3 || !/^[A-Z]{3}$/.test(destCode)) {
      return res.status(400).json({ error: 'Destination airport must be a valid 3-letter IATA code' })
    }

    const listing = await prisma.travelerListing.create({
      data: {
        userId: payload.userId,
        originAirport: originCode,
        destinationAirport: destCode,
        flightNumber: flightNumber ? flightNumber.toUpperCase().trim() : null,
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        availableWeight: weight,
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
    console.error('Error creating traveler listing:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      name: error?.name,
    })
    
    // Check for Prisma-specific errors
    if (error?.code === 'P2002') {
      return res.status(400).json({ error: 'A listing with these details already exists' })
    }
    
    if (error?.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid user reference' })
    }

    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      code: process.env.NODE_ENV === 'development' ? error?.code : undefined
    })
  }
}

async function findMatches(travelerListingId: string) {
  const travelerListing = await prisma.travelerListing.findUnique({
    where: { id: travelerListingId },
    include: { user: true },
  })

  if (!travelerListing) return

  // Only match with senders whose listings were created at least 24 hours before departure
  // This ensures senders have enough time to prepare and deliver packages
  const departureDate = new Date(travelerListing.departureTime)
  const minListingTime = new Date(departureDate.getTime() - 24 * 60 * 60 * 1000)
  
  const senderListings = await prisma.senderListing.findMany({
    where: {
      isActive: true,
      originAirport: travelerListing.originAirport,
      destinationAirport: travelerListing.destinationAirport,
      packageWeight: { lte: travelerListing.availableWeight },
      userId: { not: travelerListing.userId }, // Exclude user's own listings
      createdAt: { lte: minListingTime }, // Listing must be created at least 24 hours before flight
    },
    include: { user: true },
  })

  for (const senderListing of senderListings) {
    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        travelerListingId: travelerListing.id,
        senderListingId: senderListing.id,
      },
    })

    if (!existingMatch) {
      // Ensure receiverId is set (should always be set for new listings since receiverEmail is required)
      if (!senderListing.receiverId) {
        console.error(`Warning: senderListing ${senderListing.id} has no receiverId. Skipping match creation.`)
        continue
      }
      
      await prisma.match.create({
        data: {
          travelerListingId: travelerListing.id,
          senderListingId: senderListing.id,
          travelerId: travelerListing.userId,
          senderId: senderListing.userId,
          receiverId: senderListing.receiverId, // Now always required for new listings
        },
      })
    }
  }
}

