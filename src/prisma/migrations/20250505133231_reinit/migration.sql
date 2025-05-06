-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('general_manager', 'customer', 'product_manager', 'delivery_manager', 'driver', 'supplier_manager') NOT NULL,
    `address` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `phone` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `notes` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `pointCount` INTEGER NOT NULL DEFAULT 0,
    `tierId` INTEGER NULL,

    INDEX `Customer_tierId_fkey`(`tierId`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `purchase_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `shipping_fee` DECIMAL(10, 2) NOT NULL,
    `grand_total` DECIMAL(10, 2) NOT NULL,
    `order_date` DATETIME(3) NOT NULL,

    INDEX `Purchase_user_id_fkey`(`user_id`),
    PRIMARY KEY (`purchase_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DECIMAL(65, 2) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date_added` DATETIME(3) NOT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,

    INDEX `Item_supplierId_fkey`(`supplierId`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `PurchaseItem_item_id_fkey`(`item_id`),
    UNIQUE INDEX `PurchaseItem_purchase_id_item_id_key`(`purchase_id`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warranty` (
    `warranty_id` INTEGER NOT NULL AUTO_INCREMENT,
    `expiry_date` DATETIME(3) NOT NULL,
    `item_id` INTEGER NOT NULL,

    UNIQUE INDEX `Warranty_item_id_key`(`item_id`),
    PRIMARY KEY (`warranty_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pointLevel` INTEGER NOT NULL,

    UNIQUE INDEX `Tier_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tierType` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `offer` VARCHAR(191) NOT NULL,
    `generateDate` DATETIME(3) NOT NULL,
    `expireDate` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `tierId` INTEGER NULL,
    `customerId` INTEGER NOT NULL,

    INDEX `Reward_customerId_fkey`(`customerId`),
    INDEX `Reward_tierId_fkey`(`tierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `requireDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `itemId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,

    INDEX `Order_itemId_fkey`(`itemId`),
    INDEX `Order_supplierId_fkey`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `nic` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,

    UNIQUE INDEX `Supplier_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryItemDetails` (
    `TrackingID` INTEGER NOT NULL AUTO_INCREMENT,
    `Description` VARCHAR(191) NOT NULL,
    `Client_Name` VARCHAR(191) NOT NULL,
    `Delivery_address` VARCHAR(191) NOT NULL,
    `Contact_Number` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Assigned_Date` VARCHAR(191) NOT NULL,
    `Expected_DeliveryDate` VARCHAR(191) NULL,
    `Comments` VARCHAR(191) NULL,
    `purchaseId` INTEGER NOT NULL,

    UNIQUE INDEX `DeliveryItemDetails_purchaseId_key`(`purchaseId`),
    PRIMARY KEY (`TrackingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `Tier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Customer`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `Purchase`(`purchase_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warranty` ADD CONSTRAINT `Warranty_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `Tier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryItemDetails` ADD CONSTRAINT `DeliveryItemDetails_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
