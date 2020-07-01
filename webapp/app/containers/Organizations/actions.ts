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

export const OrganizationActions = {
  loadOrganizationProjects (param) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS,
      payload: {
        param
      }
    }
  },

  organizationsProjectsLoaded (projects) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS_SUCCESS,
      payload: {
        projects
      }
    }
  },

  loadOrganizationsProjectsFail () {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS_FAILURE
    }
  },

  loadOrganizationMembers (id) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS,
      payload: {
        id
      }
    }
  }
  ,

  organizationsMembersLoaded (members) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS_SUCCESS,
      payload: {
        members
      }
    }
  },

  loadOrganizationsMembersFail () {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS_FAILURE
    }
  },

  loadOrganizationRole (id) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_ROLE,
      payload: {
        id
      }
    }
  },

  organizationsRoleLoaded (role) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_ROLE_SUCCESS,
      payload: {
        role
      }
    }
  },

  loadOrganizationsRoleFail () {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_ROLE_FAILURE,
      payload: {}
    }
  },

  loadOrganizations () {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS
    }
  },

  organizationsLoaded (organizations) {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_SUCCESS,
      payload: {
        organizations
      }
    }
  },

  loadOrganizationsFail () {
    return {
      type: ActionTypes.LOAD_ORGANIZATIONS_FAILURE,
      payload: {}
    }
  },

  addOrganization (organization, resolve) {
    return {
      type: ActionTypes.ADD_ORGANIZATION,
      payload: {
        organization,
        resolve
      }
    }
  },

  organizationAdded (result) {
    return {
      type: ActionTypes.ADD_ORGANIZATION_SUCCESS,
      payload: {
        result
      }
    }
  },

  addOrganizationFail () {
    return {
      type: ActionTypes.ADD_ORGANIZATION_FAILURE,
      payload: {}
    }
  },

  editOrganization (organization) {
    return {
      type: ActionTypes.EDIT_ORGANIZATION,
      payload: {
        organization
      }
    }
  },

  organizationEdited (result) {
    return {
      type: ActionTypes.EDIT_ORGANIZATION_SUCCESS,
      payload: {
        result
      }
    }
  },

  editOrganizationFail () {
    return {
      type: ActionTypes.EDIT_ORGANIZATION_FAILURE,
      payload: {}
    }
  },

  deleteOrganization (id, resolve) {
    return {
      type: ActionTypes.DELETE_ORGANIZATION,
      payload: {
        id,
        resolve
      }
    }
  },

  organizationDeleted (id) {
    return {
      type: ActionTypes.DELETE_ORGANIZATION_SUCCESS,
      payload: {
        id
      }
    }
  },

  deleteOrganizationFail () {
    return {
      type: ActionTypes.DELETE_ORGANIZATION_FAILURE,
      payload: {}
    }
  },

  loadOrganizationDetail (id) {
    return {
      type: ActionTypes.LOAD_ORGANIZATION_DETAIL,
      payload: {
        id
      }
    }
  },

  organizationDetailLoaded (organization) {
    return {
      type: ActionTypes.LOAD_ORGANIZATION_DETAIL_SUCCESS,
      payload: {
        organization
      }
    }
  },

  loadOrganizationDetailFail (organization, widgets) {
    return {
      type: ActionTypes.LOAD_ORGANIZATION_DETAIL_FAILURE,
      payload: {
        organization,
        widgets
      }
    }
  },

  addRole (name, description, id, resolve) {
    return {
      type: ActionTypes.ADD_ROLE,
      payload: {
        name,
        description,
        id,
        resolve
      }
    }
  },

  roleAdded (result) {
    return {
      type: ActionTypes.ADD_ROLE_SUCCESS,
      payload: {
        result
      }
    }
  },

  addRoleFail () {
    return {
      type: ActionTypes.ADD_ROLE_FAILURE,
      payload: {}
    }
  },

  deleteRole (id, resolve) {
    return {
      type: ActionTypes.DELETE_ROLE,
      payload: {
        id,
        resolve
      }
    }
  },

  roleDeleted (result) {
    return {
      type: ActionTypes.DELETE_ROLE_SUCCESS,
      payload: {
        result
      }
    }
  },

  deleteRoleFail () {
    return {
      type: ActionTypes.DELETE_ROLE_FAILURE,
      payload: {}
    }
  },

  editRole (name, description, id, resolve) {
    return {
      type: ActionTypes.EDIT_ROLE,
      payload: {
        name, description, id, resolve
      }
    }
  },

  roleEdited (result) {
    return {
      type: ActionTypes.EDIT_ROLE_SUCCESS,
      payload: {
        result
      }
    }
  },

  editRoleFail () {
    return {
      type: ActionTypes.EDIT_ROLE_FAILURE,
      payload: {}
    }
  },

  searchMember (keyword) {
    return {
      type: ActionTypes.SEARCH_MEMBER,
      payload: {
        keyword
      }
    }
  },

  memberSearched (result) {
    return {
      type: ActionTypes.SEARCH_MEMBER_SUCCESS,
      payload: {
        result
      }
    }
  },

  searchMemberFail () {
    return {
      type: ActionTypes.SEARCH_MEMBER_FAILURE,
      payload: {}
    }
  },

  inviteMember (orgId, members, needEmail, resolve) {
    return {
      type: ActionTypes.INVITE_MEMBER,
      payload: {
        orgId,
        members,
        needEmail,
        resolve
      }
    }
  },

  inviteMemberSuccess (result) {
    return {
      type: ActionTypes.INVITE_MEMBER_SUCCESS,
      payload: {
        result
      }
    }
  },

  inviteMemberFail () {
    return {
      type: ActionTypes.INVITE_MEMBER_FAILURE,
      payload: {}
    }
  }
  ,

  deleteOrganizationMember (relationId, resolve) {
    return {
      type: ActionTypes.DELETE_ORGANIZATION_MEMBER,
      payload: {
        relationId,
        resolve
      }
    }
  },

  organizationMemberDeleted (id) {
    return {
      type: ActionTypes.DELETE_ORGANIZATION_MEMBER_SUCCESS,
      payload: {
        id
      }
    }
  },

  deleteOrganizationMemberFail () {
    return {
      type: ActionTypes.DELETE_ORGANIZATION_MEMBER_ERROR,
      payload: {}
    }
  },

  changeOrganizationMemberRole (relationId, newRole, resolve) {
    return {
      type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION,
      payload: {
        relationId,
        newRole,
        resolve
      }
    }
  },

  organizationMemberRoleChanged (relationId, newRole) {
    return {
      type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION_SUCCESS,
      payload: {
        relationId,
        newRole
      }
    }
  },

  changeOrganizationMemberRoleFail () {
    return {
      type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION_ERROR,
      payload: {}
    }
  },

  relRoleMember (id, memberIds, resolve) {
    return {
      type: ActionTypes.REL_ROLE_MEMBER,
      payload: {
        id,
        memberIds,
        resolve
      }
    }
  },

  relRoleMemberSuccess () {
    return {
      type: ActionTypes.REL_ROLE_MEMBER_SUCCESS,
      payload: {}
    }
  },

  relRoleMemberFail () {
    return {
      type: ActionTypes.REL_ROLE_MEMBER_FAILURE,
      payload: {}
    }
  },

  getRelRoleMember (id, resolve) {
    return {
      type: ActionTypes.GET_REL_ROLE_MEMBER,
      payload: {
        id,
        resolve
      }
    }
  },

  getRelRoleMemberSuccess () {
    return {
      type: ActionTypes.GET_REL_ROLE_MEMBER_SUCCESS,
      payload: {}
    }
  },

  getRelRoleMemberFail () {
    return {
      type: ActionTypes.GET_REL_ROLE_MEMBER_FAILURE,
      payload: {}
    }
  },

  setCurrentProject (option) {
    return {
      type: ActionTypes.SET_CURRENT_ORIGANIZATION_PROJECT,
      payload: {
        option
      }
    }
  },

  loadProjectAdmin (projectId) {
    return {
      type: ActionTypes.LOAD_PROJECT_ADMINS,
      payload: {
        projectId
      }
    }
  },

  projectAdminLoaded (result) {
    return {
      type: ActionTypes.LOAD_PROJECT_ADMINS_SUCCESS,
      payload: {
        result
      }
    }
  },

  loadProjectAdminFail () {
    return {
      type: ActionTypes.LOAD_PROJECT_ADMINS_FAIL,
      payload: {}
    }
  }
  ,

  loadProjectRoles (projectId) {
    return {
      type: ActionTypes.LOAD_PROJECT_ROLES,
      payload: {
        projectId
      }
    }
  },

  projectRolesLoaded (result) {
    return {
      type: ActionTypes.LOAD_PROJECT_ROLES_SUCCESS,
      payload: {
        result
      }
    }
  },

  loadProjectRolesFail () {
    return {
      type: ActionTypes.LOAD_PROJECT_ROLES_FAIL,
      payload: {}
    }
  },

  getVizVisbility (roleId, projectId, resolve) {
    return {
      type: ActionTypes.GET_VIZ_VISBILITY,
      payload: {
        roleId, projectId, resolve
      }
    }
  },

  postVizVisbility (id, permission, resolve) {
    return {
      type: ActionTypes.POST_VIZ_VISBILITY,
      payload: {
        id,
        resolve,
        permission
      }
    }
  },

  getRoleListByMemberId (orgId: number, memberId: number, resolve: (res: any) => void) {
    return {
      type: ActionTypes.GET_ROLELISTS_BY_MEMBERID,
      payload: {
        orgId,
        memberId,
        resolve
      }
    }
  },
  getRoleListByMemberIdSuccess (result, memberId: number) {
    return {
      type: ActionTypes.GET_ROLELISTS_BY_MEMBERID_SUCCESS,
      payload: {
        result,
        memberId
      }
    }
  },
  getRoleListByMemberIdFail (error, memberId: number) {
    return {
      type: ActionTypes.GET_ROLELISTS_BY_MEMBERID_ERROR,
      payload: {
        error,
        memberId
      }
    }
  }
}

const mockAction = returnType(OrganizationActions)
export type OrganizationActionType = typeof mockAction

export default OrganizationActions
