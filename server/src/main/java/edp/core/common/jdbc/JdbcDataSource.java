/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.core.common.jdbc;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.util.StringUtils;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import edp.core.model.CustomDataSource;
import edp.core.utils.CustomDataSourceUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.DriverManager;
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

    @Value("${source.break-after-acquire-failure:true}")
    private boolean breakAfterAcquireFailure;

    @Value("${source.connection-error-retry-attempts:3}")
    private int connectionErrorRetryAttempts;

    private static volatile Map<String, DruidDataSource> map = new HashMap<>();

    public synchronized DruidDataSource getDataSource(String jdbcUrl, String username, String password) throws SourceException {
        String url = jdbcUrl.toLowerCase();
        if (!map.containsKey(username + "@" + url) || null == map.get(username + "@" + url)) {
            DruidDataSource instance = new JdbcDataSource();
            String className = null;
            try {
                className = DriverManager.getDriver(url).getClass().getName();
            } catch (SQLException e) {
            }

            if (StringUtils.isEmpty(className)) {
                DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);

                CustomDataSource customDataSource = null;
                if (null == dataTypeEnum) {
                    try {
                        customDataSource = CustomDataSourceUtils.getCustomDataSource(jdbcUrl);
                    } catch (Exception e) {
                        throw new SourceException(e.getMessage());
                    }
                }

                if (null == dataTypeEnum && null == customDataSource) {
                    throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
                }

                instance.setDriverClassName(StringUtils.isEmpty(dataTypeEnum.getDriver()) ? customDataSource.getDriver().trim() : dataTypeEnum.getDriver());
            } else {
                instance.setDriverClassName(className);
            }

            instance.setUrl(url);
            instance.setUsername(url.indexOf(DataTypeEnum.ELASTICSEARCH.getFeature()) > -1 ? null : username);
            instance.setPassword((url.indexOf(DataTypeEnum.PRESTO.getFeature()) > -1 || url.indexOf(DataTypeEnum.ELASTICSEARCH.getFeature()) > -1) ?
                    null : password);
            instance.setInitialSize(initialSize);
            instance.setMinIdle(minIdle);
            instance.setMaxActive(maxActive);
            instance.setMaxWait(maxWait);
            instance.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
            instance.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
            instance.setTestWhileIdle(testWhileIdle);
            instance.setTestOnBorrow(testOnBorrow);
            instance.setTestOnReturn(testOnReturn);
            instance.setConnectionErrorRetryAttempts(connectionErrorRetryAttempts);
            instance.setBreakAfterAcquireFailure(breakAfterAcquireFailure);

            try {
                instance.init();
            } catch (SQLException e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException("Exception during pool initialization");
            }
            map.put(username + "@" + url, instance);
        }

        return map.get(username + "@" + url);
    }
}
