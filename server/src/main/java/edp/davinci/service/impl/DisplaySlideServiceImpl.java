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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.davinci.common.model.RelModelCopy;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.VizEnum;
import edp.davinci.dao.MemDisplaySlideWidgetMapper;
import edp.davinci.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dao.WidgetMapper;
import edp.davinci.dto.displayDto.*;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.model.*;
import edp.davinci.service.DisplaySlideService;
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
@Service("displaySlideService")
public class DisplaySlideServiceImpl extends VizCommonService implements DisplaySlideService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private MemDisplaySlideWidgetMapper memDisplaySlideWidgetMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private RelRoleDisplaySlideWidgetMapper relRoleDisplaySlideWidgetMapper;

    @Override
    public boolean isExist(String name, Long id, Long scopeId) {
        return false;
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

        List<Long> disableDisplays = getDisableVizs(user.getId(), display.getProjectId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(display.getId());

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
            log.info("user {} have not permisson to create displaySlide", user.getUsername());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }


        DisplaySlide displaySlide = new DisplaySlide().createdBy(user.getId());
        BeanUtils.copyProperties(displaySlideCreate, displaySlide);

        int insert = displaySlideMapper.insert(displaySlide);
        if (insert > 0) {
            optLogger.info("display slide ({}) create by (:{})", displaySlide.toString(), user.getId());

            if (!CollectionUtils.isEmpty(displaySlideCreate.getRoleIds())) {
                List<Role> roles = roleMapper.getRolesByIds(displaySlideCreate.getRoleIds());

                List<RelRoleSlide> list = roles.stream()
                        .map(r -> new RelRoleSlide(displaySlide.getId(), r.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());

                if (!CollectionUtils.isEmpty(list)) {
                    relRoleSlideMapper.insertBatch(list);

                    optLogger.info("display slide ({}) limit role ({}) access", displaySlide.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
                }
            }

            return displaySlide;
        } else {
            throw new ServerException("create display slide fail");
        }

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

        List<Long> disableDisplays = getDisableVizs(user.getId(), display.getProjectId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(display.getId());

        List<Long> disableSlides = getDisableVizs(user.getId(), display.getId(), null, VizEnum.SLIDE);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideId)))) {
            log.info("user {} have not permisson to delete display slide", user.getUsername());
            throw new UnAuthorizedExecption("you have not permisson to delete this display slide");
        }

        //delete rel_role_display_slide_widget
        relRoleDisplaySlideWidgetMapper.deleteBySlideId(slideId);

        //delete mem_display_slide_widget
        memDisplaySlideWidgetMapper.deleteBySlideId(slideId);

        //delete rel_role_slide
        relRoleSlideMapper.deleteBySlideId(slideId);

        //delete display_slide
        displaySlideMapper.deleteById(slideId);

        optLogger.info("display slide ({}) is delete by (:{})", displaySlide.toString(), user.getId());

        return true;
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

        List<Long> disableDisplays = getDisableVizs(user.getId(), display.getProjectId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(displayId);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
            log.info("user {} have not permisson to update displaySlide", user.getUsername());
            throw new UnAuthorizedExecption("Insufficient permissions");
        }
        List<Long> disableSlides = getDisableVizs(user.getId(), displayId, null, VizEnum.SLIDE);

        List<DisplaySlide> displaySlideList = new ArrayList<>();
        for (DisplaySlide displaySlide : displaySlides) {

            if (!projectPermission.isProjectMaintainer() && disableSlides.contains(displaySlide.getId())) {
                throw new UnAuthorizedExecption("Insufficient permissions");
            }

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

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);
        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);

        boolean disable = disableDisplays.contains(displayId);
        List<Long> disableSlides = getDisableVizs(user.getId(), displayId, null, VizEnum.SLIDE);


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideId)))) {
            throw new UnAuthorizedExecption("Insufficient permissions");
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


        int i = memDisplaySlideWidgetMapper.insertBatch(list);
        if (i > 0) {
            List<RelRoleDisplaySlideWidget> relRoleDisplaySlideWidgetList = new ArrayList<>();
            for (MemDisplaySlideWidget memDisplaySlideWidget : list) {
                MemDisplaySlideWidgetCreate memDisplaySlideWidgetCreate = Arrays.stream(slideWidgetCreates).filter(
                        (item -> (item.getDisplaySlideId().longValue() == memDisplaySlideWidget.getDisplaySlideId().longValue()))
                ).findFirst().get();

                if (!CollectionUtils.isEmpty(memDisplaySlideWidgetCreate.getRoleIds())) {
                    List<Role> roles = roleMapper.getRolesByIds(memDisplaySlideWidgetCreate.getRoleIds());
                    relRoleDisplaySlideWidgetList.addAll(roles.stream()
                            .map(r -> new RelRoleDisplaySlideWidget(r.getId(), memDisplaySlideWidget.getId()).createdBy(user.getId())).collect(Collectors.toList()));
                }
            }

            if (!CollectionUtils.isEmpty(relRoleDisplaySlideWidgetList)) {
                relRoleDisplaySlideWidgetMapper.insertBatch(relRoleDisplaySlideWidgetList);
                optLogger.info("RoleDisplaySlideWidgets ({}) batch insert by (:{})", relRoleDisplaySlideWidgetList.toString(), user.getId());
            }

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
    public boolean updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetDto[] memDisplaySlideWidgets, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay() || !slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("Invalid display slide");
        }

        List<MemDisplaySlideWidgetDto> dtoList = Arrays.asList(memDisplaySlideWidgets);
        Set<Long> widgetIds = dtoList.stream().map(MemDisplaySlideWidgetDto::getWidgetId).collect(Collectors.toSet());

        List<Widget> widgets = widgetMapper.getByIds(widgetIds);
        if (null == widgets) {
            throw new ServerException("Invalid widget id");
        }


        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(slideWithDisplayAndProject.getProject().getId(), user, false), user);

        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(displayId);
        List<Long> disableSlides = getDisableVizs(user.getId(), displayId, null, VizEnum.SLIDE);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideId)))) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<MemDisplaySlideWidget> memDisplaySlideWidgetList = new ArrayList<>(dtoList.size());
        Map<Long, List<Long>> rolesMap = new HashMap<>();
        dtoList.forEach(m -> {
            m.updatedBy(user.getId());
            memDisplaySlideWidgetList.add(m);
            rolesMap.put(m.getId(), m.getRoleIds());
        });

        int i = memDisplaySlideWidgetMapper.updateBatch(memDisplaySlideWidgetList);
        if (i > 0) {
            if (!CollectionUtils.isEmpty(rolesMap)) {
                Set<Long> memDisplaySlideWidgetIds = rolesMap.keySet();
                relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetIds(memDisplaySlideWidgetIds);

                List<RelRoleDisplaySlideWidget> relRoleDisplaySlideWidgetList = new ArrayList<>();
                for (MemDisplaySlideWidget memDisplaySlideWidget : memDisplaySlideWidgetList) {
                    MemDisplaySlideWidgetDto memDisplaySlideWidgetDto = Arrays.stream(memDisplaySlideWidgets).filter(
                            (item -> (item.getDisplaySlideId().longValue() == memDisplaySlideWidget.getDisplaySlideId().longValue()))
                    ).findFirst().get();

                    if (!CollectionUtils.isEmpty(memDisplaySlideWidgetDto.getRoleIds())) {
                        List<Role> roles = roleMapper.getRolesByIds(memDisplaySlideWidgetDto.getRoleIds());
                        relRoleDisplaySlideWidgetList.addAll(roles.stream()
                                .map(r -> new RelRoleDisplaySlideWidget(r.getId(), memDisplaySlideWidget.getId()).createdBy(user.getId())).collect(Collectors.toList()));
                    }
                }

                if (!CollectionUtils.isEmpty(relRoleDisplaySlideWidgetList)) {
                    relRoleDisplaySlideWidgetMapper.insertBatch(relRoleDisplaySlideWidgetList);
                    optLogger.info("RoleDisplaySlideWidgets ({}) batch insert by (:{})", relRoleDisplaySlideWidgetList.toString(), user.getId());
                }
            }

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

        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(slideWithDisplayAndProject.getDisplayId());
        List<Long> disableSlides = getDisableVizs(user.getId(), slideWithDisplayAndProject.getDisplayId(), null, VizEnum.SLIDE);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(memDisplaySlideWidget.getDisplaySlideId())))) {
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
        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(slideWithDisplayAndProject.getDisplayId());
        List<Long> disableSlides = getDisableVizs(user.getId(), slideWithDisplayAndProject.getDisplayId(), null, VizEnum.SLIDE);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideWidget.getDisplaySlideId())))) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        //delete rel_role_display_slide_widget
        relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetId(relationId);

        int i = memDisplaySlideWidgetMapper.deleteById(relationId);
        if (i > 0) {
            optLogger.info("MemDisplaySlideWdget ({}) is delete by (:{})", slideWidget.toString(), user.getId());
            return true;
        } else {
            throw new ServerException("unknown fail");
        }
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
        List<Long> disableDisplays = getDisableVizs(user.getId(), projectDetail.getId(), null, VizEnum.DISPLAY);
        boolean isDisable = disableDisplays.contains(displayId);

        boolean hidden = projectPermission.getVizPermission() < UserPermissionEnum.READ.getPermission();
        boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() && !display.getPublish();

        if (hidden || (!projectPermission.isProjectMaintainer() && isDisable) || noPublish) {
            return null;
        }

        List<DisplaySlide> displaySlides = displaySlideMapper.selectByDisplayId(displayId);
        if (CollectionUtils.isEmpty(displaySlides)) {
            return null;
        }

        List<Long> allSlides = displaySlides.stream().map(DisplaySlide::getId).collect(Collectors.toList());

        List<Long> disableList = getDisableVizs(user.getId(), display.getId(), allSlides, VizEnum.SLIDE);

        Iterator<DisplaySlide> iterator = displaySlides.iterator();
        while (iterator.hasNext()) {
            DisplaySlide displaySlide = iterator.next();
            if (!projectPermission.isProjectMaintainer() && disableList.contains(displaySlide.getId())) {
                iterator.remove();
            }
        }

        List<DisplaySlideInfo> displaySlideInfos = displaySlides.stream().map(slide -> {
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
    public SlideWithMem getDisplaySlideMem(Long displayId, Long slideId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

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

        if (CollectionUtils.isEmpty(widgetList)) {
            return null;
        }

        List<Long> disableList = getDisableVizs(user.getId(), display.getId(), null, VizEnum.SLIDE);
        List<Long> disableMemDisplaySlideWidgets = relRoleDisplaySlideWidgetMapper.getDisableByUser(user.getId());

        Iterator<MemDisplaySlideWidget> iterator = widgetList.iterator();

        while (iterator.hasNext()) {
            MemDisplaySlideWidget memDisplaySlideWidget = iterator.next();
            if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() &&
                    (disableList.contains(memDisplaySlideWidget.getDisplaySlideId()) || disableMemDisplaySlideWidgets.contains(memDisplaySlideWidget.getId()))) {
                iterator.remove();
            }
        }

        Set<Long> widgetIds = widgetList.stream().map(MemDisplaySlideWidget::getWidgetId).collect(Collectors.toSet());
        Set<View> views = new HashSet<>();
        if (!CollectionUtils.isEmpty(widgetIds)) {
            views = viewMapper.selectByWidgetIds(widgetIds);
        }

        SlideWithMem slideWithMem = new SlideWithMem();
        BeanUtils.copyProperties(displaySlide, slideWithMem);
        slideWithMem.setWidgets(widgetList);
        slideWithMem.setViews(views);

        return slideWithMem;
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

        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);

        boolean disable = disableDisplays.contains(displayId);
        List<Long> disableSlides = getDisableVizs(user.getId(), slideWithDisplayAndProject.getDisplayId(), null, VizEnum.SLIDE);

        if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideId)))) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        if (memIds.length > 0) {
            List<Long> idList = new ArrayList<>(Arrays.asList(memIds));

            Set<Long> idSet = new HashSet<>(idList);
            relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetIds(idSet);

            memDisplaySlideWidgetMapper.deleteBatchById(idList);
        }
        return true;
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
        List<Long> disableDisplays = getDisableVizs(user.getId(), display.getProjectId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(display.getId());
        List<Long> disableSlides = getDisableVizs(user.getId(), slideWithDipaly.getDisplayId(), null, VizEnum.SLIDE);
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideId)))) {
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
        List<Long> disableDisplays = getDisableVizs(user.getId(), slideWithDisplayAndProject.getProject().getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(slideWithDisplayAndProject.getDisplayId());
        List<Long> disableSlides = getDisableVizs(user.getId(), slideWithDisplayAndProject.getDisplayId(), null, VizEnum.SLIDE);
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
                || (!projectPermission.isProjectMaintainer() && (disable || disableSlides.contains(slideWithDisplayAndProject.getId())))) {
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
    public List<Long> getSlideExecludeRoles(Long id) {
        return relRoleSlideMapper.getById(id);
    }

    @Override
    @Transactional
    public boolean postSlideVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        SlideWithDisplayAndProject slide = displaySlideMapper.getSlideWithDipalyAndProjectById(vizVisibility.getId());
        if (null == slide) {
            throw new NotFoundException("display slide is not found");
        }

        projectService.getProjectDetail(slide.getProject().getId(), user, true);

        if (vizVisibility.isVisible()) {
            int delete = relRoleSlideMapper.delete(slide.getId(), role.getId());
            if (delete > 0) {
                optLogger.info("display slide ({}) can be accessed by role ({}), update by (:{})", (DisplaySlide) slide, role, user.getId());
            }
        } else {
            RelRoleSlide relRoleSlide = new RelRoleSlide(slide.getId(), role.getId());
            relRoleSlideMapper.insert(relRoleSlide);
            optLogger.info("display slide ({}) limit role ({}) access, create by (:{})", (DisplaySlide) slide, role, user.getId());
        }

        return true;
    }

    @Override
    @Transactional
    public boolean copySlides(Long originDisplayId, Long displayId, User user) {
        //  copy slide entity
        List<DisplaySlide> originSlides = displaySlideMapper.selectByDisplayId(originDisplayId);
        if (CollectionUtils.isEmpty(originSlides)) {
            return true;
        }

        List<RelModelCopy> slideCopies = new ArrayList<>();
        originSlides.forEach(originDisplay -> {
            DisplaySlide slide = new DisplaySlide();
            BeanUtils.copyProperties(originDisplay, slide, "id");
            slide.setDisplayId(displayId);
            slide.createdBy(user.getId());
            int insert = displaySlideMapper.insert(slide);
            if (insert > 0) {
                optLogger.info("Slide ({}) is copied from ({}) by user(:{})", slide.toString(), originDisplay.toString(), user.getId());
                slideCopies.add(new RelModelCopy(originDisplay.getId(), slide.getId()));
            }
        });

        //  copy relRoleSlide
        if (!slideCopies.isEmpty()) {
            int i = relRoleSlideMapper.copyRoleSlideRelation(slideCopies, user.getId());
            if (i > 0) {
                optLogger.info("display (:{}) slides role is copied by user (:{}) from (:{})", displayId, user.getId(), originDisplayId);
            }
        }

        //  copy memDisplaySlideWidget
        List<MemDisplaySlideWidgetWithSlide> memWithSlideWidgetList = memDisplaySlideWidgetMapper.getMemWithSlideByDisplayId(originDisplayId);
        if (CollectionUtils.isEmpty(memWithSlideWidgetList)) {
            return true;
        }

        List<RelModelCopy> memCopies = new ArrayList<>();
        Map<Long, Long> slideCopyIdMap = new HashMap<>();
        slideCopies.forEach(copy -> slideCopyIdMap.put(copy.getOriginId(), copy.getCopyId()));
        memWithSlideWidgetList.forEach(originMem -> {
            MemDisplaySlideWidget mem = new MemDisplaySlideWidget();
            BeanUtils.copyProperties(originMem, mem, "id");
            mem.setDisplaySlideId(slideCopyIdMap.get(originMem.getDisplaySlideId()));
            mem.createdBy(user.getId());
            int insert = memDisplaySlideWidgetMapper.insert(mem);
            if (insert > 0) {
                optLogger.info("MemDisplaySlideWidget ({}) is copied from ({}) by user(:{})", mem.toString(), originMem.toString(), user.getId());
                memCopies.add(new RelModelCopy(originMem.getId(), mem.getId()));
            }
        });

        //  copy relRoleDisplaySlideWidget
        if (!memCopies.isEmpty()) {
            int i = relRoleDisplaySlideWidgetMapper.copyRoleSlideWidgetRelation(memCopies, user.getId());
            if (i > 0) {
                optLogger.info("display (:{}) relRoleDisplaySlideWidgetMapper is copied by user (:{}) from (:{})", displayId, user.getId(), originDisplayId);
            }
        }
        return true;
    }
}
