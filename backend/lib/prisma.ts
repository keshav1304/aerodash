import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma Client with Turso adapter
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  
  // If using Turso (connection string starts with libsql://)
  if (databaseUrl?.startsWith('libsql://')) {
    try {
      // Parse connection string to extract URL and token
      const urlObj = new URL(databaseUrl)
      const url = `libsql://${urlObj.host}${urlObj.pathname}`
      const authToken = urlObj.searchParams.get('authToken') || undefined
      
      if (!authToken) {
        console.warn('Turso connection string missing authToken, falling back to standard Prisma Client')
        return new PrismaClient()
      }
      
      const libsql = createClient({
        url,
        authToken,
      })
      
      const adapter = new PrismaLibSQL(libsql)
      return new PrismaClient({ adapter })
    } catch (error) {
      console.error('Error creating Turso client:', error)
      // Fallback to standard Prisma Client
      return new PrismaClient()
    }
  }
  
  // Fallback to standard Prisma Client for local SQLite
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

