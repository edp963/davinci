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

package edp.davinci.server.controller;

import edp.davinci.core.dao.entity.User;
import edp.davinci.server.annotation.AuthShare;
import edp.davinci.server.annotation.CurrentUser;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.share.ShareDashboard;
import edp.davinci.server.dto.share.ShareDisplay;
import edp.davinci.server.dto.share.ShareWidget;
import edp.davinci.server.dto.user.UserLogin;
import edp.davinci.server.dto.user.UserLoginResult;
import edp.davinci.server.dto.view.WidgetDistinctParam;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.enums.ShareOperation;
import edp.davinci.server.enums.ShareType;
import edp.davinci.server.model.Paging;
import edp.davinci.server.model.TokenEntity;
import edp.davinci.server.service.ShareService;
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
import java.util.List;
import java.util.Map;


@Api(value = "/share", tags = "share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "resource not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/share", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class ShareController extends BaseController {


    @Autowired
    private ShareService shareService;

    @ApiOperation(value = "share preflight")
    @AuthShare(type = ShareType.LOGIN)
    @GetMapping(value = "/preflight/{token}")
    public ResponseEntity preFlight(@PathVariable String token) {
        Map<String, Object> result = shareService.checkShareToken();
        return ResponseEntity.ok(new ResultMap().success().payload(result));
    }

    @ApiOperation(value = "get share permission")
    @AuthShare(type = ShareType.PERMISSION, operation = ShareOperation.PERMISSION)
    @GetMapping(value = "/permissions/{token}")
    public ResponseEntity permission(@PathVariable(name = "token") String token,
                                     @RequestParam(required = false) String password,
                                     @RequestParam String type,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {

        Map<String, Object> result = shareService.getSharePermissions();
        if (null == user || user.getId() == null) {
            return ResponseEntity.ok(new ResultMap().success().payload(result));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(result));
        }
    }

    /**
     * share页登录
     *
     * @param token
     * @param userLogin
     * @param bindingResult
     * @return
     */
    @ApiOperation(value = "share login")
    @AuthShare(type = ShareType.LOGIN)
    @PostMapping("/login/{token}")
    public ResponseEntity shareLogin(@PathVariable String token,
                                     @Valid @RequestBody UserLogin userLogin,
                                     @ApiIgnore BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        User user = shareService.shareLogin(userLogin);
        TokenEntity tokenEntity = new TokenEntity(user.getUsername(), user.getPassword());
        return ResponseEntity.ok(new ResultMap().success(tokenUtils.generateToken(tokenEntity)).payload(new UserLoginResult(user)));
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
    @AuthShare(type = ShareType.DASHBOARD, operation = ShareOperation.READ)
    @GetMapping("/dashboard/{token}")
    public ResponseEntity getShareDashboard(@PathVariable String token,
                                            @RequestParam(required = false) String password,
                                            @ApiIgnore @CurrentUser User user,
                                            HttpServletRequest request) {

        ShareDashboard shareDashboard = shareService.getShareDashboard(user);
        if (null == user || user.getId() == null) {
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
    @AuthShare(type = ShareType.DISPLAY, operation = ShareOperation.READ)
    @GetMapping("/display/{token}")
    public ResponseEntity getShareDisplay(@PathVariable String token,
                                          @RequestParam(required = false) String password,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {

        ShareDisplay shareDisplay = shareService.getShareDisplay(user);
        if (null == user || user.getId() == null) {
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
    @AuthShare(type = ShareType.WIDGET, operation = ShareOperation.READ)
    @GetMapping("/widget/{token}")
    public ResponseEntity getShareWidget(@PathVariable String token,
                                         @RequestParam(required = false) String password,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {

        ShareWidget shareWidget = shareService.getShareWidget(user);
        if (null == user || user.getId() == null) {
            return ResponseEntity.ok(new ResultMap().success().payload(shareWidget));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(shareWidget));
        }
    }

    /**
     * share页获取源数据
     *
     * @param token
     * @param queryParam
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get share data")
    @AuthShare(type = ShareType.DATA, operation = ShareOperation.LOAD_DATA)
    @PostMapping(value = "/data/{token}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getShareData(@PathVariable String token,
                                       @RequestParam(required = false) String password,
                                       @RequestBody(required = false) WidgetQueryParam queryParam,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) throws SQLException {

        Paging<Map<String, Object>> shareData = shareService.getShareData(queryParam, user);
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
    @AuthShare(type = ShareType.DATA, operation = ShareOperation.LOAD_DATA)
    @PostMapping(value = "/data/{token}/distinctvalue/{viewId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getDistinctValue(@PathVariable("token") String token,
                                           @RequestParam(required = false) String password,
                                           @PathVariable("viewId") Long viewId,
                                           @Valid @RequestBody WidgetDistinctParam param,
                                           @ApiIgnore BindingResult bindingResult,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        List<Map<String, Object>> resultList = shareService.getDistinctValue(viewId, param, user);
        if (null == user || user.getId() == null) {
            return ResponseEntity.ok(new ResultMap().success().payloads(resultList));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(resultList));
        }
    }
}
