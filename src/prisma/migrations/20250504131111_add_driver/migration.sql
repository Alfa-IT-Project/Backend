/*
  Warnings:

  - The values [sales_manager] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('general_manager', 'customer', 'product_manager', 'driver') NOT NULL;
