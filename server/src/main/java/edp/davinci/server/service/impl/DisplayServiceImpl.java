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

import static edp.davinci.server.commons.Constants.DEFAULT_COPY_SUFFIX;

import java.io.File;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Display;
import edp.davinci.core.dao.entity.RelRoleDisplay;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.MemDisplaySlideWidgetExtendMapper;
import edp.davinci.server.dao.RelRoleDisplaySlideWidgetExtendMapper;
import edp.davinci.server.dto.display.DisplayCopy;
import edp.davinci.server.dto.display.DisplayInfo;
import edp.davinci.server.dto.display.DisplayUpdate;
import edp.davinci.server.dto.display.DisplayWithProject;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.role.VizVisibility;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.enums.VizEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.Role;
import edp.davinci.server.model.User;
import edp.davinci.server.service.DisplayService;
import edp.davinci.server.service.DisplaySlideService;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.service.ShareService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.FileUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("displayService")
public class DisplayServiceImpl extends VizCommonService implements DisplayService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ShareService shareService;

    @Autowired
    private MemDisplaySlideWidgetExtendMapper memDisplaySlideWidgetExtendMapper;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private RelRoleDisplaySlideWidgetExtendMapper relRoleDisplaySlideWidgetExtendMapper;

    @Autowired
    private DisplaySlideService displaySlideService;
    
    private static final  CheckEntityEnum entity = CheckEntityEnum.DISPLAY;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long displayId = displayExtendMapper.getByNameWithProjectId(name, projectId);
		if (null != id && null != displayId) {
			return !id.equals(displayId);
		}
		return null != displayId && displayId.longValue() > 0L;
	}
    
	private void checkIsExist(String name, Long id, Long projectId) {
		if (isExist(name, id, projectId)) {
			alertNameTaken(entity, name);
		}
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
    	
    	Long projectId = displayInfo.getProjectId();
    	checkWritePermission(entity, projectId, user, "create");

    	String name = displayInfo.getName();
        checkIsExist(name, null, projectId);

        BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {
			
			Display display = new Display();
			display.setCreateBy(user.getId());
			display.setCreateTime(new Date());
	        BeanUtils.copyProperties(displayInfo, display);

			if (displayExtendMapper.insert(display) <= 0) {
				throw new ServerException("Create display fail");
			}

			optLogger.info("Display({}) is create by user({})", display.getId(), user.getId());

			if (!CollectionUtils.isEmpty(displayInfo.getRoleIds())) {
				List<Role> roles = roleMapper.getRolesByIds(displayInfo.getRoleIds());
				List<RelRoleDisplay> list = roles.stream()
						.map(r -> {
							RelRoleDisplay rel = new RelRoleDisplay();
							rel.setRoleId(r.getId());
							rel.setDisplayId(display.getId());
							rel.setVisible(false);
							rel.setCreateBy(user.getId());
							rel.setCreateTime(new Date());
							return rel;
						})
						.collect(Collectors.toList());

				if (!CollectionUtils.isEmpty(list)) {
					relRoleDisplayExtendMapper.insertBatch(list);
					optLogger.info("Display({}) limit role({}) access, create by user({})", display.getId(),
							roles.stream().map(r -> r.getId()).collect(Collectors.toList()), user.getId());
				}
			}

			return display;
			
		}finally {
			releaseLock(lock);
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
        
    	DisplayWithProject displayWithProject = getDisplayWithProject(id, false);
        if (null == displayWithProject) {
            return false;
        }
        
        Long projectId = displayWithProject.getProjectId();
        checkWritePermission(entity, projectId, user, "copy");

        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        if (isDisableDisplay(displayWithProject.getId(), projectId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "copy");
        }

        relRoleDisplaySlideWidgetExtendMapper.deleteByDisplayId(id);
        memDisplaySlideWidgetExtendMapper.deleteByDisplayId(id);
        relRoleSlideMapper.deleteByDisplayId(id);
        displaySlideExtendMapper.deleteByDisplayId(id);
        relRoleDisplayExtendMapper.deleteByDisplayId(id);
        displayExtendMapper.deleteByPrimaryKey(id);

        return true;
    }
    
    private DisplayWithProject getDisplayWithProject(Long id, boolean isThrow) {

    	DisplayWithProject displayWithProject = displayExtendMapper.getDisplayWithProjectById(id);

    	if (null == displayWithProject) {
            log.info("Display({}) is not found", id);
        }
        
		if (null == displayWithProject && isThrow) {
			throw new NotFoundException("Display is not found");
		}

		return displayWithProject;
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

        Display display = displayExtendMapper.selectByPrimaryKey(displayUpdate.getId());
        if (null == display) {
            throw new NotFoundException("Display is not found");
        }

        Long projectId = displayUpdate.getProjectId();
        checkWritePermission(entity, projectId, user, "update");

        ProjectPermission projectPermission = getProjectPermission(projectId, user);
        if (isDisableDisplay(displayUpdate.getId(), projectId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "update");
        }
        
        String name = displayUpdate.getName();
        BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try {

			String updateAvatar = displayUpdate.getAvatar();
	        if (!StringUtils.isEmpty(updateAvatar) && !updateAvatar.startsWith(Constants.DISPLAY_AVATAR_PATH)) {
	            throw new ServerException("Invalid avatar image");
	        }

	        String avatar = display.getAvatar();
	        //删除原有封面图
	        if (!StringUtils.isEmpty(avatar) && !updateAvatar.equals(avatar)) {
	            File file = new File(avatar);
	            if (null != file && file.exists() && file.isFile() && fileUtils.isImage(file)) {
	                file.delete();
	            }
	        }
	        
	        String origin = display.toString();
	        BeanUtils.copyProperties(displayUpdate, display);
			display.setUpdateBy(user.getId());
			display.setUpdateTime(new Date());

			if (displayExtendMapper.update(display) <= 0) {
				throw new ServerException("Update display fail");
			}
			
			optLogger.info("Display({}) is update by user({}), origin:{}", display.getId(), user.getId(), origin);
			if (displayUpdate.getRoleIds() != null) {
				relRoleDisplayExtendMapper.deleteByDisplayId(display.getId());
				if (!CollectionUtils.isEmpty(displayUpdate.getRoleIds())) {
					List<Role> roles = roleMapper.getRolesByIds(displayUpdate.getRoleIds());
					List<RelRoleDisplay> list = roles.stream()
							.map(r -> {
								RelRoleDisplay rel = new RelRoleDisplay();
								rel.setRoleId(r.getId());
								rel.setDisplayId(display.getId());
								rel.setVisible(false);
								rel.setCreateBy(user.getId());
								rel.setCreateTime(new Date());
								return rel;
							})
							.collect(Collectors.toList());
					if (!CollectionUtils.isEmpty(list)) {
						relRoleDisplayExtendMapper.insertBatch(list);
						optLogger.info("Update display({}) limit role({}) access, create by user({})", display.getId(),
								roles.stream().map(r -> r.getId()).collect(Collectors.toList()), user.getId());
					}
				}
			}

			return true;

		}finally {
			releaseLock(lock);
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
	public List<Display> getDisplayListByProject(Long projectId, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		if (!checkReadPermission(entity, projectId, user)) {
			return null;
		}

		List<Display> displays = displayExtendMapper.getByProject(projectId);
		if (CollectionUtils.isEmpty(displays)) {
			return null;
		}

		List<Long> allDisplays = displays.stream().map(Display::getId).collect(Collectors.toList());
		List<Long> disableList = getDisableVizs(user.getId(), projectId, allDisplays, VizEnum.DISPLAY);
		
		ProjectPermission projectPermission = getProjectPermission(projectId, user);
		Iterator<Display> iterator = displays.iterator();
		while (iterator.hasNext()) {
			Display display = iterator.next();
			boolean disable = !projectPermission.isProjectMaintainer() && disableList.contains(display.getId());
			boolean noPublish = projectPermission.getVizPermission() < UserPermissionEnum.WRITE.getPermission()
					&& !display.getPublish();
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
            throw new ServerException("File format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException("Display avatar upload error");
        }

        return avatar;
    }

	@Override
	public String shareDisplay(Long id, User user, String username)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		DisplayWithProject displayWithProject = getDisplayWithProject(id, true);

		if (null == displayWithProject.getProject()) {
			log.info("Project is not found");
			throw new NotFoundException("Project is not found");
		}

		Long projectId = displayWithProject.getProjectId();
		ProjectPermission projectPermission = projectService.getProjectPermission(
				projectService.getProjectDetail(displayWithProject.getProjectId(), user, false), user);
        if (isDisableDisplay(displayWithProject.getId(), projectId, user, projectPermission)) {
        	alertUnAuthorized(entity, user, "share");
        }

		return shareService.generateShareToken(id, username, user.getId());
	}

    @Override
    public List<Long> getDisplayExcludeRoles(Long id) {
        return relRoleDisplayExtendMapper.getByDisplayId(id);
    }

	@Override
	@Transactional
	public boolean postDisplayVisibility(Role role, VizVisibility vizVisibility, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		Display display = displayExtendMapper.selectByPrimaryKey(vizVisibility.getId());
		if (null == display) {
			throw new NotFoundException("Display is not found");
		}

		if (vizVisibility.isVisible()) {
			if (relRoleDisplayExtendMapper.deleteByPrimaryKey(role.getId(), display.getId()) > 0) {
				optLogger.info("Display({}) can be accessed by role({}), update by user({})", display.getId(),
						role.getId(), user.getId());
			}
		} else {
			RelRoleDisplay relRoleDisplay = new RelRoleDisplay();
			relRoleDisplay.setDisplayId(display.getId());
			relRoleDisplay.setRoleId(role.getId());
			relRoleDisplay.setCreateBy(user.getId());
			relRoleDisplay.setCreateTime(new Date());
			relRoleDisplay.setVisible(false);
			relRoleDisplayExtendMapper.insert(relRoleDisplay);
			optLogger.info("Display({}) can be accessed by role({}), create by user({})", display.getId(), role.getId(),
					user.getId());
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
    public Display copyDisplay(Long id, DisplayCopy copy, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		DisplayWithProject originDisplay = getDisplayWithProject(id, true);

		Long projectId = originDisplay.getProjectId();
		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		String name = copy.getName();
		checkIsExist(copy.getName(), null, projectId);

		checkWritePermission(entity, projectId, user, "copy");

		if (isDisableDisplay(id, projectId, user, projectPermission)) {
			alertUnAuthorized(entity, user, "copy");
		}

		// copy display entity
		Display display = new Display();
		BeanUtils.copyProperties(originDisplay, display, "id");

		BaseLock lock = getLock(entity, name, projectId);
		while (lock != null && !lock.getLock()) {
			name = getCopyName(name, projectId);
			lock = getLock(entity, name, projectId);
		}

		display.setName(name);
		display.setDescription(copy.getDescription());
		display.setPublish(copy.getPublish());
		display.setCreateBy(user.getId());
		display.setCreateTime(new Date());
		if (displayExtendMapper.insert(display) <= 0) {
			throw new ServerException("Copy display fail");
		}
		optLogger.info("Display({}) is copied by user({}) from display({})", display.getId(), user.getId(),
				originDisplay.getId());

		// copy relRoleDisplay
		if (!CollectionUtils.isEmpty(copy.getRoleIds())) {
			List<Role> roles = roleMapper.getRolesByIds(copy.getRoleIds());
			List<RelRoleDisplay> list = roles.stream()
					.map(r -> {
						RelRoleDisplay rel = new RelRoleDisplay();
						rel.setRoleId(r.getId());
						rel.setDisplayId(display.getId());
						rel.setVisible(false);
						rel.setCreateBy(user.getId());
						rel.setCreateTime(new Date());
						return rel;
					}).collect(Collectors.toList());

			if (!CollectionUtils.isEmpty(list)) {
				relRoleDisplayExtendMapper.insertBatch(list);
				optLogger.info("Display({}) limit role({}) access", display.getId(),
						roles.stream().map(Role::getId).collect(Collectors.toList()));
			}
		}

		displaySlideService.copySlides(originDisplay.getId(), display.getId(), user);
		return display;
    }
    
	private String getCopyName(String name, Long projectId) {
		
		String copyName = name + DEFAULT_COPY_SUFFIX;
		if (isExist(copyName, null, projectId)) {
			Integer maxOrder = displayExtendMapper.selectMaxNameOrderByName(copyName, projectId);
			if (maxOrder == null) {
				copyName += "2";
			} else {
				copyName += (maxOrder + 1);
			}
		}
		
		return copyName;
	}

    @Override
    @Transactional
    public void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException {
        relRoleDisplaySlideWidgetExtendMapper.deleteByProjectId(projectId);
        memDisplaySlideWidgetExtendMapper.deleteByProject(projectId);
        relRoleSlideMapper.deleteByProjectId(projectId);
        displaySlideExtendMapper.deleteByProjectId(projectId);
        relRoleDisplayExtendMapper.deleteByProjectId(projectId);
        displayExtendMapper.deleteByProject(projectId);
    }
}
