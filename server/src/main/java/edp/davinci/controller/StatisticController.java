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
 */
package edp.davinci.controller;

import edp.core.utils.TokenUtils;
import edp.davinci.common.model.ValidList;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.statistic.DavinciStatisticDurationInfo;
import edp.davinci.dto.statistic.DavinciStatisticTerminalInfo;
import edp.davinci.dto.statistic.DavinciStatisticVisitorOperationInfo;
import edp.davinci.service.BuriedPointsService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@Api(value = "/statistic", tags = "statistic", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "statistic not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/statistic", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class StatisticController {

    @Autowired
    private BuriedPointsService buriedPointsService;

    @Autowired
    public TokenUtils tokenUtils;

    @ApiOperation(value = "collect duration info ")
    @PostMapping(value = "/duration", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectDurationInfo(@Valid @RequestBody ValidList<DavinciStatisticDurationInfo> durationInfos,
                                              HttpServletRequest request){

        buriedPointsService.insert(durationInfos, DavinciStatisticDurationInfo.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    @ApiOperation(value = "collect terminal info ")
    @PostMapping(value = "/terminal", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectTerminalInfo(@Valid @RequestBody ValidList<DavinciStatisticTerminalInfo> terminalInfoInfos,
                                              HttpServletRequest request){

        buriedPointsService.insert(terminalInfoInfos, DavinciStatisticTerminalInfo.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    @ApiOperation(value = "collect visitor operation info ")
    @PostMapping(value = "/visitoroperation", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectVisitorOperationInfo(@Valid @RequestBody ValidList<DavinciStatisticVisitorOperationInfo> visitorOperationInfos,
                                              HttpServletRequest request){

        buriedPointsService.insert(visitorOperationInfos, DavinciStatisticVisitorOperationInfo.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

}
