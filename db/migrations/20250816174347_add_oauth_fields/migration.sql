-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "birthDate" DATETIME,
    "avatarUrl" TEXT,
    "oauthProvider" TEXT,
    "oauthId" TEXT,
    "username" TEXT,
    "givenName" TEXT,
    "familyName" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastOAuthSync" DATETIME
);
INSERT INTO "new_User" ("avatarUrl", "birthDate", "createdAt", "email", "hashedPassword", "id", "name", "role", "updatedAt") SELECT "avatarUrl", "birthDate", "createdAt", "email", "hashedPassword", "id", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_oauthProvider_oauthId_idx" ON "User"("oauthProvider", "oauthId");
CREATE INDEX "User_username_idx" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
