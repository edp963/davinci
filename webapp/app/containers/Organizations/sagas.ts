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

import { call, put, all, takeLatest, takeEvery } from 'redux-saga/effects'
import { ActionTypes } from './constants'

import { OrganizationActions, OrganizationActionType } from './actions'

import { message } from 'antd'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getOrganizations () {
  try {
    const asyncData = yield call(request, api.organizations)
    const organizations = asyncData.payload
    yield put(OrganizationActions.organizationsLoaded(organizations))
  } catch (err) {
    yield put(OrganizationActions.loadOrganizationsFail())
    errorHandler(err)
  }
}

export function* addOrganization (action: OrganizationActionType) {
  if (action.type !== ActionTypes.ADD_ORGANIZATION) { return }

  const { organization, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.organizations,
      data: organization
    })
    const result = asyncData.payload
    yield put(OrganizationActions.organizationAdded(result))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.addOrganizationFail())
    errorHandler(err)
  }
}

export function* editOrganization (action: OrganizationActionType) {
  if (action.type !== ActionTypes.EDIT_ORGANIZATION) { return }

  const { organization } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.organizations}/${organization.id}`,
      data: organization
    })
    yield put(OrganizationActions.organizationEdited(organization))
    message.success('success')
  } catch (err) {
    yield put(OrganizationActions.editOrganizationFail())
    errorHandler(err)
  }
}

export function* deleteOrganization (action: OrganizationActionType) {
  if (action.type !== ActionTypes.DELETE_ORGANIZATION) { return }

  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.organizations}/${id}`
    })
    yield put(OrganizationActions.organizationDeleted(id))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.deleteOrganizationFail())
    errorHandler(err)
  }
}

export function* getOrganizationDetail (action: OrganizationActionType) {
  if (action.type !== ActionTypes.LOAD_ORGANIZATION_DETAIL) { return }

  try {
    const asyncData = yield call(request, `${api.organizations}/${action.payload.id}`)
    const organization = asyncData.payload
    yield put(OrganizationActions.organizationDetailLoaded(organization))
  } catch (err) {
    errorHandler(err)
  }
}

export function* getOrganizationsProjects (action: OrganizationActionType) {
  if (action.type !== ActionTypes.LOAD_ORGANIZATIONS_PROJECTS) { return }

  const { param: { id, keyword, pageNum, pageSize } } = action.payload
  const requestUrl = keyword
    ? `${api.organizations}/${id}/projects?keyword=${keyword}&pageNum=1&pageSize=${pageSize || 10}`
    : `${api.organizations}/${id}/projects/?pageNum=${pageNum || 1}&pageSize=${pageSize || 10}`
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: requestUrl
    })
    const organizations = asyncData.payload
    yield put(OrganizationActions.organizationsProjectsLoaded(organizations))
  } catch (err) {
    yield put(OrganizationActions.loadOrganizationsProjectsFail())
    errorHandler(err)
  }
}

export function* getOrganizationsMembers (action: OrganizationActionType) {
  if (action.type !== ActionTypes.LOAD_ORGANIZATIONS_MEMBERS) { return }

  const { id } = action.payload
  try {
    const asyncData = yield call(request, `${api.organizations}/${id}/members`)
    yield put(OrganizationActions.organizationsMembersLoaded(asyncData.payload))
  } catch (err) {
    yield put(OrganizationActions.loadOrganizationsMembersFail())
    errorHandler(err)
  }
}

export function* getOrganizationsRole (action: OrganizationActionType) {
  if (action.type !== ActionTypes.LOAD_ORGANIZATIONS_ROLE) { return }

  const { id } = action.payload
  try {
    const asyncData = yield call(request, `${api.organizations}/${id}/roles`)
    const organizations = asyncData.payload
    yield put(OrganizationActions.organizationsRoleLoaded(organizations))
  } catch (err) {
    yield put(OrganizationActions.loadOrganizationsRoleFail())
    errorHandler(err)
  }
}

export function* addRole (action: OrganizationActionType) {
  if (action.type !== ActionTypes.ADD_ROLE) { return }

  const { name, description, id, resolve } = action.payload
  try {
    const role = { name, description, orgId: id }
    const asyncData = yield call(request, {
      method: 'post',
      url: api.roles,
      data: role
    })
    const result = asyncData.payload
    yield put(OrganizationActions.roleAdded(result))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.addRoleFail())
    errorHandler(err)
  }
}

export function* deleteRole (action: OrganizationActionType) {
  if (action.type !== ActionTypes.DELETE_ROLE) { return }

  const { id, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'delete',
      url: `${api.roles}/${id}`
    })
    const result = asyncData.payload
    yield put(OrganizationActions.roleDeleted(result))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.deleteRoleFail())
    errorHandler(err)
  }
}

export function* editRole (action: OrganizationActionType) {
  if (action.type !== ActionTypes.EDIT_ROLE) { return }

  const { name, description, id, resolve } = action.payload
  try {
    const role = {name, description}
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.roles}/${id}`,
      data: role
    })
    const result = asyncData.payload
    yield put(OrganizationActions.roleEdited(result))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.editRoleFail())
    errorHandler(err)
  }
}

export function* relRoleMember (action: OrganizationActionType) {
  if (action.type !== ActionTypes.REL_ROLE_MEMBER) { return }

  const { id, memberIds, resolve } = action.payload
  try {
    yield call(request, {
      method: 'post',
      url: `${api.roles}/${id}/members`,
      data: memberIds
    })
    yield put(OrganizationActions.relRoleMemberSuccess())
    resolve()
  } catch (err) {
    yield put(OrganizationActions.relRoleMemberFail())
    errorHandler(err)
  }
}

export function* getRelRoleMember (action: OrganizationActionType) {
  if (action.type !== ActionTypes.GET_REL_ROLE_MEMBER) { return }

  const { id, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.roles}/${id}/members`
    })
    const result = asyncData.payload
    yield put(OrganizationActions.getRelRoleMemberSuccess())
    resolve(result)
  } catch (err) {
    yield put(OrganizationActions.getRelRoleMemberFail())
    errorHandler(err)
  }
}

