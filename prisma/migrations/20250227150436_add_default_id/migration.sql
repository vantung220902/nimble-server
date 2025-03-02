-- AlterTable
ALTER TABLE "crawl_content" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "file_keywords_upload" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "keyword" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
