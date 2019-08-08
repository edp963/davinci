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

package edp.davinci.dto.cronJobDto;

import lombok.Getter;
import lombok.Setter;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class MsgMailExcel {

    @Getter
    private ReentrantLock lock;

    @Getter
    private Condition condition;

    @Getter
    @Setter
    private String filePath;


    public MsgMailExcel(ReentrantLock lock, Condition condition) {
        this.lock = lock;
        this.condition = condition;
    }
}
