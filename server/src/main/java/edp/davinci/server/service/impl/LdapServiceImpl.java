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

package edp.davinci.server.service.impl;

import edp.davinci.core.dao.entity.Organization;
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.OrganizationExtendMapper;
import edp.davinci.server.dao.RelUserOrganizationExtendMapper;
import edp.davinci.server.dao.UserExtendMapper;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.model.LdapPerson;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.service.LdapService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.support.LdapUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.naming.directory.DirContext;

import java.util.Date;
import java.util.List;

import static edp.davinci.commons.Constants.*;
import static org.springframework.ldap.query.LdapQueryBuilder.query;


@Slf4j
@Service("ldapService")
public class LdapServiceImpl implements LdapService {

    @Autowired
    private LdapTemplate ldapTemplate;

    @Value("${spring.ldap.domainName}")
    private String ldapDomainName;

    @Value("${spring.ldap.urls:''}")
    private String ldapUrls;

    @Autowired
    private UserExtendMapper userExtendMapper;

    @Autowired
    private OrganizationExtendMapper organizationExtendMapper;

    @Autowired
    private RelUserOrganizationExtendMapper relUserOrganizationMapper;

    public boolean existLdapServer() {
        return !StringUtils.isEmpty(ldapUrls);
    }

    /**
     * 查找 ldap 用户
     *
     * @param username
     * @param password
     * @return
     * @throws Exception
     */
    @Override
    public LdapPerson findByUsername(String username, String password) {
		LdapPerson ldapPerson = null;

		if (StringUtils.endsWithIgnoreCase(username, ldapDomainName)) {
			username = username.replaceAll("(?i)" + ldapDomainName, EMPTY);
		}
		String userDn = username + ldapDomainName;

		DirContext ctx = null;
		try {
			ctx = ldapTemplate.getContextSource().getContext(userDn, password);

			List<LdapPerson> search = ldapTemplate.search(
					query().where("objectclass").is("person").and("sAMAccountName").is(username),
					(AttributesMapper<LdapPerson>) attributes -> {
						LdapPerson person = new LdapPerson();
						person.setName(attributes.get("cn").get().toString());
						person.setSAMAccountName(attributes.get("sAMAccountName").get().toString());
						person.setEmail(userDn);
						return person;
					});

			if (!CollectionUtils.isEmpty(search)) {
				ldapPerson = search.get(0);
			}
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		} finally {
			if (null != ctx) {
				LdapUtils.closeContext(ctx);
			}
		}

		return ldapPerson;
    }

    @Override
    @Transactional
    public User registPerson(LdapPerson ldapPerson) throws ServerException {
        User user = new User();
        user.setUsername(ldapPerson.getSAMAccountName());
        user.setEmail(ldapPerson.getEmail());
        user.setName(ldapPerson.getName());
        user.setActive(true);
        user.setAdmin(true);
        user.setPassword(Constants.LDAP_USER_PASSWORD);
        user.setCreateBy(0L);
        user.setCreateTime(new Date());

        if (userExtendMapper.insert(user) <= 0) {
            log.error("Ldap regist fail, email:{}", user.getEmail());
            throw new ServerException("Ldap regist fail:unspecified error");
        }
        
        Long userId = user.getId();
        
        String orgName = user.getUsername() + "'s Organization";
        Organization organization = new Organization();
        organization.setName(orgName);
        organization.setMemberNum(1);
        organization.setMemberPermission((short)1);
        organization.setAllowCreateProject(true);
        organization.setUserId(userId);
        organization.setCreateBy(userId);
        organization.setCreateTime(new Date());
        
        if (organizationExtendMapper.insertSelective(organization) > 0) {
            RelUserOrganization relUserOrganization = new RelUserOrganization();
            relUserOrganization.setOrgId(organization.getId());
            relUserOrganization.setUserId(userId);
            relUserOrganization.setRole(UserOrgRoleEnum.OWNER.getRole());
            relUserOrganization.setCreateBy(userId);
            relUserOrganization.setCreateTime(new Date());
            relUserOrganizationMapper.insert(relUserOrganization);
        }

        return user;
    }
}
