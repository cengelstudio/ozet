/*
  Warnings:

  - You are about to drop the column `followers` on the `Platform` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Follow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Follow_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "websiteUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'TR'
);
INSERT INTO "new_Platform" ("avatarUrl", "bannerUrl", "createdAt", "description", "domain", "id", "isVerified", "locale", "name", "updatedAt", "websiteUrl") SELECT "avatarUrl", "bannerUrl", "createdAt", "description", "domain", "id", "isVerified", "locale", "name", "updatedAt", "websiteUrl" FROM "Platform";
DROP TABLE "Platform";
ALTER TABLE "new_Platform" RENAME TO "Platform";
CREATE UNIQUE INDEX "Platform_domain_key" ON "Platform"("domain");
CREATE INDEX "Platform_domain_idx" ON "Platform"("domain");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Follow_userId_idx" ON "Follow"("userId");

-- CreateIndex
CREATE INDEX "Follow_platformId_idx" ON "Follow"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_platformId_key" ON "Follow"("userId", "platformId");
