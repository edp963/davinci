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

import lombok.Data;

import java.util.Date;

@Data
public class Organization {

    private Long id;

    private String name;

    private String description;

    private String avatar;

    private Long userId;

    private Integer projectNum = 0;

    private Integer memberNum = 1;

    private Integer roleNum = 0;

    private Boolean allowCreateProject = true;

    // 成员默认对project权限（隐藏/预览）
    private Short memberPermission = (short) 1;

    private Date createTime = new Date();

    private Long createBy;

    private Date updateTime;

    private Long updateBy;

    public Organization() {

    }

    public Organization(String name, String description, Long userId) {

        this.name = name;
        this.description = description;
        this.userId = userId;
        this.createBy = userId;
    }
}