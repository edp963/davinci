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

import com.alibaba.druid.util.StringUtils;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import edp.core.enums.HttpCodeEnum;
import edp.core.utils.*;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.model.TokenEntity;
import edp.davinci.dao.*;
import edp.davinci.dto.organizationDto.*;
import edp.davinci.dto.projectDto.ProjectWithCreateBy;
import edp.davinci.dto.teamDto.TeamBaseInfoWithParent;
import edp.davinci.dto.teamDto.TeamUserBaseInfo;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.model.*;
import edp.davinci.service.OrganizationService;
import edp.davinci.service.TeamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Slf4j
@Service("organizationService")
public class OrganizationServiceImpl extends CommonService implements OrganizationService {

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private TeamMapper teamMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private MailUtils mailUtils;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private TeamService teamService;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Override
    public synchronized boolean isExist(String name, Long id, Long scopeId) {
        Long orgId = organizationMapper.getIdByName(name);
        if (null != id && null != orgId) {
            return !id.equals(orgId);
        }
        return null != orgId && orgId.longValue() > 0L;
    }

    /**
     * 新建组织
     *
     * @param organizationCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createOrganization(OrganizationCreate organizationCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        log.info(organizationCreate.toString());

        if (isExist(organizationCreate.getName(), null, null)) {
            log.info("the organization name {} is alread taken", organizationCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the organization name " + organizationCreate.getName() + " is alread taken");
        }

        //新增组织
        Organization organization = new Organization(organizationCreate.getName(), organizationCreate.getDescription(), user.getId());
        int insert = organizationMapper.insert(organization);

        //用户-组织 建立关联
        RelUserOrganization relUserOrganization = new RelUserOrganization(organization.getId(), user.getId(), UserOrgRoleEnum.OWNER.getRole());
        int relId = relUserOrganizationMapper.insert(relUserOrganization);

        if (insert > 0 && relId > 0) {
            OrganizationBaseInfo organizationBaseInfo = new OrganizationBaseInfo(organization.getId(), organization.getName(), organization.getDescription(), null, UserOrgRoleEnum.OWNER.getRole());
            return resultMap.successAndRefreshToken(request).payload(organizationBaseInfo);
        } else {
            log.info("create organization error");
            throw new RuntimeException("create organization error");
        }
    }

    /**
     * 修改组织信息
     * 只有organization的创建者和owner可以修改
     *
     * @param organizationPut
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateOrganization(OrganizationPut organizationPut, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Organization organization = organizationMapper.getById(organizationPut.getId());
        if (null == organization) {
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //验证修改权限，只有organization的创建者和owner可以修改
        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), organizationPut.getId());
        if (!organization.getUserId().equals(user.getId()) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to update this organization");
        }

        BeanUtils.copyProperties(organizationPut, organization);
        organization.setUpdateBy(user.getId());
        organization.setUpdateTime(new Date());

        organizationMapper.update(organization);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 上传组织头图
     *
     * @param id
     * @param file
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap uploadAvatar(Long id, MultipartFile file, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Organization organization = organizationMapper.getById(id);
        if (null == organization) {
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //只有组织的创建者和owner有权限
        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), id);
        if (!organization.getUserId().equals(user.getId()) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            log.info("user({}) don't have permission to change avatar of this organization({})", user.getId(), organization.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to change avatar of this organization");
        }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = user.getUsername() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.ORG_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(avatar)) {
                return resultMap.failAndRefreshToken(request).message("organization avatar upload error");
            }
        } catch (Exception e) {
            log.error("uploadAvatar: organization({}) avatar upload error, error: {}", organization.getName(), e.getMessage());
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message("organization avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(organization.getAvatar())) {
            fileUtils.remove(organization.getAvatar());
        }

        //修改头像
        organization.setAvatar(avatar);
        organization.setUpdateTime(new Date());
        organization.setUpdateBy(user.getId());

        int i = organizationMapper.update(organization);
        if (i > 0) {
            Map<String, String> map = new HashMap<>();
            map.put("avatar", avatar);

            return resultMap.successAndRefreshToken(request).payload(map);
        } else {
            return resultMap.failAndRefreshToken(request).message("server error, organization avatar update fail");
        }
    }


    /**
     * 删除组织
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteOrganization(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Organization organization = organizationMapper.getById(id);
        if (null == organization) {
            log.info("organization(:{}) is not found", id);
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //只有组织的创建者和owner有权限删除
        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), id);
        if (!organization.getUserId().equals(user.getId()) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            log.info("user({}) don't have permission to delete organization({})", user.getId(), organization.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to delete this organization");
        }

        //校验组织下是否有团队
        List<Team> teamList = teamMapper.getByOrgId(id);
        if (null != teamList && teamList.size() > 0) {
            log.info("There is at least one team under the organization({}), it is can not be deleted", organization.getId());
            return resultMap.failAndRefreshToken(request).message("There is at least one team under this organization, it is can not be deleted");
        }

        //校验组织下是否有项目
        List<Project> projectList = projectMapper.getByOrgId(id);
        if (null != projectList && projectList.size() > 0) {
            log.info("There is at least one project under the organization({}), it is can not be deleted", organization.getId());
            return resultMap.failAndRefreshToken(request).message("There is at least one project under this organization, it is can not be deleted");
        }

        //删除用户关联
        relUserOrganizationMapper.deleteByOrgId(id);

        //删除organization
        organizationMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);

    }

    /**
     * 获取组织详情
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getOrganization(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Organization organization = organizationMapper.getById(id);
        if (null == organization) {
            log.info("organization(:{}) is not found", id);
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), id);
        if (null == rel) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Unauthorized");
        }

        OrganizationInfo organizationInfo = new OrganizationInfo();
        BeanUtils.copyProperties(organization, organizationInfo);
        organizationInfo.setRole(rel.getRole());
        return resultMap.successAndRefreshToken(request).payload(organizationInfo);
    }

    /**
     * 获取组织列表
     * 当前用户创建 + Member（关联表用户是当前用户）
     *
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getOrganizations(User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<OrganizationInfo> organizationInfos = organizationMapper.getOrganizationByUser(user.getId());
        return resultMap.successAndRefreshToken(request).payloads(organizationInfos);
    }

    /**
     * 获取组织项目列表
     *
     * @param id
     * @param user
     * @param keyword
     * @param pageNum
     * @param pageSize
     * @param request
     * @return
     */
    @Override
    public ResultMap getOrgProjects(Long id, User user, String keyword, int pageNum, int pageSize, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        if (PageUtils.checkPageInfo(pageNum, pageSize)) {
            PageHelper.startPage(pageNum, pageSize);

            if (StringUtils.isEmpty(keyword)) {
                keyword = null;
            }

            List<ProjectWithCreateBy> projects = projectMapper.getProjectsByOrgWithUser(id, user.getId(), keyword);

            PageInfo<ProjectWithCreateBy> pageInfo = new PageInfo<>(projects);

            return resultMap.successAndRefreshToken(request).payload(pageInfo);
        } else {
            return resultMap.failAndRefreshToken(request).message("Invalid page info");
        }

    }

