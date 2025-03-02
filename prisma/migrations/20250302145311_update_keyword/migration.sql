/*
  Warnings:

  - You are about to drop the column `file_upload_id` on the `keyword` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[content]` on the table `keyword` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "keyword" DROP CONSTRAINT "fk_keyword_file_upload";

-- DropIndex
DROP INDEX "ixid_keyword_file_upload_id";

-- DropIndex
DROP INDEX "ixuq_keyword_content";

-- AlterTable
ALTER TABLE "keyword" DROP COLUMN "file_upload_id";

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_keyword_content" ON "keyword"("content");
