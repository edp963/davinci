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

import { fromJS } from 'immutable'

import {
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECTS_FAILURE,
  ADD_PROJECT_SUCCESS,
  ADD_PROJECT_FAILURE,
  EDIT_PROJECT_SUCCESS,
  DELETE_PROJECT_SUCCESS,
  LOAD_PROJECT_DETAIL,
  LOAD_PROJECT_DETAIL_SUCCESS,
  KILL_PROJECT_DETAIL,
  SEARCH_PROJECT_SUCCESS,
  GET_PROJECT_STAR_USER_SUCCESS,
  LOAD_COLLECT_PROJECTS,
  LOAD_COLLECT_PROJECTS_SUCCESS,
  LOAD_COLLECT_PROJECTS_FAILURE,
  CLICK_COLLECT_PROJECT,
  CLICK_COLLECT_PROJECT_SUCCESS,
  CLICK_COLLECT_PROJECT_FAILURE,
  RELATION_ROLE_PROJECT_LOADED,
  UPDATE_RELATION_ROLE_PROJECT_SUCCESS
} from './constants'

import { LOAD_PROJECT_ROLES_SUCCESS } from '../Organizations/constants'

const initialState = fromJS({
  projects: null,
  currentProject: null,
  currentProjectLoading: false,
  searchProject: false,
  starUserList: false,
  collectProjects: null,
  currentProjectRole: false,
  projectRoles: false
})

function projectReducer (state = initialState, action) {
  const { type, payload } = action
  const projects = state.get('projects')
  const collectProjects = state.get('collectProjects')
  const currentProjectRole = state.get('currentProjectRole')
  switch (type) {
    case LOAD_PROJECTS_SUCCESS:
      return state.set('projects', payload.projects)
    case LOAD_PROJECTS_FAILURE:
      return state
    case RELATION_ROLE_PROJECT_LOADED:
      return state.set('currentProjectRole', payload.result)
    case UPDATE_RELATION_ROLE_PROJECT_SUCCESS:
      return state.set('currentProjectRole', {
        ...currentProjectRole,
        permission: payload.result
      })
    case ADD_PROJECT_SUCCESS:
      if (projects) {
        projects.unshift(payload.result)
        return state.set('projects', projects.slice())
      } else {
        return state.set('projects', [payload.result])
      }
    case ADD_PROJECT_FAILURE:
      return state

    // case EDIT_PROJECT_SUCCESS:
    //   projects.splice(projects.findIndex((d) => d.id === payload.result.id), 1, payload.result)
    //   return state.set('projects', projects.slice())

    case DELETE_PROJECT_SUCCESS:
      if (projects) {
        return state.set('projects', projects.filter((d) => d.id !== payload.id))
        .set('collectProjects', collectProjects.filter((d) => d.id !== payload.id))
      }
      return state
    case LOAD_PROJECT_DETAIL:
      return state
        .set('currentProjectLoading', true)

    case LOAD_PROJECT_DETAIL_SUCCESS:
      return state
        .set('currentProjectLoading', false)
        .set('currentProject', payload.project)
    case KILL_PROJECT_DETAIL:
      return state
        .set('currentProject', false)
    case SEARCH_PROJECT_SUCCESS:
      return state
        .set('searchProject', payload.result)
    case GET_PROJECT_STAR_USER_SUCCESS:
      return state
        .set('starUserList', payload.result)
    case LOAD_COLLECT_PROJECTS:
      return state
    case LOAD_COLLECT_PROJECTS_SUCCESS:
      return state.set('collectProjects', payload.result)
    case LOAD_COLLECT_PROJECTS_FAILURE:
      return state
    case CLICK_COLLECT_PROJECT_SUCCESS:
      if (payload.result.formType === 'unCollect') {
        return state.set('collectProjects', collectProjects.filter((p) => p.id !== payload.result.project.id))
      } else {
        collectProjects.push(payload.result.project)
        return state.set('collectProjects', collectProjects.slice())
      }
    case LOAD_PROJECT_ROLES_SUCCESS:
      return state.set('projectRoles', payload.result)
    default:
      return state
  }
}

export default projectReducer
