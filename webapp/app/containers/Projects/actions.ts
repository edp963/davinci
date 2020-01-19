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

import {
  LOAD_PROJECTS,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECTS_FAILURE,
  ADD_PROJECT,
  ADD_PROJECT_SUCCESS,
  ADD_PROJECT_FAILURE,
  EDIT_PROJECT,
  EDIT_PROJECT_SUCCESS,
  EDIT_PROJECT_FAILURE,
  TRANSFER_PROJECT,
  TRANSFER_PROJECT_SUCCESS,
  TRANSFER_PROJECT_FAILURE,
  DELETE_PROJECT,
  DELETE_PROJECT_SUCCESS,
  DELETE_PROJECT_FAILURE,
  LOAD_PROJECT_DETAIL,
  LOAD_PROJECT_DETAIL_SUCCESS,
  LOAD_PROJECT_DETAIL_FAILURE,
  KILL_PROJECT_DETAIL,
  SEARCH_PROJECT_SUCCESS,
  SEARCH_PROJECT_FAILURE,
  SEARCH_PROJECT,
  GET_PROJECT_STAR_USER,
  GET_PROJECT_STAR_USER_SUCCESS,
  GET_PROJECT_STAR_USER_FAILURE,
  PROJECT_UNSTAR,
  PROJECT_UNSTAR_SUCCESS,
  PROJECT_UNSTAR_FAILURE,
  LOAD_COLLECT_PROJECTS,
  LOAD_COLLECT_PROJECTS_SUCCESS,
  LOAD_COLLECT_PROJECTS_FAILURE,
  CLICK_COLLECT_PROJECT,
  CLICK_COLLECT_PROJECT_SUCCESS,
  CLICK_COLLECT_PROJECT_FAILURE,
  ADD_PROJECT_ADMIN,
  ADD_PROJECT_ADMIN_SUCCESS,
  ADD_PROJECT_ADMIN_FAIL,
  DELETE_PROJECT_ADMIN,
  DELETE_PROJECT_ADMIN_SUCCESS,
  DELETE_PROJECT_ADMIN_FAIL,
  ADD_PROJECT_ROLE,
  ADD_PROJECT_ROLE_SUCCESS,
  ADD_PROJECT_ROLE_FAIL,
  DELETE_PROJECT_ROLE,
  DELETE_PROJECT_ROLE_SUCCESS,
  DELETE_PROJECT_ROLE_FAIL,
  UPDATE_RELATION_ROLE_PROJECT,
  UPDATE_RELATION_ROLE_PROJECT_SUCCESS,
  UPDATE_RELATION_ROLE_PROJECT_FAIL,
  LOAD_RELATION_ROLE_PROJECT,
  RELATION_ROLE_PROJECT_LOADED,
  LOAD_RELATION_ROLE_PROJECT_FAIL,
  DELETE_RELATION_ROLE_PROJECT,
  DELETE_RELATION_ROLE_PROJECT_FAIL,
  DELETE_RELATION_ROLE_PROJECT_SUCCESS,
  EXCLUDE_ROLES,
  EXCLUDE_ROLES_SUCCESS,
  EXCLUDE_ROLES_FAIL
} from './constants'


export function loadProjectDetail (id) {
  return {
    type: LOAD_PROJECT_DETAIL,
    payload: {
      id
    }
  }
}

export function killProjectDetail () {
  return {
    type: KILL_PROJECT_DETAIL
  }
}


export function loadProjects () {
  return {
    type: LOAD_PROJECTS
  }
}

export function projectsLoaded (projects) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: {
      projects
    }
  }
}

export function loadProjectsFail () {
  return {
    type: LOAD_PROJECTS_FAILURE
  }
}

export function addProject (project, resolve) {
  return {
    type: ADD_PROJECT,
    payload: {
      project,
      resolve
    }
  }
}

