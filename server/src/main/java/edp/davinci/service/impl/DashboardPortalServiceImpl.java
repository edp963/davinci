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

import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import edp.davinci.dto.dashboardDto.DashboardPortalCreate;
import edp.davinci.dto.dashboardDto.DashboardPortalUpdate;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.model.DashboardPortal;
import edp.davinci.model.RelRolePortal;
import edp.davinci.model.Role;
import edp.davinci.model.User;
import edp.davinci.service.DashboardPortalService;
import edp.davinci.service.ProjectService;
import lombok.extern.slf4j.Slf4j;

@Service("dashboardPortalService")
@Slf4j
public class DashboardPortalServiceImpl extends VizCommonService implements DashboardPortalService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private RelRoleDashboardWidgetMapper relRoleDashboardWidgetMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;
    
    private static final CheckEntityEnum entity = CheckEntityEnum.DASHBOARDPORTAL;

    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long portalId = dashboardPortalMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != portalId) {
            return id.longValue() != portalId.longValue();
        }
        return null != portalId && portalId.longValue() > 0L;
    }
    
    private void checkIsExist(String name, Long id, Long projectId) {
        if (isExist(name, id, projectId)) {
            alertNameTaken(entity, name);
        }
    }

    /**
     * 获取DashboardPortal列表
     *
     * @param projectId
     * @param user
     * @return
     */
    @Override
    public List<DashboardPortal> getDashboardPortals(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        if (!checkReadPermission(entity, projectId, user)) {
            return null;
        }

        List<DashboardPortal> dashboardPortals = dashboardPortalMapper.getByProject(projectId);

        if (!CollectionUtils.isEmpty(dashboardPortals)) {
        	
        	ProjectPermission projectPermission = getProjectPermission(projectId, user);

            List<Long> allPortals = dashboardPortals.stream().map(DashboardPortal::getId).collect(Collectors.toList());

            List<Long> disablePortals = getDisableVizs(user.getId(), projectId, allPortals, VizEnum.PORTAL);

            Iterator<DashboardPortal> iterator = dashboardPortals.iterator();

            while (iterator.hasNext()) {
                DashboardPortal portal = iterator.next();
                boolean disable = isDisableVizs(projectPermission, disablePortals, portal.getId());
                boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() && !portal.getPublish();
                if (disable || noPublish) {
                    iterator.remove();
                }
            }
        }

        return dashboardPortals;
    }
    
	private DashboardPortal getDashboardPortal(Long id) {
		
		DashboardPortal dashboardPortal = dashboardPortalMapper.getById(id);
        
		if (null == dashboardPortal) {
			log.warn("dashboardPortal ({}) is not found", id);
            throw new NotFoundException("dashboardPortal is not found");
        }

		return dashboardPortal;
	}
	
    /**
     * 新建DashboardPortal
     *
     * @param dashboardPortalCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public DashboardPortal createDashboardPortal(DashboardPortalCreate dashboardPortalCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	Long projectId = dashboardPortalCreate.getProjectId();
    	checkWritePermission(entity, projectId, user, "create");

    	String name = dashboardPortalCreate.getName();
    	checkIsExist(name, null, projectId);
        
        BaseLock lock = getLock(entity, name, projectId);
        if (!lock.getLock()) {
        	alertNameTaken(entity, name);
        }

		try {

			DashboardPortal dashboardPortal = new DashboardPortal().createdBy(user.getId());
			BeanUtils.copyProperties(dashboardPortalCreate, dashboardPortal);

			if (dashboardPortalMapper.insert(dashboardPortal) != 1) {
				throw new ServerException("create dashboardPortal fail");
			}
			
			optLogger.info("dashboardPortal ({}) is created by user (:{})", dashboardPortal.toString(), user.getId());

			List<Long> roleIds = dashboardPortalCreate.getRoleIds();
			
			if (!CollectionUtils.isEmpty(roleIds)) {
				List<Role> roles = roleMapper.getRolesByIds(roleIds);
				List<RelRolePortal> rels = roles.stream()
						.map(r -> new RelRolePortal(dashboardPortal.getId(), r.getId()).createdBy(user.getId()))
						.collect(Collectors.toList());

				if (!CollectionUtils.isEmpty(rels)) {
					relRolePortalMapper.insertBatch(rels);
					optLogger.info("create dashboardPortal ({}) limit role ({}) access", dashboardPortal.getId(),
							roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
				}
			}

			return dashboardPortal;

		} finally {
			releaseLock(lock);
		}
    }


	/**
	 * 更新DashboardPortal
	 *
	 * @param dashboardPortalUpdate
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public DashboardPortal updateDashboardPortal(DashboardPortalUpdate dashboardPortalUpdate, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		DashboardPortal dashboardPortal = getDashboardPortal(dashboardPortalUpdate.getId());
		Long projectId = dashboardPortal.getProjectId();
		checkWritePermission(entity,  projectId, user, "update");

		Long id = dashboardPortal.getId();
		String name = dashboardPortalUpdate.getName();
		checkIsExist(name, id, projectId);
		
		if (isDisablePortal(id, projectId, user, getProjectPermission(projectId, user))) {
			alertUnAuthorized(entity, user, "delete");
		}
		
		BaseLock lock = getLock(entity, name, projectId);
		if (!lock.getLock()) {
			alertNameTaken(entity, name);
		}

		try {

			String origin = dashboardPortal.toString();
			BeanUtils.copyProperties(dashboardPortalUpdate, dashboardPortal);
			dashboardPortal.updatedBy(user.getId());

			if (dashboardPortalMapper.update(dashboardPortal) != 1) {
				throw new ServerException("update dashboardPortal fail");
			}

			optLogger.info("dashboardPortal ({}) is update by (:{}), origin:({})", dashboardPortal.toString(),
					user.getId(), origin);

			relRolePortalMapper.deleteByProtalId(id);
			if (!CollectionUtils.isEmpty(dashboardPortalUpdate.getRoleIds())) {
				List<Role> roles = roleMapper.getRolesByIds(dashboardPortalUpdate.getRoleIds());
				List<RelRolePortal> list = roles.stream()
						.map(r -> new RelRolePortal(id, r.getId()).createdBy(user.getId()))
						.collect(Collectors.toList());
				if (!CollectionUtils.isEmpty(list)) {
					relRolePortalMapper.insertBatch(list);
					optLogger.info("update dashboardPortal ({}) limit role ({}) access", id,
							roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
				}
			}
			
			return dashboardPortal;

		}finally {
			releaseLock(lock);
		}
	}


    @Override
    public List<Long> getExcludeRoles(Long id) {
        return relRolePortalMapper.getExecludeRoles(id);
    }

    @Override
    @Transactional
    public boolean postPortalVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	DashboardPortal portal =getDashboardPortal(vizVisibility.getId());

        projectService.getProjectDetail(portal.getProjectId(), user, true);

        if (vizVisibility.isVisible()) {
            if (relRolePortalMapper.delete(portal.getId(), role.getId()) > 0) {
                optLogger.info("dashboardPortal ({}) can be accessed by role ({}), update by (:{})", portal, role, user.getId());
            }
        } else {
            RelRolePortal relRolePortal = new RelRolePortal(portal.getId(), role.getId()).createdBy(user.getId());
            relRolePortalMapper.insert(relRolePortal);
            optLogger.info("dashboardPortal ({}) limit role ({}) access, create by (:{})", portal, role, user.getId());
        }

        return true;
    }

    /**
     * 删除DashboardPortal
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteDashboardPortal(Long id, User user) throws NotFoundException, UnAuthorizedExecption {

    	DashboardPortal dashboardPortal = getDashboardPortal(id);
    	checkWritePermission(entity, dashboardPortal.getProjectId(), user, "delete");

		Long projectId = dashboardPortal.getProjectId();
		if (isDisablePortal(id, projectId, user, getProjectPermission(projectId, user))) {
			alertUnAuthorized(entity, user, "delete");
		}

        relRoleDashboardWidgetMapper.deleteByPortalId(id);
        memDashboardWidgetMapper.deleteByPortalId(id);
        relRoleDashboardMapper.deleteByPortalId(id);
        dashboardMapper.deleteByPortalId(id);

        if (dashboardPortalMapper.deleteById(id) == 1) {
            relRolePortalMapper.deleteByProtalId(dashboardPortal.getId());
            optLogger.info("dashboaard portal ({}) delete by user (:{}) ", dashboardPortal.toString(), user.getId());
            return true;
        }
        return false;
    }
}
