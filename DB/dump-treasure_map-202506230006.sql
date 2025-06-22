-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: treasure_map
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `treasuremaps`
--

DROP TABLE IF EXISTS `treasuremaps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treasuremaps` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RowCount` int NOT NULL,
  `ColCount` int NOT NULL,
  `P` int NOT NULL,
  `MatrixJson` text NOT NULL,
  `FuelCost` double NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treasuremaps`
--

LOCK TABLES `treasuremaps` WRITE;
/*!40000 ALTER TABLE `treasuremaps` DISABLE KEYS */;
INSERT INTO `treasuremaps` VALUES (1,3,3,3,'[[3,2,2],[2,2,2],[2,2,1]]',5.656854249492381),(2,3,3,3,'[[1,1,1],[1,1,1],[1,1,1]]',0),(3,3,3,3,'[[3,2,2],[2,2,2],[2,2,1]]',5.656854249492381),(4,3,3,3,'[[1,2,3],[2,1,2],[1,2,1]]',2),(5,3,3,3,'[[3,1,1],[1,2,1],[1,1,1]]',3.414213562373095),(6,3,3,3,'[[3,1,1],[1,1,1],[1,1,1]]',2),(7,3,3,3,'[[3,2,2],[2,2,2],[2,2,1]]',5.656854249492381),(8,3,4,3,'[[2,1,1,1],[1,1,1,1],[2,1,1,3]]',5),(9,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(10,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(11,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(12,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(13,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(14,3,4,12,'[[1,2,3,4],[8,7,6,5],[9,10,11,12]]',11),(15,3,4,3,'[[2,1,1,1],[1,1,1,1],[2,1,1,3]]',5),(16,3,3,3,'[[3,2,2],[2,2,2],[2,2,1]]',5.656854249492381),(17,3,4,8,'[[1,1,1,8],[1,1,1,1],[1,1,1,1]]',3),(18,3,3,3,'[[2,1,1],[1,1,1],[1,1,3]]',4.82842712474619),(19,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(20,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(21,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(22,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(23,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(24,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(25,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(26,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(27,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(28,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(29,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(30,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(31,3,3,3,'[[3,2,2],[2,2,2],[2,2,1]]',5.656854249492381),(32,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(33,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(34,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(35,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(36,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(37,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(38,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381),(39,3,3,3,'[[2,1,1],[1,3,1],[1,1,2]]',3.414213562373095),(40,3,3,3,'[[2,1,1],[1,3,1],[1,1,2]]',3.414213562373095),(41,3,3,3,'[[3,1,1],[1,1,1],[1,1,2]]',5.656854249492381);
/*!40000 ALTER TABLE `treasuremaps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'treasure_map'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-23  0:06:56
