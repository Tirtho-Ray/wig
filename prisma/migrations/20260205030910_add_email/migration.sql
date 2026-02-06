/*
  Warnings:

  - Added the required column `email` to the `EmContact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmContact" ADD COLUMN     "email" TEXT NOT NULL;
