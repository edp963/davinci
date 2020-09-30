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
import edp.core.exception.UnAuthorizedException;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.davinci.common.model.RelModelCopy;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.VizEnum;
import edp.davinci.dao.MemDisplaySlideWidgetMapper;
import edp.davinci.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dao.WidgetMapper;
import edp.davinci.dto.displayDto.*;
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
    public DisplaySlide createDisplaySlide(DisplaySlideCreate displaySlideCreate, User user) throws NotFoundException, UnAuthorizedException, ServerException {

    	Long displayId = displaySlideCreate.getDisplayId();
        Display display = getDisplay(displayId);

        Long projectId = display.getProjectId();
        checkWritePermission(entity, projectId, user, "create");

        ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisableDisplay(displayId, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "create");
		}

        DisplaySlide displaySlide = new DisplaySlide().createdBy(user.getId());
        BeanUtils.copyProperties(displaySlideCreate, displaySlide);

        if (displaySlideMapper.insert(displaySlide) <= 0) {
            throw new ServerException("create display slide fail");
        }

        optLogger.info("display slide ({}) create by (:{})", displaySlide.toString(), user.getId());

		if (!CollectionUtils.isEmpty(displaySlideCreate.getRoleIds())) {
			List<Role> roles = roleMapper.getRolesByIds(displaySlideCreate.getRoleIds());
			List<RelRoleSlide> list = roles.stream()
					.map(r -> new RelRoleSlide(displaySlide.getId(), r.getId()).createdBy(user.getId()))
					.collect(Collectors.toList());
			if (!CollectionUtils.isEmpty(list)) {
				relRoleSlideMapper.insertBatch(list);
				optLogger.info("display slide ({}) limit role ({}) access", displaySlide.getId(),
						roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
			}
		}

        return displaySlide;
    }

	private Display getDisplay(Long id) {
		Display display = displayMapper.getById(id);
		if (null == display) {
			log.info("display ({}) is not found", id);
			throw new NotFoundException("display is not found");
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
    public boolean deleteDisplaySlide(Long slideId, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		DisplaySlide displaySlide = displaySlideMapper.getById(slideId);
		if (null == displaySlide) {
			log.info("display slide is not found");
			return false;
		}

		Display display = getDisplay(displaySlide.getDisplayId());

		Long projectId = display.getProjectId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		if (isDisableDisplay(display.getId(), projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "delete");
		}

		relRoleDisplaySlideWidgetMapper.deleteBySlideId(slideId);
		memDisplaySlideWidgetMapper.deleteBySlideId(slideId);
		relRoleSlideMapper.deleteBySlideId(slideId);
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
    public boolean updateDisplaySildes(Long displayId, DisplaySlide[] displaySlides, User user) throws NotFoundException, UnAuthorizedException, ServerException {

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
				throw new UnAuthorizedException("Insufficient permissions");
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
    public List<MemDisplaySlideWidget> addMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetCreate[] slideWidgetCreates, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("invalid display slide");
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
			if (slideWidgetCreate.getWidgetId() != null && slideWidgetCreate.getWidgetId() > 0L) {
				ids.add(slideWidgetCreate.getWidgetId());
			}
			MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget().createdBy(user.getId());
			BeanUtils.copyProperties(slideWidgetCreate, memDisplaySlideWidget);
			list.add(memDisplaySlideWidget);
			// 自定义主键，copy一份修改内容作为返回值
			if (null != slideWidgetCreate.getId() && slideWidgetCreate.getId().longValue() > 0L) {
				MemDisplaySlideWidget cMemDisplaySlideWidget = new MemDisplaySlideWidget().createdBy(user.getId());
				BeanUtils.copyProperties(slideWidgetCreate, cMemDisplaySlideWidget);
				clist.add(cMemDisplaySlideWidget);
			}
		}

		List<Widget> widgets = widgetMapper.getByIds(ids);
		if (null == widgets || widgets.size() != ids.size()) {
			throw new ServerException("invalid widget id");
		}

		if (memDisplaySlideWidgetMapper.insertBatch(list) <= 0) {
			log.error("insert batch MemDisplaySlideWidget error displayId:{}, slideId:{}", displayId, slideId);
			throw new ServerException("addMemDisplaySlideWidgets fail");
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
			optLogger.info("RoleDisplaySlideWidgets ({}) batch insert by (:{})",
					relRoleDisplaySlideWidgetList.toString(), user.getId());
		}

		if (null != clist && clist.size() > 1) {
			optLogger.info("insert batch MemDisplaySlideWidget ({}) by (:{})", clist.toString(), user.getId());
			// 自定义主键
			return clist;
		} else {
			optLogger.info("insert batch MemDisplaySlideWidget ({}) by (:{})", list.toString(), user.getId());
			// 自增主键
			return list;
		}
    }

    private SlideWithDisplayAndProject getSlideWithDisplayAndProject(Long slideId) {

    	SlideWithDisplayAndProject slideWithDisplayAndProject = displaySlideMapper.getSlideWithDispalyAndProjectById(slideId);

        if (null == slideWithDisplayAndProject) {
            throw new NotFoundException("display slide is not found");
        }

        if (null == slideWithDisplayAndProject.getDisplay()) {
            throw new ServerException("display is not found");
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
    public boolean updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetDto[] memDisplaySlideWidgets, User user) throws NotFoundException, UnAuthorizedException, ServerException {

    	SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!slideWithDisplayAndProject.getDisplayId().equals(displayId)) {
            throw new ServerException("invalid display slide");
        }

        List<MemDisplaySlideWidgetDto> dtoList = Arrays.asList(memDisplaySlideWidgets);
        Set<Long> widgetIds = dtoList.stream().map(MemDisplaySlideWidgetDto::getWidgetId).collect(Collectors.toSet());

        List<Widget> widgets = widgetMapper.getByIds(widgetIds);
        if (null == widgets) {
            throw new ServerException("invalid widget id");
        }

        Long projectId = slideWithDisplayAndProject.getProject().getId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);

		if (isDisableDisplay(displayId, projectId, user, projectPermission) || isDisableDisplaySlide(slideId, displayId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "update widgets");
		}

		List<MemDisplaySlideWidget> memDisplaySlideWidgetList = new ArrayList<>(dtoList.size());
		Map<Long, List<Long>> rolesMap = new HashMap<>();
		dtoList.forEach(m -> {
			m.updatedBy(user.getId());
			memDisplaySlideWidgetList.add(m);
			rolesMap.put(m.getId(), m.getRoleIds());
		});

        if (memDisplaySlideWidgetMapper.updateBatch(memDisplaySlideWidgetList) <= 0) {
            log.error("update batch MemDisplaySlideWidget error displayId:{}, slideId:{}", displayId, slideId);
			throw new ServerException("updateMemDisplaySlideWidgets fail");
        }

		if (!CollectionUtils.isEmpty(rolesMap)) {
			Set<Long> memDisplaySlideWidgetIds = rolesMap.keySet();
			relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetIds(memDisplaySlideWidgetIds);

			List<RelRoleDisplaySlideWidget> relRoleDisplaySlideWidgetList = new ArrayList<>();
			for (MemDisplaySlideWidget memDisplaySlideWidget : memDisplaySlideWidgetList) {
				MemDisplaySlideWidgetDto memDisplaySlideWidgetDto = Arrays
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
				optLogger.info("RoleDisplaySlideWidgets ({}) batch insert by (:{})",
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
    public boolean updateMemDisplaySlideWidget(MemDisplaySlideWidget memDisplaySlideWidget, User user) throws NotFoundException, UnAuthorizedException, ServerException {

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
        slideWidget.updatedBy(user.getId());
        BeanUtils.copyProperties(memDisplaySlideWidget, slideWidget);

        if (memDisplaySlideWidgetMapper.update(slideWidget) <= 0) {
			log.error("update MemDisplaySlideWidget error slideId:{}", slideId);
            throw new ServerException("updateMemDisplaySlideWidget fail");
        }

        optLogger.info("MemDisplaySlideWidget ({}) is update by (:{}), origin:{}", slideWidget.toString(), user.getId(), origin);
        return true;
    }

    private MemDisplaySlideWidget getMemDisplaySlideWidget(Long id) {
        MemDisplaySlideWidget widget = memDisplaySlideWidgetMapper.getById(id);
        if (null == widget) {
            throw new ServerException("display slide widget is not found");
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
    public boolean deleteMemDisplaySlideWidget(Long relationId, User user) throws NotFoundException, UnAuthorizedException, ServerException {

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

		if (memDisplaySlideWidgetMapper.deleteById(relationId) <= 0) {
        	log.error("delete MemDisplaySlideWidget error slideId:{}", slideId);
            throw new ServerException("deleteMemDisplaySlideWidget fail");
        }

        relRoleDisplaySlideWidgetMapper.deleteByMemDisplaySlideWidgetId(relationId);
        optLogger.info("MemDisplaySlideWdget ({}) is delete by (:{})", slideWidget.toString(), user.getId());
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
    public DisplayWithSlides getDisplaySlideList(Long displayId, User user) throws NotFoundException, UnAuthorizedException, ServerException {
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
    public SlideWithMem getDisplaySlideMem(Long displayId, Long slideId, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		Display display = getDisplay(displayId);

		Long projectId = display.getProjectId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
				&& !display.getPublish();
		if (noPublish || !checkReadPermission(entity, projectId, user)) {
			log.info("user (:{}) have not permission to view widgets in this display slide", user.getId());
			throw new UnAuthorizedException("you have not permission to view widgets in this display slide");
		}

		DisplaySlide displaySlide = displaySlideMapper.getById(slideId);

		if (null == displaySlide || !displaySlide.getDisplayId().equals(displayId)) {
			log.info("display slide (:{}) not found", displayId);
			throw new ServerException("display slide is not found");
		}

        List<MemDisplaySlideWidget> memSlideWidgets = memDisplaySlideWidgetMapper.getMemDisplaySlideWidgetListBySlideId(slideId);

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
    public boolean deleteDisplaySlideWidgetList(Long displayId, Long slideId, Long[] memIds, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        SlideWithDisplayAndProject slideWithDisplayAndProject = getSlideWithDisplayAndProject(slideId);

        if (!displayId.equals(slideWithDisplayAndProject.getDisplay().getId())) {
            throw new ServerException("invalid display id");
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
    public String uploadSlideBGImage(Long slideId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedException, ServerException {

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
            throw new ServerException("file format error");
        }

		// 上传文件
		String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
		String background = null;
		JSONObject jsonObject = null;
		try {
			background = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
			if (StringUtils.isEmpty(background)) {
				throw new ServerException("display slide background upload error");
			}

			if (!StringUtils.isEmpty(slideWithDispaly.getConfig())) {
				jsonObject = JSONObject.parseObject(slideWithDispaly.getConfig());
				if (null == jsonObject) {
					jsonObject = new JSONObject();
				}
				JSONObject slideParams = jsonObject.getJSONObject("slideParams");
				if (null != slideParams) {
					// 删除原数据
					if (!StringUtils.isEmpty(slideParams.getString("backgroundImage"))) {
						File bgFile = new File(slideParams.getString("backgroundImage"));
						if (null != bgFile && bgFile.exists() && bgFile.isFile() && fileUtils.isImage(bgFile)) {
							bgFile.delete();
						}
					}
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
			log.error(e.getMessage(), e);
			throw new ServerException("display slide background upload error");
		}

		DisplaySlide displaySlide = new DisplaySlide();
		BeanUtils.copyProperties(slideWithDispaly, displaySlide);

		displaySlide.updatedBy(user.getId());
		displaySlide.setConfig(jsonObject.toString());
		displaySlideMapper.update(displaySlide);
		optLogger.info("displaySlide ({}) update by (:{}), origin: {}", displaySlide.toString(), user.getId(),
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
    public String uploadSlideSubWidgetBGImage(Long relationId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedException, ServerException {

    	MemDisplaySlideWidget memDisplaySlideWidget = getMemDisplaySlideWidget(relationId);

        if (2 != memDisplaySlideWidget.getType()) {
            throw new ServerException("dispaly slide widget is not sub widget");
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
			log.error(e.getMessage(), e);
			throw new ServerException("display slide sub widget backgroundImage upload error");
		}

		String origin = memDisplaySlideWidget.toString();
		memDisplaySlideWidget.setParams(jsonObject.toString());
		memDisplaySlideWidget.updatedBy(user.getId());
		memDisplaySlideWidgetMapper.update(memDisplaySlideWidget);
		optLogger.info("memDisplaySlideWidget ({}) update by (:{}), origin: ({})", memDisplaySlideWidget.toString(),
				user.getId(), origin);

		return background;
    }

    @Override
    public List<Long> getSlideExecludeRoles(Long id) {
        return relRoleSlideMapper.getById(id);
    }

    @Override
    @Transactional
    public boolean postSlideVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		SlideWithDisplayAndProject slide = getSlideWithDisplayAndProject(vizVisibility.getId());

		if (vizVisibility.isVisible()) {
			if (relRoleSlideMapper.delete(slide.getId(), role.getId()) > 0) {
				optLogger.info("display slide ({}) can be accessed by role ({}), update by (:{})", (DisplaySlide) slide,
						role, user.getId());
			}
		} else {
			RelRoleSlide relRoleSlide = new RelRoleSlide(slide.getId(), role.getId());
			relRoleSlideMapper.insert(relRoleSlide);
			optLogger.info("display slide ({}) limit role ({}) access, create by (:{})", (DisplaySlide) slide, role,
					user.getId());
		}

		return true;
	}

	@Override
	@Transactional
	public boolean copySlides(Long originDisplayId, Long displayId, User user) {
		// copy slide entity
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
			if (displaySlideMapper.insert(slide) > 0) {
				optLogger.info("Slide ({}) is copied from ({}) by user(:{})", slide.toString(),
						originDisplay.toString(), user.getId());
				slideCopies.add(new RelModelCopy(originDisplay.getId(), slide.getId()));
			}
		});

		// copy relRoleSlide
		if (!slideCopies.isEmpty()) {
			if (relRoleSlideMapper.copyRoleSlideRelation(slideCopies, user.getId()) > 0) {
				optLogger.info("display (:{}) slides role is copied by user (:{}) from (:{})", displayId, user.getId(),
						originDisplayId);
			}
		}

		// copy memDisplaySlideWidget
		List<MemDisplaySlideWidgetWithSlide> memWithSlideWidgetList = memDisplaySlideWidgetMapper
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
			mem.createdBy(user.getId());
			int insert = memDisplaySlideWidgetMapper.insert(mem);
			if (insert > 0) {
				optLogger.info("MemDisplaySlideWidget ({}) is copied from ({}) by user(:{})", mem.toString(),
						originMem.toString(), user.getId());
				memCopies.add(new RelModelCopy(originMem.getId(), mem.getId()));
			}
		});

		// copy relRoleDisplaySlideWidget
		if (!memCopies.isEmpty()) {
			if (relRoleDisplaySlideWidgetMapper.copyRoleSlideWidgetRelation(memCopies, user.getId()) > 0) {
				optLogger.info("display (:{}) relRoleDisplaySlideWidgetMapper is copied by user (:{}) from (:{})",
						displayId, user.getId(), originDisplayId);
			}
		}
		return true;
    }
}
