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
import edp.core.enums.HttpCodeEnum;
import edp.core.enums.MailContentTypeEnum;
import edp.core.exception.ServerException;
import edp.core.model.MailContent;
import edp.core.utils.*;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
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
public class UserServiceImpl implements UserService {

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

    /**
     * 用户是否存在
     *
     * @param name
     * @param scopeId
     * @return
     */
    @Override
    public synchronized boolean isExist(String name, Long id, Long scopeId) {
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
    public synchronized User regist(UserRegist userRegist) throws ServerException {
        //用户名是否已经注册
        if (isExist(userRegist.getUsername(), null, null)) {
            log.info("the username {} has been registered", userRegist.getUsername());
            throw new ServerException("the username:" + userRegist.getUsername() + " has been registered");
        }
        //邮箱是否已经注册
        if (isExist(userRegist.getEmail(), null, null)) {
            log.info("the email:" + userRegist.getEmail() + " has been registered");
            throw new ServerException("the email:" + userRegist.getEmail() + " has been registered");
        }

        User user = new User();
        //密码加密
        userRegist.setPassword(BCrypt.hashpw(userRegist.getPassword(), BCrypt.gensalt()));
        BeanUtils.copyProperties(userRegist, user);
        //添加用户
        int insert = userMapper.insert(user);
        if (insert > 0) {
            //添加成功，发送激活邮件
            sendMail(user.getEmail(), user);
            return user;
        } else {
            log.info("regist fail: {}", userRegist.toString());
            throw new ServerException("regist fail: unspecified error");
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
        User user = userMapper.selectByUsername(userLogin.getUsername());
        ServerException e = null;
        if (null == user) {
            log.info("user not found: {}", userLogin.getUsername());
            e = new ServerException("user is not found");
        }
        //校验密码
        if (null != user) {
            boolean checkpw = false;
            try {
                checkpw = BCrypt.checkpw(userLogin.getPassword(), user.getPassword());
            } catch (Exception e1) {
            }
            if (!checkpw) {
                log.info("password is wrong: {}", userLogin.getUsername());
                e = new ServerException("password is wrong");
            }
        }

        if (null != e) {
            if (!ldapService.existLdapServer()) {
                throw e;
            }
            LdapPerson ldapPerson = ldapService.findByUsername(userLogin.getUsername(), userLogin.getPassword());
            if (null == ldapPerson) {
                throw new ServerException("username or password is wrong");
            } else {
                if (null == user) {
                    if (userMapper.existEmail(ldapPerson.getEmail())) {
                        throw new ServerException("password is wrong");
                    }
                    if (userMapper.existUsername(ldapPerson.getSAMAccountName())) {
                        ldapPerson.setSAMAccountName(ldapPerson.getEmail());
                    }
                    user = ldapService.registPerson(ldapPerson);
                } else if (user.getEmail().toLowerCase().equals(ldapPerson.getEmail().toLowerCase())) {
                    return user;
                } else {
                    throw e;
                }
            }
        }

        return user;
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
        if (userMapper.updateBaseInfo(user) > 0) {
            return true;
        } else {
            log.info("update user fail, username: {}", user.getUsername());
            throw new ServerException("update fail");
        }
    }

    @Override
    @Transactional
    public synchronized ResultMap activateUserNoLogin(String token, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        token = AESUtils.decrypt(token, null);

        String username = tokenUtils.getUsername(token);

        User user = userMapper.selectByUsername(username);

        if (null == user) {
            return resultMap.fail().message("The activate toke is invalid");
        }

        //已经激活，不需要再次激活
        if (user.getActive()) {
            return resultMap.fail(302).message("The current user is activated and doesn't need to be reactivated");
        }
        //验证激活token
        if (tokenUtils.validateToken(token, user)) {
            user.setActive(true);
            user.setUpdateTime(new Date());
            userMapper.activeUser(user);

            String OrgName = user.getUsername() + "'s Organization";

            //激活成功，创建默认Orgnization
            Organization organization = new Organization(OrgName, null, user.getId());
            organizationMapper.insert(organization);

            //关联用户和组织，创建人是组织的owner
            RelUserOrganization relUserOrganization = new RelUserOrganization(organization.getId(), user.getId(), UserOrgRoleEnum.OWNER.getRole());
            relUserOrganizationMapper.insert(relUserOrganization);

            UserLoginResult userLoginResult = new UserLoginResult();
            BeanUtils.copyProperties(user, userLoginResult);
            return resultMap.success(tokenUtils.generateToken(user)).payload(userLoginResult);
        } else {
            return resultMap.fail().message("The activate toke is invalid");
        }
    }

//    /**
//     * 用户激活
//     *
//     * @param user
//     * @param token
//     * @param request
//     * @return
//     */
//    @Override
//    @Transactional
//    public ResultMap activateUser(User user, String token, HttpServletRequest request) {
//        //已经激活，不需要再次激活
//        if (user.getActive()) {
//            return resultMap.failAndRefreshToken(request).message("The current user is activated and doesn't need to be reactivated");
//        }
//        //验证激活token
//        if (tokenUtils.validateToken(token, user)) {
//            user.setActive(true);
//            user.setUpdateTime(new Date());
//            userMapper.activeUser(user);
//
//            //激活成功，创建默认Orgnization
//            Organization organization = new Organization(Constants.DEFAULT_ORGANIZATION_NAME, Constants.DEFAULT_ORGANIZATION_DES, user.getId());
//            organizationMapper.insert(organization);
//
//            //关联用户和组织，创建人是组织的owner
//            RelUserOrganization relUserOrganization = new RelUserOrganization(organization.getId(), user.getId(), UserOrgRoleEnum.OWNER.getRole());
//            relUserOrganizationMapper.insert(relUserOrganization);
//
//            UserLoginResult userLoginResult = new UserLoginResult();
//            BeanUtils.copyProperties(user, userLoginResult);
//            return resultMap.successAndRefreshToken(request).payload(userLoginResult);
//        } else {
//            return resultMap.failAndRefreshToken(request).message("The activate toke is invalid");
//        }
//    }

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

        Map content = new HashMap<String, Object>();
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
        int i = userMapper.changePassword(user);
        if (i > 0) {
            return resultMap.success().message("Successful password modification");
        } else {
            return resultMap.failAndRefreshToken(request);
        }
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
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message("user avatar upload error");
        }

        //删除原头像
        if (!StringUtils.isEmpty(user.getAvatar())) {
            fileUtils.remove(user.getAvatar());
        }

        //修改用户头像
        user.setAvatar(avatar);
        user.setUpdateTime(new Date());
        int i = userMapper.updateAvatar(user);
        if (i > 0) {
            Map<String, String> map = new HashMap<>();
            map.put("avatar", avatar);

            return resultMap.successAndRefreshToken(request).payload(map);
        } else {
            return resultMap.failAndRefreshToken(request).message("server error, user avatar update fail");
        }
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

        User user1 = userMapper.getById(id);
        if (null != user1) {
            UserProfile userProfile = new UserProfile();
            BeanUtils.copyProperties(user1, userProfile);
            if (user1.getId().equals(user.getId())) {
                List<OrganizationInfo> organizationInfos = organizationMapper.getOrganizationByUser(user.getId());
                userProfile.setOrganizations(organizationInfos);
                return resultMap.successAndRefreshToken(request).payload(userProfile);
            }
            Long[] userIds = {user.getId(), user1.getId()};
            List<OrganizationInfo> jointlyOrganization = organizationMapper.getJointlyOrganization(Arrays.asList(userIds), id);
            if (!CollectionUtils.isEmpty(jointlyOrganization)) {
                BeanUtils.copyProperties(user1, userProfile);
                userProfile.setOrganizations(jointlyOrganization);
                return resultMap.successAndRefreshToken(request).payload(userProfile);
            } else {
                return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("You have not permission to view the user's information because you don't have any organizations that join together");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("user not found");
        }
    }
}
