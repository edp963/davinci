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

import com.alibaba.druid.util.StringUtils;
import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.displayDto.DisplayInfo;
import edp.davinci.dto.displayDto.DisplaySlideCreate;
import edp.davinci.dto.displayDto.DisplayUpdateDto;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetCreate;
import edp.davinci.model.DisplaySlide;
import edp.davinci.model.MemDisplaySlideWidget;
import edp.davinci.model.User;
import edp.davinci.service.DisplayService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@Api(value = "/displays", tags = "displays", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "display not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/displays", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class DisplayController extends BaseController {

    @Autowired
    private DisplayService displayService;

    /**
     * 新建display
     *
     * @param displayInfo
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create new display", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createDisplay(@Valid @RequestBody DisplayInfo displayInfo,
                                        @ApiIgnore BindingResult bindingResult,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.createDisplay(displayInfo, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 更新display 信息
     *
     * @param display
     * @param bindingResult
     * @param user
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "update display info", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateDisplay(@Valid @RequestBody DisplayUpdateDto display,
                                        @ApiIgnore BindingResult bindingResult,
                                        @ApiIgnore @CurrentUser User user,
                                        @PathVariable Long id, HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(id) || !id.equals(display.getId())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.updateDisplay(display, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }

    }

    /**
     * 删除display
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete a display", consumes = MediaType.APPLICATION_JSON_VALUE)
    @DeleteMapping("/{id}")
    public ResponseEntity deleteDisplay(@PathVariable Long id,
                                        @ApiIgnore @CurrentUser User user,
                                        HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.deleteDisplay(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 新建displaySlide
     *
     * @param displaySlideCreate
     * @param bindingResult
     * @param displayId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create new display slide", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(value = "/{id}/slides", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createDisplaySlide(@Valid @RequestBody DisplaySlideCreate displaySlideCreate,
                                             @ApiIgnore BindingResult bindingResult,
                                             @PathVariable("id") Long displayId,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(displayId) || !displayId.equals(displaySlideCreate.getDisplayId())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.createDisplaySlide(displaySlideCreate, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 更新displayslides信息
     *
     * @param displaySlides
     * @param bindingResult
     * @param user
     * @param displayId
     * @param request
     * @return
     */
    @ApiOperation(value = "update display slides info", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{id}/slides", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateDisplaySlide(@Valid @RequestBody DisplaySlide[] displaySlides,
                                             @ApiIgnore BindingResult bindingResult,
                                             @ApiIgnore @CurrentUser User user,
                                             @PathVariable("id") Long displayId, HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == displaySlides || displaySlides.length < 1) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("display slide info cannot be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (DisplaySlide displaySlide : displaySlides) {
            if (!displaySlide.getDisplayId().equals(displayId)) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        try {
            ResultMap resultMap = displayService.updateDisplaySildes(displayId, displaySlides, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除DisplaySlide
     *
     * @param slideId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete display slide", consumes = MediaType.APPLICATION_JSON_VALUE)
    @DeleteMapping("/slides/{slideId}")
    public ResponseEntity deleteDisplaySlide(@PathVariable("slideId") Long slideId,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {

        if (invalidId(slideId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.deleteDisplaySlide(slideId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 在displaySlide下新建widget关联
     *
     * @param slideWidgetCreates
     * @param displayId
     * @param slideId
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "add display slide widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping(value = "/{displayId}/slides/{slideId}/widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity addMemDisplaySlideWidgets(@PathVariable("displayId") Long displayId,
                                                    @PathVariable("slideId") Long slideId,
                                                    @Valid @RequestBody MemDisplaySlideWidgetCreate[] slideWidgetCreates,
                                                    @ApiIgnore BindingResult bindingResult,
                                                    @ApiIgnore @CurrentUser User user,
                                                    HttpServletRequest request) {

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(slideId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == slideWidgetCreates || slideWidgetCreates.length < 1) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("display slide widget info cannot be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (MemDisplaySlideWidgetCreate slideWidgetCreate : slideWidgetCreates) {
            if (!slideWidgetCreate.getDisplaySlideId().equals(slideId)) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display slide id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
            if (slideWidgetCreate.getType() == 1 && invalidId(slideWidgetCreate.getWidgetId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid widget id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.addMemDisplaySlideWidgets(displayId, slideId, slideWidgetCreates, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 批量修改widget关联
     *
     * @param memDisplaySlideWidgets
     * @param displayId
     * @param slideId
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update display slide widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/{displayId}/slides/{slideId}/widgets", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateMemDisplaySlideWidgets(@PathVariable("displayId") Long displayId,
                                                       @PathVariable("slideId") Long slideId,
                                                       @Valid @RequestBody MemDisplaySlideWidget[] memDisplaySlideWidgets,
                                                       @ApiIgnore BindingResult bindingResult,
                                                       @ApiIgnore @CurrentUser User user,
                                                       HttpServletRequest request) {

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(slideId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == memDisplaySlideWidgets || memDisplaySlideWidgets.length < 1) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("display slide widget info cannot be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        for (MemDisplaySlideWidget slideWidgetCreate : memDisplaySlideWidgets) {
            if (!slideWidgetCreate.getDisplaySlideId().equals(slideId)) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid display slide id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
            if (1 == slideWidgetCreate.getType() && invalidId(slideWidgetCreate.getWidgetId())) {
                ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid widget id");
                return ResponseEntity.status(resultMap.getCode()).body(resultMap);
            }
        }

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.updateMemDisplaySlideWidgets(displayId, slideId, memDisplaySlideWidgets, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 修改displaySlide下的widget关联信息
     *
     * @param memDisplaySlideWidget
     * @param bindingResult
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update display slide widget", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PutMapping(value = "/slides/widgets/{relationId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateMemDisplaySlideWidget(@PathVariable("relationId") Long relationId,
                                                      @Valid @RequestBody MemDisplaySlideWidget memDisplaySlideWidget,
                                                      @ApiIgnore BindingResult bindingResult,
                                                      @ApiIgnore @CurrentUser User user,
                                                      HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(relationId) || !memDisplaySlideWidget.getId().equals(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.updateMemDisplaySlideWidget(memDisplaySlideWidget, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除displaySlide下的widget关联信息
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete display slide widget", consumes = MediaType.APPLICATION_JSON_VALUE)
    @DeleteMapping("/slides/widgets/{relationId}")
    public ResponseEntity deleteMemDisplaySlideWidget(@PathVariable("relationId") Long relationId,
                                                      @ApiIgnore @CurrentUser User user,
                                                      HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.deleteMemDisplaySlideWidget(relationId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 获取display列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get displays")
    @GetMapping
    public ResponseEntity getDisplays(@RequestParam Long projectId,
                                      @ApiIgnore @CurrentUser User user,
                                      HttpServletRequest request) {

        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = displayService.getDisplayListByProject(projectId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取display slide列表
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get display slides")
    @GetMapping("/{id}/slides")
    public ResponseEntity getDisplaySlide(@PathVariable Long id,
                                          @ApiIgnore @CurrentUser User user,
                                          HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid Display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = displayService.getDisplaySlideList(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取displaySlide下widgets关联信息列表
     *
     * @param displayId
     * @param slideId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get display slide widgets")
    @GetMapping("/{displayId}/slides/{slideId}/widgets")
    public ResponseEntity getDisplaySlideWeight(@PathVariable("displayId") Long displayId,
                                                @PathVariable("slideId") Long slideId,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid Display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid Display Slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.getDisplaySlideWidgetList(displayId, slideId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 删除displaySlide下widgets关联信息列表
     *
     * @param displayId
     * @param slideId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete display slide widgets")
    @DeleteMapping("/{displayId}/slides/{slideId}/widgets")
    public ResponseEntity deleteDisplaySlideWeight(@PathVariable("displayId") Long displayId,
                                                   @PathVariable("slideId") Long slideId,
                                                   @RequestBody Long[] ids,
                                                   @ApiIgnore @CurrentUser User user,
                                                   HttpServletRequest request) {

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid Display id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(displayId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid Display Slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (null == ids || ids.length < 1) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("nothing be deleted");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.deleteDisplaySlideWidgetList(displayId, slideId, ids, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 上传封面图
     *
     * @param file
     * @param request
     * @return
     */
    @ApiOperation(value = "upload avatar")
    @PostMapping(value = "/upload/coverImage")
    public ResponseEntity uploadAvatar(@RequestParam("coverImage") MultipartFile file,
                                       HttpServletRequest request) {


        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("file can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.uploadAvatar(file, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 上传slide背景图
     *
     * @param slideId
     * @param file
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "upload avatar")
    @PostMapping(value = "/slide/{slideId}/upload/bgImage")
    public ResponseEntity uploadSlideBGImage(@PathVariable Long slideId,
                                             @RequestParam("backgroundImage") MultipartFile file,
                                             @ApiIgnore @CurrentUser User user,
                                             HttpServletRequest request) {

        if (invalidId(slideId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid slide id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("file can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.uploadSlideBGImage(slideId, file, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 上传slide背景图
     *
     * @param relationId
     * @param file
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "upload subwidget bgImage")
    @PostMapping(value = "/slide/widget/{relationId}/bgImage")
    public ResponseEntity uploadSlideSubWidgetBGImage(@PathVariable Long relationId,
                                                      @RequestParam("backgroundImage") MultipartFile file,
                                                      @ApiIgnore @CurrentUser User user,
                                                      HttpServletRequest request) {

        if (invalidId(relationId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid relation id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (file.isEmpty() || StringUtils.isEmpty(file.getOriginalFilename())) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("file can not be empty");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.uploadSlideSubWidgetBGImage(relationId, file, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 共享display
     *
     * @param id
     * @param username
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "share display")
    @GetMapping("/{id}/share")
    public ResponseEntity shareDisplay(@PathVariable Long id,
                                       @RequestParam(required = false) String username,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = displayService.shareDisplay(id, user, username, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 获取Display 排除访问的团队列表
     *
     * @param id
     * @param request
     * @return
     */
    @ApiOperation(value = "get display  exclude teams")
    @GetMapping("/{id}/exclude/teams")
    public ResponseEntity getPortalExcludeTeams(@PathVariable Long id,
                                                HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            List<Long> excludeTeams = displayService.getDisplayExcludeTeams(id);
            ResultMap resultMap = new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(excludeTeams);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }
}
