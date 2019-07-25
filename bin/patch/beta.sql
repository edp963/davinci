DROP TABLE IF EXISTS `visitor_operation`;
CREATE TABLE `visitor_operation` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(255) DEFAULT NULL COMMENT 'login/visit/initial/sync/search/linkage/drill/download_task/download/print',
  `org_id` BIGINT(20) DEFAULT NULL,
  `project_id` BIGINT(20) DEFAULT NULL,
  `project_name` VARCHAR(255) DEFAULT NULL,
  `viz_type` VARCHAR(255) DEFAULT NULL COMMENT 'dashboard/display',
  `viz_id` BIGINT(20) DEFAULT NULL,
  `viz_name` VARCHAR(255) DEFAULT NULL,
  `sub_viz_id` BIGINT(20) DEFAULT NULL,
  `sub_viz_name` VARCHAR(255) DEFAULT NULL,
  `create_time` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=INNODB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `terminal`;
CREATE TABLE `terminal` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `browser_name` VARCHAR(255) DEFAULT NULL,
  `browser_version` VARCHAR(255) DEFAULT NULL,
  `engine_name` VARCHAR(255) DEFAULT NULL,
  `engine_version` VARCHAR(255) DEFAULT NULL,
  `os_name` VARCHAR(255) DEFAULT NULL,
  `os_version` VARCHAR(255) DEFAULT NULL,
  `device_model` VARCHAR(255) DEFAULT NULL,
  `device_type` VARCHAR(255) DEFAULT NULL,
  `device_vendor` VARCHAR(255) DEFAULT NULL,
  `cpu_architecture` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `duration`;
CREATE TABLE `duration` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `start_time` TIMESTAMP NULL DEFAULT NULL,
  `end_time` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=INNODB DEFAULT CHARSET=utf8;

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

