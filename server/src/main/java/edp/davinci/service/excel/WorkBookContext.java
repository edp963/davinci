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

import edp.davinci.model.User;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 19:26
 * To change this template use File | Settings | File Templates.
 */
public class WorkBookContext implements Serializable {

    private MsgWrapper wrapper;

    private List<WidgetContext> widgets;

    private User user;

    private int resultLimit;


    public static WorkBookContext newWorkBookContext(MsgWrapper wrapper, List<WidgetContext> widgets, User user, int resultLimit) {
        return new WorkBookContext(wrapper, widgets, user, resultLimit);
    }

    public static WorkBookContext newWorkBookContext(List<WidgetContext> widgets, User user, int resultLimit) {
        return new WorkBookContext(widgets, user, resultLimit);
    }

    public WorkBookContext(List<WidgetContext> widgets, User user, int resultLimit) {
        this.widgets = widgets;
        this.user = user;
        this.resultLimit = resultLimit;
    }

    private WorkBookContext(MsgWrapper wrapper, List<WidgetContext> widgets, User user, int resultLimit) {
        this.wrapper = wrapper;
        this.widgets = widgets;
        this.user = user;
        this.resultLimit = resultLimit;
    }

    public MsgWrapper getWrapper() {
        return wrapper;
    }

    public void setWrapper(MsgWrapper wrapper) {
        this.wrapper = wrapper;
    }

    public List<WidgetContext> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<WidgetContext> widgets) {
        this.widgets = widgets;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getResultLimit() {
        return resultLimit;
    }

    public void setResultLimit(int resultLimit) {
        this.resultLimit = resultLimit;
    }
}
