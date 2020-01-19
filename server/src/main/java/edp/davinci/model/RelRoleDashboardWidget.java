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
 */

package edp.davinci.model;

import edp.core.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleDashboardWidget extends RecordInfo<RelRoleDashboardWidget> {

    private Long roleId;

    private Long memDashboardWidgetId;

    private Boolean visible = false; // 可见/不可见  true/false

    public RelRoleDashboardWidget() {
    }

    public RelRoleDashboardWidget(Long roleId, Long memDashboardWidgetId) {
        this.roleId = roleId;
        this.memDashboardWidgetId = memDashboardWidgetId;
    }
}