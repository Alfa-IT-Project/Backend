/*
  Warnings:

  - You are about to drop the column `warranty_details` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_id` on the `Warranty` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[item_id]` on the table `Warranty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `item_id` to the `Warranty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Warranty` DROP FOREIGN KEY `Warranty_purchase_id_fkey`;

-- DropIndex
DROP INDEX `Warranty_purchase_id_key` ON `Warranty`;

-- AlterTable
ALTER TABLE `Purchase` DROP COLUMN `warranty_details`;

-- AlterTable
ALTER TABLE `Warranty` DROP COLUMN `purchase_id`,
    ADD COLUMN `item_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `warranty_details` VARCHAR(191) NULL,
    `purchase_id` INTEGER NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Warranty_item_id_key` ON `Warranty`(`item_id`);

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `Purchase`(`purchase_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warranty` ADD CONSTRAINT `Warranty_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;
