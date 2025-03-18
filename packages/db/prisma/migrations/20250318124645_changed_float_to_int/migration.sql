/*
  Warnings:

  - You are about to alter the column `latency` on the `WebsiteTick` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "WebsiteTick" ALTER COLUMN "latency" SET DATA TYPE INTEGER;