export function* searchMember (action: OrganizationActionType) {
  if (action.type !== ActionTypes.SEARCH_MEMBER) { return }

  const { keyword } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.user}?keyword=${keyword}`
    })

    const result = asyncData.payload
    yield put(OrganizationActions.memberSearched(result))
  } catch (err) {
    yield put(OrganizationActions.searchMemberFail())
    errorHandler(err)
  }
}

export function* inviteMember (action: OrganizationActionType) {
  if (action.type !== ActionTypes.INVITE_MEMBER) { return }

  const { orgId, memId } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.organizations}/${orgId}/member/${memId}`,
      data: {
        orgId,
        memId
      }
    })
    const result = asyncData.payload
    yield put(OrganizationActions.inviteMemberSuccess(result))
  } catch (err) {
    yield put(OrganizationActions.inviteMemberFail())
    errorHandler(err)
  }
}

export function* deleteOrganizationMember (action: OrganizationActionType) {
  if (action.type !== ActionTypes.DELETE_ORGANIZATION_MEMBER) { return }

  const { relationId, resolve } = action.payload
  try {
    yield call(request, {
      url: `${api.organizations}/member/${relationId}`,
      method: 'delete'
    })
    yield put(OrganizationActions.organizationMemberDeleted(relationId))
    resolve()
  } catch (err) {
    yield put(OrganizationActions.deleteOrganizationMemberFail())
    errorHandler(err)
  }
}

export function* changeOrganizationMemberRole (action: OrganizationActionType) {
  if (action.type !== ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION) { return }

  const { relationId, newRole, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      url: `${api.organizations}/member/${relationId}`,
      method: 'put',
      data: {role: newRole}
    })
    const member = asyncData.payload
    yield put(OrganizationActions.organizationMemberRoleChanged(relationId, member))
    yield resolve()
  } catch (err) {
    yield put(OrganizationActions.changeOrganizationMemberRoleFail())
    errorHandler(err)
  }
}

export function* getProjectAdmins (action: OrganizationActionType) {
  if (action.type !== ActionTypes.LOAD_PROJECT_ADMINS) { return }

  const { projectId } = action.payload
  try {
    const asyncData = yield call(request, `${api.projects}/${projectId}/admins`)
    const results = asyncData.payload
    yield put(OrganizationActions.projectAdminLoaded(results))
  } catch (err) {
    yield put(OrganizationActions.loadProjectAdminFail())
    errorHandler(err)
  }
}

export function* getVizVisbility (action: OrganizationActionType) {
  if (action.type !== ActionTypes.GET_VIZ_VISBILITY) { return }

  const { roleId, projectId, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.roles}/${roleId}/project/${projectId}/viz/visibility`
    })
    const results = asyncData.payload
    resolve(results)
  } catch (err) {
    errorHandler(err)
  }
}

export function* postVizVisbility (action: OrganizationActionType) {
  if (action.type !== ActionTypes.POST_VIZ_VISBILITY) { return }

  const { id, permission, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      url: `${api.roles}/${id}/viz/visibility`,
      method: 'post',
      data: permission
    })
    const result = asyncData.payload
    yield resolve(result)
  } catch (err) {
    errorHandler(err)
  }
}


export default function* rootOrganizationSaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_ORGANIZATIONS, getOrganizations),
    takeEvery(ActionTypes.ADD_ORGANIZATION, addOrganization),
    takeEvery(ActionTypes.EDIT_ORGANIZATION, editOrganization),
    takeEvery(ActionTypes.DELETE_ORGANIZATION, deleteOrganization),
    takeLatest(ActionTypes.LOAD_ORGANIZATION_DETAIL, getOrganizationDetail),
    takeLatest(ActionTypes.LOAD_ORGANIZATIONS_MEMBERS, getOrganizationsMembers),
    takeLatest(ActionTypes.LOAD_ORGANIZATIONS_PROJECTS, getOrganizationsProjects),
    takeLatest(ActionTypes.LOAD_ORGANIZATIONS_ROLE, getOrganizationsRole),
    takeEvery(ActionTypes.ADD_ROLE, addRole),
    takeEvery(ActionTypes.DELETE_ROLE, deleteRole),
    takeEvery(ActionTypes.EDIT_ROLE, editRole),
    takeEvery(ActionTypes.REL_ROLE_MEMBER, relRoleMember),
    takeEvery(ActionTypes.GET_REL_ROLE_MEMBER, getRelRoleMember),
    // takeEvery(ActionTypes.LOAD_PROJECT_ROLES, getProjectRoles),
    takeLatest(ActionTypes.LOAD_PROJECT_ADMINS, getProjectAdmins),
    takeLatest(ActionTypes.INVITE_MEMBER, inviteMember),
    takeLatest(ActionTypes.SEARCH_MEMBER, searchMember),
    takeLatest(ActionTypes.DELETE_ORGANIZATION_MEMBER, deleteOrganizationMember),
    takeLatest(ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION, changeOrganizationMemberRole),
    takeLatest(ActionTypes.GET_VIZ_VISBILITY, getVizVisbility),
    takeLatest(ActionTypes.POST_VIZ_VISBILITY, postVizVisbility)
  ])
}
