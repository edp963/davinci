ALTER TABLE `dashboard`
CHANGE `full_parent_Id` `full_parent_id` varchar(255) DEFAULT NULL AFTER `config`;
ALTER TABLE `davinci_statistic_visitor_operation`
MODIFY COLUMN `filters`  text COLLATE utf8_unicode_ci NULL DEFAULT NULL AFTER `variables`;