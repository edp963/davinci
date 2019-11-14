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

package edp.davinci.core.config;

import edp.core.config.RedisEnableCondition;
import edp.davinci.core.service.RedisMessageReceiver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import static edp.davinci.core.common.Constants.DAVINCI_TOPIC_CHANNEL;

@Slf4j
@Configuration
@Conditional(RedisEnableCondition.class)
public class RedisMessageListener {

    @Autowired(required = false)
    @Qualifier("initRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;

    @Bean
    public RedisMessageListenerContainer container(MessageListenerAdapter messageListenerAdapter) {
        log.info("Registering bean for RedisMessageListenerContainer...");
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisTemplate.getConnectionFactory());
        container.addMessageListener(messageListenerAdapter, new PatternTopic(DAVINCI_TOPIC_CHANNEL));
        return container;
    }


    @Bean
    MessageListenerAdapter messageListenerAdapter(RedisMessageReceiver receiver) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(receiver, "receive");
        adapter.setStringSerializer(new StringRedisSerializer());
        adapter.setSerializer(new GenericJackson2JsonRedisSerializer());
        return adapter;
    }


    @Bean
    RedisMessageReceiver redisMessageReceiver() {
        return new RedisMessageReceiver();
    }
}

