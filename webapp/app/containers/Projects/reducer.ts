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

import produce from 'immer'

import { IProjectState } from './types'
import { ActionTypes } from './constants'
import { ProjectActionType } from './actions'

import { ActionTypes as OrganizationActionTypes } from 'containers/Organizations/constants'
import { OrganizationActionType } from 'containers/Organizations/actions'

export const initialState: IProjectState = {
  projects: null,
  currentProject: null,
  currentProjectLoading: false,
  searchProject: false,
  starUserList: null,
  collectProjects: null,
  currentProjectRole: null,
  projectRoles: null
}

const projectReducer = (
  state = initialState,
  action: ProjectActionType | OrganizationActionType
) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_PROJECTS_SUCCESS:
        draft.projects = action.payload.projects
        break

      case ActionTypes.LOAD_PROJECTS_FAILURE:
        break

      case ActionTypes.RELATION_ROLE_PROJECT_LOADED:
        draft.currentProjectRole = action.payload.result
        break

      case ActionTypes.UPDATE_RELATION_ROLE_PROJECT_SUCCESS:
        draft.currentProjectRole.permission = action.payload.result
        break

      case ActionTypes.ADD_PROJECT_SUCCESS:
        if (draft.projects) {
          draft.projects.unshift(action.payload.result)
        } else {
          draft.projects = [action.payload.result]
        }
        break

      case ActionTypes.ADD_PROJECT_FAILURE:
        break

      // case ActionTypes.EDIT_PROJECT_SUCCESS:
      //   projects.splice(projects.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      //   return state.set('projects', projects.slice())

      case ActionTypes.DELETE_PROJECT_SUCCESS:
        if (draft.projects) {
          draft.projects = draft.projects.filter(
            (d) => d.id !== action.payload.id
          )
          draft.collectProjects = draft.collectProjects.filter(
            (d) => d.id !== action.payload.id
          )
        }
        break

      case ActionTypes.LOAD_PROJECT_DETAIL:
        draft.currentProjectLoading = true
        break

      case ActionTypes.LOAD_PROJECT_DETAIL_SUCCESS:
        draft.currentProjectLoading = false
        draft.currentProject = action.payload.project
        break

      case ActionTypes.CLEAR_CURRENT_PROJECT:
        draft.currentProject = null
        break

      case ActionTypes.SEARCH_PROJECT_SUCCESS:
        draft.searchProject = action.payload.result
        break

      case ActionTypes.GET_PROJECT_STAR_USER_SUCCESS:
        draft.starUserList = action.payload.result
        break

      case ActionTypes.LOAD_COLLECT_PROJECTS:
        break

      case ActionTypes.LOAD_COLLECT_PROJECTS_SUCCESS:
        draft.collectProjects = action.payload.result
        break

      case ActionTypes.LOAD_COLLECT_PROJECTS_FAILURE:
        break

      case ActionTypes.CLICK_COLLECT_PROJECT_SUCCESS:
        if (action.payload.result.formType === 'unCollect') {
          draft.collectProjects = draft.collectProjects.filter(
            (p) => p.id !== action.payload.result.project.id
          )
        } else {
          draft.collectProjects.push(action.payload.result.project)
        }
        break

      case OrganizationActionTypes.LOAD_PROJECT_ROLES_SUCCESS:
        draft.projectRoles = action.payload.result
        break
    }
  })

export default projectReducer
