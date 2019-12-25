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

import java.util.concurrent.ConcurrentHashMap;

public abstract class BaseLock {

	public static class CacheLock extends BaseLock {

		private static final ConcurrentHashMap<String, Long> LOCKS = new ConcurrentHashMap<>();
		private static final ConcurrentHashMap<String, Long> TTLS = new ConcurrentHashMap<>();

		private long timestamp;

		public CacheLock(String key, int timeout) {
			super(key, timeout);
		}

		@Override
		public boolean getLock() {
			synchronized (key) {
				timestamp = System.currentTimeMillis();
				long ttl = timestamp + timeout * 1000L;

				if (!LOCKS.containsKey(key)) {
					return null == LOCKS.putIfAbsent(key, timestamp) && null == TTLS.putIfAbsent(key, ttl);
				}

				if (TTLS.get(key) < timestamp) {
					long exTimestamp = LOCKS.get(key);
					long exTtl = TTLS.get(key);
					return exTimestamp == LOCKS.replace(key, timestamp) && exTtl == TTLS.replace(key, ttl);
				}

				return false;
			}
		}

		@Override
		public boolean release() {
			synchronized (key) {
				long ttl = timestamp + timeout * 1000L;
				if (isHolding()) {
					return timestamp == LOCKS.remove(key) && ttl == TTLS.remove(key);
				}
				return false;
			}
		}

		@Override
		public boolean isHolding() {

			if (!LOCKS.containsKey(key) || !TTLS.containsKey(key)) {
				return false;
			}

			if (timestamp == LOCKS.get(key)) {
				return true;
			}

			return false;
		}
	}

	public static class RedisLock extends BaseLock {

		private long currentTime;

		RedisUtils redisUtils;

		public RedisLock(RedisUtils redisUtils, String key, int timeout) {
			super(key, timeout);
			this.redisUtils = redisUtils;
		}

		@Override
		public boolean getLock() {
			currentTime = System.currentTimeMillis();
			return redisUtils.setIfAbsent(key, currentTime, timeout);
		}

		@Override
		public boolean release() {
			if (isHolding()) {
				return redisUtils.delete(key);
			}
			return false;
		}

		@Override
		public boolean isHolding() {

			Long value = (Long) redisUtils.get(key);

			if (value == null) {
				return false;
			}

			if (currentTime == value) {
				return true;
			}

			return false;
		}

	}

	protected final String key;
	protected final int timeout;

	public BaseLock(String key, int timeout) {
		this.key = key;
		this.timeout = timeout;
	}

	public abstract boolean getLock();

	public abstract boolean release();

	public abstract boolean isHolding();
}