    /**
     * 获取组织成员列表
     *
     * @param id
     * @param request
     * @return
     */
    @Override
    public ResultMap getOrgMembers(Long id, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<OrganizationMember> organizationMembers = relUserOrganizationMapper.getOrgMembers(id);
        return resultMap.successAndRefreshToken(request).payloads(organizationMembers);
    }

    /**
     * 获取组织团队列表（携带团队下成员）
     *
     * @param orgId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getOrgTeamsByOrgId(Long orgId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);
        List<TeamBaseInfoWithParent> orgTeams = null;
        //当前用户在组织下能访问的所有team
        List<TeamBaseInfoWithParent> teams = teamMapper.getTeamsByOrgId(orgId);

        if (null != teams && teams.size() > 0) {
            orgTeams = new ArrayList<>();
            //当前用户在组织下能访问的所有team的所有member（包含owner）
            List<TeamUserBaseInfo> userList = userMapper.getUsersByTeamOrgId(orgId);
            //构造组织团队返回结果
            if (null != userList && userList.size() > 0) {
                Map<Long, TeamBaseInfoWithParent> map = new HashMap<>();
                teams.forEach(t -> map.put(t.getId(), t));

                //成员列表
                for (TeamUserBaseInfo teamUserBaseInfo : userList) {
                    Long teamId = teamUserBaseInfo.getTeamId();
                    if (map.containsKey(teamId)) {
                        List<UserBaseInfo> userBaseInfoList = map.get(teamId).getUsers();
                        if (null == userBaseInfoList) {
                            map.get(teamId).setUsers(new ArrayList<>());
                        }

                        UserBaseInfo userBaseInfo = new UserBaseInfo();
                        BeanUtils.copyProperties(teamUserBaseInfo, userBaseInfo);

                        map.get(teamId).getUsers().add(userBaseInfo);
                    }
                }

                for (Long teamId : map.keySet()) {
                    orgTeams.add(map.get(teamId));
                }
            }
        }
        return resultMap.successAndRefreshToken(request).payloads(teamService.getStructuredList(orgTeams, null));
    }


    /**
     * 邀请成员
     *
     * @param orgId
     * @param memId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap inviteMember(Long orgId, Long memId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);


        //验证组织
        Organization organization = organizationMapper.getById(orgId);
        if (null == organization) {
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //验证被邀请者
        User member = userMapper.getById(memId);
        if (null == member) {
            log.info("user (:{}) is not found", memId);
            return resultMap.failAndRefreshToken(request).message("user is not found");
        }

        // 验证用户权限，只有organization的owner可以邀请
        RelUserOrganization relOwner = relUserOrganizationMapper.getRel(user.getId(), orgId);
        if (null == relOwner || relOwner.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot invite anyone to join this orgainzation, cause you are not the owner of this orginzation");
        }

        //验证被邀请用户是否已经加入
        RelUserOrganization rel = relUserOrganizationMapper.getRel(memId, orgId);
        if (null != rel) {
            return resultMap.failAndRefreshToken(request).message("the invitee is already a member of the this organization");
        }

        //校验邮箱
        if (StringUtils.isEmpty(user.getEmail())) {
            resultMap.failAndRefreshToken(request).message("The email address of the invitee is empty");
        }

        /**
         * 邀请组织成员token生成实体
         * 规则：
         * username: 邀请人id:-:被邀请人id:-:组织id
         * password: 被邀请人密码
         */
        TokenEntity orgInviteDetail = new TokenEntity();
        orgInviteDetail.setUsername(user.getId() + Constants.SPLIT_CHAR_STRING + memId + Constants.SPLIT_CHAR_STRING + organization.getId());
        orgInviteDetail.setPassword(member.getPassword());

