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

    const listings = await prisma.travelerListing.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: { departureTime: 'asc' },
    })

    res.status(200).json({ listings })
  } catch (error) {
    console.error('Error fetching traveler listings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

