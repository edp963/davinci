/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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
 */

package edp.davinci.service.share;

import lombok.Getter;

public enum ShareType {
    VIEW(0),
    WIDGET(1),
    DASHBOARD(2),
    DISPLAY(3),

    /**
     * 数据
     */
    DATA(4),

    /**
     * 记录
     */
    RECORD(5),

    /**
     * 文件
     */
    FILE(6),

    /**
     * 登录
     */
    LOGIN(7),

    /**
     * 权限
     */
    PERMISSION(8);

    @Getter
    private int type;

    ShareType(int type) {
        this.type = type;
    }
}
