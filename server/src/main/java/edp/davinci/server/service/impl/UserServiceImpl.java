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
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.controller.ResultMap;
import edp.davinci.server.dao.OrganizationExtendMapper;
import edp.davinci.server.dao.RelUserOrganizationExtendMapper;
import edp.davinci.server.dao.UserExtendMapper;
import edp.davinci.server.dto.organization.OrganizationInfo;
import edp.davinci.server.dto.user.*;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.HttpCodeEnum;
import edp.davinci.server.enums.LockType;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.MailContentTypeEnum;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.model.LdapPerson;
import edp.davinci.server.model.MailContent;
import edp.davinci.server.model.TokenEntity;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.service.LdapService;
import edp.davinci.server.service.UserService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.LockFactory;
import edp.davinci.server.util.MailUtils;
import edp.davinci.server.util.ServerUtils;
import edp.davinci.server.util.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONObject;
import com.jayway.jsonpath.JsonPath;

import javax.servlet.http.HttpServletRequest;
import java.util.*;


@Slf4j
@Service("userService")
public class UserServiceImpl extends BaseEntityService implements UserService {
	
	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private UserExtendMapper userExtendMapper;

    @Autowired
    private OrganizationExtendMapper organizationExtendMapper;

    @Autowired
    private RelUserOrganizationExtendMapper relUserOrganizationMapper;

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

	@Autowired
	private Environment environment;
    
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
        Long userId = userExtendMapper.getIdByName(name);
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
		// 用户名是否已经注册
        if (isExist(username, null, null)) {
            log.error("The username({}) has been registered", username);
            throw new ServerException("The username has been registered");
        }

		String email = userRegist.getEmail();
		// 邮箱是否已经注册
        if (isExist(email, null, null)) {
        	log.error("The email({}) has been registered", email);
            throw new ServerException("The email has been registered");
        }
        
        BaseLock usernameLock = getLock(entity, username, null);
		if (usernameLock != null && !usernameLock.getLock()) {
            log.error("The username({}) has been registered", username);
            throw new ServerException("The username has been registered");
		}
		
        BaseLock emailLock = null;
		if (!username.toLowerCase().equals(email.toLowerCase())) {
			emailLock = getLock(entity, email, null);
		}

        if (emailLock != null && !emailLock.getLock()) {
        	log.error("The email({}) has been registered", email);
            throw new ServerException("The email has been registered");
		}

