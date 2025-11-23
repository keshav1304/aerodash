/*
  Warnings:

  - You are about to drop the column `destination` on the `SenderListing` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `SenderListing` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `TravelerListing` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `TravelerListing` table. All the data in the column will be lost.
  - You are about to drop the column `travelDate` on the `TravelerListing` table. All the data in the column will be lost.
  - Added the required column `destinationAirport` to the `SenderListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originAirport` to the `SenderListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageType` to the `SenderListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalTime` to the `TravelerListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTime` to the `TravelerListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationAirport` to the `TravelerListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originAirport` to the `TravelerListing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SenderListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "originAirport" TEXT NOT NULL,
    "destinationAirport" TEXT NOT NULL,
    "packageWeight" REAL NOT NULL,
    "packageType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SenderListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SenderListing" ("createdAt", "description", "id", "isActive", "packageWeight", "updatedAt", "userId") SELECT "createdAt", "description", "id", "isActive", "packageWeight", "updatedAt", "userId" FROM "SenderListing";
DROP TABLE "SenderListing";
ALTER TABLE "new_SenderListing" RENAME TO "SenderListing";
CREATE TABLE "new_TravelerListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "originAirport" TEXT NOT NULL,
    "destinationAirport" TEXT NOT NULL,
    "flightNumber" TEXT,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "availableWeight" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TravelerListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TravelerListing" ("availableWeight", "createdAt", "id", "isActive", "updatedAt", "userId") SELECT "availableWeight", "createdAt", "id", "isActive", "updatedAt", "userId" FROM "TravelerListing";
DROP TABLE "TravelerListing";
ALTER TABLE "new_TravelerListing" RENAME TO "TravelerListing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
