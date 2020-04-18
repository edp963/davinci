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

import static edp.core.consts.Consts.DEFAULT_COPY_SUFFIX;

import java.io.File;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import edp.davinci.dto.displayDto.DisplayCopy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.druid.util.StringUtils;

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.BaseLock;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.VizEnum;
import edp.davinci.dao.MemDisplaySlideWidgetMapper;
import edp.davinci.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.dto.displayDto.DisplayInfo;
import edp.davinci.dto.displayDto.DisplayUpdate;
import edp.davinci.dto.displayDto.DisplayWithProject;
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
    
    private static final  CheckEntityEnum entity = CheckEntityEnum.DISPLAY;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long displayId = displayMapper.getByNameWithProjectId(name, projectId);
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
			
			Display display = new Display().createdBy(user.getId());
	        BeanUtils.copyProperties(displayInfo, display);

			if (displayMapper.insert(display) <= 0) {
				throw new ServerException("create display fail");
			}

			optLogger.info("display ({}) is create by (:{})", display.toString(), user.getId());

			if (!CollectionUtils.isEmpty(displayInfo.getRoleIds())) {
				List<Role> roles = roleMapper.getRolesByIds(displayInfo.getRoleIds());
				List<RelRoleDisplay> list = roles.stream()
						.map(r -> new RelRoleDisplay(display.getId(), r.getId()).createdBy(user.getId()))
						.collect(Collectors.toList());

				if (!CollectionUtils.isEmpty(list)) {
					relRoleDisplayMapper.insertBatch(list);
					optLogger.info("display ({}) limit role ({}) access", display.getId(),
							roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
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

        relRoleDisplaySlideWidgetMapper.deleteByDisplayId(id);
        memDisplaySlideWidgetMapper.deleteByDisplayId(id);
        relRoleSlideMapper.deleteByDisplayId(id);
        displaySlideMapper.deleteByDisplayId(id);
        relRoleDisplayMapper.deleteByDisplayId(id);
        displayMapper.deleteById(id);

        return true;
    }
    
    private DisplayWithProject getDisplayWithProject(Long id, boolean isThrow) {

    	DisplayWithProject displayWithProject = displayMapper.getDisplayWithProjectById(id);

    	if (null == displayWithProject) {
            log.info("display (:{}) is not found", id);
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

        Display display = displayMapper.getById(displayUpdate.getId());
        if (null == display) {
            throw new NotFoundException("display is not found");
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
	            throw new ServerException("Invalid cover image");
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
	        display.updatedBy(user.getId());

			if (displayMapper.update(display) <= 0) {
				throw new ServerException("update display fail");
			}
			
			optLogger.info("display ({}) is update by (:{}), origin: ({})", display.toString(), user.getId(), origin);
			if (displayUpdate.getRoleIds() != null) {
				relRoleDisplayMapper.deleteByDisplayId(display.getId());
				if (!CollectionUtils.isEmpty(displayUpdate.getRoleIds())) {
					List<Role> roles = roleMapper.getRolesByIds(displayUpdate.getRoleIds());
					List<RelRoleDisplay> list = roles.stream()
							.map(r -> new RelRoleDisplay(display.getId(), r.getId()).createdBy(user.getId()))
							.collect(Collectors.toList());
					if (!CollectionUtils.isEmpty(list)) {
						relRoleDisplayMapper.insertBatch(list);
						optLogger.info("update display ({}) limit role ({}) access", display.getId(),
								roles.stream().map(r -> r.getId()).collect(Collectors.toList()));
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

		List<Display> displays = displayMapper.getByProject(projectId);
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
            throw new ServerException("file format error");
        }

        //上传文件
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID();
        String avatar = null;
        try {
            avatar = fileUtils.upload(file, Constants.DISPLAY_AVATAR_PATH, fileName);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException("display cover picture upload error");
        }

        return avatar;
    }

	@Override
	public String shareDisplay(Long id, User user, String username)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		DisplayWithProject displayWithProject = getDisplayWithProject(id, true);

		if (null == displayWithProject.getProject()) {
			log.info("project is not found");
			throw new NotFoundException("project is not found");
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
        return relRoleDisplayMapper.getById(id);
    }

	@Override
	@Transactional
	public boolean postDisplayVisibility(Role role, VizVisibility vizVisibility, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		Display display = displayMapper.getById(vizVisibility.getId());
		if (null == display) {
			throw new NotFoundException("display is not found");
		}

		if (vizVisibility.isVisible()) {
			if (relRoleDisplayMapper.delete(display.getId(), role.getId()) > 0) {
				optLogger.info("display ({}) can be accessed by role ({}), update by (:{})", display, role,
						user.getId());
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
     * @param copy
	 * @param user user
	 * @return new display
     */
    @Override
    @Transactional
    public Display copyDisplay(Long id, DisplayCopy copy, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
    	DisplayWithProject originDisplay = getDisplayWithProject(id, true);

    	Long projectId = originDisplay.getProjectId();
        ProjectPermission projectPermission = getProjectPermission(projectId, user);

		checkIsExist(copy.getName(), null, projectId);

		checkWritePermission(entity, projectId, user, "copy");

        if (isDisableDisplay(id, projectId, user, projectPermission)) {
            alertUnAuthorized(entity, user, "copy");
        }

        // copy display entity
        Display display = new Display();
        BeanUtils.copyProperties(originDisplay, display, "id");

		String name = copy.getName();
        BaseLock lock = getLock(entity, name, projectId);
		while(lock != null && !lock.getLock()) {
			name = getCopyName(name, projectId);
			lock = getLock(entity, name, projectId);
		}

		display.setName(name);
		display.setDescription(copy.getDescription());
		display.setPublish(copy.getPublish());
        display.createdBy(user.getId());
        if (displayMapper.insert(display) <= 0) {
            throw new ServerException("copy display fail");
        }
		optLogger.info("display ({}) is copied by user (:{}) from ({})", display.toString(), user.getId(), originDisplay.toString());

		// copy relRoleDisplay
		if (!CollectionUtils.isEmpty(copy.getRoleIds())) {
			List<Role> roles = roleMapper.getRolesByIds(copy.getRoleIds());
			List<RelRoleDisplay> list = roles.stream()
					.map(r -> new RelRoleDisplay(display.getId(), r.getId()).createdBy(user.getId()))
					.collect(Collectors.toList());

			if (!CollectionUtils.isEmpty(list)) {
				relRoleDisplayMapper.insertBatch(list);
				optLogger.info("display ({}) limit role ({}) access", display.getId(),
						roles.stream().map(Role::getId).collect(Collectors.toList()));
			}
		}

        displaySlideService.copySlides(originDisplay.getId(), display.getId(), user);
        return display;
    }
    
	private String getCopyName(String name, Long projectId) {
		
		String copyName = name + DEFAULT_COPY_SUFFIX;
		if (isExist(copyName, null, projectId)) {
			Integer maxOrder = displayMapper.selectMaxNameOrderByName(copyName, projectId);
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
        relRoleDisplaySlideWidgetMapper.deleteByProjectId(projectId);
        memDisplaySlideWidgetMapper.deleteByProject(projectId);
        relRoleSlideMapper.deleteByProjectId(projectId);
        displaySlideMapper.deleteByProjectId(projectId);
        relRoleDisplayMapper.deleteByProjectId(projectId);
        displayMapper.deleteByProject(projectId);
    }
}
