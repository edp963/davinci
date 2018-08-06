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
  LOAD_PROJECT_DETAIL_FAILURE
} from './constants'

export function loadProjectDetail (id) {
  return {
    type: LOAD_PROJECT_DETAIL,
    payload: {
      id
    }
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

export function transferProject (id, orgId) {
  return {
    type: TRANSFER_PROJECT,
    payload: {
      id,
      orgId
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
    type: TRANSFER_PROJECT_f
  }
}

export function deleteProject (id) {
  return {
    type: DELETE_PROJECT,
    payload: {
      id
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









