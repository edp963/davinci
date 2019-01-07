SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cron_job
-- ----------------------------
DROP TABLE IF EXISTS `cron_job`;
CREATE TABLE `cron_job` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `job_type` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `job_status` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `cron_expression` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `config` text COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exec_log` text COLLATE utf8_unicode_ci,
  `create_by` bigint(20) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name_UNIQUE` (`name`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for dashboard
-- ----------------------------
DROP TABLE IF EXISTS `dashboard`;
CREATE TABLE `dashboard` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '名称',
  `dashboard_portal_id` bigint(20) NOT NULL COMMENT '所属dashboard portal id',
  `type` smallint(1) NOT NULL COMMENT '类型： 0文件夹 1 dashboard',
  `index` int(4) NOT NULL COMMENT '展示顺序',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '所属文件夹',
  `config` text COMMENT '包含 linkages，filters',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_dashboard_id` (`dashboard_portal_id`) USING BTREE,
  KEY `idx_parent_id` (`parent_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for dashboard_portal
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_portal`;
CREATE TABLE `dashboard_portal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'dashboard 名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `project_id` bigint(20) NOT NULL COMMENT '所属project Id\n',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `publish` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否发布（0：否，1：是）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for display
-- ----------------------------
DROP TABLE IF EXISTS `display`;
CREATE TABLE `display` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `project_id` bigint(20) NOT NULL COMMENT '所属项目id',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `publish` tinyint(1) NOT NULL COMMENT '是否发布',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for display_slide
-- ----------------------------
DROP TABLE IF EXISTS `display_slide`;
CREATE TABLE `display_slide` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `display_id` bigint(20) NOT NULL COMMENT '对应display id',
  `index` int(12) NOT NULL COMMENT '展示位置顺序',
  `config` text NOT NULL COMMENT '配置\n',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_display_id` (`display_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for favorite
-- ----------------------------
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `create_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_user_project` (`user_id`,`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=699 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for mem_dashboard_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_dashboard_widget`;
CREATE TABLE `mem_dashboard_widget` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `dashboard_id` bigint(20) NOT NULL COMMENT '所属dashboard Id',
  `widget_Id` bigint(20) DEFAULT NULL COMMENT '所属widget id',
  `x` int(12) NOT NULL COMMENT 'position_x',
  `y` int(12) NOT NULL COMMENT 'position_y',
  `width` int(12) NOT NULL COMMENT '宽',
  `height` int(12) NOT NULL COMMENT '高',
  `polling` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否开启轮询',
  `frequency` int(12) DEFAULT NULL COMMENT '轮询频率',
  `config` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_protal_id` (`dashboard_id`) USING BTREE,
  KEY `idx_widget_id` (`widget_Id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for mem_display_slide_widget
-- ----------------------------
DROP TABLE IF EXISTS `mem_display_slide_widget`;
CREATE TABLE `mem_display_slide_widget` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `display_slide_id` bigint(20) NOT NULL COMMENT '所属display slide id',
  `widget_id` bigint(20) DEFAULT NULL COMMENT '对应widget id',
  `name` varchar(255) NOT NULL COMMENT '名称',
  `params` text NOT NULL COMMENT '表单配置信息：包含x、y、width、height、polling、frequency等',
  `type` smallint(1) NOT NULL COMMENT '0: widget，1: 辅助图形',
  `sub_type` smallint(2) DEFAULT NULL COMMENT '辅助图形类别',
  `index` int(12) NOT NULL DEFAULT '0' COMMENT '展示位置顺序\n',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_slide_id` (`display_slide_id`) USING BTREE,
  KEY `idx_widget_id` (`widget_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for organization
-- ----------------------------
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `project_num` int(20) DEFAULT '0',
  `member_num` int(20) DEFAULT '0',
  `team_num` int(20) DEFAULT '0',
  `allow_create_project` tinyint(1) DEFAULT '1',
  `member_permission` smallint(1) NOT NULL DEFAULT '0',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` bigint(20) NOT NULL DEFAULT '0',
  `update_time` timestamp NULL DEFAULT NULL,
  `update_by` bigint(20) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `pic` varchar(255) DEFAULT NULL,
  `org_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `visibility` tinyint(1) DEFAULT '1',
  `star_num` int(11) DEFAULT '0',
  `is_transfer` tinyint(1) NOT NULL DEFAULT '0',
  `initial_org_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rel_team_project
-- ----------------------------
DROP TABLE IF EXISTS `rel_team_project`;
CREATE TABLE `rel_team_project` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `source_permission` smallint(1) NOT NULL DEFAULT '1' COMMENT '隐藏/只读/修改/删除\n0/1/2/3',
  `view_permission` smallint(1) NOT NULL DEFAULT '1' COMMENT '隐藏/只读/修改/删除\n0/1/2/3',
  `widget_permission` smallint(1) NOT NULL DEFAULT '1' COMMENT '隐藏/只读/修改/删除\n0/1/2/3',
  `viz_permission` smallint(1) NOT NULL DEFAULT '1' COMMENT '隐藏/只读/修改/删除\n0/1/2/3',
  `schedule_permission` smallint(1) NOT NULL DEFAULT '1' COMMENT '隐藏/只读/修改/删除\n0/1/2/3',
  `share_permission` tinyint(1) NOT NULL DEFAULT '0',
  `download_permission` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_team_project` (`team_id`,`project_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rel_user_organization
-- ----------------------------
DROP TABLE IF EXISTS `rel_user_organization`;
CREATE TABLE `rel_user_organization` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `org_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `role` smallint(1) NOT NULL DEFAULT '0' COMMENT 'member/owner\n0/1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_org_user` (`org_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rel_user_team
-- ----------------------------
DROP TABLE IF EXISTS `rel_user_team`;
CREATE TABLE `rel_user_team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `role` smallint(1) NOT NULL DEFAULT '0' COMMENT 'member/Maintainer\n0/1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_team_user` (`team_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for source
-- ----------------------------
DROP TABLE IF EXISTS `source`;
CREATE TABLE `source` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'source名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `config` text NOT NULL COMMENT '配置',
  `type` varchar(10) NOT NULL COMMENT '类型：jdbc, csv',
  `project_id` bigint(20) NOT NULL COMMENT '所属项目Id',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for star
-- ----------------------------
DROP TABLE IF EXISTS `star`;
CREATE TABLE `star` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `target` varchar(20) NOT NULL,
  `target_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `star_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_target_id` (`target_id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for team
-- ----------------------------
DROP TABLE IF EXISTS `team`;
CREATE TABLE `team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `org_id` bigint(20) NOT NULL,
  `parent_team_id` bigint(20) DEFAULT NULL,
  `full_team_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '-1',
  `avatar` varchar(255) DEFAULT NULL,
  `visibility` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` bigint(20) NOT NULL DEFAULT '0',
  `update_time` timestamp NOT NULL DEFAULT '1970-01-01 08:00:01',
  `update_by` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for view
-- ----------------------------
DROP TABLE IF EXISTS `view`;
CREATE TABLE `view` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'view名称',
  `description` varchar(255) DEFAULT NULL COMMENT 'view描述',
  `project_id` bigint(20) NOT NULL COMMENT '所属project Id',
  `source_id` bigint(20) NOT NULL COMMENT '对应source Id',
  `sql` text COMMENT 'sql',
  `model` text COMMENT 'model',
  `config` text COMMENT '配置',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_project_id` (`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for widget
-- ----------------------------
DROP TABLE IF EXISTS `widget`;
CREATE TABLE `widget` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'weight名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `view_id` bigint(20) NOT NULL COMMENT '所属ViewId',
  `project_id` bigint(20) NOT NULL COMMENT '所属Project Id',
  `type` bigint(20) NOT NULL,
  `publish` tinyint(1) NOT NULL COMMENT '是否发布',
  `config` text NOT NULL COMMENT '包含 params（原 chart_params 加上原 config）、filters（原 query_params）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_project_id` (`project_id`) USING BTREE,
  KEY `idx_view_id` (`view_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for platform
-- ----------------------------
DROP TABLE IF EXISTS `platform`;
CREATE TABLE `platform` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT '平台名称',
  `platform` varchar(255) NOT NULL COMMENT '平台描述',
  `code` varchar(32) NOT NULL COMMENT '平台代码，dv颁发的授权',
  `checkCode` varchar(255) DEFAULT NULL COMMENT '校验代码，对应平台颁发授权码',
  `checkSystemToken` varchar(255) DEFAULT NULL COMMENT '校验token， 对应平台授信token',
  `checkUrl` varchar(255) DEFAULT NULL COMMENT '授信检测url',
  `alternateField1` varchar(255) DEFAULT NULL COMMENT '备用字段1',
  `alternateField2` varchar(255) DEFAULT NULL COMMENT '备用字段2',
  `alternateField3` varchar(255) DEFAULT NULL COMMENT '备用字段3',
  `alternateField4` varchar(255) DEFAULT NULL COMMENT '备用字段4',
  `alternateField5` varchar(255) DEFAULT NULL COMMENT '备用字段5',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for exclude_dashboard_team
-- ----------------------------
DROP TABLE IF EXISTS `exclude_dashboard_team`;
CREATE TABLE `exclude_dashboard_team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `dashboard_id` bigint(20) NOT NULL,
  `update_by` bigint(20) NOT NULL,
  `update_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_team_dashboard` (`team_id`,`dashboard_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  KEY `idx_dashboard` (`dashboard_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for exclude_display_team
-- ----------------------------
DROP TABLE IF EXISTS `exclude_display_team`;
CREATE TABLE `exclude_display_team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `display_id` bigint(20) NOT NULL,
  `update_by` bigint(20) NOT NULL,
  `update_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_team_display` (`team_id`,`display_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  KEY `idx_display` (`display_id`) USING BTREE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for exclude_portal_team
-- ----------------------------
DROP TABLE IF EXISTS `exclude_portal_team`;
CREATE TABLE `exclude_portal_team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `portal_id` bigint(20) NOT NULL,
  `update_by` bigint(20) NOT NULL,
  `update_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_team_portal` (`team_id`,`portal_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  KEY `idx_portal` (`portal_id`) USING BTREE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for exclude_slide_team
-- ----------------------------
DROP TABLE IF EXISTS `exclude_slide_team`;
CREATE TABLE `exclude_slide_team` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `team_id` bigint(20) NOT NULL,
  `slide_id` bigint(20) NOT NULL,
  `update_by` bigint(20) NOT NULL,
  `update_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_team_slide` (`team_id`,`slide_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  KEY `idx_slide` (`slide_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ----------------------------
-- Function structure for childTeamIds
-- ----------------------------
DROP FUNCTION IF EXISTS `childTeamIds`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `childTeamIds`(teamId BIGINT(20)) RETURNS varchar(1000) CHARSET utf8
BEGIN
  DECLARE stmepId VARCHAR(4000);
  DECLARE childIds VARCHAR(1000);

  SET stmepId = '$';
	SET childIds = cast(teamId as char);

  WHILE childIds IS NOT NULL DO
		SET stmepId = CONCAT(stmepId,',',childIds);
		SELECT GROUP_CONCAT(id) INTO childIds FROM team WHERE FIND_IN_SET(parent_team_id, childIds) > 0;
  END WHILE;

  RETURN stmepId;
END;
;;
delimiter ;

-- ----------------------------
-- Function structure for parentTeamIds
-- ----------------------------
DROP FUNCTION IF EXISTS `parentTeamIds`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `parentTeamIds`(teamId BIGINT(20)) RETURNS varchar(4000) CHARSET utf8
BEGIN
  DECLARE parentIds TEXT;
	SELECT
		GROUP_CONCAT(T2.id) into parentIds
	FROM (
    SELECT
        @r AS _id,
        (SELECT @r := parent_team_id FROM team WHERE id = _id) AS parent_team_id,
        @l := @l + 1 AS lvl
      FROM
        (SELECT @l := 0, @r := teamId) vars,
        team
      WHERE
       @r <> 0 and parent_team_id <> 0
  ) T1 JOIN team T2 ON T1._id = T2.id ORDER BY T1.lvl DESC;

  RETURN parentIds;
END;
;;
delimiter ;

-- ----------------------------
-- Function structure for projectTeamStruct
-- ----------------------------
DROP FUNCTION IF EXISTS `projectTeamStruct`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `projectTeamStruct`(projectId BIGINT(20)) RETURNS varchar(4000) CHARSET utf8
BEGIN
	declare teamIds VARCHAR(4000);
	declare tempId BIGINT(20);
	declare done int DEFAULT false;
	declare parentId BIGINT(20);
	declare childId BIGINT(20);

	declare cur CURSOR for
	SELECT r.team_id FROM rel_team_project r, project p where p.id = r.project_id and p.id = projectId;
	declare continue HANDLER for not found set done = true;

	set teamIds = '';
	open cur;
	cur_loop: loop
		FETCH cur INTO tempId;
		SET childId = tempId;

		WHILE childId <> '' and locate(childId, teamIds) <= 0 DO
			SELECT `id`, parent_team_id INTO parentId,childId  FROM team WHERE id = childId;
			SET teamIds = CONCAT(',',parentId,teamIds);
		END WHILE;

		if done then
			LEAVE cur_loop;
		end if;
	end loop;

	RETURN SUBSTR(teamIds,2);
END;
;;
delimiter ;

-- ----------------------------
-- Function structure for userTeamStruct
-- ----------------------------
DROP FUNCTION IF EXISTS `userTeamStruct`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `userTeamStruct`(userId BIGINT(20)) RETURNS varchar(4000) CHARSET utf8
BEGIN
	declare teamIds TEXT;
	declare tempId BIGINT(20);
	declare done int DEFAULT false;
	declare parentId BIGINT(20);
	declare childIds VARCHAR(4000);

	declare cur CURSOR for
	select t.id FROM team t, rel_user_team r WHERE r.user_id = userId and t.id = r.team_id;
	declare continue HANDLER for not found set done = true;

	set teamIds = '';
	open cur;
	cur_loop: loop
		FETCH cur INTO tempId;
		SET childIds = tempId;

		WHILE childIds is not null DO
			SET teamIds = CONCAT(childIds,',',teamIds);
			SELECT GROUP_CONCAT(id) into childIds FROM team WHERE FIND_IN_SET(parent_team_id,childIds) > 0;
		END WHILE;

		if done then
			LEAVE cur_loop;
		end if;
	end loop;

	SELECT GROUP_CONCAT(id) INTO childIds  FROM team WHERE FIND_IN_SET(id,teamIds);
	RETURN childIds;
END;
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;


ALTER TABLE `mem_dashboard_widget` ADD COLUMN `config` text NULL AFTER `frequency`;

ALTER TABLE `team` ADD COLUMN `full_team_id` varchar(255) NOT NULL DEFAULT '-1' AFTER `parent_team_id`;
UPDATE `team` set full_team_id = parentTeamIds(id) WHERE full_team_id = '-1'
