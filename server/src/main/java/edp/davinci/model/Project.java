/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.model;

import lombok.Data;

@Data
public class Project {
    private Long id;

    private String name;

    private String description;

    private String pic;

    private Long orgId;

    private Long userId;

    private Integer starNum = 0;

    private Boolean visibility = true;

    private Boolean isTransfer = false;

    private Long initialOrgId;

    public Project() {
    }

    public Project(Long id, Long userId) {
        this.id = id;
        this.userId = userId;
    }


    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", pic='" + pic + '\'' +
                ", orgId=" + orgId +
                ", userId=" + userId +
                ", starNum=" + starNum +
                ", visibility=" + visibility +
                ", isTransfer=" + isTransfer +
                ", initialOrgId=" + initialOrgId +
                '}';
    }

    public String baseInfoToString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", visibility=" + visibility +
                '}';
    }
}