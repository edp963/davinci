package edp.core.common.jdbc;

import com.alibaba.druid.pool.DruidDataSource;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JdbcDataSource extends DruidDataSource {

    @Value("${spring.datasource.type}")
    private String type;

    @Value("${source.max-active:10}")
    private int maxActive;

    @Value("${source.initial-size:1}")
    private int initialSize;

    @Value("${source.min-idle:3}")
    private int minIdle;

    @Value("${source.max-wait:30000}")
    private int maxWait;

    @Value("${spring.datasource.time-between-eviction-runs-millis}")
    private int timeBetweenEvictionRunsMillis;

    @Value("${spring.datasource.min-evictable-idle-time-millis}")
    private int minEvictableIdleTimeMillis;

    @Value("${spring.datasource.test-while-idle}")
    private boolean testWhileIdle;

    @Value("${spring.datasource.test-on-borrow}")
    private boolean testOnBorrow;

    @Value("${spring.datasource.test-on-return}")
    private boolean testOnReturn;

    private static volatile Map<String, Object> map = new HashMap<>();

    public synchronized DruidDataSource getDataSource(String jdbcUrl, String username, String password) throws SourceException {
        String url = jdbcUrl.toLowerCase();
        if (!map.containsKey(username + "@" + url) || null == map.get(username + "@" + url)) {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            if (null == dataTypeEnum) {
                throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
            }

            DruidDataSource instance = new JdbcDataSource();
            instance.setUrl(url);
            instance.setUsername(url.indexOf(DataTypeEnum.ELASTICSEARCH.getFeature()) > -1 ? null : username);
            instance.setPassword((url.indexOf(DataTypeEnum.PRESTO.getFeature()) > -1 || url.indexOf(DataTypeEnum.ELASTICSEARCH.getFeature()) > -1) ?
                    null : password);
            instance.setDriverClassName(dataTypeEnum.getDriver());
            instance.setInitialSize(initialSize);
            instance.setMinIdle(minIdle);
            instance.setMaxActive(maxActive);
            instance.setMaxWait(maxWait);
            instance.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
            instance.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
            instance.setTestWhileIdle(testWhileIdle);
            instance.setTestOnBorrow(testOnBorrow);
            instance.setTestOnReturn(testOnReturn);

            try {
                instance.init();
                log.info("user dataseource : {}", dataTypeEnum.getDesc());
            } catch (SQLException e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException("Exception during pool initialization");
            }
            map.put(username + "@" + url, instance);
        }

        return (DruidDataSource) map.get(username + "@" + url);
    }
}
