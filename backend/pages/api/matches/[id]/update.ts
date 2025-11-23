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
    const { status } = req.body

    if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const match = await prisma.match.findUnique({
      where: { id: id as string },
    })

    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.travelerId !== payload.userId && match.senderId !== payload.userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Only travelers can accept, reject, or mark as completed
    // Senders can only view matches
    if (match.senderId === payload.userId && match.travelerId !== payload.userId) {
      return res.status(403).json({ 
        error: 'Only travelers can accept or reject matches. Senders can only view match status.' 
      })
    }

    const updatedMatch = await prisma.match.update({
      where: { id: id as string },
      data: { status },
    })

    res.status(200).json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating match:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

