-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "captionTsv" tsvector;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0;
