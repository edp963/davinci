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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

@Component
public class RedisUtils {
	
    @Autowired(required = false)
    @Qualifier("initRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.redis.isEnable:false}")
    private boolean isRedisEnable;
    
    public class RedisLock {
    	
    	private final String  script = "if redis.call('setnx', KEYS[1], ARGV[1]) == 1 then return redis.call('expire', KEYS[1], ARGV[2]) else return 0 end";
    	
		private String key;
		private int timeout;
		private long currentTime;
		
		public RedisLock(String key, int timeout) {
			this.key = key;
			this.timeout = timeout;
		}
		
		public boolean getLock() {
			currentTime = System.currentTimeMillis();
			return setIfAbsent(key, currentTime, timeout);
		}

		public boolean release() {
			if (isHolding()) {
				return delete(key);
			}
			return false;
		}

		private boolean isHolding() {
			if (currentTime == (long) get(key)) {
				return true;
			}
			return false;
		}
		
		@SuppressWarnings("unchecked")
		public boolean setIfAbsent(String key, Object value, int timeout) {
	        
			if (!isRedisEnable) {
	            throw new RuntimeException("Redis is disabled");
	        }
	        
	        List<String> keys = new ArrayList<>();
	        keys.add(key);
	        
	        Object[] values = new Object[]{value,timeout};
	        
	        return 1L== (Long)redisTemplate.execute(RedisScript.of(script, Long.class),keys,values);
		}

    }

    public boolean isRedisEnable() {
        return isRedisEnable;
    }

    public boolean set(String key, Object value) {
        if (isRedisEnable) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value);
            return true;
        }
        return false;
    }

    public boolean set(String key, Object value, Long millisecond) {
        if (!isRedisEnable) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, millisecond, TimeUnit.MILLISECONDS);
            return true;
        }
        return false;
    }

    public boolean set(String key, Object value, Long l, TimeUnit timeUnit) {
        if (!isRedisEnable) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, l, timeUnit);
            return true;
        }
        return false;
    }

    public Object get(String key) {
        if (!isRedisEnable) {
            return null;
        }
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        return valueOperations.get(key);
    }

    public boolean hasKey(String key) {
        return isRedisEnable && redisTemplate.hasKey(key);
    }

    public boolean delete(String key) {
        return isRedisEnable && redisTemplate.delete(key);
    }

    public void lPush(String key, Object value) {
        ListOperations<String, Object> list = redisTemplate.opsForList();
        list.leftPush(key, value);
    }

    public Object rPop(String key) {
        ListOperations<String, Object> list = redisTemplate.opsForList();
        return list.rightPop(key);
    }

    public void convertAndSend(String channel, Object message) {
        redisTemplate.convertAndSend(channel, message);
    }

}
