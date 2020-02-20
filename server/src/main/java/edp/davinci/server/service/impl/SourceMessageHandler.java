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

package edp.davinci.server.service.impl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.server.component.jdbc.JdbcDataSource;
import edp.davinci.server.model.JdbcSourceInfo;
import edp.davinci.server.model.JdbcSourceInfo.JdbcSourceInfoBuilder;
import edp.davinci.server.service.RedisMessageHandler;
import edp.davinci.server.util.SourceUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SourceMessageHandler implements RedisMessageHandler {

    @Autowired
    private JdbcDataSource jdbcDataSource;

    @SuppressWarnings("unchecked")
	@Override
    public void handle(Object message, String flag) {

    	// the flag is deprecated
        log.info("SourceHandler received release source message (:{}), and Flag is (:{})", message, flag);
        
        if (!(message instanceof String)) {
            return;
        }
        
        Map<String,Object> map = JSONUtils.toObject((String)message, Map.class);
        
        SourceUtils sourceUtils = new SourceUtils(jdbcDataSource);
        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder
        		.aJdbcSourceInfo()
                .withJdbcUrl((String)map.get("url"))
                .withUsername((String)map.get("username"))
                .withPassword((String)map.get("password"))
                .withDbVersion((String)map.get("version"))
                .withExt((Boolean)map.get("ext")).build();

        sourceUtils.releaseDataSource(jdbcSourceInfo);
    }
}
