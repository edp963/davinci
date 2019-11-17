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
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.VizEnum;
import edp.davinci.dao.MemDisplaySlideWidgetMapper;
import edp.davinci.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.dto.displayDto.DisplayInfo;
import edp.davinci.dto.displayDto.DisplayUpdate;
import edp.davinci.dto.displayDto.DisplayWithProject;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.model.Display;
import edp.davinci.model.RelRoleDisplay;
import edp.davinci.model.Role;
import edp.davinci.model.User;
import edp.davinci.service.DisplayService;
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
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.DEFAULT_COPY_SUFFIX;

@Slf4j
@Service("displayService")
public class DisplayServiceImpl extends VizCommonService implements DisplayService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ShareServiceImpl shareService;

    @Autowired
    private MemDisplaySlideWidgetMapper memDisplaySlideWidgetMapper;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private RelRoleDisplaySlideWidgetMapper relRoleDisplaySlideWidgetMapper;

    @Autowired
    private DisplaySlideService displaySlideService;

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

            if (!CollectionUtils.isEmpty(displayInfo.getRoleIds())) {
                List<Role> roles = roleMapper.getRolesByIds(displayInfo.getRoleIds());

                List<RelRoleDisplay> list = roles.stream()
                        .map(r -> new RelRoleDisplay(display.getId(), r.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());

                if (!CollectionUtils.isEmpty(list)) {
                    relRoleDisplayMapper.insertBatch(list);

                    optLogger.info("display ({}) limit role ({}) access", display.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
                }

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

        List<Long> disableDisplays = getDisableVizs(user.getId(), projectDetail.getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(id);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
            log.info("user {} have not permission to delete display", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to delete display");
        }

        //删除 rel_role_display_slide_widget
        relRoleDisplaySlideWidgetMapper.deleteByDisplayId(id);

        //删除 mem_display_slide_widget
        memDisplaySlideWidgetMapper.deleteByDisplayId(id);

        //删除 rel_role_slide
        relRoleSlideMapper.deleteByDisplayId(id);

        //删除 display_slide
        displaySlideMapper.deleteByDisplayId(id);

        //删除 rel_role_display
        relRoleDisplayMapper.deleteByDisplayId(id);

        //删除 display
        displayMapper.deleteById(id);

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

        List<Long> disableDisplays = getDisableVizs(user.getId(), projectDetail.getId(), null, VizEnum.DISPLAY);

        boolean disable = disableDisplays.contains(display.getId());


        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
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
            if (!CollectionUtils.isEmpty(displayUpdate.getRoleIds())) {
                List<Role> roles = roleMapper.getRolesByIds(displayUpdate.getRoleIds());

                List<RelRoleDisplay> list = roles.stream()
                        .map(r -> new RelRoleDisplay(display.getId(), r.getId()).createdBy(user.getId()))
                        .collect(Collectors.toList());
                if (!CollectionUtils.isEmpty(list)) {
                    relRoleDisplayMapper.insertBatch(list);
                    optLogger.info("update display ({}) limit role ({}) access", display.getId(), roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
                }
            }

            return true;
        } else {
            throw new ServerException("update display fail");
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
        if (CollectionUtils.isEmpty(displays)) {
            return null;
        }

        List<Long> allDisplays = displays.stream().map(Display::getId).collect(Collectors.toList());

        List<Long> disableList = getDisableVizs(user.getId(), projectId, allDisplays, VizEnum.DISPLAY);

        Iterator<Display> iterator = displays.iterator();
        while (iterator.hasNext()) {
            Display display = iterator.next();

            boolean disable = !projectPermission.isProjectMaintainer() && disableList.contains(display.getId());
            boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() && !display.getPublish();

            if (disable || noPublish) {
                iterator.remove();
            }
        }

        return displays;
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
        List<Long> disableDisplays = getDisableVizs(user.getId(), displayWithProject.getProjectId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(id);
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
            throw new UnAuthorizedExecption("you have not permission to share this display");
        }

        return shareService.generateShareToken(id, username, user.getId());
    }


    @Override
    public List<Long> getDisplayExcludeRoles(Long id) {
        return relRoleDisplayMapper.getById(id);
    }

    @Override
    @Transactional
    public boolean postDisplayVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        Display display = displayMapper.getById(vizVisibility.getId());
        if (null == display) {
            throw new NotFoundException("display is not found");
        }

        projectService.getProjectDetail(display.getProjectId(), user, true);

        if (vizVisibility.isVisible()) {
            int delete = relRoleDisplayMapper.delete(display.getId(), role.getId());
            if (delete > 0) {
                optLogger.info("display ({}) can be accessed by role ({}), update by (:{})", display, role, user.getId());
            }
        } else {
            RelRoleDisplay relRoleDisplay = new RelRoleDisplay(display.getId(), role.getId());
            relRoleDisplayMapper.insert(relRoleDisplay);
            optLogger.info("display ({}) limit role ({}) access, create by (:{})", display, role, user.getId());
        }

        return true;
    }

    /**
     * Copy a display
     *
     * @param id   displayId
     * @param user user
     * @return new display
     */
    @Override
    @Transactional
    public Display copyDisplay(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        DisplayWithProject originDisplay = displayMapper.getDisplayWithProjectById(id);

        if (null == originDisplay) {
            log.info("display (:{}) is not found", id);
            throw new NotFoundException("display is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(originDisplay.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        List<Long> disableDisplays = getDisableVizs(user.getId(), projectDetail.getId(), null, VizEnum.DISPLAY);
        boolean disable = disableDisplays.contains(id);

        //校验权限
        if (projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() || (!projectPermission.isProjectMaintainer() && disable)) {
            log.info("user {} have not permission to copy the display (:{})", user.getUsername(), id);
            throw new UnAuthorizedExecption("you have not permission to copy this display");
        }

        // copy display entity
        Display display = new Display();
        BeanUtils.copyProperties(originDisplay, display, "id");
        String name = originDisplay.getName() + DEFAULT_COPY_SUFFIX;
        if (isExist(name, null, originDisplay.getProjectId())) {
            Integer maxOrder = displayMapper.selectMaxNameOrderByName(name, originDisplay.getProjectId());
            if (maxOrder == null) {
                name = name + "2";
            } else {
                name += (maxOrder + 1);
            }
        }
        display.setName(name);
        display.createdBy(user.getId());
        int insert = displayMapper.insert(display);
        if (insert <= 0) {
            throw new ServerException("Copy display fail");
        }
        // copy relRoleDisplay
        optLogger.info("display ({}) is copied by user (:{}) from ({})", display.toString(), user.getId(), originDisplay.toString());
        int copy = relRoleDisplayMapper.copyRoleRelation(originDisplay.getId(), display.getId(), user.getId());
        if (copy > 0) {
            optLogger.info("display (:{}) role is copied by user (:{}) from (:{})", display.getId(), user.getId(), originDisplay.getId());
        }

        displaySlideService.copySlides(originDisplay.getId(), display.getId(), user);
        return display;
    }

    @Override
    @Transactional
    public void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException {
        //delete rel_role_display_slide_widget
        relRoleDisplaySlideWidgetMapper.deleteByProjectId(projectId);
        //删除slide与widget的关联
        memDisplaySlideWidgetMapper.deleteByProject(projectId);
        //删除rel_role_slide
        relRoleSlideMapper.deleteByProjectId(projectId);
        //删除slide
        displaySlideMapper.deleteByProjectId(projectId);
        //删除rel_role_display
        relRoleDisplayMapper.deleteByProjectId(projectId);
        //删除display
        displayMapper.deleteByProject(projectId);
    }
}
