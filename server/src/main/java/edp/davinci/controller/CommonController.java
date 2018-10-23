/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.controller;

import edp.core.common.job.ScheduleService;
import edp.davinci.dto.cronJobDto.PersistImage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;

@Api(value = "/common", tags = "common", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "sources not found"))
@Slf4j
@RestController
@RequestMapping(value = "/common", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class CommonController {

    @Autowired
    private ScheduleService scheduleService;


    @PostMapping(value = "/screenshot")
    public boolean persist(@Valid @RequestBody PersistImage persistData, @ApiIgnore BindingResult bindingResult) throws Exception {

        if (bindingResult.hasErrors()) {
            throw new Exception(bindingResult.getFieldErrors().get(0).getDefaultMessage());
        }

        return scheduleService.persistCallback(persistData);
    }
}
