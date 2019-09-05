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
import edp.core.annotation.AuthShare;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.core.model.Paginate;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.shareDto.ShareDashboard;
import edp.davinci.dto.shareDto.ShareDisplay;
import edp.davinci.dto.shareDto.ShareWidget;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserLoginResult;
import edp.davinci.dto.viewDto.DistinctParam;
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
import java.sql.SQLException;
import java.util.Map;


@Api(value = "/share", tags = "share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "resource not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class ShareController extends BaseController {


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

        User user = shareService.shareLogin(token, userLogin);
        return ResponseEntity.ok(new ResultMap().success(tokenUtils.generateToken(user)).payload(new UserLoginResult(user)));
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
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareDashboard shareDashboard = shareService.getShareDashboard(token, user);

        if (null == user) {
            return ResponseEntity.ok(new ResultMap().success().payload(shareDashboard));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(shareDashboard));
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
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareDisplay shareDisplay = shareService.getShareDisplay(token, user);

        if (null == user) {
            return ResponseEntity.ok(new ResultMap().success().payload(shareDisplay));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(shareDisplay));
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
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareWidget shareWidget = shareService.getShareWidget(token, user);

        if (null == user) {
            return ResponseEntity.ok(new ResultMap().success().payload(shareWidget));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(shareWidget));
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
                                       HttpServletRequest request) throws SQLException {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        Paginate<Map<String, Object>> shareData = shareService.getShareData(token, executeParam, user);
        if (null == user) {
            return ResponseEntity.ok(new ResultMap().success().payload(shareData));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(shareData));
        }
    }


    /**
     * share 获取唯一值
     *
     * @param token
     * @param viewId
     * @param param
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share data")
    @AuthShare
    @PostMapping(value = "/data/{token}/distinctvalue/{viewId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getDistinctValue(@PathVariable("token") String token,
                                           @PathVariable("viewId") Long viewId,
                                           @Valid @RequestBody DistinctParam param,
                                           @ApiIgnore BindingResult bindingResult,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(viewId)) {
            ResultMap resultMap = new ResultMap().fail().message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = shareService.getDistinctValue(token, viewId, param, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
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
            ResultMap resultMap = new ResultMap().fail().message("Invalid share token");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        String filePath = shareService.generationShareDataCsv(executeParam, user, token);
        if (null == user) {
            return ResponseEntity.ok(new ResultMap().success().payload(filePath));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(filePath));
        }
    }
}
