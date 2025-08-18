-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "link" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" DATETIME,
    "platform" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'TR',
    "category" TEXT,
    "author" TEXT,
    "guid" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "News_link_key" ON "News"("link");

-- CreateIndex
CREATE UNIQUE INDEX "News_guid_key" ON "News"("guid");

-- CreateIndex
CREATE INDEX "News_platform_idx" ON "News"("platform");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "News_locale_idx" ON "News"("locale");