		try {
			User user = new User();
			// 密码加密
			userRegist.setPassword(BCrypt.hashpw(userRegist.getPassword(), BCrypt.gensalt()));
			BeanUtils.copyProperties(userRegist, user);
			user.setActive(false);
            user.setAdmin(true);
    		user.setCreateBy(0L);
    		user.setCreateTime(new Date());
			
			// 添加用户
			if (userExtendMapper.insert(user) <= 0) {
				log.error("User({}) regist fail", userRegist.toString());
				throw new ServerException("Regist fail: unspecified error");
			}
			// 添加成功，发送激活邮件
			sendMail(user.getEmail(), user);
			return user;
		} finally {
			releaseLock(usernameLock);
			releaseLock(emailLock);
		}
    }
    
    @Override
    public User externalRegist(OAuth2AuthenticationToken oauthAuthToken) throws ServerException {
        OAuth2User oauthUser = oauthAuthToken.getPrincipal();

        User user = getByUsername(oauthUser.getName());
        if (user != null) {
            return user;
        }

        user = new User();

        String emailMapping = environment.getProperty(String.format("spring.security.oauth2.client.provider.%s.userMapping.email", oauthAuthToken.getAuthorizedClientRegistrationId()));
        String nameMapping = environment.getProperty(String.format("spring.security.oauth2.client.provider.%s.userMapping.name", oauthAuthToken.getAuthorizedClientRegistrationId()));
        String avatarMapping = environment.getProperty(String.format("spring.security.oauth2.client.provider.%s.userMapping.avatar", oauthAuthToken.getAuthorizedClientRegistrationId()));
        JSONObject jsonObj = new JSONObject(oauthUser.getAttributes());

        user.setName(JsonPath.read(jsonObj, nameMapping));
        user.setUsername(oauthUser.getName());
        user.setPassword("OAuth2");
        user.setEmail(JsonPath.read(jsonObj, emailMapping));
        user.setAvatar(JsonPath.read(jsonObj, avatarMapping));
        if (userExtendMapper.insert(user) > 0) {
            return user;
        } else {
            log.error("User({}) regist fail", oauthUser.getName());
            throw new ServerException("Regist fail: unspecified error");
        }
    }
    
    /**
     * 根据用户名获取用户
     *
     * @param username
     * @return
     */
    @Override
    public User getByUsername(String username) {
        return userExtendMapper.selectByUsername(username);
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

			log.error("Username({}) or password is wrong", username);
			throw new ServerException("Username or password is wrong");
        }

        user = ldapAutoRegist(username, password);
        if (user == null) {
        	throw new ServerException("Username or password is wrong");
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
			throw new ServerException("Username or password is wrong");
		}

		String email = ldapPerson.getEmail();
		if (userExtendMapper.existEmail(ldapPerson.getEmail())) {
			log.error("The email({}) has been registered", email);
			throw new ServerException("The email has been registered");
		}

		if (userExtendMapper.existUsername(ldapPerson.getSAMAccountName())) {
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
		List<UserBaseInfo> users = userExtendMapper.getUsersByKeyword(keyword, orgId);
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
        if (userExtendMapper.updateBaseInfo(user) <= 0) {
            log.info("Update user({}) fail", user.getId());
            throw new ServerException("Update user fail");
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

		BaseLock lock = LockFactory.getLock("ACTIVATE" + Constants.AT_SYMBOL + username.toUpperCase(), 5, LockType.REDIS);
		if (lock != null && !lock.getLock()) {
			return resultMap.fail().message("The current user is activating");
		}
		
		Long userId = user.getId();

		try {
			TokenEntity tokenDetail = new TokenEntity(user.getUsername(), user.getPassword());
			// 验证激活token
			if (tokenUtils.validateToken(token, tokenDetail)) {
				user.setActive(true);
				user.setUpdateTime(new Date());
				userExtendMapper.activeUser(user);

				String orgName = user.getUsername() + "'s Organization";
				// 激活成功，创建默认Orgnization
				Organization organization = new Organization();
		        organization.setName(orgName);
		        organization.setUserId(userId);
		        organization.setMemberNum(1);
		        organization.setProjectNum(0);
		        organization.setRoleNum(0);
		        organization.setMemberPermission((short)1);
		        organization.setAllowCreateProject(true);
		        organization.setCreateBy(userId);
		        organization.setCreateTime(new Date());
				organizationExtendMapper.insertSelective(organization);

				// 关联用户和组织，创建人是组织的owner
	            RelUserOrganization relUserOrganization = new RelUserOrganization();
	            relUserOrganization.setOrgId(organization.getId());
	            relUserOrganization.setUserId(userId);
	            relUserOrganization.setRole(UserOrgRoleEnum.OWNER.getRole());
	            relUserOrganization.setCreateBy(userId);
	            relUserOrganization.setCreateTime(new Date());
				relUserOrganizationMapper.insert(relUserOrganization);

				UserLoginResult userLoginResult = new UserLoginResult();
				BeanUtils.copyProperties(user, userLoginResult);
				return resultMap.success(tokenUtils.generateToken(tokenDetail)).payload(userLoginResult);
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
        TokenEntity tokenDetail = new TokenEntity(user.getUsername(), user.getPassword());
        content.put("token", AESUtils.encrypt(tokenUtils.generateContinuousToken(tokenDetail), null));

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
        if (userExtendMapper.changePassword(user) > 0) {
        	optLogger.info("Password is update by user({})", user.getId());
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
            return resultMap.failAndRefreshToken(request).message("File format error");
        }

        //上传文件
        String fileName = user.getUsername() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.USER_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(avatar)) {
                return resultMap.failAndRefreshToken(request).message("User avatar upload error");
            }
        } catch (Exception e) {
            log.error("User({}) avatar upload error, e={}", user.getUsername(), e.getMessage());
            return resultMap.failAndRefreshToken(request).message("User avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(user.getAvatar())) {
            fileUtils.remove(user.getAvatar());
        }

        //修改用户头像
        user.setAvatar(avatar);
        user.setUpdateTime(new Date());
        if (userExtendMapper.updateAvatar(user) > 0) {
            Map<String, String> map = new HashMap<>();
            map.put("avatar", avatar);
            return resultMap.successAndRefreshToken(request).payload(map);
        }
        
        return resultMap.failAndRefreshToken(request).message("User avatar upload error");
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

        User tempUser = userExtendMapper.selectByPrimaryKey(id);
        if (null == tempUser) {
            return resultMap.failAndRefreshToken(request).message("User not found");
        }
        
        UserProfile userProfile = new UserProfile();
        BeanUtils.copyProperties(tempUser, userProfile);
        if (id.equals(user.getId())) {
            List<OrganizationInfo> organizationInfos = organizationExtendMapper.getOrganizationByUser(user.getId());
            userProfile.setOrganizations(organizationInfos);
            return resultMap.successAndRefreshToken(request).payload(userProfile);
        }

        Long[] userIds = {user.getId(), id};
        List<OrganizationInfo> jointlyOrganization = organizationExtendMapper.getJointlyOrganization(Arrays.asList(userIds), id);
        if (!CollectionUtils.isEmpty(jointlyOrganization)) {
            BeanUtils.copyProperties(tempUser, userProfile);
            userProfile.setOrganizations(jointlyOrganization);
            return resultMap.successAndRefreshToken(request).payload(userProfile);
        }
        
        return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("You have not permission to view the user's information because you don't have any organizations that join together");
    }
}
