-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('general_manager', 'customer', 'product_manager', 'delivery_manager', 'driver', 'supplier_manager') NOT NULL;
