/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
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

package edp.davinci.service.impl;

import static edp.core.consts.Consts.COMMA;

import java.util.ArrayList;
import java.util.Arrays;
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

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSON;

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.BaseLock;
import edp.core.utils.CollectionUtils;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.VizEnum;
import edp.davinci.dao.MemDashboardWidgetMapper;
import edp.davinci.dao.RelRoleDashboardWidgetMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dao.WidgetMapper;
import edp.davinci.dto.dashboardDto.DashboardCreate;
import edp.davinci.dto.dashboardDto.DashboardDto;
import edp.davinci.dto.dashboardDto.DashboardWithMem;
import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.dto.dashboardDto.MemDashboardWidgetCreate;
import edp.davinci.dto.dashboardDto.MemDashboardWidgetDto;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.model.Dashboard;
import edp.davinci.model.DashboardPortal;
import edp.davinci.model.MemDashboardWidget;
import edp.davinci.model.RelRoleDashboard;
import edp.davinci.model.RelRoleDashboardWidget;
import edp.davinci.model.Role;
import edp.davinci.model.User;
import edp.davinci.model.View;
import edp.davinci.model.Widget;
import edp.davinci.service.DashboardService;
import edp.davinci.service.ShareService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("dashboardService")
public class DashboardServiceImpl extends VizCommonService implements DashboardService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private RelRoleDashboardWidgetMapper relRoleDashboardWidgetMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private ShareService shareService;

    private static final  CheckEntityEnum entity = CheckEntityEnum.DASHBOARD;

    @Override
    public boolean isExist(String name, Long id, Long portalId) {
        Long dashboardId = dashboardMapper.getByNameWithPortalId(name, portalId);
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
        DashboardPortal dashboardPortal = dashboardPortalMapper.getById(portalId);
        if (dashboardPortal == null && isThrow) {
        	throw new NotFoundException("dashboardPortal is not found");
        }
        
        return dashboardPortal;
    }
    
    private Dashboard getDashboard(Long dashboardId) {
        Dashboard dashboard = dashboardMapper.getById(dashboardId);
        if (null == dashboard) {
            throw new NotFoundException("dashboard is not found");
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

        List<Dashboard> dashboardList = dashboardMapper.getByPortalId(portalId);

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
            throw new ServerException("Invalid dashboard");
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

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);

        List<Long> disableDashboards = getDisableVizs(user.getId(), portalId, null, VizEnum.DASHBOARD);
        List<Long> disableMemDashboardWidget = relRoleDashboardWidgetMapper.getDisableByUser(user.getId());

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

        DashboardPortal dashboardPortal =getDashboardPortal(dashboardCreate.getDashboardPortalId(), true);

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

			Long userId = user.getId();
			Dashboard dashboard = new Dashboard().createdBy(userId);
	        BeanUtils.copyProperties(dashboardCreate, dashboard);

	        if (null != dashboard.getParentId() && dashboard.getParentId() > 0L) {
	            String fullParentId = dashboardMapper.getFullParentId(dashboard.getParentId());
	            dashboard.setFullParentId(StringUtils.isEmpty(fullParentId) ? dashboard.getParentId().toString() : dashboard.getParentId() + COMMA + fullParentId);
	        }

	        if (dashboardMapper.insert(dashboard) != 1) {
	        	throw new ServerException("create dashboard fail");
	        }
	        
	        optLogger.info("dashboard ({}) is create by (:{})", dashboard.toString(), userId);

	        if (!CollectionUtils.isEmpty(dashboardCreate.getRoleIds())) {
	            List<Role> roles = roleMapper.getRolesByIds(dashboardCreate.getRoleIds());
	            List<RelRoleDashboard> list = roles.stream()
	                    .map(r -> new RelRoleDashboard(dashboard.getId(), r.getId()).createdBy(userId))
	                    .collect(Collectors.toList());
	            if (!CollectionUtils.isEmpty(list)) {
	                relRoleDashboardMapper.insertBatch(list);
	                optLogger.info("dashboard (:{}) limit role ({}) access", dashboard.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
	            }
	        }
	        
	        return dashboard;

		}finally {
			releaseLock(lock);
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
            List<Dashboard> parents = dashboardMapper.queryByParentIds(parentIds);
            if (!CollectionUtils.isEmpty(parents)) {
                Map<Long, List<Dashboard>> dashboardMap = parents.stream().collect(Collectors.groupingBy(Dashboard::getId));
                dashboardMap.forEach((k, v) -> v.stream().findFirst().ifPresent(d -> parentMap.put(k, d.getFullParentId())));
            }
        }

        List<Dashboard> dashboardList = new ArrayList<>();
        Map<Long, List<Long>> rolesMap = new HashMap<>();
        List<Long> disableDashboards = getDisableVizs(user.getId(), portalId, null, VizEnum.DASHBOARD);
        for (DashboardDto dashboardDto : dashboards) {
        	String name = dashboardDto.getName();
        	Long id = dashboardDto.getId();
        	if (isDisableVizs(projectPermission, disableDashboards, id)) {
                throw new UnAuthorizedExecption("you have not permission to update dashboard:\"" + name + "\"");
            }

            if (!dashboardDto.getDashboardPortalId().equals(portalId)) {
                throw new ServerException("Invalid dashboard portal id");
            }

            checkIsExist(name, id, portalId);
            
    		BaseLock lock = getLock(entity, name, projectId);
    		if (lock != null && !lock.getLock()) {
    			alertNameTaken(entity, name);
    		}

            dashboardDto.updatedBy(user.getId());

            Long parentId = dashboardDto.getParentId();
            if (null != parentId && parentId > 0L && parentMap.containsKey(parentId)) {
                String fullParentId = parentMap.get(parentId);
                dashboardDto.setFullParentId(StringUtils.isEmpty(fullParentId) ? parentId.toString() : parentId + COMMA + fullParentId);
            } else {
                dashboardDto.setFullParentId(null);
            }

            dashboardList.add(dashboardDto);
            rolesMap.put(id, dashboardDto.getRoleIds());
        }

        if (dashboardMapper.updateBatch(dashboardList) > 0) {
            
        	optLogger.info("dashboard [{}]  is update by (:{}), origin : {}", dashboardList.toString(), user.getId(), dashboards);
            
        	if (!CollectionUtils.isEmpty(rolesMap)) {
                Set<Long> ids = rolesMap.keySet();
                relRoleDashboardMapper.deleteByDashboardIds(ids);
                List<RelRoleDashboard> relList = new ArrayList<>();
                rolesMap.forEach((dashboardId, roles) -> {
                    if (!CollectionUtils.isEmpty(roles)) {
                    	relList.addAll(roles.stream().map(roleId -> new RelRoleDashboard(dashboardId, roleId)).collect(Collectors.toList()));
                    }
                });
                if (!CollectionUtils.isEmpty(relList)) {
                    relRoleDashboardMapper.insertBatch(relList);
                }
            }
        }
    }
    
	private DashboardWithPortal getDashboardWithPortal(Long id, boolean isThrow) {

		DashboardWithPortal dashboardWithPortal = dashboardMapper.getDashboardWithPortalAndProject(id);

		if (null == dashboardWithPortal) {
			log.info("dashboard (:{}) not found", id);
		}

		if (null == dashboardWithPortal && isThrow) {
			throw new NotFoundException("dashboard is not found");
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
			deletingDashboards = dashboardMapper.getByParentId(dashboardWithPortal.getId());
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
			relRoleDashboardWidgetMapper.deleteByDashboardId(deletingDashboard.getId());
			memDashboardWidgetMapper.deleteByDashboardId(deletingDashboard.getId());
			relRoleDashboardMapper.deleteByDashboardId(deletingDashboard.getId());
			dashboardMapper.deleteById(deletingDashboard.getId());
		}

		optLogger.info("dashboard ({}) delete by (:{})", JSON.toJSON(deletingDashboards), user.getId());

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
		
		if (objs[0] instanceof MemDashboardWidgetDto) {
			memDashboardWidgetCreates = new MemDashboardWidgetCreate[objs.length];
			memDashboardWidgetCreates = Arrays.stream(objs).map(obj -> {
				MemDashboardWidgetCreate create = new MemDashboardWidgetCreate();
				BeanUtils.copyProperties((MemDashboardWidgetDto)obj, create); 
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
						r -> new RelRoleDashboardWidget(r.getId(), memDashboardWidget.getId()).createdBy(user.getId()))
						.collect(Collectors.toList()));
			}
		}

		if (!CollectionUtils.isEmpty(relList)) {
			relRoleDashboardWidgetMapper.insertBatch(relList);
			optLogger.info("RelRoleDashboardWidgets ({}) batch insert by (:{})", relList.toString(),
					user.getId());
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
        checkWritePermission(entity, projectId, user, "create widget with");
        
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		List<Long> disablePortals = getDisableVizs(user.getId(), projectId, null, VizEnum.PORTAL);
		if (isDisableVizs(projectPermission, disablePortals, portalId)) {
			alertUnAuthorized(entity, user, "create widget with");
		}
        
        Set<Long> ids = new HashSet<>();
        List<MemDashboardWidget> memDashboardWidgetList = new ArrayList<>();
        for (MemDashboardWidgetCreate create : memDashboardWidgetCreates) {

        	if (isDisableDashboard(create.getDashboardId(), portalId, user, projectPermission)) {
        		alertUnAuthorized(entity, user, "create widget with");
        	}

        	if (create.getPolling() && create.getFrequency() < 1) {
                throw new ServerException("Invalid frequency");
            }

            ids.add(create.getWidgetId());
            MemDashboardWidget memDashboardWidget = new MemDashboardWidget().createdBy(user.getId());
            BeanUtils.copyProperties(create, memDashboardWidget);
            memDashboardWidgetList.add(memDashboardWidget);
        }

        checkWidgets(projectId, ids);
        
		if (memDashboardWidgetMapper.insertBatch(memDashboardWidgetList) <= 0) {
			throw new ServerException("create dashboardWidget fail");
		}

		optLogger.info("MemDashboardWidgets ({}) batch insert by (:{})", memDashboardWidgetList.toString(), user.getId());

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
	public boolean updateMemDashboardWidgets(Long portalId, User user, MemDashboardWidgetDto[] memDashboardWidgets)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		DashboardPortal dashboardPortal = getDashboardPortal(portalId, true);
		Long projectId = dashboardPortal.getProjectId();
		checkWritePermission(entity, projectId, user, "update widget with");
		
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "update widget with");
		}

		List<MemDashboardWidgetDto> dtoList = Arrays.asList(memDashboardWidgets);
		Set<Long> dashboardIds = dashboardMapper
				.getIdSetByIds(dtoList.stream().map(MemDashboardWidgetDto::getDashboardId).collect(Collectors.toSet()));
		Set<Long> widgetIds = widgetMapper
				.getIdSetByIds(dtoList.stream().map(MemDashboardWidgetDto::getWidgetId).collect(Collectors.toSet()));
		String before = dtoList.toString();
		List<MemDashboardWidget> memDashboardWidgetList = new ArrayList<>(dtoList.size());
		Map<Long, List<Long>> rolesMap = new HashMap<>();
		dtoList.forEach(m -> {
			
        	if (isDisableDashboard(m.getDashboardId(), portalId, user, projectPermission)) {
        		alertUnAuthorized(entity, user, "update widget with");
        	}
			
			if (!dashboardIds.contains(m.getDashboardId())) {
				throw new ServerException("Invalid dashboard id");
			}

			if (!widgetIds.contains(m.getWidgetId())) {
				throw new ServerException("Invalid widget id");
			}

			m.updatedBy(user.getId());

			memDashboardWidgetList.add(m);
			rolesMap.put(m.getId(), m.getRoleIds());
		});

		if (memDashboardWidgetMapper.updateBatch(memDashboardWidgetList) <= 0) {
			throw new ServerException("update dashboardWidget fail");
		}

		optLogger.info("MemDashboardWidget ({}) is update by (:{}), origin: ({})", memDashboardWidgetList.toString(),
				user.getId(), before);

		if (!CollectionUtils.isEmpty(rolesMap)) {
			Set<Long> memDashboardWidgetIds = rolesMap.keySet();
			relRoleDashboardWidgetMapper.deleteByMemDashboardWidgetIds(memDashboardWidgetIds);
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
        
    	MemDashboardWidget dashboardWidget = memDashboardWidgetMapper.getById(relationId);
        
    	if (null == dashboardWidget) {
            optLogger.warn("MemDashboardWidget (:{}) is not found", relationId);
            return true;
        }

        DashboardWithPortal dashboardWithPortal = dashboardMapper.getDashboardWithPortalAndProject(dashboardWidget.getDashboardId());

        if (null == dashboardWithPortal) {
            throw new ServerException("Invalid dashboard id");
        }

        Long projectId = dashboardWithPortal.getProject().getId();
        Long portalId = dashboardWithPortal.getDashboardPortalId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisablePortal(portalId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete widget with");
		}
		
		// 校验权限
		if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission()
				|| isDisableDashboard(dashboardWidget.getDashboardId(), portalId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete widget with");
		}

        relRoleDashboardWidgetMapper.deleteByMemDashboardWidgetId(relationId);

        if (memDashboardWidgetMapper.deleteById(relationId) <= 0) {
            throw new ServerException("delete dashboardWidget fail");
        }
        
        optLogger.info("MemDashboardWidget ({}) is delete by (:{})", dashboardWidget.toString(), user.getId());
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
			throw new ServerException("dashboard folder cannot be shared");
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
        relRoleDashboardWidgetMapper.deleteByProjectId(projectId);
        memDashboardWidgetMapper.deleteByProject(projectId);
        relRoleDashboardMapper.deleteByProject(projectId);
        dashboardMapper.deleteByProject(projectId);
        relRolePortalMapper.deleteByProject(projectId);
        dashboardPortalMapper.deleteByProject(projectId);
    }

    @Override
    public List<Long> getExcludeRoles(Long id) {
        return relRoleDashboardMapper.getExecludeRoles(id);
    }

    @Override
    @Transactional
    public boolean postDashboardVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        
    	DashboardWithPortal dashboard = getDashboardWithPortal(vizVisibility.getId(), true);

        projectService.getProjectDetail(dashboard.getProject().getId(), user, true);

        if (vizVisibility.isVisible()) {
            if (relRoleDashboardMapper.delete(dashboard.getId(), role.getId()) > 0) {
                optLogger.info("dashboard ({}) can be accessed by role ({}), update by (:{})", (Dashboard) dashboard, role, user.getId());
            }else {
            	return false;
            }
        } else {
            RelRoleDashboard relRoleDashboard = new RelRoleDashboard(dashboard.getId(), role.getId()).createdBy(user.getId());
            relRoleDashboardMapper.insert(relRoleDashboard);
            optLogger.info("dashboard ({}) limit role ({}) access, create by (:{})", (Dashboard) dashboard, role, user.getId());
        }

        return true;
    }
}
