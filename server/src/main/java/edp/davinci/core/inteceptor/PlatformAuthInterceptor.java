/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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
import edp.core.enums.HttpCodeEnum;
import edp.davinci.core.common.Constants;
import edp.davinci.core.service.AuthenticationService;
import edp.davinci.dao.PlatformMapper;
import edp.davinci.model.Platform;
import edp.davinci.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

import static edp.core.consts.Consts.AUTH_CODE;

@Slf4j
public class PlatformAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private PlatformMapper platformMapper;

    @Autowired
    private BeanFactory beanFactory;


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        Map<String, String[]> parameterMap = request.getParameterMap();
        if (null == parameterMap) {
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            return false;
        }

        if (!parameterMap.containsKey(AUTH_CODE) || null == parameterMap.get(AUTH_CODE) || parameterMap.get(AUTH_CODE).length == 0) {
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            return false;
        }

        String authCode = parameterMap.get(AUTH_CODE)[0];
        if (StringUtils.isEmpty(authCode)) {
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            return false;
        }

        Platform platform = platformMapper.getPlatformByCode(authCode);
        if (null == platform) {
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            return false;
        }

        AuthenticationService authenticationService = (AuthenticationService) beanFactory.getBean(platform.getPlatform() + "AuthenticationService");
        User user = null;
        try {
            user = authenticationService.checkUser(platform ,parameterMap);
            if (null == user) {
                response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
                response.getWriter().print("ERROR Permission denied");
                new RuntimeException("check user token error");
                return false;
            }
        } catch (Exception e) {
            response.setStatus(HttpCodeEnum.FORBIDDEN.getCode());
            response.getWriter().print("The resource requires authentication, which was not supplied with the request");
            new RuntimeException(e.getMessage());
            return false;
        }

        request.setAttribute(Constants.CURRENT_USER, user);
        request.setAttribute(Constants.CURRENT_PLATFORM, platform);
        return true;
    }
}
