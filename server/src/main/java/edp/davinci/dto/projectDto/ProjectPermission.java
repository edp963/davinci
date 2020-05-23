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

package edp.davinci.dto.projectDto;

import com.alibaba.fastjson.annotation.JSONField;
import edp.davinci.core.enums.UserPermissionEnum;
import lombok.Data;

@Data
public class ProjectPermission {

    private Short sourcePermission = 0;

    private Short viewPermission = 0;

    private Short widgetPermission = 0;

    private Short vizPermission = 1;

    private Short schedulePermission = 0;

    private Boolean sharePermission = false;

    private Boolean downloadPermission = false;

    @JSONField(serialize = false)
    private boolean isProjectMaintainer = false;


    public ProjectPermission() {
    }

    public ProjectPermission(Short permission) {
        this.sourcePermission = permission;
        this.viewPermission = permission;
        this.widgetPermission = permission;
        this.vizPermission = permission;
        this.schedulePermission = permission;
    }

    public static ProjectPermission previewPermission() {
        ProjectPermission permission = new ProjectPermission();
        permission.setVizPermission((short) 1);
        permission.setWidgetPermission((short) 0);
        permission.setViewPermission((short) 0);
        permission.setSourcePermission((short) 0);
        permission.setSchedulePermission((short) 0);
        permission.setDownloadPermission(false);
        permission.setSharePermission(false);
        return permission;
    }

    public static ProjectPermission adminPermission() {
        ProjectPermission permission = new ProjectPermission(UserPermissionEnum.DELETE.getPermission());
        permission.setDownloadPermission(true);
        permission.setSharePermission(true);
        permission.isProjectMaintainer = true;
        return permission;
    }
}
