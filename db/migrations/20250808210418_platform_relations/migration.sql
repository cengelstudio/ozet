/*
  Warnings:

  - You are about to drop the column `platform` on the `News` table. All the data in the column will be lost.
  - Added the required column `platformDomain` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "link" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" DATETIME,
    "platformDomain" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'TR',
    "category" TEXT,
    "author" TEXT,
    "guid" TEXT,
    CONSTRAINT "News_platformDomain_fkey" FOREIGN KEY ("platformDomain") REFERENCES "Platform" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_News" ("author", "category", "content", "createdAt", "description", "guid", "id", "imageUrl", "link", "locale", "publishedAt", "title", "updatedAt") SELECT "author", "category", "content", "createdAt", "description", "guid", "id", "imageUrl", "link", "locale", "publishedAt", "title", "updatedAt" FROM "News";
DROP TABLE "News";
ALTER TABLE "new_News" RENAME TO "News";
CREATE UNIQUE INDEX "News_link_key" ON "News"("link");
CREATE UNIQUE INDEX "News_guid_key" ON "News"("guid");
CREATE INDEX "News_platformDomain_idx" ON "News"("platformDomain");
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");
CREATE INDEX "News_locale_idx" ON "News"("locale");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
