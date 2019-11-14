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

import edp.core.model.ScheduleJob;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.Trigger;
import org.quartz.TriggerListener;

@Slf4j
public class QuartzTriggerListener implements TriggerListener {
    @Override
    public String getName() {
        return null;
    }

    @Override
    public void triggerFired(Trigger trigger, JobExecutionContext context) {

    }

    @Override
    public boolean vetoJobExecution(Trigger trigger, JobExecutionContext context) {
        return false;
    }

    @Override
    public void triggerMisfired(Trigger trigger) {
        JobDataMap jobDataMap = trigger.getJobDataMap();
        jobDataMap.forEach((k, v) -> {
            ScheduleJob scheduleJob = (ScheduleJob) v;
            log.warn("Scheduler is misfired :{}", scheduleJob.getId());
        });
    }

    @Override
    public void triggerComplete(Trigger trigger, JobExecutionContext context, Trigger.CompletedExecutionInstruction triggerInstructionCode) {

    }
}
