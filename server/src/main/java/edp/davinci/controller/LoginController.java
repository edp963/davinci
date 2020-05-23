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

package edp.davinci.controller;

import edp.core.annotation.AuthIgnore;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserLoginResult;
import edp.davinci.model.User;
import edp.davinci.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


@Api(tags = "login", basePath = Constants.BASE_API_PATH, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses({
        @ApiResponse(code = 400, message = "pwd is wrong"),
        @ApiResponse(code = 404, message = "user not found")
})
@RestController
@Slf4j
@RequestMapping(value = Constants.BASE_API_PATH + "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    /**
     * 登录
     *
     * @param userLogin
     * @param bindingResult
     * @return
     */
    @ApiOperation(value = "Login into the server and return token")
    @PostMapping
    public ResponseEntity login(@Valid @RequestBody UserLogin userLogin, @ApiIgnore BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap().fail().message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        User user = userService.userLogin(userLogin);
        if (!user.getActive()) {
            log.info("this user is not active： {}", userLogin.getUsername());
            ResultMap resultMap = new ResultMap(tokenUtils).failWithToken(tokenUtils.generateToken(user)).message("this user is not active");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        UserLoginResult userLoginResult = new UserLoginResult(user);
        String statistic_open = environment.getProperty("statistic.enable");
        if ("true".equalsIgnoreCase(statistic_open)) {
            userLoginResult.setStatisticOpen(true);
        }

        return ResponseEntity.ok(new ResultMap().success(tokenUtils.generateToken(user)).payload(userLoginResult));
    }

    @ApiOperation(value = "get oauth2 clents")
    @GetMapping(value = "getOauth2Clients", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @AuthIgnore
    public ResponseEntity getOauth2Clients(HttpServletRequest request) {

        if (clientRegistrationRepository == null) {
            return ResponseEntity.ok(new ResultMap().payloads(null));
        }

        Iterable<ClientRegistration> clientRegistrations = (Iterable<ClientRegistration>) clientRegistrationRepository;
        List<HashMap<String, String>> clients = new ArrayList<>();
        clientRegistrations.forEach(registration -> {
            HashMap<String, String> map = new HashMap<>();
            map.put(registration.getClientName(), OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI + "/" + registration.getRegistrationId() + "?redirect_url=/");
            clients.add(map);
        });

        return ResponseEntity.ok(new ResultMap().payloads(clients));
    }

    @ApiOperation(value = "External Login")
    @AuthIgnore
    @PostMapping(value = "externalLogin", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity externalLogin(Principal principal) {
        if (null != principal && principal instanceof OAuth2AuthenticationToken) {
            User user = userService.externalRegist((OAuth2AuthenticationToken) principal);
            String token = tokenUtils.generateToken(user);
            userService.activateUserNoLogin(token, null);
            UserLoginResult userLoginResult = new UserLoginResult(user);
            String statistic_open = environment.getProperty("statistic.enable");
            if ("true".equalsIgnoreCase(statistic_open)) {
                userLoginResult.setStatisticOpen(true);
            }
            return ResponseEntity.ok(new ResultMap().success(token).payload(userLoginResult));
        }
        return ResponseEntity.status(401).build();
    }
}
