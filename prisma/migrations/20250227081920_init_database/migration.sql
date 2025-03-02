-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashed_password" VARCHAR(500) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_keywords_upload" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "total_keywords" INTEGER NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "connection_id" UUID,

    CONSTRAINT "pk_file_keywords_upload" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "file_upload_id" UUID NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "pk_keyword" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawl_content" (
    "id" UUID NOT NULL,
    "keywordId" UUID NOT NULL,
    "total_google_ads" INTEGER NOT NULL DEFAULT 0,
    "links" JSON NOT NULL DEFAULT '[]',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_crawl_content" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_user_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "ixfk_file_keywords_upload_user_id" ON "file_keywords_upload"("user_id");

-- CreateIndex
CREATE INDEX "ixdate_file_keywords_upload_uploaded_at" ON "file_keywords_upload"("uploaded_at");

-- CreateIndex
CREATE INDEX "ixtext_file_keywords_upload_status" ON "file_keywords_upload"("status");

-- CreateIndex
CREATE INDEX "ixid_keyword_file_upload_id" ON "keyword"("file_upload_id");

-- CreateIndex
CREATE INDEX "ixid_keyword_resolved_at" ON "keyword"("resolved_at");

-- CreateIndex
CREATE INDEX "ixtext_keyword_status" ON "keyword"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_keyword_content" ON "keyword"("content");

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_crawl_content_keyword_id" ON "crawl_content"("keywordId");

-- AddForeignKey
ALTER TABLE "file_keywords_upload" ADD CONSTRAINT "fk_file_keywords_upload_created_by_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword" ADD CONSTRAINT "fk_keyword_file_upload" FOREIGN KEY ("file_upload_id") REFERENCES "file_keywords_upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_content" ADD CONSTRAINT "fk_crawl_content_keyword" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
