# Debugging Server Errors

## If you're getting "Internal Server Error" when creating listings:

### Step 1: Check Database Migration

The most common issue is that the database schema is out of sync. Run:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name make_arrival_time_required
```

Or if you want to reset and start fresh:

```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Step 2: Check Database Health

Visit or curl the health endpoint:

```bash
curl http://localhost:3000/api/health/db
```

This will show you:
- If the database is connected
- If the TravelerListing table exists
- If the arrivalTime column exists and is nullable

### Step 3: Check Backend Logs

Look at your backend console output. The error should now show:
- Error message
- Error code (Prisma error codes like P2002, P2003, etc.)
- Error stack trace (in development mode)

### Step 4: Common Prisma Error Codes

- **P2002**: Unique constraint violation
- **P2003**: Foreign key constraint violation
- **P2011**: Null constraint violation (likely if arrivalTime is still nullable in DB)
- **P2025**: Record not found

### Step 5: Verify Prisma Client

Make sure Prisma client is generated:

```bash
cd backend
npx prisma generate
```

Then restart your backend server.

### Step 6: Check Request Data

The API now validates:
- All required fields are present
- Dates are valid and in correct format
- Arrival time is after departure time
- Weight is a positive number
- Airport codes are 3 letters

Check the browser network tab or mobile app logs to see what data is being sent.

## Quick Fix Commands

```bash
# Navigate to backend
cd backend

# Regenerate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Restart backend
npm run dev
```

