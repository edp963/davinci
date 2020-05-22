/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.service.impl;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.server.dao.CronJobExtendMapper;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.service.RedisMessageHandler;
import edp.davinci.server.util.QuartzHandler;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CronJobMessageHandler implements RedisMessageHandler {

	private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

	@Autowired
	private CronJobExtendMapper cronJobMapper;

	@Autowired
	private QuartzHandler quartzHandler;

	@Override
	public void handle(Object message, String flag) {

		// the flag is deprecated
		log.info("CronJobHandler received stop message:{}", message);

		if (!(message instanceof String)) {
			return;
		}

		CronJob cronJob = JSONUtils.toObject((String) message, CronJob.class);
		quartzHandler.removeJob(cronJob);
		scheduleLogger.info("CronJob({}) is stoped", cronJob.getId());
		cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());
		cronJob.setUpdateTime(new Date());
		cronJobMapper.update(cronJob);
	}
}
