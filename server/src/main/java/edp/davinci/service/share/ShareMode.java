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

public enum ShareMode {

    COMPATIBLE(0),  // 兼容模式
    NORMAL(1),      // 普通分享
    PASSWORD(2),    // 口令分享
    AUTH(3);        // 权限分享（用户、角色）

    @Getter
    private int mode;

    ShareMode(int mode) {
        this.mode = mode;
    }

    public static ShareMode valueOf(int mode) {
        for (ShareMode shareMode : ShareMode.values()) {
            if (shareMode.mode == mode) {
                return shareMode;
            }
        }
        return null;
    }

}
