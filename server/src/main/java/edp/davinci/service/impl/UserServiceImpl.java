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

import com.alibaba.druid.util.StringUtils;

import edp.core.consts.Consts;
import edp.core.enums.HttpCodeEnum;
import edp.core.enums.MailContentTypeEnum;
import edp.core.exception.ServerException;
import edp.core.model.MailContent;
import edp.core.utils.*;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.LockType;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.dao.OrganizationMapper;
import edp.davinci.dao.RelUserOrganizationMapper;
import edp.davinci.dao.UserMapper;
import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.dto.userDto.*;
import edp.davinci.model.LdapPerson;
import edp.davinci.model.Organization;
import edp.davinci.model.RelUserOrganization;
import edp.davinci.model.User;
import edp.davinci.service.LdapService;
import edp.davinci.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;


@Slf4j
@Service("userService")
public class UserServiceImpl extends BaseEntityService implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private MailUtils mailUtils;


    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private ServerUtils serverUtils;

    @Autowired
    private LdapService ldapService;
    
    private static final CheckEntityEnum entity = CheckEntityEnum.USER;

    /**
     * 用户是否存在
     *
     * @param name
     * @param scopeId
     * @return
     */
    @Override
    public boolean isExist(String name, Long id, Long scopeId) {
        Long userId = userMapper.getIdByName(name);
        if (null != id && null != userId) {
            return !id.equals(userId);
        }
        return null != userId && userId.longValue() > 0L;
    }

    /**
     * 用户注册接口
     *
     * @param userRegist
     * @return
     */
    @Override
    @Transactional
    public User regist(UserRegist userRegist) throws ServerException {
        
    	String username = userRegist.getUsername();
    	//用户名是否已经注册
        if (isExist(username, null, null)) {
            log.info("the username {} has been registered", username);
            throw new ServerException("the username:" + username + " has been registered");
        }
        
        String email = userRegist.getEmail();
        //邮箱是否已经注册
        if (isExist(email, null, null)) {
        	log.info("the email {} has been registered", email);
            throw new ServerException("the email:" + email + " has been registered");
        }
        
        BaseLock usernameLock = getLock(entity, username, null);
		if (usernameLock != null && !usernameLock.getLock()) {
			alertNameTaken(entity, username);
		}
		
        BaseLock emailLock = null;
        if (!username.toLowerCase().equals(email.toLowerCase())) {
        	emailLock =getLock(entity, email, null);
        }

        if (emailLock != null && !emailLock.getLock()) {
			alertNameTaken(entity, email);
		}
		
		try {
			User user = new User();
	        //密码加密
	        userRegist.setPassword(BCrypt.hashpw(userRegist.getPassword(), BCrypt.gensalt()));
	        BeanUtils.copyProperties(userRegist, user);
	        //添加用户
	        if (userMapper.insert(user) <= 0) {
	            log.info("regist fail: {}", userRegist.toString());
	            throw new ServerException("regist fail: unspecified error");
	        }
	        //添加成功，发送激活邮件
            sendMail(user.getEmail(), user);
            return user;
		}finally {
			releaseLock(usernameLock);
			releaseLock(emailLock);
		}
    }
    
	protected void alertNameTaken(CheckEntityEnum entity, String name) throws ServerException {
		log.warn("the {} username or email ({}) has been registered", entity.getSource(), name);
		throw new ServerException("the " + entity.getSource() + " username or email has been registered");
	}

    /**
     * 根据用户名获取用户
     *
     * @param username
     * @return
     */
    @Override
    public User getByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    /**
     * 用户登录
     *
     * @param userLogin
     * @return
     */
    @Override
    public User userLogin(UserLogin userLogin) throws ServerException {
    	
    	String username = userLogin.getUsername();
    	String password = userLogin.getPassword();
    	
        User user = getByUsername(username);
        if (user != null) {
			// 校验密码
			boolean checkpw = false;
			try {
				checkpw = BCrypt.checkpw(password, user.getPassword());
			} catch (Exception e) {

			}

			if (checkpw) {
				return user;
			}

			if (ldapLogin(username, password)) {
				return user;
			}

			log.info("username({}) password is wrong", username);
			throw new ServerException("username or password is wrong");
        }

        user = ldapAutoRegist(username, password);
        if (user == null) {
        	throw new ServerException("username or password is wrong");
        }
        return user;
    }
    
    private boolean ldapLogin(String username, String password) {
    	if (!ldapService.existLdapServer()) {
			return false;
		}
		
		LdapPerson ldapPerson = ldapService.findByUsername(username, password);
		if (null == ldapPerson) {
			return false;
		}
		
		return true;
    }
    
	private User ldapAutoRegist(String username, String password) {

		if (!ldapService.existLdapServer()) {
			return null;
		}
		
		LdapPerson ldapPerson = ldapService.findByUsername(username, password);
		if (null == ldapPerson) {
			throw new ServerException("username or password is wrong");
		}

		String email = ldapPerson.getEmail();
		if (userMapper.existEmail(ldapPerson.getEmail())) {
			log.info("ldap auto regist fail: the email {} has been registered", email);
			throw new ServerException("ldap auto regist fail: the email " + email + " has been registered");
		}

		if (userMapper.existUsername(ldapPerson.getSAMAccountName())) {
			ldapPerson.setSAMAccountName(email);
		}

		return ldapService.registPerson(ldapPerson);
	}

    /**
     * 查询用户
     *
     * @param keyword
     * @param user
     * @param orgId
     * @param includeSelf
     * @return
     */
    @Override
	public List<UserBaseInfo> getUsersByKeyword(String keyword, User user, Long orgId, Boolean includeSelf) {
		List<UserBaseInfo> users = userMapper.getUsersByKeyword(keyword, orgId);
		if (includeSelf) {
			return users;
		}

		Iterator<UserBaseInfo> iterator = users.iterator();
		while (iterator.hasNext()) {
			UserBaseInfo userBaseInfo = iterator.next();
			if (userBaseInfo.getId().equals(user.getId())) {
				iterator.remove();
			}
		}

		return users;
	}

    /**
     * 更新用户
     *
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateUser(User user) throws ServerException {
        if (userMapper.updateBaseInfo(user) <= 0) {
            log.info("update user fail, username: {}", user.getUsername());
            throw new ServerException("update user fail");
        }
        return true;
    }

    @Override
    @Transactional
    public ResultMap activateUserNoLogin(String token, HttpServletRequest request) {
		ResultMap resultMap = new ResultMap(tokenUtils);

		token = AESUtils.decrypt(token, null);
		String username = tokenUtils.getUsername(token);
		if (null == username) {
			return resultMap.fail().message("The activate toke is invalid");
		}
		
		User user = getByUsername(username);
		if (null == user) {
			return resultMap.fail().message("The activate toke is invalid");
		}

		// 已经激活，不需要再次激活
		if (user.getActive()) {
			return resultMap.fail(302).message("The current user is activated and doesn't need to be reactivated");
		}

		BaseLock lock = LockFactory.getLock("ACTIVATE" + Consts.AT_SYMBOL + username.toUpperCase(), 5, LockType.REDIS);
		if (lock != null && !lock.getLock()) {
			return resultMap.fail().message("The current user is activating");
		}

		try {
			// 验证激活token
			if (tokenUtils.validateToken(token, user)) {
				user.setActive(true);
				user.setUpdateTime(new Date());
				userMapper.activeUser(user);

				String orgName = user.getUsername() + "'s Organization";
				// 激活成功，创建默认Orgnization
				Organization organization = new Organization(orgName, null, user.getId());
				organizationMapper.insert(organization);

				// 关联用户和组织，创建人是组织的owner
				RelUserOrganization relUserOrganization = new RelUserOrganization(organization.getId(), user.getId(),
						UserOrgRoleEnum.OWNER.getRole());
				relUserOrganizationMapper.insert(relUserOrganization);

				UserLoginResult userLoginResult = new UserLoginResult();
				BeanUtils.copyProperties(user, userLoginResult);
				return resultMap.success(tokenUtils.generateToken(user)).payload(userLoginResult);
			}

			return resultMap.fail().message("The activate toke is invalid");

		} finally {
			releaseLock(lock);
		}
    }

    /**
     * 发送邮件
     *
     * @param email
     * @param user
     * @return
     */
    @Override
    public boolean sendMail(String email, User user) throws ServerException {
        //校验邮箱
        if (!email.equals(user.getEmail())) {
            throw new ServerException("The current email address is not match user email address");
        }

        Map<String, Object> content = new HashMap<String, Object>();
        content.put("username", user.getUsername());
        content.put("host", serverUtils.getHost());
        content.put("token", AESUtils.encrypt(tokenUtils.generateContinuousToken(user), null));

        MailContent mailContent = MailContent.MailContentBuilder.builder()
                .withSubject(Constants.USER_ACTIVATE_EMAIL_SUBJECT)
                .withTo(user.getEmail())
                .withMainContent(MailContentTypeEnum.TEMPLATE)
                .withTemplate(Constants.USER_ACTIVATE_EMAIL_TEMPLATE)
                .withTemplateContent(content)
                .build();

        mailUtils.sendMail(mailContent, null);
        return true;
    }

    /**
     * 修改用户密码
     *
     * @param user
     * @param oldPassword
     * @param password
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap changeUserPassword(User user, String oldPassword, String password, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //校验原密码
        if (!BCrypt.checkpw(oldPassword, user.getPassword())) {
            return resultMap.failAndRefreshToken(request).message("Incorrect original password");
        }
        //设置新密码
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setUpdateTime(new Date());
        if (userMapper.changePassword(user) > 0) {
            return resultMap.success().message("Successful password modification");
        }
        
        return resultMap.failAndRefreshToken(request);
    }

    /**
     * 上传头像
     *
     * @param user
     * @param file
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap uploadAvatar(User user, MultipartFile file, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = user.getUsername() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.USER_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(avatar)) {
                return resultMap.failAndRefreshToken(request).message("user avatar upload error");
            }
        } catch (Exception e) {
            log.error("user avatar upload error, username: {}, error: {}", user.getUsername(), e.getMessage());
            return resultMap.failAndRefreshToken(request).message("user avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(user.getAvatar())) {
            fileUtils.remove(user.getAvatar());
        }

        //修改用户头像
        user.setAvatar(avatar);
        user.setUpdateTime(new Date());
        if (userMapper.updateAvatar(user) > 0) {
            Map<String, String> map = new HashMap<>();
            map.put("avatar", avatar);
            return resultMap.successAndRefreshToken(request).payload(map);
        }
        
        return resultMap.failAndRefreshToken(request).message("server error, user avatar update fail");
    }


    /**
     * 查询用户信息
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getUserProfile(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        User tempUser = userMapper.getById(id);
        if (null == tempUser) {
            return resultMap.failAndRefreshToken(request).message("user not found");
        }
        
        UserProfile userProfile = new UserProfile();
        BeanUtils.copyProperties(tempUser, userProfile);
        if (id.equals(user.getId())) {
            List<OrganizationInfo> organizationInfos = organizationMapper.getOrganizationByUser(user.getId());
            userProfile.setOrganizations(organizationInfos);
            return resultMap.successAndRefreshToken(request).payload(userProfile);
        }

        Long[] userIds = {user.getId(), id};
        List<OrganizationInfo> jointlyOrganization = organizationMapper.getJointlyOrganization(Arrays.asList(userIds), id);
        if (!CollectionUtils.isEmpty(jointlyOrganization)) {
            BeanUtils.copyProperties(tempUser, userProfile);
            userProfile.setOrganizations(jointlyOrganization);
            return resultMap.successAndRefreshToken(request).payload(userProfile);
        }
        
        return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("You have not permission to view the user's information because you don't have any organizations that join together");
    }
}
