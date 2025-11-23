/*
  Warnings:

  - Made the column `description` on table `SenderListing` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "IssueReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IssueReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IssueReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "travelerListingId" TEXT NOT NULL,
    "senderListingId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dropOffCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pickUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "destinationDropOffCompleted" BOOLEAN NOT NULL DEFAULT false,
    "destinationPickUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_travelerListingId_fkey" FOREIGN KEY ("travelerListingId") REFERENCES "TravelerListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_senderListingId_fkey" FOREIGN KEY ("senderListingId") REFERENCES "SenderListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("createdAt", "destinationDropOffCompleted", "destinationPickUpCompleted", "dropOffCompleted", "id", "notificationSent", "pickUpCompleted", "senderId", "senderListingId", "status", "travelerId", "travelerListingId", "updatedAt") SELECT "createdAt", "destinationDropOffCompleted", "destinationPickUpCompleted", "dropOffCompleted", "id", "notificationSent", "pickUpCompleted", "senderId", "senderListingId", "status", "travelerId", "travelerListingId", "updatedAt" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_SenderListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "receiverEmail" TEXT,
    "receiverId" TEXT,
    "originAirport" TEXT NOT NULL,
    "destinationAirport" TEXT NOT NULL,
    "packageWeight" REAL NOT NULL,
    "packageType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SenderListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SenderListing_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SenderListing" ("createdAt", "description", "destinationAirport", "id", "isActive", "originAirport", "packageType", "packageWeight", "updatedAt", "userId") SELECT "createdAt", "description", "destinationAirport", "id", "isActive", "originAirport", "packageType", "packageWeight", "updatedAt", "userId" FROM "SenderListing";
DROP TABLE "SenderListing";
ALTER TABLE "new_SenderListing" RENAME TO "SenderListing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
