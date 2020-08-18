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

import edp.davinci.server.dao.*;
import edp.davinci.server.dto.role.*;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.TableTypeEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.enums.VizVisiblityEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.*;
import edp.davinci.server.service.*;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.core.dao.entity.Organization;
import edp.davinci.core.dao.entity.Project;
import edp.davinci.core.dao.entity.RelRoleProject;
import edp.davinci.core.dao.entity.RelRoleUser;
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.dao.entity.Role;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.server.util.OptLogUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service("roleService")
public class RoleServiceImpl implements RoleService {

    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private OrganizationExtendMapper organizationExtendMapper;

    @Autowired
    private RelUserOrganizationExtendMapper relUserOrganizationMapper;

    @Autowired
    private RoleExtendMapper roleExtendMapper;

    @Autowired
    private UserExtendMapper userMapper;

    @Autowired
    private RelRoleUserExtendMapper relRoleUserExtendMapper;

    @Autowired
    private ProjectExtendMapper projectExtendMapper;

    @Autowired
    private RelRoleProjectExtendMapper relRoleProjectExtendMapper;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private RelRoleViewExtendMapper relRoleViewExtendMapper;

    @Autowired
    private RelRolePortalExtendMapper relRolePortalExtendMapper;

    @Autowired
    private RelRoleDashboardExtendMapper relRoleDashboardExtendMapper;

    @Autowired
    private RelRoleDisplayExtendMapper relRoleDisplayExtendMapper;

    @Autowired
    private RelRoleSlideExtendMapper relRoleSlideExtendMapper;

    @Autowired
    private RelRoleDashboardWidgetExtendMapper relRoleDashboardWidgetExtendMapper;

    @Autowired
    private RelRoleDisplaySlideWidgetExtendMapper relRoleDisplaySlideWidgetExtendMapper;

    @Autowired
    private DisplayService displayService;

    @Autowired
    private DisplaySlideService displaySlideService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DashboardPortalService dashboardPortalService;


