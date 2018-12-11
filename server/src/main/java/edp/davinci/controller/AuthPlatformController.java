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


import edp.core.annotation.CurrentPlatform;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
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

import static edp.core.consts.Consts.AUTH_CODE;

@Controller
@Slf4j
@RequestMapping(value = Constants.AUTH_API_PATH)
public class AuthPlatformController {

    @Autowired(required = false)
    private AuthPlatformService authPlatformService;

    @GetMapping(value = "/vizs", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity getProjectAndVizs(@CurrentUser User user) {

        if (null == authPlatformService) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.NOT_FOUND.getCode());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == user) {
            ResultMap resultMap = new ResultMap().fail(HttpCodeEnum.NOT_FOUND.getCode());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = authPlatformService.getProjectVizs(user);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }

    }
    
}
