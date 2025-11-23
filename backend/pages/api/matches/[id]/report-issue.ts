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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = verifyToken(token)
    const { id } = req.query
    const { description } = req.body

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' })
    }

    const match = await prisma.match.findUnique({
      where: { id: id as string },
      include: {
        traveler: true,
        sender: true,
      },
    })

    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    // Only travelers can report issues
    if (match.travelerId !== payload.userId) {
      return res.status(403).json({ 
        error: 'Only the traveler can report issues with the package' 
      })
    }

    // Create issue report
    const issueReport = await prisma.issueReport.create({
      data: {
        matchId: match.id,
        reportedById: payload.userId,
        description: description.trim(),
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        match: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    res.status(201).json({ issueReport })
  } catch (error) {
    console.error('Error creating issue report:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

