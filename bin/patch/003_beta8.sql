ALTER TABLE `cron_job`
MODIFY COLUMN `create_time` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `create_by`;


ALTER TABLE `organization`
MODIFY COLUMN `create_time` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `member_permission`;


ALTER TABLE `user`
MODIFY COLUMN `create_time` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `avatar`;