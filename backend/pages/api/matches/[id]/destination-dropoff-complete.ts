import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'
import { setCorsHeaders } from '../../../../lib/cors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = verifyToken(token)
    const { id } = req.query

    const match = await prisma.match.findUnique({
      where: { id: id as string },
    })

    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    // Only travelers can mark destination drop-off as completed
    if (match.travelerId !== payload.userId) {
      return res.status(403).json({ 
        error: 'Only the traveler can mark destination drop-off as completed' 
      })
    }

    // Can only drop off at destination after picking up at origin
    if (!match.pickUpCompleted) {
      return res.status(400).json({ 
        error: 'Package must be picked up at origin before dropping off at destination' 
      })
    }

    const updatedMatch = await prisma.match.update({
      where: { id: id as string },
      data: { destinationDropOffCompleted: true },
    })

    res.status(200).json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating destination drop-off status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

