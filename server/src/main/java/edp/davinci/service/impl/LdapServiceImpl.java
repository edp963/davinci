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

package edp.davinci.service.impl;

import edp.davinci.model.LdapUser;
import edp.davinci.service.LdapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.support.LdapUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.ldap.query.LdapQueryBuilder.query;

@Service("ldapService")
public class LdapServiceImpl implements LdapService {

    @Autowired
    private LdapTemplate ldapTemplate;

    public LdapUser findByUsername(String username, String password) throws NamingException {

        //使用用户名、密码验证域用户
        DirContext ctx = ldapTemplate.getContextSource().getContext(username, password);

        LdapUser ldapUser = ldapTemplate.search(query().where("objectclass").is("person").and("sAMAccountName").is(username), new AttributesMapper<LdapUser>() {
            @Override
            public LdapUser mapFromAttributes(Attributes attributes) throws NamingException {
                LdapUser ldapUser = new LdapUser();
                ldapUser.setName(attributes.get("cn").get().toString());
                ldapUser.setSAMAccountName(attributes.get("sAMAccountName").get().toString());

                String memberOf = attributes.get("memberOf").toString().replaceAll("memberOf: ", "");

                List<String> list = new ArrayList<String>();
                String[] roles = memberOf.split(",");
                for (String role : roles) {
                    if (StringUtils.startsWithIgnoreCase(role.trim(), "CN=")) {
                        list.add(role.trim().replace("CN=", ""));
                    }
                }
                ldapUser.setRole(list);

                return ldapUser;
            }
        }).get(0);

        LdapUtils.closeContext(ctx);
        return ldapUser;
    }
}
