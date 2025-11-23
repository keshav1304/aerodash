# Database Migration for Drop-Off and Pick-Up Tracking

## New Fields Added

The `Match` model now includes four new boolean fields:
- `dropOffCompleted` (default: false) - Tracks when the sender has completed drop-off at origin
- `pickUpCompleted` (default: false) - Tracks when the traveler has completed pick-up at origin
- `destinationDropOffCompleted` (default: false) - Tracks when the traveler has completed drop-off at destination
- `destinationPickUpCompleted` (default: false) - Tracks when the sender has completed pick-up at destination

## Migration Command

Run the following command to update your database:

```bash
cd backend
npx prisma migrate dev --name add_dropoff_pickup_tracking
```

Or if you want to reset and start fresh:

```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## New API Endpoints

1. **PATCH `/api/matches/[id]/dropoff-complete`**
   - Marks origin drop-off as completed
   - Only accessible by the package sender
   - Updates `dropOffCompleted` to `true`

2. **PATCH `/api/matches/[id]/pickup-complete`**
   - Marks origin pick-up as completed
   - Only accessible by the traveler
   - Requires `dropOffCompleted` to be `true` first
   - Updates `pickUpCompleted` to `true`

3. **PATCH `/api/matches/[id]/destination-dropoff-complete`**
   - Marks destination drop-off as completed
   - Only accessible by the traveler
   - Requires `pickUpCompleted` to be `true` first
   - Updates `destinationDropOffCompleted` to `true`

4. **PATCH `/api/matches/[id]/destination-pickup-complete`**
   - Marks destination pick-up as completed
   - Only accessible by the package sender
   - Requires `destinationDropOffCompleted` to be `true` first
   - Updates `destinationPickUpCompleted` to `true` and sets match status to `completed`

## Complete Workflow

1. **Sender** generates drop-off QR code at origin airport
2. **Sender** marks "Drop Off Completed" after dropping off package
3. **Traveler** can now generate pick-up QR code at origin (only after drop-off is completed)
4. **Traveler** marks "Package Picked Up" after picking up package at origin
5. **Traveler** generates destination drop-off QR code
6. **Traveler** marks "Drop Off at Destination Completed" after dropping off at destination
7. **Sender** can now generate destination pick-up QR code (only after destination drop-off is completed)
8. **Sender** marks "Package Picked Up at Destination" - Match is now completed

