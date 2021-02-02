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

package edp.davinci.server.util;

import edp.davinci.commons.util.DateUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.server.component.quartz.QuartzJobExecutor;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.exception.ServerException;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Component;

import java.util.Date;

@Slf4j
@Component
public class QuartzHandler {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    @Autowired
    private SchedulerFactoryBean schedulerFactoryBean;

    public static final String TRIGGER_PREFIX = "TRIGGER_";
    public static final String JOB_PREFIX = "JOB_";
    public static final String GROUP_PREFIX = "GROUP_";

    public void addJob(CronJob cronJob) throws ServerException, SchedulerException {

        if (null == cronJob) {
            throw new ServerException("Empty job");
        }

        if (System.currentTimeMillis() > cronJob.getEndDate().getTime()) {
            Object[] args = {
                    cronJob.getId(),
                    DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis()),
                    DateUtils.toyyyyMMddHHmmss(cronJob.getStartDate()),
                    DateUtils.toyyyyMMddHHmmss(cronJob.getEndDate()),
                    cronJob.getCronExpression()
            };
            log.warn("ScheduleJob({}), currentTime:{} is not within the planned execution time, startTime:{}, endTime:{}, cronExpression:{}", args);
            scheduleLogger.warn("ScheduleJob({}), currentTime:{} is not within the planned execution time, startTime:{}, endTime:{}, cronExpression:{}", args);
            throw new ServerException("Current time is not within the planned execution time!");
        }

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        String id = String.valueOf(cronJob.getId());
        String group = GROUP_PREFIX + cronJob.getProjectId();

        TriggerKey triggerKey = TriggerKey.triggerKey(TRIGGER_PREFIX + id, group);
        CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
        if (null != trigger) {
            log.warn("ScheduleJob({}) already started!", id);
            scheduleLogger.warn("ScheduleJob({}) already started!", id);
            throw new ServerException("Job already started!");
        }

        JobDetail jobDetail = JobBuilder
                .newJob(QuartzJobExecutor.class).withIdentity(JOB_PREFIX + id, group).build();
        jobDetail.getJobDataMap().put("jobId", id);
        jobDetail.getJobDataMap().put("jobType", cronJob.getJobType());

        TriggerBuilder<CronTrigger> triggerBuilder = TriggerBuilder
                .newTrigger()
                .withIdentity(triggerKey)
                .withSchedule(CronScheduleBuilder.cronSchedule(cronJob.getCronExpression()).withMisfireHandlingInstructionFireAndProceed())
                .startAt(cronJob.getStartDate().getTime() < System.currentTimeMillis() ? new Date() : cronJob.getStartDate())
                .endAt(cronJob.getEndDate());

        trigger = triggerBuilder.build();
        scheduler.scheduleJob(jobDetail, trigger);

        Object[] args = {
                cronJob.getId(),
                DateUtils.toyyyyMMddHHmmss(cronJob.getStartDate()),
                DateUtils.toyyyyMMddHHmmss(cronJob.getEndDate()),
                cronJob.getCronExpression()
        };
        log.info("ScheduleJob({}) is added to the scheduler, startTime:{}, endTime:{}, cronExpression:{}", args);
        scheduleLogger.info("ScheduleJob({}) is added to the scheduler, startTime:{}, endTime:{}, cronExpression:{}", args);

        if (!scheduler.isStarted()) {
            scheduler.start();
        }
    }


    public void removeJob(CronJob cronJob) throws ServerException {

        String id = String.valueOf(cronJob.getId());
        String group = GROUP_PREFIX + cronJob.getProjectId();

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(TRIGGER_PREFIX + id, group);
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            JobKey jobKey = JobKey.jobKey(JOB_PREFIX + id, group);
            if (null != trigger) {
                scheduler.pauseTrigger(triggerKey);
                scheduler.unscheduleJob(triggerKey);
                scheduler.deleteJob(jobKey);
                log.info("ScheduleJob({}) removed finish!", jobKey.toString());
                scheduleLogger.info("ScheduleJob({}) removed finish!", jobKey.toString());
            } else {
                log.info("ScheduleTrigger({}) not found", triggerKey.toString());
                scheduleLogger.info("ScheduleTrigger({}) not found", triggerKey.toString());
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }

    public void modifyJob(CronJob cronJob) throws ServerException {

        String id = String.valueOf(cronJob.getId());
        String group = GROUP_PREFIX + cronJob.getProjectId();

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(TRIGGER_PREFIX + id, group);
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null == trigger) {
                return;
            }

            String exp = trigger.getCronExpression();
            Date startTime = trigger.getStartTime();
            Date endTime = trigger.getEndTime();
            if (!exp.equalsIgnoreCase(cronJob.getCronExpression()) ||
                    startTime.getTime() != cronJob.getStartDate().getTime() ||
                    endTime.getTime() != cronJob.getEndDate().getTime()) {
                removeJob(cronJob);
                addJob(cronJob);
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }

    public void startJobs() throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            scheduler.start();
        } catch (SchedulerException e) {
            throw new ServerException(e.getMessage());
        }
    }

    public boolean isStarted(CronJob cronJob) throws ServerException {

        String id = String.valueOf(cronJob.getId());
        String group = GROUP_PREFIX + cronJob.getProjectId();

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(TRIGGER_PREFIX + id, group);
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null != trigger) {
                return true;
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
        return false;
    }

    public void shutdownJobs() throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            if (!scheduler.isShutdown()) {
                scheduler.shutdown();
            }
        } catch (SchedulerException e) {
            throw new ServerException(e.getMessage());
        }
    }

}
