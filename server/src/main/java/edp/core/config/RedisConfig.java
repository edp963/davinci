/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.core.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@Slf4j
public class RedisConfig {

    @Value("${spring.redis.isEnable:false}")
    private boolean redisIsEnable;

    @Autowired
    private BeanFactory beanFactory;

    @Conditional(value = RedisEnableConfig.class)
    @Bean(name = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        log.info("redisTemplate");
        RedisTemplate<String, Object> redisTemplate = null;
        if (redisIsEnable) {
            redisTemplate = new RedisTemplate<String, Object>();
            redisTemplate.setConnectionFactory(redisConnectionFactory);
            redisTemplate.setKeySerializer(new StringRedisSerializer());
            redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
            redisTemplate.setHashKeySerializer(new GenericJackson2JsonRedisSerializer());
            redisTemplate.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
            redisTemplate.afterPropertiesSet();

        }

        return redisTemplate;
    }

    @Bean
    public RedisTemplate<String, Object> InitRedisTemplate() {
        log.info("InitRedisTemplate");
        RedisTemplate<String, Object> redisTemplate = null;
        if (redisIsEnable) {
            redisTemplate = (RedisTemplate<String, Object>) beanFactory.getBean("redisTemplate");
            //用于测试连接
            log.info("redis client count: {}", redisTemplate.getClientList().size());
        }
        return redisTemplate;
    }

}

class RedisEnableConfig implements Condition {
    @Value("${spring.redis.isEnable:false}")
    private boolean redisIsEnable;

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return redisIsEnable;
    }
}

