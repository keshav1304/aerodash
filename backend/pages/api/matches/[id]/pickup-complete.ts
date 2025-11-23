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

    // Only travelers can mark pick-up as completed
    if (match.travelerId !== payload.userId) {
      return res.status(403).json({ 
        error: 'Only the traveler can mark pick-up as completed' 
      })
    }

    // Can only pick up after drop-off is completed
    if (!match.dropOffCompleted) {
      return res.status(400).json({ 
        error: 'Drop-off must be completed before pick-up can be marked as completed' 
      })
    }

    const updatedMatch = await prisma.match.update({
      where: { id: id as string },
      data: { pickUpCompleted: true },
    })

    res.status(200).json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating pick-up status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

