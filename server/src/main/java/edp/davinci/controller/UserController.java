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

package edp.davinci.controller;

import com.alibaba.druid.util.StringUtils;
import edp.core.annotation.AuthIgnore;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserDistinctType;
import edp.davinci.dto.userDto.*;
import edp.davinci.model.User;
import edp.davinci.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;


@Api(value = "/users", tags = "users", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "user not found"))
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/users", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@Slf4j
public class UserController extends BaseController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     *
     * @param userRegist
     * @param bindingResult
     * @return
     */
    @ApiOperation(value = "insert user")
    @AuthIgnore
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity regist(@Valid @RequestBody UserRegist userRegist, @ApiIgnore BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        User user = userService.regist(userRegist);
        return ResponseEntity.ok(new ResultMap().success().payload(tokenUtils.generateToken(user)));
    }


    /**
     * 用户激活
     *
     * @param token
     * @param request
     * @return
     */
    @ApiOperation(value = "active user")
    @AuthIgnore
    @PostMapping(value = "/active/{token}")
    public ResponseEntity activate(@PathVariable String token,
                                   HttpServletRequest request) {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("The activate token can not be EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = userService.activateUserNoLogin(token, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 重发邮件
     *
     * @param sendMail
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "user active sendmail")
    @PostMapping(value = "/sendmail", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity sendMail(@Valid @RequestBody SendMail sendMail,
                                   @ApiIgnore BindingResult bindingResult,
                                   @ApiIgnore @CurrentUser User user,
                                   HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        userService.sendMail(sendMail.getEmail(), user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    /**
     * 修改用户信息
     *
     * @param id
     * @param userPut
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update user info", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity putUser(@PathVariable Long id,
                                  @RequestBody UserPut userPut,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid user id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        if (!user.getId().equals(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Illegal user identity");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        BeanUtils.copyProperties(userPut, user);
        userService.updateUser(user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    /**
     * 修改用户密码
     *
     * @param id
     * @param changePassword
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "change user password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}/changepassword", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity changeUserPassword(@PathVariable Long id,
                                             @Valid @RequestBody ChangePassword changePassword,
                                             @ApiIgnore BindingResult bindingResult,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid user id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        if (!user.getId().equals(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Illegal user identity");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = userService.changeUserPassword(user, changePassword.getOldPassword(), changePassword.getPassword(), request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 上传头像
     *
     * @param id
     * @param file
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "upload avatar")
    @PostMapping(value = "/{id}/avatar")
    public ResponseEntity uploadAvatar(@PathVariable Long id,
                                       @RequestParam("file") MultipartFile file,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid user id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (!user.getId().equals(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Illegal user identity");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("avatar file can not be EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = userService.uploadAvatar(user, file, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 查询用户
     *
     * @param keyword
     * @param request
     * @return
     */
    @ApiOperation(value = "get users by keyword")
    @GetMapping
    public ResponseEntity getUsers(@RequestParam("keyword") String keyword,
                                   @RequestParam(name = "includeSelf", required = false, defaultValue = "false") Boolean includeSelf,
                                   @RequestParam(value = "orgId", required = false) Long orgId,
                                   @ApiIgnore @CurrentUser User user,
                                   HttpServletRequest request) {
        if (StringUtils.isEmpty(keyword)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("keyword can not EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        List<UserBaseInfo> users = userService.getUsersByKeyword(keyword, user, orgId, includeSelf);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(users));
    }

    /**
     * 查询用户
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get user profile")
    @GetMapping("/profile/{id}")
    public ResponseEntity getUser(@PathVariable Long id,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid user id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = userService.getUserProfile(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 校验登录用户
     *
     * @param token
     * @return
     */
    @ApiOperation(value = "get user profile from token")
    @AuthIgnore
    @GetMapping("/check/{token:.*}")
    public ResponseEntity getUserFromToken(@PathVariable String token) {

        ResultMap resultMap = userService.getUserProfileFromToken(token);
        return ResponseEntity.status(resultMap.getCode()).body(resultMap);
    }

    @ApiOperation(value = "forget password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @AuthIgnore
    @PostMapping(value = "/forget/password/{type}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResultMap> forgetPassword(@PathVariable String type,
                                                    @RequestBody UserDistinctTicket ticket) {

        String token = userService.forgetPassword(UserDistinctType.typeOf(type), ticket);
        return ResponseEntity.ok(new ResultMap().success().payload(token));
    }

    @ApiOperation(value = "reset password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @AuthIgnore
    @PostMapping(value = "/reset/password/{type}/{token}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResultMap> resetPassword(@PathVariable(name = "type") String type,
                                                   @PathVariable(name = "token") String token,
                                                   @RequestBody UserDistinctTicket ticket) {
        boolean res = userService.resetPassword(UserDistinctType.typeOf(type), token, ticket);
        if (res) {
            return ResponseEntity.ok(new ResultMap().success());
        } else {
            throw new ServerException("reset password fail");
        }
    }

}
