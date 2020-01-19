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

import edp.core.annotation.CurrentUser;
import edp.core.model.Paginate;
import edp.core.model.PaginateWithQueryColumns;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.utils.DacChannelUtil;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.DacChannel;
import edp.davinci.model.User;
import edp.davinci.service.ViewService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Api(value = "/views", tags = "views", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "view not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/views", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class ViewController extends BaseController {

    @Autowired
    private ViewService viewService;

    @Autowired
    private DacChannelUtil dacChannelUtil;

    /**
     * 获取view
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get views")
    @GetMapping
    public ResponseEntity getViews(@RequestParam Long projectId,
                                   @ApiIgnore @CurrentUser User user,
                                   HttpServletRequest request) {

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<ViewBaseInfo> views = viewService.getViews(projectId, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(views));
    }


    /**
     * get view info
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get view info")
    @GetMapping("/{id}")
    public ResponseEntity getView(@PathVariable Long id,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ViewWithSourceBaseInfo view = viewService.getView(id, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(view));
    }


    /**
     * 新建view
     *
     * @param view
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create view")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createView(@Valid @RequestBody ViewCreate view,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ViewWithSourceBaseInfo viewWithSourceBaseInfo = viewService.createView(view, user);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(viewWithSourceBaseInfo));
    }


    /**
     * 修改View
     *
     * @param id
     * @param viewUpdate
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update view")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateView(@PathVariable Long id,
                                     @Valid @RequestBody ViewUpdate viewUpdate,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {


        if (invalidId(id) || !id.equals(viewUpdate.getId())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        viewService.updateView(viewUpdate, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 删除View
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete view")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteView(@PathVariable Long id,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        viewService.deleteView(id, user);

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request));
    }


    /**
     * 执行sql
     *
     * @param executeSql
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "executesql")
    @PostMapping(value = "/executesql", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity executeSql(@Valid @RequestBody ViewExecuteSql executeSql,
                                     @ApiIgnore BindingResult bindingResult,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        PaginateWithQueryColumns paginateWithQueryColumns = viewService.executeSql(executeSql, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(paginateWithQueryColumns));
    }


    /**
     * 获取当前view对应的源数据
     *
     * @param id
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get data")
    @PostMapping(value = "/{id}/getdata", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getData(@PathVariable Long id,
                                  @RequestBody(required = false) ViewExecuteParam executeParam,
                                  @ApiIgnore @CurrentUser User user,
                                  HttpServletRequest request) throws SQLException {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        Paginate<Map<String, Object>> paginate = viewService.getData(id, executeParam, user);
        return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(paginate));
    }


    @ApiOperation(value = "get distinct value")
    @PostMapping(value = "/{id}/getdistinctvalue", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getDistinctValue(@PathVariable Long id,
                                           @Valid @RequestBody DistinctParam param,
                                           @ApiIgnore BindingResult bindingResult,
                                           @ApiIgnore @CurrentUser User user,
                                           HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid view id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        List<Map<String, Object>> distinctValue = viewService.getDistinctValue(id, param, user);
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(distinctValue));
    }


    @ApiOperation(value = "get dac channels")
    @GetMapping("/dac/channels")
    public ResponseEntity getDacChannels(@ApiIgnore @CurrentUser User user, HttpServletRequest request) {
        Map<String, DacChannel> dacMap = DacChannelUtil.dacMap;
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(dacMap.keySet()));
    }

    @ApiOperation(value = "get dac tenants")
    @GetMapping("/dac/{dacName}/tenants")
    public ResponseEntity getDacTannets(@PathVariable String dacName, @ApiIgnore @CurrentUser User user, HttpServletRequest request) {

        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(dacChannelUtil.getTenants(dacName)));
    }


    @ApiOperation(value = "get dac bizs")
    @GetMapping("/dac/{dacName}/tenants/{tenantId}/bizs")
    public ResponseEntity getDacBizs(@PathVariable String dacName,
                                     @PathVariable String tenantId,
                                     @ApiIgnore @CurrentUser User user,
                                     HttpServletRequest request) {
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(dacChannelUtil.getBizs(dacName, tenantId)));
    }
}
