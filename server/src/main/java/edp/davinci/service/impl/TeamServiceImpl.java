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
import edp.core.enums.HttpCodeEnum;
import edp.core.utils.FileUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.projectDto.ProjectWithOrganization;
import edp.davinci.dto.teamDto.*;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.dto.userDto.UserWithTeamId;
import edp.davinci.dto.userDto.UserWithTeamRole;
import edp.davinci.model.*;
import edp.davinci.service.TeamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.conditionSeparator;

@Slf4j
@Service("teamService")
public class TeamServiceImpl implements TeamService {

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private TeamMapper teamMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private ProjectMapper projectMapper;


    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private FileUtils fileUtils;


    @Override
    public synchronized boolean isExist(String name, Long id, Long orgId) {
        Long teamId = teamMapper.getByNameWithOrgId(name, orgId);
        if (null != id && null != teamId) {
            return !id.equals(teamId);
        }
        return null != teamId && teamId.longValue() > 0L;
    }

    /**
     * 创建团队
     *
     * @param teamCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createTeam(TeamCreate teamCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //校验是否存在
        if (isExist(teamCreate.getName(), null, teamCreate.getOrgId())) {
            log.info("the team name {} is already taken in this organzation", teamCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the team name " + teamCreate.getName() + " is already taken in this organzation");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), teamCreate.getOrgId());

        //当前用户在父级team中的角色
        RelUserTeam relUserTeam = null;
        if (null != teamCreate.getParentTeamId() && teamCreate.getParentTeamId() > 0L) {
            relUserTeam = relUserTeamMapper.getRel(user.getId(), teamCreate.getParentTeamId());
        }

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to  create team in this organization");
        }

        Team team = new Team();
        BeanUtils.copyProperties(teamCreate, team);
        int insert = teamMapper.insert(team);
        //添加成功，建立关联
        if (insert > 0) {
            teamMapper.updateFullTeamById(team.getId());
            RelUserTeam rel = new RelUserTeam(team.getId(), user.getId(), UserTeamRoleEnum.MAINTAINER.getRole());
            int insertRel = relUserTeamMapper.insert(rel);
            if (insertRel > 0) {
                Organization organization = organizationMapper.getById(teamCreate.getOrgId());
                organization.setTeamNum(organization.getTeamNum() + 1);

                organizationMapper.updateTeamNum(organization);

                TeamWithMembers teamWithMembers = new TeamWithMembers();
                BeanUtils.copyProperties(team, teamWithMembers);

                UserBaseInfo userBaseInfo = new UserBaseInfo();
                BeanUtils.copyProperties(user, userBaseInfo);

                teamWithMembers.setUsers(Arrays.asList(userBaseInfo));
                return resultMap.successAndRefreshToken(request).payload(teamWithMembers);
            } else {
                throw new RuntimeException("create user team relation error");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("create team fail");
        }

    }

    /**
     * 更改团队
     *
     * @param id
     * @param teamPut
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateTeam(Long id, TeamPut teamPut, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("the current team is not exist");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team中的角色
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), id);

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update this team");
        }

        BeanUtils.copyProperties(teamPut, team);
        if (teamMapper.update(team) > 0) {
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request);
        }
    }

    /**
     * 上传团队头像
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

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team中的角色
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), id);

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to  change avatar of the team");
        }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = user.getUsername() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.TEAM_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(avatar)) {
                return resultMap.failAndRefreshToken(request).message("team avatar upload error");
            }
        } catch (Exception e) {
            log.error("uploadAvatar: team({}) avatar upload error, error: {}", team.getName(), e.getMessage());
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message("team avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(team.getAvatar())) {
            fileUtils.remove(team.getAvatar());
        }

        //修改头像
        team.setAvatar(avatar);

        int i = teamMapper.updateAvatar(team);
        if (i > 0) {
            Map<String, String> map = new HashMap<>();
            map.put("avatar", avatar);
            return resultMap.successAndRefreshToken(request).payload(map);
        } else {
            return resultMap.failAndRefreshToken(request).message("server error, team avatar update fail");
        }
    }

    /**
     * 删除团队
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteTeam(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team中的角色
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), id);

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete this team");
        }

        List<RelTeamProject> relTeamProjects = relTeamProjectMapper.getRelsByTeamId(id);
        if (null != relTeamProjects && relTeamProjects.size() > 0) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot delete this team, cause this team has at least one project");
        }


        //删除关联
        relUserTeamMapper.deleteByTeamId(id);

        Organization organization = organizationMapper.getById(team.getOrgId());
        //删除team
        teamMapper.deleteById(id);
        organizationMapper.updateTeamNum(organization);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 获取团队成员列表
     *
     * @param id
     * @param request
     * @return
     */
    @Override
    public ResultMap getTeamMembers(Long id, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        List<TeamMember> teamMembers = teamMapper.getTeamMembers(id);

        return resultMap.successAndRefreshToken(request).payloads(teamMembers);
    }


