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

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.concurrent.CountDownLatch;

import static edp.davinci.core.common.Constants.TOPIC_PATTERN;

@Configuration
public class RedisMessageListener {


    @Bean
    @ConditionalOnProperty("${spring.redis.isEnable}")
    public RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory, MessageListenerAdapter messageListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(messageListenerAdapter, new PatternTopic(TOPIC_PATTERN));
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
    RedisMessageReceiver redisMessageReceiver(CountDownLatch countDownLatch) {
        return new RedisMessageReceiver(countDownLatch);
    }


    @Bean
    CountDownLatch countDownLatch() {
        return new CountDownLatch(1);
    }
}
