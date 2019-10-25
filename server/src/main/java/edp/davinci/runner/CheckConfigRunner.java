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

package edp.davinci.runner;

import com.alibaba.druid.util.StringUtils;
import edp.davinci.core.utils.DacChannelUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;


@Order(0)
@Component
@Slf4j
public class CheckConfigRunner implements ApplicationRunner {

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port}")
    private String mailPort;

    @Value("${spring.mail.username}")
    private String mailUserName;


    @Value("${spring.mail.nickname}")
    private String nickName;


    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private DacChannelUtil dacChannelUtil;


    @Override
    public void run(ApplicationArguments args) {
        if (StringUtils.isEmpty(mailHost)) {
            log.error("**************     Configuration error: mail host cannot be EMPTY!      **************");
            SpringApplication.exit(applicationContext);
        }

        if (StringUtils.isEmpty(mailPort)) {
            log.error("**************     Configuration error: mail port cannot be EMPTY!      **************");
            SpringApplication.exit(applicationContext);
        }

        if (StringUtils.isEmpty(mailUserName)) {
            log.error("**************     Configuration error: mail username cannot be EMPTY!      **************");
            SpringApplication.exit(applicationContext);
        }

        if (StringUtils.isEmpty(mailUserName)) {
            log.error("**************     Configuration error: mail nickname cannot be EMPTY!      **************");
            SpringApplication.exit(applicationContext);
        }

        dacChannelUtil.loadDacMap();
    }
}
