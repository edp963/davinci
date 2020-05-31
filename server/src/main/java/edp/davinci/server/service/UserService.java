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

package edp.davinci.server.service;


import edp.davinci.server.controller.ResultMap;
import edp.davinci.server.dto.user.UserBaseInfo;
import edp.davinci.server.dto.user.UserDistinctTicket;
import edp.davinci.server.dto.user.UserLogin;
import edp.davinci.server.dto.user.UserRegist;
import edp.davinci.server.enums.UserDistinctType;
import edp.davinci.server.exception.ServerException;
import edp.davinci.core.dao.entity.User;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface UserService extends CheckEntityService {

    User getByUsername(String username);

    User userLogin(UserLogin userLogin) throws ServerException;

    List<UserBaseInfo> getUsersByKeyword(String keyword, User user, Long orgId, Boolean includeSelf);

    boolean updateUser(User user) throws ServerException;

    User regist(UserRegist userRegist) throws ServerException;
    
    User externalRegist(OAuth2AuthenticationToken oauthAuthToken) throws ServerException;

    boolean sendMail(String email, User user) throws ServerException;

    ResultMap changeUserPassword(User user, String oldPassword, String password, HttpServletRequest request);

    ResultMap uploadAvatar(User user, MultipartFile file, HttpServletRequest request);

    ResultMap activateUserNoLogin(String token, HttpServletRequest request);

    ResultMap getUserProfile(Long id, User user, HttpServletRequest request);
    
    ResultMap getUserProfileFromToken(String token);

    String forgetPassword(UserDistinctType userDistinctType, UserDistinctTicket ticket);

    boolean resetPassword(UserDistinctType userDistinctType, String token, UserDistinctTicket ticket);
}
