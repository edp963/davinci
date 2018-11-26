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

import edp.core.exception.ServerException;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserLoginResult;
import edp.davinci.model.*;
import edp.davinci.service.LdapService;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.support.LdapUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.util.StringUtils;

import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.ldap.query.LdapQueryBuilder.query;

@Slf4j
@Service("ldapService")
public class LdapServiceImpl implements LdapService {

    @Autowired
    private LdapTemplate ldapTemplate;

    @Value("${spring.ldap.domainName}")
    private String ldapDomainName;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TeamMapper teamMapper;

    @Autowired
    private PsCommentMapper psCommentMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private OrganizationMapper organizationMapper;


    @Autowired
    private TokenUtils tokenUtils;


    /**
     * 查找 ldap 用户
     *
     * @param username
     * @param password
     * @return
     * @throws Exception
     */
    @Override
    public LdapPerson findByUsername(String username, String password) throws Exception {
        LdapPerson ldapPerson = null;

        if (StringUtils.endsWithIgnoreCase(username, ldapDomainName)) {
            username = username.replaceAll("(?i)" + ldapDomainName, "");
        }
        String userDn = username + ldapDomainName;

        DirContext ctx = null;
        try {
            ctx = ldapTemplate.getContextSource().getContext(userDn, password);

            List<LdapPerson> search = ldapTemplate.search(
                    query().where("objectclass").is("person").and("sAMAccountName").is(username),
                    new AttributesMapper<LdapPerson>() {
                        @Override
                        public LdapPerson mapFromAttributes(Attributes attributes) throws NamingException {

                            LdapPerson ldapPerson = new LdapPerson();
                            ldapPerson.setName(attributes.get("cn").get().toString());
                            String distinguishedname = attributes.get("distinguishedname").get().toString();
                            if (!StringUtils.isEmpty(distinguishedname)) {
                                String[] split = distinguishedname.split(",");
                                List<String> list = new ArrayList<>();
                                for (String s : split) {
                                    if (StringUtils.startsWithIgnoreCase(s.trim(), "OU=")) {
                                        if (StringUtils.endsWithIgnoreCase(s.trim(), "HABROOT")) {
                                            continue;
                                        }
                                        list.add(0, s.trim().replace("OU=", ""));
                                    }
                                }
                                ldapPerson.setDept(list.stream().collect(Collectors.joining("_")));
                            }
                            ldapPerson.setSAMAccountName(attributes.get("sAMAccountName").get().toString());
                            ldapPerson.setEmail(userDn);
                            return ldapPerson;
                        }
                    });

            if (null != search && search.size() > 0) {
                ldapPerson = search.get(0);
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        } finally {
            if (null != ctx) {
                LdapUtils.closeContext(ctx);
            }
        }

        return ldapPerson;
    }


    /**
     * 用户登录
     *
     * @param userLogin
     * @return
     */
    @Override
    public ResultMap userLogin(UserLogin userLogin) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        User user = userMapper.selectByUsername(userLogin.getUsername());

        LdapPerson ldapPerson = null;
        try {
            ldapPerson = findByUsername(userLogin.getUsername(), userLogin.getPassword());
        } catch (Exception e) {
            log.info("ldap user not found: {}", userLogin.getUsername());
        }

        if (null == user) {
            if (null != ldapPerson) {
                user = registUser(ldapPerson);
            } else {
                return resultMap.fail().message("password is wrong").payload("username or password is wrong");
            }
        }

        if (null != user && null != ldapPerson) {
            final User u = user;
            final LdapPerson p = ldapPerson;
            checkUserTeam(u, p);
//            new Thread(() -> checkUserTeam(u, p)).start();
        }

        //校验密码
        if ("-1".equals(user.getPassword()) || BCrypt.checkpw(userLogin.getPassword(), user.getPassword())) {
        } else {
            log.info("password is wrong: {}", userLogin.getUsername());
            return resultMap.fail().message("password is wrong").payload("username or password is wrong");
        }
        //是否激活
        if (!user.getActive()) {
            log.info("this user is not active： {}", userLogin.getUsername());
            return resultMap.failWithToken(tokenUtils.generateToken(user)).message("this user is not active");
        }

        UserLoginResult userLoginResult = new UserLoginResult();
        BeanUtils.copyProperties(user, userLoginResult);
        return resultMap.success(tokenUtils.generateToken(user)).payload(userLoginResult);
    }


