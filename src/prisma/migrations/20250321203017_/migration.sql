/*
  Warnings:

  - You are about to drop the column `purchase_id` on the `Promotion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[promo_code]` on the table `Promotion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customer_id` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Promotion` DROP FOREIGN KEY `Promotion_purchase_id_fkey`;

-- DropIndex
DROP INDEX `Promotion_purchase_id_fkey` ON `Promotion`;

-- AlterTable
ALTER TABLE `Promotion` DROP COLUMN `purchase_id`,
    ADD COLUMN `customer_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Promotion_promo_code_key` ON `Promotion`(`promo_code`);

-- AddForeignKey
ALTER TABLE `Promotion` ADD CONSTRAINT `Promotion_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
