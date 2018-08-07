package edp.davinci.service;

import edp.core.exception.ServerException;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface ShareService {
    ResultMap getShareWidget(String token, User user, HttpServletRequest request);

    String generateShareToken(Long shareEntityId, String username, Long userId) throws ServerException;

    ResultMap shareLogin(String token, UserLogin userLogin);

    ResultMap getShareDisplay(String token, User user, HttpServletRequest request);

    ResultMap getShareDashboard(String token, User user, HttpServletRequest request);

    ResultMap getShareData(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request);

    ResultMap generationShareDataCsv(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request);

}
