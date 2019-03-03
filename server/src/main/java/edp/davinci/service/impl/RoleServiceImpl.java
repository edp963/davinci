/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.roleDto.*;
import edp.davinci.model.*;
import edp.davinci.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Slf4j
@Service("roleService")
public class RoleServiceImpl implements RoleService {

    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RelRoleUserMapper relRoleUserMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private RelRoleProjectMapper relRoleProjectMapper;

    /**
     * 新建Role
     *
     * @param roleCreate
     * @param user
     * @return
     */
    @Override
    public Role createRole(RoleCreate roleCreate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        Organization organization = organizationMapper.getById(roleCreate.getOrgId());
        if (null == organization) {
            log.info("orgainzation (:{}) is not found", roleCreate.getOrgId());
            throw new NotFoundException("organization is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == rel) {
            log.info("user(:{}) have not permission to create role in organization (:{})", user.getId(), organization.getId());
            throw new UnAuthorizedExecption("you have not permission");
        }

        Role role = new Role();
        BeanUtils.copyProperties(roleCreate, role);
        role.createBy(user.getId());

        int insert = roleMapper.insert(role);
        if (insert > 0) {
            optLogger.info("role ( :{} ) create by user( :{} )", role.toString(), user.getId());
            return role;
        } else {
            log.info("create role fail: {}", role.toString());
            throw new ServerException("create role fail: unspecified error");
        }
    }

    /**
     * 删除 Role
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    public boolean deleteRole(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        Role role = null;
        try {
            role = getRole(id, user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.info("user(:{}) have not permission to delete role in organization (:{})", user.getId(), role.getOrgId());
            throw new UnAuthorizedExecption("you have not permission to delete this role");
        }

        int delete = roleMapper.deleteById(id);
        if (delete > 0) {
            optLogger.info("role ( {} ) delete by user( :{} )", role.toString(), user.getId());
            return true;
        } else {
            log.info("delete role fail: {}", role.toString());
            throw new ServerException("delete role fail: unspecified error");
        }
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
    public boolean updateRole(Long id, RoleUpdate roleUpdate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {

        Role role = null;
        try {
            role = getRole(id, user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.info("user(:{}) have not permission to update role in organization (:{})", user.getId(), role.getOrgId());
            throw new UnAuthorizedExecption("you have not permission to update this role");
        }

        String originInfo = role.toString();

        BeanUtils.copyProperties(roleUpdate, role);

        role.updateBy(user.getId());

        int update = roleMapper.update(role);
        if (update > 0) {
            optLogger.info("role ( {} ) update by user( :{} ), origin ( {} )", role.toString(), user.getId(), originInfo);
            return true;
        } else {
            log.info("update role fail: {}", role.toString());
            throw new ServerException("update role fail: unspecified error");
        }
    }

    /**
     * 获取单条Role详情
     *
     * @param id
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public Role getRoleInfo(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        return getRole(id, user);
    }


    /**
     * 添加Role与User关联
     *
     * @param id
     * @param memberId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public RelRoleMember addMember(Long id, Long memberId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        Role role = null;
        try {
            role = getRole(id, user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.info("user(:{}) have not permission to update role in organization (:{})", user.getId(), role.getOrgId());
            throw new UnAuthorizedExecption("you have not permission");
        }

        User member = userMapper.getById(memberId);
        if (null == member) {
            log.info("user ( :{} ) is not found", memberId);
            throw new NotFoundException("member is not found");
        }

        RelRoleUser rel = relRoleUserMapper.getByRoleAndMember(id, memberId);
        if (null != rel) {
            log.warn("RelRoleUser (role:{}, member:{}) is already exist", id, memberId);
            throw new ServerException("Already exist");
        }

        RelRoleUser relRoleUser = new RelRoleUser(memberId, role.getId());
        relRoleUser.createBy(user.getId());
        relRoleUserMapper.insert(relRoleUser);
        if (null != relRoleUser.getId() && relRoleUser.getId().longValue() > 0L) {
            optLogger.info("create relRoleUser ( {} ) update by user( :{} )", relRoleUser.toString(), user.getId());
            return new RelRoleMember(relRoleUser.getId(), member);
        } else {
            log.error("add role member fail: (role:{}, memeber:{})", id, memberId);
            throw new ServerException("unspecified error");
        }
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
    public boolean deleteMember(Long relationId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleUser relRoleUser = relRoleUserMapper.getById(relationId);

        if (null == relRoleUser) {
            log.error("RelRoleUser ( :{} ) is not found", relationId);
            throw new NotFoundException("not found");
        }

        Role role = null;
        try {
            role = getRole(relRoleUser.getRoleId(), user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.error("user( :{} ) have not permission to delete RelRoleUser (:{})", user.getId(), relationId);
            throw new UnAuthorizedExecption("you have not permission");
        }

        if (user.getId().equals(relRoleUser.getUserId())) {
            throw new ServerException("you cannot remove youself");
        }

        int i = relRoleUserMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("relRoleUser ({}) delete by user(:{})", relRoleUser.toString(), user.getId());
            return true;
        } else {
            log.error("delete role member fail: (relationId:)", relationId);
            throw new ServerException("unspecified error");
        }
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
        Role role = null;
        try {
            role = getRole(id, user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.error("user( :{} ) have not permission to delete RelRoleUser (:{})", user.getId(), id);
            throw new UnAuthorizedExecption("you have not permission");
        }

        return relRoleUserMapper.getMembersByRoleId(id);
    }


    /**
     * 添加Role与Project关联
     *
     * @param id
     * @param projectId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public RoleProject addProject(Long id, Long projectId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        Role role = null;
        try {
            role = getRole(id, user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.error("user( :{} ) have not permission to add RelRolePorject (role:{}, project:{})", user.getId(), id, projectId);
            throw new UnAuthorizedExecption("you have not permission");
        }

        Project project = projectMapper.getById(projectId);
        if (null == project) {
            log.warn("project ( :{} ) is not found", projectId);
            throw new NotFoundException("project is not found");
        }

        RelRoleProject rel = relRoleProjectMapper.getByRoleAndProject(id, projectId);
        if (null != rel) {
            log.warn("RelRoleProject (role:{}, project:{}) is already exist", id, projectId);
            throw new ServerException("Already exist");
        }

        RelRoleProject relRoleProject = new RelRoleProject(projectId, id);
        relRoleProject.createBy(user.getId());

        int insert = relRoleProjectMapper.insert(relRoleProject);
        if (null != relRoleProject.getId() && relRoleProject.getId().longValue() > 0L) {
            optLogger.info("create relRoleProject ( {} ) update by user( :{} )", relRoleProject.toString(), user.getId());
            RoleProject roleProject = new RoleProject(project);
            BeanUtils.copyProperties(relRoleProject, roleProject);
            return roleProject;
        } else {
            log.error("add RelRoleProject fail: (role: {}, project:{})", id, projectId);
            throw new ServerException("unspecified error");
        }
    }

    /**
     * 删除Role与Project关联
     *
     * @param relationId
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public boolean deleteProject(Long relationId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleProject relRoleProject = relRoleProjectMapper.getById(relationId);

        if (null == relRoleProject) {
            log.error("RelRoleProject ( :{} ) is not found", relationId);
            throw new NotFoundException("Not found");
        }

        Role role = null;
        try {
            role = getRole(relRoleProject.getRoleId(), user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.error("user( :{} ) have not permission to delete RelRoleProject (:{})", user.getId(), relationId);
            throw new UnAuthorizedExecption("you have not permission");
        }

        int i = relRoleProjectMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("relRoleProject ({}) delete by user(:{})", relRoleProject.toString(), user.getId());
            return true;
        } else {
            log.error("delete role project fail: (relationId:)", relationId);
            throw new ServerException("unspecified error");
        }
    }


    /**
     * 修改Role与Project关联信息
     *
     * @param relationId
     * @param projectRoleDto
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     * @throws NotFoundException
     */
    @Override
    public boolean updateProjectRole(Long relationId, RelRoleProjectDto projectRoleDto, User user) throws ServerException, UnAuthorizedExecption, NotFoundException {
        RelRoleProject relRoleProject = relRoleProjectMapper.getById(relationId);
        if (null == relRoleProject) {
            log.warn("relRoleProject (:{}) is not found", relationId);
            throw new NotFoundException("not found");
        }

        String origin = relRoleProject.toString();

        Role role = null;
        try {
            role = getRole(relRoleProject.getRoleId(), user);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            log.error("user( :{} ) have not permission to update RelRoleProject (:{})", user.getId(), relationId);
            throw new UnAuthorizedExecption("you have not permission");
        }

        //TODO project admin权限校验


        BeanUtils.copyProperties(projectRoleDto, relRoleProject);

        //校验数据合法性
        UserPermissionEnum sourceP = UserPermissionEnum.permissionOf(relRoleProject.getSourcePermission());
        if (null == sourceP) {
            log.warn("Invalid source permission :{}", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid source permission");
        }

        UserPermissionEnum viewP = UserPermissionEnum.permissionOf(relRoleProject.getViewPermission());
        if (null == viewP) {
            log.warn("Invalid view permission :{}", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid view permission");
        }

        UserPermissionEnum widgetP = UserPermissionEnum.permissionOf(relRoleProject.getWidgetPermission());
        if (null == widgetP) {
            log.warn("Invalid widget permission :{}", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid widget permission");
        }

        UserPermissionEnum vizP = UserPermissionEnum.permissionOf(relRoleProject.getVizPermission());
        if (null == vizP) {
            log.warn("Invalid viz permission :{}", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid viz permission");
        }

        UserPermissionEnum scheduleP = UserPermissionEnum.permissionOf(relRoleProject.getSchedulePermission());
        if (null == scheduleP) {
            log.warn("Invalid schedule permission :{}", relRoleProject.getSourcePermission());
            throw new UnAuthorizedExecption("Invalid schedule permission");
        }

        relRoleProject.updateBy(user.getId());
        int i = relRoleProjectMapper.update(relRoleProject);

        if (i > 0) {
            optLogger.info("relRoleProject ( {} ) update by user( :{} ), origin ( {} )", relRoleProject.toString(), user.getId(), origin);
            return true;
        } else {
            log.info("update role fail: {}", role.toString());
            throw new ServerException("update role fail: unspecified error");
        }

    }

    private Role getRole(Long id, User user) throws NotFoundException, UnAuthorizedExecption {
        Role role = roleMapper.getById(id);
        if (null == role) {
            log.warn("role (:{}) is not found", id);
            throw new NotFoundException("role is not found");
        }

        RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), role.getOrgId());
        if (null == rel) {
            throw new UnAuthorizedExecption("you have not permission");
        }
        return role;
    }

}
