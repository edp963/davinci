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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.server.component.jdbc.JdbcDataSource;
import edp.davinci.server.model.JdbcSourceInfo;
import edp.davinci.server.service.RedisMessageHandler;
import edp.davinci.server.util.SourceUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SourceMessageHandler implements RedisMessageHandler {

    @Autowired
    private JdbcDataSource jdbcDataSource;

	@Override
    public void handle(Object message, String flag) {
        
        if (!(message instanceof String)) {
            return;
        }
        
        JdbcSourceInfo sourceInfo = JSONUtils.toObject((String)message, JdbcSourceInfo.class);
        SourceUtils sourceUtils = new SourceUtils(jdbcDataSource);
        sourceUtils.releaseDataSource(sourceInfo);
        log.info("SourceMessageHandler release source whit message:{}", message);
    }
}
