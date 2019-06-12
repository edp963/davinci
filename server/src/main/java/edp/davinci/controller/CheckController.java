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

import edp.core.annotation.AuthIgnore;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.service.CheckService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@Api(value = "/check", tags = "check", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "sources not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/check", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class CheckController {

    @Autowired
    private CheckService checkService;

    /**
     * 检查用户是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique username")
    @AuthIgnore
    @GetMapping("/user")
    public ResponseEntity checkUser(@RequestParam String username,
                                    @RequestParam(required = false) Long id,
                                    HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(username, id, CheckEntityEnum.USER, null, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查Organization是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique organization name")
    @GetMapping("/organization")
    public ResponseEntity checkOrganization(@RequestParam String name,
                                            @RequestParam(required = false) Long id,
                                            HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.ORGANIZATION, null, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查Project是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique project name")
    @GetMapping("/project")
    public ResponseEntity checkProject(@RequestParam String name,
                                       @RequestParam(required = false) Long id,
                                       @RequestParam Long orgId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.PROJECT, orgId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 检查Disaplay是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique display name")
    @GetMapping("/display")
    public ResponseEntity checkDisplay(@RequestParam String name,
                                       @RequestParam(required = false) Long id,
                                       @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.DISPLAY, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查source是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique source name")
    @GetMapping("/source")
    public ResponseEntity checkSource(@RequestParam String name,
                                      @RequestParam(required = false) Long id,
                                      @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.SOURCE, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查view是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique view name")
    @GetMapping("/view")
    public ResponseEntity checkView(@RequestParam String name,
                                    @RequestParam(required = false) Long id,
                                    @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.VIEW, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 检查widget是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique widget name")
    @GetMapping("/widget")
    public ResponseEntity checkWidget(@RequestParam String name,
                                      @RequestParam(required = false) Long id,
                                      @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.WIDGET, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查dashboardportal是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique dashboard name")
    @GetMapping("/dashboardPortal")
    public ResponseEntity checkDashboardPortal(@RequestParam String name,
                                               @RequestParam(required = false) Long id,
                                               @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.DASHBOARDPORTAL, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 检查dashboard是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique dashboard name")
    @GetMapping("/dashboard")
    public ResponseEntity checkDashboard(@RequestParam String name,
                                         @RequestParam(required = false) Long id,
                                         @RequestParam Long portal, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.DASHBOARD, portal, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 检查cronjob是否存在
     *
     * @param request
     * @return
     */
    @ApiOperation(value = "check unique dashboard name")
    @GetMapping("/cronjob")
    public ResponseEntity checkCronJob(@RequestParam String name,
                                       @RequestParam(required = false) Long id,
                                       @RequestParam Long projectId, HttpServletRequest request) {
        try {
            ResultMap resultMap = checkService.checkSource(name, id, CheckEntityEnum.CRONJOB, projectId, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

}
