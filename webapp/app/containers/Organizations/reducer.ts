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
  LOAD_ORGANIZATIONS_SUCCESS,
  LOAD_ORGANIZATIONS_FAILURE,
  ADD_ORGANIZATION_SUCCESS,
  ADD_ORGANIZATION_FAILURE,
  EDIT_ORGANIZATION_SUCCESS,
  DELETE_ORGANIZATION_SUCCESS,
  LOAD_ORGANIZATION_DETAIL,
  LOAD_ORGANIZATION_DETAIL_SUCCESS,
  LOAD_ORGANIZATION_DETAIL_FAILURE,
  LOAD_ORGANIZATIONS_PROJECTS_SUCCESS,
  LOAD_ORGANIZATIONS_MEMBERS_SUCCESS,
  SEARCH_MEMBER_SUCCESS,
  DELETE_ORGANIZATION_MEMBER_SUCCESS,
  LOAD_ORGANIZATIONS_ROLE,
  LOAD_ORGANIZATIONS_ROLE_SUCCESS,
  LOAD_ORGANIZATIONS_ROLE_FAILURE,
  ADD_ROLE,
  ADD_ROLE_SUCCESS,
  ADD_ROLE_FAILURE,
  SET_CURRENT_ORIGANIZATION_PROJECT,
  LOAD_PROJECT_ADMINS_SUCCESS,
  LOAD_PROJECT_ADMINS_FAIL,
  LOAD_PROJECT_ROLES_SUCCESS
} from './constants'
import {ADD_PROJECT_SUCCESS, DELETE_PROJECT_SUCCESS} from '../Projects/constants'


const initialState = fromJS({
  organizations: [],
  currentOrganization: {},
  currentOrganizationLoading: false,
  currentOrganizationProjects: [],
  currentOrganizationProjectsDetail: false,
  currentOrganizationMembers: null,
  currentOrganizationRoles: null,
  inviteMemberLists: null,
  roleModalLoading: false,
  projectDetail: false,
  projectAdmins: false,
  projectRoles: false
})

function organizationReducer (state = initialState, action) {
  const { type, payload } = action
  const organizations = state.get('organizations')
  const currentOrganizationMembers = state.get('currentOrganizationMembers')
  const currentOrganizationProjects = state.get('currentOrganizationProjects')
  switch (type) {
    case DELETE_ORGANIZATION_MEMBER_SUCCESS:
      if (currentOrganizationMembers) {
        return state.set('currentTeamMembers', currentOrganizationMembers.filter((d) => d.id !== payload.id))
      }
      return state
    // case CHANGE_MEMBER_ROLE_ORGANIZATION_SUCCESS:
    //   return state
      // currentOrganizationMembers.splice(currentOrganizationMembers.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      // return state.set('currentTeamMembers', currentOrganizationMembers.slice())
    case LOAD_ORGANIZATIONS_PROJECTS_SUCCESS:
      return state.set('currentOrganizationProjects', payload.projects.list)
        .set('currentOrganizationProjectsDetail', payload.projects)
    case LOAD_ORGANIZATIONS_MEMBERS_SUCCESS:
      return state.set('currentOrganizationMembers', payload.members)
    case LOAD_ORGANIZATIONS_ROLE_SUCCESS:
      return state.set('currentOrganizationRole', payload.role)
    case LOAD_ORGANIZATIONS_SUCCESS:
      return state.set('organizations', payload.organizations)
    case ADD_PROJECT_SUCCESS:
      if (currentOrganizationProjects) {
        currentOrganizationProjects.unshift(payload.result)
        return state.set('currentOrganizationProjects', currentOrganizationProjects.slice())
      } else {
        return state.set('currentOrganizationProjects', [payload.result])
      }
    case DELETE_PROJECT_SUCCESS:
      if (currentOrganizationProjects) {
        return state.set('currentOrganizationProjects', currentOrganizationProjects.filter((d) => d.id !== payload.id))
      }
      return state
    case LOAD_ORGANIZATIONS_FAILURE:
      return state
    case ADD_ORGANIZATION_SUCCESS:
      if (organizations) {
        organizations.unshift(payload.result)
        return state.set('organizations', organizations.slice())
      } else {
        return state.set('organizations', [payload.result])
      }
    case ADD_ORGANIZATION_FAILURE:
      return state
    case EDIT_ORGANIZATION_SUCCESS:
      organizations.splice(organizations.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      return state.set('organizations', organizations.slice())

    case DELETE_ORGANIZATION_SUCCESS:
      return state.set('organizations', organizations.filter((d) => d.id !== payload.id))

    case LOAD_ORGANIZATION_DETAIL:
      return state.set('currentOrganizationLoading', true)

    case LOAD_ORGANIZATION_DETAIL_SUCCESS:
      return state
        .set('currentOrganizationLoading', false)
        .set('currentOrganization', payload.organization)
    case LOAD_ORGANIZATION_DETAIL_FAILURE:
      return state
    case ADD_ROLE:
      return state.set('roleModalLoading', true)
    case ADD_ROLE_SUCCESS:
      return state.set('roleModalLoading', false)
    case ADD_ROLE_FAILURE:
      return state.set('roleModalLoading', false)
    case SEARCH_MEMBER_SUCCESS:
      return state.set('inviteMemberLists', payload.result)
    case SET_CURRENT_ORIGANIZATION_PROJECT:
      return state.set('projectDetail', payload.option)
    case LOAD_PROJECT_ADMINS_SUCCESS:
      return state.set('projectAdmins', payload.result)
    case LOAD_PROJECT_ROLES_SUCCESS:
      return state.set('projectRoles', payload.result)
    default:
      return state
  }
}

export default organizationReducer
