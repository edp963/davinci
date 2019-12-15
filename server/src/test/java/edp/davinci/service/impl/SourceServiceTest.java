
package edp.davinci.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import edp.core.common.jdbc.JdbcDataSource;
import edp.core.model.JdbcSourceInfo;
import edp.core.model.JdbcSourceInfo.JdbcSourceInfoBuilder;
import edp.core.utils.RedisUtils;
import edp.davinci.BaseTest;
import edp.davinci.core.common.Constants;
import edp.davinci.core.model.RedisMessageEntity;
import edp.davinci.dto.sourceDto.DbBaseInfo;
import edp.davinci.dto.sourceDto.SourceConfig;
import edp.davinci.dto.sourceDto.SourceCreate;
import edp.davinci.dto.sourceDto.SourceInfo;
import edp.davinci.dto.sourceDto.SourceTest;
import edp.davinci.model.Source;
import edp.davinci.service.SourceService;

/**
 * SourceServiceTest description: ???
 *
 */
@Transactional
@Rollback
@RunWith(SpringRunner.class)
public class SourceServiceTest extends BaseTest {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Autowired
    SourceService service;

    @Autowired
    JdbcDataSource dataSource;
    
    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    @Autowired
    RedisUtils redisUtils;

    protected Source source;
    
    @Before
    public void setUp() throws Exception {
        super.setUp();
        source = createSource("junit data source 4 test");
    }
    
    private Source createSource(String name) {
        SourceCreate create = new SourceCreate();
        create.setName(name);
        create.setProjectId(project.getId());
        create.setType("jdbc");

        SourceConfig config = new SourceConfig();
        config.setUrl(url);
        config.setUsername(username);
        config.setPassword(password);

        create.setConfig(config);
        
        return service.createSource(create, user);
    }
    
    @Test
    public void createSource() throws Exception {

        assertNotNull(createSource("junit data source"));
        
        assertDataSourceExist();
    }

    private void assertDataSourceExist() {

        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(url).withUsername(username)
                .withPassword(password).withExt(false).build();
        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
    }

    @Test
    public void testSource() throws Exception {

        SourceTest test = new SourceTest();
        test.setUrl(url);
        test.setUsername(username);
        test.setPassword(password);

        assertFalse(!service.testSource(test));
        
        assertDataSourceExist();
    }

    @Test
    public void updateSource() throws Exception {
        
        SourceInfo info = new SourceInfo();
        info.setId(source.getId());
        info.setName(source.getName());
        info.setType(source.getType());
        info.setDescription("test for update");
        
        SourceConfig config = new SourceConfig();
        config.setUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        
        info.setConfig(config);
        service.updateSource(info, user);
        
        assertEquals("test for update", service.getSources(project.getId(), user).get(0).getDescription());
        
        assertDataSourceExist();
    }
    
    @Test
    public void updateSource_with_reconnect_with_redis() throws Exception {

        if (!redisUtils.isRedisEnable()) {
            return;
        }

        final List<Long> ids = new ArrayList<>();

        redisTemplate.getConnectionFactory().getConnection().subscribe((message, pattern) -> {
            RedisMessageEntity entity = (RedisMessageEntity) new GenericJackson2JsonRedisSerializer()
                    .deserialize(message.getBody());
            ids.add((Long) entity.getMessage());
        }, new StringRedisSerializer().serialize(Constants.DAVINCI_TOPIC_CHANNEL));
        
        SourceInfo info = new SourceInfo();
        info.setId(source.getId());
        info.setName(source.getName());
        info.setType(source.getType());
        info.setDescription("test for update");
        
        SourceConfig config = new SourceConfig();
        config.setUrl(url+"&key=1");
        config.setUsername(username);
        config.setPassword(password);
        
        info.setConfig(config);
        service.updateSource(info, user);

        assertEquals("test for update", service.getSources(project.getId(), user).get(0).getDescription());
        
        assertEquals(url+"&key=1", service.getSources(project.getId(), user).get(0).getJdbcUrl());
        
        while(true) {
            if (ids.size() <= 0) {
                Thread.sleep(100L);
                continue;
            }
            break;
        }

        assertEquals((long)source.getId(), (long) ids.get(0));

        assertDataSourceExist();
    }
    
    @Test
    public void reconnect() throws Exception {
        
        DbBaseInfo info = new DbBaseInfo();
        info.setDbUser(username);
        info.setDbPassword(password);
        
        assertFalse(!service.reconnect(source.getId(), info, user));

        assertDataSourceExist();
    }
    
    @Test
    public void reconnect_with_redis() throws Exception {
        
        if (!redisUtils.isRedisEnable()) {
            return;
        }
        
        final List<Long> ids = new ArrayList<>();

        redisTemplate.getConnectionFactory().getConnection().subscribe((message, pattern) -> {
            RedisMessageEntity entity = (RedisMessageEntity) new GenericJackson2JsonRedisSerializer()
                    .deserialize(message.getBody());
            ids.add((Long) entity.getMessage());
        }, new StringRedisSerializer().serialize(Constants.DAVINCI_TOPIC_CHANNEL));
        
        DbBaseInfo info = new DbBaseInfo();
        info.setDbUser(username);
        info.setDbPassword(password);

        assertFalse(!service.reconnect(source.getId(), info, user));
        
        while(true) {
            if (ids.size() <= 0) {
                Thread.sleep(100L);
                continue;
            }
            break;
        }

        assertEquals((long)source.getId(), (long) ids.get(0));
        
        assertDataSourceExist();
    }

}
