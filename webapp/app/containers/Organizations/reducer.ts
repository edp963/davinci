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

import { IOrganizationState } from './types'
import { ActionTypes } from './constants'
import { ActionTypes as ProjectActionTypes } from 'containers/Projects/constants'

import { OrganizationActionType } from './actions'
import { ProjectActionType } from 'containers/Projects/actions'

export const initialState: IOrganizationState = {
  organizations: [],
  currentOrganization: null,
  currentOrganizationLoading: false,
  currentOrganizationProjects: [],
  currentOrganizationProjectsDetail: null,
  currentOrganizationMembers: null,
  currentOrganizationRole: null,
  inviteMemberLists: null,
  roleModalLoading: false,
  projectDetail: null,
  projectAdmins: null,
  projectRoles: null,
  inviteMemberfetching: false
}

const organizationReducer = (
  state = initialState,
  action: OrganizationActionType | ProjectActionType
) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.DELETE_ORGANIZATION_MEMBER_SUCCESS:
        if (draft.currentOrganizationMembers) {
          draft.currentOrganizationMembers = draft.currentOrganizationMembers.filter(
            (d) => d.id !== action.payload.id
          )
        }
        break

      case ActionTypes.LOAD_ORGANIZATIONS_PROJECTS_SUCCESS:
        draft.currentOrganizationProjects = action.payload.projects.list
        draft.currentOrganizationProjectsDetail = action.payload.projects
        break

      case ActionTypes.LOAD_ORGANIZATIONS_MEMBERS_SUCCESS:
        draft.currentOrganizationMembers = action.payload.members.map((member) => {
          return {
            ...member,
            roles: 'loading'
          }
        })
        break
      case ActionTypes.GET_ROLELISTS_BY_MEMBERID_ERROR:
        const mId = action.payload.memberId
        if (draft.currentOrganizationMembers) {
          draft.currentOrganizationMembers = draft.currentOrganizationMembers.map(
            (member) => member.user.id === mId ? {...member, roles: undefined} : member
          )
        }
        break
      case ActionTypes.GET_ROLELISTS_BY_MEMBERID_SUCCESS:
        const { result, memberId} = action.payload
        if (draft.currentOrganizationMembers) {
          draft.currentOrganizationMembers = draft.currentOrganizationMembers.map(
            (member) => member.user.id === memberId ? {...member, roles: result} : member
          )
        }
        break
      case ActionTypes.LOAD_ORGANIZATIONS_ROLE_SUCCESS:
        draft.currentOrganizationRole = action.payload.role
        break

      case ActionTypes.LOAD_ORGANIZATIONS_SUCCESS:
        draft.organizations = action.payload.organizations
        break

      case ProjectActionTypes.ADD_PROJECT_SUCCESS:
        if (draft.currentOrganizationProjects) {
          draft.currentOrganizationProjects.unshift(action.payload.result)
        } else {
          draft.currentOrganizationProjects = [action.payload.result]
        }
        break

      case ProjectActionTypes.DELETE_PROJECT_SUCCESS:
        if (draft.currentOrganizationProjects) {
          draft.currentOrganizationProjects = draft.currentOrganizationProjects.filter(
            (d) => d.id !== action.payload.id
          )
        }
        break

      case ActionTypes.LOAD_ORGANIZATIONS_FAILURE:
        break

      case ActionTypes.ADD_ORGANIZATION_SUCCESS:
        if (draft.organizations) {
          draft.organizations.unshift(action.payload.result)
        } else {
          draft.organizations = [action.payload.result]
        }
        break

      case ActionTypes.ADD_ORGANIZATION_FAILURE:
        break

      case ActionTypes.EDIT_ORGANIZATION_SUCCESS:
        draft.organizations.splice(
          draft.organizations.findIndex(
            (d) => d.id === action.payload.result.id
          ),
          1,
          action.payload.result
        )
        break

      case ActionTypes.DELETE_ORGANIZATION_SUCCESS:
        draft.organizations = draft.organizations.filter(
          (d) => d.id !== action.payload.id
        )
        break

      case ActionTypes.LOAD_ORGANIZATION_DETAIL:
        draft.currentOrganizationLoading = true
        break

      case ActionTypes.LOAD_ORGANIZATION_DETAIL_SUCCESS:
        draft.currentOrganizationLoading = false
        draft.currentOrganization = action.payload.organization
        break

      case ActionTypes.LOAD_ORGANIZATION_DETAIL_FAILURE:
        break

      case ActionTypes.ADD_ROLE:
        draft.roleModalLoading = true
        break

      case ActionTypes.ADD_ROLE_SUCCESS:
        draft.roleModalLoading = false
        break

      case ActionTypes.ADD_ROLE_FAILURE:
        draft.roleModalLoading = false
        break
      case ActionTypes.SEARCH_MEMBER:
        draft.inviteMemberfetching = true
        break
      case ActionTypes.SEARCH_MEMBER_SUCCESS:
        draft.inviteMemberLists = action.payload.result
        draft.inviteMemberfetching = false
        break

      case ActionTypes.SEARCH_MEMBER_FAILURE:
        draft.inviteMemberfetching = true
        break

      case ActionTypes.SET_CURRENT_ORIGANIZATION_PROJECT:
        draft.projectDetail = action.payload.option
        break

      case ActionTypes.LOAD_PROJECT_ADMINS_SUCCESS:
        draft.projectAdmins = action.payload.result
        break

      case ActionTypes.LOAD_PROJECT_ROLES_SUCCESS:
        draft.projectRoles = action.payload.result
        break
    }
  })

export default organizationReducer
