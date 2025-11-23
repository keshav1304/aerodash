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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = verifyToken(token)
    const { type } = req.query // 'traveler' or 'sender'

    let matches

    if (type === 'traveler') {
      matches = await prisma.match.findMany({
        where: { 
          travelerId: payload.userId,
          senderId: { not: payload.userId }, // Exclude self-matches
          status: { not: 'completed' }, // Exclude completed matches
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          senderListing: true,
          travelerListing: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'sender') {
      matches = await prisma.match.findMany({
        where: { 
          senderId: payload.userId,
          travelerId: { not: payload.userId }, // Exclude self-matches
          status: { not: 'completed' }, // Exclude completed matches
        },
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          travelerListing: true,
          senderListing: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'receiver') {
      // Receivers see matches where they are the receiver
      matches = await prisma.match.findMany({
        where: { 
          receiverId: payload.userId,
          status: { not: 'completed' }, // Exclude completed matches
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          senderListing: true,
          travelerListing: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Show matches for travelers, senders, and receivers
      // Travelers see all their matches, senders see their accepted matches, receivers see their matches
      // Exclude completed matches
      // Debug: Log the query for receivers
      console.log('Fetching matches for user:', payload.userId)
      matches = await prisma.match.findMany({
        where: {
          AND: [
            {
              OR: [
                { travelerId: payload.userId, senderId: { not: payload.userId } },
                { senderId: payload.userId, travelerId: { not: payload.userId }, status: 'accepted' }, // Senders only see accepted matches
                { receiverId: payload.userId }, // Receivers see their matches (Prisma automatically excludes null)
              ],
            },
            { status: { not: 'completed' } }, // Exclude completed matches
          ],
        },
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          senderListing: true,
          travelerListing: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Anonymize traveler information - travelers are always anonymous, senders and receivers are not
    matches = matches.map((match: any) => {
      // If the current user is a sender or receiver viewing this match, always anonymize traveler info
      if (match.traveler && (match.senderId === payload.userId || match.receiverId === payload.userId)) {
        // Travelers are always anonymous to senders and receivers
        match.traveler = {
          ...match.traveler,
          name: 'Anonymous Traveler',
          email: 'hidden@example.com',
          phone: '***-***-****',
        }
      }
      // If the current user is a traveler, they can see sender info (senders are not anonymous)
      // And travelers can see their own info
      return match
    })

    res.status(200).json({ matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

