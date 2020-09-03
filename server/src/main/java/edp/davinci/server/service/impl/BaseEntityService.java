/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static edp.davinci.commons.Constants.*;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LockType;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.server.util.LockFactory;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public abstract class BaseEntityService {

	@Autowired
	protected ProjectService projectService;

	protected BaseLock getLock(CheckEntityEnum entity, String name, Long domainId) {

		return LockFactory.getLock(entity.getSource().toUpperCase() + AT_SIGN + name + AT_SIGN + domainId, 5,
				LockType.REDIS);
	}

	protected void releaseLock(BaseLock lock) {
		if (lock != null) {
			lock.release();
		}
	}

	protected void alertNameTaken(CheckEntityEnum entity, String name) throws ServerException {
		log.warn("The {} name({}) is already taken", entity.getSource(), name);
		throw new ServerException("The " + entity.getSource() + " name is already taken");
	}

	protected void alertUnAuthorized(CheckEntityEnum entity, User user, String operation) throws ServerException {
		log.warn("User({}) don't have permission to {} this {}", user.getId(), operation, entity.getSource());
		throw new UnAuthorizedExecption("You don't have permission to " + operation + " this " + entity.getSource());
	}

	protected ProjectPermission getProjectPermission(Long projectId, User user) {
		try {
			return projectService.getProjectPermission(projectService.getProjectDetail(projectId, user, false), user);
		} catch (Exception e) {
			return null;
		}
	}

	private short getEntityPermission(CheckEntityEnum entity, ProjectPermission projectPermission) {

		short permission = (short) -1;

		switch (entity) {
		case SOURCE:
			permission = projectPermission.getSourcePermission();
			break;
		case CRONJOB:
			permission = projectPermission.getSchedulePermission();
			break;
		case DISPLAY:
		case DISPLAYSLIDE:
		case DASHBOARDPORTAL:
		case DASHBOARD:
			permission = projectPermission.getVizPermission();
			break;
		case VIEW:
			permission = projectPermission.getViewPermission();
			break;
		case WIDGET:
			permission = projectPermission.getWidgetPermission();
			break;
		default:
			break;
		}

		return permission;
	}
	
	protected void checkDeletePermission(CheckEntityEnum entity, Long projectId, User user)
			throws UnAuthorizedExecption {

		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		if (projectPermission == null) {
			alertUnAuthorized(entity, user, "delete");
		}

		if (getEntityPermission(entity, projectPermission) < UserPermissionEnum.DELETE.getPermission()) {
			alertUnAuthorized(entity, user, "delete");
		}
	}

	protected void checkWritePermission(CheckEntityEnum entity, Long projectId, User user, String operation)
			throws UnAuthorizedExecption {

		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		if (projectPermission == null) {
			alertUnAuthorized(entity, user, operation);
		}

		if (getEntityPermission(entity, projectPermission) < UserPermissionEnum.WRITE.getPermission()) {
			alertUnAuthorized(entity, user, operation);
		}
	}
	
	protected void checkSharePermission(CheckEntityEnum entity, Long projectId, User user)
			throws UnAuthorizedExecption {

		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		if (projectPermission == null) {
			alertUnAuthorized(entity, user, "share");
		}

		if (!projectPermission.getSharePermission()) {
			alertUnAuthorized(entity, user, "share");
		}
	}
	
	public boolean checkReadPermission(CheckEntityEnum entity, Long projectId, User user) {

		ProjectPermission projectPermission = getProjectPermission(projectId, user);

		if (projectPermission == null) {
			return false;
		}

		if (getEntityPermission(entity, projectPermission) < UserPermissionEnum.READ.getPermission()) {
			return false;
		}

		return true;
	}
}