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

package edp.davinci.core.service;

import edp.core.config.RedisEnableCondition;
import edp.davinci.core.model.RedisMessageEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Component;

import static edp.davinci.core.common.Constants.DAVINCI_TOPIC_CHANNEL;

@Component
@Slf4j
@Conditional(RedisEnableCondition.class)
public class RedisMessageReceiver {

    @Autowired
    private BeanFactory beanFactory;

    public void receive(RedisMessageEntity messageEntity) {
        if (messageEntity != null && messageEntity.getMessage() != null) {
            log.info("[ Redis ({}) received message, start handle......]", DAVINCI_TOPIC_CHANNEL);
            RedisMessageHandler handler = (RedisMessageHandler) beanFactory.getBean(messageEntity.getClazz());
            handler.handle(messageEntity.getMessage(), messageEntity.getFlag());
        }
    }
}
