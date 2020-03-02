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

package edp.core.utils;

import edp.core.common.quartz.QuartzJobExecutor;
import edp.core.consts.Consts;
import edp.core.exception.ServerException;
import edp.core.model.ScheduleJob;
import edp.davinci.core.enums.LogNameEnum;
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

    private static final String JOB_NAME_PREFIX = "CRONJOB_";

    public static String getJobDataKey(TriggerKey triggerKey) {
        return triggerKey.getGroup() + Consts.DOT + triggerKey.getName();
    }

    public void addJob(ScheduleJob scheduleJob) throws ServerException, SchedulerException {

        if (null == scheduleJob) {
            throw new ServerException("EMPTY job");
        }

        if (System.currentTimeMillis() < scheduleJob.getStartDate().getTime()
                || System.currentTimeMillis() > scheduleJob.getEndDate().getTime()) {
            Object[] args = {
                    scheduleJob.getId(),
                    DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis()),
                    DateUtils.toyyyyMMddHHmmss(scheduleJob.getStartDate()),
                    DateUtils.toyyyyMMddHHmmss(scheduleJob.getEndDate()),
                    scheduleJob.getCronExpression()
            };
            log.warn("ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
            scheduleLogger.warn("ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
            throw new ServerException("Current time is not within the planned execution time!");
        }

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        TriggerKey triggerKey = TriggerKey.triggerKey(JOB_NAME_PREFIX + scheduleJob.getId());
        CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
        if (null != trigger) {
            log.warn("ScheduleJob (:{}) already started!", scheduleJob.getId());
            scheduleLogger.warn("ScheduleJob (:{}) already started!", scheduleJob.getId());
            throw new ServerException("job already started!");
        }

        JobDetail jobDetail = JobBuilder
                .newJob(QuartzJobExecutor.class).withIdentity(JOB_NAME_PREFIX + scheduleJob.getId()).build();
        jobDetail.getJobDataMap().put(getJobDataKey(triggerKey), scheduleJob);


        TriggerBuilder<CronTrigger> triggerBuilder = TriggerBuilder
                .newTrigger()
                .withIdentity(triggerKey)
                .withSchedule(CronScheduleBuilder.cronSchedule(scheduleJob.getCronExpression()).withMisfireHandlingInstructionFireAndProceed())
                .startAt(scheduleJob.getStartDate().getTime() < System.currentTimeMillis() ? new Date() : scheduleJob.getStartDate())
                .endAt(scheduleJob.getEndDate());

        trigger = triggerBuilder.build();
        scheduler.scheduleJob(jobDetail, trigger);

        Object[] args = {
                scheduleJob.getId(),
                DateUtils.toyyyyMMddHHmmss(scheduleJob.getStartDate()),
                DateUtils.toyyyyMMddHHmmss(scheduleJob.getEndDate()),
                scheduleJob.getCronExpression()
        };
        log.info("ScheduleJob (:{}) is added to the scheduler, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);
        scheduleLogger.info("ScheduleJob (:{}) is added to the scheduler, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]", args);

        if (!scheduler.isStarted()) {
            scheduler.start();
        }
    }


    public void removeJob(ScheduleJob scheduleJob) throws ServerException {

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(JOB_NAME_PREFIX + scheduleJob.getId());
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null != trigger) {
                scheduler.pauseTrigger(triggerKey);
                scheduler.unscheduleJob(triggerKey);
                scheduler.deleteJob(JobKey.jobKey(scheduleJob.getId().toString()));
                log.info("ScheduleJob (:{}) removed finish!", triggerKey.getName());
                scheduleLogger.info("ScheduleJob (:{}) removed finish!", triggerKey.getName());
            } else {
                log.info("ScheduleJob (:{}) not found", triggerKey.getName());
                scheduleLogger.info("ScheduleJob (:{}) not found", triggerKey.getName());
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }

    public void modifyJob(ScheduleJob scheduleJob) throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(JOB_NAME_PREFIX + scheduleJob.getId());
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null == trigger) {
                return;
            }

            String oldExp = trigger.getCronExpression();
            if (!oldExp.equalsIgnoreCase(scheduleJob.getCronExpression())) {
                removeJob(scheduleJob);
                addJob(scheduleJob);
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

    public boolean isStarted(ScheduleJob scheduleJob) throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(JOB_NAME_PREFIX + scheduleJob.getId());
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
