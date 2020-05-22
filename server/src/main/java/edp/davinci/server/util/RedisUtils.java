/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.server.util;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

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
		if (!isRedisEnable) {
			return false;
		}
		ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
		valueOperations.set(key, value);
		return true;
	}

	public boolean set(String key, Object value, Long l, TimeUnit timeUnit) {
		if (!isRedisEnable) {
			return false;
		}
		ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
		valueOperations.set(key, value, l, timeUnit);
		return true;
	}

	public Object get(String key) {
		if (!isRedisEnable) {
			return null;
		}
		ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
		return valueOperations.get(key);
	}

	public boolean delete(String key) {
		return isRedisEnable && redisTemplate.delete(key);
	}

	public void convertAndSend(String channel, Object message) {

		if (!isRedisEnable) {
			throw new RuntimeException("Redis is disabled");
		}
		
		redisTemplate.convertAndSend(channel, message);
	}

	public boolean setIfAbsent(String key, Object value, int timeout) {

		if (!isRedisEnable) {
			throw new RuntimeException("Redis is disabled");
		}

		return redisTemplate.opsForValue().setIfAbsent(key, value, timeout, TimeUnit.SECONDS);
	}

	public boolean setIfAbsent(String key, Object value) {

		if (!isRedisEnable) {
			throw new RuntimeException("Redis is disabled");
		}

		return redisTemplate.opsForValue().setIfAbsent(key, value);
	}

}
