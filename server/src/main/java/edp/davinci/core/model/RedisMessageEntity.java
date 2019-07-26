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

package edp.davinci.core.model;

import lombok.Getter;

import java.io.Serializable;

@Getter
public class RedisMessageEntity implements Serializable {
    private static final long serialVersionUID = 7958963558520404281L;


    private Class clazz;

    private Object message;

    private String flag;

    public RedisMessageEntity() {
    }

    public RedisMessageEntity(Class clazz, Object message, String flag) {
        this.clazz = clazz;
        this.message = message;
        this.flag = flag;
    }
}
