/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Library` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Library_userId_name_key" ON "Library"("userId", "name");
