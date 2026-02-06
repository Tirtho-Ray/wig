/*
  Warnings:

  - You are about to drop the column `deviceAlerts` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `promotions` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `push` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleUpdates` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `videoUpload` on the `notification_preferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_preferences" DROP COLUMN "deviceAlerts",
DROP COLUMN "email",
DROP COLUMN "promotions",
DROP COLUMN "push",
DROP COLUMN "scheduleUpdates",
DROP COLUMN "videoUpload",
ADD COLUMN     "UnSafe" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "safe" BOOLEAN NOT NULL DEFAULT true;
