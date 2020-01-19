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

package edp.davinci.dto.roleDto;

import com.alibaba.fastjson.annotation.JSONType;
import edp.davinci.model.Project;
import edp.davinci.model.RelRoleProject;
import lombok.Data;

@Data
@JSONType(ignores = {"projectId", "roleId", "id"})
public class RoleProject extends RelRoleProject {
    private Project project;

    public RoleProject(Project project) {
        this.project = project;
    }

    public RoleProject() {
    }
}
