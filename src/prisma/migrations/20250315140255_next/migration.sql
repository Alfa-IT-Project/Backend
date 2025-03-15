/*
  Warnings:

  - You are about to drop the column `history` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `promotions` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `warranty` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `history`,
    DROP COLUMN `promotions`,
    DROP COLUMN `warranty`;
