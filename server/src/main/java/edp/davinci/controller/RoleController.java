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


import edp.core.annotation.CurrentUser;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.roleDto.*;
import edp.davinci.model.Role;
import edp.davinci.model.User;
import edp.davinci.service.RoleService;
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
import java.util.Arrays;
import java.util.List;

@Api(value = "/roles", tags = "roles", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "role not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/roles", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class RoleController extends BaseController {

    @Autowired
    private RoleService roleService;


    /**
     * 新建Role
     *
     * @param role
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create role", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createRole(@Valid @RequestBody RoleCreate role,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        Role newRole = roleService.createRole(role, user);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(newRole));
    }


    /**
     * 删除role
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete role")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteRole(@PathVariable Long id,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        roleService.deleteRole(id, user);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 修改 Role
     *
     * @param id
     * @param role
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update role")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateRole(@PathVariable Long id,
                                     @Valid @RequestBody RoleUpdate role,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        roleService.updateRole(id, role, user);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 获取 Role详情
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get role")
    @GetMapping("/{id}")
    public ResponseEntity getRole(@PathVariable Long id,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        Role role = roleService.getRoleInfo(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(role));
    }


    /**
     * 添加Role与User关联
     *
     * @param id
     * @param memberIds
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "add relation between a role and members")
    @PostMapping(value = "/{id}/members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity addMember(@PathVariable Long id,
                                    @RequestBody Long[] memberIds,
                                    @ApiIgnore @CurrentUser User user,
                                    HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<RelRoleMember> relRoleMembers = roleService.addMembers(id, Arrays.asList(memberIds), user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(relRoleMembers));
    }


    /**
     * 删除Role与User关联
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete relation between a role and a member")
    @DeleteMapping("/member/{relationId}")
    public ResponseEntity deleteMember(@PathVariable Long relationId,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {
        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        roleService.deleteMember(relationId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 更新rele 和 member关联
     *
     * @param id
     * @param memberIds
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update role member relations", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}/members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateMembers(@PathVariable Long id,
                                        @RequestBody Long[] memberIds,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == memberIds || memberIds.length == 0) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("members cannot be EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<RelRoleMember> relRoleMembers = roleService.updateMembers(id, Arrays.asList(memberIds), user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(relRoleMembers));
    }


    /**
     * 获取 Role 关联用户
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get members")
    @GetMapping("/{id}/members")
    public ResponseEntity getMembers(@PathVariable Long id,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<RelRoleMember> members = roleService.getMembers(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(members));
    }


    /**
     * 添加Role与Project关联
     *
     * @param id
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "add relation between a role and a project", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(value = "/{id}/project/{projectId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity addProject(@PathVariable Long id,
                                     @PathVariable Long projectId,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        RoleProject roleProject = roleService.addProject(id, projectId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(roleProject));
    }


    /**
     * 删除Role和Project之间的关联
     *
     * @param id
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete relation between a role and a project")
    @DeleteMapping("/{id}/project/{projectId}")
    public ResponseEntity deleteProject(@PathVariable Long id,
                                        @PathVariable Long projectId,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project Id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        roleService.deleteProject(id, projectId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 修改Role和Project之间的关联
     *
     * @param id
     * @param projectId
     * @param projectRole
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update relation between a role and a project", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}/project/{projectId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateProjet(@PathVariable Long id,
                                       @PathVariable Long projectId,
                                       @Valid @RequestBody RelRoleProjectDto projectRole,
                                       @ApiIgnore BindingResult bindingResult,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        roleService.updateProjectRole(id, projectId, user, projectRole);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 修改Role和Project之间的关联
     *
     * @param id
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get role viz permission")
    @GetMapping(value = "/{id}/project/{projectId}/viz/visibility")
    public ResponseEntity getVizVisibility(@PathVariable Long id,
                                           @PathVariable Long projectId,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }


        VizPermission vizPermission = roleService.getVizPermission(id, projectId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(vizPermission));
    }


    /**
     * 修改Role和Project之间的关联
     *
     * @param id
     * @param vizVisibility
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "exclude role viz permission", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(value = "/{id}/viz/visibility", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity postVizvisibility(@PathVariable Long id,
                                            @RequestBody VizVisibility vizVisibility,
                                            @ApiIgnore @CurrentUser User user,
                                            HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid role id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }


        roleService.postVizvisibility(id, vizVisibility, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    @ApiOperation(value = "get role")
    @GetMapping("/getRole")
    public ResponseEntity getRole(@RequestParam(value = "orgId") Long orgId,
                                  @RequestParam(value = "userId") Long userId,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) {
        if (invalidId(orgId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid orgId id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        if (invalidId(userId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid userId id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        List<Role> roles = roleService.getRoleInfo(orgId, userId);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(roles));
    }
}
