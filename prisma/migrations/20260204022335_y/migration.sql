/*
  Warnings:

  - A unique constraint covering the columns `[jti]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RefreshToken_tokenHash_key";

-- DropIndex
DROP INDEX "RefreshToken_userId_deviceId_idx";

-- DropIndex
DROP INDEX "User_email_status_idx";

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "jti" TEXT NOT NULL,
ALTER COLUMN "lastUsedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedAttempt" TIMESTAMP(3),
ADD COLUMN     "lockUntil" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_deviceId_isRevoked_idx" ON "RefreshToken"("userId", "deviceId", "isRevoked");

-- CreateIndex
CREATE INDEX "User_email_status_deletedAt_idx" ON "User"("email", "status", "deletedAt");
