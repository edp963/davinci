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

package edp.davinci.model;

import edp.core.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleProject extends RecordInfo<RelRoleProject> {
    private Long id;

    private Long projectId;

    private Long roleId;

    private Short sourcePermission = 1;     //隐藏/只读/修改/删除 0/1/2/3
    private Short viewPermission = 1;       //隐藏/只读/修改/删除 0/1/2/3
    private Short widgetPermission = 1;     //隐藏/只读/修改/删除 0/1/2/3
    private Short vizPermission = 1;        //隐藏/只读/修改/删除 0/1/2/3
    private Short schedulePermission = 1;   //隐藏/只读/修改/删除 0/1/2/3

    private Boolean sharePermission = false;
    private Boolean downloadPermission = false;


    public RelRoleProject(Long projectId, Long roleId) {
        this.projectId = projectId;
        this.roleId = roleId;
    }

    public RelRoleProject() {
    }

    @Override
    public String toString() {
        return "RelRoleProject{" +
                "id=" + id +
                ", projectId=" + projectId +
                ", roleId=" + roleId +
                ", sourcePermission=" + sourcePermission +
                ", viewPermission=" + viewPermission +
                ", widgetPermission=" + widgetPermission +
                ", vizPermission=" + vizPermission +
                ", schedulePermission=" + schedulePermission +
                ", sharePermission=" + sharePermission +
                ", downloadPermission=" + downloadPermission +
                '}';
    }
}