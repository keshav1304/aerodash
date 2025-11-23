-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "travelerListingId" TEXT NOT NULL,
    "senderListingId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dropOffCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pickUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_travelerListingId_fkey" FOREIGN KEY ("travelerListingId") REFERENCES "TravelerListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_senderListingId_fkey" FOREIGN KEY ("senderListingId") REFERENCES "SenderListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("createdAt", "id", "notificationSent", "senderId", "senderListingId", "status", "travelerId", "travelerListingId", "updatedAt") SELECT "createdAt", "id", "notificationSent", "senderId", "senderListingId", "status", "travelerId", "travelerListingId", "updatedAt" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
