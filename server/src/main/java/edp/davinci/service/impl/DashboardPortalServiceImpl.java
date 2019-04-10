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

import edp.core.enums.HttpCodeEnum;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.DashboardMapper;
import edp.davinci.dao.DashboardPortalMapper;
import edp.davinci.dao.ExcludePortalTeamMapper;
import edp.davinci.dao.ProjectMapper;
import edp.davinci.dto.dashboardDto.DashboardPortalCreate;
import edp.davinci.dto.dashboardDto.DashboardPortalUpdate;
import edp.davinci.dto.dashboardDto.PortalWithProject;
import edp.davinci.dto.projectDto.ProjectWithOrganization;
import edp.davinci.model.*;
import edp.davinci.service.DashboardPortalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service("dashboardPortalService")
@Slf4j
public class DashboardPortalServiceImpl extends CommonService<DashboardPortal> implements DashboardPortalService {


    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private DashboardPortalMapper dashboardPortalMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private ExcludePortalTeamMapper excludePortalTeamMapper;

    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
        Long portalId = dashboardPortalMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != portalId) {
            return id.longValue() != portalId.longValue();
        }
        return null != portalId && portalId.longValue() > 0L;
    }

    /**
     * 获取DashboardPortal列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDashboardPortals(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(projectId);

        if (null == projectWithOrganization) {
            log.info("project {} not found", projectWithOrganization);
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(projectWithOrganization, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<DashboardPortal> dashboardPortals = dashboardPortalMapper.getByProject(projectId, user.getId());

        if (null != dashboardPortals && dashboardPortals.size() > 0) {
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), projectWithOrganization.getOrgId());
            if (!isProjectAdmin(projectWithOrganization, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                    Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectWithOrganization.getOrgId(), user.getId());
                    if (teamNumOfOrgByUser > 0) {
                        short maxVizPermission = relTeamProjectMapper.getMaxVizPermission(projectId, user.getId());
                        if (maxVizPermission == UserPermissionEnum.HIDDEN.getPermission()) {
                            dashboardPortals = null;
                        } else if (maxVizPermission == UserPermissionEnum.READ.getPermission()) {
                            Iterator<DashboardPortal> iterator = dashboardPortals.iterator();
                            while (iterator.hasNext()) {
                                DashboardPortal dashboardPortal = iterator.next();
                                if (!dashboardPortal.getPublish()) {
                                    iterator.remove();
                                }
                            }
                        }
                    } else {
                        Organization organization = projectWithOrganization.getOrganization();
                        if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission()) {
                            dashboardPortals = null;
                        }
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(dashboardPortals);
    }

    /**
     * 新建DashboardPortal
     *
     * @param dashboardPortalCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createDashboardPortal(DashboardPortalCreate dashboardPortalCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(dashboardPortalCreate.getProjectId());
        if (null == project) {
            log.info("project (:{}) not found", dashboardPortalCreate.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create widget", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create widget");
        }

        if (isExist(dashboardPortalCreate.getName(), null, dashboardPortalCreate.getProjectId())) {
            log.info("the dashboardPortal \"{}\" name is already taken", dashboardPortalCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the dashboardPortal name is already taken");
        }

        DashboardPortal dashboardPortal = new DashboardPortal();
        BeanUtils.copyProperties(dashboardPortalCreate, dashboardPortal);

        int insert = dashboardPortalMapper.insert(dashboardPortal);
        if (insert > 0) {
            excludeTeamForPortal(dashboardPortalCreate.getTeamIds(), dashboardPortal.getId(), user.getId(), null);
            return resultMap.successAndRefreshToken(request).payload(dashboardPortal);
        } else {
            return resultMap.failAndRefreshToken(request).message("create dashboardPortal fail");
        }
    }


    /**
     * 更新DashboardPortal
     *
     * @param dashboardPortalUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateDashboardPortal(DashboardPortalUpdate dashboardPortalUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(dashboardPortalUpdate.getId());
        if (null == portalWithProject) {
            return resultMap.failAndRefreshToken(request).message("dashboardPortal not found");
        }

        Project project = portalWithProject.getProject();
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create widget", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create widget");
        }

        if (isExist(dashboardPortalUpdate.getName(), dashboardPortalUpdate.getId(), project.getId())) {
            log.info("the dashboardPortal \"{}\" name is already taken", dashboardPortalUpdate.getName());
            return resultMap.failAndRefreshToken(request).message("the dashboardPortal name is already taken");
        }

        DashboardPortal dashboardPortal = new DashboardPortal();
        BeanUtils.copyProperties(dashboardPortalUpdate, dashboardPortal);
        dashboardPortal.setProjectId(project.getId());

        int update = dashboardPortalMapper.update(dashboardPortal);
        if (update > 0) {
            List<Long> excludeTeams = excludePortalTeamMapper.selectExcludeTeamsByPortalId(dashboardPortal.getId());
            excludeTeamForPortal(dashboardPortalUpdate.getTeamIds(), dashboardPortal.getId(), user.getId(), excludeTeams);
            return resultMap.successAndRefreshToken(request).payload(dashboardPortal);
        } else {
            return resultMap.failAndRefreshToken(request).message("update dashboardPortal fail");
        }
    }


    @Override
    public List<Long> getExcludeTeams(Long id) {
        return excludePortalTeamMapper.selectExcludeTeamsByPortalId(id);
    }

    @Transactional
    protected void excludeTeamForPortal(List<Long> teamIds, Long portalId, Long userId, List<Long> excludeTeams) {
        if (null != excludeTeams && excludeTeams.size() > 0) {
            //已存在排除项
            if (null != teamIds && teamIds.size() > 0) {
                List<Long> rmTeamIds = new ArrayList<>();

                //对比要修改的项，删除不在要修改项中的排除项
                excludeTeams.forEach(teamId -> {
                    if (teamId.longValue() > 0L && !teamIds.contains(teamId)) {
                        rmTeamIds.add(teamId);
                    }
                });
                if (rmTeamIds.size() > 0) {
                    excludePortalTeamMapper.deleteByPortalIdAndTeamIds(portalId, rmTeamIds);
                }
            } else {
                //删除所有要排除的项
                excludePortalTeamMapper.deleteByPortalId(portalId);
            }
        }

        //添加排除项
        if (null != teamIds && teamIds.size() > 0) {
            List<ExcludePortalTeam> list = new ArrayList<>();
            teamIds.forEach(tid -> {
                list.add(new ExcludePortalTeam(tid, portalId, userId));
            });
            if (list.size() > 0) {
                excludePortalTeamMapper.insertBatch(list);
            }
        }
    }


    /**
     * 删除DashboardPortal
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteDashboardPortal(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(id);

        if (null == portalWithProject) {
            log.info("dashboardPortal (:{}) not found", id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("dashboardPortal not found");
        }

        //校验权限
        if (!allowDelete(portalWithProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the dashboardPortal {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the dashboardPortal");
        }

        dashboardMapper.deleteByPortalId(id);
        int i = dashboardPortalMapper.deleteById(id);
        if (i > 0) {
            excludePortalTeamMapper.deleteByPortalId(id);
        }

        return resultMap.successAndRefreshToken(request);
    }
}
