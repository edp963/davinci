package edp.core.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import edp.core.common.cache.Caches;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
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
}
