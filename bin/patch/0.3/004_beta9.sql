ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `org_id` BIGINT(20) NULL   COMMENT '报表关联组织ID' AFTER `email`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `project_id` BIGINT(20) NULL   COMMENT '报表关联项目ID' AFTER `org_id`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `project_name` VARCHAR(255) NULL   COMMENT '报表关联项目名称' AFTER `project_id`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `viz_type` VARCHAR(10) NULL   COMMENT '报表关联应用类型（dashboard/display）' AFTER `project_name`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `viz_id` BIGINT(20) NULL   COMMENT '报表关联应用ID' AFTER `viz_type`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `viz_name` VARCHAR(255) NULL   COMMENT '报表关联应用名称' AFTER `viz_id`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `sub_viz_id` BIGINT(20) NULL   COMMENT '报表ID' AFTER `viz_name`;
ALTER TABLE `davinci_statistic_duration`
ADD COLUMN `sub_viz_name` VARCHAR(255) NULL   COMMENT '报表名称' AFTER `sub_viz_id`;
ALTER TABLE `display`
ADD COLUMN `config` text NULL AFTER `publish`;
ALTER TABLE `cron_job`
MODIFY COLUMN `update_by` bigint(20) NULL DEFAULT NULL AFTER `create_time`;