    /**
     * 新建Role
     *
     * @param roleCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Role createRole(RoleCreate roleCreate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        Organization organization = organizationExtendMapper.selectByPrimaryKey(roleCreate.getOrgId());
        if (null == organization) {
            log.error("Orgainzation({}) is not found", roleCreate.getOrgId());
            throw new NotFoundException("Orgainzation is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == rel || !rel.getRole().equals(UserOrgRoleEnum.OWNER.getRole())) {
            log.info("User({}) have not permission to create role in organization({})", user.getId(),
                    organization.getId());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        Role role = new Role();
        role.setCreateBy(user.getId());
        role.setCreateTime(new Date());
        BeanUtils.copyProperties(roleCreate, role);

        if (roleExtendMapper.insert(role) > 0) {
	        optLogger.info(OptLogUtils.insert(TableTypeEnum.ROLE, role));
            // TODO num is wrong in concurrent cases
            organization.setRoleNum(organization.getRoleNum() + 1);
            organizationExtendMapper.updateRoleNum(organization);
            return role;
        }
        
        log.error("Create role({}) fail", role.toString());
        throw new ServerException("Create role fail");
    }
    
	private void alertUnAuthorized(User user, String operation) throws ServerException {
		log.warn("User({}) don't have permission to {} to this {}", user.getId(), operation, "role");
		throw new UnAuthorizedExecption("You don't have permission to " + operation + " to this role");
	} 

    /**
     * 删除 Role
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteRole(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        Role role = null;
        try {
            role = getRole(id, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
        	alertUnAuthorized(user, "delete");
        }

        if (roleExtendMapper.deleteByPrimaryKey(id) > 0) {
	        optLogger.info(OptLogUtils.delete(TableTypeEnum.ROLE, role));
	        Organization organization = organizationExtendMapper.selectByPrimaryKey(role.getOrgId());
            if (null != organization) {
            	// TODO num is wrong in concurrent cases
				int roleNum = organization.getRoleNum() == null ? 0 : organization.getRoleNum() - 1;
                organization.setRoleNum(roleNum > 0 ? roleNum : 0);
                organizationExtendMapper.updateRoleNum(organization);
            }

            relRoleProjectExtendMapper.deleteByRoleId(id);
            relRoleViewExtendMapper.deleteByRoleId(id);
            relRoleUserExtendMapper.deleteByRoleId(id);
            relRolePortalExtendMapper.deleteByRoleId(id);
            relRoleDashboardExtendMapper.deleteByRoleId(id);
            relRoleDisplayExtendMapper.deleteByRoleId(id);
            relRoleSlideExtendMapper.deleteByRoleId(id);
            relRoleDashboardWidgetExtendMapper.deleteByRoleId(id);
            relRoleDisplaySlideWidgetExtendMapper.deleteByRoleId(id);

            return true;
        }
        
        log.error("Delete role({}) fail", id);
        throw new ServerException("Delete role fail");
    }

    /**
     * 修改Role
     *
     * @param id
     * @param roleUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateRole(Long id, RoleUpdate roleUpdate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        Role role = null;
        try {
            role = getRole(id, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
        	alertUnAuthorized(user, "update");
        }
	    Role originRole = new Role();
	    BeanUtils.copyProperties(role, originRole);
        BeanUtils.copyProperties(roleUpdate, role);

        role.setUpdateBy(user.getId());
        role.setUpdateTime(new Date());

        if (roleExtendMapper.update(role) > 0) {
	        optLogger.info(OptLogUtils.update(TableTypeEnum.ROLE, originRole, role));
            return true;
        }

        log.error("Update role({}) fail", id);
        throw new ServerException("Update role fail");
    }

    /**
     * 获取单条Role详情
     *
     * @param roleId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public Role getRoleInfo(Long roleId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        return getRole(roleId, user, false);
    }

    @Override
    public List<Role> getRoleInfos(Long orgId, Long userId) {
        return roleExtendMapper.getRolesByOrgAndUser(orgId, userId);
    }


    /**
     * 添加Role与User关联
     *
     * @param id
     * @param memberIds
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public List<RelRoleMember> addMembers(Long id, List<Long> memberIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        
        try {
            getRole(id, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(user, "add members");
        }

        if (CollectionUtils.isEmpty(memberIds)) {
            relRoleUserExtendMapper.deleteByRoleId(id);
            return null;
        }

        List<User> members = userMapper.getByIds(memberIds);
        if (CollectionUtils.isEmpty(members)) {
            log.info("User({}) is not found", memberIds);
            throw new NotFoundException("Members is not found");
        }

        relRoleUserExtendMapper.deleteByRoleId(id);

        List<RelRoleUser> relRoleUsers = members.stream()
                .map(m -> {
                	RelRoleUser rel = new RelRoleUser();
                	rel.setRoleId(id);
                	rel.setUserId(m.getId());
                	rel.setCreateBy(user.getId());
                	rel.setCreateTime(new Date());
                	return rel;
                })
                .collect(Collectors.toList());

        if (relRoleUserExtendMapper.insertBatch(relRoleUsers) > 0) {
            Map<Long, User> map = new HashMap<>();
            members.forEach(m -> map.put(m.getId(), m));
            return relRoleUsers.stream().map(r -> new RelRoleMember(r.getId(), map.get(r.getUserId()))).collect(Collectors.toList());
        }
        
        log.error("Add role({}) members({}) fail", id, memberIds.toString());
        throw new ServerException("Add role members fail");
    }


    /**
     * 删除Role与User关联
     *
     * @param relationId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public boolean deleteMember(Long relationId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleUser relRoleUser = relRoleUserExtendMapper.selectByPrimaryKey(relationId);

        if (null == relRoleUser) {
            log.error("RelRoleUser({}) is not found", relationId);
            throw new NotFoundException("Role user relation not found");
        }

        try {
            getRole(relRoleUser.getRoleId(), user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(user, "delete member");
        }

        if (user.getId().equals(relRoleUser.getUserId())) {
            throw new ServerException("You cannot remove youself");
        }

        if (relRoleUserExtendMapper.deleteByPrimaryKey(relationId) > 0) {
	        optLogger.info(OptLogUtils.delete(TableTypeEnum.REL_ROLE_USER, relRoleUser));
	        return true;
        }
        
        log.error("Delete role({}) member({}) fail", relRoleUser.getRoleId(), relationId);
        throw new ServerException("Delete role members fail");
    }


    @Override
    @Transactional
    public List<RelRoleMember> updateMembers(Long id, List<Long> memberIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        getRole(id, user, true);

        List<User> users = userMapper.getByIds(memberIds);
        if (CollectionUtils.isEmpty(users)) {
            log.info("User({}) is not found", memberIds);
            throw new NotFoundException("Members is not found");
        }

        List<Long> userIds = users.stream().map(u -> u.getId()).collect(Collectors.toList());

        List<Long> members = relRoleUserExtendMapper.getUserIdsByRoleId(id);

        List<Long> deleteIds = members.stream().filter(mId -> !userIds.contains(mId)).collect(Collectors.toList());

        List<RelRoleUser> collect = userIds.stream().map(uId -> {
        	RelRoleUser rel = new RelRoleUser();
        	rel.setRoleId(id);
        	rel.setUserId(uId);
        	rel.setCreateBy(user.getId());
        	rel.setCreateTime(new Date());
        	return rel;
        }).collect(Collectors.toList());

        if (!CollectionUtils.isEmpty(deleteIds)) {
            relRoleUserExtendMapper.deleteByRoleIdAndUserIds(id, deleteIds);
        }

        relRoleUserExtendMapper.insertBatch(collect);

	    optLogger.info(OptLogUtils.insertBatch(TableTypeEnum.REL_ROLE_USER, collect));
	    return relRoleUserExtendMapper.getMembersByRoleId(id);
    }

    /**
     * 获取单条Role所关联的Users
     *
     * @param id
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public List<RelRoleMember> getMembers(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        try {
            getRole(id, user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        return relRoleUserExtendMapper.getMembersByRoleId(id);
    }


    /**
     * 添加Role与Project关联
     *
     * @param roleId
     * @param projectId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public RoleProject addProject(Long roleId, Long projectId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        try {
            getRole(roleId, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(user, "add project");
        }

        Project project = projectExtendMapper.selectByPrimaryKey(projectId);
        if (null == project) {
            log.error("Project({}) is not found", projectId);
            throw new NotFoundException("Project is not found");
        }

        RelRoleProject rel = relRoleProjectExtendMapper.getByRoleAndProject(roleId, projectId);
        if (null != rel) {
			log.error("Role({}) project({}) relation is already exist", roleId, projectId);
            throw new ServerException("Role project relation already exist");
        }

        RelRoleProject relRoleProject = new RelRoleProject();
        relRoleProject.setDownloadPermission(false);
        relRoleProject.setSharePermission(false);
		relRoleProject.setSourcePermission((short)0);
		relRoleProject.setViewPermission((short)0);
		relRoleProject.setWidgetPermission((short)0);
		relRoleProject.setSchedulePermission((short)0);
        relRoleProject.setVizPermission((short)1);
        relRoleProject.setProjectId(projectId);
        relRoleProject.setRoleId(roleId);
        relRoleProject.setCreateBy(user.getId());
        relRoleProject.setCreateTime(new Date());

        relRoleProjectExtendMapper.insertSelective(relRoleProject);
        if (null != relRoleProject.getId() && relRoleProject.getId().longValue() > 0L) {
	        optLogger.info(OptLogUtils.insert(TableTypeEnum.REL_ROLE_PROJECT, relRoleProject));
	        RoleProject roleProject = new RoleProject(project);
            BeanUtils.copyProperties(relRoleProject, roleProject);
            return roleProject;
        }
        
        log.error("Add role({}) project({}) relation fail", roleId, projectId);
        throw new ServerException("Add role project relation fail");
    }

    /**
     * 删除Role与Project关联
     *
     * @param roleId
     * @param projectId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public boolean deleteProject(Long roleId, Long projectId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleProject relRoleProject = relRoleProjectExtendMapper.getByRoleAndProject(roleId, projectId);

        if (null == relRoleProject) {
			log.error("Role({}) project({}) relation is not found", roleId, projectId);
            throw new ServerException("Role project relation is not found");
        }

        try {
            getRole(relRoleProject.getRoleId(), user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(user, "delete project");
        }

        if (relRoleProjectExtendMapper.deleteByRoleAndProject(roleId, projectId) > 0) {
	        optLogger.info(OptLogUtils.delete(TableTypeEnum.REL_ROLE_PROJECT, relRoleProject));
	        return true;
        }

        log.error("Delete role({}) project({}) relation fail", roleId, projectId);
        throw new ServerException("Delete role project relation fail");
    }


    /**
     * 修改Role与Project关联信息
     *
     * @param roleId
     * @param projectId
     * @param user
     * @param projectRoleDto
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public boolean updateProject(Long roleId, Long projectId, User user, RelRoleProjectDTO projectRoleDto) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleProject relRoleProject = relRoleProjectExtendMapper.getByRoleAndProject(roleId, projectId);
        if (null == relRoleProject) {
			log.error("Role({}) project({}) relation is not found", roleId, projectId);
            throw new ServerException("Role project relation is not found");
        }

	    RelRoleProject originRelRoleProject = new RelRoleProject();
	    BeanUtils.copyProperties(relRoleProject, originRelRoleProject);

        try {
            getRole(roleId, user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(user, "update project");
        }

        //校验Project Admin权限
        projectService.getProjectDetail(relRoleProject.getProjectId(), user, true);

        //校验数据合法性
        UserPermissionEnum sourceP = UserPermissionEnum.permissionOf(relRoleProject.getSourcePermission());
        if (null == sourceP) {
            log.error("Invalid source permission({})", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid source permission");
        }

        UserPermissionEnum viewP = UserPermissionEnum.permissionOf(relRoleProject.getViewPermission());
        if (null == viewP) {
            log.error("Invalid view permission({})", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid view permission");
        }

        UserPermissionEnum widgetP = UserPermissionEnum.permissionOf(relRoleProject.getWidgetPermission());
        if (null == widgetP) {
            log.error("Invalid widget permission({})", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid widget permission");
        }

        UserPermissionEnum vizP = UserPermissionEnum.permissionOf(relRoleProject.getVizPermission());
        if (null == vizP) {
            log.error("Invalid viz permission({})", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid viz permission");
        }

        UserPermissionEnum scheduleP = UserPermissionEnum.permissionOf(relRoleProject.getSchedulePermission());
        if (null == scheduleP) {
            log.error("Invalid schedule permission({})", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid schedule permission");
        }

        BeanUtils.copyProperties(projectRoleDto, relRoleProject);
        relRoleProject.setUpdateBy(user.getId());
        relRoleProject.setUpdateTime(new Date());

        if (relRoleProjectExtendMapper.update(relRoleProject) > 0) {
	        optLogger.info(OptLogUtils.update(TableTypeEnum.REL_ROLE_PROJECT, originRelRoleProject, relRoleProject));
	        return true;
        }
        
        log.error("Update role({}) project({}) relation fail", roleId, projectId);
        throw new ServerException("Update role project relation fail");
    }

    /**
     * 获取单个Organization里的Role列表
     *
     * @param orgId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public List<RoleBaseInfo> getRolesByOrgId(Long orgId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        Organization organization = organizationExtendMapper.selectByPrimaryKey(orgId);
        if (null == organization) {
            log.error("Orgainzation({}) is not found", orgId);
            throw new NotFoundException("Organization is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == rel) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        return roleExtendMapper.getBaseInfoByOrgId(orgId);
    }


    /**
     * 获取单个关联的Role列表
     *
     * @param projectId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public List<RoleBaseInfo> getRolesByProjectId(Long projectId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        projectService.getProjectDetail(projectId, user, false);
        List<RoleBaseInfo> list = relRoleProjectExtendMapper.getRoleBaseInfoByProject(projectId);
        return list;
    }

    @Override
    public RoleWithProjectPermission getRoleByProject(Long projectId, Long roleId, User user) {
        projectService.getProjectDetail(projectId, user, false);
        RoleWithProjectPermission projectPermission = relRoleProjectExtendMapper.getPermission(projectId, roleId);
        return projectPermission;
    }

    @Override
    public VizPermission getVizPermission(Long id, Long projectId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        VizPermission vizPermission = new VizPermission();
        try {
            getRole(id, user, true);
            projectService.getProjectDetail(projectId, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return vizPermission;
        }

        vizPermission.setPortals(relRolePortalExtendMapper.getExcludePortals(id, projectId));
        vizPermission.setDashboards(relRoleDashboardExtendMapper.getExcludeDashboards(id, projectId));
        vizPermission.setDisplays(relRoleDisplayExtendMapper.getExcludeDisplays(id, projectId));
        vizPermission.setSlides(relRoleSlideExtendMapper.getExcludeSlides(id, projectId));

        return vizPermission;
    }


    @Override
    public boolean postVizvisibility(Long roleId, VizVisibility vizVisibility, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        VizVisiblityEnum visiblityEnum = VizVisiblityEnum.vizOf(vizVisibility.getViz());
        if (null == visiblityEnum) {
            throw new ServerException("Invalid viz");
        }

        Role role = getRole(roleId, user, true);

        boolean result = false;
        switch (visiblityEnum) {
            case PORTAL:
                result = dashboardPortalService.postPortalVisibility(role, vizVisibility, user);
                break;
            case DASHBOARD:
                result = dashboardService.postDashboardVisibility(role, vizVisibility, user);
                break;
            case DISPLAY:
                result = displayService.postDisplayVisibility(role, vizVisibility, user);
                break;
            case SLIDE:
                result = displaySlideService.postSlideVisibility(role, vizVisibility, user);
                break;
        }
        return result;
    }

    @Override
    public List<Role> getMemberRoles(Long orgId, Long memberId, User user)
            throws ServerException, UnAuthorizedExecption, NotFoundException {
        Organization organization = organizationExtendMapper.selectByPrimaryKey(orgId);
        if (organization == null) {
            throw new NotFoundException("Organization is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), orgId);
        if (null == rel) {
            throw new UnAuthorizedExecption();
        }

        return roleExtendMapper.selectByOrgIdAndMemberId(orgId, memberId);
    }

    private Role getRole(Long id, User user, Boolean moidfy) throws NotFoundException, UnAuthorizedExecption {
        Role role = roleExtendMapper.selectByPrimaryKey(id);
        if (null == role) {
            log.error("Role({}) is not found", id);
            throw new NotFoundException("Role is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), role.getOrgId());
        if (null == rel) {
            throw new UnAuthorizedExecption();
        }

        if (moidfy && !rel.getRole().equals(UserOrgRoleEnum.OWNER.getRole())) {
            throw new UnAuthorizedExecption();
        }

        return role;
    }

}
