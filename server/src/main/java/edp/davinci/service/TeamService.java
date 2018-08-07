package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.teamDto.*;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

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

    List<TeamWithMembers> getStructuredList(List<TeamBaseInfoWithParent> list);

    ResultMap getTeams(User user, HttpServletRequest request);

    ResultMap addProject(Long id, Long projectId, User user, HttpServletRequest request);

    ResultMap addTeamMember(Long id, Long memberId, User user, HttpServletRequest request);
}
