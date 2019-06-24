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

package edp.core.common.jdbc;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import edp.core.model.CustomDataSource;
import edp.core.utils.CustomDataSourceUtils;
import edp.core.utils.MD5Util;
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

    @Value("${source.connection-error-retry-attempts:0}")
    private int connectionErrorRetryAttempts;

    private static volatile Map<String, DruidDataSource> map = new HashMap<>();

    public synchronized void removeDatasource(String jdbcUrl, String username, String password) {
        String key = getKey(jdbcUrl, username, password);

        if (map.containsKey(key)) {
            map.remove(key);
        }
    }

    public synchronized DruidDataSource getDataSource(String jdbcUrl, String username, String password) throws SourceException {
        String key = getKey(jdbcUrl, username, password);

        if (!map.containsKey(key) || null == map.get(key)) {
            DruidDataSource instance = new JdbcDataSource();
            String className = null;
            try {
                className = DriverManager.getDriver(jdbcUrl.trim()).getClass().getName();
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

                instance.setDriverClassName(null != dataTypeEnum && !StringUtils.isEmpty(dataTypeEnum.getDriver()) ? dataTypeEnum.getDriver() : customDataSource.getDriver().trim());
            } else {
                instance.setDriverClassName(className);
            }

            instance.setUrl(jdbcUrl.trim());
            instance.setUsername(jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getFeature()) ? null : username);
            instance.setPassword((jdbcUrl.toLowerCase().contains(DataTypeEnum.PRESTO.getFeature()) || jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getFeature())) ?
                    null : password);
            instance.setInitialSize(initialSize);
            instance.setMinIdle(minIdle);
            instance.setMaxActive(maxActive);
            instance.setMaxWait(maxWait);
            instance.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
            instance.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
            instance.setTestWhileIdle(false);
            instance.setTestOnBorrow(testOnBorrow);
            instance.setTestOnReturn(testOnReturn);
            instance.setConnectionErrorRetryAttempts(connectionErrorRetryAttempts);
            instance.setBreakAfterAcquireFailure(breakAfterAcquireFailure);

            try {
                instance.init();
            } catch (Exception e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException(e.getMessage());
            }
            map.put(key, instance);
        }

        return map.get(key);
    }

    private String getKey(String jdbcUrl, String username, String password) {
        StringBuilder sb = new StringBuilder();
        if (!StringUtils.isEmpty(username)) {
            sb.append(username);
        }
        if (!StringUtils.isEmpty(password)) {
            sb.append(Consts.COLON).append(password);
        }
        sb.append(Consts.AT_SYMBOL).append(jdbcUrl.trim());

        return MD5Util.getMD5(sb.toString(), true, 64);
    }
}
