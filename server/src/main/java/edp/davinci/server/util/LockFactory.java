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

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.server.enums.LockType;


@Component
public class LockFactory {
	
	@Autowired
	private RedisUtils autowiredRedisUtils;

	private static RedisUtils redisUtils;
	
    @PostConstruct
    public void init() {
    	redisUtils = autowiredRedisUtils;
    }
	
	public static BaseLock getLock(String key, int timeout, LockType type) {
		key = "LOCK:" + key;
		switch (type) {
		case REDIS:
			if (redisUtils.isRedisEnable()) {
				return new BaseLock.RedisLock(redisUtils, key, timeout);
			}
		default:
			return new BaseLock.CacheLock(key, timeout);
		}
	}
	
	public static BaseLock getLock(String key, int timeout) {
		return getLock(key, timeout, LockType.LOCAL);
	}

	public static boolean ifLockExist(String key, LockType type) {
		key = "LOCK:" + key;
		switch (type) {
		case REDIS:
			if (redisUtils.isRedisEnable()) {
				return BaseLock.RedisLock.ifLockExist(key);
			}
		default:
			return BaseLock.CacheLock.ifLockExist(key);
		}
	}
}
