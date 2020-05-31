SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cron_job
-- ----------------------------
DROP TABLE IF EXISTS `cron_job`;
CREATE TABLE `cron_job` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 45 ) COLLATE utf8_unicode_ci NOT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`job_type` VARCHAR ( 45 ) COLLATE utf8_unicode_ci NOT NULL,
	`job_status` VARCHAR ( 10 ) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
	`cron_expression` VARCHAR ( 45 ) COLLATE utf8_unicode_ci NOT NULL,
	`start_date` DATETIME NOT NULL,
	`end_date` DATETIME NOT NULL,
	`config` TEXT COLLATE utf8_unicode_ci NOT NULL,
	`description` VARCHAR ( 255 ) COLLATE utf8_unicode_ci DEFAULT NULL,
	`exec_log` TEXT COLLATE utf8_unicode_ci,
	`create_by` BIGINT ( 20 ) NOT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	`parent_id` BIGINT ( 20 ) DEFAULT NULL,
	`full_parent_id` VARCHAR ( 255 ) COLLATE utf8_unicode_ci DEFAULT NULL,
	`is_folder` TINYINT ( 1 ) DEFAULT NULL,
	`index` INT ( 5 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `name_UNIQUE` ( `name` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for dashboard
-- ----------------------------
DROP TABLE IF EXISTS `dashboard`;
CREATE TABLE `dashboard` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`dashboard_portal_id` BIGINT ( 20 ) NOT NULL,
	`type` SMALLINT ( 1 ) NOT NULL,
	`index` INT ( 4 ) NOT NULL,
	`parent_id` BIGINT ( 20 ) NOT NULL DEFAULT '0',
	`config` TEXT,
	`full_parent_id` VARCHAR ( 255 ) DEFAULT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_dashboard_id` ( `dashboard_portal_id` ) USING BTREE,
	KEY `idx_parent_id` ( `parent_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for dashboard_portal
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_portal`;
CREATE TABLE `dashboard_portal` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`avatar` VARCHAR ( 255 ) DEFAULT NULL,
	`publish` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_project_id` ( `project_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for display
-- ----------------------------
DROP TABLE IF EXISTS `display`;
CREATE TABLE `display` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`avatar` VARCHAR ( 255 ) DEFAULT NULL,
	`publish` TINYINT ( 1 ) NOT NULL,
	`config` text NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_project_id` ( `project_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for display_slide
-- ----------------------------
DROP TABLE IF EXISTS `display_slide`;
CREATE TABLE `display_slide` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`display_id` BIGINT ( 20 ) NOT NULL,
	`index` INT ( 12 ) NOT NULL,
	`config` text NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_display_id` ( `display_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for download_record
-- ----------------------------
DROP TABLE IF EXISTS `download_record`;
CREATE TABLE `download_record` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`path` VARCHAR ( 255 ) DEFAULT NULL,
	`status` SMALLINT ( 1 ) NOT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_download_time` DATETIME DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_user` ( `user_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for favorite
-- ----------------------------
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `idx_user_project` ( `user_id`, `project_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for mem_dashboard_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_dashboard_widget`;
CREATE TABLE `mem_dashboard_widget` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`alias`	 VARCHAR(30) NULL,
	`dashboard_id` BIGINT ( 20 ) NOT NULL,
	`widget_Id` BIGINT ( 20 ) DEFAULT NULL,
	`x` INT ( 12 ) NOT NULL,
	`y` INT ( 12 ) NOT NULL,
	`width` INT ( 12 ) NOT NULL,
	`height` INT ( 12 ) NOT NULL,
	`polling` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`frequency` INT ( 12 ) DEFAULT NULL,
	`config` text,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_protal_id` ( `dashboard_id` ) USING BTREE,
	KEY `idx_widget_id` ( `widget_Id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for mem_display_slide_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_display_slide_widget`;
CREATE TABLE `mem_display_slide_widget` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`display_slide_id` BIGINT ( 20 ) NOT NULL,
	`widget_id` BIGINT ( 20 ) DEFAULT NULL,
	`name` VARCHAR ( 255 ) NOT NULL,
	`params` text NOT NULL,
	`type` SMALLINT ( 1 ) NOT NULL,
	`sub_type` SMALLINT ( 2 ) DEFAULT NULL,
	`index` INT ( 12 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_slide_id` ( `display_slide_id` ) USING BTREE,
	KEY `idx_widget_id` ( `widget_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for organization
-- ----------------------------
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`avatar` VARCHAR ( 255 ) DEFAULT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`project_num` INT ( 20 ) DEFAULT '0',
	`member_num` INT ( 20 ) DEFAULT '0',
	`role_num` INT ( 20 ) DEFAULT '0',
	`allow_create_project` TINYINT ( 1 ) DEFAULT '1',
	`member_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '0',
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`create_by` BIGINT ( 20 ) NOT NULL DEFAULT '0',
	`update_time` TIMESTAMP NULL,
	`update_by` BIGINT ( 20 ) DEFAULT '0',
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for platform
-- ----------------------------
DROP TABLE IF EXISTS `platform`;
CREATE TABLE `platform` (
	`id` BIGINT ( 20 ) NOT NULL,
	`name` VARCHAR ( 255 ) NOT NULL,
	`platform` VARCHAR ( 255 ) NOT NULL,
	`code` VARCHAR ( 32 ) NOT NULL,
	`checkCode` VARCHAR ( 255 ) DEFAULT NULL,
	`checkSystemToken` VARCHAR ( 255 ) DEFAULT NULL,
	`checkUrl` VARCHAR ( 255 ) DEFAULT NULL,
	`alternateField1` VARCHAR ( 255 ) DEFAULT NULL,
	`alternateField2` VARCHAR ( 255 ) DEFAULT NULL,
	`alternateField3` VARCHAR ( 255 ) DEFAULT NULL,
	`alternateField4` VARCHAR ( 255 ) DEFAULT NULL,
	`alternateField5` VARCHAR ( 255 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`pic` VARCHAR ( 255 ) DEFAULT NULL,
	`org_id` BIGINT ( 20 ) NOT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`visibility` TINYINT ( 1 ) DEFAULT '1',
	`star_num` INT ( 11 ) DEFAULT '0',
	`is_transfer` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`initial_org_id` BIGINT ( 20 ) NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for rel_project_admin
-- ----------------------------
DROP TABLE IF EXISTS `rel_project_admin`;
CREATE TABLE `rel_project_admin` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `idx_project_user` ( `project_id`, `user_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_dashboard
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_dashboard`;
CREATE TABLE `rel_role_dashboard` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`dashboard_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `dashboard_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_display
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_display`;
CREATE TABLE `rel_role_display` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`display_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `display_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_portal
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_portal`;
CREATE TABLE `rel_role_portal` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`portal_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `portal_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_project
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_project`;
CREATE TABLE `rel_role_project` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`role_id` BIGINT ( 20 ) NOT NULL,
	`source_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '1',
	`view_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '1',
	`widget_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '1',
	`viz_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '1',
	`schedule_permission` SMALLINT ( 1 ) NOT NULL DEFAULT '1',
	`share_permission` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`download_permission` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `idx_role_project` ( `project_id`, `role_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_slide
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_slide`;
CREATE TABLE `rel_role_slide` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`slide_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `slide_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_user
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_user`;
CREATE TABLE `rel_role_user` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`role_id` BIGINT ( 20 ) NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `idx_role_user` ( `user_id`, `role_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_view
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_view`;
CREATE TABLE `rel_role_view` (
	`view_id` BIGINT ( 20 ) NOT NULL,
	`role_id` BIGINT ( 20 ) NOT NULL,
	`row_auth` text,
	`column_auth` text,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `view_id`, `role_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for rel_user_organization
-- ----------------------------
DROP TABLE IF EXISTS `rel_user_organization`;
CREATE TABLE `rel_user_organization` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`org_id` BIGINT ( 20 ) NOT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`role` SMALLINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	UNIQUE KEY `idx_org_user` ( `org_id`, `user_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`org_id` BIGINT ( 20 ) NOT NULL,
	`name` VARCHAR ( 100 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	`avatar` VARCHAR ( 255 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_orgid` ( `org_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COMMENT = '权限表';

-- ----------------------------
-- Table structure for source
-- ----------------------------
DROP TABLE IF EXISTS `source`;
CREATE TABLE `source` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`config` text NOT NULL,
	`type` VARCHAR ( 10 ) NOT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	`parent_id` BIGINT ( 20 ) DEFAULT NULL,
	`full_parent_id` VARCHAR ( 255 ) DEFAULT NULL,
	`is_folder` TINYINT ( 1 ) DEFAULT NULL,
	`index` INT ( 5 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_project_id` ( `project_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for star
-- ----------------------------
DROP TABLE IF EXISTS `star`;
CREATE TABLE `star` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`target` VARCHAR ( 20 ) NOT NULL,
	`target_id` BIGINT ( 20 ) NOT NULL,
	`user_id` BIGINT ( 20 ) NOT NULL,
	`star_time` DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_target_id` ( `target_id` ) USING BTREE,
	KEY `idx_user_id` ( `user_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`email` VARCHAR ( 255 ) NOT NULL,
	`username` VARCHAR ( 255 ) NOT NULL,
	`password` VARCHAR ( 255 ) NOT NULL,
	`admin` TINYINT ( 1 ) NOT NULL,
	`active` TINYINT ( 1 ) DEFAULT NULL,
	`name` VARCHAR ( 255 ) DEFAULT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`department` VARCHAR ( 255 ) DEFAULT NULL,
	`avatar` VARCHAR ( 255 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`create_by` BIGINT ( 20 ) NOT NULL DEFAULT '0',
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for view
-- ----------------------------
DROP TABLE IF EXISTS `view`;
CREATE TABLE `view` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`source_id` BIGINT ( 20 ) NOT NULL,
	`sql` TEXT,
	`model` TEXT,
	`variable` TEXT,
	`config` TEXT,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	`parent_id` BIGINT ( 20 ) DEFAULT NULL,
	`full_parent_id` VARCHAR ( 255 ) DEFAULT NULL,
	`is_folder` TINYINT ( 1 ) DEFAULT NULL,
	`index` INT ( 5 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_project_id` ( `project_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for widget
-- ----------------------------
DROP TABLE IF EXISTS `widget`;
CREATE TABLE `widget` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 255 ) NOT NULL,
	`description` VARCHAR ( 255 ) DEFAULT NULL,
	`view_id` BIGINT ( 20 ) NOT NULL,
	`project_id` BIGINT ( 20 ) NOT NULL,
	`type` BIGINT ( 20 ) NOT NULL,
	`publish` TINYINT ( 1 ) NOT NULL,
	`config` LONGTEXT NOT NULL,
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	`parent_id` BIGINT ( 20 ) DEFAULT NULL,
	`full_parent_id` VARCHAR ( 255 ) DEFAULT NULL,
	`is_folder` TINYINT ( 1 ) DEFAULT NULL,
	`index` INT ( 5 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE,
	KEY `idx_project_id` ( `project_id` ) USING BTREE,
	KEY `idx_view_id` ( `view_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for rel_role_display_slide_widget
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_display_slide_widget`;
CREATE TABLE `rel_role_display_slide_widget` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`mem_display_slide_widget_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `mem_display_slide_widget_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_dashboard_widget
-- ----------------------------
DROP TABLE IF EXISTS `rel_role_dashboard_widget`;
CREATE TABLE `rel_role_dashboard_widget` (
	`role_id` BIGINT ( 20 ) NOT NULL,
	`mem_dashboard_widget_id` BIGINT ( 20 ) NOT NULL,
	`visible` TINYINT ( 1 ) NOT NULL DEFAULT '0',
	`create_by` BIGINT ( 20 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`update_by` BIGINT ( 20 ) DEFAULT NULL,
	`update_time` TIMESTAMP NULL,
	PRIMARY KEY ( `role_id`, `mem_dashboard_widget_id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for davinci_statistic_visitor_operation
-- ----------------------------
DROP TABLE IF EXISTS `davinci_statistic_visitor_operation`;
CREATE TABLE `davinci_statistic_visitor_operation` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT ( 20 ) DEFAULT NULL,
	`email` VARCHAR ( 255 ) DEFAULT NULL,
	`action` VARCHAR ( 255 ) DEFAULT NULL COMMENT 'login/visit/initial/sync/search/linkage/drill/download/print',
	`org_id` BIGINT ( 20 ) DEFAULT NULL,
	`project_id` BIGINT ( 20 ) DEFAULT NULL,
	`project_name` VARCHAR ( 255 ) DEFAULT NULL,
	`viz_type` VARCHAR ( 255 ) DEFAULT NULL COMMENT 'dashboard/display',
	`viz_id` BIGINT ( 20 ) DEFAULT NULL,
	`viz_name` VARCHAR ( 255 ) DEFAULT NULL,
	`sub_viz_id` BIGINT ( 20 ) DEFAULT NULL,
	`sub_viz_name` VARCHAR ( 255 ) DEFAULT NULL,
	`widget_id` BIGINT ( 20 ) DEFAULT NULL,
	`widget_name` VARCHAR ( 255 ) DEFAULT NULL,
	`variables` VARCHAR ( 500 ) DEFAULT NULL,
	`filters` text COLLATE utf8_unicode_ci DEFAULT NULL,
	`groups` VARCHAR ( 500 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for davinci_statistic_terminal
-- ----------------------------
DROP TABLE IF EXISTS `davinci_statistic_terminal`;
CREATE TABLE `davinci_statistic_terminal` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT ( 20 ) DEFAULT NULL,
	`email` VARCHAR ( 255 ) DEFAULT NULL,
	`browser_name` VARCHAR ( 255 ) DEFAULT NULL,
	`browser_version` VARCHAR ( 255 ) DEFAULT NULL,
	`engine_name` VARCHAR ( 255 ) DEFAULT NULL,
	`engine_version` VARCHAR ( 255 ) DEFAULT NULL,
	`os_name` VARCHAR ( 255 ) DEFAULT NULL,
	`os_version` VARCHAR ( 255 ) DEFAULT NULL,
	`device_model` VARCHAR ( 255 ) DEFAULT NULL,
	`device_type` VARCHAR ( 255 ) DEFAULT NULL,
	`device_vendor` VARCHAR ( 255 ) DEFAULT NULL,
	`cpu_architecture` VARCHAR ( 255 ) DEFAULT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for davinci_statistic_duration
-- ----------------------------
DROP TABLE IF EXISTS `davinci_statistic_duration`;
CREATE TABLE `davinci_statistic_duration` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT ( 20 ) DEFAULT NULL,
	`email` VARCHAR ( 255 ) DEFAULT NULL,
	`org_id` BIGINT ( 20 ) DEFAULT NULL COMMENT '报表关联组织ID',
	`project_id` BIGINT ( 20 ) DEFAULT NULL COMMENT '报表关联项目ID',
	`project_name` VARCHAR ( 255 ) DEFAULT NULL COMMENT '报表关联项目名称',
	`viz_type` VARCHAR ( 10 ) DEFAULT NULL COMMENT '报表关联应用类型（dashboard/display）',
	`viz_id` BIGINT ( 20 ) DEFAULT NULL COMMENT '报表关联应用ID',
	`viz_name` VARCHAR ( 255 ) DEFAULT NULL COMMENT '报表关联应用名称',
	`sub_viz_id` BIGINT ( 20 ) DEFAULT NULL COMMENT '报表ID',
	`sub_viz_name` VARCHAR ( 255 ) DEFAULT NULL COMMENT '报表名称',
	`start_time` TIMESTAMP NULL,
	`end_time` TIMESTAMP NULL,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for share_download_record
-- ----------------------------
DROP TABLE IF EXISTS `share_download_record`;
CREATE TABLE `share_download_record` (
	`id` BIGINT ( 20 ) NOT NULL AUTO_INCREMENT,
	`uuid` VARCHAR ( 50 ) DEFAULT NULL,
	`name` VARCHAR ( 255 ) NOT NULL,
	`path` VARCHAR ( 255 ) DEFAULT NULL,
	`status` SMALLINT ( 1 ) NOT NULL,
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_download_time` DATETIME DEFAULT NULL,
	PRIMARY KEY ( `id` ) USING BTREE 
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;