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


import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.dashboardDto.*;
import edp.davinci.model.Dashboard;
import edp.davinci.model.MemDashboardWidget;
import edp.davinci.model.User;
import edp.davinci.service.DashboardPortalService;
import edp.davinci.service.DashboardService;
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
import java.util.List;

@Api(value = "/dashboardPortals", tags = "dashboardPortals", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "dashboardPortal not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/dashboardPortals", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class DashboardController extends BaseController {

    @Autowired
    private DashboardPortalService dashboardPortalService;

    @Autowired
    private DashboardService dashboardService;

    /**
     * 获取dashboardPortal列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get dashboardPortals")
    @GetMapping
    public ResponseEntity getDashboardPortals(@RequestParam Long projectId,
                                              @ApiIgnore @CurrentUser User user,
                                              HttpServletRequest request) {
        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = dashboardPortalService.getDashboardPortals(projectId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取dashboard列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get dashboards")
    @GetMapping("/{id}/dashboards")
    public ResponseEntity getDashboards(@PathVariable Long id,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.getDashboards(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取Dashboard 排除访问的团队列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get dashboard exclude teams")
    @GetMapping("/dashboard/{id}/exclude/teams")
    public ResponseEntity getDashboardExcludeTeams(@PathVariable Long id,
                                                   HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            List<Long> excludeTeams = dashboardService.getExcludeTeams(id);
            ResultMap resultMap = new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(excludeTeams);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取Dashboardportal 排除访问的团队列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get dashboard portal exclude teams")
    @GetMapping("/{id}/exclude/teams")
    public ResponseEntity getPortalExcludeTeams(@PathVariable Long id,
                                                HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            List<Long> excludeTeams = dashboardPortalService.getExcludeTeams(id);
            ResultMap resultMap = new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(excludeTeams);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取dashboard下widgets关联信息列表
     *
     * @param portalId
     * @param dashboardId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get dashboard widgets")
    @GetMapping("/{portalId}/dashboards/{dashboardId}")
    public ResponseEntity getDashboardMemWidgets(@PathVariable("portalId") Long portalId,
                                                 @PathVariable("dashboardId") Long dashboardId,
                                                 @ApiIgnore @CurrentUser User user,
                                                 HttpServletRequest request) {
        if (invalidId(portalId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard portal id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(portalId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.getDashboardMemWidgets(portalId, dashboardId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 新建dashboardPortal
     *
     * @param dashboardPortalCreate
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create dashboard portal")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createDashboardPortal(@Valid @RequestBody DashboardPortalCreate dashboardPortalCreate,
                                                @ApiIgnore BindingResult bindingResult,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardPortalService.createDashboardPortal(dashboardPortalCreate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更新dashboardPortal
     *
     * @param id
     * @param dashboardPortalUpdate
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update dashboard portal")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateDashboardPortal(@PathVariable Long id,
                                                @Valid @RequestBody DashboardPortalUpdate dashboardPortalUpdate,
                                                @ApiIgnore BindingResult bindingResult,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(id) || !dashboardPortalUpdate.getId().equals(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardPortalService.updateDashboardPortal(dashboardPortalUpdate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除dashboardPortal
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete dashboard portal")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteDashboardPortal(@PathVariable Long id,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardPortalService.deleteDashboardPortal(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 新建dashboard
     *
     * @param portalId
     * @param dashboardCreate
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create dashboard")
    @PostMapping(value = "/{id}/dashboards", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createDashboard(@PathVariable("id") Long portalId,
                                          @Valid @RequestBody DashboardCreate dashboardCreate,
                                          @ApiIgnore BindingResult bindingResult,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(portalId) || !dashboardCreate.getDashboardPortalId().equals(portalId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard portal id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.createDashboard(dashboardCreate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 修改dashboard
     *
     * @param portalId
     * @param dashboards
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update dashboards")
    @PutMapping(value = "{id}/dashboards", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateDashboards(@PathVariable("id") Long portalId,
                                           @Valid @RequestBody DashboardDto[] dashboards,
                                           @ApiIgnore BindingResult bindingResult,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (Dashboard dashboard : dashboards) {
            if (!dashboard.getDashboardPortalId().equals(portalId)) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard portal id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        try {
            ResultMap resultMap = dashboardService.updateDashboards(portalId, dashboards, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除dashboard
     *
     * @param dashboardId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete dashboard")
    @DeleteMapping("/dashboards/{dashboardId}")
    public ResponseEntity deleteDashboard(@PathVariable Long dashboardId,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {

        if (invalidId(dashboardId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.deleteDashboard(dashboardId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 在dashboard下新建widget关联
     *
     * @param portalId
     * @param dashboardId
     * @param memDashboardWidgetCreates
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create dashboard widget relation")
    @PostMapping(value = "/{portalId}/dashboards/{dashboardId}/widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createMemDashboardWidget(@PathVariable("portalId") Long portalId,
                                                   @PathVariable("dashboardId") Long dashboardId,
                                                   @Valid @RequestBody MemDashboardWidgetCreate[] memDashboardWidgetCreates,
                                                   @ApiIgnore BindingResult bindingResult,
                                                   @ApiIgnore @CurrentUser User user,
                                                   HttpServletRequest request) {
        if (invalidId(portalId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard portal id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == memDashboardWidgetCreates || memDashboardWidgetCreates.length < 1) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("dashboard widgets info cannot be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (MemDashboardWidgetCreate memDashboardWidgetCreate : memDashboardWidgetCreates) {
            if (invalidId(dashboardId) || !dashboardId.equals(memDashboardWidgetCreate.getDashboardId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.createMemDashboardWidget(portalId, dashboardId, memDashboardWidgetCreates, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 修改dashboard下的widget关联信息
     *
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update dashboard widget relation")
    @PutMapping(value = "/dashboards/widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateMemDashboardWidget(@Valid @RequestBody MemDashboardWidget[] memDashboardWidgets,
                                                   @ApiIgnore BindingResult bindingResult,
                                                   @ApiIgnore @CurrentUser User user,
                                                   HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (MemDashboardWidget memDashboardWidget : memDashboardWidgets) {
            if (invalidId(memDashboardWidget.getId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }

            if (invalidId(memDashboardWidget.getDashboardId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid dashboard id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }

            if (invalidId(memDashboardWidget.getWidgetId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid widget id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }

            if (memDashboardWidget.getPolling() && memDashboardWidget.getFrequency() < 1) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid frequency");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        try {
            ResultMap resultMap = dashboardService.updateMemDashboardWidgets(memDashboardWidgets, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除dashboard下的widget关联信息
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete dashboard widget relation")
    @DeleteMapping(value = "/dashboards/widgets/{relationId}")
    public ResponseEntity deleteMemDashboardWidget(@PathVariable Long relationId,
                                                   @ApiIgnore @CurrentUser User user,
                                                   HttpServletRequest request) {
        try {
            ResultMap resultMap = dashboardService.deleteMemDashboardWidget(relationId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 分享dashboard
     *
     * @param dashboardId
     * @param username
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "share dashboard")
    @GetMapping("/dashboards/{dashboardId}/share")
    public ResponseEntity shareDashboard(@PathVariable Long dashboardId,
                                         @RequestParam(required = false) String username,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {

        if (invalidId(dashboardId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid  id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = dashboardService.shareDashboard(dashboardId, username, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

}