    /**
     * 删除团队成员
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteRelation(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelUserTeam rel = relUserTeamMapper.getById(relationId);

        Team team = teamMapper.getById(rel.getTeamId());

        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team中的角色
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), team.getId());

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to  remove the member in this team");
        }

        if (null == rel) {
            return resultMap.failAndRefreshToken(request).message("this member is no longer members of the team");
        }

        if (user.getId().equals(rel.getUserId())) {
            return resultMap.failAndRefreshToken(request).message("you cannot remove you self from this team");
        }

        relUserTeamMapper.deleteById(relationId);

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 获取团队详情，携带所有关联team结构
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getTeamDetail(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);

        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }


        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        RelUserTeam rel = relUserTeamMapper.getRel(user.getId(), id);
//        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
//                (null == rel || rel.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
//            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
//        }

        TeamDetail teamDetail = new TeamDetail();
        BeanUtils.copyProperties(team, teamDetail);
        teamDetail.setRole(null == rel ? (short) -1 : rel.getRole());

        Organization organization = organizationMapper.getById(team.getOrgId());
        TeamOrgBaseInfo teamOrgBaseInfo = new TeamOrgBaseInfo();
        BeanUtils.copyProperties(organization, teamOrgBaseInfo);
        teamDetail.setOrganization(teamOrgBaseInfo);

        List<TeamInfoWithParentId> parents = teamMapper.getAllParentByTeamId(id);

        TeamParent teamParent = null;
        if (null != parents) {
            //构造父子团队
            Map<Long, TeamParent> map = new HashMap<>();
            for (TeamInfoWithParentId teamInfoWithParentId : parents) {
                TeamParent teamParentDto = new TeamParent();
                BeanUtils.copyProperties(teamInfoWithParentId, teamParentDto);
                map.put(teamParentDto.getId(), teamParentDto);
            }

            for (TeamInfoWithParentId teamInfoWithParentId : parents) {
                if (null == teamInfoWithParentId.getParentId() || teamInfoWithParentId.getParentId().longValue() == 0L) {
                    //顶级
                    teamParent = map.get(teamInfoWithParentId.getId());
                } else {
                    //子级
                    if (null != map.get(teamInfoWithParentId.getParentId())) {
                        map.get(teamInfoWithParentId.getParentId()).setChild(map.get(teamInfoWithParentId.getId()));
                    }
                }
            }
            teamDetail.setParents(teamParent);
        }

        return resultMap.successAndRefreshToken(request).payload(teamDetail);
    }

    /**
     * 获取子团队列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getChildTeams(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        List<TeamBaseInfoWithParent> childTeams = teamMapper.getChildTeams(id);

        if (null != childTeams && childTeams.size() > 0) {
            List<UserWithTeamId> childTeamMemberList = relUserTeamMapper.getChildTeamMembers(id);

            Iterator<TeamBaseInfoWithParent> iterator = childTeams.iterator();
            while (iterator.hasNext()) {
                TeamBaseInfoWithParent child = iterator.next();

                if (child.getId().equals(id)) {
                    iterator.remove();
                }

                //当前team的直接子节点作为根节点
                if (null != child.getParentTeamId() && child.getParentTeamId().equals(id)) {
                    child.setParentTeamId(null);
                }

                List<UserBaseInfo> userList = null;
                if (null != childTeamMemberList && childTeamMemberList.size() > 0) {
                    userList = new ArrayList<>();
                    for (UserWithTeamId userWithTeamId : childTeamMemberList) {
                        if (userWithTeamId.getTeamId().equals(child.getId())) {
                            UserBaseInfo userBaseInfo = new UserBaseInfo();
                            BeanUtils.copyProperties(userWithTeamId, userBaseInfo);
                            userList.add(userBaseInfo);
                        }
                    }
                }
                child.setUsers(userList);
            }
        }
        return resultMap.successAndRefreshToken(request).payloads(getStructuredList(childTeams, null));
    }


    /**
     * 获取团队项目列表
     *
     * @param id
     * @param request
     * @return
     */
    @Override
    public ResultMap getTeamProjects(Long id, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<RelTeamProject> relTeamProjectList = relTeamProjectMapper.getRelsByTeamId(id);

        List<TeamProject> teamProjectList = null;
        if (null != relTeamProjectList && relTeamProjectList.size() > 0) {

            teamProjectList = new ArrayList<>();
            for (RelTeamProject rel : relTeamProjectList) {
                TeamProject teamProject = new TeamProject();
                BeanUtils.copyProperties(rel, teamProject);

                Project project = projectMapper.getById(rel.getProjectId());
                teamProject.setProject(project);

                teamProjectList.add(teamProject);
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(teamProjectList);
    }


    /**
     * 更改团队项目权限
     *
     * @param relationId
     * @param relTeamProjectDto
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateTeamProjectPermission(Long relationId, RelTeamProjectDto relTeamProjectDto, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelTeamProject relTeamProject = relTeamProjectMapper.getById(relationId);

        if (null == relTeamProject) {
            return resultMap.failAndRefreshToken(request).message("there is no any project in this team");
        }

        Team team = teamMapper.getById(relTeamProject.getTeamId());
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        /**
         * 验证权限， 当前team所属organization的owner 或 直接父级team的matainner有权创建
         */
        //当前用户在team所属organizaion中的角色
        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team中的角色
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), team.getId());

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot change permission, cause you are not maintainer of this team");
        }

        BeanUtils.copyProperties(relTeamProjectDto, relTeamProject);

        //校验数据
        UserPermissionEnum sourceP = UserPermissionEnum.permissionOf(relTeamProject.getSourcePermission());
        if (null == sourceP) {
            return resultMap.failAndRefreshToken(request).message("Invalid sourcePermission: " + relTeamProject.getSourcePermission());
        }

        UserPermissionEnum viewP = UserPermissionEnum.permissionOf(relTeamProject.getViewPermission());
        if (null == viewP) {
            return resultMap.failAndRefreshToken(request).message("Invalid viewPermission: " + relTeamProject.getViewPermission());
        }

        UserPermissionEnum widgetP = UserPermissionEnum.permissionOf(relTeamProject.getWidgetPermission());
        if (null == widgetP) {
            return resultMap.failAndRefreshToken(request).message("Invalid widgetPermission: " + relTeamProject.getWidgetPermission());
        }

        UserPermissionEnum vizP = UserPermissionEnum.permissionOf(relTeamProject.getVizPermission());
        if (null == vizP) {
            return resultMap.failAndRefreshToken(request).message("Invalid vizPermission: " + relTeamProject.getVizPermission());
        }

        UserPermissionEnum scheduleP = UserPermissionEnum.permissionOf(relTeamProject.getSchedulePermission());
        if (null == scheduleP) {
            return resultMap.failAndRefreshToken(request).message("Invalid schedulePermission: " + relTeamProject.getSchedulePermission());
        }

        relTeamProjectMapper.update(relTeamProject);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 移除团队项目
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteTeamProject(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelTeamProject relTeamProject = relTeamProjectMapper.getById(relationId);

        if (null == relTeamProject) {
            return resultMap.failAndRefreshToken(request).message("not found the project in this team");
        }

        Team team = teamMapper.getById(relTeamProject.getTeamId());
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        //校验权限，当前team的organization的owner、team的maintainer
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team结构中的最大权限
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), team.getId());

        if ((null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot delete this team, cause you are not maintainer of this team");
        }

        //删除关联
        relTeamProjectMapper.delete(relationId);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 修改团队成员权限
     *
     * @param relationId
     * @param role
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateTeamMemberRole(Long relationId, Integer role, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        RelUserTeam rel = relUserTeamMapper.getById(relationId);
        if (null == rel) {
            return resultMap.failAndRefreshToken(request).message("this member is no longer members of the team");
        }

        Team team = teamMapper.getById(rel.getTeamId());
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team is not found");
        }

        //校验权限，当前team的organization的owner、team的maintainer
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());

        //当前用户在team结构中的最大权限
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), team.getId());

        if ((null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you cannot change member role, cause you are not maintainer of this team");
        }

        User member = userMapper.getById(rel.getUserId());
        if (null == member) {
            return resultMap.failAndRefreshToken(request).message("not found member");
        }

        UserTeamRoleEnum userTeamRoleEnum = UserTeamRoleEnum.roleOf(role);
        if (null == userTeamRoleEnum) {
            return resultMap.failAndRefreshToken(request).message("Invalid role: " + role);
        }

        rel.setRole(userTeamRoleEnum.getRole());

        int i = relUserTeamMapper.update(rel);
        if (i > 0) {
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request);
        }
    }

    /**
     * 给team中添加project
     *
     * @param id
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap addProject(Long id, Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team not found");
        }

        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), id);

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to add project to the team");
        }

        Project project = projectMapper.getById(projectId);
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        RelTeamProject relTeamProject = new RelTeamProject(id, projectId);
        int insert = relTeamProjectMapper.insert(relTeamProject);
        if (insert > 0) {
            TeamProject teamProject = new TeamProject();
            BeanUtils.copyProperties(relTeamProject, teamProject);
            teamProject.setProject(project);
            return resultMap.successAndRefreshToken(request).payload(teamProject);
        } else {
            return resultMap.failAndRefreshToken(request).message("unkown fail");
        }
    }

    /**
     * 查询用户相关的所有可见团队
     *
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getTeams(User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);
        List<MyTeam> myTeams = teamMapper.getMyTeams(user.getId());
        return resultMap.successAndRefreshToken(request).payloads(myTeams);
    }


    /**
     * 添加成员到团队
     *
     * @param id
     * @param memberId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap addTeamMember(Long id, Long memberId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Team team = teamMapper.getById(id);
        if (null == team) {
            return resultMap.failAndRefreshToken(request).message("team not found");
        }

        RelUserOrganization relUserOrg = relUserOrganizationMapper.getRel(user.getId(), team.getOrgId());
        RelUserTeam relUserTeam = relUserTeamMapper.getRel(user.getId(), id);

        if ((null == relUserOrg || relUserOrg.getRole() == UserOrgRoleEnum.MEMBER.getRole()) &&
                (null == relUserTeam || relUserTeam.getRole() == UserTeamRoleEnum.MEMBER.getRole())) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to add member to the team");
        }

        User member = userMapper.getById(memberId);
        if (null == member) {
            return resultMap.failAndRefreshToken(request).message("member not found");
        }

        RelUserOrganization relMemberOrg = relUserOrganizationMapper.getRel(memberId, team.getOrgId());
        if (null == relMemberOrg) {
            return resultMap.failAndRefreshToken(request).message("this user is not a member of the organization of this team");
        }

        RelUserTeam rel = new RelUserTeam(team.getId(), memberId, UserTeamRoleEnum.MEMBER.getRole());
        int insert = relUserTeamMapper.insert(rel);
        if (insert > 0) {
            UserWithTeamRole userWithTeamRole = new UserWithTeamRole();
            BeanUtils.copyProperties(member, userWithTeamRole);
            userWithTeamRole.setRole(rel.getRole());
            return resultMap.successAndRefreshToken(request).payload(new TeamMember(rel.getId(), userWithTeamRole));
        } else {
            return resultMap.failAndRefreshToken(request).message("create team fail");
        }

    }

    @Override
    public ResultMap getTeamsByProject(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(projectId);
        if (null == projectWithOrganization) {
            return resultMap.successAndRefreshToken(request).payloads(null);
        }

        Set<Long> rootIds = getRootTeamIds(user.getId(), projectId);
        if (null == rootIds || rootIds.size() == 0) {
            return resultMap.successAndRefreshToken(request).payloads(null);
        }

        List<TeamWithMembers> structuredList = new ArrayList<>();
        if (rootIds.size() > 0) {
            List<TeamBaseInfoWithParent> list = teamMapper.getTeamsByOrgId(projectWithOrganization.getOrgId());
            Map<Long, List<TeamWithMembers>> childMap = getChildMap(list, rootIds);
            structuredList = getChildsByMap(childMap, null);
        }

        return resultMap.successAndRefreshToken(request).payloads(structuredList);
    }


    public Set<Long> getRootTeamIds(Long userId, Long projectId) {
        List<TeamFullId> teamFullIds = relUserTeamMapper.selectTeamFullParentByUserAndProject(userId, projectId);

        if (null == teamFullIds || teamFullIds.size() == 0) {
            return null;
        }

        Set<Long> rootIds = new HashSet<>();
        Set<Long> teamIds = new HashSet<>();
        Map<Long, Set<Long>> teamFullParentsMap = new HashMap<>();

        teamFullIds.forEach(t -> {
            teamIds.add(t.getId());
            if (StringUtils.isEmpty(t.getFullTeamId())) {
                rootIds.add(t.getId());
            } else {
                List<String> list = Arrays.asList(t.getFullTeamId().trim().split(conditionSeparator));
                if (null != list && list.size() > 0) {
                    Set<Long> collect = list.stream()
                            .filter(s -> !String.valueOf(t.getId()).equals(s))
                            .map(s -> Long.parseLong(s))
                            .collect(Collectors.toSet());

                    teamFullParentsMap.put(t.getId(), collect);
                } else {
                    rootIds.add(t.getId());
                }
            }
        });

        teamIds.forEach(teamId -> {
            if (teamFullParentsMap.containsKey(teamId)) {
                Set<Long> parentIds = teamFullParentsMap.get(teamId);
                if (Collections.disjoint(parentIds, teamIds)) {
                    rootIds.add(teamId);
                }
            }
        });
        return rootIds;
    }


    @Override
    public List<TeamWithMembers> getStructuredList(List<TeamBaseInfoWithParent> list, Long parentId) {
        List<TeamWithMembers> teamWithMembersList = new ArrayList<>();
        if (null != list && list.size() > 0) {
            Set<Long> roots = null;
            if (null != parentId && parentId.longValue() > 0L) {
                roots = new HashSet<>();
                roots.add(parentId);
            }
            Map<Long, List<TeamWithMembers>> childMap = getChildMap(list, roots);
            teamWithMembersList = getChildsByMap(childMap, null);
        }
        return teamWithMembersList;
    }

    public Map<Long, List<TeamWithMembers>> getChildMap(List<TeamBaseInfoWithParent> list, Set<Long> roots) {
        if (null != list && list.size() > 0) {
            Map<Long, List<TeamWithMembers>> childMap = new HashMap<>();

            if (null != roots && roots.size() > 0) {
                List<TeamBaseInfoWithParent> filter = list.stream().filter(t -> {
                    if (StringUtils.isEmpty(t.getFullTeamId())) {
                        return false;
                    } else {
                        Set<Long> fullIds = new HashSet<>();
                        Arrays.asList(t.getFullTeamId().split(conditionSeparator))
                                .forEach(s -> fullIds.add(Long.parseLong(s)));

                        if (!Collections.disjoint(fullIds, roots)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }).collect(Collectors.toList());

                Iterator<TeamBaseInfoWithParent> iterator = filter.iterator();
                while (iterator.hasNext()) {
                    TeamBaseInfoWithParent team = iterator.next();
                    if (roots.contains(team.getId())) {
                        team.setParentTeamId(null);
                    }
                }
                list = filter;
            }

            list.forEach(t -> {
                TeamWithMembers teamWithMembers = new TeamWithMembers();
                BeanUtils.copyProperties(t, teamWithMembers);

                List<TeamWithMembers> childList;
                if (childMap.containsKey(t.getParentTeamId())) {
                    childList = childMap.get(t.getParentTeamId());
                } else {
                    childList = new ArrayList<>();
                    childMap.put(t.getParentTeamId(), childList);
                }
                childList.add(teamWithMembers);
            });
            return childMap;
        }
        return null;
    }


    public List<TeamWithMembers> getStructuredList(Map<Long, List<TeamWithMembers>> childMap, Long parentId) {
        if (null != childMap) {
            return getChildsByMap(childMap, parentId);
        }
        return null;
    }

    private List<TeamWithMembers> getChildsByMap(Map<Long, List<TeamWithMembers>> map, Long parentId) {
        List<TeamWithMembers> childList = map.get(parentId);
        if (null == childList) {
            return null;
        }

        for (TeamWithMembers child : childList) {
            child.setChildren(getChildsByMap(map, child.getId()));
        }

        return childList;
    }
}
