import type { NextApiRequest, NextApiResponse } from 'next'
import { setCorsHeaders } from '../../../lib/cors'
import { searchAirports } from '../../../lib/airports'

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

  const { q } = req.query
  const query = (q as string) || ''

  try {
    const results = searchAirports(query)
    res.status(200).json({ airports: results })
  } catch (error) {
    console.error('Error searching airports:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

