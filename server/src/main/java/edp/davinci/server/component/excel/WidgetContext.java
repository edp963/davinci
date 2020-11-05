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

import edp.davinci.core.dao.entity.Dashboard;
import edp.davinci.core.dao.entity.MemDashboardWidget;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.server.dto.view.WidgetQueryParam;
import lombok.Data;

import java.io.Serializable;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 11:46
 * To change this template use File | Settings | File Templates.
 */
@Data
public class WidgetContext implements Serializable {

    private Widget widget;

    private Dashboard dashboard;

    private MemDashboardWidget memDashboardWidget;

    private Boolean isMaintainer;

    private WidgetQueryParam queryParam;

    private boolean hasQueryParam = false;

    public WidgetContext(Widget widget, Dashboard dashboard, MemDashboardWidget memDashboardWidget, WidgetQueryParam queryParam) {
        this.widget = widget;
        this.dashboard = dashboard;
        this.memDashboardWidget = memDashboardWidget;
        this.queryParam = queryParam;
    }

    public WidgetContext(Widget widget, boolean isMaintainer, WidgetQueryParam queryParam) {
        this.widget = widget;
        this.isMaintainer = isMaintainer;
        this.queryParam = queryParam;
    }

    public WidgetContext() {

    }

    public boolean hasQueryParam() {
        return this.queryParam != null;
    }
}
