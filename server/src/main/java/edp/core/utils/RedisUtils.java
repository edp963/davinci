package edp.core.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisUtils {

    @Autowired(required = false)
    @Qualifier("InitRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;

    public void set(String key, Object value) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value);
        }
    }

    public void set(String key, Object value, Long millisecond) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, millisecond, TimeUnit.MILLISECONDS);
        }
    }

    public void set(String key, Object value, Long l, TimeUnit timeUnit) {
        if (null != redisTemplate) {
            ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(key, value, l, timeUnit);
        }
    }

    public Object get(String key) {
        if (null ==redisTemplate) {
            return null;
        }
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        return valueOperations.get(key);
    }
}