        Map content = new HashMap<String, Object>();
        content.put("username", member.getUsername());
        content.put("inviter", user.getUsername());
        content.put("orgName", organization.getName());
        content.put("host", getHost());
        //aes加密token
        content.put("token", AESUtils.encrypt(tokenUtils.generateContinuousToken(orgInviteDetail), null));
        mailUtils.sendTemplateEmail(member.getEmail(),
                String.format(Constants.INVITE_ORG_MEMBER_MAIL_SUBJECT, user.getUsername(), organization.getName()),
                Constants.INVITE_ORG_MEMBER_MAIL_TEMPLATE,
                content);

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 组织成员确认邀请
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap confirmInvite(String token, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //aes解密
        token = AESUtils.decrypt(token, null);

        //验证token(特殊验证，不走util)
        String tokenUserName = tokenUtils.getUsername(token);
        String tokenPassword = tokenUtils.getPassword(token);

        if (StringUtils.isEmpty(tokenUserName) || StringUtils.isEmpty(tokenPassword)) {
            log.info("confirmInvite error: token detail id empty");
            return resultMap.fail().message("username or password cannot be empty");
        }

        String[] ids = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        if (ids.length != 3) {
            log.info("confirmInvite error: invalid token username");
            return resultMap.fail().message("Invalid Token");
        }
        Long inviterId = Long.parseLong(ids[0]);
        Long memeberId = Long.parseLong(ids[1]);
        Long orgId = Long.parseLong(ids[2]);

        if (!user.getId().equals(memeberId)) {
            log.info("confirmInvite error: invalid token member, username is wrong");
            return resultMap.fail().message("username is wrong");
        }

        if (!tokenPassword.equals(user.getPassword())) {
            log.info("confirmInvite error: invalid token password");
            return resultMap.fail().message("password is wrong");
        }

        User inviter = userMapper.getById(inviterId);
        if (null == inviter) {
            log.info("confirmInvite error: invalid token inviter");
            return resultMap.fail().message("Invalid Token");
        }

        Organization organization = organizationMapper.getById(orgId);
        if (null == organization) {
            log.info("confirmInvite error: invalid token organization");
            return resultMap.fail().message("Invalid Token");
        }

        RelUserOrganization tokenRel = relUserOrganizationMapper.getRel(inviterId, orgId);
        if (null != tokenRel && tokenRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            log.info("confirmInvite error: invalid token inviter permission");
            return resultMap.fail().message("Invalid Token");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(memeberId, orgId);

        OrganizationInfo organizationInfo = new OrganizationInfo();
        BeanUtils.copyProperties(organization, organizationInfo);
        if (rel != null) {
            organizationInfo.setRole(rel.getRole());
            return resultMap.successAndRefreshToken(request).payload(organizationInfo).message("You have joined the organization and don't need to repeat.");
        }
        //验证通过，建立关联
        rel = new RelUserOrganization(orgId, memeberId, UserOrgRoleEnum.MEMBER.getRole());
        int insert = relUserOrganizationMapper.insert(rel);
        //修改成员人数
        organization.setMemberNum(organization.getMemberNum() + 1);
        int i = organizationMapper.updateMemberNum(organization);

        if (insert > 0 && i >= 0) {
            organizationInfo.setRole(rel.getRole());
            return resultMap.successAndRefreshToken(request).payload(organizationInfo);
        } else {
            return resultMap.failAndRefreshToken(request);
        }
    }

    @Override
    public ResultMap confirmInviteNoLogin(String token) {
        ResultMap resultMap = new ResultMap(tokenUtils);


        //aes解密
        token = AESUtils.decrypt(token, null);

        //验证token(特殊验证，不走util)
        String tokenUserName = tokenUtils.getUsername(token);
        String tokenPassword = tokenUtils.getPassword(token);

        if (StringUtils.isEmpty(tokenUserName) || StringUtils.isEmpty(tokenPassword)) {
            log.info("confirmInvite error: token detail id empty");
            return resultMap.fail().message("Invalid Token");
        }

        String[] ids = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        if (ids.length != 3) {
            log.info("confirmInvite error: invalid token username");
            return resultMap.fail().message("Invalid Token");
        }
        Long inviterId = Long.parseLong(ids[0]);
        Long memeberId = Long.parseLong(ids[1]);
        Long orgId = Long.parseLong(ids[2]);

        User inviter = userMapper.getById(inviterId);
        if (null == inviter) {
            log.info("confirmInvite error: invalid token inviter");
            return resultMap.fail().message("Invalid Token");
        }

        Organization organization = organizationMapper.getById(orgId);
        if (null == organization) {
            log.info("confirmInvite error: invalid token organization");
            return resultMap.fail().message("Invalid Token");
        }

        RelUserOrganization tokenRel = relUserOrganizationMapper.getRel(inviterId, orgId);
        if (null != tokenRel && tokenRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            log.info("confirmInvite error: invalid token inviter permission");
            return resultMap.fail().message("Invalid Token");
        }

        User member = userMapper.getById(memeberId);
        if (null == member) {
            return resultMap.fail().message("user not found");
        }

        RelUserOrganization memberRel = relUserOrganizationMapper.getRel(memeberId, orgId);
        if (null != memberRel) {
            return resultMap.fail().message("you are already in this organzation");
        }

        //验证通过，建立关联
        RelUserOrganization rel = new RelUserOrganization(orgId, memeberId, UserOrgRoleEnum.MEMBER.getRole());
        int insert = relUserOrganizationMapper.insert(rel);
        //修改成员人数
        organization.setMemberNum(organization.getMemberNum() + 1);
        int i = organizationMapper.updateMemberNum(organization);

        if (insert > 0 && i >= 0) {
            return resultMap.success();
        } else {
            return resultMap.fail();
        }
    }

    /**
     * 删除组织成员
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteOrgMember(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelUserOrganization rel = relUserOrganizationMapper.getById(relationId);
        if (null == rel) {
            return resultMap.failAndRefreshToken(request).message("this member are no longer member of the organization");
        }

        Organization organization = organizationMapper.getById(rel.getOrgId());
        if (null == organization) {
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //验证权限，只有owner可以删除
        RelUserOrganization ownerRel = relUserOrganizationMapper.getRel(user.getId(), rel.getOrgId());
        if (null != ownerRel && ownerRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot delete any member of this orgainzation, cause you are not the owner of this orginzation");
        }

        if (organization.getUserId().equals(rel.getUserId())) {
            return resultMap.failAndRefreshToken(request).message("you cannot delete the creator of the organization");
        }

        if (rel.getUserId().equals(user.getId())) {
            return resultMap.failAndRefreshToken(request).message("you cannot delete yourself in this orginzation");
        }

        //删除关联
        int i = relUserOrganizationMapper.deleteById(relationId);

        if (i > 0) {
            //更新组织成员数量
            organization.setMemberNum(organization.getMemberNum() > 0 ? organization.getMemberNum() - 1 : organization.getMemberNum());
            organizationMapper.updateMemberNum(organization);

            List<Long> relUserTeamIds = relUserTeamMapper.getRelUserTeamIds(rel.getUserId(), rel.getOrgId());

            //删除该成员与组织中team的关联关系
            if (null != relUserTeamIds && relUserTeamIds.size() > 0) {
                relUserTeamMapper.deleteBatch(relUserTeamIds);
            }

            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request);
        }
    }

    /**
     * 更改成员角色
     *
     * @param relationId
     * @param user
     * @param role
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateMemberRole(Long relationId, User user, int role, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelUserOrganization rel = relUserOrganizationMapper.getById(relationId);
        if (null == rel) {
            return resultMap.failAndRefreshToken(request).message("this member are no longer member of the organization");
        }

        Organization organization = organizationMapper.getById(rel.getOrgId());
        if (null == organization) {
            log.info("organization(:{}) is not found", organization.getId());
            return resultMap.failAndRefreshToken(request).message("organization is not found");
        }

        //验证权限，只有owner可以更改
        RelUserOrganization ownerRel = relUserOrganizationMapper.getRel(user.getId(), rel.getOrgId());
        if (null != ownerRel && ownerRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot change role of the member in this orgainzation, cause you are not the owner of this orginzation");
        }

        UserOrgRoleEnum userOrgRoleEnum = UserOrgRoleEnum.roleOf(role);
        if (null == userOrgRoleEnum) {
            return resultMap.failAndRefreshToken(request).message("Invalid role : " + role);
        }

        //不可以更改自己的权限
        if (user.getId().equals(rel.getUserId())) {
            return resultMap.failAndRefreshToken(request).message("you cannot change your own role");
        }

        //不需要更改
        if ((int) rel.getRole() == role) {
            return resultMap.failAndRefreshToken(request).message("this member does not need to change role");
        }

        rel.setRole(userOrgRoleEnum.getRole());
        int i = relUserOrganizationMapper.updateMemberRole(rel);
        if (i > 0) {
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request);
        }
    }
}
