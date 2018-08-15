/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.controller;

import com.alibaba.druid.util.StringUtils;
import edp.core.annotation.AuthIgnore;
import edp.core.annotation.AuthShare;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.model.User;
import edp.davinci.service.ShareService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;


@Api(value = "/share", tags = "share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "resource not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class ShareController {


    @Autowired
    private ShareService shareService;


    /**
     * share页登录
     *
     * @param token
     * @param userLogin
     * @param bindingResult
     * @return
     */
    @ApiOperation(value = "share login")
    @AuthIgnore
    @PostMapping("/login/{token}")
    public ResponseEntity shareLogin(@PathVariable String token,
                                     @Valid @RequestBody UserLogin userLogin,
                                     @ApiIgnore BindingResult bindingResult) {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message("Invalid token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = shareService.shareLogin(token, userLogin);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * share页获取dashboard信息
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share dashboard")
    @AuthShare
    @GetMapping("/dashboard/{token}")
    public ResponseEntity getShareDashboard(@PathVariable String token,
                                            @ApiIgnore @CurrentUser User user,
                                            HttpServletRequest request) {
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().success().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.getShareDashboard(token, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * share页获取display信息
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share display")
    @AuthShare
    @GetMapping("/display/{token}")
    public ResponseEntity getShareDisplay(@PathVariable String token,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().success().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.getShareDisplay(token, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * share页获取widget信息
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share widget")
    @AuthShare
    @GetMapping("/widget/{token}")
    public ResponseEntity getShareWidget(@PathVariable String token,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().success().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.getShareWidget(token, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * share页获取源数据
     *
     * @param token
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share data")
    @AuthShare
    @PostMapping(value = "/data/{token}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getShareData(@PathVariable String token,
                                       @RequestBody(required = false) ViewExecuteParam executeParam,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().success().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.getShareData(token, executeParam, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * share页获取csv信息
     *
     * @param token
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share data csv")
    @AuthShare
    @PostMapping(value = "/csv/{token}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity generationShareDataCsv(@PathVariable String token,
                                                 @RequestBody(required = false) ViewExecuteParam executeParam,
                                                 @ApiIgnore @CurrentUser User user,
                                                 HttpServletRequest request) {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().success().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.generationShareDataCsv(token, executeParam, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }
}
