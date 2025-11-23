# Vercel Deployment Notes

## Database Configuration

This backend is configured to use **Turso**, a serverless SQLite-compatible database that works perfectly with Vercel.

### Turso Setup

The backend is already configured for Turso. You just need to:

1. **Set the DATABASE_URL environment variable in Vercel**
   - Go to Vercel project settings → Environment Variables
   - Add `DATABASE_URL` with your Turso connection string
   - Format: `libsql://[database-name]-[org-name].turso.io?authToken=[your-auth-token]`

2. **Run migrations** (see TURSO_SETUP.md for details)
   ```bash
   npx prisma migrate deploy
   ```

### Alternative Database Options

If you prefer a different database:

1. **PostgreSQL**
   - Use Vercel Postgres, Supabase, or Neon
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```

2. **MySQL**
   - Use PlanetScale or another MySQL provider
   - Update schema to use `provider = "mysql"`

### Environment Variables Needed in Vercel:

1. `DATABASE_URL` - **REQUIRED** - Your Turso connection string (includes auth token)
   - Format: `libsql://[database-name]-[org-name].turso.io?authToken=[your-auth-token]`
   - The auth token is embedded in the connection string, so you only need this one variable
2. `JWT_SECRET` - Secret key for JWT tokens (if using auth)
3. `TWILIO_ACCOUNT_SID` - For SMS functionality (optional)
4. `TWILIO_AUTH_TOKEN` - For SMS functionality (optional)
5. `TWILIO_PHONE_NUMBER` - For SMS functionality (optional)

### Build Configuration

The `package.json` has been updated to:
- Generate Prisma Client during build (`prisma generate`)
- Run postinstall to ensure Prisma Client is available

Make sure Prisma migrations are run before deployment, or use `prisma migrate deploy` in your build process.

