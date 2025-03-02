/*
  Warnings:

  - You are about to drop the column `status` on the `keyword` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ixtext_keyword_status";

-- AlterTable
ALTER TABLE "keyword" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "user_keyword_upload" (
    "file_upload_id" UUID NOT NULL,
    "keyword_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "pk_file_keyword" PRIMARY KEY ("file_upload_id","keyword_id")
);

-- CreateIndex
CREATE INDEX "ixfk_user_keyword_upload_keyword" ON "user_keyword_upload"("keyword_id");

-- CreateIndex
CREATE INDEX "ixfk_user_keyword_upload_file_upload" ON "user_keyword_upload"("file_upload_id");

-- AddForeignKey
ALTER TABLE "user_keyword_upload" ADD CONSTRAINT "fk_user_keyword_upload_file_upload" FOREIGN KEY ("file_upload_id") REFERENCES "file_keywords_upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_keyword_upload" ADD CONSTRAINT "fk_user_keyword_upload_keyword" FOREIGN KEY ("keyword_id") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
