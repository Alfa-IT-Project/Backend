/*
  Warnings:

  - You are about to drop the column `customerId` on the `Reward` table. All the data in the column will be lost.
  - Made the column `tierId` on table `Reward` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Reward` DROP FOREIGN KEY `Reward_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Reward` DROP FOREIGN KEY `Reward_tierId_fkey`;

-- DropIndex
DROP INDEX `Reward_customerId_fkey` ON `Reward`;

-- AlterTable
ALTER TABLE `Reward` DROP COLUMN `customerId`,
    MODIFY `tierId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `Tier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
