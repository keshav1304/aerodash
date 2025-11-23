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

    // Only receivers can mark destination pick-up as completed
    if (match.receiverId !== payload.userId) {
      return res.status(403).json({ 
        error: 'Only the package receiver can mark destination pick-up as completed' 
      })
    }

    // Can only pick up at destination after traveler drops off at destination
    if (!match.destinationDropOffCompleted) {
      return res.status(400).json({ 
        error: 'Traveler must drop off at destination before you can pick up' 
      })
    }

    // Mark both destination pick-up and overall match as completed
    const updatedMatch = await prisma.match.update({
      where: { id: id as string },
      data: { 
        destinationPickUpCompleted: true,
        status: 'completed',
      },
    })

    res.status(200).json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating destination pick-up status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

