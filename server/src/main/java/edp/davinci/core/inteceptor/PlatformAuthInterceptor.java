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
import edp.davinci.core.common.ErrorMsg;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.AuthenticationService;
import edp.davinci.dao.PlatformMapper;
import edp.davinci.dao.UserMapper;
import edp.davinci.model.Platform;
import edp.davinci.model.User;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.Map;

import static edp.core.consts.Consts.AUTH_CODE;

public class PlatformAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private PlatformMapper platformMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BeanFactory beanFactory;

    @Autowired
    private TokenUtils tokenUtils;


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
        if (handler instanceof HandlerMethod && null != ignoreAuthMethod) {
            return true;
        }

        ResultMap resultMap = new ResultMap();

        Map<String, String[]> parameterMap = request.getParameterMap();
        if (null == parameterMap) {
            response.setStatus(HttpCodeEnum.UNAUTHORIZED.getCode());
            resultMap.fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                    .message(ErrorMsg.ERR_MSG_AUTHENTICATION);
            response.getWriter().print(JSONObject.toJSONString(resultMap));
            return false;
        }

        if (!parameterMap.containsKey(AUTH_CODE) || null == parameterMap.get(AUTH_CODE) || parameterMap.get(AUTH_CODE).length == 0) {
            response.setStatus(HttpCodeEnum.UNAUTHORIZED.getCode());
            resultMap.fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                    .message(ErrorMsg.ERR_MSG_AUTHENTICATION);
            response.getWriter().print(JSONObject.toJSONString(resultMap));
            return false;
        }

        String authCode = parameterMap.get(AUTH_CODE)[0];
        if (StringUtils.isEmpty(authCode)) {
            response.setStatus(HttpCodeEnum.UNAUTHORIZED.getCode());
            resultMap.fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                    .message(ErrorMsg.ERR_MSG_AUTHENTICATION);
            response.getWriter().print(JSONObject.toJSONString(resultMap));
            return false;
        }

        Platform platform = platformMapper.getPlatformByCode(authCode);
        if (null == platform) {
            response.setStatus(HttpCodeEnum.UNAUTHORIZED.getCode());
            resultMap.fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                    .message(ErrorMsg.ERR_MSG_AUTHENTICATION);
            response.getWriter().print(JSONObject.toJSONString(resultMap));
            return false;
        }

        User user = null;

        AuthShare authShareMethod = method.getAnnotation(AuthShare.class);
        if (null != authShareMethod) {
            String token = request.getHeader(Constants.TOKEN_HEADER_STRING);
            if (!StringUtils.isEmpty(token) && token.startsWith(Constants.TOKEN_PREFIX)) {
                String username = tokenUtils.getUsername(token);
                user = userMapper.selectByUsername(username);
                if (null != user) {
                    request.setAttribute(Constants.CURRENT_USER, user);
                } else {
                    response.setStatus(HttpCodeEnum.UNAUTHORIZED.getCode());
                    resultMap.fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                            .message(ErrorMsg.ERR_MSG_AUTHENTICATION);
                    response.getWriter().print(JSONObject.toJSONString(resultMap));
                    return false;
                }
            }
        } else {
            AuthenticationService authenticationService = (AuthenticationService) beanFactory.getBean(platform.getPlatform() + "AuthenticationService");
            try {
                user = authenticationService.checkUser(platform ,parameterMap);
                if (null == user) {
                    response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
                    resultMap.fail(HttpCodeEnum.FORBIDDEN.getCode())
                            .message(ErrorMsg.ERR_MSG_PERMISSION);
                    response.getWriter().print(JSONObject.toJSONString(resultMap));
                    return false;
                }
            } catch (Exception e) {
                response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
                resultMap.fail(HttpCodeEnum.FORBIDDEN.getCode())
                        .message(ErrorMsg.ERR_MSG_PERMISSION);
                response.getWriter().print(JSONObject.toJSONString(resultMap));
                return false;
            }
        }

        request.setAttribute(Constants.CURRENT_USER, user);
        request.setAttribute(Constants.CURRENT_PLATFORM, platform);
        return true;
    }
}
