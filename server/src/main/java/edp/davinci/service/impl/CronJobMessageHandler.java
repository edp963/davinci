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

package edp.davinci.service.impl;

import edp.core.utils.QuartzHandler;
import edp.core.utils.RedisUtils;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.core.service.RedisMessageHandler;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.model.CronJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

@Slf4j
@Component
public class CronJobMessageHandler implements RedisMessageHandler {


    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private QuartzHandler quartzHandler;

    @Autowired
    private RedisUtils redisUtils;

    @Override
    public void handle(Object message, String flag) {
        log.info("CronJobHandler received stop message (:{}), and Flag is (:{})", message, flag);
        if (message instanceof Long) {
            Long id = (Long) message;
            if (id > 0L) {
                CronJob cronJob = cronJobMapper.getById(id);
                if (cronJob != null) {
                    quartzHandler.removeJob(cronJob);
                    cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());
                    cronJob.setUpdateTime(new Date());
                    cronJobMapper.update(cronJob);
                    redisUtils.set(flag, true);
                    log.info("RedisMessageHandler stop CronJob ({}) finish!", id);
                }
            }
        }
    }
}
