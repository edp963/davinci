DROP TABLE IF EXISTS `davinci_statistic_visitor_operation`;
CREATE TABLE `davinci_statistic_visitor_operation`
(
    `id`           bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`      bigint(20)      DEFAULT NULL,
    `email`        varchar(255)    DEFAULT NULL,
    `action`       varchar(255)    DEFAULT NULL COMMENT 'login/visit/initial/sync/search/linkage/drill/download/print',
    `org_id`       bigint(20)      DEFAULT NULL,
    `project_id`   bigint(20)      DEFAULT NULL,
    `project_name` varchar(255)    DEFAULT NULL,
    `viz_type`     varchar(255)    DEFAULT NULL COMMENT 'dashboard/display',
    `viz_id`       bigint(20)      DEFAULT NULL,
    `viz_name`     varchar(255)    DEFAULT NULL,
    `sub_viz_id`   bigint(20)      DEFAULT NULL,
    `sub_viz_name` varchar(255)    DEFAULT NULL,
    `widget_id`    bigint(20)      DEFAULT NULL,
    `widget_name`  varchar(255)    DEFAULT NULL,
    `variables`    varchar(500)    DEFAULT NULL,
    `filters`      varchar(500)    DEFAULT NULL,
    `groups`       varchar(500)    DEFAULT NULL,
    `create_time`  timestamp  NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS `davinci_statistic_terminal`;
CREATE TABLE `davinci_statistic_terminal`
(
    `id`               bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`          bigint(20)      DEFAULT NULL,
    `email`            varchar(255)    DEFAULT NULL,
    `browser_name`     varchar(255)    DEFAULT NULL,
    `browser_version`  varchar(255)    DEFAULT NULL,
    `engine_name`      varchar(255)    DEFAULT NULL,
    `engine_version`   varchar(255)    DEFAULT NULL,
    `os_name`          varchar(255)    DEFAULT NULL,
    `os_version`       varchar(255)    DEFAULT NULL,
    `device_model`     varchar(255)    DEFAULT NULL,
    `device_type`      varchar(255)    DEFAULT NULL,
    `device_vendor`    varchar(255)    DEFAULT NULL,
    `cpu_architecture` varchar(255)    DEFAULT NULL,
    `create_time`      timestamp  NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `davinci_statistic_duration`;
CREATE TABLE `davinci_statistic_duration`
(
    `id`         bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id`    bigint(20)      DEFAULT NULL,
    `email`      varchar(255)    DEFAULT NULL,
    `start_time` timestamp  NULL DEFAULT NULL,
    `end_time`   timestamp  NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;


DROP TABLE IF EXISTS `share_download_record`;
CREATE TABLE `share_download_record`
(
    `id`                 bigint(20)   NOT NULL AUTO_INCREMENT,
    `uuid`               varchar(50)  DEFAULT NULL,
    `name`               varchar(255) NOT NULL,
    `path`               varchar(255) DEFAULT NULL,
    `status`             smallint(1)  NOT NULL,
    `create_time`        datetime     NOT NULL,
    `last_download_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

