# Troubleshooting Turso Connection Issues

## Common Issues

### 1. Check if packages are installed

Make sure you've installed the required packages:
```bash
cd backend
npm install
```

This should install:
- `@prisma/adapter-libsql`
- `@libsql/client`
- `@prisma/client`
- `prisma`

### 2. Verify Prisma Client is generated

After installing, generate the Prisma Client:
```bash
npx prisma generate
```

### 3. Check your DATABASE_URL format

Your `DATABASE_URL` should be in this format:
```
libsql://[database-name]-[org-name].turso.io?authToken=[your-token]
```

Example:
```
libsql://my-db-myorg.turso.io?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test the connection

Visit these endpoints to test:
- `https://aerodash2.vercel.app/api/health/turso` - Basic Turso connection test
- `https://aerodash2.vercel.app/api/health/db` - Full database health check

### 5. Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `DATABASE_URL` is set correctly
3. Make sure it's set for **Production** environment (or all environments)
4. Redeploy after adding/changing environment variables

### 6. Check Vercel Build Logs

Look for errors in the build logs:
- Missing packages
- Prisma generation errors
- Connection errors

### 7. Verify Database Migrations

Make sure your database schema is set up:
```bash
# Get your connection string
export DATABASE_URL="libsql://your-db.turso.io?authToken=your-token"

# Run migrations
npx prisma migrate deploy
```

### 8. Common Error Messages

**"Cannot find module '@prisma/adapter-libsql'"**
- Solution: Run `npm install` in the backend directory

**"PrismaClient is not configured"**
- Solution: Run `npx prisma generate`

**"Database connection failed"**
- Check your DATABASE_URL format
- Verify the auth token is correct
- Make sure the database exists in Turso

**"P1001: Can't reach database server"**
- Check your Turso database is running
- Verify network connectivity
- Check if the database URL is correct

## Debug Steps

1. **Check the health endpoint:**
   ```bash
   curl https://aerodash2.vercel.app/api/health/turso
   ```

2. **Check Vercel function logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check the logs for any errors

3. **Test locally:**
   ```bash
   cd backend
   export DATABASE_URL="libsql://your-db.turso.io?authToken=your-token"
   npm run dev
   # Then test: http://localhost:3000/api/health/turso
   ```

## Still Not Working?

If you're still having issues:
1. Check the Vercel deployment logs for specific error messages
2. Verify your Turso database is accessible
3. Make sure all environment variables are set correctly
4. Try regenerating Prisma Client: `npx prisma generate`

