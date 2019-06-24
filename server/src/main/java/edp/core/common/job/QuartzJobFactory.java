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

package edp.core.common.job;

import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import edp.core.model.ScheduleJob;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class QuartzJobFactory implements Job {

    @Autowired
    private BeanFactory beanFactory;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        ScheduleJob scheduleJob = (ScheduleJob) jobExecutionContext.getMergedJobDataMap().get(Consts.SCHEDULE_JOB_DATA_KEY);

        if (scheduleJob.getStartDate().getTime() <= System.currentTimeMillis()
                && scheduleJob.getEndDate().getTime() >= System.currentTimeMillis()) {
            String jobType = scheduleJob.getJobType().trim();

            if (!StringUtils.isEmpty(jobType)) {
                ScheduleService scheduleService = (ScheduleService) beanFactory.getBean(jobType + "ScheduleService");
                try {
                    scheduleService.execute(scheduleJob.getId());
                } catch (Exception e) {
                    e.printStackTrace();
                    return;
                }
            }
        }
    }
}
