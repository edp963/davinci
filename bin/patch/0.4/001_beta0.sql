ALTER TABLE `dashboard`
CHANGE `full_parent_Id` `full_parent_id` varchar(255) DEFAULT NULL AFTER `config`;
ALTER TABLE `davinci_statistic_visitor_operation`
MODIFY COLUMN `filters`  text COLLATE utf8_unicode_ci NULL DEFAULT NULL AFTER `variables`;
ALTER TABLE `davinci_statistic_visitor_operation`
MODIFY COLUMN `groups`  text COLLATE utf8_unicode_ci NULL DEFAULT NULL AFTER `filters`;
ALTER TABLE `cron_job`
CHANGE `update_time` `update_time` timestamp DEFAULT NULL AFTER `update_by`;
ALTER TABLE `mem_dashboard_widget`
ADD COLUMN `alias` varchar(30) NULL AFTER `id`;