/*
  Warnings:

  - You are about to drop the column `itemId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `email` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_supplierId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_itemId_fkey`;

-- DropIndex
DROP INDEX `Order_itemId_fkey` ON `Order`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `itemId`,
    ADD COLUMN `deliveryStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `productName` VARCHAR(191) NOT NULL;
