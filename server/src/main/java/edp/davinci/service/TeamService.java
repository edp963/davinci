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
import edp.davinci.dto.teamDto.*;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Set;

public interface TeamService extends CheckEntityService {

    ResultMap createTeam(TeamCreate teamCreate, User user, HttpServletRequest request);

    ResultMap updateTeam(Long id, TeamPut teamPut, User user, HttpServletRequest request);

    ResultMap uploadAvatar(Long id, MultipartFile file, User user, HttpServletRequest request);

    ResultMap deleteTeam(Long id, User user, HttpServletRequest request);

    ResultMap getTeamMembers(Long id, HttpServletRequest request);

    ResultMap deleteRelation(Long relationId, User user, HttpServletRequest request);

    ResultMap getTeamDetail(Long id, User user, HttpServletRequest request);

    ResultMap getChildTeams(Long id, User user, HttpServletRequest request);

    ResultMap getTeamProjects(Long id, HttpServletRequest request);

    ResultMap updateTeamProjectPermission(Long relationId, RelTeamProjectDto relTeamProjectDto, User user, HttpServletRequest request);

    ResultMap deleteTeamProject(Long relationId, User user, HttpServletRequest request);

    ResultMap updateTeamMemberRole(Long relationId, Integer role, User user, HttpServletRequest request);

    List<TeamWithMembers> getStructuredList(List<TeamBaseInfoWithParent> list, Long parentId);

    ResultMap getTeams(User user, HttpServletRequest request);

    ResultMap addProject(Long id, Long projectId, User user, HttpServletRequest request);

    ResultMap addTeamMember(Long id, Long memberId, User user, HttpServletRequest request);

    ResultMap getTeamsByProject(Long projectId, User user, HttpServletRequest request);

    Set<Long> getRootTeamIds(Long userId, Long projectId);
}
