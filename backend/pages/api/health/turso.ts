import type { NextApiRequest, NextApiResponse } from 'next'
import { setCorsHeaders } from '../../../lib/cors'
import { prisma } from '../../../lib/prisma'

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

  const databaseUrl = process.env.DATABASE_URL
  const isTurso = databaseUrl?.startsWith('libsql://')
  
  try {
    // Test basic connection
    await prisma.$connect()
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test` as any[]
    
    res.status(200).json({
      status: 'ok',
      databaseType: isTurso ? 'Turso' : 'SQLite',
      connectionTest: 'passed',
      queryTest: result,
      hasDatabaseUrl: !!databaseUrl,
      urlPrefix: databaseUrl?.substring(0, 20) + '...',
    })
  } catch (error: any) {
    console.error('Turso health check error:', error)
    res.status(500).json({
      status: 'error',
      error: error?.message,
      code: error?.code,
      name: error?.name,
      databaseType: isTurso ? 'Turso' : 'SQLite',
      hasDatabaseUrl: !!databaseUrl,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error?.stack,
        fullError: error,
      } : undefined,
    })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore
    }
  }
}

