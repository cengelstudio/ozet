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
    "followers" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'TR'
);
INSERT INTO "new_Platform" ("avatarUrl", "bannerUrl", "createdAt", "description", "domain", "followers", "id", "isVerified", "name", "updatedAt", "websiteUrl") SELECT "avatarUrl", "bannerUrl", "createdAt", "description", "domain", "followers", "id", "isVerified", "name", "updatedAt", "websiteUrl" FROM "Platform";
DROP TABLE "Platform";
ALTER TABLE "new_Platform" RENAME TO "Platform";
CREATE UNIQUE INDEX "Platform_domain_key" ON "Platform"("domain");
CREATE INDEX "Platform_domain_idx" ON "Platform"("domain");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
