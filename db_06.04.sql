-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: mmarques_2223_db
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `comment_input` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `image_id` int NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `image_id` (`image_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `image_bank` (`image_id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user_data` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_bank`
--

DROP TABLE IF EXISTS `image_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_bank` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `image_name` varchar(100) NOT NULL,
  `image_path` varchar(500) NOT NULL,
  `user_id` int DEFAULT NULL,
  `date_upload` datetime DEFAULT CURRENT_TIMESTAMP,
  `caption` varchar(500) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `comment_input` varchar(500) DEFAULT NULL,
  `number_likes` int DEFAULT NULL,
  `number_comments` int DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `image_bank_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_data` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_bank`
--

LOCK TABLES `image_bank` WRITE;
/*!40000 ALTER TABLE `image_bank` DISABLE KEYS */;
INSERT INTO `image_bank` VALUES (25,'Girl in Market','/uploads/resized/IMG_7574 (1).jpg',6,'2023-04-06 16:19:21','Photo I took in Cambodia','Girl in a Truck',NULL,NULL,NULL),(27,'Deer Spotting','/uploads/resized/IMG_7273-4 (1).jpg',6,'2023-04-06 17:13:00','Found some deer while hiking in Glendalough or however you spell that ','deer',NULL,NULL,NULL),(29,'Busy Streets in Cologne','/uploads/resized/IMG_0484.JPG',6,'2023-04-06 17:41:42','Took this photo during my exchange semester in Germany, love how the smoke looks ^.^','man smoking on the street',NULL,NULL,NULL);
/*!40000 ALTER TABLE `image_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('N7O1mKWBBARILqQ84ypzPWfKiO67-rmi',1680798638,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),('OYYhyxTzxn96bIK1PPfaXlbtArvEl59I',1680885699,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":6},\"flash\":{}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_data`
--

DROP TABLE IF EXISTS `user_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_data` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_first_name` varchar(100) DEFAULT NULL,
  `user_last_name` varchar(100) DEFAULT NULL,
  `user_email_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_data`
--

LOCK TABLES `user_data` WRITE;
/*!40000 ALTER TABLE `user_data` DISABLE KEYS */;
INSERT INTO `user_data` VALUES (1,'mmarques','root','Márcia','Marques','mmarques@tcd.ie'),(2,'mmarques1','ddddddddd','Márcia','Marques','mmarques@tcd.ie'),(3,'mmarques','eee','Márcia','Marques','marciagm00@gmail.com'),(4,'mmarques','root','Márcia','Marques','mmarques@tcd.ie'),(5,'mmarques1','$2b$10$lJHdvJjITSaDQ5/9tnRJ.OcakByCScyWKGyjSUV8xXLbOi5U04B2C','Márcia','Marques','mmarques@tcd.ie'),(6,'sara','$2b$10$bqnu97LvqIOjUFS3GxQZ1eSFoMAbaShgmvbXBbWEdV027QbH3KPIO','Sara','Costa','saracosta5a@gmail.com'),(7,'sara','$2b$10$AaAFF3BNhVtX.v8NrlFzv.3We84kpYt0KFEC/80BM8zZF3wgc.YnO','Sara','Costa','saracosta5a@gmail.com'),(8,'sara','$2b$10$WeN.3RhN2ryK01RWfz7lquAuryKoOBOQKatdH8U6WPIO7AW0s0ez.','Sara','Costa','saracosta5a@gmail.com'),(9,'sara','$2b$10$JO/Ete0PokOgm9IB7nYzuejBHQTgHAiLXJWbfLZc/G6JLgCqcuuYe','Sara','Costa','saracosta5a@gmail.com'),(10,'marcia.mgm','$2b$10$i7yL9b4yepzZkz.tzqwMl.KZJO7HKo3i6AHLr7fN49TrgQsLOZIoK','Márcia','Marques','mmarques@tcd.ie'),(11,'dxf','$2b$10$7RQwbcNH4TZsTYUsDrZRi.QEYbOFls7lqbDySoiy5NYvySOjSDIH.','Márcia','Marques','mmarques@tcd.ie'),(12,'sara','$2b$10$D07CmWlsYQ7Agoyj/ORHPOjNpVqWwp69Tfqlc3vcL0Mef1A8haxBu','Sara','Costa','saracosta5a@gmail.com');
/*!40000 ALTER TABLE `user_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-06 17:54:08
