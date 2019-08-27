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

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.core.utils.PageUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.dto.projectDto.*;
import edp.davinci.dto.roleDto.RoleProject;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.model.*;
import edp.davinci.service.DashboardService;
import edp.davinci.service.DisplayService;
import edp.davinci.service.ProjectService;
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
public class ProjectServiceImpl implements ProjectService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    public RelProjectAdminMapper relProjectAdminMapper;

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
    private FavoriteMapper favoriteMapper;

    @Autowired
    private RelRoleProjectMapper relRoleProjectMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Override
    public synchronized boolean isExist(String name, Long id, Long orgId) {
        Long projectId = projectMapper.getByNameWithOrgId(name, orgId);
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
        List<ProjectWithCreateBy> projects = projectMapper.getProejctsByUser(user.getId());
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

        List<OrganizationInfo> orgs = organizationMapper.getOrganizationByUser(user.getId());
        if (CollectionUtils.isEmpty(orgs)) {
            throw new UnAuthorizedExecption();
        }

        PageHelper.startPage(pageNum, pageSize);
        List<ProjectWithCreateBy> projects = projectMapper.getProjectsByKewordsWithUser(keywords, user.getId(), orgs);
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

        if (isExist(projectCreat.getName(), null, projectCreat.getOrgId())) {
            log.info("the project name {} is already taken in this organization", projectCreat.getName());
            throw new ServerException("the project name " + projectCreat.getName() + " is already taken in this organization");
        }

        Organization organization = organizationMapper.getById(projectCreat.getOrgId());
        //校验组织
        if (null == organization) {
            log.info("not found organization, Id: {}", projectCreat.getOrgId());
            throw new NotFoundException("not found organization");
        }
        if (!organization.getAllowCreateProject()) {
            log.info("project are not allowed to be created under the organization named {}", organization.getName());
            throw new UnAuthorizedExecption("project are not allowed to be created under the organization named " + organization.getName());
        }

        Project project = new Project();
        BeanUtils.copyProperties(projectCreat, project);
        project.setUserId(user.getId());
        project.setCreateUserId(user.getId());

        int insert = projectMapper.insert(project);
        if (insert > 0) {

            optLogger.info("project ({}) is create by user(:{})", project.toString(), user.getId());
            organization.setProjectNum(organization.getProjectNum() + 1);
            organizationMapper.updateProjectNum(organization);

            ProjectInfo projectInfo = new ProjectInfo();
            UserBaseInfo userBaseInfo = new UserBaseInfo();
            BeanUtils.copyProperties(user, userBaseInfo);
            projectInfo.setCreateBy(userBaseInfo);
            BeanUtils.copyProperties(project, projectInfo);

            return projectInfo;
        } else {
            log.info("create project fail: {}", projectCreat.toString());
            throw new ServerException("create project fail: unspecified error");
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

        Organization organization = organizationMapper.getById(orgId);
        if (null == organization) {
            log.info("not found organization, name: {}", orgId);
            throw new NotFoundException("not found organization");
        }

        //不能移交给当前所在组织
        if (organization.getId().equals(project.getOrgId())) {
            log.info("this project cannot be transferred to the current organization, name: {}", orgId);
            throw new ServerException("the project can only be transferred to the non-current organizations");
        }

        //当前用户在即将移交的组织下才能移交
        RelUserOrganization ucRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == ucRel) {
            log.info("user[{}] must be a member of the organization {} that is about to be transfer", user.getId(), orgId);
            throw new ServerException("you must be a member of the organization " + organization.getName() + " that is about to be transfer");
        }

        if (isExist(project.getName(), null, orgId)) {
            throw new ServerException("the project name \"" + project.getName() + "\" is already in the organization you will transfer");
        }

        Long beforeOrgId = project.getOrgId();
        project.setOrgId(organization.getId());
        int i = projectMapper.changeOrganization(project);
        if (i > 0) {

            optLogger.info("project (:{}) transferd from org(:{}) to org(:{})", project.getId(), beforeOrgId, orgId);

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

            projectMapper.deleteBeforOrgRole(project.getId(), beforeOrgId);


            return project;
        } else {
            log.info("transfer project fail, {} -> {}", project.getOrgId(), organization.getId());
            throw new ServerException("transfer project fail: unspecified error");
        }
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

        //删除role project 关联
        relRoleProjectMapper.deleteByProjectId(project.getId());

        //删除project admin
        relProjectAdminMapper.deleteByProjectId(project.getId());

        //删除project
        int i = projectMapper.deleteById(project.getId());
        if (i > 0) {
            optLogger.info("project ({}) delete by user(:{})", project.toString(), user.getId());
            Organization organization = organizationMapper.getById(project.getOrgId());
            organization.setProjectNum(organization.getProjectNum() - 1);
            organizationMapper.updateProjectNum(organization);
            return true;
        } else {
            log.info("delete project(:{}) fail", id);
            throw new ServerException("delete project fail: unspecified error");
        }
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

        ProjectDetail project = null;

        try {
            project = getProjectDetail(id, user, true);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            throw new UnAuthorizedExecption("you have not permission to update this project");
        }

        String originInfo = project.baseInfoToString();

        project.setName(projectUpdate.getName());
        project.setDescription(projectUpdate.getDescription());
        project.setVisibility(projectUpdate.getVisibility());
        project.setUpdateTime(new Date());
        project.setUpdateBy(user.getId());

        int i = projectMapper.updateBaseInfo(project);
        if (i > 0) {
            optLogger.info("project ({}) update to ({}) by user(:{})", originInfo, project.baseInfoToString());
            return project;
        } else {
            log.info("update project fail, {}", project.toString());
            throw new ServerException("update project fail: unspecified error");
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
        int insert = favoriteMapper.insert(new Favorite(user.getId(), project.getId()));
        return insert > 0;
    }


    /**
     * 获取收藏的proeject
     *
     * @param user
     * @return
     */
    @Override
    public List<ProjectInfo> getFavoriteProjects(User user) {
        List<ProjectWithCreateBy> projects = projectMapper.getFavoriteProjects(user.getId());
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
        favoriteMapper.deleteBatch(Arrays.asList(projectIds), user.getId());
        return true;
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
    public List<RelProjectAdminDto> addAdmins(Long id, List<Long> adminIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        getProjectDetail(id, user, true);

        List<User> admins = userMapper.getByIds(adminIds);

        if (null == admins && admins.isEmpty()) {
            throw new NotFoundException("user is not found");
        }

        admins.forEach(u -> {
            if (!adminIds.contains(u.getId())) {
                throw new NotFoundException("user is not found");
            }
        });

        List<Long> oAdminIds = relProjectAdminMapper.getAdminIds(id);

        admins.removeIf(u -> oAdminIds.contains(u.getId()));


        if (!CollectionUtils.isEmpty(admins)) {
            List<RelProjectAdmin> relProjectAdmins = new ArrayList<>();
            admins.forEach(u -> relProjectAdmins.add(new RelProjectAdmin(id, u.getId()).createdBy(user.getId())));
            int insert = relProjectAdminMapper.insertBatch(relProjectAdmins);
            if (insert > 0) {
                Map<Long, User> userMap = new HashMap<>();
                admins.forEach(u -> userMap.put(u.getId(), u));

                List<RelProjectAdminDto> list = new ArrayList<>();
                relProjectAdmins.forEach(r -> {
                    list.add(new RelProjectAdminDto(r.getId(), userMap.get(r.getUserId())));
                });

                return list;
            } else {
                throw new ServerException("unspecified error");
            }
        }
        return null;
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

        relProjectAdminMapper.getById(relationId);

        RelProjectAdmin relProjectAdmin = relProjectAdminMapper.getById(relationId);
        if (null == relProjectAdmin) {
            log.warn("dose not exist this project admin (:{})", relationId);
            throw new ServerException("this admin dose not exist");
        }

        getProjectDetail(relProjectAdmin.getProjectId(), user, true);

        if (relProjectAdmin.getUserId().equals(user.getId())) {
            throw new ServerException("you cannot remove yourself");
        }

        int i = relProjectAdminMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("relProjectAdmin ({}) delete by user(:{})", relProjectAdmin.toString(), user.getId());
            return true;
        } else {
            log.error("delete rel project admin fail: (relationId:)", relationId);
            throw new ServerException("unspecified error");
        }
    }


    /**
     * 获取Project / project权限校验
     *
     * @param id
     * @param user
     * @param modify
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public ProjectDetail getProjectDetail(Long id, User user, boolean modify) throws NotFoundException, UnAuthorizedExecption {
        ProjectDetail projectDetail = projectMapper.getProjectDetail(id);
        if (null == projectDetail) {
            log.info("project (:{}) is not found", id);
            throw new NotFoundException("project is not found");
        }

        boolean isCreater = projectDetail.getUserId().equals(user.getId()) && !projectDetail.getIsTransfer();

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), projectDetail.getOrgId());
        RelProjectAdmin relProjectAdmin = relProjectAdminMapper.getByProjectAndUser(id, user.getId());

        if (modify) {
            //项目的创建人 和 当前项目对应组织的owner可以修改
            if (!isCreater && null == relProjectAdmin && (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
                log.info("user(:{}) have not permission to modify project (:{})", user.getId(), id);
                throw new UnAuthorizedExecption();
            }
        } else {
            if (null == rel) {
                log.info("user(:{}) have not permission to get project (:{})", user.getId(), id);
                throw new UnAuthorizedExecption();
            }

            //project 所在org 对普通成员project不可见
            if (!isCreater
                    && rel.getRole() != UserOrgRoleEnum.OWNER.getRole()
                    && null == relProjectAdmin
                    && projectDetail.getOrganization().getMemberPermission() < (short) 1
                    && !projectDetail.getVisibility()) {

                log.info("user(:{}) have not permission to get project (:{})", user.getId(), id);
                throw new UnAuthorizedExecption();
            }
        }

        return projectDetail;
    }


    /**
     * 批量添加权限
     *
     * @param id
     * @param roleIds
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    @Transactional
    public List<RoleProject> postRoles(Long id, List<Long> roleIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        ProjectDetail projectDetail = getProjectDetail(id, user, true);

        List<Role> roleList = roleMapper.selectByIdsAndOrgId(projectDetail.getOrgId(), roleIds);

        if (CollectionUtils.isEmpty(roleList)) {
            relRoleProjectMapper.deleteByProjectId(id);
            return null;
        }

        List<RelRoleProject> originRels = relRoleProjectMapper.getByProject(id);

        List<Long> invariantRoleIds = new ArrayList<>();
        if (!CollectionUtils.isEmpty(originRels)) {
            invariantRoleIds.addAll(originRels.stream().map(RelRoleProject::getRoleId).filter(roleIds::contains).collect(Collectors.toList()));

            if (!CollectionUtils.isEmpty(invariantRoleIds)) {
                List<Long> delList = originRels.stream().filter(r -> !invariantRoleIds.contains(r.getRoleId())).map(RelRoleProject::getId).collect(Collectors.toList());
                if (!CollectionUtils.isEmpty(delList)) {
                    relRoleProjectMapper.deleteByIds(delList);
                }
            }
        }

        List<RelRoleProject> list = roleList.stream()
                .filter(r -> !invariantRoleIds.contains(r.getId()))
                .map(role -> new RelRoleProject(projectDetail.getId(), role.getId()).createdBy(user.getId())).collect(Collectors.toList());

        if (!CollectionUtils.isEmpty(list)) {
            relRoleProjectMapper.insertBatch(list);
            List<RoleProject> roleProjects = list.stream().map(r -> {
                RoleProject roleProject = new RoleProject(projectDetail);
                BeanUtils.copyProperties(r, roleProject);
                return roleProject;
            }).collect(Collectors.toList());
            return roleProjects;
        }
        return null;
    }

    @Override
    public PageInfo<ProjectWithCreateBy> getProjectsByOrg(Long orgId, User user, String keyword, int pageNum, int pageSize) {
        if (!PageUtils.checkPageInfo(pageNum, pageSize)) {
            throw new ServerException("Invalid page info");
        }
        PageHelper.startPage(pageNum, pageSize);
        List<ProjectWithCreateBy> projects = projectMapper.getProjectsByOrgWithUser(orgId, user.getId(), keyword);
        PageInfo<ProjectWithCreateBy> pageInfo = new PageInfo<>(projects);
        return pageInfo;
    }

    private List<ProjectInfo> getProjectInfos(User user, List<ProjectWithCreateBy> projects) {
        if (!CollectionUtils.isEmpty(projects)) {
            List<ProjectInfo> projectInfoList = new ArrayList<>();

            //管理员
            Set<Long> idsByAdmin = projectMapper.getProjectIdsByAdmin(user.getId());
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

            //普通成员
            if (!CollectionUtils.isEmpty(idsByMember)) {
                List<UserMaxProjectPermission> permissions = relRoleProjectMapper.getMaxPermissions(idsByMember, user.getId());
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
                        //关联Role的最大权限
                        projectInfo.setPermission(permissionMap.get(project.getId()));
                    } else {
                        //仅有预览权限
                        projectInfo.setPermission(ProjectPermission.previewPermission());
                    }
                    projectInfoList.add(projectInfo);
                }
            }

            List<ProjectInfo> list = projectInfoList.stream().sorted(Comparator.comparing(ProjectInfo::getId)).collect(Collectors.toList());

            return list;
        }
        return null;
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
        } else {
            UserMaxProjectPermission permission = relRoleProjectMapper.getMaxPermission(projectDetail.getId(), user.getId());
            if (null != permission && null != permission.getProjectId()) {
                return permission;
            } else if (projectDetail.getVisibility() && projectDetail.getOrganization().getMemberPermission() > (short) 0) {
                return ProjectPermission.previewPermission();
            } else {
                return new ProjectPermission((short) 0);
            }
        }
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
    public List<RelProjectAdminDto> getAdmins(Long id, User user) throws NotFoundException, UnAuthorizedExecption {
        getProjectDetail(id, user, false);
        return relProjectAdminMapper.getByProject(id);
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

        //project 所在org的owner
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), projectDetail.getOrgId());
        if (null == orgRel) {
            return false;
        }

        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        //project 的admin
        RelProjectAdmin projectAdmin = relProjectAdminMapper.getByProjectAndUser(projectDetail.getId(), user.getId());
        if (null != projectAdmin) {
            return true;
        }

        return false;
    }
}
