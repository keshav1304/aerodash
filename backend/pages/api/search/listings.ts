import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { setCorsHeaders } from '../../../lib/cors'
import { verifyToken } from '../../../lib/auth'

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

  const { origin, destination, originAirport, destinationAirport, type } = req.query // type: 'traveler' or 'sender'
  
  // Optional authentication - if user is logged in, exclude their own listings
  let userId: string | null = null
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try {
      const payload = verifyToken(token)
      userId = payload.userId
    } catch (error) {
      // Invalid token, continue without filtering
    }
  }

  try {
    if (type === 'traveler') {
      const listings = await prisma.travelerListing.findMany({
        where: {
          isActive: true,
          ...(originAirport && { originAirport: (originAirport as string).toUpperCase() }),
          ...(destinationAirport && { destinationAirport: (destinationAirport as string).toUpperCase() }),
          // Legacy support for origin/destination
          ...(origin && !originAirport && { originAirport: (origin as string).toUpperCase() }),
          ...(destination && !destinationAirport && { destinationAirport: (destination as string).toUpperCase() }),
          ...(userId && { userId: { not: userId } }), // Exclude user's own listings if authenticated
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { departureTime: 'asc' },
      })
      return res.status(200).json({ listings })
    } else if (type === 'sender') {
      const listings = await prisma.senderListing.findMany({
        where: {
          isActive: true,
          ...(originAirport && { originAirport: (originAirport as string).toUpperCase() }),
          ...(destinationAirport && { destinationAirport: (destinationAirport as string).toUpperCase() }),
          // Legacy support for origin/destination
          ...(origin && !originAirport && { originAirport: (origin as string).toUpperCase() }),
          ...(destination && !destinationAirport && { destinationAirport: (destination as string).toUpperCase() }),
          ...(userId && { userId: { not: userId } }), // Exclude user's own listings if authenticated
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json({ listings })
    } else {
      return res.status(400).json({ error: 'Invalid type parameter' })
    }
  } catch (error) {
    console.error('Error searching listings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

