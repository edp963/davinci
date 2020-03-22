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

package edp.davinci.server.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.Favorite;
import edp.davinci.core.dao.entity.Organization;
import edp.davinci.core.dao.entity.Project;
import edp.davinci.core.dao.entity.RelProjectAdmin;
import edp.davinci.core.dao.entity.RelRoleProject;
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.dao.entity.Role;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.*;
import edp.davinci.server.dto.organization.OrganizationInfo;
import edp.davinci.server.dto.project.*;
import edp.davinci.server.dto.role.RoleProject;
import edp.davinci.server.dto.user.UserBaseInfo;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.*;
import edp.davinci.server.service.DashboardService;
import edp.davinci.server.service.DisplayService;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.PageUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service("projectService")
public class ProjectServiceImpl extends BaseEntityService implements ProjectService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectExtendMapper projectExtendMapper;

    @Autowired
    private OrganizationExtendMapper organizationExtendMapper;

    @Autowired
    private RelUserOrganizationExtendMapper relUserOrganizationMapper;

    @Autowired
    public RelProjectAdminExtendMapper relProjectAdminExtendMapper;

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
    private FavoriteExtendMapper favoriteExtendMapper;

    @Autowired
    private RelRoleProjectExtendMapper relRoleProjectMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleExtendMapper roleMapper;

    @Autowired
    private CronJobExtendMapper cronJobExtendMapper;

    @Autowired
    private RelRoleViewExtendMapper relRoleViewExtendMapper;

    private static final CheckEntityEnum entity = CheckEntityEnum.PROJECT;
    
    @Override
    public boolean isExist(String name, Long id, Long orgId) {
        Long projectId = projectExtendMapper.getByNameWithOrgId(name, orgId);
        if (null != id && null != projectId) {
            return !id.equals(projectId);
        }
        return null != projectId && projectId.longValue() > 0L;
    }


    @Override
    public ProjectInfo getProjectInfo(Long id, User user) {

        ProjectDetail projectDetail = getProjectDetail(id, user, false);

        ProjectInfo projectInfo = new ProjectInfo();
        BeanUtils.copyProperties(projectDetail, projectInfo);
        projectInfo.setPermission(getProjectPermission(projectDetail, user));

        Star star = starMapper.select(user.getId(), projectDetail.getId(), Constants.STAR_TARGET_PROJECT);
        if (null != star) {
            projectInfo.setIsStar(true);
        }

        return projectInfo;
    }

    /**
     * 获取项目列表
     *
     * @param user
     * @return
     */
    @Override
    public List<ProjectInfo> getProjects(User user) {
        //当前用户能看到的所有project
        List<ProjectWithCreateBy> projects = projectExtendMapper.getProejctsByUser(user.getId());
        return getProjectInfos(user, projects);
    }


    /**
     * 搜索project
     *
     * @param keywords
     * @param user
     * @param pageNum
     * @param pageSize
     * @return
     */
    @Override
    public PageInfo<ProjectWithCreateBy> searchProjects(String keywords, User user, int pageNum, int pageSize) throws ServerException, UnAuthorizedExecption, NotFoundException {
        if (!PageUtils.checkPageInfo(pageNum, pageSize)) {
            throw new ServerException("Invalid page info");
        }

        List<OrganizationInfo> orgs = organizationExtendMapper.getOrganizationByUser(user.getId());
        if (CollectionUtils.isEmpty(orgs)) {
            throw new UnAuthorizedExecption();
        }

        PageHelper.startPage(pageNum, pageSize);
        List<ProjectWithCreateBy> projects = projectExtendMapper.getProjectsByKewordsWithUser(keywords, user.getId(), orgs);
        PageInfo<ProjectWithCreateBy> pageInfo = new PageInfo<>(projects);
        return pageInfo;
    }

    /**
     * 创建项目
     *
     * @param projectCreat
     * @param user
     * @return
     */
    @Override
    @Transactional
    public ProjectInfo createProject(ProjectCreat projectCreat, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

    	String name = projectCreat.getName();
    	Long orgId = projectCreat.getOrgId();
        if (isExist(name, null, orgId)) {
        	alertNameTaken(entity, name);
        }

        Organization organization = getOrganization(orgId);
        Long userId = user.getId();
        checkOwner(organization, userId, orgId, "create");
        
        BaseLock lock = getLock(entity, name, orgId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {

			Project project = new Project();
	        BeanUtils.copyProperties(projectCreat, project);
	        project.setUserId(user.getId());
	        project.setIsTransfer(false);
	        project.setInitialOrgId(orgId);
	        project.setCreateBy(user.getId());
	        project.setCreateTime(new Date());

	        if (projectExtendMapper.insert(project) <= 0) {
	            log.info("Create project fail:{}", projectCreat.toString());
	            throw new ServerException("Create project fail");
	        }
	        
	        optLogger.info("Project({}) is create by user({})", project.getId(), user.getId());
	        // TODO num is wrong in concurrent cases
	        organization.setProjectNum(organization.getProjectNum() + 1);
	        organizationExtendMapper.updateProjectNum(organization);

	        ProjectInfo projectInfo = new ProjectInfo();
	        UserBaseInfo userBaseInfo = new UserBaseInfo();
	        BeanUtils.copyProperties(user, userBaseInfo);
	        projectInfo.setCreateUser(userBaseInfo);
	        BeanUtils.copyProperties(project, projectInfo);

	        return projectInfo;

		}finally {
			lock.release();
		}
    }
    
    private Organization getOrganization(Long id) {
        Organization organization = organizationExtendMapper.selectByPrimaryKey(id);
        if (null == organization) {
        	log.error("Organization({}) is not found", id);
            throw new NotFoundException("Organization is not found");
        }
        return organization;
    }
    
	private void checkOwner(Organization organization, Long userId, Long orgId, String operation) {
		RelUserOrganization rel = relUserOrganizationMapper.getRel(userId, orgId);
		if (!organization.getUserId().equals(userId)
				&& (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
			throw new UnAuthorizedExecption("You have not permission to " + operation + " this project");
		}
	}

    /**
     * 移交项目
     *
     * @param id
     * @param orgId
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Project transferPeoject(Long id, Long orgId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

    	ProjectDetail project = getProjectDetail(id, user, true);

        Organization organization = getOrganization(orgId);

        //不能移交给当前所在组织
        if (organization.getId().equals(project.getOrgId())) {
            log.error("This project({}) cannot be transferred to the current organization({})", id, orgId);
            throw new ServerException("The project can only be transferred to the non-current organizations");
        }

        //当前用户在即将移交的组织下才能移交
        RelUserOrganization ucRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == ucRel) {
            log.error("User({}) must be a member of the organization({}) that is about to be transfer", user.getId(), orgId);
            throw new ServerException("You must be a member of the organization " + organization.getName() + " that is about to be transfer");
        }

        String name = project.getName();
        BaseLock lock = getLock(entity, name, orgId);
		if (isExist(name, null, orgId) || (lock != null && !lock.getLock())) {
			throw new ServerException("The project name \"" + name + "\" is already in the organization you will transfer");
		}

        Long beforeOrgId = project.getOrgId();
        project.setOrgId(organization.getId());

        if (projectExtendMapper.changeOrganization(project) <= 0) {
            log.error("Transfer project({}) to organization({}) fail", project.getOrgId(), organization.getId());
            throw new ServerException("Transfer project fail");
        }
        
		optLogger.info("Project({}) transferd from org({}) to org({}) by user({})", project.getId(), beforeOrgId, orgId,
				user.getId());

        boolean isTransfer = true;
        //移交回原组织
        if (project.getInitialOrgId().equals(orgId)) {
            RelUserOrganization projectCreaterRuo = relUserOrganizationMapper.getRel(project.getUserId(), orgId);
            if (null != projectCreaterRuo) {
                isTransfer = false;
            }
        }
        projectExtendMapper.changeTransferStatus(isTransfer, project.getId());

        Organization beforeOrg = organizationExtendMapper.selectByPrimaryKey(beforeOrgId);
        // TODO num is wrong in concurrent cases
        beforeOrg.setProjectNum(beforeOrg.getProjectNum() - 1);
        organizationExtendMapper.updateProjectNum(beforeOrg);

        // TODO num is wrong in concurrent cases
        organization.setProjectNum(organization.getProjectNum() + 1);
        organizationExtendMapper.updateProjectNum(organization);

        projectExtendMapper.deleteAllRel(project.getId(), beforeOrgId);

        return project;
    }

    /**
     * 删除project
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteProject(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        ProjectDetail project = getProjectDetail(id, user, true);

        List<CronJob> cronJobs = cronJobExtendMapper.getByProject(project.getId());
        if (!CollectionUtils.isEmpty(cronJobs)) {
            List<CronJob> startedJobs = cronJobs.stream()
                    .filter(c -> c.getJobStatus().equals(CronJobStatusEnum.START.getStatus()))
                    .collect(Collectors.toList());

            if (!CollectionUtils.isEmpty(startedJobs)) {
                throw new ServerException("This project cannot be deleted cause which at least one 'Schedule' is started");
            }
        }

        cronJobExtendMapper.deleteByProject(project.getId());
        displayService.deleteSlideAndDisplayByProject(project.getId());
        dashboardService.deleteDashboardAndPortalByProject(project.getId());
        widgetMapper.deleteByProject(project.getId());
        relRoleViewExtendMapper.deleteByProject(project.getId());
        viewMapper.deleteByPorject(project.getId());
        sourceMapper.deleteByProject(project.getId());
        relRoleProjectMapper.deleteByProjectId(project.getId());
        relProjectAdminExtendMapper.deleteByProjectId(project.getId());

        if (projectExtendMapper.deleteByPrimaryKey(project.getId()) <= 0) {
            log.error("Delete project({}) fail", id);
            throw new ServerException("Delete project fail");
        }
        
        optLogger.info("Project({}) is delete by user({})", project.getId(), user.getId());
        Organization organization = organizationExtendMapper.selectByPrimaryKey(project.getOrgId());
        // TODO num is wrong in concurrent cases
        organization.setProjectNum(organization.getProjectNum() - 1);
        organizationExtendMapper.updateProjectNum(organization);
        return true;
    }

    /**
     * 更新项目基本信息
     *
     * @param id
     * @param projectUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Project updateProject(Long id, ProjectUpdate projectUpdate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        ProjectDetail project = getProjectDetail(id, user, true);
        
        String name = projectUpdate.getName();
        Long orgId = project.getOrgId();
        if (isExist(name, id, orgId)) {
            alertNameTaken(entity, name);
        }

        BaseLock lock = getLock(entity, name, orgId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {

			project.setName(projectUpdate.getName());
	        project.setDescription(projectUpdate.getDescription());
	        project.setVisibility(projectUpdate.getVisibility());
	        project.setUpdateTime(new Date());
	        project.setUpdateBy(user.getId());

	        if (projectExtendMapper.updateBaseInfo(project) <= 0) {
	            log.error("Update project({}) fail", project.getId());
	            throw new ServerException("Update project fail");
	        }
	        
			optLogger.info("Project({}) is update by user({})", project.getId(), user.getId());
	        return project;
			
		}finally {
			lock.release();
		}
    }

    /**
     * 收藏project
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean favoriteProject(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        ProjectDetail project = getProjectDetail(id, user, false);
        Favorite favorite = new Favorite();
        favorite.setUserId(user.getId());
        favorite.setProjectId(project.getId());
        favorite.setCreateTime(new Date());
        return favoriteExtendMapper.insert(favorite) > 0;
    }


    /**
     * 获取收藏的proeject
     *
     * @param user
     * @return
     */
    @Override
    public List<ProjectInfo> getFavoriteProjects(User user) {
        List<ProjectWithCreateBy> projects = projectExtendMapper.getFavoriteProjects(user.getId());
        return getProjectInfos(user, projects);
    }


    /**
     * 取消收藏
     *
     * @param user
     * @param projectIds
     * @return
     */
    @Override
    @Transactional
    public boolean removeFavoriteProjects(User user, Long[] projectIds) {
        return favoriteExtendMapper.deleteBatch(Arrays.asList(projectIds), user.getId()) > 0;
    }


	/**
	 * 添加project admin
	 *
	 * @param id
	 * @param adminIds
	 * @param user
	 * @return
	 * @throws ServerException
	 * @throws UnAuthorizedExecption
	 * @throws NotFoundException
	 */
	@Override
	@Transactional
	public List<RelProjectAdminDTO> addAdmins(Long id, List<Long> adminIds, User user)
			throws ServerException, UnAuthorizedExecption, NotFoundException {

		getProjectDetail(id, user, true);

		List<User> admins = userMapper.getByIds(adminIds);

		if (null == admins || admins.isEmpty()) {
			throw new NotFoundException("User is not found");
		}

		admins.forEach(u -> {
			if (!adminIds.contains(u.getId())) {
				throw new NotFoundException("User is not found");
			}
		});

		List<Long> oAdminIds = relProjectAdminExtendMapper.getAdminIds(id);

		admins.removeIf(u -> oAdminIds.contains(u.getId()));

		if (CollectionUtils.isEmpty(admins)) {
			return null;
		}

		List<RelProjectAdmin> relProjectAdmins = new ArrayList<>();
		admins.forEach(u -> {
			RelProjectAdmin rel = new RelProjectAdmin();
			rel.setProjectId(id);
			rel.setUserId(user.getId());
			rel.setCreateBy(user.getId());
			rel.setCreateTime(new Date());
			relProjectAdmins.add(rel);
		});
		if (relProjectAdminExtendMapper.insertBatch(relProjectAdmins) <= 0) {
			throw new ServerException("Add admins fail");
		}

		Map<Long, User> userMap = new HashMap<>();
		admins.forEach(u -> userMap.put(u.getId(), u));

		List<RelProjectAdminDTO> list = new ArrayList<>();
		relProjectAdmins.forEach(r -> {
			list.add(new RelProjectAdminDTO(r.getId(), userMap.get(r.getUserId())));
		});

		return list;
	}


    /**
     * 移除project Admin
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
    public boolean removeAdmin(Long relationId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        RelProjectAdmin relProjectAdmin = relProjectAdminExtendMapper.selectByPrimaryKey(relationId);
        if (null == relProjectAdmin) {
            log.error("Project admin({}) dose not exist", relationId);
            throw new ServerException("this admin dose not exist");
        }

        getProjectDetail(relProjectAdmin.getProjectId(), user, true);

        if (relProjectAdmin.getUserId().equals(user.getId())) {
            throw new ServerException("You cannot remove yourself");
        }

        if (relProjectAdminExtendMapper.deleteByPrimaryKey(relationId) <= 0) {
            throw new ServerException("Remove admin fail");
        }
        
        optLogger.info("RelProjectAdmin({}) is delete by user({})", relProjectAdmin.toString(), user.getId());
        return true;
    }


    /**
     * 获取Project / project权限校验
     *
     * @param projectId
     * @param user
     * @param modify
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public ProjectDetail getProjectDetail(Long projectId, User user, boolean modify) throws NotFoundException, UnAuthorizedExecption {
        ProjectDetail projectDetail = projectExtendMapper.getProjectDetail(projectId);
        if (null == projectDetail) {
            log.error("Project({}) is not found", projectId);
            throw new NotFoundException("Project is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), projectDetail.getOrgId());
        RelProjectAdmin relProjectAdmin = relProjectAdminExtendMapper.getByProjectAndUser(projectId, user.getId());
        boolean isCreater = projectDetail.getUserId().equals(user.getId()) && !projectDetail.getIsTransfer();
        boolean notOwner = !isCreater && null == relProjectAdmin && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole());
        if (modify) {
            //项目的创建人和当前项目对应组织的owner可以修改
            if (notOwner) {
                log.error("User({}) have not permission to modify project({})", user.getId(), projectId);
                throw new UnAuthorizedExecption();
            }
        } else {
            //project所在org对普通成员project不可见
            if (notOwner
                    && projectDetail.getOrganization().getMemberPermission() < (short) 1
                    && !projectDetail.getVisibility()) {
            	log.error("User({}) have not permission to modify project({})", user.getId(), projectId);
                throw new UnAuthorizedExecption();
            }
        }

        return projectDetail;
    }


	/**
	 * 批量添加权限
	 *
	 * @param projectId
	 * @param roleIds
	 * @param user
	 * @return
	 * @throws ServerException
	 * @throws UnAuthorizedExecption
	 * @throws NotFoundException
	 */
	@Override
	@Transactional
	public List<RoleProject> postRoles(Long projectId, List<Long> roleIds, User user)
			throws ServerException, UnAuthorizedExecption, NotFoundException {

		ProjectDetail projectDetail = getProjectDetail(projectId, user, true);
		List<Role> roleList = roleMapper.getByOrgIdAndIds(projectDetail.getOrgId(), roleIds);

		if (CollectionUtils.isEmpty(roleList)) {
			relRoleProjectMapper.deleteByProjectId(projectId);
			return null;
		}

		List<RelRoleProject> originRels = relRoleProjectMapper.getByProjectId(projectId);
		List<Long> invariantRoleIds = new ArrayList<>();
		if (!CollectionUtils.isEmpty(originRels)) {
			invariantRoleIds.addAll(originRels.stream().map(RelRoleProject::getRoleId).filter(roleIds::contains)
					.collect(Collectors.toList()));

			if (!CollectionUtils.isEmpty(invariantRoleIds)) {
				List<Long> delList = originRels.stream().filter(r -> !invariantRoleIds.contains(r.getRoleId()))
						.map(RelRoleProject::getId).collect(Collectors.toList());
				if (!CollectionUtils.isEmpty(delList)) {
					relRoleProjectMapper.deleteByIds(delList);
				}
			}
		}

		List<RelRoleProject> list = roleList.stream().filter(r -> !invariantRoleIds.contains(r.getId()))
				.map(role -> {
					RelRoleProject rel = new RelRoleProject();
					rel.setDownloadPermission(false);
					rel.setSharePermission(false);
					rel.setSourcePermission((short)0);
					rel.setViewPermission((short)0);
					rel.setWidgetPermission((short)0);
					rel.setSchedulePermission((short)0);
					rel.setVizPermission((short)1);
					rel.setProjectId(projectDetail.getId());
					rel.setRoleId(role.getId());
					rel.setCreateBy(user.getId());
					rel.setCreateTime(new Date());
					return rel;
				})
				.collect(Collectors.toList());

		if (CollectionUtils.isEmpty(list)) {
			return null;
		}

		relRoleProjectMapper.insertBatch(list);
		List<RoleProject> roleProjects = list.stream().map(r -> {
			RoleProject roleProject = new RoleProject(projectDetail);
			BeanUtils.copyProperties(r, roleProject);
			return roleProject;
		}).collect(Collectors.toList());

		return roleProjects;
	}

    @Override
    public PageInfo<ProjectWithCreateBy> getProjectsByOrg(Long orgId, User user, String keyword, int pageNum, int pageSize) {
        if (!PageUtils.checkPageInfo(pageNum, pageSize)) {
            throw new ServerException("Invalid page info");
        }
        PageHelper.startPage(pageNum, pageSize);
        List<ProjectWithCreateBy> projects = projectExtendMapper.getProjectsByOrgWithUser(orgId, user.getId(), keyword);
        PageInfo<ProjectWithCreateBy> pageInfo = new PageInfo<>(projects);
        return pageInfo;
    }

	private List<ProjectInfo> getProjectInfos(User user, List<ProjectWithCreateBy> projects) {

		if (CollectionUtils.isEmpty(projects)) {
			return null;
		}

		List<ProjectInfo> projectInfoList = new ArrayList<>();

		// 管理员
		Set<Long> idsByAdmin = projectExtendMapper.getProjectIdsByAdmin(user.getId());
		Set<Long> idsByMember = new HashSet<>();
		Iterator<ProjectWithCreateBy> iterator = projects.iterator();
		while (iterator.hasNext()) {
			ProjectWithCreateBy project = iterator.next();
			if (null != idsByAdmin && idsByAdmin.contains(project.getId())) {
				ProjectInfo projectInfo = new ProjectInfo();
				BeanUtils.copyProperties(project, projectInfo);
				projectInfo.setPermission(ProjectPermission.adminPermission());
				projectInfoList.add(projectInfo);
				iterator.remove();
			} else {
				idsByMember.add(project.getId());
			}
		}

		// 普通成员
		if (!CollectionUtils.isEmpty(idsByMember)) {
			List<UserMaxProjectPermission> permissions = relRoleProjectMapper.getMaxPermissions(idsByMember,
					user.getId());
			Map<Long, ProjectPermission> permissionMap = new HashMap<>();
			permissions.forEach(permission -> {
				ProjectPermission projectPermission = new ProjectPermission();
				BeanUtils.copyProperties(permission, projectPermission);
				permissionMap.put(permission.getProjectId(), projectPermission);
			});

			Iterator<ProjectWithCreateBy> iteratorByMember = projects.iterator();
			while (iteratorByMember.hasNext()) {
				ProjectWithCreateBy project = iteratorByMember.next();
				ProjectInfo projectInfo = new ProjectInfo();
				BeanUtils.copyProperties(project, projectInfo);
				if (permissionMap.containsKey(project.getId())) {
					// 关联Role的最大权限
					projectInfo.setPermission(permissionMap.get(project.getId()));
				} else {
					// 仅有预览权限
					projectInfo.setPermission(ProjectPermission.previewPermission());
				}
				projectInfoList.add(projectInfo);
			}
		}

		List<ProjectInfo> list = projectInfoList.stream().sorted(Comparator.comparing(ProjectInfo::getId))
				.collect(Collectors.toList());

		return list;
	}

	/**
	 * 获取用户对project的权限
	 *
	 * @param projectDetail
	 * @param user
	 * @return
	 */
	public ProjectPermission getProjectPermission(ProjectDetail projectDetail, User user) {
		if (isMaintainer(projectDetail, user)) {
			return ProjectPermission.adminPermission();
		}

		UserMaxProjectPermission permission = relRoleProjectMapper.getMaxPermission(projectDetail.getId(),
				user.getId());
		if (null != permission && null != permission.getProjectId()) {
			return permission;
		}

		if (projectDetail.getVisibility() && projectDetail.getOrganization().getMemberPermission() > (short) 0) {
			return ProjectPermission.previewPermission();
		}

		return new ProjectPermission((short) 0);
	}


    @Override
    public boolean allowGetData(ProjectDetail projectDetail, User user) throws NotFoundException {
        ProjectPermission projectPermission = getProjectPermission(projectDetail, user);
        return projectPermission.getVizPermission() > UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getWidgetPermission() > UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getViewPermission() > UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getSourcePermission() > UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getSchedulePermission() > UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getSharePermission()
                || projectPermission.getDownloadPermission();
    }

    @Override
    public List<RelProjectAdminDTO> getAdmins(Long id, User user) throws NotFoundException, UnAuthorizedExecption {
        getProjectDetail(id, user, false);
        return relProjectAdminExtendMapper.getByProject(id);
    }


    /**
     * user是否project 的维护者
     *
     * @param projectDetail
     * @param user
     * @return
     */
    public boolean isMaintainer(ProjectDetail projectDetail, User user) {
        if (null == projectDetail || null == user) {
            return false;
        }

        //project所在org的creater
        if (projectDetail.getOrganization().getUserId().equals(user.getId())) {
            return true;
        }

        //当前project的creater
        if (projectDetail.getUserId().equals(user.getId()) && !projectDetail.getIsTransfer()) {
            return true;
        }

        //project所在org的owner
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), projectDetail.getOrgId());
        if (null == orgRel) {
            return false;
        }

        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        //project的admin
        RelProjectAdmin projectAdmin = relProjectAdminExtendMapper.getByProjectAndUser(projectDetail.getId(), user.getId());
        if (null != projectAdmin) {
            return true;
        }

        return false;
    }
}
