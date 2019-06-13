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

import edp.core.model.TokenDetail;
import lombok.Data;

import java.util.Date;

@Data
public class User extends TokenDetail {
    private Long id;

    private String email;

    private Boolean admin = true;

    private Boolean active = false;

    private String name;

    private String description;

    private String department;

    private String avatar;

    private Date createTime = new Date();

    private Long createBy = 0L;

    private Date updateTime;

    private Long updateBy;

    public User() {
    }

    public User(LdapPerson ldapPerson) {
        this.username = ldapPerson.getSAMAccountName();
        this.email = ldapPerson.getEmail();
        this.name = ldapPerson.getName();
    }
}