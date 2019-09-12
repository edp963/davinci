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

package edp.davinci.core.inteceptor;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.annotation.AuthIgnore;
import edp.core.annotation.AuthShare;
import edp.core.enums.HttpCodeEnum;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.model.User;
import edp.davinci.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;

@Slf4j
public class AuthenticationInterceptor implements HandlerInterceptor {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        HandlerMethod handlerMethod = null;
        try {
            handlerMethod = (HandlerMethod) handler;
        } catch (Exception e) {
            response.setStatus(HttpCodeEnum.NOT_FOUND.getCode());
            return false;
        }
        Method method = handlerMethod.getMethod();

        AuthIgnore ignoreAuthMethod = method.getAnnotation(AuthIgnore.class);
        //注解不需要验证token
        if (handler instanceof HandlerMethod && null != ignoreAuthMethod) {
            return true;
        }

        String token = request.getHeader(Constants.TOKEN_HEADER_STRING);

        AuthShare authShareMethoed = method.getAnnotation(AuthShare.class);
        if (handler instanceof HandlerMethod && null != authShareMethoed) {
            if (!StringUtils.isEmpty(token) && token.startsWith(Constants.TOKEN_PREFIX)) {
                String username = tokenUtils.getUsername(token);
                User user = userService.getByUsername(username);
                request.setAttribute(Constants.CURRENT_USER, user);
            }
            return true;
        }

        if (StringUtils.isEmpty(token) || !token.startsWith(Constants.TOKEN_PREFIX)) {
            log.info("{} : Unknown token", request.getServletPath());
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            return false;
        }
        String username = tokenUtils.getUsername(token);
        User user = userService.getByUsername(username);
        if (null == user) {
            log.info("{} : token user not found", request.getServletPath());
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("ERROR Permission denied");
            return false;

        }
        if (!tokenUtils.validateToken(token, user)) {
            log.info("{} : token validation fails", request.getServletPath());
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("Invalid token ");
            return false;
        }

        if (!request.getServletPath().contains("/user/active") && !user.getActive()) {
            if (request.getServletPath().contains("/user/sendmail")) {
                request.setAttribute(Constants.CURRENT_USER, user);
                return true;
            }
            log.info("current user is not activated, username: {}", user.getUsername());
            response.setStatus(HttpCodeEnum.FAIL.getCode());
            ResultMap resultMap = new ResultMap(tokenUtils);
            response.getWriter().print(JSONObject.toJSONString(resultMap.failAndRefreshToken(request).message("Account not active yet. Please check your email to activate your account")));
            return false;
        }
        request.setAttribute(Constants.CURRENT_USER, user);
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
