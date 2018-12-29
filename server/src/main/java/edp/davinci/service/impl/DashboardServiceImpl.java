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
import edp.core.exception.ServerException;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.dashboardDto.*;
import edp.davinci.model.*;
import edp.davinci.service.DashboardService;
import edp.davinci.service.ShareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service("dashboardService")
public class DashboardServiceImpl extends CommonService<Dashboard> implements DashboardService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DashboardPortalMapper dashboardPortalMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private ShareService shareService;

    @Autowired
    private ExcludeDashboardTeamMapper excludeDashboardTeamMapper;


    @Override
    public synchronized boolean isExist(String name, Long id, Long portalId) {
        Long dashboardId = dashboardMapper.getByNameWithPortalId(name, portalId);
        if (null != id && null != dashboardId) {
            return !id.equals(dashboardId);
        }
        return null != dashboardId && dashboardId.longValue() > 0L;
    }

    /**
     * 获取dashboard列表
     *
     * @param portalId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDashboards(Long portalId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portal = dashboardPortalMapper.getPortalWithProjectById(portalId);
        if (null == portal) {
            return resultMap.failAndRefreshToken(request).message("");
        }

        Project project = portal.getProject();
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard portal");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        return resultMap.successAndRefreshToken(request).payloads(getDashboardListByPortal(portal, user, portal.getProject()));
    }

    /**
     * 获取dashboard下widgets关联信息列表
     *
     * @param portalId
     * @param dashboardId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDashboardMemWidgets(Long portalId, Long dashboardId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);
        if (null == dashboardWithPortalAndProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        DashboardPortal portal = dashboardWithPortalAndProject.getPortal();
        if (null == portal || !portal.getId().equals(portalId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard");
        }

        Project project = dashboardWithPortalAndProject.getProject();
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(project.getOrgId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                    short maxVizPermission = relTeamProjectMapper.getMaxVizPermission(project.getId(), user.getId());
                    if (maxVizPermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        memDashboardWidgets = null;
                    } else if (maxVizPermission == UserPermissionEnum.READ.getPermission()) {
                        if (!portal.getPublish()) {
                            memDashboardWidgets = null;
                        }
                    }
                }
            } else {
                Organization organization = organizationMapper.getById(project.getOrgId());
                if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission() || !portal.getPublish()) {
                    memDashboardWidgets = null;
                }
            }
        }

        DashboardWithMem dashboardWithMem = new DashboardWithMem();
        BeanUtils.copyProperties(dashboardWithPortalAndProject, dashboardWithMem);
        dashboardWithMem.setWidgets(memDashboardWidgets);

        return resultMap.successAndRefreshToken(request).payload(dashboardWithMem);
    }


    /**
     * 新建dashboard
     *
     * @param dashboardCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createDashboard(DashboardCreate dashboardCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(dashboardCreate.getDashboardPortalId());

        if (null == portalWithProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard portal not found");
        }

        Project project = portalWithProject.getProject();

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create dashboard");
        }

        if (isExist(dashboardCreate.getName(), null, dashboardCreate.getDashboardPortalId())) {
            log.info("the dashboard \"{}\" name is already taken", dashboardCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the dashboard name is already taken");
        }

        Dashboard dashboard = new Dashboard();
        BeanUtils.copyProperties(dashboardCreate, dashboard);


        int insert = dashboardMapper.insert(dashboard);
        if (insert > 0) {
            excludeTeamForDashboard(dashboardCreate.getTeamIds(), dashboard.getId(), user.getId(), null);
            return resultMap.successAndRefreshToken(request).payload(dashboard);
        } else {
            return resultMap.failAndRefreshToken(request).message("create dashboard fail");
        }
    }

    /**
     * 修改dashboard
     *
     * @param portalId
     * @param dashboards
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateDashboards(Long portalId, DashboardDto[] dashboards, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(portalId);

        if (null == portalWithProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard portal not found");
        }

        Project project = portalWithProject.getProject();

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create dashboard");
        }

        for (Dashboard dashboard : dashboards) {
            if (!dashboard.getDashboardPortalId().equals(portalId)) {
                return resultMap.failAndRefreshToken(request).message("Invalid dashboard portal id");
            }

            if (isExist(dashboard.getName(), dashboard.getId(), dashboard.getDashboardPortalId())) {
                log.info("the dashboard \"{}\" name is already taken", dashboard.getName());
                return resultMap.failAndRefreshToken(request).message("the dashboard name \"" + dashboard.getName() + "\" is already taken");
            }
        }

        List<Dashboard> dashboardList = new ArrayList<>(Arrays.asList(dashboards));
        int i = dashboardMapper.updateBatch(dashboardList);
        if (i > 0) {
            List<Long> dashBoardIds = dashboardList.stream().map(d -> d.getId()).collect(Collectors.toList());
            List<ExcludeDashboardTeam> excludeDashboardTeams = excludeDashboardTeamMapper.selectExcludesByDashboardIds(dashBoardIds);
            Map<Long, List<Long>> map = new HashMap<>();

            excludeDashboardTeams.forEach(e -> {
                List<Long> teamIds;
                if (map.containsKey(e.getDashboardId())) {
                    teamIds = map.get(e.getDashboardId());
                } else {
                    teamIds = new ArrayList<>();
                    map.put(e.getDashboardId(), teamIds);
                }
                teamIds.add(e.getTeamId());
            });

            Arrays.asList(dashboards).forEach(dashboard -> {
                excludeTeamForDashboard(dashboard.getTeamIds(), dashboard.getId(), user.getId(), map.get(dashboard.getId()));
            });
        }
        return resultMap.successAndRefreshToken(request);
    }


    @Transactional
    protected void excludeTeamForDashboard(List<Long> teamIds, Long dashboardId, Long userId, List<Long> excludeTeams) {

        if (null != excludeTeams && excludeTeams.size() > 0) {
            if (null != teamIds && teamIds.size() > 0) {
                List<Long> rmTeamIds = new ArrayList<>();
                excludeTeams.forEach(teamId -> {
                    if (teamId.longValue() > 0L && !teamIds.contains(teamId)) {
                        rmTeamIds.add(teamId);
                    }
                });
                if (rmTeamIds.size() > 0) {
                    excludeDashboardTeamMapper.deleteByDashboardIdAndTeamIds(dashboardId, rmTeamIds);
                }
            } else {
                //删除所有要排除的项
                excludeDashboardTeamMapper.deleteByDashboardId(dashboardId);
            }
        }

        //添加排除项
        if (null != teamIds && teamIds.size() > 0) {
            List<ExcludeDashboardTeam> list = new ArrayList<>();
            teamIds.forEach(tid -> list.add(new ExcludeDashboardTeam(tid, dashboardId, userId)));
            if (list.size() > 0) {
                excludeDashboardTeamMapper.insertBatch(list);
            }
        }
    }

    /**
     * 删除dashboard
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteDashboard(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(id);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        //校验权限
        if (!allowDelete(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the dashboard{}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the dashboard");
        }

        dashboardMapper.deleteByParentId(id);
        dashboardMapper.deleteById(id);
        excludeDashboardTeamMapper.deleteByDashboardId(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 在dashboard下新建widget关联
     *
     * @param portalId
     * @param dashboardId
     * @param memDashboardWidgetCreates
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createMemDashboardWidget(Long portalId, Long dashboardId, MemDashboardWidgetCreate[] memDashboardWidgetCreates, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        if (!dashboardWithPortalAndProject.getDashboardPortalId().equals(portalId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard");
        }

        //校验权限
        if (!allowWrite(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to do this operation", user.getUsername(), dashboardId);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
        }

        Set<Long> ids = new HashSet<>();
        List<MemDashboardWidget> list = new ArrayList<>();
        for (MemDashboardWidgetCreate memDashboardWidgetCreate : memDashboardWidgetCreates) {

            if (memDashboardWidgetCreate.getPolling() && memDashboardWidgetCreate.getFrequency() < 1) {
                return resultMap.failAndRefreshToken(request).message("Invalid frequency");
            }

            ids.add(memDashboardWidgetCreate.getWidgetId());
            MemDashboardWidget memDashboardWidget = new MemDashboardWidget();
            BeanUtils.copyProperties(memDashboardWidgetCreate, memDashboardWidget);
            list.add(memDashboardWidget);
        }

        List<Widget> widgets = widgetMapper.getByIds(ids);
        if (null == widgets || widgets.size() != ids.size()) {
            return resultMap.failAndRefreshToken(request).message("Invalid widget id");
        }

        for (Widget widget : widgets) {
            if (!widget.getProjectId().equals(dashboardWithPortalAndProject.getProject().getId())) {
                return resultMap.failAndRefreshToken(request).message("Invalid project id");
            }
        }

        int insert = memDashboardWidgetMapper.insertBatch(list);
        if (insert > 0) {
            return resultMap.successAndRefreshToken(request).payload(list);
        } else {
            return resultMap.failAndRefreshToken(request).message("unkown fail");
        }
    }

    /**
     * 修改dashboard下的widget关联信息
     *
     * @param memDashboardWidgets
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateMemDashboardWidgets(MemDashboardWidget[] memDashboardWidgets, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        for (MemDashboardWidget memDashboardWidget : memDashboardWidgets) {
            DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(memDashboardWidget.getDashboardId());

            if (null == dashboardWithPortalAndProject) {
                return resultMap.failAndRefreshToken(request).message("Invalid dashboard id");
            }

            if (!allowWrite(dashboardWithPortalAndProject.getProject(), user)) {
                log.info("user (:{}) have not permission to update memDashboardWidget (:{})", user.getId(), memDashboardWidget.getId());
                return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
            }

            Widget widget = widgetMapper.getById(memDashboardWidget.getWidgetId());
            if (null == widget) {
                return resultMap.failAndRefreshToken(request).message("widget not found");
            }
        }

        List<MemDashboardWidget> list = Arrays.asList(memDashboardWidgets);
        memDashboardWidgetMapper.updateBatch(list);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除dashboard下的widget关联信息
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteMemDashboardWidget(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        MemDashboardWidget memDashboardWidget = memDashboardWidgetMapper.getById(relationId);
        if (null == memDashboardWidget) {
            return resultMap.successAndRefreshToken(request);
        }

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(memDashboardWidget.getDashboardId());

        if (null == dashboardWithPortalAndProject) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard id");
        }

        if (!allowDelete(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user ({}) have not permission to delete memDashboardWidget ({})", user.getId(), memDashboardWidget.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
        }

        memDashboardWidgetMapper.deleteById(relationId);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 分享dashboard
     *
     * @param dashboardId
     * @param username
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap shareDashboard(Long dashboardId, String username, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        //校验权限
        if (!allowShare(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to share the dashboard {}", user.getUsername(), user.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to share the dashboard");
        }

        if (dashboardWithPortalAndProject.getType() == 0) {
            return resultMap.failAndRefreshToken(request).message("dashboard folder cannot be shared");
        }

        try {
            return resultMap.successAndRefreshToken(request).payload(shareService.generateShareToken(dashboardId, username, user.getId()));
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteDashboardAndPortalByProject(Long projectId) throws RuntimeException {
        //删除dashboard与widget关联
        memDashboardWidgetMapper.deleteByProject(projectId);
        //删除dashaboard
        dashboardMapper.deleteByProject(projectId);
        //删除dashboardPortal
        dashboardPortalMapper.deleteByProject(projectId);
    }


    public List<Dashboard> getDashboardListByPortal(DashboardPortal portal, User user, Project project) {

        List<Dashboard> dashboardList = dashboardMapper.getByPortalId(portal.getId(), user.getId(), project.getId());

        if (null != dashboardList && dashboardList.size() > 0) {

            List<Long> idList = dashboardList.stream().map(d -> d.getId()).collect(Collectors.toList());

            Iterator<Dashboard> dashboardIterator = dashboardList.iterator();
            while (dashboardIterator.hasNext()) {
                Dashboard dashboard = dashboardIterator.next();
                if (!dashboard.getParentId().equals(0L) && !idList.contains(dashboard.getParentId())) {
                    dashboardIterator.remove();
                }
            }
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(project.getOrgId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                    short maxVizPermission = relTeamProjectMapper.getMaxVizPermission(project.getId(), user.getId());
                    if (maxVizPermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        dashboardList = null;
                    } else if (maxVizPermission == UserPermissionEnum.READ.getPermission()) {
                        if (!portal.getPublish()) {
                            dashboardList = null;
                        }
                    }
                }
            } else {
                Organization organization = organizationMapper.getById(project.getOrgId());
                if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission() || !portal.getPublish()) {
                    dashboardList = null;
                }
            }
        }

        return dashboardList;
    }

    @Override
    public List<Long> getExcludeTeams(Long id) {
        return excludeDashboardTeamMapper.selectExcludeTeamsByDashboardId(id);
    }
}
