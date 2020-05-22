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

package edp.davinci.server.dto.project;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import edp.davinci.core.dao.entity.Project;
import edp.davinci.server.dto.user.UserBaseInfo;
import lombok.Data;

@Data
public class ProjectWithCreateBy extends Project {

    private Boolean isStar = false;

    /**
     *	前端映射字段为createBy，与Project的createBy属性冲突， 兼容0.3前端代码
     */
    @JsonProperty("createBy")
    private UserBaseInfo createUser;
    
    @JsonIgnore
    private Long createBy;
}
