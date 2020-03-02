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

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.core.enums.LockType;


@Component
public class LockFactory {
	
	@Autowired
	private RedisUtils redisUtils;

	private static RedisUtils staticRedisUtils;
	
    @PostConstruct
    public void init() {
    	staticRedisUtils = redisUtils;
    }
	
	public static BaseLock getLock(String key, int timeout, LockType type) {
		switch (type) {
		case REDIS:
			if (staticRedisUtils.isRedisEnable()) {
				return new BaseLock.RedisLock(staticRedisUtils, key, timeout);
			}
		default:
			return new BaseLock.CacheLock(key, timeout);
		}
	}
	
	public static BaseLock getLock(String key, int timeout) {
		return getLock(key, timeout, LockType.LOCAL);
	}
}
