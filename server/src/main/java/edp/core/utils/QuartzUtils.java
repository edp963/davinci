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

import edp.core.common.job.QuartzJobFactory;
import edp.core.consts.Consts;
import edp.core.exception.ServerException;
import edp.core.model.ScheduleJob;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Component;

@Component
public class QuartzUtils {

    @Autowired
    private SchedulerFactoryBean schedulerFactoryBean;

    public void addJob(ScheduleJob scheduleJob) throws ServerException {

        if (null == scheduleJob) {
            throw new ServerException("EMPTY job");
        }

        if (System.currentTimeMillis() < scheduleJob.getStartDate().getTime()
                || System.currentTimeMillis() > scheduleJob.getEndDate().getTime()) {
            throw new ServerException("Current time is not within the planned execution time!");
        }

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(scheduleJob.getId().toString());
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null != trigger) {
                throw new ServerException("job already started!");
            }

            JobDetail jobDetail = JobBuilder.newJob(QuartzJobFactory.class).withIdentity(scheduleJob.getId().toString()).build();
            jobDetail.getJobDataMap().put(Consts.SCHEDULE_JOB_DATA_KEY, scheduleJob);

            TriggerBuilder<CronTrigger> triggerBuilder = TriggerBuilder
                    .newTrigger()
                    .withIdentity(scheduleJob.getId().toString())
                    .startNow()
                    .withSchedule(CronScheduleBuilder.cronSchedule(scheduleJob.getCronExpression()))
                    .endAt(scheduleJob.getEndDate());

            trigger = triggerBuilder.build();
            scheduler.scheduleJob(jobDetail, trigger);

            if (!scheduler.isShutdown()) {
                scheduler.start();
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }


    public boolean isStarted(ScheduleJob scheduleJob) throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(scheduleJob.getId().toString());
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null != trigger) {
                return true;
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
        return false;
    }

    public void removeJob(ScheduleJob scheduleJob) throws ServerException {

        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(scheduleJob.getId().toString());
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (null != trigger) {
                scheduler.pauseTrigger(triggerKey);
                scheduler.unscheduleJob(triggerKey);
                scheduler.deleteJob(JobKey.jobKey(scheduleJob.getId().toString()));
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }

    public void modifyJob(ScheduleJob scheduleJob) throws ServerException {
        Scheduler scheduler = schedulerFactoryBean.getScheduler();
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey(scheduleJob.getId().toString());
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
