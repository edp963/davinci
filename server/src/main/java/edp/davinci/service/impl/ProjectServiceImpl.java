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

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import edp.core.enums.HttpCodeEnum;
import edp.core.utils.PageUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.dto.projectDto.*;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.model.*;
import edp.davinci.service.DashboardService;
import edp.davinci.service.DisplayService;
import edp.davinci.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service("projectService")
public class ProjectServiceImpl extends CommonService implements ProjectService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    private RelTeamProjectMapper teamProjectMapper;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DisplayService displayService;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private SourceMapper sourceMapper;

    @Autowired
    private StarMapper starMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private FavoriteMapper favoriteMapper;


    @Override
    public synchronized boolean isExist(String name, Long id, Long orgId) {
        Long projectId = projectMapper.getByNameWithOrgId(name, orgId);
        if (null != id && null != projectId) {
            return !id.equals(projectId);
        }
        return null != projectId && projectId.longValue() > 0L;
    }


    @Override
    public ResultMap getProjectInfo(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ProjectWithCreateBy project = projectMapper.getProjectWithUserById(id);

        if (null == project) {
            log.info("project (:{}) is not found", id);
            return resultMap.failAndRefreshToken(request).message("project is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (!isMaintainer(project, user) && null == rel && !project.getVisibility()) {
            log.info("user[{}] don't have permission to get project info", user.getId(), project.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission");
        }

        Star star = starMapper.select(user.getId(), project.getId(), Constants.STAR_TARGET_PROJECT);
        if (null != star) {
            project.setIsStar(true);
        }

        ProjectInfo projectInfo = new ProjectInfo();
        BeanUtils.copyProperties(project, projectInfo);
        setProjectPermission(projectInfo, user);

        return resultMap.successAndRefreshToken(request).payload(projectInfo);
    }

    /**
     * 获取项目列表
     *
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getProjects(User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<ProjectWithCreateBy> projects = projectMapper.getProejctsByUser(user.getId());
        List<ProjectInfo> projectInfoList = new ArrayList<>();
        if (null != projects && projects.size() > 0) {
            for (ProjectWithCreateBy project : projects) {
                ProjectInfo projectInfo = new ProjectInfo();
                BeanUtils.copyProperties(project, projectInfo);
                setProjectPermission(projectInfo, user);
                projectInfoList.add(projectInfo);
            }
        }
        return resultMap.successAndRefreshToken(request).payloads(projectInfoList);
    }

    /**
     * 获取用户对project的权限
     *
     * @param projectInfo
     * @param user
     * @return
     */
    private void setProjectPermission(ProjectInfo projectInfo, User user) {
        ProjectPermission projectPermission = ProjectPermission.previewPermission();
        if (isMaintainer(projectInfo, user)) {
            projectPermission = ProjectPermission.adminPermission();
            projectInfo.setInTeam(true);
        } else {
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectInfo.getOrgId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                projectInfo.setInTeam(true);
                List<UserMaxProjectPermission> permissions = relTeamProjectMapper.getUserMaxPermissions(user.getId());
                for (UserMaxProjectPermission maxProjectPermission : permissions) {
                    if (maxProjectPermission.getProjectId().equals(projectInfo.getId())) {
                        projectPermission = maxProjectPermission;
                    }
                }
            }
        }
        projectInfo.setPermission(projectPermission);
    }

    /**
     * 搜索project
     *
     * @param keywords
     * @param user
     * @param pageNum
     * @param pageSize
     * @param request
     * @return
     */
    @Override
    public ResultMap searchProjects(String keywords, User user, int pageNum, int pageSize, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        if (!PageUtils.checkPageInfo(pageNum, pageSize)) {
            return resultMap.failAndRefreshToken(request).message("Invalid page info");
        }

        List<OrganizationInfo> orgs = organizationMapper.getOrganizationByUser(user.getId());
        if (null == orgs || orgs.size() < 1) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        PageHelper.startPage(pageNum, pageSize);
        List<ProjectWithCreateBy> projects = projectMapper.getProjectsByKewordsWithUser(keywords, user.getId(), orgs);
        PageInfo<ProjectWithCreateBy> pageInfo = new PageInfo<>(projects);

        return resultMap.successAndRefreshToken(request).payload(pageInfo);
    }

    /**
     * 创建项目
     *
     * @param projectCreat
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createProject(ProjectCreat projectCreat, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        if (isExist(projectCreat.getName(), null, projectCreat.getOrgId())) {
            log.info("the project name {} is already taken in this organization", projectCreat.getName());
            return resultMap.failAndRefreshToken(request).message("the project name " + projectCreat.getName() + " is already taken in this organization");
        }

        Organization organization = organizationMapper.getById(projectCreat.getOrgId());
        //校验组织
        if (null == organization) {
            log.info("not found organization, Id: {}", projectCreat.getOrgId());
            return resultMap.failAndRefreshToken(request).message("not found organization");
        }
        if (!organization.getAllowCreateProject()) {
            log.info("project are not allowed to be created under the organization named {}", organization.getName());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("project are not allowed to be created under the organization named " + organization.getName());
        }

        Project project = new Project();
        BeanUtils.copyProperties(projectCreat, project);
        project.setUserId(user.getId());

        int insert = projectMapper.insert(project);
        if (insert > 0) {

            organization.setProjectNum(organization.getProjectNum() + 1);
            organizationMapper.updateProjectNum(organization);

            ProjectInfo projectInfo = new ProjectInfo();
            UserBaseInfo userBaseInfo = new UserBaseInfo();
            BeanUtils.copyProperties(user, userBaseInfo);
            projectInfo.setCreateBy(userBaseInfo);
            BeanUtils.copyProperties(project, projectInfo);
            return resultMap.successAndRefreshToken(request).payload(projectInfo);
        } else {
            log.info("create project fail: {}", projectCreat.toString());
            return resultMap.failAndRefreshToken(request).message("create project fail: unspecified error");
        }
    }

    /**
     * 移交项目
     *
     * @param id
     * @param orgId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap transferPeoject(Long id, Long orgId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(id);

        if (null == project) {
            log.info("project (:{}) is not found", id);
            return resultMap.failAndRefreshToken(request).message("project is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
        //项目的创建人 和 当前项目对应组织的owner可以移交
        if (!isMaintainer(project, user) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            log.info("user[{}] don't have permission to delete transfer[{}]", user.getId(), project.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to transfer this project");
        }

        Organization organization = organizationMapper.getById(orgId);
        if (null == organization) {
            log.info("not found organization, name: {}", orgId);
            return resultMap.failAndRefreshToken(request).message("not found organization");
        }

        //不能移交给当前所在组织
        if (organization.getId().equals(project.getOrgId())) {
            log.info("this project cannot be transferred to the current organization, name: {}", orgId);
            return resultMap.failAndRefreshToken(request).message("the project can only be transferred to the non-current organizations");
        }

        //当前用户在即将移交的组织下才能移交
        RelUserOrganization ucRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == ucRel) {
            log.info("user[{}] must be a member of the organization {} that is about to be transfer", user.getId(), orgId);
            return resultMap.failAndRefreshToken(request).message("you must be a member of the organization " + organization.getName() + " that is about to be transfer");
        }

        if (isExist(project.getName(), null, orgId)) {
            return resultMap.failAndRefreshToken(request).message("the project name \"" + project.getName() + "\" is already in the organization you will transfer");
        }

        Long beforeOrgId = project.getOrgId();
        project.setOrgId(organization.getId());
        int i = projectMapper.changeOrganization(project);
        if (i > 0) {

            boolean isTransfer = true;
            //移交回原组织
            if (project.getInitialOrgId().equals(orgId)) {
                RelUserOrganization projectCreaterRuo = relUserOrganizationMapper.getRel(project.getUserId(), orgId);
                if (null != projectCreaterRuo) {
                    isTransfer = false;
                }
            }
            projectMapper.changeTransferStatus(isTransfer, project.getId());

            Organization beforeOrg = organizationMapper.getById(beforeOrgId);
            beforeOrg.setProjectNum(beforeOrg.getProjectNum() - 1);
            organizationMapper.updateProjectNum(beforeOrg);
            organization.setProjectNum(organization.getProjectNum() + 1);
            organizationMapper.updateProjectNum(organization);
            return resultMap.successAndRefreshToken(request);
        } else {
            log.info("transfer project fail, {} -> {}", project.getOrgId(), organization.getId());
            return resultMap.failAndRefreshToken(request).message("transfer project fail: unspecified error");
        }
    }

    /**
     * 删除project
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteProject(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(id);
        if (null == project) {
            log.info("project(:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("project not found");
        }
        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
        //项目的创建人 和 当前项目对应组织的owner可以删除
        if (!isProjectAdmin(project, user) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            log.info("user({}) don't have permission to delete project({})", user.getId(), project.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to delete this project");
        }

//        if (null != organization && !organization.getAllowDeleteOrTransferProject()) {
//            log.info("project are not allowed to be deleted under the organization named {}", organization.getName());
//            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("project are not allowed to be deleted under the organization named " + organization.getName());
//        }

        //删除displayslide、display、slide和widget的关联
        displayService.deleteSlideAndDisplayByProject(project.getId());

        //删除dashboardPortal、dashbord、 dashboard和widget的关联
        dashboardService.deleteDashboardAndPortalByProject(project.getId());

        //删除widget
        widgetMapper.deleteByProject(project.getId());

        //删除view
        viewMapper.deleteByPorject(project.getId());

        //删除source
        sourceMapper.deleteByProject(project.getId());

        //删除team project 关联
        teamProjectMapper.deleteByProjectId(project.getId());

        //删除project
        int i = projectMapper.deleteById(project.getId());

        Organization organization = organizationMapper.getById(project.getOrgId());
        organization.setProjectNum(organization.getProjectNum() - 1);
        organizationMapper.updateProjectNum(organization);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 更新项目基本信息
     *
     * @param id
     * @param projectUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateProject(Long id, ProjectUpdate projectUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(id);

        if (null == project) {
            log.info("project (:{}) not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
        //项目的创建人 和 当前项目对应组织的owner可以修改
        if (!isProjectAdmin(project, user) && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
            log.info("user({}) don't have permission to update project({})", user.getId(), project.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you don't have permission to update this project");
        }

        project.setName(projectUpdate.getName());
        project.setDescription(projectUpdate.getDescription());
        project.setVisibility(projectUpdate.getVisibility());

        int i = projectMapper.updateBaseInfo(project);
        if (i > 0) {
            return resultMap.successAndRefreshToken(request);
        } else {
            log.info("update project fail, {}", project.toString());
            return resultMap.failAndRefreshToken(request).message("update project fail: unspecified error");
        }
    }

    /**
     * 收藏project
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap favoriteProject(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(id);

        if (null == project) {
            log.info("project (:{}) not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
        if (null == rel || !allowRead(project, user)) {
            log.info("user({}) cannot favorite project({})", user.getId(), project.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Unauthorized: you can't favorite this project");
        }

        int insert = favoriteMapper.insert(new Favorite(user.getId(), project.getId()));
        return resultMap.successAndRefreshToken(request);
    }


    @Override
    public ResultMap getFavoriteProjects(User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<ProjectWithCreateBy> projects = projectMapper.getFavoriteProjects(user.getId());
        List<ProjectInfo> projectInfoList = new ArrayList<>();
        if (null != projects && projects.size() > 0) {
            for (ProjectWithCreateBy project : projects) {
                ProjectInfo projectInfo = new ProjectInfo();
                BeanUtils.copyProperties(project, projectInfo);
                setProjectPermission(projectInfo, user);
                projectInfoList.add(projectInfo);
            }
        }
        return resultMap.successAndRefreshToken(request).payloads(projectInfoList);
    }

    @Override
    @Transactional
    public ResultMap removeFavoriteProjects(User user, Long[] projectIds, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        favoriteMapper.deleteBatch(Arrays.asList(projectIds), user.getId());
        return resultMap.successAndRefreshToken(request);
    }
}
