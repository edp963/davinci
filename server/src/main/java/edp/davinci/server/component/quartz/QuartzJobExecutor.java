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

package edp.davinci.server.component.quartz;

import edp.davinci.commons.util.DateUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.server.component.excel.ExecutorUtil;
import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.util.QuartzHandler;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
public class QuartzJobExecutor implements Job {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    public static final ExecutorService executorService = Executors.newFixedThreadPool(4);

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        ExecutorUtil.printThreadPoolStatusLog(executorService, "Cronjob_Executor", scheduleLogger);
        executorService.submit(() -> {
            TriggerKey triggerKey = jobExecutionContext.getTrigger().getKey();
            CronJob cronJob = (CronJob) jobExecutionContext.getMergedJobDataMap().get(QuartzHandler.getJobDataKey(triggerKey));
            if (cronJob == null) {
                log.warn("scheduleJob is not found, {}", triggerKey.getName());
                return;
            }

            if (cronJob.getStartDate().getTime() <= System.currentTimeMillis()
                    && cronJob.getEndDate().getTime() >= System.currentTimeMillis()) {
                String jobType = cronJob.getJobType().trim();

                if (!StringUtils.isEmpty(jobType)) {
                    ScheduleService scheduleService = (ScheduleService) SpringContextHolder.getBean(jobType + "ScheduleService");
                    try {
                        scheduleService.execute(cronJob.getId());
                    } catch (Exception e) {
                        e.printStackTrace();
                        log.error(e.getMessage());
                        scheduleLogger.error(e.getMessage());
                    }
                } else {
                    log.warn("Unknown job type [{}], job ID: (:{})", jobType, cronJob.getId());
                    scheduleLogger.warn("Unknown job type [{}], job ID: (:{})", jobType, cronJob.getId());
                }
            } else {
                Object[] args = {
                        cronJob.getId(),
                        DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis()),
                        DateUtils.toyyyyMMddHHmmss(cronJob.getStartDate()),
                        DateUtils.toyyyyMMddHHmmss(cronJob.getEndDate()),
                        cronJob.getCronExpression()
                };
                log.warn("ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
                scheduleLogger.warn("ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
            }
        });
    }
}
