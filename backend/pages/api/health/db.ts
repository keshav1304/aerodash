import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
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

  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if TravelerListing table exists and has correct schema
    const sample = await prisma.$queryRaw`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='TravelerListing'
    ` as any[]
    
    const tableInfo = await prisma.$queryRaw`
      PRAGMA table_info(TravelerListing)
    ` as any[]

    const hasArrivalTime = tableInfo.some((col: any) => col.name === 'arrivalTime')
    const arrivalTimeNullable = tableInfo.find((col: any) => col.name === 'arrivalTime')?.notnull === 0

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      schema: {
        hasTravelerListingTable: sample.length > 0,
        hasArrivalTimeColumn: hasArrivalTime,
        arrivalTimeIsNullable: arrivalTimeNullable,
        columns: tableInfo.map((col: any) => ({
          name: col.name,
          type: col.type,
          notnull: col.notnull,
        })),
      },
    })
  } catch (error: any) {
    console.error('Database health check error:', error)
    res.status(500).json({
      status: 'error',
      error: error?.message,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
  } finally {
    await prisma.$disconnect()
  }
}

