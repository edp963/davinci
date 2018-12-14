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
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.teamDto.*;
import edp.davinci.model.User;
import edp.davinci.service.DepartmentService;
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
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@Api(value = "/teams", tags = "teams", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "team not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/teams", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class TeamController extends BaseController {

    @Autowired
    private TeamService teamService;

    @Autowired(required = false)
    private DepartmentService departmentService;

    /**
     * 创建团队
     *
     * @param teamCreate
     * @param user
     * @param bindingResult
     * @param request
     * @return
     */
    @ApiOperation(value = "create team", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createTeam(@Valid @RequestBody TeamCreate teamCreate,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.createTeam(teamCreate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更改团队
     *
     * @param id
     * @param teamPut
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update team", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateTeam(@PathVariable Long id,
                                     @Valid @RequestBody TeamPut teamPut,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invaild team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.updateTeam(id, teamPut, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 上传团队头像
     *
     * @param id
     * @param file
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "upload team avatar")
    @PostMapping("/{id}/avatar")
    public ResponseEntity uploadTeamAvatar(@PathVariable Long id,
                                           @RequestParam("file") MultipartFile file,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("avatar file can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.uploadAvatar(id, file, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除团队
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete team")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteTeam(@PathVariable Long id,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.deleteTeam(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 添加成员到团队
     *
     * @param id
     * @param memberId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "add a member into team")
    @PostMapping("/{id}/member/{memberId}")
    public ResponseEntity addTeamMember(@PathVariable Long id,
                                        @PathVariable Long memberId,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(memberId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid member id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.addTeamMember(id, memberId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取团队成员列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get team members")
    @GetMapping("/{id}/members")
    public ResponseEntity getTeamMembers(@PathVariable Long id,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.getTeamMembers(id, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取团队详情
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get team detail")
    @GetMapping("/{id}")
    public ResponseEntity getTeamDetail(@PathVariable Long id, @ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.getTeamDetail(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取子团队列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get child teams")
    @GetMapping("{id}/teams")
    public ResponseEntity getChildTeams(@PathVariable Long id, @ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.getChildTeams(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取团队项目列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get team projects")
    @GetMapping("{id}/projects")
    public ResponseEntity getTeamProjects(@PathVariable Long id, HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.getTeamProjects(id, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更改团队项目权限
     *
     * @param relationId
     * @param relTeamProjectDto
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update team project permission")
    @PutMapping(value = "/project/{relationId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateTeamProjectPermission(@PathVariable Long relationId,
                                                      @Valid @RequestBody RelTeamProjectDto relTeamProjectDto,
                                                      @ApiIgnore BindingResult bindingResult,
                                                      @ApiIgnore @CurrentUser User user,
                                                      HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team relationId");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.updateTeamProjectPermission(relationId, relTeamProjectDto, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 移除团队项目
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete team project")
    @DeleteMapping(value = "/project/{relationId}")
    public ResponseEntity deleteTeamProject(@PathVariable Long relationId,
                                            @ApiIgnore @CurrentUser User user,
                                            HttpServletRequest request) {
        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team relationId");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.deleteTeamProject(relationId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更改团队成员角色
     *
     * @param relationId
     * @param teamRole
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update team member role")
    @PutMapping("/member/{relationId}")
    public ResponseEntity updateTeamMemberRole(@PathVariable Long relationId,
                                               @Valid @RequestBody TeamRole teamRole,
                                               @ApiIgnore BindingResult bindingResult,
                                               @ApiIgnore @CurrentUser User user,
                                               HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid team relationId");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.updateTeamMemberRole(relationId, teamRole.getRole(), user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 给team中添加project
     *
     * @param id
     * @param addProject
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "add a project to the team")
    @PostMapping(value = "/{id}/project", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity addProject(@PathVariable Long id,
                                     @Valid @RequestBody AddProject addProject,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.addProject(id, addProject.getProjectId(), user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 删除团队成员
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete team member")
    @DeleteMapping("/member/{relationId}")
    public ResponseEntity deleteTeamMember(@PathVariable Long relationId,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = teamService.deleteRelation(relationId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取用户相关的所有可见的团队
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get teams")
    @GetMapping
    public ResponseEntity getTeams(@ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        try {
            ResultMap resultMap = teamService.getTeams(user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    @ApiOperation(value = "get team variables sources")
    @GetMapping("/departments")
    public ResponseEntity getTeamVarSource(@RequestParam("type") String type,
                                           @RequestParam("projectId") Long projectId,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (StringUtils.isEmpty(type)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid type");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = departmentService.getdepartments(projectId, type, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

}
