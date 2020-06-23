SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cron_job
-- ----------------------------
DROP TABLE IF EXISTS `cron_job`;
CREATE TABLE `cron_job`
(
    `id`              bigint(20)                          NOT NULL AUTO_INCREMENT,
    `name`            varchar(45) COLLATE utf8_unicode_ci NOT NULL,
    `project_id`      bigint(20)                          NOT NULL,
    `job_type`        varchar(45) COLLATE utf8_unicode_ci NOT NULL,
    `job_status`      varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `cron_expression` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
    `start_date`      datetime                            NOT NULL,
    `end_date`        datetime                            NOT NULL,
    `config`          text COLLATE utf8_unicode_ci        NOT NULL,
    `description`     varchar(255) COLLATE utf8_unicode_ci         DEFAULT NULL,
    `exec_log`        text COLLATE utf8_unicode_ci,
    `create_by`       bigint(20)                          NOT NULL,
    `create_time`     timestamp                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_by`       bigint(20)                                   DEFAULT NULL,
    `update_time`     timestamp                           NULL     DEFAULT NULL,
    `parent_id`       bigint(20)                                   DEFAULT NULL,
    `full_parent_id`  varchar(255) COLLATE utf8_unicode_ci         DEFAULT NULL,
    `is_folder`       tinyint(1)                                   DEFAULT NULL,
    `index`           int(5)                                       DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `name_UNIQUE` (`name`) USING BTREE
) ENGINE = MyISAM
  DEFAULT CHARSET = utf8
  COLLATE = utf8_unicode_ci;

-- ----------------------------
-- Table structure for dashboard
-- ----------------------------
DROP TABLE IF EXISTS `dashboard`;
CREATE TABLE `dashboard`
(
    `id`                  bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`                varchar(255) NOT NULL,
    `dashboard_portal_id` bigint(20)   NOT NULL,
    `type`                smallint(1)  NOT NULL,
    `index`               int(4)       NOT NULL,
    `parent_id`           bigint(20)   NOT NULL DEFAULT '0',
    `config`              text,
    `full_parent_Id`      varchar(100)          DEFAULT NULL,
    `create_by`           bigint(20)            DEFAULT NULL,
    `create_time`         datetime              DEFAULT NULL,
    `update_by`           bigint(20)            DEFAULT NULL,
    `update_time`         datetime              DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_dashboard_id` (`dashboard_portal_id`) USING BTREE,
    KEY `idx_parent_id` (`parent_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for dashboard_portal
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_portal`;
CREATE TABLE `dashboard_portal`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NOT NULL,
    `description` varchar(255)          DEFAULT NULL,
    `project_id`  bigint(20)   NOT NULL,
    `avatar`      varchar(255)          DEFAULT NULL,
    `publish`     tinyint(1)   NOT NULL DEFAULT '0',
    `create_by`   bigint(20)            DEFAULT NULL,
    `create_time` datetime              DEFAULT NULL,
    `update_by`   bigint(20)            DEFAULT NULL,
    `update_time` datetime              DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for display
-- ----------------------------
DROP TABLE IF EXISTS `display`;
CREATE TABLE `display`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `project_id`  bigint(20)   NOT NULL,
    `avatar`      varchar(255) DEFAULT NULL,
    `publish`     tinyint(1)   NOT NULL,
    `config`      text         NULL,
    `create_by`   bigint(20)   DEFAULT NULL,
    `create_time` datetime     DEFAULT NULL,
    `update_by`   bigint(20)   DEFAULT NULL,
    `update_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for display_slide
-- ----------------------------
DROP TABLE IF EXISTS `display_slide`;
CREATE TABLE `display_slide`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT,
    `display_id`  bigint(20) NOT NULL,
    `index`       int(12)    NOT NULL,
    `config`      text       NOT NULL,
    `create_by`   bigint(20) DEFAULT NULL,
    `create_time` datetime   DEFAULT NULL,
    `update_by`   bigint(20) DEFAULT NULL,
    `update_time` datetime   DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_display_id` (`display_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for download_record
-- ----------------------------
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

-- ----------------------------
-- Table structure for favorite
-- ----------------------------
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite`
(
    `id`          bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`     bigint(20) NOT NULL,
    `project_id`  bigint(20) NOT NULL,
    `create_time` datetime   NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `idx_user_project` (`user_id`, `project_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for mem_dashboard_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_dashboard_widget`;
CREATE TABLE `mem_dashboard_widget`
(
    `id`           bigint(20) NOT NULL AUTO_INCREMENT,
    `alias`        varchar(30) NULL,
    `dashboard_id` bigint(20) NOT NULL,
    `widget_Id`    bigint(20)          DEFAULT NULL,
    `x`            int(12)    NOT NULL,
    `y`            int(12)    NOT NULL,
    `width`        int(12)    NOT NULL,
    `height`       int(12)    NOT NULL,
    `polling`      tinyint(1) NOT NULL DEFAULT '0',
    `frequency`    int(12)             DEFAULT NULL,
    `config`       text,
    `create_by`    bigint(20)          DEFAULT NULL,
    `create_time`  datetime            DEFAULT NULL,
    `update_by`    bigint(20)          DEFAULT NULL,
    `update_time`  datetime            DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_protal_id` (`dashboard_id`) USING BTREE,
    KEY `idx_widget_id` (`widget_Id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for mem_display_slide_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_display_slide_widget`;
CREATE TABLE `mem_display_slide_widget`
(
    `id`               bigint(20)   NOT NULL AUTO_INCREMENT,
    `display_slide_id` bigint(20)   NOT NULL,
    `widget_id`        bigint(20)            DEFAULT NULL,
    `name`             varchar(255) NOT NULL,
    `params`           text         NOT NULL,
    `type`             smallint(1)  NOT NULL,
    `sub_type`         smallint(2)           DEFAULT NULL,
    `index`            int(12)      NOT NULL DEFAULT '0',
    `create_by`        bigint(20)            DEFAULT NULL,
    `create_time`      datetime              DEFAULT NULL,
    `update_by`        bigint(20)            DEFAULT NULL,
    `update_time`      datetime              DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_slide_id` (`display_slide_id`) USING BTREE,
    KEY `idx_widget_id` (`widget_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for organization
-- ----------------------------
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization`
(
    `id`                   bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`                 varchar(255) NOT NULL,
    `description`          varchar(255)          DEFAULT NULL,
    `avatar`               varchar(255)          DEFAULT NULL,
    `user_id`              bigint(20)   NOT NULL,
    `project_num`          int(20)               DEFAULT '0',
    `member_num`           int(20)               DEFAULT '0',
    `role_num`             int(20)               DEFAULT '0',
    `allow_create_project` tinyint(1)            DEFAULT '1',
    `member_permission`    smallint(1)  NOT NULL DEFAULT '0',
    `create_time`          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_by`            bigint(20)   NOT NULL DEFAULT '0',
    `update_time`          timestamp    NULL,
    `update_by`            bigint(20)            DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for platform
-- ----------------------------
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
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`
(
    `id`             bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `description`    varchar(255)          DEFAULT NULL,
    `pic`            varchar(255)          DEFAULT NULL,
    `org_id`         bigint(20)   NOT NULL,
    `user_id`        bigint(20)   NOT NULL,
    `visibility`     tinyint(1)            DEFAULT '1',
    `star_num`       int(11)               DEFAULT '0',
    `is_transfer`    tinyint(1)   NOT NULL DEFAULT '0',
    `initial_org_id` bigint(20)   NOT NULL,
    `create_by`      bigint(20)            DEFAULT NULL,
    `create_time`    datetime              DEFAULT NULL,
    `update_by`      bigint(20)            DEFAULT NULL,
    `update_time`    datetime              DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for rel_project_admin
-- ----------------------------
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
  DEFAULT CHARSET = utf8mb4 COMMENT ='project admin表';

-- ----------------------------
-- Table structure for rel_role_dashboard
-- ----------------------------
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

-- ----------------------------
-- Table structure for rel_role_display
-- ----------------------------
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

-- ----------------------------
-- Table structure for rel_role_portal
-- ----------------------------
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

-- ----------------------------
-- Table structure for rel_role_project
-- ----------------------------
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
  DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_slide
-- ----------------------------
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

-- ----------------------------
-- Table structure for rel_role_user
-- ----------------------------
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
  DEFAULT CHARSET = utf8mb4;

-- ----------------------------
-- Table structure for rel_role_view
-- ----------------------------
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
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for rel_user_organization
-- ----------------------------
DROP TABLE IF EXISTS `rel_user_organization`;
CREATE TABLE `rel_user_organization`
(
    `id`      bigint(20)  NOT NULL AUTO_INCREMENT,
    `org_id`  bigint(20)  NOT NULL,
    `user_id` bigint(20)  NOT NULL,
    `role`    smallint(1) NOT NULL DEFAULT '0',
    `create_by`   bigint(20)   DEFAULT NULL,
    `create_time` datetime     DEFAULT NULL,
    `update_by`   bigint(20)   DEFAULT NULL,
    `update_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `idx_org_user` (`org_id`, `user_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `org_id`      bigint(20)   NOT NULL,
    `name`        varchar(100) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `create_by`   bigint(20)   DEFAULT NULL,
    `create_time` datetime     DEFAULT NULL,
    `update_by`   bigint(20)   DEFAULT NULL,
    `update_time` datetime     DEFAULT NULL,
    `avatar`      varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_orgid` (`org_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='权限表';

-- ----------------------------
-- Table structure for source
-- ----------------------------
DROP TABLE IF EXISTS `source`;
CREATE TABLE `source`
(
    `id`             bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `description`    varchar(255) DEFAULT NULL,
    `config`         text         NOT NULL,
    `type`           varchar(10)  NOT NULL,
    `project_id`     bigint(20)   NOT NULL,
    `create_by`      bigint(20)   DEFAULT NULL,
    `create_time`    datetime     DEFAULT NULL,
    `update_by`      bigint(20)   DEFAULT NULL,
    `update_time`    datetime     DEFAULT NULL,
    `parent_id`      bigint(20)   DEFAULT NULL,
    `full_parent_id` varchar(255) DEFAULT NULL,
    `is_folder`      tinyint(1)   DEFAULT NULL,
    `index`          int(5)       DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for star
-- ----------------------------
DROP TABLE IF EXISTS `star`;
CREATE TABLE `star`
(
    `id`        bigint(20)  NOT NULL AUTO_INCREMENT,
    `target`    varchar(20) NOT NULL,
    `target_id` bigint(20)  NOT NULL,
    `user_id`   bigint(20)  NOT NULL,
    `star_time` datetime    NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_target_id` (`target_id`) USING BTREE,
    KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `email`       varchar(255) NOT NULL,
    `username`    varchar(255) NOT NULL,
    `password`    varchar(255) NOT NULL,
    `admin`       tinyint(1)   NOT NULL,
    `active`      tinyint(1)            DEFAULT NULL,
    `name`        varchar(255)          DEFAULT NULL,
    `description` varchar(255)          DEFAULT NULL,
    `department`  varchar(255)          DEFAULT NULL,
    `avatar`      varchar(255)          DEFAULT NULL,
    `create_time` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_by`   bigint(20)   NOT NULL DEFAULT '0',
    `update_time` timestamp    NULL,
    `update_by`   bigint(20)            DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for view
-- ----------------------------
DROP TABLE IF EXISTS `view`;
CREATE TABLE `view`
(
    `id`             bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `description`    varchar(255) DEFAULT NULL,
    `project_id`     bigint(20)   NOT NULL,
    `source_id`      bigint(20)   NOT NULL,
    `sql`            text,
    `model`          text,
    `variable`       text,
    `config`         text,
    `create_by`      bigint(20)   DEFAULT NULL,
    `create_time`    datetime     DEFAULT NULL,
    `update_by`      bigint(20)   DEFAULT NULL,
    `update_time`    datetime     DEFAULT NULL,
    `parent_id`      bigint(20)   DEFAULT NULL,
    `full_parent_id` varchar(255) DEFAULT NULL,
    `is_folder`      tinyint(1)   DEFAULT NULL,
    `index`          int(5)       DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for widget
-- ----------------------------
DROP TABLE IF EXISTS `widget`;
CREATE TABLE `widget`
(
    `id`             bigint(20)   NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `description`    varchar(255) DEFAULT NULL,
    `view_id`        bigint(20)   NOT NULL,
    `project_id`     bigint(20)   NOT NULL,
    `type`           bigint(20)   NOT NULL,
    `publish`        tinyint(1)   NOT NULL,
    `config`         longtext     NOT NULL,
    `create_by`      bigint(20)   DEFAULT NULL,
    `create_time`    datetime     DEFAULT NULL,
    `update_by`      bigint(20)   DEFAULT NULL,
    `update_time`    datetime     DEFAULT NULL,
    `parent_id`      bigint(20)   DEFAULT NULL,
    `full_parent_id` varchar(255) DEFAULT NULL,
    `is_folder`      tinyint(1)   DEFAULT NULL,
    `index`          int(5)       DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_project_id` (`project_id`) USING BTREE,
    KEY `idx_view_id` (`view_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;


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

DROP TABLE IF EXISTS `davinci_statistic_visitor_operation`;
CREATE TABLE `davinci_statistic_visitor_operation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL COMMENT 'login/visit/initial/sync/search/linkage/drill/download/print',
  `org_id` bigint(20) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `viz_type` varchar(255) DEFAULT NULL COMMENT 'dashboard/display',
  `viz_id` bigint(20) DEFAULT NULL,
  `viz_name` varchar(255) DEFAULT NULL,
  `sub_viz_id` bigint(20) DEFAULT NULL,
  `sub_viz_name` varchar(255) DEFAULT NULL,
  `widget_id` bigint(20) DEFAULT NULL,
  `widget_name` varchar(255) DEFAULT NULL,
  `variables` varchar(500) DEFAULT NULL,
  `filters` varchar(500) DEFAULT NULL,
  `groups` varchar(500) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `davinci_statistic_terminal`;
CREATE TABLE `davinci_statistic_terminal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `browser_name` varchar(255) DEFAULT NULL,
  `browser_version` varchar(255) DEFAULT NULL,
  `engine_name` varchar(255) DEFAULT NULL,
  `engine_version` varchar(255) DEFAULT NULL,
  `os_name` varchar(255) DEFAULT NULL,
  `os_version` varchar(255) DEFAULT NULL,
  `device_model` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `device_vendor` varchar(255) DEFAULT NULL,
  `cpu_architecture` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `davinci_statistic_duration`;
CREATE TABLE `davinci_statistic_duration`
(
    `id`         bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`    bigint(20)      DEFAULT NULL,
    `email`      varchar(255)    DEFAULT NULL,
    `org_id` bigint(20) DEFAULT NULL COMMENT '报表关联组织ID',
    `project_id` bigint(20) DEFAULT NULL COMMENT '报表关联项目ID',
    `project_name` varchar(255) DEFAULT NULL COMMENT '报表关联项目名称',
    `viz_type` varchar(10) DEFAULT NULL COMMENT '报表关联应用类型（dashboard/display）',
    `viz_id` bigint(20) DEFAULT NULL COMMENT '报表关联应用ID',
    `viz_name` varchar(255) DEFAULT NULL COMMENT '报表关联应用名称',
    `sub_viz_id` bigint(20) DEFAULT NULL COMMENT '报表ID',
    `sub_viz_name` varchar(255) DEFAULT NULL COMMENT '报表名称',
    `start_time` timestamp  NULL DEFAULT NULL,
    `end_time`   timestamp  NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

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


SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO `user` (`id`, `email`, `username`, `password`, `admin`, `active`, `name`, `description`, `department`, `avatar`, `create_time`, `create_by`, `update_by`, `update_time`)
VALUES (1, 'guest@davinci.cn', 'guest', '$2a$10$RJKb4jhMgRYnGPlVRV036erxQ3oGZ8NnxZrlrrBJJha9376cAuTRO', 1, 1, NULL, NULL, NULL, NULL, '2020-01-01 00:00:00', 0, NULL, NULL);

INSERT INTO `organization` (`id`, `name`, `description`, `avatar`, `user_id`, `project_num`, `member_num`, `role_num`, `allow_create_project`, `member_permission`, `create_time`, `create_by`, `update_time`, `update_by`)
VALUES (1, 'guest\'s Organization', NULL, NULL, 1, 0, 1, 0, 1, 1, '2020-01-01 00:00:00', 1, NULL, NULL);

INSERT INTO `rel_user_organization` (`id`, `org_id`, `user_id`, `role`, `create_by`, `create_time`, `update_by`, `update_time`)
VALUES (1, 1, 1, 1, 1, '2020-01-01 00:00:00', NULL, NULL);