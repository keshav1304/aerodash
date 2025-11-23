# Database Migration Notes

## Important: Run Database Migration

After updating the schema, you need to run a migration to update your database:

```bash
cd backend
npx prisma migrate dev --name add_airports_and_flight_info
```

This will:
1. Update the TravelerListing table to use airports, flight numbers, and times
2. Update the SenderListing table to use airports and package type
3. Migrate existing data (if any) - note that existing data may need manual migration

## Schema Changes

### TravelerListing
- Changed `origin` → `originAirport` (airport code)
- Changed `destination` → `destinationAirport` (airport code)
- Changed `travelDate` → `departureTime` (DateTime)
- Added `arrivalTime` (DateTime, optional)
- Added `flightNumber` (String, optional)

### SenderListing
- Changed `origin` → `originAirport` (airport code)
- Changed `destination` → `destinationAirport` (airport code)
- Added `packageType` (String: "carry-on", "checked", or "either")

## Breaking Changes

⚠️ **Note**: This is a breaking change. Existing listings in the database will need to be migrated or recreated.

If you have existing data, you may need to:
1. Export existing data
2. Run the migration
3. Manually update the data format
4. Re-import if needed

Or simply start fresh by resetting the database:
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

