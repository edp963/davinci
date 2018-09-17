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
import edp.davinci.dto.organizationDto.OrganizationCreate;
import edp.davinci.dto.organizationDto.OrganizationPut;
import edp.davinci.dto.organizationDto.OrganzationRole;
import edp.davinci.model.User;
import edp.davinci.service.OrganizationService;
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

@Api(value = "/organization", tags = "organization", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "organization not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/organizations", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class OrganizationController extends BaseController {

    @Autowired
    private OrganizationService organizationService;

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
        try {
            ResultMap resultMap = organizationService.createOrganization(organizationCreate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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

        try {
            ResultMap resultMap = organizationService.updateOrganization(organizationPut, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("avatar file can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = organizationService.uploadAvatar(id, file, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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

        try {
            ResultMap resultMap = organizationService.deleteOrganization(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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

        try {
            ResultMap resultMap = organizationService.getOrganization(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
        try {
            ResultMap resultMap = organizationService.getOrganizations(user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
        try {
            ResultMap resultMap = organizationService.getOrgProjects(id, user, keyword, pageNum, pageSize, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
        try {
            ResultMap resultMap = organizationService.getOrgMembers(id, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取组织团队列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get organization teams")
    @GetMapping("/{id}/teams")
    public ResponseEntity getOrgTeams(@PathVariable Long id,
                                      @ApiIgnore @CurrentUser User user,
                                      HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid organization id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = organizationService.getOrgTeamsByOrgId(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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

        try {
            ResultMap resultMap = organizationService.inviteMember(orgId, memId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
//            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("The invitation confirm token can not be empty");
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
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("The invitation confirm token can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = organizationService.confirmInvite(token, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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
        try {
            ResultMap resultMap = organizationService.deleteOrgMember(relationId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
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

        try {
            ResultMap resultMap = organizationService.updateMemberRole(relationId, user, organzationRole.getRole(), request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

}
