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

import edp.davinci.model.LdapPerson;
import edp.davinci.service.LdapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.support.LdapUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import java.util.List;

import static org.springframework.ldap.query.LdapQueryBuilder.query;

@Service("ldapService")
public class LdapServiceImpl implements LdapService {

    @Autowired
    private LdapTemplate ldapTemplate;

    @Value("${spring.ldap.domainName}")
    private String ldapDomainName;

    public LdapPerson findByUsername(String username, String password) throws NamingException {
        LdapPerson ldapPerson = null;

        if (StringUtils.endsWithIgnoreCase(username,ldapDomainName)) {
            username = username.replaceAll("(?i)" + ldapDomainName, "");
        }
        String userDn = username + ldapDomainName;

        DirContext ctx = ldapTemplate.getContextSource().getContext(userDn, password);

        List<LdapPerson> search = ldapTemplate.search(
                query().where("objectclass").is("person").and("sAMAccountName").is(username),
                new AttributesMapper<LdapPerson>() {
                    @Override
                    public LdapPerson mapFromAttributes(Attributes attributes) throws NamingException {
                        LdapPerson ldapPerson = new LdapPerson();
                        ldapPerson.setName(attributes.get("cn").get().toString());
                        ldapPerson.setSAMAccountName(attributes.get("sAMAccountName").get().toString());
                        return ldapPerson;
                    }
                });

        if (null != search && search.size() > 0) {
            ldapPerson = search.get(0);
        }

        LdapUtils.closeContext(ctx);
        return ldapPerson;
    }
}
