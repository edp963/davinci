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

package edp.davinci.controller;


import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.annotation.AuthIgnore;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.model.Platform;
import edp.davinci.model.User;
import edp.davinci.service.AuthPlatformService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Controller
@Slf4j
@RequestMapping(value = Constants.AUTH_API_PATH)
public class AuthPlatformController extends BaseController {

    @Autowired(required = false)
    private AuthPlatformService authPlatformService;

    @GetMapping(value = "/vizs", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @AuthIgnore
    @ResponseBody
    public ResponseEntity getProjectAndVizs(@RequestParam(value = "authCode", required = false) String authCode,
                                            @RequestParam(value = "email", required = false) String email) {

        if (null == authPlatformService) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.NOT_FOUND.getCode())
                    .message(HttpCodeEnum.NOT_FOUND.getMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (StringUtils.isEmpty(authCode)) {
            ResultMap resultMap = new ResultMap()
                    .fail(HttpCodeEnum.UNAUTHORIZED.getCode())
                    .message("The resource requires authentication, which was not supplied with the request");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }


        if (StringUtils.isEmpty(email)) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.FORBIDDEN.getCode())
                    .message(HttpCodeEnum.FORBIDDEN.getMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = authPlatformService.getProjectVizs(authCode, email);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }

    }

    @GetMapping(value = "/viz/{type}/{id}")
    public String toViz(@PathVariable("type") String type,
                        @PathVariable("id") Long id,
                        @CurrentUser User user,
                        @CurrentUser Platform platform,
                        RedirectAttributes attributes,
                        HttpServletResponse response) {

        if (StringUtils.isEmpty(type)) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.NOT_FOUND.getCode()).message("viz type is not found");
            try {
                response.getWriter().print(JSONObject.toJSONString(resultMap));
                response.flushBuffer();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.NOT_FOUND.getCode()).message("viz id is invalidId");
            try {
                response.getWriter().print(JSONObject.toJSONString(resultMap));
                response.flushBuffer();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        String token = authPlatformService.getAuthShareToken(platform, type, id, user);
        attributes.addAttribute("token", token);
        attributes.addAttribute("type", type);

        try {
            response.getWriter().print("go to view...");
            response.flushBuffer();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;

//        return "redirect:";
    }


}
