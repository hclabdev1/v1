-- MySQL dump 10.13  Distrib 8.0.33, for macos13.3 (x86_64)
--
-- Host: localhost    Database: hclab
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Current Database: `hclab`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `hclab` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `hclab`;

--
-- Table structure for table `bill`
--

DROP TABLE IF EXISTS `bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill` (
  `started` datetime DEFAULT NULL,
  `finished` timestamp NULL DEFAULT NULL,
  `chargePointId` varchar(20) DEFAULT NULL,
  `evseSerial` varchar(20) DEFAULT NULL,
  `evseNickname` varchar(20) DEFAULT NULL,
  `ownerId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `totalkWh` decimal(6,2) DEFAULT '0.00',
  `cost` int DEFAULT '0',
  `costHCL` int DEFAULT '0',
  `costHost` int DEFAULT '0',
  `bulkSoc` decimal(6,2) DEFAULT NULL,
  `fullSoc` decimal(6,2) DEFAULT NULL,
  `avgkw` decimal(6,2) DEFAULT NULL,
  `trxid` int NOT NULL,
  `meterStart` decimal(8,2) DEFAULT NULL,
  `meterNow` decimal(8,2) DEFAULT NULL,
  `termination` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`trxid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill`
--

LOCK TABLES `bill` WRITE;
/*!40000 ALTER TABLE `bill` DISABLE KEYS */;
INSERT INTO `bill` VALUES ('2023-03-27 17:08:31','2023-05-08 06:53:06','1111','2',NULL,44,33,43.23,15131,10808,4323,NULL,NULL,50.00,1,0.00,43.23,'1'),('2023-03-27 14:25:01','2023-05-08 06:51:32','3333','1',NULL,22,22,13.30,3990,3325,665,NULL,NULL,NULL,2,0.00,13.30,'1'),('2023-03-27 14:36:27','2023-05-08 06:51:59','3333','1',NULL,22,22,17.20,5160,4300,860,NULL,NULL,NULL,3,0.00,17.20,'2'),('2023-03-28 09:08:21','2023-05-08 06:52:31','3333','1',NULL,0,22,14.50,4350,3625,725,NULL,NULL,NULL,4,0.00,14.50,'1'),('2023-03-28 10:05:53','2023-05-08 06:52:43','1111','3',NULL,22,11,63.00,22050,15750,6300,NULL,NULL,NULL,5,0.00,63.00,'1'),('2023-03-28 10:12:11','2023-05-08 06:49:23','1111','4',NULL,22,11,20.00,7000,5000,2000,NULL,NULL,NULL,6,0.00,20.00,'1'),('2023-03-28 10:14:01','2023-05-08 06:57:22','2222','5',NULL,44,44,70.00,18200,17500,700,NULL,NULL,NULL,7,0.00,70.00,'1'),('2023-04-06 11:04:35','2023-05-08 06:57:30','1111','4',NULL,22,11,43.20,15120,10800,4320,NULL,NULL,NULL,8,0.00,43.20,'1'),('2023-04-06 11:05:33','2023-05-08 06:57:54','1111','4',NULL,22,11,6.70,2345,1675,670,NULL,NULL,NULL,9,0.00,6.70,'1'),('2023-04-12 16:58:52','2023-05-08 06:06:56','3333','2',NULL,22,33,2.20,660,NULL,NULL,NULL,NULL,NULL,10,0.00,2.20,'3'),('2023-04-13 09:19:40','2023-04-13 01:19:40','3333','2',NULL,22,33,NULL,111,NULL,NULL,NULL,NULL,NULL,11,0.00,NULL,NULL),('2023-04-13 09:21:21','2023-04-13 01:21:21','3333','2',NULL,22,33,20.00,111,NULL,NULL,NULL,NULL,NULL,12,0.00,20.00,NULL),('2023-04-13 12:23:15','2023-04-13 04:23:15','3333','2',NULL,22,33,NULL,111,NULL,NULL,NULL,NULL,NULL,13,0.00,NULL,NULL),('2023-04-13 12:28:26','2023-04-13 04:28:26','3333','2',NULL,22,33,NULL,111,NULL,NULL,NULL,NULL,NULL,14,0.00,NULL,NULL),('2023-04-13 17:23:42','2023-04-13 09:23:42','3333','1',NULL,22,2,NULL,111,NULL,NULL,NULL,NULL,NULL,15,0.00,NULL,NULL),('2023-04-14 08:29:57','2023-04-14 00:29:57','3333','1',NULL,22,11,NULL,111,NULL,NULL,NULL,NULL,NULL,16,0.00,NULL,NULL),('2023-04-14 09:25:28','2023-04-14 00:25:40','1111','3',NULL,22,33,39.20,111,NULL,NULL,NULL,NULL,NULL,17,0.00,39.20,NULL),('2023-04-14 10:15:58','2023-04-14 02:15:58','3333','2',NULL,22,44,NULL,111,NULL,NULL,NULL,NULL,NULL,18,0.00,NULL,NULL),('2023-04-14 13:12:54','2023-04-14 04:13:21','1111','4',NULL,22,22,NULL,111,NULL,NULL,12.10,72.70,NULL,19,0.00,NULL,NULL),('2023-04-17 09:34:53','2023-04-17 00:35:29','4444','14',NULL,44,55,NULL,111,NULL,NULL,12.10,72.70,NULL,20,0.00,NULL,NULL),('2023-04-18 16:32:16','2023-04-21 07:10:20','1111','4',NULL,22,55,444.40,111,NULL,NULL,12.10,72.70,NULL,21,0.00,444.40,'4'),('2023-04-27 14:03:31','2023-05-03 00:53:10','3333','1',NULL,22,11,220.00,111,NULL,NULL,10.20,72.70,NULL,22,0.00,220.00,'2'),('2023-04-27 14:24:56','2023-04-27 06:24:56','1111','4',NULL,22,44,NULL,111,NULL,NULL,61.70,72.70,NULL,23,0.00,NULL,NULL),('2023-04-27 14:25:48','2023-04-27 06:25:48','2222','5',NULL,44,11,NULL,111,NULL,NULL,61.70,72.70,NULL,24,0.00,NULL,NULL),('2023-05-03 16:21:04','2023-05-03 07:22:36','4444','10',NULL,44,11,334.00,111,NULL,NULL,5.30,72.70,NULL,25,0.00,334.00,'1'),('2023-05-11 13:14:24','2023-05-11 04:17:15','1111','4',NULL,22,11,23.00,8050,5750,2300,21.10,72.70,NULL,26,100.00,123.00,'2'),('2023-05-11 14:08:24','2023-05-11 05:12:31','1111','4',NULL,22,22,11.10,3885,2775,1110,33.00,72.70,NULL,27,200.00,211.10,'1'),('2023-05-11 14:19:37','2023-05-11 05:22:17','1111','4',NULL,22,11,10.00,3500,2500,1000,2.00,72.70,NULL,28,210.00,220.00,'1'),('2023-05-11 14:34:15','2023-05-11 06:34:15','1111','4',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,29,220.00,NULL,NULL),('2023-05-11 15:04:15','2023-05-11 07:04:15','1111','4',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,30,250.00,NULL,NULL),('2023-05-11 15:07:02','2023-05-11 07:07:02','1111','4',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,31,10.00,NULL,NULL),('2023-05-11 15:10:31','2023-05-11 07:10:31','1111','4',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,32,10.00,NULL,NULL),('2023-05-16 07:47:56','2023-05-15 23:47:56','3333','1',NULL,22,1234,23.00,111,NULL,NULL,10.00,72.70,NULL,33,100.00,123.00,NULL),('2023-05-16 08:13:54','2023-05-16 00:13:54','3333','1',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,34,100.00,NULL,NULL),('2023-05-16 08:16:14','2023-05-16 00:16:14','3333','1',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,35,100.00,NULL,NULL),('2023-05-16 08:50:33','2023-05-16 00:50:33','3333','2',NULL,22,11,NULL,111,NULL,NULL,10.00,72.70,NULL,36,100.00,NULL,NULL),('2023-05-16 08:50:42','2023-05-16 00:50:42','3333','2',NULL,22,22,NULL,111,NULL,NULL,10.00,72.70,NULL,37,100.00,NULL,NULL),('2023-05-22 11:14:09','2023-05-22 03:14:09','3333','2',NULL,22,1234,NULL,111,NULL,NULL,10.00,72.70,NULL,38,100.00,NULL,NULL),('2023-05-22 10:02:47','2023-05-22 01:42:34','1111','4',NULL,22,1234,13.20,111,NULL,NULL,10.00,72.70,NULL,39,100.00,113.20,NULL),('2023-05-22 13:18:59','2023-05-22 05:18:59','1111','7',NULL,22,11,32.00,111,NULL,NULL,10.00,72.70,NULL,40,100.00,132.00,NULL),('2023-05-31 10:24:22','2023-05-31 04:43:44','4444','10',NULL,44,55,70.00,20300,17500,2800,12.00,72.70,NULL,41,100.00,170.00,'1'),('2023-05-31 10:53:10','2023-05-31 04:43:25','5555','20','0020',5678,1234,30.00,9000,7500,1500,5.00,72.70,NULL,42,150.00,180.00,'1'),('2023-06-21 09:45:30','2023-06-21 01:45:30','3333','2',NULL,22,1234,NULL,111,NULL,NULL,6.74,72.70,NULL,43,16.19,NULL,NULL),('2023-06-21 16:32:42','2023-06-21 08:32:42','1111','7','0007',22,1234,NULL,111,NULL,NULL,37.29,72.70,NULL,44,668.47,678.47,NULL),('2023-06-22 10:37:11','2023-06-22 02:37:11','3333','2','0002',22,33,NULL,111,NULL,NULL,54.66,72.70,NULL,46,495.28,NULL,NULL),('2023-06-22 11:02:21','2023-06-22 03:02:21','3333','2','0002',22,33,1263.07,111,NULL,NULL,11.65,72.70,NULL,47,1939.13,3202.20,NULL),('2023-06-22 13:33:41','2023-06-22 05:33:41','3333','2','0002',22,33,0.00,111,NULL,NULL,27.34,72.70,NULL,48,2193.39,2193.39,NULL),('2023-06-22 13:39:47','2023-06-22 05:39:47','3333','2','0002',22,33,0.00,111,NULL,NULL,35.91,72.70,NULL,49,2438.09,2438.09,NULL),('2023-06-22 13:43:30','2023-06-22 05:43:30','3333','2','0002',22,33,0.00,111,NULL,NULL,50.04,72.70,NULL,50,2155.78,2155.78,NULL),('2023-06-22 13:45:27','2023-06-22 05:45:27','3333','2','0002',22,33,0.00,111,NULL,NULL,24.51,72.70,NULL,51,122.77,122.77,NULL),('2023-06-22 13:50:02','2023-06-22 05:50:02','3333','2','0002',22,33,0.00,111,NULL,NULL,66.53,72.70,NULL,52,2737.78,2737.78,NULL),('2023-06-22 13:51:04','2023-06-22 05:51:04','3333','2','0002',22,33,0.00,111,NULL,NULL,22.23,72.70,NULL,53,1577.17,1577.17,NULL),('2023-06-22 13:55:22','2023-06-22 05:55:22','3333','2','0002',22,33,1.20,111,NULL,NULL,28.45,72.70,NULL,54,1407.21,1408.41,NULL),('2023-06-22 16:04:02','2023-06-22 07:05:15','4444','12','0012',44,22,45.45,13179,11362,1818,32.22,72.70,NULL,55,557.50,602.95,'1'),('2023-06-26 08:51:37','2023-06-25 23:53:24','4444','10','0010',44,22,56.05,16253,14011,2242,25.79,72.70,NULL,56,884.13,940.18,'1'),('2023-06-27 15:19:21','2023-06-27 07:19:21','3333','2','0002',22,22,0.00,111,NULL,NULL,57.89,72.70,NULL,57,543.67,543.67,NULL),('2023-06-27 15:21:55','2023-06-27 07:21:55','3333','2','0002',22,22,0.50,111,NULL,NULL,61.46,72.70,NULL,58,1737.78,1738.28,NULL),('2023-06-27 15:25:25','2023-06-27 07:25:25','3333','2','0002',22,22,0.30,111,NULL,NULL,10.04,72.70,NULL,59,2392.78,2393.08,NULL),('2023-06-27 15:38:20','2023-06-27 07:38:20','3333','2','0002',22,22,0.10,111,NULL,NULL,2.31,72.70,NULL,60,1707.90,1708.00,NULL),('2023-07-04 09:06:42','2023-07-04 00:07:57','2222','5','0005',44,22,12.93,3363,3234,129,19.09,72.70,NULL,61,2238.08,2251.01,'1'),('2023-07-04 09:16:47','2023-07-04 00:17:40','2222','5','0005',44,22,2.91,756,727,29,31.31,72.70,NULL,62,1894.89,1897.80,'1'),('2023-07-04 09:29:04','2023-07-04 00:29:44','2222','5','0005',44,22,34.90,9074,8725,349,62.00,72.70,NULL,63,2830.36,2865.26,'1'),('2023-07-04 10:06:38','2023-07-04 01:11:29','2222','5','0005',44,22,20.92,5439,5230,209,47.55,72.70,NULL,64,2118.18,2139.10,'1'),('2023-07-14 18:02:02','2023-07-14 10:02:02',NULL,'10',NULL,NULL,1234,NULL,111,NULL,NULL,1.11,NULL,NULL,65,1111.11,NULL,NULL),('2023-07-14 18:23:42','2023-07-14 10:23:42',NULL,'11',NULL,NULL,1234,0.40,111,NULL,NULL,4.28,72.70,NULL,66,2681.57,2681.97,NULL),('2023-07-14 18:36:35','2023-07-14 09:39:11',NULL,'11',NULL,NULL,1234,7.98,2315,1996,319,20.87,72.70,NULL,67,1006.64,1014.62,'1'),('2023-07-18 09:40:01','2023-07-18 01:40:01',NULL,'1',NULL,NULL,11,0.10,111,NULL,NULL,52.73,72.70,NULL,68,2258.96,2259.06,NULL),('2023-08-16 09:21:51',NULL,'1111','7a01-0001','100001',22,11,0.40,0,0,0,66.56,72.70,NULL,69,1057.02,1057.42,NULL),('2023-08-16 16:35:33',NULL,NULL,'7a01-0001',NULL,NULL,22,0.20,0,0,0,56.93,72.70,NULL,70,1388.92,1389.12,NULL),('2023-08-16 16:38:44','2023-08-16 07:50:17','1111','7a01-0001','100001',22,22,-741.02,-259357,-185255,-74102,28.70,72.70,NULL,71,1741.02,1000.00,'1'),('2023-08-16 16:42:20','2023-08-16 07:50:56','1111','7a01-0001','100001',22,22,17.22,6027,4305,1722,29.34,72.70,NULL,72,1782.78,1800.00,'1'),('2023-08-16 16:47:33',NULL,'1111','7a01-0001','100001',22,22,0.10,0,0,0,4.03,72.70,NULL,73,594.09,594.19,NULL),('2023-08-16 16:53:07',NULL,'1111','7a01-0001','100001',22,22,99.80,0,0,0,25.86,72.70,NULL,74,426.20,526.00,NULL),('2023-08-18 19:34:34','2023-08-16 07:54:37','1111','7a01-0001','100001',22,22,45.08,15779,11271,4508,8.21,72.70,NULL,75,2155.56,2165.56,'1'),('2023-08-21 14:16:40',NULL,'1111','3','0003',22,22,0.10,0,0,0,4.89,72.70,NULL,76,1941.42,1941.52,NULL),('2023-08-23 12:37:04',NULL,'1111','3','0003',22,22,0.10,0,0,0,40.25,0.00,NULL,77,1390.69,1397.00,NULL),('2023-08-21 14:22:40',NULL,'1111','3','0003',22,33,0.20,0,0,0,29.89,72.70,NULL,78,2584.51,2584.71,NULL),('2023-08-22 08:49:15','2023-08-21 23:51:15','2222','4','0004',44,5,52.78,12139,11612,528,23.00,0.00,NULL,79,696.53,749.31,'1'),('2023-08-22 11:54:07','2023-08-22 02:55:37','1111','3','0003',22,55,100.00,32000,22000,10000,0.00,72.70,NULL,80,0.00,100.00,'1'),('2023-08-24 09:52:41','2023-08-24 00:53:38','2222','4','0004',44,5678,48.32,11113,10630,483,17.92,NULL,NULL,81,2594.25,2642.57,'1'),('2023-08-24 09:53:54','2023-08-24 00:54:18','2222','4','0004',44,5678,41.18,9470,9059,412,20.65,NULL,NULL,82,1889.18,1930.36,'1'),('2023-08-28 16:02:39',NULL,'1111','3','0003',22,11,0.00,0,0,0,0.00,NULL,NULL,83,0.00,0.10,NULL),('2023-08-28 16:09:27','2023-08-28 07:11:04','1111','3','0003',22,11,0.01,3,2,1,0.00,NULL,NULL,84,0.00,0.01,'remote'),('2023-08-31 13:42:50','2023-08-31 04:44:36','1111','6','0006',22,11,0.03,10,7,3,7.05,NULL,NULL,85,2.37,2.40,'evse'),('2023-08-31 13:48:13',NULL,'1111','6','0006',22,11,510.23,0,0,0,48.72,NULL,NULL,86,0.51,510.74,NULL),('2023-08-31 13:52:17','2023-08-31 04:58:38','1111','6','0006',22,11,0.02,6,4,2,37.82,NULL,NULL,87,0.28,0.30,'evse'),('2023-08-31 14:05:21','2023-08-31 05:09:07','1111','6','0006',22,11,-0.86,-275,-189,-86,19.31,NULL,NULL,88,1.46,0.60,'evse'),('2023-08-31 14:09:38',NULL,'1111','6','0006',22,11,2943.22,0,0,0,14.18,NULL,NULL,89,2.95,2946.17,NULL),('2023-08-31 14:10:54','2023-08-31 05:11:42','2222','5','0005',44,11,0.07,16,15,1,32.64,NULL,NULL,90,2.03,2.10,'evss');
/*!40000 ALTER TABLE `bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chargepoint`
--

DROP TABLE IF EXISTS `chargepoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chargepoint` (
  `chargePointId` varchar(20) NOT NULL,
  `ownerId` int DEFAULT NULL,
  `chargePointName` varchar(40) DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `locationDetail` varchar(100) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `priceHCL` int DEFAULT NULL,
  `priceHost` int DEFAULT NULL,
  `priceExtra` int DEFAULT NULL,
  `created` timestamp NULL DEFAULT NULL,
  `model` varchar(20) DEFAULT NULL,
  `vendor` varchar(20) DEFAULT NULL,
  `dynamicPricing` tinyint(1) DEFAULT NULL,
  `heartbeat` smallint DEFAULT '60',
  `evses` smallint DEFAULT NULL,
  `avails` int DEFAULT '0',
  `parkingCondition` enum('open','conditional','closed') DEFAULT NULL,
  `parkingFee` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`chargePointId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chargepoint`
--

LOCK TABLES `chargepoint` WRITE;
/*!40000 ALTER TABLE `chargepoint` DISABLE KEYS */;
INSERT INTO `chargepoint` VALUES ('1111',22,'uiwang hyundai 1 cp',37.33,126.95,'basement Section A','uiwang railmuseum road',220,100,0,NULL,'hclab1','hclab',NULL,120,6,6,'open',1),('2222',44,'의왕 현대 제 2 충전소',37.32,126.94,'section B','uiwang si',220,10,1000,NULL,'hclab1','hclab',NULL,60,2,2,'open',1),('3333',22,'의왕  휴게소 ',37.3255,126.952,'ground level 7','uiwang si',220,50,1000,NULL,'hclab1','hclab',NULL,60,2,2,'open',1),('4444',44,'gunpo hyundai test cp',37.29,126,'basement','uiwang si',220,40,1000,'2023-04-14 04:16:57','hclab1','hclab',NULL,60,4,4,'open',1),('5555',5678,'uiwang test chungjeonso',37.4728,127.037,'section B','uiwang si',220,50,1000,'2023-05-03 23:21:55','hclab1','hclab',NULL,60,2,2,'open',1),('6666',5678,'uiwang 3',37.47,127.03,'section B','uiwang si',220,50,1000,'2023-05-03 23:22:19','hclab1','hclab',NULL,60,1,1,'open',1),('7777',5678,'gunpo hyundai 44',37.48,127.04,'section B','uiwang si',220,50,1000,'2023-05-03 23:22:40','hclab1','hclab',NULL,60,1,1,'open',1),('8888',5678,'gunpo hyundai 55',37.46,127.02,'section B','uiwang si',220,50,1000,'2023-05-03 23:22:56','hclab1','hclab',NULL,60,2,2,'open',1);
/*!40000 ALTER TABLE `chargepoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamicpricing`
--

DROP TABLE IF EXISTS `dynamicpricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dynamicpricing` (
  `chargePointId` int NOT NULL,
  PRIMARY KEY (`chargePointId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamicpricing`
--

LOCK TABLES `dynamicpricing` WRITE;
/*!40000 ALTER TABLE `dynamicpricing` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamicpricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evse`
--

DROP TABLE IF EXISTS `evse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evse` (
  `occupyingUserId` int DEFAULT NULL,
  `occupyingEnd` timestamp NULL DEFAULT NULL,
  `evseSerial` varchar(20) DEFAULT NULL,
  `evseNickname` varchar(20) DEFAULT NULL,
  `status` enum('Available','Preparing','Charging','SuspendedEVSE','SuspendedEV','Finishing','Reserved','Unavailable','Faulted') DEFAULT NULL,
  `chargePointId` varchar(20) DEFAULT NULL,
  `created` timestamp NULL DEFAULT NULL,
  `booted` timestamp NULL DEFAULT NULL,
  `lastHeartbeat` timestamp NULL DEFAULT NULL,
  `capacity` decimal(6,2) DEFAULT NULL,
  `connectorId` tinyint DEFAULT NULL,
  `ownerId` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evse`
--

LOCK TABLES `evse` WRITE;
/*!40000 ALTER TABLE `evse` DISABLE KEYS */;
INSERT INTO `evse` VALUES (NULL,NULL,'7a01-0001','100001','Available','1111','2023-02-14 05:59:45','2023-08-19 12:28:23','2023-08-19 12:28:23',11.00,1,'22'),(NULL,NULL,'5','0005','Available','2222','2023-02-14 06:00:46','2023-08-31 05:10:40','2023-08-31 05:12:40',7.00,1,'44'),(NULL,NULL,'7a01-0002','100002','Available','3333','2023-01-03 05:00:00','2023-07-18 00:39:13','2023-07-18 00:41:13',11.00,1,'22'),(NULL,NULL,'2','0002','Available','3333','2023-01-03 05:00:00','2023-08-31 04:11:25','2023-08-31 04:13:25',11.00,1,'22'),(NULL,NULL,'3','0003','Available','1111','2023-03-04 15:00:00','2023-09-01 01:12:03','2023-09-01 01:12:03',11.00,1,'22'),(NULL,NULL,'10','0010','Available','4444','2023-04-14 04:21:15','2023-06-26 00:50:14','2023-06-26 00:51:45',7.00,1,'44'),(NULL,NULL,'11','0011','Available','4444','2023-04-14 04:21:22','2023-07-14 09:36:22','2023-07-14 09:39:22',7.00,1,'44'),(NULL,NULL,'12','0012','Available','4444','2023-04-14 04:21:27','2023-06-22 07:02:54','2023-06-22 07:43:54',7.00,1,'44'),(NULL,NULL,'14','0014','Available','4444','2023-04-14 04:21:33','2023-05-03 07:30:49','2023-05-03 07:45:09',7.00,1,'44'),(NULL,NULL,'6','0006','Available','1111','2023-05-03 22:45:50','2023-08-31 05:09:32','2023-08-31 05:11:38',11.00,1,'22'),(NULL,NULL,'7','0007','Available','1111','2023-05-03 22:46:27','2023-06-21 07:31:16','2023-06-21 07:53:16',11.00,1,'22'),(NULL,NULL,'8','0008','Available','1111','2023-05-03 22:46:32','2023-05-31 04:43:22','2023-05-31 04:43:22',11.00,1,'22'),(NULL,NULL,'9','0009','Available','1111','2023-05-03 22:46:36',NULL,NULL,11.00,1,'22'),(NULL,NULL,'20','0020','Available','5555','2023-05-03 23:25:13','2023-05-31 01:52:16','2023-05-31 01:52:16',7.00,1,'5678'),(NULL,NULL,'21','0021','Available','6666','2023-05-03 23:25:23',NULL,NULL,7.00,1,'5678'),(NULL,NULL,'22','0022','Available','7777','2023-05-03 23:25:34','2023-08-21 01:17:29','2023-08-21 01:17:29',7.00,1,'5678'),(NULL,NULL,'test','00test','Available','5555','2023-05-08 00:40:24','2023-05-30 00:13:52','2023-05-30 00:14:16',7.00,1,'5678'),(NULL,NULL,'23','0023','Available','8888','2023-05-09 00:18:14','2023-05-30 07:43:06','2023-05-30 07:44:01',7.00,1,'5678'),(NULL,NULL,'23','0023','Available','8888','2023-05-09 00:18:16','2023-05-30 07:43:06','2023-05-30 07:44:01',7.00,2,'5678'),(NULL,NULL,'4','0004','Available','2222',NULL,'2023-08-24 00:51:34','2023-08-24 00:54:34',7.00,1,'44');
/*!40000 ALTER TABLE `evse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `evsebycp`
--

DROP TABLE IF EXISTS `evsebycp`;
/*!50001 DROP VIEW IF EXISTS `evsebycp`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `evsebycp` AS SELECT 
 1 AS `chargePointId`,
 1 AS `chargePointName`,
 1 AS `address`,
 1 AS `priceHCL`,
 1 AS `priceHost`,
 1 AS `priceExtra`,
 1 AS `evseSerial`,
 1 AS `evseNickname`,
 1 AS `status`,
 1 AS `occupyingUserId`,
 1 AS `occupyingEnd`,
 1 AS `capacity`,
 1 AS `connectorId`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `evselogs`
--

DROP TABLE IF EXISTS `evselogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evselogs` (
  `evseSerial` varchar(20) DEFAULT NULL,
  `time` timestamp NULL DEFAULT NULL,
  `temp` decimal(4,1) DEFAULT NULL,
  `V` decimal(6,2) DEFAULT NULL,
  `A` decimal(6,2) DEFAULT NULL,
  `kwh` decimal(8,2) DEFAULT NULL,
  `tkWh` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evselogs`
--

LOCK TABLES `evselogs` WRITE;
/*!40000 ALTER TABLE `evselogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `evselogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `userId` int DEFAULT NULL,
  `chargePointId` varchar(20) DEFAULT NULL,
  `favoriteOrder` smallint DEFAULT NULL,
  `recent` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (1234,'1111',1,NULL),(1234,'2222',2,NULL),(1234,'3333',3,'2023-06-27 06:01:26'),(44,'3333',1,NULL),(1234,'4444',4,NULL),(11,'2222',1,NULL),(11,'1111',0,'2023-08-31 05:09:36'),(11,'2222',0,'2023-08-31 05:10:52');
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `favoriteinfos`
--

DROP TABLE IF EXISTS `favoriteinfos`;
/*!50001 DROP VIEW IF EXISTS `favoriteinfos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `favoriteinfos` AS SELECT 
 1 AS `chargePointName`,
 1 AS `chargePointId`,
 1 AS `userId`,
 1 AS `favoriteOrder`,
 1 AS `recent`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `hostaccounting`
--

DROP TABLE IF EXISTS `hostaccounting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostaccounting` (
  `userId` varchar(20) NOT NULL,
  `chargePointId` varchar(20) NOT NULL,
  `profitShareTo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`userId`,`chargePointId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostaccounting`
--

LOCK TABLES `hostaccounting` WRITE;
/*!40000 ALTER TABLE `hostaccounting` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostaccounting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues` (
  `evseSerial` varchar(20) DEFAULT NULL,
  `time` timestamp NULL DEFAULT NULL,
  `errorCode` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `recipientId` int DEFAULT NULL,
  `expiry` timestamp NULL DEFAULT NULL,
  `evseSerial` varchar(20) DEFAULT NULL,
  `type` enum('Angry','Finishing','Waiting') DEFAULT NULL,
  `senderId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (22,NULL,'4','Angry',NULL);
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `password` varchar(64) DEFAULT NULL,
  `phone` varchar(16) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `created` timestamp NULL DEFAULT NULL,
  `host` tinyint(1) DEFAULT NULL,
  `endPoint` varchar(200) DEFAULT NULL,
  `loggedIn` enum('none','android','ios','web') DEFAULT NULL,
  `credit` int DEFAULT NULL,
  `vin` varchar(18) DEFAULT NULL,
  `authStatus` enum('Accepted','Blocked','Expired','Pending') DEFAULT NULL,
  `cardNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5679 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (11,'0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c','01011111111','11@11.com','2023-03-21 00:53:44',0,'11oneone11oneone','android',NULL,NULL,'Accepted','1010010217399237'),(22,'edee29f882543b956620b26d0ee0e7e950399b1c4222f5de05e06425b4c995e9','01022222222','22@22.com','2023-03-21 00:54:37',1,'22twotwo22','web',NULL,NULL,'Accepted',NULL),(33,'318aee3fed8c9d040d35a7fc1fa776fb31303833aa2de885354ddf3d44d8fb69','01033333333','33@33.com','2023-03-21 00:56:11',0,'33threethree33','android',3333,'EIOF2349EE','Blocked',NULL),(44,'79f06f8fde333461739f220090a23cb2a79f6d714bee100d0e4b4af249294619','0104444444','444@444.io','2023-03-21 02:07:17',1,'44four44','ios',NULL,'UE238hfu','Accepted',NULL),(55,'c1f330d0aff31c1c87403f1e4347bcc21aff7c179908723535f2b31723702525','010555555','55@55.55','2023-04-14 04:28:38',0,NULL,'web',NULL,NULL,'Accepted','1234'),(1234,'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4','01000000000','test@test.com','2023-05-02 23:39:13',0,'testtest','android',NULL,NULL,'Accepted',NULL),(5678,'f8638b979b2f4f793ddb6dbd197e0ee25a7a6ea32b0ae22f5e3c5d119d839e75','01056785678','test@test.com','2023-05-03 23:17:15',1,NULL,'web',NULL,NULL,'Accepted',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `useraccounting`
--

DROP TABLE IF EXISTS `useraccounting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `useraccounting` (
  `userId` int NOT NULL,
  `paymentKey` varchar(50) DEFAULT NULL,
  `cardNumber` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `useraccounting`
--

LOCK TABLES `useraccounting` WRITE;
/*!40000 ALTER TABLE `useraccounting` DISABLE KEYS */;
/*!40000 ALTER TABLE `useraccounting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `viewbillplus`
--

DROP TABLE IF EXISTS `viewbillplus`;
/*!50001 DROP VIEW IF EXISTS `viewbillplus`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `viewbillplus` AS SELECT 
 1 AS `started`,
 1 AS `finished`,
 1 AS `chargePointId`,
 1 AS `chargePointName`,
 1 AS `ownerId`,
 1 AS `userId`,
 1 AS `evseSerial`,
 1 AS `evseNickname`,
 1 AS `bulkSoc`,
 1 AS `fullSoc`,
 1 AS `trxId`,
 1 AS `meterStart`,
 1 AS `meterNow`,
 1 AS `totalkWh`,
 1 AS `priceHCL`,
 1 AS `priceHost`,
 1 AS `cost`,
 1 AS `costHCL`,
 1 AS `costHost`*/;
SET character_set_client = @saved_cs_client;

--
-- Current Database: `hclab`
--

USE `hclab`;

--
-- Final view structure for view `evsebycp`
--

/*!50001 DROP VIEW IF EXISTS `evsebycp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`hclab`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `evsebycp` AS select `chargepoint`.`chargePointId` AS `chargePointId`,`chargepoint`.`chargePointName` AS `chargePointName`,`chargepoint`.`address` AS `address`,`chargepoint`.`priceHCL` AS `priceHCL`,`chargepoint`.`priceHost` AS `priceHost`,`chargepoint`.`priceExtra` AS `priceExtra`,`evse`.`evseSerial` AS `evseSerial`,`evse`.`evseNickname` AS `evseNickname`,`evse`.`status` AS `status`,`evse`.`occupyingUserId` AS `occupyingUserId`,`evse`.`occupyingEnd` AS `occupyingEnd`,`evse`.`capacity` AS `capacity`,`evse`.`connectorId` AS `connectorId` from (`chargepoint` join `evse` on((`chargepoint`.`chargePointId` = `evse`.`chargePointId`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `favoriteinfos`
--

/*!50001 DROP VIEW IF EXISTS `favoriteinfos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`hclab`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `favoriteinfos` AS select `chargepoint`.`chargePointName` AS `chargePointName`,`favorite`.`chargePointId` AS `chargePointId`,`favorite`.`userId` AS `userId`,`favorite`.`favoriteOrder` AS `favoriteOrder`,`favorite`.`recent` AS `recent` from (`favorite` join `chargepoint` on((`favorite`.`chargePointId` = `chargepoint`.`chargePointId`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `viewbillplus`
--

/*!50001 DROP VIEW IF EXISTS `viewbillplus`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`hclab`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `viewbillplus` AS select `b`.`started` AS `started`,`b`.`finished` AS `finished`,`c`.`chargePointId` AS `chargePointId`,`c`.`chargePointName` AS `chargePointName`,`c`.`ownerId` AS `ownerId`,`b`.`userId` AS `userId`,`b`.`evseSerial` AS `evseSerial`,`e`.`evseNickname` AS `evseNickname`,`b`.`bulkSoc` AS `bulkSoc`,`b`.`fullSoc` AS `fullSoc`,`b`.`trxid` AS `trxId`,`b`.`meterStart` AS `meterStart`,`b`.`meterNow` AS `meterNow`,`b`.`totalkWh` AS `totalkWh`,`c`.`priceHCL` AS `priceHCL`,`c`.`priceHost` AS `priceHost`,`b`.`cost` AS `cost`,`b`.`costHCL` AS `costHCL`,`b`.`costHost` AS `costHost` from ((`bill` `b` join `chargepoint` `c` on((`b`.`chargePointId` = `c`.`chargePointId`))) join `evse` `e` on((`b`.`evseSerial` = `e`.`evseSerial`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-01 13:57:11
