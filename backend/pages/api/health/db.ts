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
    
    // Simple query to test connection (works with both SQLite and Turso)
    const userCount = await prisma.user.count()
    
    // Try to get table info (may not work with Turso, so we'll catch errors)
    let schemaInfo: any = {}
    try {
      const sample = await prisma.$queryRaw`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='TravelerListing'
      ` as any[]
      
      schemaInfo.hasTravelerListingTable = sample.length > 0
    } catch (e) {
      // PRAGMA might not work with Turso, that's okay
      schemaInfo.hasTravelerListingTable = 'unknown'
    }

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      userCount,
      databaseUrl: process.env.DATABASE_URL?.startsWith('libsql://') ? 'Turso' : 'SQLite',
      schema: schemaInfo,
    })
  } catch (error: any) {
    console.error('Database health check error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    })
    res.status(500).json({
      status: 'error',
      error: error?.message || 'Database connection failed',
      code: error?.code,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

