
-- DropIndex
DROP INDEX "ixuq_keyword_content";

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_keyword_content" ON "keyword"("file_upload_id", "content");
