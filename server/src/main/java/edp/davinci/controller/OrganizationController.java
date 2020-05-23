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
import com.github.pagehelper.PageInfo;
import edp.core.annotation.CurrentUser;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.organizationDto.*;
import edp.davinci.dto.projectDto.ProjectWithCreateBy;
import edp.davinci.dto.roleDto.RoleBaseInfo;
import edp.davinci.model.User;
import edp.davinci.service.OrganizationService;
import edp.davinci.service.ProjectService;
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
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Api(value = "/organization", tags = "organization", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "organization not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/organizations", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class OrganizationController extends BaseController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ProjectService projectService;

    /**
     * 新建组织
     *
     * @param organizationCreate
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create organization")
    @PostMapping
    public ResponseEntity createOrganization(@Valid @RequestBody OrganizationCreate organizationCreate,
                                             @ApiIgnore BindingResult bindingResult,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        OrganizationBaseInfo organization = organizationService.createOrganization(organizationCreate, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(organization));
    }


    /**
     * 修改组织信息
     *
     * @param id
     * @param organizationPut
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update organization")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateOrganization(@PathVariable Long id,
                                             @Valid @RequestBody OrganizationPut organizationPut,
                                             @ApiIgnore BindingResult bindingResult,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {
        if (invalidId(id) || !id.equals(organizationPut.getId())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        organizationService.updateOrganization(organizationPut, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    /**
     * 上传组织头像
     *
     * @param id
     * @param file
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "upload organization avatar")
    @PostMapping(value = "/{id}/avatar")
    public ResponseEntity uploadOrgAvatar(@PathVariable Long id,
                                          @RequestParam("file") MultipartFile file,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("avatar file can not be EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        Map<String, String> map = organizationService.uploadAvatar(id, file, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(map));
    }


    /**
     * 删除组织
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete organization")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteOrganization(@PathVariable Long id,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        organizationService.deleteOrganization(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 获取组织详情
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get organization")
    @GetMapping("/{id}")
    public ResponseEntity getOrganization(@PathVariable Long id,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        OrganizationInfo organization = organizationService.getOrganization(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(organization));
    }


    /**
     * 获取组织列表
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get organizations")
    @GetMapping
    public ResponseEntity getOrganizations(@ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        List<OrganizationInfo> organizations = organizationService.getOrganizations(user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(organizations));
    }


    /**
     * 获取组织项目列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get organization projects")
    @GetMapping("/{id}/projects")
    public ResponseEntity getOrgProjects(@PathVariable Long id,
                                         @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
                                         @RequestParam(value = "pageNum", required = false, defaultValue = "1") int pageNum,
                                         @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
                                         @ApiIgnore @CurrentUser User user,
                                         HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        PageInfo<ProjectWithCreateBy> projects = projectService.getProjectsByOrg(id, user, keyword, pageNum, pageSize);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(projects));
    }


    /**
     * 获取组织成员列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get organization members")
    @GetMapping("/{id}/members")
    public ResponseEntity getOrgMembers(@PathVariable Long id, HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<OrganizationMember> orgMembers = organizationService.getOrgMembers(id);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(orgMembers));
    }

    /**
     * 获取组织下权限列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get organization roles")
    @GetMapping("/{id}/roles")
    public ResponseEntity getOrgRoles(@PathVariable Long id,
                                      @ApiIgnore @CurrentUser User user,
                                      HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<RoleBaseInfo> roles = roleService.getRolesByOrgId(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(roles));
    }

    /**
     * 邀请组织成员
     *
     * @param orgId
     * @param memId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "invite member to join the organization")
    @PostMapping("/{orgId}/member/{memId}")
    public ResponseEntity inviteMember(@PathVariable("orgId") Long orgId,
                                       @PathVariable("memId") Long memId,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {

        if (invalidId(orgId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        if (invalidId(memId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid member id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        organizationService.inviteMember(orgId, memId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


//    /**
//     * 成员确认邀请
//     *
//     * @param request
//     * @return
//     */
//    @ApiOperation(value = "member confirm invite")
//    @AuthIgnore
//    @PostMapping("/confirminvite/{token}")
//    public ResponseEntity confirmInvite(@PathVariable("token") String token,
//                                        HttpServletRequest request) {
//        if (StringUtils.isEmpty(token)) {
//            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("The invitation confirm token can not be EMPTY");
//            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
//        }
//        try {
//            ResultMap resultMap = organizationService.confirmInviteNoLogin(token);
//            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error(e.getMessage());
//            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
//        }
//    }


    /**
     * 成员确认邀请
     *
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "member confirm invite")
    @PostMapping("/confirminvite/{token}")
    public ResponseEntity confirmInvite(@PathVariable("token") String token,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("The invitation confirm token can not be EMPTY");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        OrganizationInfo organizationInfo = organizationService.confirmInvite(token, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(organizationInfo));
    }

    /**
     * 删除组织成员
     *
     * @param relationId
     * @return
     */
    @ApiOperation(value = "delete member from organization")
    @DeleteMapping("/member/{relationId}")
    public ResponseEntity deleteOrgMember(@PathVariable Long relationId,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        organizationService.deleteOrgMember(relationId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 更改组织成员角色
     *
     * @param relationId
     * @param user
     * @param organzationRole
     * @param request
     * @return
     */
    @ApiOperation(value = "change member role or organization", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/member/{relationId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateMemberRole(@PathVariable Long relationId,
                                           @Valid @RequestBody OrganzationRole organzationRole,
                                           @ApiIgnore BindingResult bindingResult,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        organizationService.updateMemberRole(relationId, user, organzationRole.getRole());
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

}
