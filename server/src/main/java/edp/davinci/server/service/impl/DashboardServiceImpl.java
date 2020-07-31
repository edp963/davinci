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

import static edp.davinci.commons.Constants.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Dashboard;
import edp.davinci.core.dao.entity.DashboardPortal;
import edp.davinci.core.dao.entity.MemDashboardWidget;
import edp.davinci.core.dao.entity.RelRoleDashboard;
import edp.davinci.core.dao.entity.RelRoleDashboardWidget;
import edp.davinci.core.dao.entity.Role;
import edp.davinci.server.dao.MemDashboardWidgetExtendMapper;
import edp.davinci.server.dao.RelRoleDashboardWidgetExtendMapper;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dao.WidgetExtendMapper;
import edp.davinci.server.dto.dashboard.DashboardCreate;
import edp.davinci.server.dto.dashboard.DashboardDTO;
import edp.davinci.server.dto.dashboard.DashboardWithMem;
import edp.davinci.server.dto.dashboard.DashboardWithPortal;
import edp.davinci.server.dto.dashboard.MemDashboardWidgetCreate;
import edp.davinci.server.dto.dashboard.MemDashboardWidgetDTO;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.role.VizVisibility;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.enums.VizEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.View;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.server.service.DashboardService;
import edp.davinci.server.service.ShareService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("dashboardService")
public class DashboardServiceImpl extends VizCommonService implements DashboardService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private RelRoleDashboardWidgetExtendMapper relRoleDashboardWidgetExtendMapper;

    @Autowired
    private MemDashboardWidgetExtendMapper memDashboardWidgetExtendMapper;

    @Autowired
    private ViewExtendMapper viewMapper;

    @Autowired
    private WidgetExtendMapper widgetMapper;

    @Autowired
    private ShareService shareService;

    private static final CheckEntityEnum entity = CheckEntityEnum.DASHBOARD;

    @Override
    public boolean isExist(String name, Long id, Long portalId) {
        Long dashboardId = dashboardExtendMapper.getByNameWithPortalId(name, portalId);
        if (null != id && null != dashboardId) {
            return !id.equals(dashboardId);
        }
        return null != dashboardId && dashboardId.longValue() > 0L;
    }
    
	private void checkIsExist(String name, Long id, Long portalId) {
		if (isExist(name, id, portalId)) {
			alertNameTaken(entity, name);
		}
	}
    
    private DashboardPortal getDashboardPortal(Long portalId, boolean isThrow) {
        DashboardPortal dashboardPortal = dashboardPortalExtendMapper.selectByPrimaryKey(portalId);
        if (dashboardPortal == null && isThrow) {
        	throw new NotFoundException("DashboardPortal is not found");
        }
        
        return dashboardPortal;
    }
    
    private Dashboard getDashboard(Long dashboardId) {
        Dashboard dashboard = dashboardExtendMapper.selectByPrimaryKey(dashboardId);
        if (null == dashboard) {
            throw new NotFoundException("Dashboard is not found");
        }
        return dashboard;
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

        DashboardPortal dashboardPortal = getDashboardPortal(portalId, false);
        if (dashboardPortal == null) {
            return null;
        }
        
        Long projectId = dashboardPortal.getProjectId();

        ProjectPermission projectPermission = getProjectPermission(projectId, user);

        List<Long> disablePortals = getDisableVizs(user.getId(), projectId, null, VizEnum.PORTAL);

        boolean isDisable = isDisableVizs(projectPermission, disablePortals, portalId);
        boolean hidden = projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission();
        boolean noRublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() && !dashboardPortal.getPublish();

		if (hidden || isDisable || noRublish) {
			return null;
		}

        List<Dashboard> dashboardList = dashboardExtendMapper.getByPortalId(portalId);

        if (!CollectionUtils.isEmpty(dashboardList)) {
            List<Long> allDashboards = dashboardList.stream().map(Dashboard::getId).collect(Collectors.toList());
            List<Long> disableDashboards = getDisableVizs(user.getId(), portalId, allDashboards, VizEnum.DASHBOARD);
            dashboardList.removeIf(dashboard -> isDisableVizs(projectPermission, disableDashboards, dashboard.getId()));
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

        Dashboard dashboard = getDashboard(dashboardId);

        DashboardPortal portal = getDashboardPortal(portalId, true);

        if (!portal.getId().equals(portalId)) {
            throw new ServerException("Invalid dashboard portal id");
        }

       Long projectId = portal.getProjectId();

       ProjectPermission projectPermission = getProjectPermission(projectId, user);
        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission()) {
            return null;
        }

        List<Long> disablePortals = getDisableVizs(user.getId(), projectId, null, VizEnum.PORTAL);
        if (isDisableVizs(projectPermission, disablePortals, portalId)) {
        	return null;
        }

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetExtendMapper.getByDashboardId(dashboardId);

        List<Long> disableDashboards = getDisableVizs(user.getId(), portalId, null, VizEnum.DASHBOARD);
        List<Long> disableMemDashboardWidget = relRoleDashboardWidgetExtendMapper.getDisableByUser(user.getId());

        if (!CollectionUtils.isEmpty(disableDashboards)) {
            memDashboardWidgets.removeIf(memDashboardWidget -> projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() &&
                    (disableDashboards.contains(memDashboardWidget.getDashboardId()) || disableMemDashboardWidget.contains(memDashboardWidget.getId())));
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

        DashboardPortal dashboardPortal = getDashboardPortal(dashboardCreate.getDashboardPortalId(), true);

        Long projectId = dashboardPortal.getProjectId();
        checkWritePermission(entity, projectId, user, "create");

		if (isDisablePortal(dashboardPortal.getId(), projectId, user, getProjectPermission(projectId, user))) {
			alertUnAuthorized(entity, user, "create");
		}

        String name = dashboardCreate.getName();
        Long portalId = dashboardCreate.getDashboardPortalId();
		checkIsExist(name, null, portalId);
        
		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {

			Dashboard dashboard = new Dashboard();
			dashboard.setCreateBy(user.getId());
			dashboard.setCreateTime(new Date());
	        BeanUtils.copyProperties(dashboardCreate, dashboard);

	        if (null != dashboard.getParentId() && dashboard.getParentId() > 0L) {
	            String fullParentId = dashboardExtendMapper.getFullParentId(dashboard.getParentId());
	            dashboard.setFullParentId(StringUtils.isEmpty(fullParentId) ? dashboard.getParentId().toString() : dashboard.getParentId() + COMMA + fullParentId);
	        }
	        
	        insertDashboard(dashboard, dashboardCreate.getRoleIds(), user);
	        optLogger.info("Dashboard({}) is create by user({})", dashboard.getId(), user.getId());
	        
	        return dashboard;
		}finally {
			lock.release();
		}
    }
    
    @Transactional
    private void insertDashboard(Dashboard dashboard, List<Long> roleIds, User user) {

    	if (dashboardExtendMapper.insertSelective(dashboard) != 1) {
        	throw new ServerException("Create dashboard fail");
        }
        
        if (CollectionUtils.isEmpty(roleIds)) {
            return;
        }
        
        List<Role> roles = roleMapper.getRolesByIds(roleIds);
        List<RelRoleDashboard> list = roles.stream()
                .map(r -> {
                	RelRoleDashboard rel = new RelRoleDashboard();
            		rel.setDashboardId(dashboard.getId());
            		rel.setRoleId(r.getId());
            		rel.setCreateBy(user.getId());
            		rel.setCreateTime(new Date());
            		rel.setVisible(false);
                	return rel;
                }).collect(Collectors.toList());
        if (!CollectionUtils.isEmpty(list)) {
            relRoleDashboardExtendMapper.insertBatch(list);
            optLogger.info("Dashboard({}) limit role({}) access", dashboard.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
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
    public void updateDashboards(Long portalId, DashboardDTO[] dashboards, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	DashboardPortal dashboardPortal = getDashboardPortal(portalId, true);
    	Long projectId = dashboardPortal.getProjectId();
    	checkWritePermission(entity, projectId, user, "update");
    	
    	ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "update");
		}
    	
        Set<Long> parentIds = Arrays.stream(dashboards).map(Dashboard::getParentId).filter(pId -> pId > 0).collect(Collectors.toSet());
        Map<Long, String> parentMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(parentIds)) {
            List<Dashboard> parents = dashboardExtendMapper.queryByParentIds(parentIds);
            if (!CollectionUtils.isEmpty(parents)) {
                Map<Long, List<Dashboard>> dashboardMap = parents.stream().collect(Collectors.groupingBy(Dashboard::getId));
                dashboardMap.forEach((k, v) -> v.stream().findFirst().ifPresent(d -> parentMap.put(k, d.getFullParentId())));
            }
        }

        List<Dashboard> dashboardList = new ArrayList<>();
        Map<Long, List<Long>> rolesMap = new HashMap<>();
        List<Long> disableDashboards = getDisableVizs(user.getId(), portalId, null, VizEnum.DASHBOARD);
        List<BaseLock> locks = new ArrayList<>();
        for (DashboardDTO dashboardDTO : dashboards) {
        	String name = dashboardDTO.getName();
        	Long id = dashboardDTO.getId();
        	if (isDisableVizs(projectPermission, disableDashboards, id)) {
                throw new UnAuthorizedExecption("You have not permission to update dashboard:\"" + name + "\"");
            }

            if (!dashboardDTO.getDashboardPortalId().equals(portalId)) {
                throw new ServerException("Invalid dashboard portal id");
            }

            checkIsExist(name, id, portalId);
            
    		BaseLock lock = getLock(entity, name, projectId);
    		if (lock != null && !lock.getLock()) {
    			alertNameTaken(entity, name);
    		}
    		locks.add(lock);

    		dashboardDTO.setUpdateBy(user.getId());
			dashboardDTO.setUpdateTime(new Date());

            Long parentId = dashboardDTO.getParentId();
            if (null != parentId && parentId > 0L && parentMap.containsKey(parentId)) {
                String fullParentId = parentMap.get(parentId);
                dashboardDTO.setFullParentId(StringUtils.isEmpty(fullParentId) ? parentId.toString() : parentId + COMMA + fullParentId);
            } else {
                dashboardDTO.setFullParentId(null);
            }

            dashboardList.add(dashboardDTO);
            rolesMap.put(id, dashboardDTO.getRoleIds());
        }

        try {
        	updateDashboards(dashboardList, rolesMap, user);
        	optLogger.info("Dashboard({}) is update by user({}), origin:{}", dashboardList.stream().map(d -> d.getId()).collect(Collectors.toList()), user.getId(), dashboards);
        }finally {
        	for (BaseLock lock : locks) {
				lock.release();
			}
        }
    }
    
    @Transactional
    private void updateDashboards(List<Dashboard> dashboardList,  Map<Long, List<Long>> rolesMap, User user) {
    	
    	if (dashboardExtendMapper.updateBatch(dashboardList) <= 0) {
        	throw new ServerException("Update dashboard fail");
        }

    	if (CollectionUtils.isEmpty(rolesMap)) {
            return;
        }
    	
    	Set<Long> ids = rolesMap.keySet();
        relRoleDashboardExtendMapper.deleteByDashboardIds(ids);
        Set<Long> emptyRelDashboardIds = new HashSet<>();
        List<RelRoleDashboard> relList = new ArrayList<>();
        rolesMap.forEach((dashboardId, roles) -> {
			if (roles == null) {
				return;
			}
            emptyRelDashboardIds.add(dashboardId);
            if (!CollectionUtils.isEmpty(roles)) {
				relList.addAll(roles.stream().map(roleId -> {
					RelRoleDashboard rel = new RelRoleDashboard();
					rel.setDashboardId(dashboardId);
					rel.setRoleId(roleId);
					rel.setCreateBy(user.getId());
					rel.setCreateTime(new Date());
					rel.setVisible(false);
					return rel;
				}).collect(Collectors.toList()));
            }
        });
        if (!CollectionUtils.isEmpty(emptyRelDashboardIds)) {
        	relRoleDashboardExtendMapper.deleteByDashboardIds(emptyRelDashboardIds);
        }
        if (!CollectionUtils.isEmpty(relList)) {
            relRoleDashboardExtendMapper.insertBatch(relList);
        }
    }
    
	private DashboardWithPortal getDashboardWithPortal(Long id, boolean isThrow) {

		DashboardWithPortal dashboardWithPortal = dashboardExtendMapper.getDashboardWithPortalAndProject(id);

		if (null == dashboardWithPortal) {
			log.info("Dashboard({}) is not found", id);
		}

		if (null == dashboardWithPortal && isThrow) {
			throw new NotFoundException("Dashboard is not found");
		}

		return dashboardWithPortal;
	}

    /**
     * 删除dashboard
     *
     * @param id
     * @param user
     * @return
     */
    @SuppressWarnings("serial")
	@Override
    @Transactional
    public boolean deleteDashboard(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		DashboardWithPortal dashboardWithPortal = getDashboardWithPortal(id, false);
		if (null == dashboardWithPortal) {
			return true;
		}
		
		Long projectId = dashboardWithPortal.getProject().getId();
		checkWritePermission(entity, projectId, user, "delete");
		
		Long portalId = dashboardWithPortal.getDashboardPortalId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)
				|| isDisableDashboard(id, portalId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete");
		}

		List<Dashboard> deletingDashboards;
		if (0 == dashboardWithPortal.getType()) { // folder
			deletingDashboards = dashboardExtendMapper.getByParentId(dashboardWithPortal.getId());
		} else {
			deletingDashboards = new ArrayList<Dashboard>(1) {
				{
					add(dashboardWithPortal);
				}
			};
		}

		if (deletingDashboards.isEmpty()) {
			return true;
		}

		for (Dashboard deletingDashboard : deletingDashboards) {
			relRoleDashboardWidgetExtendMapper.deleteByDashboardId(deletingDashboard.getId());
			memDashboardWidgetExtendMapper.deleteByDashboardId(deletingDashboard.getId());
			relRoleDashboardExtendMapper.deleteByDashboardId(deletingDashboard.getId());
			dashboardExtendMapper.deleteByPrimaryKey(deletingDashboard.getId());
		}

		optLogger.info("Dashboard({}) is delete by user({})", deletingDashboards.stream().map(d -> d.getId()).collect(Collectors.toList()), user.getId());

		return true;
    }
    
	private void checkWidgets(Long projectId, Set<Long> ids) {
		List<Widget> widgets = widgetMapper.getByIds(ids);
		if (null == widgets || widgets.size() != ids.size()) {
			throw new ServerException("Invalid widget id");
		}

		for (Widget widget : widgets) {
			if (!widget.getProjectId().equals(projectId)) {
				throw new ServerException("Invalid project id");
			}
		}
	}
	
	private void handleRel(List<MemDashboardWidget> memDashboardWidgetList, User user, Object[] objs) {
		
		MemDashboardWidgetCreate[] memDashboardWidgetCreates = new MemDashboardWidgetCreate[objs.length];
		
		if (objs[0] instanceof MemDashboardWidgetDTO) {
			memDashboardWidgetCreates = new MemDashboardWidgetCreate[objs.length];
			memDashboardWidgetCreates = Arrays.stream(objs).map(obj -> {
				MemDashboardWidgetCreate create = new MemDashboardWidgetCreate();
				BeanUtils.copyProperties((MemDashboardWidgetDTO)obj, create); 
				return create;
			}).collect(Collectors.toList()).toArray(memDashboardWidgetCreates);
		}else {
			memDashboardWidgetCreates = (MemDashboardWidgetCreate[])objs;
		}
		
		List<RelRoleDashboardWidget> relList = new ArrayList<>();
		for (MemDashboardWidget memDashboardWidget : memDashboardWidgetList) {
			MemDashboardWidgetCreate memDashboardWidgetCreate = Arrays.stream(memDashboardWidgetCreates).filter(
					(item -> (item.getDashboardId().longValue() == memDashboardWidget.getDashboardId().longValue()
							&& item.getWidgetId().longValue() == memDashboardWidget.getWidgetId().longValue())))
					.findFirst().get();

			if (!CollectionUtils.isEmpty(memDashboardWidgetCreate.getRoleIds())) {
				List<Role> roles = roleMapper.getRolesByIds(memDashboardWidgetCreate.getRoleIds());
				relList.addAll(roles.stream().map(
						r -> {
							RelRoleDashboardWidget rel = new RelRoleDashboardWidget();
							rel.setRoleId(r.getId());
							rel.setMemDashboardWidgetId(memDashboardWidget.getId());
							rel.setVisible(false);
							rel.setCreateBy(user.getId());
							rel.setCreateTime(new Date());
							return rel;
						})
						.collect(Collectors.toList()));
			}
		}

		if (!CollectionUtils.isEmpty(relList)) {
			relRoleDashboardWidgetExtendMapper.insertBatch(relList);
			optLogger.info("RelRoleDashboardWidgets({}) batch insert by user({})", relList.toString(), user.getId());
		}
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

    	DashboardWithPortal dashboardWithPortal = getDashboardWithPortal(dashboardId, true);
        if (!dashboardWithPortal.getDashboardPortalId().equals(portalId)) {
            throw new ServerException("Invalid dashboard");
        }
        
        Long projectId = dashboardWithPortal.getProject().getId();
        checkWritePermission(entity, projectId, user, "create widget for");
        
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		List<Long> disablePortals = getDisableVizs(user.getId(), projectId, null, VizEnum.PORTAL);
		if (isDisableVizs(projectPermission, disablePortals, portalId)) {
			alertUnAuthorized(entity, user, "create widget for");
		}
        
        Set<Long> ids = new HashSet<>();
        List<MemDashboardWidget> memDashboardWidgetList = new ArrayList<>();
        for (MemDashboardWidgetCreate create : memDashboardWidgetCreates) {

        	if (isDisableDashboard(create.getDashboardId(), portalId, user, projectPermission)) {
        		alertUnAuthorized(entity, user, "create widget for");
        	}

        	if (create.getPolling() && create.getFrequency() < 1) {
                throw new ServerException("Invalid frequency");
            }

            ids.add(create.getWidgetId());
            MemDashboardWidget memDashboardWidget = new MemDashboardWidget();
            memDashboardWidget.setCreateBy(user.getId());
            memDashboardWidget.setCreateTime(new Date());
            BeanUtils.copyProperties(create, memDashboardWidget);
            memDashboardWidgetList.add(memDashboardWidget);
        }

        checkWidgets(projectId, ids);
        
		if (memDashboardWidgetExtendMapper.insertBatch(memDashboardWidgetList) <= 0) {
			throw new ServerException("Create dashboardWidget fail");
		}

		optLogger.info("MemDashboardWidgets({}) batch insert by user({})", memDashboardWidgetList.stream().map(m -> m.getId()).collect(Collectors.toList()), user.getId());

		handleRel(memDashboardWidgetList, user, memDashboardWidgetCreates);

		return memDashboardWidgetList;
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
	public boolean updateMemDashboardWidgets(Long portalId, User user, MemDashboardWidgetDTO[] memDashboardWidgets)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		DashboardPortal dashboardPortal = getDashboardPortal(portalId, true);
		Long projectId = dashboardPortal.getProjectId();
		checkWritePermission(entity, projectId, user, "update widget for");
		
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "update widget for");
		}

		List<MemDashboardWidgetDTO> dtoList = Arrays.asList(memDashboardWidgets);
		Set<Long> dashboardIds = dashboardExtendMapper
				.getIdSetByIds(dtoList.stream().map(MemDashboardWidgetDTO::getDashboardId).collect(Collectors.toSet()));
		Set<Long> widgetIds = widgetMapper
				.getIdSetByIds(dtoList.stream().map(MemDashboardWidgetDTO::getWidgetId).collect(Collectors.toSet()));
		String before = dtoList.toString();
		List<MemDashboardWidget> memDashboardWidgetList = new ArrayList<>(dtoList.size());
		Map<Long, List<Long>> rolesMap = new HashMap<>();
		dtoList.forEach(m -> {
			
        	if (isDisableDashboard(m.getDashboardId(), portalId, user, projectPermission)) {
        		alertUnAuthorized(entity, user, "update widget for");
        	}
			
			if (!dashboardIds.contains(m.getDashboardId())) {
				throw new ServerException("Invalid dashboard id");
			}

			if (!widgetIds.contains(m.getWidgetId())) {
				throw new ServerException("Invalid widget id");
			}

            m.setUpdateBy(user.getId());
            m.setUpdateTime(new Date());

			memDashboardWidgetList.add(m);
			rolesMap.put(m.getId(), m.getRoleIds());
		});

		if (memDashboardWidgetExtendMapper.updateBatch(memDashboardWidgetList) <= 0) {
			throw new ServerException("Update dashboardWidget fail");
		}

		optLogger.info("MemDashboardWidget({}) is update by user({}), origin:{}",
				memDashboardWidgetList.stream().map(m -> m.getId()).collect(Collectors.toList()), user.getId(), before);

		if (!CollectionUtils.isEmpty(rolesMap)) {
			Set<Long> memDashboardWidgetIds = rolesMap.keySet();
			relRoleDashboardWidgetExtendMapper.deleteByMemDashboardWidgetIds(memDashboardWidgetIds);
			handleRel(memDashboardWidgetList, user, memDashboardWidgets);
		}

		return true;
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
        
    	MemDashboardWidget dashboardWidget = memDashboardWidgetExtendMapper.selectByPrimaryKey(relationId);
        
    	if (null == dashboardWidget) {
            optLogger.warn("MemDashboardWidget({}) is not found", relationId);
            return true;
        }

        DashboardWithPortal dashboardWithPortal = dashboardExtendMapper.getDashboardWithPortalAndProject(dashboardWidget.getDashboardId());

        if (null == dashboardWithPortal) {
            throw new ServerException("Invalid dashboard id");
        }

        Long projectId = dashboardWithPortal.getProject().getId();
        Long portalId = dashboardWithPortal.getDashboardPortalId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete widget for");
		}
		
		// 校验权限
		if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission()
				|| isDisableDashboard(dashboardWidget.getDashboardId(), portalId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete widget for");
		}

        relRoleDashboardWidgetExtendMapper.deleteByMemDashboardWidgetId(relationId);

        if (memDashboardWidgetExtendMapper.deleteByPrimaryKey(relationId) <= 0) {
            throw new ServerException("Delete dashboardWidget fail");
        }
        
        optLogger.info("MemDashboardWidget({}) is delete by user({})", dashboardWidget.getId(), user.getId());
        return true;
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
	public String shareDashboard(Long dashboardId, String username, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		DashboardWithPortal dashboardWithPortal = getDashboardWithPortal(dashboardId, true);
		if (dashboardWithPortal.getType() == 0) {
			throw new ServerException("Dashboard folder cannot be shared");
		}

		Long projectId = dashboardWithPortal.getProject().getId();
		Long portalId = dashboardWithPortal.getDashboardPortalId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		// 校验权限
		if (!projectPermission.getSharePermission() || isDisablePortal(portalId, projectId, user, projectPermission)
				|| isDisableDashboard(dashboardId, portalId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "share");
		}

		return shareService.generateShareToken(dashboardId, username, user.getId());
	}

    @Override
    @Transactional
    public void deleteDashboardAndPortalByProject(Long projectId) throws RuntimeException {
        relRoleDashboardWidgetExtendMapper.deleteByProject(projectId);
        memDashboardWidgetExtendMapper.deleteByProject(projectId);
        relRoleDashboardExtendMapper.deleteByProject(projectId);
        dashboardExtendMapper.deleteByProject(projectId);
        relRolePortalExtendMapper.deleteByProject(projectId);
        dashboardPortalExtendMapper.deleteByProject(projectId);
    }

    @Override
    public List<Long> getExcludeRoles(Long id) {
        return relRoleDashboardExtendMapper.getExcludeRoles(id);
    }

    @Override
    @Transactional
    public boolean postDashboardVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        
    	DashboardWithPortal dashboard = getDashboardWithPortal(vizVisibility.getId(), true);

        projectService.getProjectDetail(dashboard.getProject().getId(), user, true);

        if (vizVisibility.isVisible()) {
            if (relRoleDashboardExtendMapper.deleteByPrimaryKey(role.getId(), dashboard.getId()) > 0) {
                optLogger.info("Dashboard({}) can be accessed by role({}), update by user({})", dashboard.getId(), role.getId(), user.getId());
            }else {
            	return false;
            }
        } else {
            RelRoleDashboard relRoleDashboard = new RelRoleDashboard();
            relRoleDashboard.setDashboardId(dashboard.getId());
            relRoleDashboard.setRoleId(role.getId());
            relRoleDashboard.setCreateBy(user.getId());
            relRoleDashboard.setCreateTime(new Date());
            relRoleDashboard.setVisible(false);
            relRoleDashboardExtendMapper.insert(relRoleDashboard);
            optLogger.info("Dashboard({}) limit role({}) access, create by user({})", dashboard.getId(), role.getId(), user.getId());
        }

        return true;
    }

    @Override
    public boolean updateMemDashboardWidgetAlias(Long relationId, String alias, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {
        MemDashboardWidget dashboardWidget = memDashboardWidgetExtendMapper.selectByPrimaryKey(relationId);

        if (null == dashboardWidget) {
            optLogger.warn("MemDashboardWidget({}) is not found", relationId);
            return true;
        }

        DashboardWithPortal dashboardWithPortal = dashboardExtendMapper
                .getDashboardWithPortalAndProject(dashboardWidget.getDashboardId());

        if (null == dashboardWithPortal) {
            throw new ServerException("Invalid dashboard id");
        }

        Long projectId = dashboardWithPortal.getProject().getId();
        Long portalId = dashboardWithPortal.getDashboardPortalId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        if (isDisablePortal(portalId, projectId, user, projectPermission)) {
            alertUnAuthorized(entity, user, "update widget with");
        }

        // 校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || isDisableDashboard(dashboardWidget.getDashboardId(), portalId, user, projectPermission)) {
            alertUnAuthorized(entity, user, "update widget with");
        }

        dashboardWidget.setAlias(alias == null ? null : alias.trim());
        dashboardWidget.setUpdateBy(user.getId());
        dashboardWidget.setUpdateTime(new Date());
        if (memDashboardWidgetExtendMapper.update(dashboardWidget) <= 0) {
            throw new ServerException("Update dashboardWidget fail");
        }

        optLogger.info("MemDashboardWidget({}) is update by user({})", relationId, user.getId());
        return true;
    }
}
