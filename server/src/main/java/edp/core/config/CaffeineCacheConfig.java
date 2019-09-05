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

package edp.core.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import edp.core.common.cache.Caches;
import edp.core.utils.MD5Util;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CaffeineCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        List<CaffeineCache> cacheList = new ArrayList<>();
        for (Caches c : Caches.values()) {
            cacheList.add(new CaffeineCache(c.name(),
                    Caffeine.newBuilder().recordStats()
                            .expireAfterWrite(c.getTtl(), TimeUnit.SECONDS)
                            .maximumSize(c.getMaxSize())
                            .build())
            );
        }
        manager.setCaches(cacheList);
        return manager;
    }


    @Bean(name = "keyGenerator")
    public KeyGenerator keyGenerator() {
        return (o, method, params) -> {
            StringBuilder sb = new StringBuilder();
            for (Object obj : params) {
                sb.append(obj.toString());
            }
            return MD5Util.getMD5(sb.toString(), false, 32);
        };
    }
}
