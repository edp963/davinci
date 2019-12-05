
package edp.davinci.controller;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections4.map.HashedMap;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import edp.core.common.jdbc.JdbcDataSource;
import edp.core.model.JdbcSourceInfo;
import edp.core.model.JdbcSourceInfo.JdbcSourceInfoBuilder;
import edp.core.utils.RedisUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.model.RedisMessageEntity;

/**
 * SourceControllerTest description: ???
 *
 */
public class SourceControllerTest extends BaseControllerTest {

    @Autowired
    JdbcDataSource dataSource;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    RedisUtils redisUtils;
    
    @Test
    public void createSource() throws Exception {
        
        for (int  i = 0; i < 2; i++) {
            Thread t = new Thread(()->{
                Map<String, Object> requestMap = new HashedMap<>();
                requestMap.put("id", 0);
                requestMap.put("name", "a");
                requestMap.put("description", "");
                requestMap.put("type", "jdbc");
                requestMap.put("projectId", 2);

                Map<String, Object> configMap = new HashedMap<>();
                configMap.put("username", "test121");
                configMap.put("password", "dds@test121");
                configMap.put("url",
                        "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8");
                configMap.put("ext", false);
                configMap.put("properties", new ArrayList());
                configMap.put("version", "");

                requestMap.put("config", configMap);

                doPost("/api/v3/sources", requestMap);
            }) ;
            t.start();
        }
        
        Thread.sleep(60 * 1000L);
    }

//    @Test
//    public void testSource() throws Exception {
//
//        Map<String, Object> requestMap = new HashedMap<>();
//        requestMap.put("username", "test121");
//        requestMap.put("password", "dds@test121");
//        requestMap.put("url",
//                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8");
//        requestMap.put("ext", false);
//
//        doPost("/api/v3/sources/test", requestMap);
//
//        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo()
//                .withJdbcUrl((String) requestMap.get("url")).withUsername((String) requestMap.get("username"))
//                .withPassword((String) requestMap.get("password")).withExt((Boolean) requestMap.get("ext")).build();
//        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
//    }
//
//    @Test
//    public void updateSource() throws Exception {
//
//        Map<String, Object> requestMap = new HashedMap<>();
//        requestMap.put("id", 3);
//        requestMap.put("name", "dss-test(CSC销售报表)");
//        requestMap.put("description", "dss-test(CSC销售报表)");
//        requestMap.put("type", "jdbc");
//
//        Map<String, Object> configMap = new HashedMap<>();
//        configMap.put("username", "test121");
//        configMap.put("password", "dds@test121");
//        configMap.put("url",
//                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8");
//        configMap.put("ext", false);
//        configMap.put("properties", new ArrayList());
//        configMap.put("version", "");
//
//        requestMap.put("config", configMap);
//
//        doPut("/api/v3/sources/3", requestMap);
//
//        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo()
//                .withJdbcUrl((String) configMap.get("url")).withUsername((String) configMap.get("username"))
//                .withPassword((String) configMap.get("password")).withExt((Boolean) configMap.get("ext")).build();
//        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
//    }
//    
//    @Test
//    public void updateSource_with_reconnect_with_redis() throws Exception {
//        
//        if (!redisUtils.isRedisEnable()) {
//            return;
//        }
//        
//        final List<Long> ids = new ArrayList<>();
//
//        redisTemplate.getConnectionFactory().getConnection().subscribe((message, pattern) -> {
//            RedisMessageEntity entity = (RedisMessageEntity) new GenericJackson2JsonRedisSerializer()
//                    .deserialize(message.getBody());
//            ids.add((Long) entity.getMessage());
//        }, new StringRedisSerializer().serialize(Constants.DAVINCI_TOPIC_CHANNEL));
//
//        Map<String, Object> requestMap = new HashedMap<>();
//        requestMap.put("id", 3);
//        requestMap.put("name", "dss-test(CSC销售报表)");
//        requestMap.put("description", "dss-test(CSC销售报表)");
//        requestMap.put("type", "jdbc");
//
//        Map<String, Object> configMap = new HashedMap<>();
//        configMap.put("username", "test121");
//        configMap.put("password", "dds@test121");
//        configMap.put("url",
//                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8&key=1");
//        configMap.put("ext", false);
//        configMap.put("properties", new ArrayList());
//        configMap.put("version", "");
//
//        requestMap.put("config", configMap);
//
//        doPut("/api/v3/sources/3", requestMap);
//
//        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo()
//                .withJdbcUrl((String) configMap.get("url")).withUsername((String) configMap.get("username"))
//                .withPassword((String) configMap.get("password")).withExt((Boolean) configMap.get("ext")).build();
//        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
//        assertEquals(3L, (long)ids.get(0));
//    }
//
//    @Test
//    public void reconnect() throws Exception {
//
//        Map<String, Object> requestMap = new HashedMap<>();
//        requestMap.put("dbUser", "test121");
//        requestMap.put("dbPassword", "dds@test121");
//
//        doPost("/api/v3/sources/reconnect/3", requestMap);
//
//        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(
//                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8")
//                .withUsername("test121").withPassword("dds@test121").withExt(false).build();
//        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
//    }
//
//    @Test
//    public void reconnect_with_redis() throws Exception {
//        
//        if (!redisUtils.isRedisEnable()) {
//            return;
//        }
//
//        final List<Long> ids = new ArrayList<>();
//
//        redisTemplate.getConnectionFactory().getConnection().subscribe((message, pattern) -> {
//            RedisMessageEntity entity = (RedisMessageEntity) new GenericJackson2JsonRedisSerializer()
//                    .deserialize(message.getBody());
//            ids.add((Long) entity.getMessage());
//        }, new StringRedisSerializer().serialize(Constants.DAVINCI_TOPIC_CHANNEL));
//
//        Map<String, Object> requestMap = new HashedMap<>();
//        requestMap.put("dbUser", "test121");
//        requestMap.put("dbPassword", "dds@test121");
//
//        doPost("/api/v3/sources/reconnect/3", requestMap);
//
//        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(
//                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8")
//                .withUsername("test121").withPassword("dds@test121").withExt(false).build();
//        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
//        assertEquals(3L, (long)ids.get(0));
//    }
}
