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
import edp.davinci.dto.organizationDto.OrganizationTransfer;
import edp.davinci.dto.projectDto.ProjectCreat;
import edp.davinci.dto.projectDto.ProjectUpdate;
import edp.davinci.model.User;
import edp.davinci.service.ProjectService;
import edp.davinci.service.TeamService;
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

@Api(value = "/project", tags = "project", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "project not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/projects", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class ProjectController extends BaseController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TeamService teamService;


    /**
     * 获取项目列表：用户创建和用户所在组可访问的
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get projects")
    @GetMapping
    public ResponseEntity getProjects(@ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        try {
            ResultMap resultMap = projectService.getProjects(user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    @ApiOperation(value = "get teams where proejct is located")
    @GetMapping("/{id}/teams")
    public ResponseEntity getTeamsOfProject(@ApiIgnore @CurrentUser User user,
                                            @PathVariable Long id,
                                            HttpServletRequest request) {
        try {
            ResultMap resultMap = teamService.getTeamsByProject(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取项目列表：用户创建和用户所在组可访问的
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get project info")
    @GetMapping("/{id}")
    public ResponseEntity getProjectInfo(@PathVariable Long id,
                                         @ApiIgnore @CurrentUser User user,
                                         @ApiIgnore HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.getProjectInfo(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    @ApiOperation(value = "search projects by keywords")
    @GetMapping("/search")
    public ResponseEntity searchProjects(@RequestParam(value = "keywords", required = false) String keywords,
                                         @RequestParam(value = "pageNum", required = false, defaultValue = "1") int pageNum,
                                         @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {

        try {
            ResultMap resultMap = projectService.searchProjects(keywords, user, pageNum, pageSize, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 创建项目
     *
     * @param projectCreat
     * @param user
     * @param bindingResult
     * @param request
     * @return
     */
    @ApiOperation(value = "create project", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createProject(@Valid @RequestBody ProjectCreat projectCreat,
                                        @ApiIgnore BindingResult bindingResult,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.createProject(projectCreat, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 移交项目
     *
     * @param id
     * @param organizationTransfer
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "transfer projects", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}/transfer", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity transferProject(@PathVariable Long id,
                                          @Valid @RequestBody OrganizationTransfer organizationTransfer,
                                          @ApiIgnore BindingResult bindingResult,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {


        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.transferPeoject(id, organizationTransfer.getOrgId(), user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 删除project
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete project")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteProject(@PathVariable Long id,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.deleteProject(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更新项目基本信息
     *
     * @param id
     * @param projectUpdate
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update project", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateProjectBaseInfo(@PathVariable Long id,
                                                @Valid @RequestBody ProjectUpdate projectUpdate,
                                                @ApiIgnore BindingResult bindingResult,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.updateProject(id, projectUpdate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 收藏project
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "favorite project", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(value = "/favorite/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity favoriteProject(@PathVariable Long id,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = projectService.favoriteProject(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取已收藏project
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get favorite projects")
    @GetMapping(value = "/favorites")
    public ResponseEntity getFavoriteProjects(@ApiIgnore @CurrentUser User user,
                                              HttpServletRequest request) {
        try {
            ResultMap resultMap = projectService.getFavoriteProjects(user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取已收藏project
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "remove favorite projects")
    @DeleteMapping(value = "/remove/favorites")
    public ResponseEntity removeFavoriteProjects(@ApiIgnore @CurrentUser User user,
                                                 @RequestBody Long[] projectIds,
                                                 HttpServletRequest request) {
        for (Long id : projectIds) {
            if (invalidId(id)) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        try {
            ResultMap resultMap = projectService.removeFavoriteProjects(user, projectIds, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }
}
