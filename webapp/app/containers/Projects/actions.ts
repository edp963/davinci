/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'

export const ProjectActions = {

  loadProjectDetail (id) {
    return {
      type: ActionTypes.LOAD_PROJECT_DETAIL,
      payload: {
        id
      }
    }
  },

  clearCurrentProject () {
    return {
      type: ActionTypes.CLEAR_CURRENT_PROJECT
    }
  }
  ,

  loadProjects () {
    return {
      type: ActionTypes.LOAD_PROJECTS
    }
  },

  projectsLoaded (projects) {
    return {
      type: ActionTypes.LOAD_PROJECTS_SUCCESS,
      payload: {
        projects
      }
    }
  },

  loadProjectsFail () {
    return {
      type: ActionTypes.LOAD_PROJECTS_FAILURE
    }
  },

  addProject (project, resolve) {
    return {
      type: ActionTypes.ADD_PROJECT,
      payload: {
        project,
        resolve
      }
    }
  },

  projectAdded (result) {
    return {
      type: ActionTypes.ADD_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  addProjectFail () {
    return {
      type: ActionTypes.ADD_PROJECT_FAILURE
    }
  },

  editProject (project, resolve) {
    return {
      type: ActionTypes.EDIT_PROJECT,
      payload: {
        project,
        resolve
      }
    }
  },

  projectEdited (result) {
    return {
      type: ActionTypes.EDIT_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  editProjectFail () {
    return {
      type: ActionTypes.EDIT_PROJECT_FAILURE
    }
  },

  transferProject (id, orgId) {
    return {
      type: ActionTypes.TRANSFER_PROJECT,
      payload: {
        id,
        orgId
      }
    }
  },

  projectTransfered (result) {
    return {
      type: ActionTypes.TRANSFER_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  transferProjectFail () {
    return {
      type: ActionTypes.TRANSFER_PROJECT_FAILURE
    }
  },

  deleteProject (id, resolve) {
    return {
      type: ActionTypes.DELETE_PROJECT,
      payload: {
        id,
        resolve
      }
    }
  },

  projectDeleted (id) {
    return {
      type: ActionTypes.DELETE_PROJECT_SUCCESS,
      payload: {
        id
      }
    }
  },

  deleteProjectFail () {
    return {
      type: ActionTypes.DELETE_PROJECT_FAILURE
    }
  },

  projectDetailLoaded (project) {
    return {
      type: ActionTypes.LOAD_PROJECT_DETAIL_SUCCESS,
      payload: {
        project
      }
    }
  }
  ,

  loadProjectDetailFail () {
    return {
      type: ActionTypes.LOAD_PROJECT_DETAIL_FAILURE
    }
  },

  searchProject (param) {
    return {
      type: ActionTypes.SEARCH_PROJECT,
      payload: {
        param
      }
    }
  },

  projectSearched (result) {
    return {
      type: ActionTypes.SEARCH_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  searchProjectFail () {
    return {
      type: ActionTypes.SEARCH_PROJECT_FAILURE
    }
  },

  getProjectStarUser (id) {
    return {
      type: ActionTypes.GET_PROJECT_STAR_USER,
      payload: {
        id
      }
    }
  },

  getProjectStarUserSuccess (result) {
    return {
      type: ActionTypes.GET_PROJECT_STAR_USER_SUCCESS,
      payload: {
        result
      }
    }
  },

  getProjectStarUserFail () {
    return {
      type: ActionTypes.GET_PROJECT_STAR_USER_FAILURE
    }
  },

  unStarProject (id, resolve) {
    return {
      type: ActionTypes.PROJECT_UNSTAR,
      payload: {
        id,
        resolve
      }
    }
  },

  unStarProjectSuccess (result) {
    return {
      type: ActionTypes.PROJECT_UNSTAR_SUCCESS,
      payload: {
        result
      }
    }
  },

  unStarProjectFail () {
    return {
      type: ActionTypes.PROJECT_UNSTAR_FAILURE
    }
  },

  loadCollectProjects () {
    return {
      type: ActionTypes.LOAD_COLLECT_PROJECTS
    }
  },

  collectProjectLoaded (result) {
    return {
      type: ActionTypes.LOAD_COLLECT_PROJECTS_SUCCESS,
      payload: {
        result
      }
    }
  },

  collectProjectFail () {
    return {
      type: ActionTypes.LOAD_COLLECT_PROJECTS_FAILURE
    }
  },

  clickCollectProjects (formType, project, resolve) {
    return {
      type: ActionTypes.CLICK_COLLECT_PROJECT,
      payload: {
        formType,
        project,
        resolve
      }
    }
  },

  collectProjectClicked (result) {
    return {
      type: ActionTypes.CLICK_COLLECT_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  clickCollectProjectFail () {
    return {
      type: ActionTypes.CLICK_COLLECT_PROJECT_FAILURE
    }
  },

  addProjectAdmin (id, adminIds, resolve) {
    return {
      type: ActionTypes.ADD_PROJECT_ADMIN,
      payload: {
        id, adminIds, resolve
      }
    }
  },

  projectAdminAdded (result) {
    return {
      type: ActionTypes.ADD_PROJECT_ADMIN_SUCCESS,
      payload: {
        result
      }
    }
  },

  addProjectAdminFail () {
    return {
      type: ActionTypes.ADD_PROJECT_ADMIN_FAIL
    }
  },

  deleteProjectAdmin (id, relationId , resolve) {
    return {
      type: ActionTypes.DELETE_PROJECT_ADMIN,
      payload: {
        id, relationId , resolve
      }
    }
  },

  projectAdminDeleted (result) {
    return {
      type: ActionTypes.DELETE_PROJECT_ADMIN_SUCCESS,
      payload: {
        result
      }
    }
  },

  deleteProjectAdminFail () {
    return {
      type: ActionTypes.DELETE_PROJECT_ADMIN_FAIL
    }
  },

  addProjectRole (projectId, roleIds, resolve) {
    return {
      type: ActionTypes.ADD_PROJECT_ROLE,
      payload: {
        projectId, roleIds, resolve
      }
    }
  },

  projectRoleAdded (result) {
    return {
      type: ActionTypes.ADD_PROJECT_ROLE_SUCCESS,
      payload: {
        result
      }
    }
  },

  addProjectRoleFail () {
    return {
      type: ActionTypes.ADD_PROJECT_ROLE_FAIL
    }
  },

  deleteProjectRole (id, relationId , resolve) {
    return {
      type: ActionTypes.DELETE_PROJECT_ROLE,
      payload: {
        id, relationId , resolve
      }
    }
  },

  projectRoleDeleted (result) {
    return {
      type: ActionTypes.DELETE_PROJECT_ROLE_SUCCESS,
      payload: {
        result
      }
    }
  },

  deleteProjectRoleFail () {
    return {
      type: ActionTypes.DELETE_PROJECT_ROLE_FAIL
    }
  },

  updateRelRoleProject (roleId, projectId, projectRole) {
    return {
      type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT,
      payload: {
        roleId,
        projectId,
        projectRole
      }
    }
  },

  relRoleProjectUpdated (result) {
    return {
      type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  updateRelRoleProjectFail () {
    return {
      type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT_FAIL
    }
  },

  deleteRelRoleProject (roleId, projectId, resolve) {
    return {
      type: ActionTypes.DELETE_RELATION_ROLE_PROJECT,
      payload: {
        roleId,
        projectId,
        resolve
      }
    }
  },

  relRoleProjectDeleted (result) {
    return {
      type: ActionTypes.DELETE_RELATION_ROLE_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  },

  deleteRelRoleProjectFail () {
    return {
      type: ActionTypes.DELETE_RELATION_ROLE_PROJECT_FAIL
    }
  },

  loadRelRoleProject (id, roleId) {
    return {
      type: ActionTypes.LOAD_RELATION_ROLE_PROJECT,
      payload: {
        id,
        roleId
      }
    }
  },

  relRoleProjectLoaded (result) {
    return {
      type: ActionTypes.RELATION_ROLE_PROJECT_LOADED,
      payload: {
        result
      }
    }
  },

  loadRelRoleProjectFail () {
    return {
      type: ActionTypes.LOAD_RELATION_ROLE_PROJECT_FAIL
    }
  }
  ,

  excludeRoles (type, id, resolve) {
    return {
      type: ActionTypes.EXCLUDE_ROLES,
      payload: {type, id, resolve}
    }
  },

  rolesExcluded (result) {
    return {
      type: ActionTypes.EXCLUDE_ROLES_SUCCESS,
      payload: {
        result
      }
    }

  },

  excludeRolesFail (err) {
    return {
      type: ActionTypes.EXCLUDE_ROLES_FAIL,
      payload: {
        err
      }
    }
  }
}

const mockAction = returnType(ProjectActions)
export type ProjectActionType = typeof mockAction

export default ProjectActions
