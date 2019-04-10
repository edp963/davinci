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

package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.model.LdapPerson;
import edp.davinci.model.User;

public interface LdapService {


    /**
     * 查找 ldap 用户
     * @param username
     * @param password
     * @return
     * @throws Exception
     */
    LdapPerson findByUsername(String username, String password) throws Exception;


    /**
     * 用户登录
     * @param userLogin
     * @return
     */
    ResultMap userLogin(UserLogin userLogin);


    /**
     * 将ldap 用户注册到 davinci系统
     * @param ldapPerson
     * @return
     */
    User registUser(LdapPerson ldapPerson);
}
