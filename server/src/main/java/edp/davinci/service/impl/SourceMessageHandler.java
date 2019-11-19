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

package edp.davinci.service.impl;

import edp.core.common.jdbc.JdbcDataSource;
import edp.core.model.JdbcSourceInfo;
import edp.core.utils.RedisUtils;
import edp.core.utils.SourceUtils;
import edp.davinci.core.service.RedisMessageHandler;
import edp.davinci.dao.SourceMapper;
import edp.davinci.model.Source;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SourceMessageHandler implements RedisMessageHandler {


    @Autowired
    private SourceMapper sourceMapper;

    @Autowired
    private JdbcDataSource jdbcDataSource;

    @Autowired
    private RedisUtils redisUtils;

    @Override
    public void handle(Object message, String flag) {
        log.info("SourceHandler received release source message (:{}), and Flag is (:{})", message, flag);
        try {
            if (message instanceof Long) {
                Long id = (Long) message;
                if (id > 0L) {
                    Source source = sourceMapper.getById(id);
                    if (null == source) {
                        log.info("source (:{}) is not found", id);
                    }

                    SourceUtils sourceUtils = new SourceUtils(jdbcDataSource);
                    JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfo
                            .JdbcSourceInfoBuilder
                            .aJdbcSourceInfo()
                            .withJdbcUrl(source.getJdbcUrl())
                            .withUsername(source.getUsername())
                            .withPassword(source.getPassword())
                            .withDatabase(source.getDatabase())
                            .withDbVersion(source.getDbVersion())
                            .withProperties(source.getProperties())
                            .withExt(source.isExt())
                            .build();

                    sourceUtils.releaseDataSource(jdbcSourceInfo);
                }
            }
        } finally {
            redisUtils.set(flag, true);
        }
    }
}
