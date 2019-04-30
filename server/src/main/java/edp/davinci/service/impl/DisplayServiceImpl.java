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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.FileUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.*;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.model.*;
import edp.davinci.service.DisplayService;
import edp.davinci.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service("displayService")
public class DisplayServiceImpl extends CommonService implements DisplayService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private DisplaySlideMapper displaySlideMapper;

    @Autowired
    private MemDisplaySlideWidgetMapper memDisplaySlideWidgetMapper;

    @Autowired
    private ShareServiceImpl shareService;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private RelRoleDisplayMapper relRoleDisplayMapper;

    @Autowired
    private RelRoleSlideMapper relRoleSlideMapper;

    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
        Long displayId = displayMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != displayId) {
            return !id.equals(displayId);
        }
        return null != displayId && displayId.longValue() > 0L;
    }


    /**
     * 新建display
     *
     * @param displayInfo
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Display createDisplay(DisplayInfo displayInfo, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectDetail projectDetail = projectService.getProjectDetail(displayInfo.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to create display", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to create display");
        }

        if (isExist(displayInfo.getName(), null, displayInfo.getProjectId())) {
            log.info("the display name {} is already taken", displayInfo.getName());
            throw new ServerException("the display name " + displayInfo.getName() + " is already taken");
        }


        Display display = new Display().createdBy(user.getId());
        BeanUtils.copyProperties(displayInfo, display);

        int insert = displayMapper.insert(display);
        if (insert > 0) {
            optLogger.info("display ({}) is create by (:{})", display.toString(), user.getId());

            if (null != displayInfo.getRoleIds() && displayInfo.getRoleIds().size() > 0) {
                List<Role> roles = roleMapper.getRolesByIds(displayInfo.getRoleIds());

                List<RelRoleDisplay> list = roles.stream()
                        .map(r -> new RelRoleDisplay(r.getId(), display.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());

                relRoleDisplayMapper.insertBatch(list);

                optLogger.info("display ({}) limit role ({}) access", display.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
            }

            return display;
        } else {
            throw new ServerException("create display fail");
        }
    }


    /**
     * 删除display
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteDisplay(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(id);

        if (null == displayWithProject) {
            log.info("display (:{}) is not found", id);
            return true;
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(displayWithProject.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to delete display", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to delete display");
        }

        //删除display实体
        displayMapper.deleteById(id);

        relRoleDisplayMapper.deleteByDisplayId(id);

        //删除displaySlide
        displaySlideMapper.deleteByDisplayId(id);

        //删除displaySlide和widget的关联
        memDisplaySlideWidgetMapper.deleteByDisplayId(id);

        return true;
    }

    /**
     * 删除displaySlide
     *
     * @param slideId
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteDisplaySlide(Long slideId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        DisplaySlide displaySlide = displaySlideMapper.getById(slideId);
        if (null == displaySlide) {
            log.info("display slide is not found");
            return true;
        }

        Display display = displayMapper.getById(displaySlide.getDisplayId());
        if (null == display) {
            log.info("display is not found");
            throw new NotFoundException("display is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(display.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to delete display slide", user.getUsername());
            throw new UnAuthorizedExecption("you have not permisson to delete this display slide");
        }

        //删除displaySlide实体
        displaySlideMapper.deleteById(slideId);
        optLogger.info("display slide ({}) is delete by (:{})", displaySlide.toString(), user.getId());

        relRoleSlideMapper.deleteBySlideId(slideId);

        //删除displaySlide和widget的关联
        memDisplaySlideWidgetMapper.deleteBySlideId(slideId);

        return true;
    }

    /**
     * 更新display信息
     *
     * @param displayUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateDisplay(DisplayUpdate displayUpdate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Display display = displayMapper.getById(displayUpdate.getId());
        if (null == display) {
            throw new NotFoundException("display is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(display.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to update display", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to update display");
        }


        if (!StringUtils.isEmpty(display.getAvatar()) && !display.getAvatar().startsWith(Constants.DISPLAY_AVATAR_PATH)) {
            throw new ServerException("Invalid cover image");
        }

        //删除原有封面图
        if (!StringUtils.isEmpty(display.getAvatar()) && !display.getAvatar().equals(display.getAvatar())) {
            File file = new File(display.getAvatar());
            if (null != file && file.exists() && file.isFile() && fileUtils.isImage(file)) {
                file.delete();
            }
        }
        String origin = display.toString();

        BeanUtils.copyProperties(displayUpdate, display);
        display.updatedBy(user.getId());

        int update = displayMapper.update(display);
        if (update > 0) {
            optLogger.info("display ({}) is update by (:{}), origin: ({})", display.toString(), user.getId(), origin);
            relRoleDisplayMapper.deleteByDisplayId(display.getId());
            List<Role> roles = roleMapper.getRolesByIds(displayUpdate.getRoleIds());

            List<RelRoleDisplay> list = roles.stream()
                    .map(r -> new RelRoleDisplay(r.getId(), display.getId()).createdBy(user.getId()))
                    .collect(Collectors.toList());

            relRoleDisplayMapper.insertBatch(list);

            optLogger.info("update display ({}) limit role ({}) access", display.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));

            return true;
        } else {
            throw new ServerException("update display fail");
        }
    }

    /**
     * 新建diplaySlide
     *
     * @param displaySlideCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public DisplaySlide createDisplaySlide(DisplaySlideCreate displaySlideCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Display display = displayMapper.getById(displaySlideCreate.getDisplayId());
        if (null == display) {
            throw new NotFoundException("display is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(display.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to create displaySlide", user.getUsername());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }


        DisplaySlide displaySlide = new DisplaySlide().createdBy(user.getId());
        BeanUtils.copyProperties(displaySlideCreate, displaySlide);

        int insert = displaySlideMapper.insert(displaySlide);
        if (insert > 0) {
            optLogger.info("display slide ({}) create by (:{})", displaySlide.toString(), user.getId());

            if (null != displaySlideCreate.getRoleIds() && displaySlideCreate.getRoleIds().size() > 0) {
                List<Role> roles = roleMapper.getRolesByIds(displaySlideCreate.getRoleIds());

                List<RelRoleSlide> list = roles.stream()
                        .map(r -> new RelRoleSlide(r.getId(), displaySlide.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());

                relRoleSlideMapper.insertBatch(list);

                optLogger.info("display slide ({}) limit role ({}) access", displaySlide.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
            }

            return displaySlide;
        } else {
            throw new ServerException("create display slide fail");
        }

    }

    /**
     * 更新displaySlides
     *
     * @param displayId
     * @param displaySlides
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateDisplaySildes(Long displayId, DisplaySlide[] displaySlides, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Display display = displayMapper.getById(displayId);
        if (null == display) {
            throw new NotFoundException("display is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(display.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to update displaySlide", user.getUsername());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<DisplaySlide> displaySlideList = new ArrayList<>();
        for (DisplaySlide displaySlide : displaySlides) {
            if (!displaySlide.getDisplayId().equals(displayId)) {
                throw new ServerException("Invalid display id");
            }
            displaySlide.updatedBy(user.getId());
            displaySlideList.add(displaySlide);
        }

        displaySlideMapper.updateBatch(displaySlideList);
        return true;
    }


    /**
     * 在displaySlide下新建widget关联
     *
     * @param displayId
     * @param slideId
     * @param slideWidgetCreates
     * @param user
     * @return
     */
    @Override
    @Transactional
    public List<MemDisplaySlideWidget> addMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetCreate[] slideWidgetCreates, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay() || !slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("Invalid display slide");
        }

        Set<Long> ids = new HashSet<>();
        List<MemDisplaySlideWidget> list = new ArrayList<>();
        List<MemDisplaySlideWidget> clist = new ArrayList<>();
        for (MemDisplaySlideWidgetCreate slideWidgetCreate : slideWidgetCreates) {
            ids.add(slideWidgetCreate.getWidgetId());
            MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget().createdBy(user.getId());
            BeanUtils.copyProperties(slideWidgetCreate, memDisplaySlideWidget);
            list.add(memDisplaySlideWidget);
            //自定义主键，copy 一份修改内容作为返回值
            if (null != slideWidgetCreate.getId() && slideWidgetCreate.getId().longValue() > 0L) {
                MemDisplaySlideWidget cMemDisplaySlideWidget = new MemDisplaySlideWidget().createdBy(user.getId());
                BeanUtils.copyProperties(slideWidgetCreate, cMemDisplaySlideWidget);
                clist.add(cMemDisplaySlideWidget);
            }
        }

        List<Widget> widgets = widgetMapper.getByIds(ids);
        if (null == widgets) {
            throw new ServerException("Invalid widget id");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }


        int i = memDisplaySlideWidgetMapper.insertBatch(list);
        if (i > 0) {
            if (null != clist && clist.size() > 1) {
                optLogger.info("insert batch MemDisplaySlideWidget ({}) by (:{})", clist.toString(), user.getId());
                //自定义主键
                return clist;
            } else {
                //自增主键
                optLogger.info("insert batch MemDisplaySlideWidget ({}) by (:{})", list.toString(), user.getId());
                return list;
            }
        } else {
            log.error("insert batch MemDisplaySlideWidget error");
            throw new ServerException("unkown fail");
        }
    }

    /**
     * 批量更新widget关联
     *
     * @param displayId
     * @param slideId
     * @param memDisplaySlideWidgets
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidget[] memDisplaySlideWidgets, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay() || !slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("Invalid display slide");
        }

        Set<Long> widgetIds = Arrays.stream(memDisplaySlideWidgets).map(MemDisplaySlideWidget::getWidgetId).collect(Collectors.toSet());

        List<Widget> widgets = widgetMapper.getByIds(widgetIds);
        if (null == widgets) {
            throw new ServerException("Invalid widget id");
        }


        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<MemDisplaySlideWidget> list = new ArrayList<>();
        for (MemDisplaySlideWidget memDisplaySlideWidget : memDisplaySlideWidgets) {
            memDisplaySlideWidget.updatedBy(user.getId());
        }

        int i = memDisplaySlideWidgetMapper.updateBatch(list);
        if (i > 0) {
            return true;
        } else {
            log.error("update batch MemDisplaySlideWidget error");
            throw new ServerException("unknown fail");
        }
    }

    /**
     * 修改displaySlide下的widget关联信息
     *
     * @param memDisplaySlideWidget
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateMemDisplaySlideWidget(MemDisplaySlideWidget memDisplaySlideWidget, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(memDisplaySlideWidget.getDisplaySlideId());

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            throw new ServerException("Invalid display slide");
        }

        MemDisplaySlideWidget slideWidget = memDisplaySlideWidgetMapper.getById(memDisplaySlideWidget.getId());
        if (null == slideWidget) {
            throw new ServerException("display slide widget is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        String origin = slideWidget.toString();
        slideWidget.updatedBy(user.getId());
        BeanUtils.copyProperties(memDisplaySlideWidget, slideWidget);
        int update = memDisplaySlideWidgetMapper.update(slideWidget);
        if (update > 0) {
            optLogger.info("MemDisplaySlideWidget ({}) is update by (:{}), origin:{}", slideWidget.toString(), user.getId(), origin);
            return true;
        } else {
            log.error("update MemDisplaySlideWidget error");
            throw new ServerException("unknown fail");
        }
    }

    /**
     * 删除displaySlide下的widget关联信息
     *
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteMemDisplaySlideWidget(Long relationId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        MemDisplaySlideWidget slideWidget = memDisplaySlideWidgetMapper.getById(relationId);
        if (null == slideWidget) {
            optLogger.info("MemDisplaySlideWidget (:{}) is not found", relationId);
            return true;
        }


        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideWidget.getDisplaySlideId());

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            throw new ServerException("Invalid display");
        }


        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        int i = memDisplaySlideWidgetMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("MemDisplaySlideWdget ({}) is delete by (:{})", slideWidget.toString(), user.getId());
            return true;
        } else {
            throw new ServerException("unknown fail");
        }
    }

    /**
     * 根据项目获取当前用户可见Display列表
     *
     * @param projectId
     * @param user
     * @return
     */
    @Override
    public List<Display> getDisplayListByProject(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission()) {
            return null;
        }

        List<Display> displays = displayMapper.getByProject(projectId);
        if (null == displays || displays.size() == 0) {
            return null;
        }

        List<Long> disableList = relRoleDisplayMapper.getDisableDisplayByUser(user.getId(), projectId);

        Iterator<Display> iterator = displays.iterator();
        while (iterator.hasNext()) {
            Display display = iterator.next();
            if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() && (disableList.contains(display.getId()) || !display.getPublish())) {
                iterator.remove();
            }
        }

        return displays;
    }

    /**
     * 根据displayId 获取当前用户可见的displaySlide
     *
     * @param displayId
     * @param user
     * @return
     */
    @Override
    public DisplayWithSlides getDisplaySlideList(Long displayId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        Display display = displayMapper.getById(displayId);
        if (null == display) {
            log.info("display (:{}) not found", displayId);
            throw new NotFoundException("display is not found");
        }

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(display.getProjectId(), user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        boolean isDisable = relRoleDisplayMapper.isDisable(displayId, user.getId());

        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission() ||
                (isDisable && projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission())) {
            return null;
        }

        List<DisplaySlide> displaySlides = displaySlideMapper.selectByDisplayId(displayId);
        if (null == displaySlides || displaySlides.size() == 0) {
            return null;
        }

        List<Long> disableList = relRoleSlideMapper.getDisableDisplayByUser(user.getId(), display.getProjectId());

        Iterator<DisplaySlide> iterator = displaySlides.iterator();
        while (iterator.hasNext()) {
            DisplaySlide displaySlide = iterator.next();
            if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() && disableList.contains(displaySlide.getId())) {
                iterator.remove();
            }
        }

        List<DisplaySlideInfo> displaySlideInfos = disableList.stream().map(slide -> {
            DisplaySlideInfo displaySlideInfo = new DisplaySlideInfo();
            BeanUtils.copyProperties(slide, displaySlideInfo);
            return displaySlideInfo;
        }).collect(Collectors.toList());

        DisplayWithSlides displayWithSlides = new DisplayWithSlides();
        BeanUtils.copyProperties(display, displayWithSlides);
        displayWithSlides.setSlides(displaySlideInfos);

        return displayWithSlides;
    }


    /**
     * 获取displaySlide下widgets关联信息列表
     *
     * @param displayId
     * @param slideId
     * @param user
     * @return
     */
    @Override
    public List<MemDisplaySlideWidget> getDisplaySlideWidgetList(Long displayId, Long slideId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Display display = displayMapper.getById(displayId);
        if (null == display) {
            log.info("display (:{}) not found", displayId);
            throw new NotFoundException("display is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(display.getProjectId(), user, false), user);
        if (projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission() ||
                (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() && !display.getPublish())) {
            log.info("user (:{}) have not permission to view widgets in this display slide", user.getId());
            throw new UnAuthorizedExecption("you have not permission to view widgets in this display slide");
        }

        DisplaySlide displaySlide = displaySlideMapper.getById(slideId);

        if (null == displaySlide || !displaySlide.getDisplayId().equals(displayId)) {
            log.info("display slide (:{}) not found", displayId);
            throw new ServerException("display slide is not found");
        }

        List<MemDisplaySlideWidget> widgetList = memDisplaySlideWidgetMapper.getMemDisplaySlideWidgetListBySlideId(slideId);

        if (null == widgetList || widgetList.size() == 0) {
            return null;
        }

        List<Long> disableList = relRoleSlideMapper.getDisableDisplayByUser(user.getId(), display.getProjectId());

        Iterator<MemDisplaySlideWidget> iterator = widgetList.iterator();

        while (iterator.hasNext()) {
            MemDisplaySlideWidget memDisplaySlideWidget = iterator.next();
            if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() && disableList.contains(memDisplaySlideWidget.getDisplaySlideId())) {
                iterator.remove();
            }
        }

        return widgetList;
    }

    /**
     * 删除displaySlide下widgets关联信息列表
     *
     * @param displayId
     * @param slideId
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteDisplaySlideWidgetList(Long displayId, Long slideId, Long[] memIds, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            throw new NotFoundException("display is not found");
        }

        if (!displayId.equals(slideWithDisplayAndProject.getDisplay().getId())) {
            throw new ServerException("Invalid display id");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);
        if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        if (memIds.length > 0) {
            List<Long> idList = new ArrayList<>(Arrays.asList(memIds));
            memDisplaySlideWidgetMapper.deleteBatchById(idList);
        }
        return true;
    }

    /**
     * 上传display封面图
     *
     * @param file
     * @return
     */
    @Override
    public String uploadAvatar(MultipartFile file) throws ServerException {
        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            throw new ServerException("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException("display cover picture upload error");
        }

        return avatar;
    }

    /**
     * 上传背景图
     *
     * @param slideId
     * @param file
     * @param user
     * @return
     */
    @Override
    @Transactional
    public String uploadSlideBGImage(Long slideId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        SlideWithDisplayAndProject slideWithDipaly = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDipaly) {
            throw new NotFoundException("dispaly slide is not found");
        }

        Display display = slideWithDipaly.getDisplay();
        if (null == display) {
            throw new NotFoundException("display is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(display.getProjectId(), user, false), user);
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            throw new ServerException("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String background = null;

        JSONObject jsonObject = null;
        try {
            background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(background)) {
                throw new ServerException("display slide background upload error");
            }

            if (!StringUtils.isEmpty(slideWithDipaly.getConfig())) {
                jsonObject = JSONObject.parseObject(slideWithDipaly.getConfig());
                if (null == jsonObject) {
                    jsonObject = new JSONObject();
                }
                JSONObject slideParams = null;
                if (null != jsonObject) {
                    slideParams = jsonObject.getJSONObject("slideParams");
                    if (null != slideParams) {
                        //删除原数据
                        if (!StringUtils.isEmpty(slideParams.getString("backgroundImage"))) {
                            File bgFile = new File(slideParams.getString("backgroundImage"));
                            if (null != bgFile && bgFile.exists() && bgFile.isFile() && fileUtils.isImage(bgFile)) {
                                bgFile.delete();
                            }
                        }
                    }
                } else {
                    slideParams = new JSONObject();
                }
                slideParams.put("backgroundImage", background);
                jsonObject.put("slideParams", slideParams);

            } else {
                jsonObject = new JSONObject();
                JSONObject slideParams = new JSONObject();
                slideParams.put("backgroundImage", background);
                jsonObject.put("slideParams", slideParams);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException("display slide background upload error");
        }

        DisplaySlide displaySlide = new DisplaySlide();
        BeanUtils.copyProperties(slideWithDipaly, displaySlide);

        displaySlide.updatedBy(user.getId());
        displaySlide.setConfig(jsonObject.toString());
        displaySlideMapper.update(displaySlide);
        optLogger.info("displaySlide ({}) update by (:{}), origin: {}", displaySlide.toString(), user.getId(), slideWithDipaly.toString());

        return background;
    }


    /**
     * 上传辅助widget背景图
     *
     * @param relationId
     * @param file
     * @param user
     * @return
     */
    @Override
    @Transactional
    public String uploadSlideSubWidgetBGImage(Long relationId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        MemDisplaySlideWidget memDisplaySlideWidget = memDisplaySlideWidgetMapper.getById(relationId);

        if (null == memDisplaySlideWidget) {
            throw new NotFoundException("dispaly slide widget is not found");
        }

        if (2 != memDisplaySlideWidget.getType()) {
            throw new ServerException("dispaly slide widget is not sub widget");
        }

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(memDisplaySlideWidget.getDisplaySlideId());

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String background = null;

        JSONObject jsonObject = null;
        String key = "backgroundImage";
        try {
            background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(background)) {
                throw new NotFoundException("display slide sub widget backgroundImage upload error");
            }

            if (!StringUtils.isEmpty(memDisplaySlideWidget.getParams())) {
                jsonObject = JSONObject.parseObject(memDisplaySlideWidget.getParams());
                if (null != jsonObject) {
                    if (jsonObject.containsKey(key)) {
                        String backgroundImage = jsonObject.getString(key);
                        if (!StringUtils.isEmpty(backgroundImage)) {
                            fileUtils.remove(backgroundImage);
                        }
                    }
                } else {
                    jsonObject = new JSONObject();
                }
            } else {
                jsonObject = new JSONObject();
            }
            jsonObject.put(key, background);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException("display slide sub widget backgroundImage upload error");
        }

        String origin = memDisplaySlideWidget.toString();
        memDisplaySlideWidget.setParams(jsonObject.toString());
        memDisplaySlideWidget.updatedBy(user.getId());
        memDisplaySlideWidgetMapper.update(memDisplaySlideWidget);
        optLogger.info("memDisplaySlideWidget ({}) update by (:{}), origin: ({})", memDisplaySlideWidget.toString(), user.getId(), origin);

        return background;
    }

    @Override
    public String shareDisplay(Long id, User user, String username) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(id);

        if (null == displayWithProject) {
            log.info("display (:{}) not found", id);
            throw new NotFoundException("display is not found");
        }

        if (null == displayWithProject.getProject()) {
            log.info("project not found");
            throw new NotFoundException("project not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(displayWithProject.getProjectId(), user, false), user);

        if (!projectPermission.getSharePermission()) {
            throw new UnAuthorizedExecption("you have not permission to share this display");
        }

        return shareService.generateShareToken(id, username, user.getId());
    }


    @Override
    public List<Long> getDisplayExcludeRoles(Long id) {
        return relRoleDisplayMapper.getById(id);
    }

    @Override
    public List<Long> getSlideExecludeRoles(Long id) {
        return relRoleSlideMapper.getById(id);
    }

    @Override
    @Transactional
    public void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException {
        //删除slide与widget的关联
        memDisplaySlideWidgetMapper.deleteByProject(projectId);
        //删除slide
        displaySlideMapper.deleteByProjectId(projectId);
        //删除display
        displayMapper.deleteByProject(projectId);
    }
}
