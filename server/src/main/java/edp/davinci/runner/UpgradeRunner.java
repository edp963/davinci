/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

import edp.davinci.service.WidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * widget 升级数据迁移
 */
@Order(4)
@Component
public class UpgradeRunner implements ApplicationRunner {

    @Autowired
    private WidgetService widgetService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        new Thread(() -> {
            try {
                widgetService.upgradeWidgetConfig();
            } catch (Exception e) {

            }
        }).start();
    }
}
