# How to Reset the Database

## Quick Reset

To completely reset the database (deletes all data and recreates schema):

```bash
cd backend
npx prisma migrate reset
```

This command will:
1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed scripts (if any)

## Step-by-Step Reset

If you want more control, you can do it manually:

### Option 1: Delete and Recreate

```bash
cd backend
# Delete the database file (SQLite)
rm prisma/dev.db

# Or if using a different database, drop it manually

# Then run migrations
npx prisma migrate dev
```

### Option 2: Reset and Apply Migrations

```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## For SQLite (Current Setup)

Since you're using SQLite, the database file is located at:
- `backend/prisma/dev.db` (or whatever path is in your `DATABASE_URL`)

To reset:
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev
```

Or use Prisma's reset command:
```bash
cd backend
npx prisma migrate reset
```

## After Reset

After resetting, you'll need to:
1. Create new user accounts (register again)
2. Create new listings
3. All previous data will be lost

## Important Notes

- **⚠️ WARNING**: Resetting the database will delete ALL data permanently
- Make sure you don't need any existing data before resetting
- This is useful during development when you want a fresh start
- In production, use database backups instead

