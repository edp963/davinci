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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisUtils {

    @Autowired(required = false)
    @Qualifier("initRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.redis.isEnable:false}")
    private boolean isRedisEnable;

    public boolean isRedisEnable() {
        return isRedisEnable;
    }

    public boolean set(String key, Object value) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value);
            return true;
        }
        return false;
    }

    public boolean set(String key, Object value, Long millisecond) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, millisecond, TimeUnit.MILLISECONDS);
            return true;
        }
        return false;
    }

    public boolean set(String key, Object value, Long l, TimeUnit timeUnit) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, l, timeUnit);
            return true;
        }
        return false;
    }

    public Object get(String key) {
        if (null == redisTemplate) {
            return null;
        }
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        return valueOperations.get(key);
    }

    public boolean hasKey(String key) {
        return null != redisTemplate && redisTemplate.hasKey(key);
    }

    public boolean delete(String key) {
        return null != redisTemplate && redisTemplate.delete(key);
    }

    public void lPush(String key, Object value) {
        ListOperations<String, Object> list = redisTemplate.opsForList();
        list.leftPush(key, value);
    }

    public void bLpush(String key, Object value) {
        // TODO need to fix dead store
        ListOperations<String, Object> list = redisTemplate.opsForList();
    }


    public Object rPop(String key) {
        ListOperations<String, Object> list = redisTemplate.opsForList();
        return list.rightPop(key);
    }


    public void convertAndSend(String channel, Object message) {
        redisTemplate.convertAndSend(channel, message);
    }
}
