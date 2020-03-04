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

package edp.davinci.server.service.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Display;
import edp.davinci.core.dao.entity.DisplaySlide;
import edp.davinci.core.dao.entity.MemDisplaySlideWidget;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.MemDisplaySlideWidgetExtendMapper;
import edp.davinci.server.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.server.dao.ViewMapper;
import edp.davinci.server.dao.WidgetMapper;
import edp.davinci.server.dto.display.DisplaySlideCreate;
import edp.davinci.server.dto.display.DisplaySlideInfo;
import edp.davinci.server.dto.display.DisplayWithSlides;
import edp.davinci.server.dto.display.MemDisplaySlideWidgetCreate;
import edp.davinci.server.dto.display.MemDisplaySlideWidgetDTO;
import edp.davinci.server.dto.display.MemDisplaySlideWidgetWithSlide;
import edp.davinci.server.dto.display.SlideWithDisplayAndProject;
import edp.davinci.server.dto.display.SlideWithMem;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.rel.RelModelCopy;
import edp.davinci.server.dto.role.VizVisibility;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.enums.VizEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.RelRoleDisplaySlideWidget;
import edp.davinci.server.model.RelRoleSlide;
import edp.davinci.server.model.Role;
import edp.davinci.server.model.User;
import edp.davinci.server.model.View;
import edp.davinci.server.model.Widget;
import edp.davinci.server.service.DisplaySlideService;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.FileUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("displaySlideService")
public class DisplaySlideServiceImpl extends VizCommonService implements DisplaySlideService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private MemDisplaySlideWidgetExtendMapper memDisplaySlideWidgetExtendMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private RelRoleDisplaySlideWidgetMapper relRoleDisplaySlideWidgetMapper;
    
    private static final  CheckEntityEnum entity = CheckEntityEnum.DISPLAYSLIDE;

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

    	Long displayId = displaySlideCreate.getDisplayId();
        Display display = getDisplay(displayId);

        Long projectId = display.getProjectId();
        checkWritePermission(entity, projectId, user, "create");
        
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisableDisplay(displayId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "create");
		}

        DisplaySlide displaySlide = new DisplaySlide();
        displaySlide.setCreateBy(user.getId());
        displaySlide.setCreateTime(new Date());
        BeanUtils.copyProperties(displaySlideCreate, displaySlide);

        if (displaySlideExtendMapper.insert(displaySlide) <= 0) {
            throw new ServerException("Create display slide fail");
        }

        optLogger.info("DisplaySlide({}) create by user({})", displaySlide.getId(), user.getId());

		if (!CollectionUtils.isEmpty(displaySlideCreate.getRoleIds())) {
			List<Role> roles = roleMapper.getRolesByIds(displaySlideCreate.getRoleIds());
			List<RelRoleSlide> list = roles.stream()
					.map(r -> new RelRoleSlide(displaySlide.getId(), r.getId()).createdBy(user.getId()))
					.collect(Collectors.toList());
			if (!CollectionUtils.isEmpty(list)) {
				relRoleSlideMapper.insertBatch(list);
				optLogger.info("DisplaySlide({}) limit role({}) access", displaySlide.getId(),
						roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
			}
		}

        return displaySlide;
    }
    
	private Display getDisplay(Long id) {
		Display display = displayExtendMapper.selectByPrimaryKey(id);
		if (null == display) {
			log.info("Display({}) is not found", id);
			throw new NotFoundException("Display is not found");
		}
		return display;
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

		DisplaySlide displaySlide = displaySlideExtendMapper.selectByPrimaryKey(slideId);
		if (null == displaySlide) {
			log.info("DisplaySlide({}) is not found", slideId);
			return false;
		}

		Display display = getDisplay(displaySlide.getDisplayId());

		Long projectId = display.getProjectId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisableDisplay(display.getId(), projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete");
		}

		relRoleDisplaySlideWidgetMapper.deleteBySlideId(slideId);
		memDisplaySlideWidgetExtendMapper.deleteBySlideId(slideId);
		relRoleSlideMapper.deleteBySlideId(slideId);
		displaySlideExtendMapper.deleteByPrimaryKey(slideId);
		
		optLogger.info("DisplaySlide({}) is delete by user({})", displaySlide.getId(), user.getId());
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

    	Display display = getDisplay(displayId);
        
    	Long projectId = display.getProjectId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisableDisplay(display.getId(), projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete");
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

	        displaySlide.setUpdateBy(user.getId());
	        displaySlide.setUpdateTime(new Date());
			displaySlideList.add(displaySlide);
		}

		displaySlideExtendMapper.updateBatch(displaySlideList);
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

        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("Invalid display slide");
        }

        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        checkWritePermission(entity, projectId, user, "add widgets");

		if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(slideId, displayId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "add widgets");
		}

		Set<Long> ids = new HashSet<>();
		List<MemDisplaySlideWidget> list = new ArrayList<>();
		List<MemDisplaySlideWidget> clist = new ArrayList<>();
		for (MemDisplaySlideWidgetCreate slideWidgetCreate : slideWidgetCreates) {
			ids.add(slideWidgetCreate.getWidgetId());
			MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget();
			memDisplaySlideWidget.setCreateBy(user.getId());
			memDisplaySlideWidget.setCreateTime(new Date());
			BeanUtils.copyProperties(slideWidgetCreate, memDisplaySlideWidget);
			list.add(memDisplaySlideWidget);
			// 自定义主键，copy一份修改内容作为返回值
			if (null != slideWidgetCreate.getId() && slideWidgetCreate.getId().longValue() > 0L) {
				MemDisplaySlideWidget cMemDisplaySlideWidget = new MemDisplaySlideWidget();
				cMemDisplaySlideWidget.setCreateBy(user.getId());
				cMemDisplaySlideWidget.setCreateTime(new Date());
				BeanUtils.copyProperties(slideWidgetCreate, cMemDisplaySlideWidget);
				clist.add(cMemDisplaySlideWidget);
			}
		}

		List<Widget> widgets = widgetMapper.getByIds(ids);
		if (null == widgets || widgets.size() != ids.size()) {
			throw new ServerException("Invalid widget id");
		}

		if (memDisplaySlideWidgetExtendMapper.insertBatch(list) <= 0) {
			log.error("Insert batch MemDisplaySlideWidget error displayId:{}, slideId:{}", displayId, slideId);
			throw new ServerException("Add memDisplaySlideWidgets fail");
		}
		
		List<RelRoleDisplaySlideWidget> relRoleDisplaySlideWidgetList = new ArrayList<>();
		for (MemDisplaySlideWidget memDisplaySlideWidget : list) {
			MemDisplaySlideWidgetCreate memDisplaySlideWidgetCreate = Arrays
					.stream(slideWidgetCreates).filter((item -> (item.getDisplaySlideId()
							.longValue() == memDisplaySlideWidget.getDisplaySlideId().longValue())))
					.findFirst().get();

			if (!CollectionUtils.isEmpty(memDisplaySlideWidgetCreate.getRoleIds())) {
				List<Role> roles = roleMapper.getRolesByIds(memDisplaySlideWidgetCreate.getRoleIds());
				relRoleDisplaySlideWidgetList.addAll(roles.stream()
						.map(r -> new RelRoleDisplaySlideWidget(r.getId(), memDisplaySlideWidget.getId())
								.createdBy(user.getId()))
						.collect(Collectors.toList()));
			}
		}

		if (!CollectionUtils.isEmpty(relRoleDisplaySlideWidgetList)) {
			relRoleDisplaySlideWidgetMapper.insertBatch(relRoleDisplaySlideWidgetList);
			optLogger.info("RoleDisplaySlideWidgets({}) batch insert by user({})",
					relRoleDisplaySlideWidgetList.toString(), user.getId());
		}

		if (null != clist && clist.size() > 1) {
			optLogger.info("Insert batch MemDisplaySlideWidget({}) by user({})", clist.stream().map(m -> m.getId()).collect(Collectors.toList()), user.getId());
			// 自定义主键
			return clist;
		} else {
			optLogger.info("Insert batch MemDisplaySlideWidget({}) by user({})", list.stream().map(m -> m.getId()).collect(Collectors.toList()), user.getId());
			// 自增主键
			return list;
		}
    }
    
    private SlideWithDisplayAndProject getSlideWithDisplayAndProject(Long slideId) {

    	SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideExtendMapper.getSlideWithDispalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("Display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            throw new ServerException("Display is not found");
        }
        
        return slideWithDisplayAndProject;
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
    public boolean updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetDTO[] memDisplaySlideWidgets, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

    	SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("Invalid display slide");
        }

        List<MemDisplaySlideWidgetDTO> dtoList = Arrays.asList(memDisplaySlideWidgets);
        Set<Long> widgetIds = dtoList.stream().map(MemDisplaySlideWidgetDTO::getWidgetId).collect(Collectors.toSet());

        List<Widget> widgets = widgetMapper.getByIds(widgetIds);
        if (null == widgets) {
            throw new ServerException("Invalid widget id");
        }

        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        
		if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(slideId, displayId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "update widgets");
		}

		List<MemDisplaySlideWidget> memDisplaySlideWidgetList = new ArrayList<>(dtoList.size());
		Map<Long, List<Long>> rolesMap = new HashMap<>();
		dtoList.forEach(m -> {
			m.setUpdateBy(user.getId());
			m.setUpdateTime(new Date());
			memDisplaySlideWidgetList.add(m);
			rolesMap.put(m.getId(), m.getRoleIds());
		});

        if (memDisplaySlideWidgetExtendMapper.updateBatch(memDisplaySlideWidgetList) <= 0) {
            log.error("Update batch MemDisplaySlideWidget error displayId:{}, slideId:{}", displayId, slideId);
			throw new ServerException("updateMemDisplaySlideWidgets fail");
        }
        
		if (!CollectionUtils.isEmpty(rolesMap)) {
			Set<Long> memDisplaySlideWidgetIds = rolesMap.keySet();
			relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetIds(memDisplaySlideWidgetIds);

			List<RelRoleDisplaySlideWidget> relRoleDisplaySlideWidgetList = new ArrayList<>();
			for (MemDisplaySlideWidget memDisplaySlideWidget : memDisplaySlideWidgetList) {
				MemDisplaySlideWidgetDTO memDisplaySlideWidgetDto = Arrays
						.stream(memDisplaySlideWidgets).filter((item -> (item.getDisplaySlideId()
								.longValue() == memDisplaySlideWidget.getDisplaySlideId().longValue())))
						.findFirst().get();

				if (!CollectionUtils.isEmpty(memDisplaySlideWidgetDto.getRoleIds())) {
					List<Role> roles = roleMapper.getRolesByIds(memDisplaySlideWidgetDto.getRoleIds());
					relRoleDisplaySlideWidgetList.addAll(roles.stream()
							.map(r -> new RelRoleDisplaySlideWidget(r.getId(), memDisplaySlideWidget.getId())
									.createdBy(user.getId()))
							.collect(Collectors.toList()));
				}
			}

			if (!CollectionUtils.isEmpty(relRoleDisplaySlideWidgetList)) {
				relRoleDisplaySlideWidgetMapper.insertBatch(relRoleDisplaySlideWidgetList);
				optLogger.info("RoleDisplaySlideWidgets({}) batch insert by user({})",
						relRoleDisplaySlideWidgetList.toString(), user.getId());
			}
		}

        return true;
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

    	Long slideId = memDisplaySlideWidget.getDisplaySlideId();
    	SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        MemDisplaySlideWidget slideWidget = getMemDisplaySlideWidget(memDisplaySlideWidget.getId());

        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        checkWritePermission(entity, projectId, user, "update widget");
        
        Long displayId = slideWithDisplayAndProject.getDisplayId();
        if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(slideId, displayId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "update widget");
        }

        String origin = slideWidget.toString();
        slideWidget.setUpdateBy(user.getId());
        slideWidget.setUpdateTime(new Date());
        BeanUtils.copyProperties(memDisplaySlideWidget, slideWidget);

        if (memDisplaySlideWidgetExtendMapper.update(slideWidget) <= 0) {
			log.error("Update MemDisplaySlideWidget error slideId:{}", slideId);
            throw new ServerException("UpdateMemDisplaySlideWidget fail");
        }
        
        optLogger.info("MemDisplaySlideWidget({}) is update by user({}), origin:{}", slideWidget.getId(), user.getId(), origin);
        return true;
    }
    
    private MemDisplaySlideWidget getMemDisplaySlideWidget(Long id) {
        MemDisplaySlideWidget widget = memDisplaySlideWidgetExtendMapper.selectByPrimaryKey(id);
        if (null == widget) {
            throw new ServerException("Display slide widget is not found");
        }
        return widget;
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

        MemDisplaySlideWidget slideWidget = getMemDisplaySlideWidget(relationId);

        Long slideId = slideWidget.getDisplaySlideId();
        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        
        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        checkWritePermission(entity, projectId, user, "delete widget");
        
        Long displayId = slideWithDisplayAndProject.getDisplayId();
        if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(slideId, displayId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "delete widget");
        }
        
        if (memDisplaySlideWidgetExtendMapper.deleteByPrimaryKey(relationId) <= 0) {
        	log.error("Delete memDisplaySlideWidget error slideId:{}", slideId);
            throw new ServerException("Delete memDisplaySlideWidget fail");
        }

        relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetId(relationId);
        optLogger.info("MemDisplaySlideWdget({}) is delete by user({})", slideWidget.getId(), user.getId());
        return true;
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
        Display display = getDisplay(displayId);

        Long projectId = display.getProjectId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        
		if (!checkReadPermission(entity, projectId, user)) {
			return null;
		}

        boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission() && !display.getPublish();
        if (isDisableDisplay(displayId, projectId, user, projectPermission) || noPublish) {
            return null;
        }

        List<DisplaySlide> displaySlides = displaySlideExtendMapper.selectByDisplayId(displayId);
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

		Display display = getDisplay(displayId);

		Long projectId = display.getProjectId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
				&& !display.getPublish();
		if (noPublish || !checkReadPermission(entity, projectId, user)) {
			log.info("User({}) have not permission to view widgets in this display slide", user.getId());
			throw new UnAuthorizedExecption("you have not permission to view widgets in this display slide");
		}

		DisplaySlide displaySlide = displaySlideExtendMapper.selectByPrimaryKey(slideId);

		if (null == displaySlide || !displaySlide.getDisplayId().equals(displayId)) {
			log.info("DisplaySlide not found displayId:{}", displayId);
			throw new ServerException("Display slide is not found");
		}

		List<MemDisplaySlideWidget> memSlideWidgets = memDisplaySlideWidgetExtendMapper.getMemDisplaySlideWidgetListBySlideId(slideId);
		
		if (CollectionUtils.isEmpty(memSlideWidgets)) {
			return null;
		}

		List<Long> disableList = getDisableVizs(user.getId(), display.getId(), null, VizEnum.SLIDE);
		List<Long> disableMemDisplaySlideWidgets = relRoleDisplaySlideWidgetMapper.getDisableByUser(user.getId());
		Iterator<MemDisplaySlideWidget> iterator = memSlideWidgets.iterator();
        while (iterator.hasNext()) {
            MemDisplaySlideWidget memDisplaySlideWidget = iterator.next();
            if (projectPermission.getVizPermission() == UserPermissionEnum.READ.getPermission() &&
                    (disableList.contains(memDisplaySlideWidget.getDisplaySlideId()) || disableMemDisplaySlideWidgets.contains(memDisplaySlideWidget.getId()))) {
                iterator.remove();
            }
        }
        
        Set<Long> widgetIds = memSlideWidgets.stream().map(MemDisplaySlideWidget::getWidgetId).collect(Collectors.toSet());
        Set<View> views = new HashSet<>();
        List<Widget> widgets = null;
        if (!CollectionUtils.isEmpty(widgetIds)) {
            widgets = widgetMapper.getByIds(widgetIds);
            views = viewMapper.selectByWidgetIds(widgetIds);
        }

        SlideWithMem slideWithMem = new SlideWithMem();
        BeanUtils.copyProperties(displaySlide, slideWithMem);
        slideWithMem.setItems(memSlideWidgets);
        slideWithMem.setViews(views);
        slideWithMem.setWidgets(widgets);

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

        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!displayId.equals(slideWithDisplayAndProject.getDisplay().getId())) {
            throw new ServerException("Invalid display id");
        }

        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        
		if (projectPermission.getVizPermission() < UserPermissionEnum.DELETE.getPermission() || isDisableDisplay(displayId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete widgets");
		}

        if (memIds.length > 0) {
            List<Long> idList = new ArrayList<>(Arrays.asList(memIds));
            Set<Long> idSet = new HashSet<>(idList);
            relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetIds(idSet);
            memDisplaySlideWidgetExtendMapper.deleteBatchById(idList);
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
        
    	SlideWithDisplayAndProject slideWithDispaly = getSlideWithDisplayAndProject(slideId);
        Display display = slideWithDispaly.getDisplay();

        Long projectId = display.getProjectId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        
        checkWritePermission(entity, projectId, user, "upload BGImage");
        
       if (isDisableDisplay(display.getId(), projectId, user, projectPermission)) {
    	   alertUnAuthorized(entity, user, "upload BGImage");
       }

        //校验文件是否图片
        if (!fileUtils.isImage(file)) {
            throw new ServerException("File format error");
        }

		// 上传文件
		String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
		String background = null;
		Map<String, Object> jsonMap = null;
		try {
			background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
			if (StringUtils.isEmpty(background)) {
				throw new ServerException("Display slide background upload error");
			}

			if (!StringUtils.isEmpty(slideWithDispaly.getConfig())) {
				jsonMap = JSONUtils.toObject(slideWithDispaly.getConfig(), Map.class);
				if (null == jsonMap) {
					jsonMap = new HashMap<>();
				}
				Map<String, Object> slideParams = (Map)jsonMap.get("slideParams");
				if (null != slideParams) {
					// 删除原数据
					if (!StringUtils.isEmpty((String)slideParams.get("backgroundImage"))) {
						File bgFile = new File((String)slideParams.get("backgroundImage"));
						if (null != bgFile && bgFile.exists() && bgFile.isFile() && fileUtils.isImage(bgFile)) {
							bgFile.delete();
						}
					}
				}
				slideParams.put("backgroundImage", background);
				jsonMap.put("slideParams", slideParams);
			} else {
				jsonMap = new HashMap<>();
				Map<String, Object> slideParams = new HashMap<>();
				slideParams.put("backgroundImage", background);
				jsonMap.put("slideParams", slideParams);
			}
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new ServerException("Display slide background upload error");
		}

		DisplaySlide displaySlide = new DisplaySlide();
		BeanUtils.copyProperties(slideWithDispaly, displaySlide);

		displaySlide.setUpdateBy(user.getId());
		displaySlide.setUpdateTime(new Date());
		displaySlide.setConfig(JSONUtils.toString(jsonMap));
		displaySlideExtendMapper.update(displaySlide);
		optLogger.info("DisplaySlide({}) update by user({}), origin:{}", displaySlide.toString(), user.getId(),
				slideWithDispaly.toString());

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

    	MemDisplaySlideWidget memDisplaySlideWidget = getMemDisplaySlideWidget(relationId);

        if (2 != memDisplaySlideWidget.getType()) {
            throw new ServerException("Dispaly slide widget is not sub widget");
        }

        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(memDisplaySlideWidget.getDisplaySlideId());
        
        Long projectId = slideWithDisplayAndProject.getProject().getId();
        checkWritePermission(entity, projectId, user, "upload BGImage");
        
        Long displayId = slideWithDisplayAndProject.getDisplayId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(relationId, displayId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "upload BGImage");
        }

		// 上传文件
		String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
		String background = null;

		Map<String, Object> jsonMap = null;
		String key = "backgroundImage";
		try {
			background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
			if (StringUtils.isEmpty(background)) {
				throw new NotFoundException("Display slide sub widget backgroundImage upload error");
			}

			if (!StringUtils.isEmpty(memDisplaySlideWidget.getParams())) {
				jsonMap = JSONUtils.toObject(memDisplaySlideWidget.getParams(), Map.class);
				if (null != jsonMap) {
					if (jsonMap.containsKey(key)) {
						String backgroundImage = (String)jsonMap.get(key);
						if (!StringUtils.isEmpty(backgroundImage)) {
							fileUtils.remove(backgroundImage);
						}
					}
				} else {
					jsonMap = new HashMap<>();
				}
			} else {
				jsonMap = new HashMap<>();
			}
			jsonMap.put(key, background);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new ServerException("Display slide sub widget backgroundImage upload error");
		}

		String origin = memDisplaySlideWidget.toString();
		memDisplaySlideWidget.setParams(JSONUtils.toString(jsonMap));
		memDisplaySlideWidget.setUpdateBy(user.getId());
		memDisplaySlideWidget.setUpdateTime(new Date());
		memDisplaySlideWidgetExtendMapper.update(memDisplaySlideWidget);
		optLogger.info("MemDisplaySlideWidget({}) update by user({}), origin:{}", memDisplaySlideWidget.getId(),
				user.getId(), origin);

		return background;
    }

    @Override
    public List<Long> getSlideExecludeRoles(Long id) {
        return relRoleSlideMapper.getById(id);
    }

    @Override
    @Transactional
    public boolean postSlideVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		SlideWithDisplayAndProject slide = getSlideWithDisplayAndProject(vizVisibility.getId());

		if (vizVisibility.isVisible()) {
			if (relRoleSlideMapper.delete(slide.getId(), role.getId()) > 0) {
				optLogger.info("DisplaySlide({}) can be accessed by role({}), update by user({})",
						((DisplaySlide) slide).getId(), role.getId(), user.getId());
			}
		} else {
			RelRoleSlide relRoleSlide = new RelRoleSlide(slide.getId(), role.getId());
			relRoleSlideMapper.insert(relRoleSlide);
			optLogger.info("DisplaySlide({}) can be accessed by role({}), create by user({})",
					((DisplaySlide) slide).getId(), role.getId(), user.getId());
		}

		return true;
	}

	@Override
	@Transactional
	public boolean copySlides(Long originDisplayId, Long displayId, User user) {
		// copy slide entity
		List<DisplaySlide> originSlides = displaySlideExtendMapper.selectByDisplayId(originDisplayId);
		if (CollectionUtils.isEmpty(originSlides)) {
			return true;
		}

		List<RelModelCopy> slideCopies = new ArrayList<>();
		originSlides.forEach(originDisplay -> {
			DisplaySlide slide = new DisplaySlide();
			BeanUtils.copyProperties(originDisplay, slide, "id");
			slide.setDisplayId(displayId);
			slide.setCreateBy(user.getId());
			slide.setCreateTime(new Date());
			if (displaySlideExtendMapper.insert(slide) > 0) {
				optLogger.info("Slide({}) is copied from({}) by user({})", slide.toString(), originDisplay.getId(),
						user.getId());
				slideCopies.add(new RelModelCopy(originDisplay.getId(), slide.getId()));
			}
		});

		// copy relRoleSlide
		if (!slideCopies.isEmpty()) {
			if (relRoleSlideMapper.copyRoleSlideRelation(slideCopies, user.getId()) > 0) {
				optLogger.info("Display({}) slides role is copied from ({}) by user({})", displayId, originDisplayId,
						user.getId());
			}
		}

		// copy memDisplaySlideWidget
		List<MemDisplaySlideWidgetWithSlide> memWithSlideWidgetList = memDisplaySlideWidgetExtendMapper
				.getMemWithSlideByDisplayId(originDisplayId);
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
			mem.setCreateBy(user.getId());
			mem.setCreateTime(new Date());
			if (memDisplaySlideWidgetExtendMapper.insert(mem) > 0) {
				optLogger.info("MemDisplaySlideWidget({}) is copied from({}) by user({})", mem.toString(),
						originMem.getId(), user.getId());
				memCopies.add(new RelModelCopy(originMem.getId(), mem.getId()));
			}
		});

		// copy relRoleDisplaySlideWidget
		if (!memCopies.isEmpty()) {
			if (relRoleDisplaySlideWidgetMapper.copyRoleSlideWidgetRelation(memCopies, user.getId()) > 0) {
				optLogger.info("Display({}) relRoleDisplaySlideWidget is copied from({}) by user({})", displayId,
						originDisplayId, user.getId());
			}
		}
		return true;
    }
}
