package edp.core.common.jdbc;

import com.alibaba.druid.pool.ElasticSearchDruidDataSourceFactory;
import edp.core.exception.SourceException;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Slf4j
public class ESDataSource {

    private ESDataSource() {
    }

    private static volatile DataSource dataSource = null;

    private static volatile Map<String, DataSource> map = new HashMap<>();

    public static synchronized DataSource getDataSource(String jdbcUrl, String username) throws SourceException {
        String url = jdbcUrl.toLowerCase();
        if (!map.containsKey(username + "@" + url) || null == map.get(username + "@" + url)) {
            Properties properties = new Properties();
            properties.setProperty("url", url);
            try {
                dataSource = ElasticSearchDruidDataSourceFactory.createDataSource(properties);
                map.put(username + "@" + url, dataSource);
            } catch (Exception e) {
                log.error("Exception during pool initialization, ", e);
                throw new SourceException("Exception during pool initialization: jdbcUrl=" + jdbcUrl);
            }
        }
        return map.get(username + "@" + url);
    }
}
