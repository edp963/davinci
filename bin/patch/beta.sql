DROP TABLE IF EXISTS `share_download_record`;
CREATE TABLE `share_download_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `status` smallint(1) NOT NULL,
  `create_time` datetime NOT NULL,
  `last_download_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

