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
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.utils.FileUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.*;
import edp.davinci.dto.projectDto.ProjectWithOrganization;
import edp.davinci.model.*;
import edp.davinci.service.DisplayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.*;

@Slf4j
@Service("displayService")
public class DisplayServiceImpl extends CommonService<Display> implements DisplayService {

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

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
    private TokenUtils tokenUtils;

    @Autowired
    private ExcludeDisplayTeamMapper excludeDisplayTeamMapper;

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
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createDisplay(DisplayInfo displayInfo, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        if (isExist(displayInfo.getName(), null, displayInfo.getProjectId())) {
            log.info("the display name {} is already taken", displayInfo.getName());
            return resultMap.failAndRefreshToken(request).message("the display name " + displayInfo.getName() + " is already taken");
        }

        Project project = projectMapper.getById(displayInfo.getProjectId());
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project is not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to create a display in this project");
        }

        Display display = new Display();
        BeanUtils.copyProperties(displayInfo, display);

        int insert = displayMapper.insert(display);
        if (insert > 0) {
            excludeTeamForDisplay(displayInfo.getTeamIds(), display.getId(), user.getId(), null);
            return resultMap.successAndRefreshToken(request).payload(display);
        } else {
            return resultMap.failAndRefreshToken(request).message("create display fail");
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
    @Override
    @Transactional
    public ResultMap deleteDisplay(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);
        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(id);

        if (null == displayWithProject) {
            return resultMap.failAndRefreshToken(request).message("display is not found");
        }

        //校验权限
        Project project = displayWithProject.getProject();
        if (!allowDelete(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to delete this display");
        }

        //删除display实体
        displayMapper.deleteById(id);

        excludeDisplayTeamMapper.deleteByDisplayId(id);

        //删除displaySlide
        displaySlideMapper.deleteByDisplayId(id);

        //删除displaySlide和widget的关联
        memDisplaySlideWidgetMapper.deleteByDisplayId(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除displaySlide
     *
     * @param slideId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteDisplaySlide(Long slideId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DisplaySlide displaySlide = displaySlideMapper.getById(slideId);
        if (null == displaySlide) {
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        Project project = projectMapper.getByDisplayId(displaySlide.getDisplayId());
        if (!allowDelete(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to delete this display slide");
        }

        //删除displaySlide实体
        displaySlideMapper.deleteById(slideId);

        //删除displaySlide和widget的关联
        memDisplaySlideWidgetMapper.deleteBySlideId(slideId);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 更新display信息
     *
     * @param displayUpdateDto
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateDisplay(DisplayUpdateDto displayUpdateDto, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(displayUpdateDto.getProjectId());
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project is not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to update the display in this project");
        }

        Display display = displayMapper.getById(displayUpdateDto.getId());

        if (!StringUtils.isEmpty(display.getAvatar()) && !display.getAvatar().startsWith(Constants.DISPLAY_AVATAR_PATH)) {
            return resultMap.failAndRefreshToken(request).message("Invalid cover image");
        }

        //删除原有封面图
        if (!StringUtils.isEmpty(display.getAvatar())) {
            Display initial = displayMapper.getById(display.getId());
            if (!StringUtils.isEmpty(initial.getAvatar()) && !display.getAvatar().equals(initial.getAvatar())) {
                File file = new File(initial.getAvatar());
                if (null != file && file.exists() && file.isFile() && fileUtils.isImage(file)) {
                    file.delete();
                }
            }
        }

        BeanUtils.copyProperties(displayUpdateDto, display);
        int update = displayMapper.update(display);
        if (update > 0) {
            List<Long> excludeTeams = excludeDisplayTeamMapper.selectExcludeTeamsByDisplayId(display.getId());
            excludeTeamForDisplay(displayUpdateDto.getTeamIds(), display.getId(), user.getId(), excludeTeams);
        }

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 新建diplaySlide
     *
     * @param displaySlideCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createDisplaySlide(DisplaySlideCreate displaySlideCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(displaySlideCreate.getDisplayId());
        if (null == displayWithProject) {
            return resultMap.failAndRefreshToken(request).message("display is not found");
        }

        //校验权限
        Project project = displayWithProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to create displaySlide this display");
        }

        DisplaySlide displaySlide = new DisplaySlide();
        BeanUtils.copyProperties(displaySlideCreate, displaySlide);

        int insert = displaySlideMapper.insert(displaySlide);
        if (insert > 0) {
            return resultMap.successAndRefreshToken(request).payload(displaySlide);
        } else {
            return resultMap.failAndRefreshToken(request).message("create display slide fail");
        }

    }

    /**
     * 更新displaySlides
     *
     * @param displayId
     * @param displaySlides
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateDisplaySildes(Long displayId, DisplaySlide[] displaySlides, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(displayId);
        if (null == displayWithProject) {
            return resultMap.failAndRefreshToken(request).message("display is not found");
        }

        //校验权限
        Project project = displayWithProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to update display slides in this display");
        }

        for (DisplaySlide displaySlide : displaySlides) {
            if (!displaySlide.getDisplayId().equals(displayId)) {
                return resultMap.failAndRefreshToken(request).message("Invalid display id");
            }
        }

        List<DisplaySlide> displaySlideList = new ArrayList<>(Arrays.asList(displaySlides));
        displaySlideMapper.updateBatch(displaySlideList);

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 在displaySlide下新建widget关联
     *
     * @param displayId
     * @param slideId
     * @param slideWidgetCreates
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap addMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetCreate[] slideWidgetCreates, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay() || !slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid display slide");
        }

        Set<Long> ids = new HashSet<>();
        List<MemDisplaySlideWidget> list = new ArrayList<>();
        List<MemDisplaySlideWidget> clist = new ArrayList<>();
        for (MemDisplaySlideWidgetCreate slideWidgetCreate : slideWidgetCreates) {
            ids.add(slideWidgetCreate.getWidgetId());
            MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget();
            BeanUtils.copyProperties(slideWidgetCreate, memDisplaySlideWidget);
            list.add(memDisplaySlideWidget);
            //自定义主键，copy 一份修改内容作为返回值
            if (null != slideWidgetCreate.getId() && slideWidgetCreate.getId().longValue() > 0L) {
                MemDisplaySlideWidget cMemDisplaySlideWidget = new MemDisplaySlideWidget();
                BeanUtils.copyProperties(slideWidgetCreate, cMemDisplaySlideWidget);
                clist.add(cMemDisplaySlideWidget);
            }
        }

        List<Widget> widgets = widgetMapper.getByIds(ids);
        if (null == widgets) {
            return resultMap.failAndRefreshToken(request).message("Invalid widget id");
        }

        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to do this operation");
        }


        int i = memDisplaySlideWidgetMapper.insertBatch(list);
        if (i > 0) {
            if (null != clist && clist.size() > 1) {
                //自定义主键
                return resultMap.successAndRefreshToken(request).payloads(clist);
            } else {
                //自增主键
                return resultMap.successAndRefreshToken(request).payloads(list);
            }
        } else {
            log.error("insert batch MemDisplaySlideWidget error");
            return resultMap.failAndRefreshToken(request).message("unkown fail");
        }
    }

    /**
     * 批量更新widget关联
     *
     * @param displayId
     * @param slideId
     * @param memDisplaySlideWidgets
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidget[] memDisplaySlideWidgets, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay() || !slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid display slide");
        }

        Set<Long> ids = new HashSet<>();
        for (MemDisplaySlideWidget slideWidget : memDisplaySlideWidgets) {
            ids.add(slideWidget.getWidgetId());
        }

        List<Widget> widgets = widgetMapper.getByIds(ids);
        if (null == widgets) {
            return resultMap.failAndRefreshToken(request).message("Invalid widget id");
        }


        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to do this operation");
        }


        ArrayList list = new ArrayList(Arrays.asList(memDisplaySlideWidgets));

        int i = memDisplaySlideWidgetMapper.updateBatch(list);
        if (i > 0) {
            return resultMap.successAndRefreshToken(request);
        } else {
            log.error("update batch MemDisplaySlideWidget error");
            return resultMap.failAndRefreshToken(request).message("unkown fail");
        }
    }

    /**
     * 修改displaySlide下的widget关联信息
     *
     * @param memDisplaySlideWidget
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateMemDisplaySlideWidget(MemDisplaySlideWidget memDisplaySlideWidget, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(memDisplaySlideWidget.getDisplaySlideId());

        if (null == slideWithDisplayAndProject) {
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            return resultMap.failAndRefreshToken(request).message("Invalid display slide");
        }

        MemDisplaySlideWidget slideWidget = memDisplaySlideWidgetMapper.getById(memDisplaySlideWidget.getId());
        if (null == slideWidget) {
            return resultMap.failAndRefreshToken(request).message("display slide widget is not found");
        }

        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to do this operation");
        }

        memDisplaySlideWidgetMapper.update(memDisplaySlideWidget);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除displaySlide下的widget关联信息
     *
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteMemDisplaySlideWidget(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        MemDisplaySlideWidget slideWidget = memDisplaySlideWidgetMapper.getById(relationId);
        if (null == slideWidget) {
            return resultMap.failAndRefreshToken(request).message("display slide widget is not found");
        }


        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideWidget.getDisplaySlideId());

        if (null == slideWithDisplayAndProject) {
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            return resultMap.failAndRefreshToken(request).message("Invalid display");
        }

        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowDelete(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to remove the widget in this display slide");
        }

        memDisplaySlideWidgetMapper.deleteById(relationId);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 根据项目获取当前用户可见Display列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDisplayListByProject(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(projectId);

        if (null == projectWithOrganization) {
            return resultMap.successAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(projectWithOrganization, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<Display> displays = displayMapper.getByProject(projectId, user.getId());

        if (null != displays && displays.size() > 0) {

            //获取当前用户在organization的role
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), projectWithOrganization.getOrgId());

            //当前用户是project的创建者和organization的owner，直接返回
            if (!isProjectAdmin(projectWithOrganization, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole < UserTeamRoleEnum.MAINTAINER.getRole()) {
                    Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectWithOrganization.getOrgId(), user.getId());
                    if (teamNumOfOrgByUser > 0) {
                        //查询当前用户在的 project所属team对project display的最高权限
                        short maxVizPermisson = relTeamProjectMapper.getMaxVizPermission(projectId, user.getId());
                        if (maxVizPermisson == UserPermissionEnum.HIDDEN.getPermission()) {
                            //隐藏
                            displays = null;
                        } else if (maxVizPermisson == UserPermissionEnum.READ.getPermission()) {
                            //只读, remove未发布的
                            Iterator<Display> iterator = displays.iterator();
                            while (iterator.hasNext()) {
                                Display display = iterator.next();
                                if (!display.getPublish()) {
                                    iterator.remove();
                                }
                            }
                        }
                    } else {
                        Organization organization = projectWithOrganization.getOrganization();
                        if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission()) {
                            displays = null;
                        } else {
                            Iterator<Display> iterator = displays.iterator();
                            while (iterator.hasNext()) {
                                Display display = iterator.next();
                                if (!display.getPublish()) {
                                    iterator.remove();
                                }
                            }
                        }
                    }
                }
            }
        }


        return resultMap.successAndRefreshToken(request).payloads(displays);
    }

    /**
     * 根据displayId 获取当前用户可见的displaySlide
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDisplaySlideList(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Display display = displayMapper.getById(id);
        if (null == display) {
            log.info("display (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("display is not found");
        }

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(display.getProjectId());

        //当前用户不是project创建者且display未发布
        if (null == projectWithOrganization && !display.getPublish()) {
            log.info("user (:{}) you have not permisson to view display slides", user.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to view display slides");
        }

        if (!allowRead(projectWithOrganization, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<DisplaySlide> displaySlides = displaySlideMapper.selectByDisplayId(id);

        List<DisplaySlideInfo> displaySlideInfos = new ArrayList<>();

        if (null != displaySlides && displaySlides.size() > 0) {

            RelUserOrganization orgRel = relUserOrganizationMapper.getRelByProject(user.getId(), display.getProjectId());

            //project的创建者 和 当前project的owner直接返回
            if (null == projectWithOrganization && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectWithOrganization.getOrgId(), user.getId());
                if (teamNumOfOrgByUser > 0) {
                    //验证team member权限
                    short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(display.getProjectId(), user.getId());
                    if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                        short maxVizPermisson = relTeamProjectMapper.getMaxVizPermission(display.getProjectId(), user.getId());
                        //用户所在team对display的最高权限是隐藏
                        if (maxVizPermisson == UserPermissionEnum.HIDDEN.getPermission()) {
                            log.info("user (:{}) have not permission to view display slides", user.getId());
                            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to view display slides");
                        }
                    }
                } else {
                    Organization organization = projectWithOrganization.getOrganization();
                    if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission()) {
                        log.info("user (:{}) have not permission to view display slides", user.getId());
                        return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to view display slides");
                    }
                }
            }
            for (DisplaySlide displaySlide : displaySlides) {
                DisplaySlideInfo displaySlideInfo = new DisplaySlideInfo();
                BeanUtils.copyProperties(displaySlide, displaySlideInfo);
                displaySlideInfos.add(displaySlideInfo);
            }
        }

        DisplayWithSlides displayWithSlides = new DisplayWithSlides();
        BeanUtils.copyProperties(display, displayWithSlides);
        displayWithSlides.setSlides(displaySlideInfos);

        return resultMap.successAndRefreshToken(request).payload(displayWithSlides);
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
    @Override
    public ResultMap getDisplaySlideWidgetList(Long displayId, Long slideId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Display display = displayMapper.getById(displayId);
        if (null == display) {
            log.info("display (:{}) not found", displayId);
            return resultMap.failAndRefreshToken(request).message("display is not found");
        }

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(display.getProjectId());

        //当前用户不是project创建者且display未发布
        if (null == projectWithOrganization && !display.getPublish()) {
            log.info("user (:{}) have not permission to view widgets in this display slide", user.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to view widgets in this display slide");
        }

        if (!allowRead(projectWithOrganization, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        DisplaySlide displaySlide = displaySlideMapper.getById(slideId);

        if (null == displaySlide || !displaySlide.getDisplayId().equals(displayId)) {
            log.info("display slide (:{}) not found", displayId);
            return resultMap.failAndRefreshToken(request).message("display slide is not found");
        }

        List<MemDisplaySlideWidget> widgetList = memDisplaySlideWidgetMapper.getMemDisplaySlideWidgetListBySlideId(slideId);

        RelUserOrganization orgRel = relUserOrganizationMapper.getRelByProject(user.getId(), display.getProjectId());
        //project创建者和当前project的owner直接返回
        if (null == projectWithOrganization && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectWithOrganization.getOrgId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                //验证team member权限
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(display.getProjectId(), user.getId());
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                    short maxVizPermission = relTeamProjectMapper.getMaxVizPermission(display.getProjectId(), user.getId());
                    //所在team 对 widget 拥有的最高全显示隐藏， 直接删除对应
                    if (maxVizPermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        log.info("user (:{}) have not permission to view widgets in this display slide", user.getId());
                        return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to view widgets in this display slide");
                    }
                }
            } else {
                Organization organization = projectWithOrganization.getOrganization();
                if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission()) {
                    log.info("user (:{}) have not permission to view widgets in this display slide", user.getId());
                    return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to view widgets in this display slide");
                }
            }

        }

        return resultMap.successAndRefreshToken(request).payloads(widgetList);
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
    @Override
    @Transactional
    public ResultMap deleteDisplaySlideWidgetList(Long displayId, Long slideId, Long[] memIds, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            return resultMap.failAndRefreshToken(request).message("display slide not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            return resultMap.failAndRefreshToken(request).message("Invalid display slide");
        }

        if (slideWithDisplayAndProject.getDisplay().getId() != displayId) {
            return resultMap.failAndRefreshToken(request).message("Invalid display id");
        }

        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowDelete(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to remove this widgets in this display slide");
        }

        if (memIds.length > 0) {
            List<Long> idList = new ArrayList<>(Arrays.asList(memIds));
            memDisplaySlideWidgetMapper.deleteBatchById(idList);
        }
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 上传display封面图
     *
     * @param file
     * @param request
     * @return
     */
    @Override
    public ResultMap uploadAvatar(MultipartFile file, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message("display cover picture upload error");
        }

        return resultMap.successAndRefreshToken(request).payload(avatar);
    }

    /**
     * 上传背景图
     *
     * @param slideId
     * @param file
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap uploadSlideBGImage(Long slideId, MultipartFile file, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SlideWithDisplayAndProject slideWithDipaly = displaySlideMapper.getSlideWithDipalyAndProjectById(slideId);

        if (null == slideWithDipaly) {
            return resultMap.failAndRefreshToken(request).message("dispaly slide is not found");
        }

        Display display = slideWithDipaly.getDisplay();
        if (null == display) {
            return resultMap.failAndRefreshToken(request).message("Invalid display slide");
        }

        //校验权限
        Project project = slideWithDipaly.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to change background image of this display");
        }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String background = null;

        JSONObject jsonObject = null;
        try {
            background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(background)) {
                return resultMap.failAndRefreshToken(request).message("display slide background upload error");
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
            return resultMap.failAndRefreshToken(request).message("display slide background upload error");
        }

        DisplaySlide displaySlide = new DisplaySlide();
        BeanUtils.copyProperties(slideWithDipaly, displaySlide);

        displaySlide.setConfig(jsonObject.toString());
        displaySlideMapper.update(displaySlide);

        return resultMap.successAndRefreshToken(request).payload(background);
    }


    /**
     * 上传辅助widget背景图
     *
     * @param relationId
     * @param file
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap uploadSlideSubWidgetBGImage(Long relationId, MultipartFile file, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        MemDisplaySlideWidget memDisplaySlideWidget = memDisplaySlideWidgetMapper.getById(relationId);

        if (null == memDisplaySlideWidget) {
            return resultMap.failAndRefreshToken(request).message("dispaly slide widget is not found");
        }

        if (2 != memDisplaySlideWidget.getType()) {
            return resultMap.failAndRefreshToken(request).message("dispaly slide widget is not sub widget");
        }

        SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDipalyAndProjectById(memDisplaySlideWidget.getDisplaySlideId());

        //校验权限
        Project project = slideWithDisplayAndProject.getProject();
        if (!allowWrite(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to change background image of this display");
        }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            return resultMap.failAndRefreshToken(request).message("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String background = null;

        JSONObject jsonObject = null;
        String key = "backgroundImage";
        try {
            background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
            if (StringUtils.isEmpty(background)) {
                return resultMap.failAndRefreshToken(request).message("display slide sub widget backgroundImage upload error");
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
            return resultMap.failAndRefreshToken(request).message("display slide sub widget backgroundImage upload error");
        }

        memDisplaySlideWidget.setParams(jsonObject.toString());
        memDisplaySlideWidgetMapper.update(memDisplaySlideWidget);

        return resultMap.successAndRefreshToken(request).payload(background);
    }

    @Override
    public ResultMap shareDisplay(Long id, User user, String username, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(id);

        if (null == displayWithProject) {
            log.info("display (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("display not found");
        }

        if (null == displayWithProject.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowShare(displayWithProject.getProject(), user)) {
            log.info("user {} have not permisson to share the display {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to share the display");
        }

        try {
            return resultMap.successAndRefreshToken(request).payload(shareService.generateShareToken(id, username, user.getId()));
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }


    @Override
    public List<Long> getDisplayExcludeTeams(Long id) {
        return excludeDisplayTeamMapper.selectExcludeTeamsByDisplayId(id);
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


    @Transactional
    protected void excludeTeamForDisplay(List<Long> teamIds, Long displayId, Long userId, List<Long> excludeTeams) {

        if (null != excludeTeams && excludeTeams.size() > 0) {
            if (null != teamIds && teamIds.size() > 0) {
                List<Long> rmTeamIds = new ArrayList<>();
                excludeTeams.forEach(teamId -> {
                    if (teamId.longValue() > 0L && !teamIds.contains(teamId)) {
                        rmTeamIds.add(teamId);
                    }
                });
                if (rmTeamIds.size() > 0) {
                    excludeDisplayTeamMapper.deleteByDisplayIdAndTeamIds(displayId, rmTeamIds);
                }
            } else {
                //删除所有要排除的项
                excludeDisplayTeamMapper.deleteByDisplayId(displayId);
            }
        }

        //添加排除项
        if (null != teamIds && teamIds.size() > 0) {
            List<ExcludeDisplayTeam> list = new ArrayList<>();
            teamIds.forEach(tid -> list.add(new ExcludeDisplayTeam(tid, displayId, userId)));
            if (list.size() > 0) {
                excludeDisplayTeamMapper.insertBatch(list);
            }
        }
    }
}
