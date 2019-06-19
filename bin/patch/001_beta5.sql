set @data_base = 'davinci0.3';

DROP TABLE IF EXISTS `platform`;
CREATE TABLE `platform`
(
    `id`               bigint(20)   NOT NULL,
    `name`             varchar(255) NOT NULL,
    `platform`         varchar(255) NOT NULL,
    `code`             varchar(32)  NOT NULL,
    `checkCode`        varchar(255) DEFAULT NULL,
    `checkSystemToken` varchar(255) DEFAULT NULL,
    `checkUrl`         varchar(255) DEFAULT NULL,
    `alternateField1`  varchar(255) DEFAULT NULL,
    `alternateField2`  varchar(255) DEFAULT NULL,
    `alternateField3`  varchar(255) DEFAULT NULL,
    `alternateField4`  varchar(255) DEFAULT NULL,
    `alternateField5`  varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS `download_record`;
CREATE TABLE `download_record`
(
    `id`                 bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`               varchar(255) NOT NULL,
    `user_id`            bigint(20)   NOT NULL,
    `path`               varchar(255) DEFAULT NULL,
    `status`             smallint(1)  NOT NULL,
    `create_time`        datetime     NOT NULL,
    `last_download_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_user` (`user_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_project_admin`;
CREATE TABLE `rel_project_admin`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT,
    `project_id`  bigint(20) NOT NULL,
    `user_id`     bigint(20) NOT NULL,
    `create_by`   bigint(20) DEFAULT NULL,
    `create_time` datetime   DEFAULT NULL,
    `update_by`   bigint(20) DEFAULT NULL,
    `update_time` datetime   DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `idx_project_user` (`project_id`, `user_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 6
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_dashboard`;
CREATE TABLE `rel_role_dashboard`
(
    `role_id`      bigint(20) NOT NULL,
    `dashboard_id` bigint(20) NOT NULL,
    `visible`      tinyint(1) NOT NULL DEFAULT '0',
    `create_by`    bigint(20)          DEFAULT NULL,
    `create_time`  datetime            DEFAULT NULL,
    `update_by`    bigint(20)          DEFAULT NULL,
    `update_time`  datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `dashboard_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_display`;
CREATE TABLE `rel_role_display`
(
    `role_id`     bigint(20) NOT NULL,
    `display_id`  bigint(20) NOT NULL,
    `visible`     tinyint(1) NOT NULL DEFAULT '0',
    `create_by`   bigint(20)          DEFAULT NULL,
    `create_time` datetime            DEFAULT NULL,
    `update_by`   bigint(20)          DEFAULT NULL,
    `update_time` datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `display_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_portal`;
CREATE TABLE `rel_role_portal`
(
    `role_id`     bigint(20) NOT NULL,
    `portal_id`   bigint(20) NOT NULL,
    `visible`     tinyint(1) NOT NULL DEFAULT '0',
    `create_by`   bigint(20)          DEFAULT NULL,
    `create_time` datetime            DEFAULT NULL,
    `update_by`   bigint(20)          DEFAULT NULL,
    `update_time` datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `portal_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_project`;
CREATE TABLE `rel_role_project`
(
    `id`                  bigint(20)  NOT NULL AUTO_INCREMENT,
    `project_id`          bigint(20)  NOT NULL,
    `role_id`             bigint(20)  NOT NULL,
    `source_permission`   smallint(1) NOT NULL DEFAULT '1',
    `view_permission`     smallint(1) NOT NULL DEFAULT '1',
    `widget_permission`   smallint(1) NOT NULL DEFAULT '1',
    `viz_permission`      smallint(1) NOT NULL DEFAULT '1',
    `schedule_permission` smallint(1) NOT NULL DEFAULT '1',
    `share_permission`    tinyint(1)  NOT NULL DEFAULT '0',
    `download_permission` tinyint(1)  NOT NULL DEFAULT '0',
    `create_by`           bigint(20)           DEFAULT NULL,
    `create_time`         datetime             DEFAULT NULL,
    `update_by`           bigint(20)           DEFAULT NULL,
    `update_time`         datetime             DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `idx_role_project` (`project_id`, `role_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 40
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_slide`;
CREATE TABLE `rel_role_slide`
(
    `role_id`     bigint(20) NOT NULL,
    `slide_id`    bigint(20) NOT NULL,
    `visible`     tinyint(1) NOT NULL DEFAULT '0',
    `create_by`   bigint(20)          DEFAULT NULL,
    `create_time` datetime            DEFAULT NULL,
    `update_by`   bigint(20)          DEFAULT NULL,
    `update_time` datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `slide_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_user`;
CREATE TABLE `rel_role_user`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`     bigint(20) NOT NULL,
    `role_id`     bigint(20) NOT NULL,
    `create_by`   bigint(20) DEFAULT NULL,
    `create_time` datetime   DEFAULT NULL,
    `update_by`   bigint(20) DEFAULT NULL,
    `update_time` datetime   DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `idx_role_user` (`user_id`, `role_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 30
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_view`;
CREATE TABLE `rel_role_view`
(
    `view_id`     bigint(20) NOT NULL,
    `role_id`     bigint(20) NOT NULL,
    `row_auth`    text,
    `column_auth` text,
    `create_by`   bigint(20) DEFAULT NULL,
    `create_time` datetime   DEFAULT NULL,
    `update_by`   bigint(20) DEFAULT NULL,
    `update_time` datetime   DEFAULT NULL,
    PRIMARY KEY (`view_id`, `role_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `org_id`      bigint(20)   NOT NULL,
    `name`        varchar(100) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `avatar`      varchar(255) DEFAULT NULL,
    `create_by`   bigint(20)   DEFAULT NULL,
    `create_time` datetime     DEFAULT NULL,
    `update_by`   bigint(20)   DEFAULT NULL,
    `update_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_orgid` (`org_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 24
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_display_slide_widget`;
CREATE TABLE `rel_role_display_slide_widget`
(
    `role_id`                     bigint(20) NOT NULL,
    `mem_display_slide_widget_id` bigint(20) NOT NULL,
    `visible`                     tinyint(1) NOT NULL DEFAULT '0',
    `create_by`                   bigint(20)          DEFAULT NULL,
    `create_time`                 datetime            DEFAULT NULL,
    `update_by`                   bigint(20)          DEFAULT NULL,
    `update_time`                 datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `mem_display_slide_widget_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `rel_role_dashboard_widget`;
CREATE TABLE `rel_role_dashboard_widget`
(
    `role_id`                 bigint(20) NOT NULL,
    `mem_dashboard_widget_id` bigint(20) NOT NULL,
    `visible`                 tinyint(1) NOT NULL DEFAULT '0',
    `create_by`               bigint(20)          DEFAULT NULL,
    `create_time`             datetime            DEFAULT NULL,
    `update_by`               bigint(20)          DEFAULT NULL,
    `update_time`             datetime            DEFAULT NULL,
    PRIMARY KEY (`role_id`, `mem_dashboard_widget_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


ALTER TABLE `organization`
    ADD INDEX `idx_user_id` (`user_id`),
    ADD INDEX `idx_allow_create_project` (`allow_create_project`),
    ADD INDEX `idx_member_permisson` (`member_permission`);

ALTER TABLE `project`
    ADD INDEX `idx_org_id` (`org_id`),
    ADD INDEX `idx_user_id` (`user_id`),
    ADD INDEX `idx_visibility` (`visibility`);

ALTER TABLE `rel_user_organization`
    ADD INDEX `idx_role` (`role`);



SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'cron_job'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `cron_job` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'cron_job'
                                AND column_name = 'parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `cron_job` ADD `parent_id` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'cron_job'
                                AND column_name = 'full_parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `cron_job`  ADD `full_parent_id`  varchar(100)  DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'cron_job'
                                AND column_name = 'is_folder') > 0,
                             "SELECT 1",
                             "ALTER TABLE `cron_job`  ADD `is_folder`  tinyint(1) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'cron_job'
                                AND column_name = 'index') > 0,
                             "SELECT 1",
                             "ALTER TABLE `cron_job` ADD `index` int(5) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard'
                                AND column_name = 'full_parent_Id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard` ADD `full_parent_Id`  varchar(100) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard` ADD `create_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard` ADD `update_time`     datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard_portal'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard_portal` ADD `create_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard_portal'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard_portal` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard_portal'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard_portal`  ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'dashboard_portal'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `dashboard_portal` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display` ADD `create_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display` ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display_slide'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display_slide` ADD `create_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display_slide'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display_slide` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display_slide'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display_slide` ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'display_slide'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `display_slide` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_dashboard_widget'
                                AND column_name = 'config') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_dashboard_widget` ADD `config` text;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_dashboard_widget'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_dashboard_widget` ADD `create_by`  bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_dashboard_widget'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_dashboard_widget` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_dashboard_widget'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_dashboard_widget` ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_dashboard_widget'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_dashboard_widget` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_display_slide_widget'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_display_slide_widget` ADD `create_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_display_slide_widget'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_display_slide_widget` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_display_slide_widget'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_display_slide_widget` ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'mem_display_slide_widget'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `mem_display_slide_widget` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'project'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `project` ADD `create_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'project'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `project` ADD `create_time` datetime NULL DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'project'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `project` ADD `update_by`   bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'project'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `project` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `create_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `parent_id` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'full_parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `full_parent_id` varchar(255) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'is_folder') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `is_folder` tinyint(1) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'source'
                                AND column_name = 'index') > 0,
                             "SELECT 1",
                             "ALTER TABLE `source` ADD `index` int(5) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'variable') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `variable` text;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `create_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;



SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `parent_id` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'full_parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `full_parent_id` varchar(255) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'is_folder') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `is_folder` tinyint(1) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'view'
                                AND column_name = 'index') > 0,
                             "SELECT 1",
                             "ALTER TABLE `view` ADD `index` int(5) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'rel_user_organization'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `rel_user_organization` ADD `create_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'rel_user_organization'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `rel_user_organization` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'rel_user_organization'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `rel_user_organization` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'rel_user_organization'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `rel_user_organization` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'create_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `create_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'create_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `create_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'update_by') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `update_by` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'update_time') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `update_time` datetime DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `parent_id` bigint(20) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'full_parent_id') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `full_parent_id` varchar(255) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'is_folder') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `is_folder` varchar(255) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;



SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'widget'
                                AND column_name = 'index') > 0,
                             "SELECT 1",
                             "ALTER TABLE `widget` ADD `index` int(5) DEFAULT NULL;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @s = (SELECT IF(
                             (SELECT COUNT(*)
                              FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = @data_base
                                AND table_name = 'organization'
                                AND column_name = 'role_num') > 0,
                             "SELECT 1",
                             "ALTER TABLE `organization` CHANGE COLUMN `team_num` `role_num` int(20) NULL DEFAULT 0 AFTER `member_num`;"
                     ));

PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

update organization
set role_num = 0;

update download_record
set status = 4
where last_download_time is not null
  and status = 2;
