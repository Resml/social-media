-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "safetyPrefs" JSONB NOT NULL DEFAULT '{"dailyCap": 15, "gapSeconds": 60, "blackoutStart": 0, "blackoutEnd": 6}',
ALTER COLUMN "notificationPrefs" SET DEFAULT '{"frequency": "OFF", "email": "", "notifyComments": true, "notifyMentions": true, "notifyTags": true}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "globalSafetyPause" BOOLEAN NOT NULL DEFAULT false;
