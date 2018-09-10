package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface StarService {

    ResultMap starAndUnstar(String target, Long targetId, User user, HttpServletRequest request);


    ResultMap getStarListByUser(String target, User user, HttpServletRequest request);


    ResultMap getStarUserListByTarget(String target, Long targetId, HttpServletRequest request);

}
