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

    ResultMap getOrgProjects(Long id, User user, HttpServletRequest request);

    ResultMap getOrgMembers(Long id, HttpServletRequest request);

    ResultMap getOrgTeamsByOrgId(Long id, User user, HttpServletRequest request);

    ResultMap inviteMember(Long orgId, Long memId, User user, HttpServletRequest request);

    ResultMap confirmInvite(String token, User user, HttpServletRequest request);

    ResultMap deleteOrgMember(Long relationId, User user, HttpServletRequest request);

    ResultMap updateMemberRole(Long relationId, User user, int role, HttpServletRequest request);

    ResultMap confirmInviteNoLogin(String token);
}

