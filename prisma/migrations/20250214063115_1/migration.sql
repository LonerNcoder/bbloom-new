/*
  Warnings:

  - You are about to drop the column `progressPercent` on the `ReadingHistory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReadingHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "novelId" INTEGER NOT NULL,
    "lastReadChapter" INTEGER NOT NULL DEFAULT 1,
    "maxChapterRead" INTEGER NOT NULL DEFAULT 1,
    "lastVisitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingHistory_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReadingHistory" ("id", "lastReadChapter", "lastVisitedAt", "novelId", "userId") SELECT "id", "lastReadChapter", "lastVisitedAt", "novelId", "userId" FROM "ReadingHistory";
DROP TABLE "ReadingHistory";
ALTER TABLE "new_ReadingHistory" RENAME TO "ReadingHistory";
CREATE UNIQUE INDEX "ReadingHistory_userId_novelId_key" ON "ReadingHistory"("userId", "novelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
