/*
  Warnings:

  - You are about to drop the column `captionTsv` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "post_caption_tsv_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "captionTsv";

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "notificationPrefs" JSONB NOT NULL DEFAULT '{"frequency": "OFF"}';
