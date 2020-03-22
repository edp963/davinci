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

import edp.davinci.commons.util.AESUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Organization;
import edp.davinci.core.dao.entity.Project;
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.*;
import edp.davinci.server.dto.organization.*;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.MailContentTypeEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.MailContent;
import edp.davinci.server.model.TokenEntity;
import edp.davinci.server.model.User;
import edp.davinci.server.service.OrganizationService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.MailUtils;
import edp.davinci.server.util.ServerUtils;
import edp.davinci.server.util.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Slf4j
@Service("organizationService")
public class OrganizationServiceImpl extends BaseEntityService implements OrganizationService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private RelUserOrganizationExtendMapper relUserOrganizationMapper;

    @Autowired
    public OrganizationExtendMapper organizationExtendMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProjectExtendMapper projectExtendMapper;

    @Autowired
    private RoleExtendMapper roleMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private MailUtils mailUtils;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private ServerUtils serverUtils;
    
    private static final CheckEntityEnum entity = CheckEntityEnum.ORGANIZATION;

    @Override
    public boolean isExist(String name, Long id, Long scopeId) {
        Long orgId = organizationExtendMapper.getIdByName(name);
        if (null != id && null != orgId) {
            return !id.equals(orgId);
        }
        return null != orgId && orgId.longValue() > 0L;
    }

    /**
     * 新建组织
     *
     * @param organizationCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public OrganizationBaseInfo createOrganization(OrganizationCreate organizationCreate, User user) throws ServerException {

    	String name = organizationCreate.getName();
    	if (isExist(name, null, null)) {
			alertNameTaken(entity, name);
		}
    	
		BaseLock lock = getLock(entity, name, null);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		Long userId = user.getId();
    	
    	try {
    		//新增组织
            Organization organization = new Organization();
            organization.setName(organizationCreate.getName());
            organization.setDescription(organizationCreate.getDescription());
            organization.setMemberPermission((short)1);
            organization.setUserId(userId);
            organization.setCreateBy(userId);
            organization.setCreateTime(new Date());

            if (organizationExtendMapper.insert(organization) <= 0) {
                throw new ServerException("Create organization error");
            }
            
            optLogger.info("Organization({}) create by user({})", organization.getId(), userId);
            //用户-组织 建立关联
            RelUserOrganization relUserOrganization = new RelUserOrganization();
            relUserOrganization.setOrgId(organization.getId());
            relUserOrganization.setUserId(userId);
            relUserOrganization.setRole(UserOrgRoleEnum.OWNER.getRole());
            relUserOrganization.setCreateBy(userId);
            relUserOrganization.setCreateTime(new Date());
            relUserOrganizationMapper.insert(relUserOrganization);
            
            OrganizationBaseInfo organizationBaseInfo = new OrganizationBaseInfo();
            BeanUtils.copyProperties(organization, organizationBaseInfo);
            organizationBaseInfo.setRole(relUserOrganization.getRole());
            return organizationBaseInfo;

    	}finally {
			lock.release();
		}
    }

    /**
     * 修改组织信息
     * 只有organization的创建者和owner可以修改
     *
     * @param organizationPut
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateOrganization(OrganizationPut organizationPut, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	Long id = organizationPut.getId();
    	Organization organization = getOrganization(id);

        //验证修改权限，只有organization的创建者和owner可以修改
    	checkOwner(organization, user.getId(), id, "update");

    	String name = organizationPut.getName();
    	if (isExist(name, null, null)) {
			alertNameTaken(entity, name);
		}
    	
		BaseLock lock = getLock(entity, name, null);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {
			String origin = organization.toString();
	        BeanUtils.copyProperties(organizationPut, organization);
	        organization.setUpdateBy(user.getId());
	        organization.setUpdateTime(new Date());

	        if (organizationExtendMapper.update(organization) <= 0) {
	            throw new ServerException("Update organization error");
	        }

	        optLogger.info("Organization({}) is update by user({}), origin:{}", organization.getId(), user.getId(), origin);
	        return true;

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
    
	private void checkOwner(Organization organization, Long userId, Long id, String operation) {
		RelUserOrganization rel = relUserOrganizationMapper.getRel(userId, id);
		if (!organization.getUserId().equals(userId)
				&& (null == rel || rel.getRole() != UserOrgRoleEnum.OWNER.getRole())) {
			throw new UnAuthorizedExecption("You have not permission to " + operation + " this organization");
		}
	}

    /**
     * 上传组织头图
     *
     * @param id
     * @param file
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Map<String, String> uploadAvatar(Long id, MultipartFile file, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	Organization organization = getOrganization(id);

        //只有组织的创建者和owner有权限
        checkOwner(organization, user.getId(), id, "upload avatar to");

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            throw new ServerException("File format error");
        }

        //上传文件
        String fileName = user.getUsername() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.ORG_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(avatar)) {
                throw new ServerException("Organization avatar upload error");
            }
        } catch (Exception e) {
            log.error("Organization({}) avatar upload error, e:{}", organization.getName(), e.getMessage());
            throw new ServerException("Organization avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(organization.getAvatar())) {
            fileUtils.remove(organization.getAvatar());
        }

        //修改头像
        organization.setAvatar(avatar);
        organization.setUpdateTime(new Date());
        organization.setUpdateBy(user.getId());

        if (organizationExtendMapper.update(organization) <= 0) {
            throw new ServerException("Organization avatar update fail");
        }
        
        Map<String, String> map = new HashMap<>();
        map.put("avatar", avatar);
        return map;
    }


    /**
     * 删除组织
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteOrganization(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	Organization organization =getOrganization(id);

        //只有组织的创建者和owner有权限删除
        checkOwner(organization, user.getId(), id, "delete");

        //校验组织下是否有项目
        List<Project> projectList = projectExtendMapper.getByOrgId(id);
        if (!CollectionUtils.isEmpty(projectList)) {
            log.error("There is at least one project under the organization({}), it is can not be deleted", organization.getId());
            throw new ServerException("There is at least one project under this organization, it is can not be deleted");
        }

        relUserOrganizationMapper.deleteByOrgId(id);
        roleMapper.deleteByOrg(id);
        organizationExtendMapper.deleteByPrimaryKey(id);

        optLogger.info("Organization({}) is delete by user({})", organization.getId(), user.getId());
        return true;
    }

    /**
     * 获取组织详情
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    public OrganizationInfo getOrganization(Long id, User user) throws NotFoundException, UnAuthorizedExecption {

    	Organization organization = getOrganization(id);

    	RelUserOrganization rel = relUserOrganizationMapper.getRel(user.getId(), id);
        if (null == rel) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        OrganizationInfo organizationInfo = new OrganizationInfo();
        BeanUtils.copyProperties(organization, organizationInfo);
        organizationInfo.setRole(rel.getRole());
        return organizationInfo;
    }

    /**
     * 获取组织列表
     * 当前用户创建 + Member（关联表用户是当前用户）
     *
     * @param user
     * @return
     */
    @Override
    public List<OrganizationInfo> getOrganizations(User user) {
        List<OrganizationInfo> organizationInfos = organizationExtendMapper.getOrganizationByUser(user.getId());
        organizationInfos.forEach(o -> {
            if (o.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
                o.setAllowCreateProject(true);
            }
        });
        return organizationInfos;
    }

    /**
     * 获取组织成员列表
     *
     * @param id
     * @return
     */
    @Override
    public List<OrganizationMember> getOrgMembers(Long id) {
        return relUserOrganizationMapper.getOrgMembers(id);
    }


    /**
     * 邀请成员
     *
     * @param orgId
     * @param memId
     * @param user
     * @return
     */
    @Override
    public void inviteMember(Long orgId, Long memId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        //验证组织
        Organization organization = getOrganization(orgId);

        //验证被邀请者
        User member = userMapper.getById(memId);
        if (null == member) {
            log.info("user (:{}) is not found", memId);
            throw new NotFoundException("user is not found");
        }

        // 验证用户权限，只有organization的owner可以邀请
        RelUserOrganization relOwner = relUserOrganizationMapper.getRel(user.getId(), orgId);
        if (null == relOwner || relOwner.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            throw new UnAuthorizedExecption("You can not invite anyone to join this orgainzation, cause you are not the owner of this orginzation");
        }

        //验证被邀请用户是否已经加入
        RelUserOrganization rel = relUserOrganizationMapper.getRel(memId, orgId);
        if (null != rel) {
            throw new ServerException("The invitee is already a member of  this organization");
        }

        //校验邮箱
        if (StringUtils.isEmpty(user.getEmail())) {
            throw new ServerException("The email address of the invitee is empty");
        }

        /**
         * 邀请组织成员token生成实体
         * 规则：
         * username: 邀请人id:-:被邀请人id:-:组织id
         * password: 被邀请人密码
         */
        TokenEntity orgInviteDetail = new TokenEntity();
        orgInviteDetail.setUsername(user.getId() + Constants.SPLIT_CHAR_STRING + memId + Constants.SPLIT_CHAR_STRING + organization.getId());
        orgInviteDetail.setPassword(member.getPassword());

        Map<String, Object> content = new HashMap<>();
        content.put("username", member.getUsername());
        content.put("inviter", user.getUsername());
        content.put("orgName", organization.getName());
        content.put("host", serverUtils.getHost());
        //aes加密token
        content.put("token", AESUtils.encrypt(tokenUtils.generateContinuousToken(orgInviteDetail), null));
        try {
            MailContent mailContent = MailContent.MailContentBuilder.builder()
                    .withSubject(String.format(Constants.INVITE_ORG_MEMBER_MAIL_SUBJECT, user.getUsername(), organization.getName()))
                    .withTo(member.getEmail())
                    .withMainContent(MailContentTypeEnum.TEMPLATE)
                    .withTemplate(Constants.INVITE_ORG_MEMBER_MAIL_TEMPLATE)
                    .withTemplateContent(content)
                    .build();

            mailUtils.sendMail(mailContent, null);
        } catch (ServerException e) {
			log.error(e.getMessage(), e);
        }
    }


    /**
     * 组织成员确认邀请
     *
     * @param token
     * @param user
     * @return
     */
    @Override
    @Transactional
    public OrganizationInfo confirmInvite(String token, User user) throws ServerException {
		// aes解密
		token = AESUtils.decrypt(token, null);

		// 验证token(特殊验证，不走util)
		String tokenUserName = tokenUtils.getUsername(token);
		String tokenPassword = tokenUtils.getPassword(token);
		if (StringUtils.isEmpty(tokenUserName) || StringUtils.isEmpty(tokenPassword)) {
			log.error("ConfirmInvite error: token detail id empty");
			throw new ServerException("Username or password cannot be empty");
		}

		String[] ids = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
		if (ids.length != 3) {
			log.error("ConfirmInvite error: invalid token username");
			throw new ServerException("Invalid Token");
		}

		Long inviterId = Long.parseLong(ids[0]);
		Long memeberId = Long.parseLong(ids[1]);
		Long orgId = Long.parseLong(ids[2]);
		if (!user.getId().equals(memeberId)) {
			log.error("ConfirmInvite error: invalid token member, username is wrong");
			throw new ServerException("Username is wrong");
		}

		if (!user.getPassword().equals(tokenPassword)) {
			log.error("ConfirmInvite error: invalid token password");
			throw new ServerException("Password is wrong");
		}

		User inviter = userMapper.getById(inviterId);
		if (null == inviter) {
			log.error("ConfirmInvite error: invalid token inviter");
			throw new ServerException("Invalid Token");
		}

		Organization organization = getOrganization(orgId);
		OrganizationInfo organizationInfo = new OrganizationInfo();
		BeanUtils.copyProperties(organization, organizationInfo);

		RelUserOrganization tokenRel = relUserOrganizationMapper.getRel(inviterId, orgId);
		if (null != tokenRel && tokenRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
			log.info("ConfirmInvite error: invalid token inviter permission");
			throw new ServerException("Invalid Token");
		}

		isJoined(memeberId, orgId);
		// 验证通过，建立关联
		 RelUserOrganization rel = new RelUserOrganization();
		 rel.setOrgId(orgId);
         rel.setUserId(memeberId);
         rel.setRole(UserOrgRoleEnum.MEMBER.getRole());
         rel.setCreateBy(user.getId());
         rel.setCreateTime(new Date());
		if (relUserOrganizationMapper.insert(rel) <= 0) {
			throw new ServerException("Unknown fail");
		}

		// 修改成员人数
		// TODO num is wrong in concurrent cases
		organization.setMemberNum(organization.getMemberNum() + 1);
		organizationExtendMapper.updateMemberNum(organization);
		organizationInfo.setRole(rel.getRole());
		return organizationInfo;
    }
    
    private void isJoined(Long memeberId, Long orgId) {
		RelUserOrganization rel = relUserOrganizationMapper.getRel(memeberId, orgId);
		if (rel != null) {
			throw new ServerException("You have joined the organization and don't need to repeat.");
		}
    }

	@Override
	@Transactional
	public void confirmInviteNoLogin(String token) throws NotFoundException, ServerException {
		// aes解密
		token = AESUtils.decrypt(token, null);

		// 验证token(特殊验证，不走util)
		String tokenUserName = tokenUtils.getUsername(token);
		String tokenPassword = tokenUtils.getPassword(token);

		if (StringUtils.isEmpty(tokenUserName) || StringUtils.isEmpty(tokenPassword)) {
			log.error("ConfirmInvite error: token detail id empty");
			throw new ServerException("Invalid Token");
		}

		String[] ids = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
		if (ids.length != 3) {
			log.error("ConfirmInvite error: invalid token username");
			throw new ServerException("Invalid Token");
		}

		Long inviterId = Long.parseLong(ids[0]);
		Long memeberId = Long.parseLong(ids[1]);
		Long orgId = Long.parseLong(ids[2]);
		User inviter = userMapper.getById(inviterId);
		if (null == inviter) {
			log.error("ConfirmInvite error: invalid token inviter");
			throw new ServerException("Invalid Token");
		}

		Organization organization = getOrganization(orgId);

		RelUserOrganization tokenRel = relUserOrganizationMapper.getRel(inviterId, orgId);
		if (null != tokenRel && tokenRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
			log.error("ConfirmInvite error: invalid token inviter permission");
			throw new ServerException("Invalid Token");
		}

		User member = userMapper.getById(memeberId);
		if (null == member) {
			throw new NotFoundException("User is not found");
		}

		isJoined(memeberId, orgId);
		// 验证通过，建立关联
		 RelUserOrganization rel = new RelUserOrganization();
		 rel.setOrgId(orgId);
        rel.setUserId(memeberId);
        rel.setRole(UserOrgRoleEnum.MEMBER.getRole());
        rel.setCreateBy(memeberId);
        rel.setCreateTime(new Date());
		relUserOrganizationMapper.insert(rel);
		// 修改成员人数
		// TODO num is wrong in concurrent cases
		organization.setMemberNum(organization.getMemberNum() + 1);
		organizationExtendMapper.updateMemberNum(organization);
	}

    /**
     * 删除组织成员
     *
     * @param relationId
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteOrgMember(Long relationId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	RelUserOrganization rel = relUserOrganizationMapper.getById(relationId);
        if (null == rel) {
            throw new ServerException("This member is no longer the member of the organization");
        }

        Long orgId = rel.getOrgId();
        //验证权限，只有owner可以删除
        checkOwner(user.getId(), orgId, "delete");

        Organization organization = getOrganization(orgId);
        if (organization.getUserId().equals(rel.getUserId())) {
            throw new UnAuthorizedExecption("You have not permission delete the creator of the organization");
        }

        if (rel.getUserId().equals(user.getId())) {
            throw new ServerException("You can not delete yourself in this organization");
        }

        if (relUserOrganizationMapper.deleteById(relationId) <= 0) {
            throw new ServerException("Unknown fail");
        }
        
		// 更新组织成员数量
        // TODO num is wrong in concurrent cases
		int memberNum = organization.getMemberNum();
		organization.setMemberNum(memberNum > 0 ? memberNum - 1 : memberNum);
		organizationExtendMapper.updateMemberNum(organization);
		return true;
    }
    
    private void checkOwner(Long userId, Long orgId, String operation) {
        RelUserOrganization ownerRel = relUserOrganizationMapper.getRel(userId, orgId);
        if (null != ownerRel && ownerRel.getRole() != UserOrgRoleEnum.OWNER.getRole()) {
            throw new UnAuthorizedExecption("You can not " +operation+ " any member of this organization, cause you are not the owner of this ordination");
        }
    }

    /**
     * 更改成员角色
     *
     * @param relationId
     * @param user
     * @param role
     * @return
     */
    @Override
    @Transactional
    public boolean updateMemberRole(Long relationId, User user, short role) throws NotFoundException, UnAuthorizedExecption, ServerException {

        RelUserOrganization rel = relUserOrganizationMapper.getById(relationId);
        
        if (null == rel) {
            throw new ServerException("This member are no longer member of the organization");
        }

        Long orgId = rel.getOrgId();
        getOrganization(orgId);

        //验证权限，只有owner可以更改
        checkOwner(user.getId(), orgId, "update");

        UserOrgRoleEnum userOrgRoleEnum = UserOrgRoleEnum.roleOf(role);
        if (null == userOrgRoleEnum) {
            throw new ServerException("Invalid role");
        }

        //不可以更改自己的权限
        if (user.getId().equals(rel.getUserId())) {
            throw new ServerException("You cannot change your own role");
        }

        //不需要更改
        if ((int) rel.getRole() == role) {
            throw new ServerException("This member does not need to change role");
        }

        String origin = rel.toString();

        rel.setRole(userOrgRoleEnum.getRole());
        rel.setUpdateBy(user.getId());
        rel.setUpdateTime(new Date());
        if (relUserOrganizationMapper.updateMemberRole(rel) <= 0) {
            throw new ServerException("Unknown fail");
        }

        optLogger.info("RelUserOrganization({}) is update by user({}), origin:{}", rel.toString(), user.getId(), origin);
        return true;
    }
}
