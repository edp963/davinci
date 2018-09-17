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

package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.organizationDto.OrganizationCreate;
import edp.davinci.dto.organizationDto.OrganizationPut;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface OrganizationService extends CheckEntityService {

    ResultMap getOrganizations(User user, HttpServletRequest request);

    ResultMap updateOrganization(OrganizationPut organizationPut, User user, HttpServletRequest request);

    ResultMap createOrganization(OrganizationCreate organizationCreate, User user, HttpServletRequest request);

    ResultMap uploadAvatar(Long id, MultipartFile file, User user, HttpServletRequest request);

    ResultMap deleteOrganization(Long id, User user, HttpServletRequest request);

    ResultMap getOrganization(Long id, User user, HttpServletRequest request);

    ResultMap getOrgProjects(Long id, User user, String keyword, int pageNum, int pageSize, HttpServletRequest request);

    ResultMap getOrgMembers(Long id, HttpServletRequest request);

    ResultMap getOrgTeamsByOrgId(Long id, User user, HttpServletRequest request);

    ResultMap inviteMember(Long orgId, Long memId, User user, HttpServletRequest request);

    ResultMap confirmInvite(String token, User user, HttpServletRequest request);

    ResultMap deleteOrgMember(Long relationId, User user, HttpServletRequest request);

    ResultMap updateMemberRole(Long relationId, User user, int role, HttpServletRequest request);

    ResultMap confirmInviteNoLogin(String token);
}

