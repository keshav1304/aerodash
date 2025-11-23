# Turso Database Setup

This backend is configured to use Turso, a serverless SQLite-compatible database.

## Setup Instructions

### 1. Get Your Turso Connection String

If you haven't already:
1. Sign up at https://turso.tech
2. Create a database
3. Get your connection string and auth token

The connection string format is:
```
libsql://[database-name]-[org-name].turso.io?authToken=[your-auth-token]
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

- **DATABASE_URL**: Your full Turso connection string (includes auth token)
  - Format: `libsql://[database-name]-[org-name].turso.io?authToken=[your-auth-token]`
  - Example: `libsql://my-db-myorg.turso.io?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - The auth token is embedded in the connection string, so no separate token variable is needed

### 3. Run Migrations

After setting up the database, you need to run Prisma migrations to create the schema:

**Option A: Using Turso CLI (Recommended)**
```bash
# Install Turso CLI if you haven't
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create database (if not already created)
turso db create aerodash

# Get connection string
turso db show aerodash --url

# Run migrations
cd backend
npx prisma migrate deploy
```

**Option B: Using Prisma Migrate**
```bash
cd backend
# Set DATABASE_URL temporarily
export DATABASE_URL="libsql://your-db.turso.io?authToken=your-token"
npx prisma migrate deploy
```

### 4. Verify Connection

Test the connection by visiting:
```
https://aerodash2.vercel.app/api/health/db
```

It should return a successful status.

## Local Development

For local development, you can either:

1. **Use Turso remotely** (same connection string)
2. **Use local SQLite** (set `DATABASE_URL=file:./prisma/dev.db`)

The Prisma client will automatically detect which one to use based on the connection string format.

## Notes

- Turso is SQLite-compatible, so no schema changes are needed
- The Prisma provider remains `sqlite` in `schema.prisma`
- The backend uses `@prisma/adapter-libsql` for proper Turso integration
- All existing migrations will work with Turso
- Turso supports serverless environments like Vercel
- The Prisma client automatically detects Turso connection strings and uses the adapter

