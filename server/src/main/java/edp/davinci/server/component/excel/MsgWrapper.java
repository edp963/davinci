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
 *
 */

package edp.davinci.server.component.excel;

import edp.davinci.server.enums.ActionEnum;
import lombok.Data;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/30 16:32
 * To change this template use File | Settings | File Templates.
 */
@Data
public class MsgWrapper<T> {

	private T msg;

    private ActionEnum action;

    private String rst;

    private Long xId;

    private String xUUID;

    public MsgWrapper(T msg, ActionEnum action, Long xId) {
        this.msg=msg;
        this.action=action;
        this.xId=xId;
    }

    public MsgWrapper(T msg, ActionEnum action, String xUUID) {
        this.msg = msg;
        this.action = action;
        this.xUUID = xUUID;
    }
}
