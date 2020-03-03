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
package edp.davinci.server.controller;

import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.commons.ValidList;
import edp.davinci.server.dto.statistic.DavinciStatisticDuration;
import edp.davinci.server.dto.statistic.DavinciStatisticTerminal;
import edp.davinci.server.dto.statistic.DavinciStatisticVisitorOperation;
import edp.davinci.server.service.StatisticService;
import edp.davinci.server.util.TokenUtils;
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
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/statistic", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @Autowired
    public TokenUtils tokenUtils;

    @ApiOperation(value = "collect duration info ")
    @PostMapping(value = "/duration", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectDurationInfo(@Valid @RequestBody ValidList<DavinciStatisticDuration> durationInfos,
                                              HttpServletRequest request){

    	statisticService.insert(durationInfos, DavinciStatisticDuration.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    @ApiOperation(value = "collect terminal info ")
    @PostMapping(value = "/terminal", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectTerminalInfo(@Valid @RequestBody ValidList<DavinciStatisticTerminal> terminalInfoInfos,
                                              HttpServletRequest request){

        statisticService.insert(terminalInfoInfos, DavinciStatisticTerminal.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

    @ApiOperation(value = "collect visitor operation info ")
    @PostMapping(value = "/visitoroperation", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity collectVisitorOperationInfo(@Valid @RequestBody ValidList<DavinciStatisticVisitorOperation> visitorOperationInfos,
                                              HttpServletRequest request){

        statisticService.insert(visitorOperationInfos, DavinciStatisticVisitorOperation.class);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }

}
