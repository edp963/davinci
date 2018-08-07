package edp.davinci.service;


import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserRegist;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface UserService extends CheckEntityService {

    User getByUsername(String username);

    ResultMap userLogin(UserLogin userLogin);

    ResultMap getUsersByKeyword(String keyword, User user, Long orgId, HttpServletRequest request);

    ResultMap updateUser(User user, HttpServletRequest request);

    ResultMap regist(UserRegist userRegist);

//    ResultMap activateUser(User user, String token, HttpServletRequest request);

    ResultMap sendMail(String email, User user, HttpServletRequest request);

    ResultMap changeUserPassword(User user, String oldPassword, String password, HttpServletRequest request);

    ResultMap uploadAvatar(User user, MultipartFile file, HttpServletRequest request);

    ResultMap activateUserNoLogin(String token, HttpServletRequest request);

    ResultMap getUserProfile(Long id, User user, HttpServletRequest request);
}
