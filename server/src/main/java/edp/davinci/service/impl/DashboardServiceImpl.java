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
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.dashboardDto.*;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.model.*;
import edp.davinci.service.DashboardService;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.COMMA;

@Slf4j
@Service("dashboardService")
public class DashboardServiceImpl implements DashboardService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DashboardPortalMapper dashboardPortalMapper;

    @Autowired
    private RelRolePortalMapper relRolePortalMapper;

    @Autowired
    private RelRoleDashboardMapper relRoleDashboardMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private ShareService shareService;


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
     * @return
     */
    @Override
    public List<Dashboard> getDashboards(Long portalId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        DashboardPortal dashboardPortal = dashboardPortalMapper.getById(portalId);
        if (dashboardPortal == null) {
            return null;
        }

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(dashboardPortal.getProjectId(), user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        boolean isDisable = relRolePortalMapper.isDisable(dashboardPortal.getId(), user.getId());

        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            return null;
        }

        List<Dashboard> dashboardList = dashboardMapper.getByPortalId(portalId);

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), portalId);

        if (CollectionUtils.isEmpty(disableDashboards)) {
            return dashboardList;
        }

        Iterator<Dashboard> iterator = dashboardList.iterator();
        while (iterator.hasNext()) {
            Dashboard dashboard = iterator.next();
            if (!projectPermission.isProjectMaintainer() && disableDashboards.contains(dashboard.getId())) {
                iterator.remove();
            }
        }

        return dashboardList;
    }

    /**
     * 获取dashboard下widgets关联信息列表
     *
     * @param portalId
     * @param dashboardId
     * @param user
     * @return
     */
    @Override
    public DashboardWithMem getDashboardMemWidgets(Long portalId, Long dashboardId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Dashboard dashboard = dashboardMapper.getById(dashboardId);
        if (null == dashboard) {
            throw new NotFoundException("dashboard is not found");
        }

        DashboardPortal portal = dashboardPortalMapper.getById(dashboard.getDashboardPortalId());
        if (null == portal || !portal.getId().equals(portalId)) {
            throw new ServerException("Invalid dashboard");
        }

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(portal.getProjectId(), user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        boolean isDisable = relRolePortalMapper.isDisable(portalId, user.getId());

        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            return null;
        }

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), portalId);

        if (!CollectionUtils.isEmpty(disableDashboards)) {
            Iterator<MemDashboardWidget> iterator = memDashboardWidgets.iterator();
            while (iterator.hasNext()) {
                MemDashboardWidget memDashboardWidget = iterator.next();
                if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() && disableDashboards.contains(memDashboardWidget.getDashboardId())) {
                    iterator.remove();
                }
            }
        }

        Set<Long> widgetIds = memDashboardWidgets.stream().map(MemDashboardWidget::getWidgetId).collect(Collectors.toSet());
        Set<View> views = new HashSet<>();
        if (!CollectionUtils.isEmpty(widgetIds)) {
            views = viewMapper.selectByWidgetIds(widgetIds);
        }


        DashboardWithMem dashboardWithMem = new DashboardWithMem();
        BeanUtils.copyProperties(dashboard, dashboardWithMem);
        dashboardWithMem.setWidgets(memDashboardWidgets);
        dashboardWithMem.setViews(views);

        return dashboardWithMem;
    }


    /**
     * 新建dashboard
     *
     * @param dashboardCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Dashboard createDashboard(DashboardCreate dashboardCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        DashboardPortal dashboardPortal = dashboardPortalMapper.getById(dashboardCreate.getDashboardPortalId());
        if (dashboardPortal == null) {
            throw new NotFoundException("the dashboard portal is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardPortal.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(dashboardCreate.getDashboardPortalId(), user.getId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to create dashboard");
        }

        if (isExist(dashboardCreate.getName(), null, dashboardCreate.getDashboardPortalId())) {
            log.info("the dashboard \"{}\" name is already taken", dashboardCreate.getName());
            throw new ServerException("the dashboard name is already taken");
        }

        Dashboard dashboard = new Dashboard().createdBy(user.getId());
        BeanUtils.copyProperties(dashboardCreate, dashboard);

        if (null != dashboard.getParentId() && dashboard.getParentId() > 0L) {
            String fullParentId = dashboardMapper.getFullParentId(dashboard.getParentId());
            dashboard.setFullParentId(StringUtils.isEmpty(fullParentId) ? dashboard.getParentId().toString() : dashboard.getParentId() + COMMA + fullParentId);
        }

        int insert = dashboardMapper.insert(dashboard);
        if (insert > 0) {
            optLogger.info("dashboard ({}) is create by (:{})", dashboard.toString(), user.getId());
            if (!CollectionUtils.isEmpty(dashboardCreate.getRoleIds())) {
                List<Role> roles = roleMapper.getRolesByIds(dashboardCreate.getRoleIds());

                List<RelRoleDashboard> list = roles.stream()
                        .map(r -> new RelRoleDashboard(dashboard.getId(), r.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());

                if (!CollectionUtils.isEmpty(list)) {
                    relRoleDashboardMapper.insertBatch(list);
                    optLogger.info("dashboard (:{}) limit role ({}) access", dashboard.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
                }
            }

            return dashboard;
        } else {
            throw new ServerException("create dashboard fail");
        }
    }

    /**
     * 修改dashboard
     *
     * @param portalId
     * @param dashboards
     * @param user
     * @return
     */
    @Override
    @Transactional
    public void updateDashboards(Long portalId, DashboardDto[] dashboards, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DashboardPortal dashboardPortal = dashboardPortalMapper.getById(portalId);

        if (null == dashboardPortal) {
            throw new NotFoundException("dashboard portal id not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardPortal.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(portalId, user.getId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            log.info("user {} have not permisson to update dashboard", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to update dashboard");
        }

        List<Dashboard> dashboardList = new ArrayList<>();
        Map<Long, List<Long>> rolesMap = new HashMap<>();

        Set<Long> parentIds = Arrays.stream(dashboards).map(Dashboard::getParentId).filter(pId -> pId.longValue() > 0).collect(Collectors.toSet());
        Map<Long, String> parentMap = null;
        if (!CollectionUtils.isEmpty(parentIds)) {
            parentMap = dashboardMapper.getFullParentIds(parentIds);
        }

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), portalId);

        for (DashboardDto dashboardDto : dashboards) {
            if (!projectPermission.isProjectMaintainer() && disableDashboards.contains(dashboardDto.getId())) {
                throw new UnAuthorizedExecption("you have not permission to update dashboard: \"" + dashboardDto.getName() + "\"");
            }

            if (!dashboardDto.getDashboardPortalId().equals(portalId)) {
                throw new ServerException("Invalid dashboard portal id");
            }

            if (isExist(dashboardDto.getName(), dashboardDto.getId(), dashboardDto.getDashboardPortalId())) {
                log.info("the dashboard \"{}\" name is already taken", dashboardDto.getName());
                throw new ServerException("the dashboard name \"" + dashboardDto.getName() + "\" is already taken");
            }

            dashboardDto.updatedBy(user.getId());

            if (null != dashboardDto.getParentId() && dashboardDto.getParentId() > 0L && parentMap.containsKey(dashboardDto.getParentId())) {
                String fullParentId = parentMap.get(dashboardDto.getParentId());
                dashboardDto.setFullParentId(StringUtils.isEmpty(fullParentId) ? dashboardDto.getParentId().toString() : dashboardDto.getParentId() + COMMA + fullParentId);
            }

            dashboardList.add(dashboardDto);
            rolesMap.put(dashboardDto.getId(), dashboardDto.getRoleIds());
        }

        int i = dashboardMapper.updateBatch(dashboardList);

        if (i > 0) {
            optLogger.info("dashboard [{}]  is update by (:{}), origin : {}", dashboardList.toString(), user.getId(), dashboards);

            if (!CollectionUtils.isEmpty(rolesMap)) {

                Set<Long> ids = rolesMap.keySet();
                relRoleDashboardMapper.deleteByDashboardIds(ids);

                List<RelRoleDashboard> list = new ArrayList<>();
                rolesMap.forEach((dashboardId, roles) -> {
                    if (!CollectionUtils.isEmpty(roles)) {
                        list.addAll(roles.stream().map(roleId -> new RelRoleDashboard(dashboardId, roleId)).collect(Collectors.toList()));
                    }
                });
                if (!CollectionUtils.isEmpty(list)) {
                    relRoleDashboardMapper.insertBatch(list);
                }
            }

        }
    }

    /**
     * 删除dashboard
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteDashboard(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(id);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", id);
            return true;
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardWithPortalAndProject.getProject().getId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), dashboardWithPortalAndProject.getDashboardPortalId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disableDashboards.contains(id))) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to create dashboard");
        }


        relRoleDashboardMapper.deleteByDashboardId(id);
        dashboardMapper.deleteByParentId(id);
        dashboardMapper.deleteById(id);
        optLogger.info("dashboard ({}) id delete by (:{})", dashboardWithPortalAndProject, user.getId());

        return true;
    }

    /**
     * 在dashboard下新建widget关联
     *
     * @param portalId
     * @param dashboardId
     * @param memDashboardWidgetCreates
     * @param user
     * @return
     */
    @Override
    @Transactional
    public List<MemDashboardWidget> createMemDashboardWidget(Long portalId, Long dashboardId, MemDashboardWidgetCreate[] memDashboardWidgetCreates, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            throw new NotFoundException("dashboard is not found");
        }

        if (!dashboardWithPortalAndProject.getDashboardPortalId().equals(portalId)) {
            throw new ServerException("Invalid dashboard");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardWithPortalAndProject.getProject().getId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(portalId, user.getId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            log.info("user {} have not permisson to do this operation", user.getUsername(), dashboardId);
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), portalId);


        Set<Long> ids = new HashSet<>();
        List<MemDashboardWidget> list = new ArrayList<>();
        for (MemDashboardWidgetCreate memDashboardWidgetCreate : memDashboardWidgetCreates) {

            if (!projectPermission.isProjectMaintainer() && disableDashboards.contains(memDashboardWidgetCreate.getDashboardId())) {
                throw new UnAuthorizedExecption("Insufficient permissions");
            }

            if (memDashboardWidgetCreate.getPolling() && memDashboardWidgetCreate.getFrequency() < 1) {
                throw new ServerException("Invalid frequency");
            }

            ids.add(memDashboardWidgetCreate.getWidgetId());
            MemDashboardWidget memDashboardWidget = new MemDashboardWidget().createdBy(user.getId());
            BeanUtils.copyProperties(memDashboardWidgetCreate, memDashboardWidget);
            list.add(memDashboardWidget);
        }

        List<Widget> widgets = widgetMapper.getByIds(ids);
        if (null == widgets || widgets.size() != ids.size()) {
            throw new ServerException("Invalid widget id");
        }

        for (Widget widget : widgets) {
            if (!widget.getProjectId().equals(dashboardWithPortalAndProject.getProject().getId())) {
                throw new ServerException("Invalid project id");
            }
        }

        int insert = memDashboardWidgetMapper.insertBatch(list);
        if (insert > 0) {
            optLogger.info("MemDashboardWidgets ({}) batch insert by (:{})", list.toString(), user.getId());
            return list;
        } else {
            throw new ServerException("unkown fail");
        }
    }

    /**
     * 修改dashboard下的widget关联信息
     *
     * @param portalId
     * @param user
     * @param memDashboardWidgets
     * @return
     */
    @Override
    @Transactional
    public boolean updateMemDashboardWidgets(Long portalId, User user, MemDashboardWidget[] memDashboardWidgets) throws NotFoundException, UnAuthorizedExecption, ServerException {

        DashboardPortal dashboardPortal = dashboardPortalMapper.getById(portalId);
        if (null == dashboardPortal) {
            throw new NotFoundException("dashboard portal is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardPortal.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(portalId, user.getId());

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && isDisable)) {
            log.info("user (:{}) have not permission to update memDashboardWidget", user.getId());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<MemDashboardWidget> list = Arrays.asList(memDashboardWidgets);
        Set<Long> dIds = list.stream().map(MemDashboardWidget::getDashboardId).collect(Collectors.toSet());
        Set<Long> wIds = list.stream().map(MemDashboardWidget::getWidgetId).collect(Collectors.toSet());


        Set<Long> dashboardIds = dashboardMapper.getIdSetByIds(dIds);
        Set<Long> widgetIds = widgetMapper.getIdSetByIds(wIds);

        String befor = list.toString();

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), portalId);


        list.forEach(m -> {
            if (!projectPermission.isProjectMaintainer() && disableDashboards.contains(m.getDashboardId())) {
                throw new UnAuthorizedExecption("Insufficient permissions");
            }

            if (!dashboardIds.contains(m.getDashboardId())) {
                throw new ServerException("Invalid dashboard id");
            }

            if (!widgetIds.contains(m.getWidgetId())) {
                throw new ServerException("Invalid widget id");
            }

            m.updatedBy(user.getId());
        });

        int i = memDashboardWidgetMapper.updateBatch(list);
        if (i > 0) {
            optLogger.info("MemDashboardWidgets ({}) is update by (:{}), origin: ({})", list.toString(), user.getId(), befor);
            return true;
        } else {
            throw new ServerException("unknown fail");
        }

    }

    /**
     * 删除dashboard下的widget关联信息
     *
     * @param relationId
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteMemDashboardWidget(Long relationId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        MemDashboardWidget memDashboardWidget = memDashboardWidgetMapper.getById(relationId);
        if (null == memDashboardWidget) {
            optLogger.warn("MemDashboardWidget (:{}) is not found", relationId);
            return true;
        }

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(memDashboardWidget.getDashboardId());

        if (null == dashboardWithPortalAndProject) {
            throw new ServerException("Invalid dashboard id");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardWithPortalAndProject.getProject().getId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(dashboardWithPortalAndProject.getDashboardPortalId(), user.getId());

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), dashboardWithPortalAndProject.getDashboardPortalId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (isDisable || disableDashboards.contains(dashboardWithPortalAndProject.getId())))) {
            log.info("user ({}) have not permission to delete memDashboardWidget ({})", user.getId(), memDashboardWidget.getId());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        int i = memDashboardWidgetMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("MemDashboardWidget ({}) is delete by (:{})", memDashboardWidget.toString(), user.getId());
            return true;
        } else {
            throw new ServerException("unknown fail");
        }
    }

    /**
     * 分享dashboard
     *
     * @param dashboardId
     * @param username
     * @param user
     * @return
     */
    @Override
    public String shareDashboard(Long dashboardId, String username, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            throw new NotFoundException("dashboard is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(dashboardWithPortalAndProject.getProject().getId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        boolean isDisable = relRolePortalMapper.isDisable(dashboardWithPortalAndProject.getDashboardPortalId(), user.getId());

        List<Long> disableDashboards = relRoleDashboardMapper.getDisableByUser(user.getId(), dashboardWithPortalAndProject.getDashboardPortalId());

        //校验权限
        if (!projectPermission.getSharePermission() ||
                (!projectPermission.isProjectMaintainer() && (isDisable || disableDashboards.contains(dashboardWithPortalAndProject.getId())))) {
            log.info("user {} have not permisson to share the dashboard {}", user.getUsername(), user.getId());
            throw new UnAuthorizedExecption("you have not permission to share the dashboard");
        }


        if (dashboardWithPortalAndProject.getType() == 0) {
            throw new ServerException("dashboard folder cannot be shared");
        }

        return shareService.generateShareToken(dashboardId, username, user.getId());
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

    @Override
    public List<Long> getExcludeRoles(Long id) {
        return relRoleDashboardMapper.getExecludeRoles(id);
    }

    @Override
    @Transactional
    public boolean postDashboardVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DashboardWithPortal dashboard = dashboardMapper.getDashboardWithPortalAndProject(vizVisibility.getId());
        if (null == dashboard) {
            throw new NotFoundException("dashboard is not found");
        }

        projectService.getProjectDetail(dashboard.getProject().getId(), user, true);

        if (vizVisibility.isVisible()) {
            int delete = relRoleDashboardMapper.delete(dashboard.getId(), role.getId());
            if (delete > 0) {
                optLogger.info("dashboard ({}) can be accessed by role ({}), update by (:{})", (Dashboard) dashboard, role, user.getId());
            }
        } else {
            RelRoleDashboard relRoleDashboard = new RelRoleDashboard(dashboard.getId(), role.getId()).createdBy(user.getId());
            relRoleDashboardMapper.insert(relRoleDashboard);
            optLogger.info("dashboard ({}) limit role ({}) access, create by (:{})", (Dashboard) dashboard, role, user.getId());
        }

        return true;
    }
}
