-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('general_manager', 'customer', 'product_manager', 'sales_manager') NOT NULL;
