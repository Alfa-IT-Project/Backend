-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: hardware
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Customer` (
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  `pointCount` int NOT NULL DEFAULT '0',
  `tierId` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `Customer_tierId_fkey` (`tierId`),
  CONSTRAINT `Customer_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `Tier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Customer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customer`
--

LOCK TABLES `Customer` WRITE;
/*!40000 ALTER TABLE `Customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `Customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DeliveryItemDetails`
--

DROP TABLE IF EXISTS `DeliveryItemDetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DeliveryItemDetails` (
  `TrackingID` int NOT NULL AUTO_INCREMENT,
  `Description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Client_Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Delivery_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Contact_Number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Assigned_Date` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Expected_DeliveryDate` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Comments` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchaseId` int NOT NULL,
  PRIMARY KEY (`TrackingID`),
  UNIQUE KEY `DeliveryItemDetails_purchaseId_key` (`purchaseId`),
  CONSTRAINT `DeliveryItemDetails_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase` (`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DeliveryItemDetails`
--

LOCK TABLES `DeliveryItemDetails` WRITE;
/*!40000 ALTER TABLE `DeliveryItemDetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `DeliveryItemDetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Item` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `price` decimal(65,2) NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_added` datetime(3) NOT NULL,
  `product_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `supplierId` int NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `Item_supplierId_fkey` (`supplierId`),
  CONSTRAINT `Item_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Item`
--

LOCK TABLES `Item` WRITE;
/*!40000 ALTER TABLE `Item` DISABLE KEYS */;
/*!40000 ALTER TABLE `Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `requireDate` datetime(3) NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `itemId` int NOT NULL,
  `supplierId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_itemId_fkey` (`itemId`),
  KEY `Order_supplierId_fkey` (`supplierId`),
  CONSTRAINT `Order_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Order_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Purchase`
--

DROP TABLE IF EXISTS `Purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Purchase` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `grand_total` decimal(10,2) NOT NULL,
  `order_date` datetime(3) NOT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `Purchase_user_id_fkey` (`user_id`),
  CONSTRAINT `Purchase_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Customer` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Purchase`
--

LOCK TABLES `Purchase` WRITE;
/*!40000 ALTER TABLE `Purchase` DISABLE KEYS */;
/*!40000 ALTER TABLE `Purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PurchaseItem`
--

DROP TABLE IF EXISTS `PurchaseItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PurchaseItem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PurchaseItem_purchase_id_item_id_key` (`purchase_id`,`item_id`),
  KEY `PurchaseItem_item_id_fkey` (`item_id`),
  CONSTRAINT `PurchaseItem_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PurchaseItem_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `Purchase` (`purchase_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PurchaseItem`
--

LOCK TABLES `PurchaseItem` WRITE;
/*!40000 ALTER TABLE `PurchaseItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `PurchaseItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reward`
--

DROP TABLE IF EXISTS `Reward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tierType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `offer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `generateDate` datetime(3) NOT NULL,
  `expireDate` datetime(3) NOT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tierId` int DEFAULT NULL,
  `customerId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Reward_tierId_fkey` (`tierId`),
  KEY `Reward_customerId_fkey` (`customerId`),
  CONSTRAINT `Reward_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Reward_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `Tier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reward`
--

LOCK TABLES `Reward` WRITE;
/*!40000 ALTER TABLE `Reward` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Supplier`
--

DROP TABLE IF EXISTS `Supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nic` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Supplier_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Supplier`
--

LOCK TABLES `Supplier` WRITE;
/*!40000 ALTER TABLE `Supplier` DISABLE KEYS */;
/*!40000 ALTER TABLE `Supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tier`
--

DROP TABLE IF EXISTS `Tier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pointLevel` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Tier_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tier`
--

LOCK TABLES `Tier` WRITE;
/*!40000 ALTER TABLE `Tier` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('general_manager','customer','product_manager','delivery_manager','driver','supplier_manager') COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unknown',
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Warranty`
--

DROP TABLE IF EXISTS `Warranty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Warranty` (
  `warranty_id` int NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(3) NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`warranty_id`),
  UNIQUE KEY `Warranty_item_id_key` (`item_id`),
  CONSTRAINT `Warranty_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Warranty`
--

LOCK TABLES `Warranty` WRITE;
/*!40000 ALTER TABLE `Warranty` DISABLE KEYS */;
/*!40000 ALTER TABLE `Warranty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('033ea5ba-075a-4cf1-972a-f80d28b142e7','a1b69520f0502cd2573068ed8b5e935762245df1ec9a1780cc2ffeee77e5f938','2025-05-05 13:29:09.579','20250505132908_init_recover',NULL,NULL,'2025-05-05 13:29:08.778',1),('3d5f3a6c-511e-4f16-bad5-ef5409695558','9499b1799aa234535f1326a3cf94cf8571e594f09941728cecc63cec069843d9','2025-05-05 13:29:06.626','20250321070312_purchase_item',NULL,NULL,'2025-05-05 13:29:06.448',1),('66432139-6916-4e5c-826c-91225e8497f2','7fb25426ca984ef492092032a34e7d818a1f890e0d26b29c04ddb0fd78f0b828','2025-05-05 13:29:05.786','20250311131514_new',NULL,NULL,'2025-05-05 13:29:05.744',1),('6701b006-ea5e-43ad-aae6-9be2fd3fcab5','9b213daa4c0d7ce737205143b03500960c572860c9b3318d58a7dc34637362d8','2025-05-05 13:29:05.817','20250312090437_no',NULL,NULL,'2025-05-05 13:29:05.789',1),('6e799525-f708-49fe-af28-a166d015961d','3382d4afffc304ec7da9b05a6956c1603463c27df28121b9cd2f51d58a343c4c','2025-05-05 13:29:06.745','20250321203017_',NULL,NULL,'2025-05-05 13:29:06.629',1),('7134d9fa-b03a-46c9-a90f-780e291f7c6d','a800351e617c24b8be1772c18cee8f70712dd9aa0bb029ea81303d27f807588d','2025-05-05 13:29:06.770','20250329064429_add_contact_messages',NULL,NULL,'2025-05-05 13:29:06.748',1),('a83df1ea-0848-4ad5-822d-dd8ad0f06e21','7563f31b10d7b9ef6c7cbd780a9322488646200a972f62f79fab07288741dd28','2025-05-05 13:29:06.446','20250321063701_item',NULL,NULL,'2025-05-05 13:29:06.180',1),('acce6eea-8e85-4d20-99ee-0c14a4f8b66c','87f21856b44bed9930555cbd89537b82adb558c7f6f2b0dd97d7882fcbd77c03','2025-05-05 13:29:05.741','20250110062607_init',NULL,NULL,'2025-05-05 13:29:05.710',1),('d0261fff-6db4-410e-8350-382dcc5262e1','15d3501b8092cb20d8e6e60f50c2afaa6691a090d91fbfd7a974f8ee7cac6c14','2025-05-05 13:29:06.176','20250315140255_next',NULL,NULL,'2025-05-05 13:29:06.126',1),('f5b21942-6ea8-4297-ad94-fb0055f7a07c','5f1bafb887f1bb925644447fb6e18f9ae61227bd8c339d7ccab5b3cd30486149','2025-05-05 13:29:06.121','20250315134545_now',NULL,NULL,'2025-05-05 13:29:05.820',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-05 19:00:09
