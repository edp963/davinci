/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
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

package edp.core.common.quartz;

import com.alibaba.druid.util.StringUtils;
import edp.core.model.ScheduleJob;
import edp.core.utils.DateUtils;
import edp.core.utils.LockFactory;
import edp.core.utils.QuartzHandler;
import edp.davinci.core.common.Constants;
import edp.davinci.core.config.SpringContextHolder;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.LockType;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.service.excel.ExecutorUtil;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class QuartzJobExecutor implements Job {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    public static final ExecutorService executorService = Executors.newFixedThreadPool(4);

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        ExecutorUtil.printThreadPoolStatusLog(executorService, "Cronjob_Executor", scheduleLogger);
        executorService.submit(() -> {
            TriggerKey triggerKey = jobExecutionContext.getTrigger().getKey();
            ScheduleJob scheduleJob = (ScheduleJob) jobExecutionContext.getMergedJobDataMap().get(QuartzHandler.getJobDataKey(triggerKey));
            if (scheduleJob == null) {
            	scheduleLogger.warn("ScheduleJob({}) is not found", triggerKey.getName());
                return;
            }
            
			Long id = scheduleJob.getId();
            if (scheduleJob.getStartDate().getTime() > System.currentTimeMillis()
                    || scheduleJob.getEndDate().getTime() < System.currentTimeMillis()) {
            	 Object[] args = {
            			 id,
                         DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis()),
                         DateUtils.toyyyyMMddHHmmss(scheduleJob.getStartDate()),
                         DateUtils.toyyyyMMddHHmmss(scheduleJob.getEndDate()),
                         scheduleJob.getCronExpression()
                 };
                 scheduleLogger.warn("ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
                 return;
            }

			String jobType = scheduleJob.getJobType().trim();
			ScheduleService scheduleService = (ScheduleService) SpringContextHolder
					.getBean(jobType + "ScheduleService");
			if (StringUtils.isEmpty(jobType) || scheduleService == null) {
				scheduleLogger.warn("Unknown job type [{}], jobId(:{})", jobType, scheduleJob.getId());
				return;
			}
			
			try {
				String lockKey = CheckEntityEnum.CRONJOB.getSource().toUpperCase() + Constants.AT_SYMBOL + id + Constants.AT_SYMBOL + "EXECUTED";
				if (!LockFactory.getLock(lockKey, 500, LockType.REDIS).getLock()) {
					scheduleLogger.warn("ScheduleJob({}) has been executed by other instance", id);
					return;
				}
				scheduleService.execute(id);
			} catch (Exception e) {
				scheduleLogger.error("ScheduleJob({}) execute error:{}", id, e.getMessage());
				scheduleLogger.error(e.getMessage(), e);
			}
        });
    }
}
