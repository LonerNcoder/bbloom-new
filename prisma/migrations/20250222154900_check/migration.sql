/*
  Warnings:

  - A unique constraint covering the columns `[userId,novelId,chapter]` on the table `NovelBookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NovelBookmark_userId_novelId_chapter_key" ON "NovelBookmark"("userId", "novelId", "chapter");
