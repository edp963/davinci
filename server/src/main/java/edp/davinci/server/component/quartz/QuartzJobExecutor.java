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

package edp.davinci.server.component.quartz;

import edp.davinci.server.component.excel.ExecutorUtils;
import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.enums.LogNameEnum;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutorService;

@Slf4j
public class QuartzJobExecutor implements Job {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {

        ExecutorService executorService = ExecutorUtils.getJobWorkers();
        ExecutorUtils.printThreadPoolStatus(executorService, "JOB_WORKERS", scheduleLogger);

        executorService.submit(() -> {
            JobDetail jobDetail = jobExecutionContext.getJobDetail();
            String jobId = (String) jobDetail.getJobDataMap().get("jobId");
            String jobType = (String) jobDetail.getJobDataMap().get("jobType");

            ScheduleService scheduleService = (ScheduleService) SpringContextHolder.getBean(jobType + "ScheduleService");
            if (scheduleService == null) {
                scheduleLogger.warn("ScheduleJob({}) unknown job type {}", jobId, jobType);
                return;
            }

            try {
                scheduleService.execute(Long.parseLong(jobId));
            } catch (Exception e) {
                scheduleLogger.error("ScheduleJob({}) execute error", jobId);
                scheduleLogger.error(e.toString(), e);
            }
        });
    }
}
