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

package edp.davinci.core.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.CountDownLatch;

import static edp.davinci.core.common.Constants.TOPIC_PATTERN;

@Component
@Slf4j
public class RedisMessageReceiver {

    private CountDownLatch countDownLatch;

    public RedisMessageReceiver(CountDownLatch countDownLatch) {
        this.countDownLatch = countDownLatch;
    }

    public void receive(Object message) {
        log.info("[{} received message, start spending......]", TOPIC_PATTERN);
        log.info("{}", message);
        countDownLatch.countDown();
    }
}