    /**
     * 检测同步团队是否变化
     *
     * @param user
     * @param ldapPerson
     */
    @Transactional
    protected void checkUserTeam(User user, LdapPerson ldapPerson) {
        List<Team> psTeams = psCommentMapper.getPsTeamByUserId(user.getId());

        List<OrganizationInfo> organizations = organizationMapper.getOrganizationByUser(user.getId());

        if (null != ldapPerson) {
            //ldap用户存
            List<Team> teams = psCommentMapper.getByDesc(ldapPerson.getDept());
            Set<Long> collect = teams.stream().map(t -> t.getId()).collect(Collectors.toSet());

            Set<RelUserTeam> teamSet = new HashSet<>();
            Set<RelUserOrganization> orgSet = new HashSet<>();
            for (Team team : teams) {
                if (!organizations.contains(team.getOrgId())) {
                    orgSet.add(new RelUserOrganization(team.getOrgId(), user.getId(), UserOrgRoleEnum.MEMBER.getRole()));
                }

                // 同步已经加入的team
                if (null != psTeams && psTeams.size() > 0) {
                    for (Team psTeam : psTeams) {
                        if (team.getOrgId() == psTeam.getOrgId() && !collect.contains(psTeam.getId())) {
                            teamSet.add(new RelUserTeam(psTeam.getId(), user.getId(), UserTeamRoleEnum.MEMBER.getRole()));
                        }
                    }
                } else {
                    teamSet.add(new RelUserTeam(team.getId(), user.getId(), UserTeamRoleEnum.MEMBER.getRole()));
                    if (!orgSet.stream().map(o -> o.getOrgId()).collect(Collectors.toSet()).contains(team.getOrgId())) {
                        orgSet.add(new RelUserOrganization(team.getOrgId(), user.getId(), UserOrgRoleEnum.MEMBER.getRole()));
                    }
                }
            }

            //加入新的team
            for (Team psTeam : psTeams) {
                if (!collect.contains(psTeam.getId())) {
                    teamSet.add(new RelUserTeam(psTeam.getId(), user.getId(), UserTeamRoleEnum.MEMBER.getRole()));
                }
            }

            if (orgSet.size() > 0) {
                relUserOrganizationMapper.insertBatch(orgSet);
                Set<Long> orgIds = orgSet.stream().map(o -> o.getId()).collect(Collectors.toSet());
                organizationMapper.addOneMemberNum(orgIds);
            }

            if (teamSet.size() > 0) {
                relUserTeamMapper.insertBatch(teamSet);
            }

        } else {
            //ldap用户不存在，删除机构、团队关联信息
            List<Long> teamIds = psTeams.stream().map(t -> t.getId()).collect(Collectors.toList());
            Set<Long> orgIds = psTeams.stream().map(t -> t.getOrgId()).collect(Collectors.toSet());

            relUserTeamMapper.deleteBatch(teamIds);
            relUserOrganizationMapper.deleteBatch(orgIds);
        }
    }


    /**
     * 将ldap 用户注册到 davinci系统
     *
     * @param ldapPerson
     * @return
     */
    @Override
    @Transactional
    public User registUser(LdapPerson ldapPerson) {
        User user = null;
        if (null != ldapPerson) {
            try {
                user.setName(ldapPerson.getName());
                user.setEmail(ldapPerson.getEmail());
                user.setUsername(ldapPerson.getSAMAccountName());
                user.setDescription(ldapPerson.getDept());
                user.setActive(true);
                user.setPassword("-1");

                int insert = userMapper.insert(user);
                if (insert > 0) {
                    List<Team> teams = psCommentMapper.getByDesc(ldapPerson.getDept());
                    if (null != teams && teams.size() > 0) {
                        Set<Long> orgIds = new HashSet<>();
                        Set<RelUserTeam> relUserTeamSet = new HashSet<>();
                        Set<RelUserOrganization> relUserOrganizationSet = new HashSet<>();
                        for (Team team : teams) {
                            relUserTeamSet.add(new RelUserTeam(team.getId(), user.getId(), UserTeamRoleEnum.MEMBER.getRole()));
                            orgIds.add(team.getOrgId());
                        }
                        for (Long orgId : orgIds) {
                            relUserOrganizationSet.add(new RelUserOrganization(orgId, user.getId(), UserOrgRoleEnum.MEMBER.getRole()));
                        }

                        relUserTeamMapper.insertBatch(relUserTeamSet);
                        relUserOrganizationMapper.insertBatch(relUserOrganizationSet);
                        organizationMapper.addOneMemberNum(orgIds);
                    }
                }
            } catch (Exception e) {
                TransactionAspectSupport.currentTransactionStatus().isRollbackOnly();
                return null;
            }
        }
        return user;
    }


}
