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

package edp.davinci.service.excel;

import edp.davinci.core.enums.ActionEnum;
import lombok.ToString;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/30 16:32
 * To change this template use File | Settings | File Templates.
 */
@ToString
public class MsgWrapper<T> {

    public T msg;

    private ActionEnum action;

    private String rst;

    public Long xId;

    public String xUUID;

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

    public T getMsg() {
        return msg;
    }

    public void setMsg(T msg) {
        this.msg = msg;
    }

    public ActionEnum getAction() {
        return action;
    }

    public void setAction(ActionEnum action) {
        this.action = action;
    }

    public String getRst() {
        return rst;
    }

    public void setRst(String rst) {
        this.rst = rst;
    }

    public Long getxId() {
        return xId;
    }

    public void setxId(Long xId) {
        this.xId = xId;
    }

    public String getxUUID() {
        return xUUID;
    }

    public void setxUUID(String xUUID) {
        this.xUUID = xUUID;
    }
}
