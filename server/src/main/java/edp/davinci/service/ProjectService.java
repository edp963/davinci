package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.projectDto.ProjectCreat;
import edp.davinci.dto.projectDto.ProjectUpdate;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface ProjectService extends CheckEntityService {


    ResultMap getProjects(User user, HttpServletRequest request);

    ResultMap createProject(ProjectCreat projectCreat, User user, HttpServletRequest request);

    ResultMap updateProject(Long id, ProjectUpdate projectUpdate, User user, HttpServletRequest request);

    ResultMap deleteProject(Long id, User user, HttpServletRequest request);

    ResultMap transferPeoject(Long id, Long orgId, User user, HttpServletRequest request);
}