export function projectAdded (result) {
  return {
    type: ADD_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function addProjectFail () {
  return {
    type: ADD_PROJECT_FAILURE
  }
}

export function editProject (project, resolve) {
  return {
    type: EDIT_PROJECT,
    payload: {
      project,
      resolve
    }
  }
}

export function projectEdited (result) {
  return {
    type: EDIT_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function editProjectFail () {
  return {
    type: EDIT_PROJECT_FAILURE
  }
}

export function transferProject (id, orgId, resolve) {
  return {
    type: TRANSFER_PROJECT,
    payload: {
      id,
      orgId,
      resolve
    }
  }
}

export function projectTransfered (result) {
  return {
    type: TRANSFER_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function transferProjectFail () {
  return {
    type: TRANSFER_PROJECT_FAILURE
  }
}

export function deleteProject (id, resolve) {
  return {
    type: DELETE_PROJECT,
    payload: {
      id,
      resolve
    }
  }
}

export function projectDeleted (id) {
  return {
    type: DELETE_PROJECT_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteProjectFail () {
  return {
    type: DELETE_PROJECT_FAILURE
  }
}

export function projectDetailLoaded (project) {
  return {
    type: LOAD_PROJECT_DETAIL_SUCCESS,
    payload: {
      project
    }
  }
}


export function loadProjectDetailFail () {
  return {
    type: LOAD_PROJECT_DETAIL_FAILURE
  }
}

export function searchProject (param) {
  return {
    type: SEARCH_PROJECT,
    payload: {
      param
    }
  }
}

export function projectSearched (result) {
  return {
    type: SEARCH_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function searchProjectFail () {
  return {
    type: SEARCH_PROJECT_FAILURE
  }
}

export function getProjectStarUser (id) {
  return {
    type: GET_PROJECT_STAR_USER,
    payload: {
      id
    }
  }
}

export function getProjectStarUserSuccess (result) {
  return {
    type: GET_PROJECT_STAR_USER_SUCCESS,
    payload: {
      result
    }
  }
}

export function getProjectStarUserFail () {
  return {
    type: GET_PROJECT_STAR_USER_FAILURE
  }
}

export function unStarProject (id, resolve) {
  return {
    type: PROJECT_UNSTAR,
    payload: {
      id,
      resolve
    }
  }
}

export function unStarProjectSuccess (result) {
  return {
    type: PROJECT_UNSTAR_SUCCESS,
    payload: {
      result
    }
  }
}

export function unStarProjectFail () {
  return {
    type: PROJECT_UNSTAR_FAILURE
  }
}

export function loadCollectProjects () {
  return {
    type: LOAD_COLLECT_PROJECTS
  }
}

export function collectProjectLoaded (result) {
  return {
    type: LOAD_COLLECT_PROJECTS_SUCCESS,
    payload: {
      result
    }
  }
}

export function collectProjectFail () {
  return {
    type: LOAD_COLLECT_PROJECTS_FAILURE
  }
}

export function clickCollectProjects (formType, project, resolve) {
  return {
    type: CLICK_COLLECT_PROJECT,
    payload: {
      formType,
      project,
      resolve
    }
  }
}

export function collectProjectClicked (result) {
  return {
    type: CLICK_COLLECT_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function clickCollectProjectFail () {
  return {
    type: CLICK_COLLECT_PROJECT_FAILURE
  }
}

export function addProjectAdmin (id, adminIds, resolve) {
  return {
    type: ADD_PROJECT_ADMIN,
    payload: {
      id, adminIds, resolve
    }
  }
}

export function projectAdminAdded (result) {
  return {
    type: ADD_PROJECT_ADMIN_SUCCESS,
    payload: {
      result
    }
  }
}

export function addProjectAdminFail () {
  return {
    type: ADD_PROJECT_ADMIN_FAIL
  }
}

export function deleteProjectAdmin (id, relationId , resolve) {
  return {
    type: DELETE_PROJECT_ADMIN,
    payload: {
      id, relationId , resolve
    }
  }
}

export function projectAdminDeleted (result) {
  return {
    type: DELETE_PROJECT_ADMIN_SUCCESS,
    payload: {
      result
    }
  }
}

export function deleteProjectAdminFail () {
  return {
    type: DELETE_PROJECT_ADMIN_FAIL
  }
}

export function addProjectRole (projectId, roleIds, resolve) {
  return {
    type: ADD_PROJECT_ROLE,
    payload: {
      projectId, roleIds, resolve
    }
  }
}

export function projectRoleAdded (result) {
  return {
    type: ADD_PROJECT_ROLE_SUCCESS,
    payload: {
      result
    }
  }
}

export function addProjectRoleFail () {
  return {
    type: ADD_PROJECT_ROLE_FAIL
  }
}

export function deleteProjectRole (id, relationId , resolve) {
  return {
    type: DELETE_PROJECT_ROLE,
    payload: {
      id, relationId , resolve
    }
  }
}

export function projectRoleDeleted (result) {
  return {
    type: DELETE_PROJECT_ROLE_SUCCESS,
    payload: {
      result
    }
  }
}

export function deleteProjectRoleFail () {
  return {
    type: DELETE_PROJECT_ROLE_FAIL
  }
}

export function updateRelRoleProject (roleId, projectId, projectRole) {
  return {
    type: UPDATE_RELATION_ROLE_PROJECT,
    payload: {
      roleId,
      projectId,
      projectRole
    }
  }
}

export function relRoleProjectUpdated (result) {
  return {
    type: UPDATE_RELATION_ROLE_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function updateRelRoleProjectFail () {
  return {
    type: UPDATE_RELATION_ROLE_PROJECT_FAIL
  }
}

export function deleteRelRoleProject (roleId, projectId, resolve) {
  return {
    type: DELETE_RELATION_ROLE_PROJECT,
    payload: {
      roleId,
      projectId,
      resolve
    }
  }
}

export function relRoleProjectDeleted (result) {
  return {
    type: DELETE_RELATION_ROLE_PROJECT_SUCCESS,
    payload: {
      result
    }
  }
}

export function deleteRelRoleProjectFail () {
  return {
    type: DELETE_RELATION_ROLE_PROJECT_FAIL
  }
}

export function loadRelRoleProject (id, roleId) {
  return {
    type: LOAD_RELATION_ROLE_PROJECT,
    payload: {
      id,
      roleId
    }
  }
}

export function relRoleProjectLoaded (result) {
  return {
    type: RELATION_ROLE_PROJECT_LOADED,
    payload: {
      result
    }
  }
}

export function loadRelRoleProjectFail () {
  return {
    type: LOAD_RELATION_ROLE_PROJECT_FAIL
  }
}


export function excludeRoles (type, id, resolve) {
  return {
    type: EXCLUDE_ROLES,
    payload: {type, id, resolve}
  }
}

export function rolesExcluded (result) {
  return {
    type: EXCLUDE_ROLES_SUCCESS,
    payload: {
      result
    }
  }

}

export function excludeRolesFail (err) {
  return {
    type: EXCLUDE_ROLES_FAIL,
    payload: {
      err
    }
  }
}







