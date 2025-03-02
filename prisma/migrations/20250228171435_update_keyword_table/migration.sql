/*
  Warnings:

  - You are about to drop the column `links` on the `crawl_content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crawl_content" DROP COLUMN "links",
ADD COLUMN     "totalLinks" INTEGER NOT NULL DEFAULT 0;
