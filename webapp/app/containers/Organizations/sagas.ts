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

import { takeLatest, takeEvery, throttle } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import {
  LOAD_ORGANIZATIONS,
  ADD_ORGANIZATION,
  EDIT_ORGANIZATION,
  DELETE_ORGANIZATION,
  LOAD_ORGANIZATION_DETAIL,
  LOAD_ORGANIZATIONS_TEAMS,
  LOAD_ORGANIZATIONS_PROJECTS,
  LOAD_ORGANIZATIONS_MEMBERS,
  ADD_TEAM,
  SEARCH_MEMBER,
  INVITE_MEMBER,
  DELETE_ORGANIZATION_MEMBER,
  CHANGE_MEMBER_ROLE_ORGANIZATION
} from './constants'

import {
  organizationsLoaded,
  loadOrganizationsFail,
  organizationAdded,
  addOrganizationFail,
  organizationEdited,
  editOrganizationFail,
  organizationDeleted,
  deleteOrganizationFail,
  organizationDetailLoaded,
  organizationsMembersLoaded,
  organizationsProjectsLoaded,
  organizationsTeamsLoaded,
  loadOrganizationsProjectsFail,
  loadOrganizationsMembersFail,
  loadOrganizationsTeamsFail,
  addTeamFail,
  teamAdded,
  inviteMemberSuccess,
  inviteMemberFail,
  memberSearched,
  searchMemberFail,
  organizationMemberDeleted,
  deleteOrganizationMemberFail,
  organizationMemberRoleChanged,
  changeOrganizationMemberRoleFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readListAdapter } from '../../utils/asyncAdapter'
import {userPasswordChanged} from '../App/actions'

export function* getOrganizations () {
  try {
    const asyncData = yield call(request, api.organizations)
    const organizations = readListAdapter(asyncData)
    yield put(organizationsLoaded(organizations))
  } catch (err) {
    yield put(loadOrganizationsFail())
    message.error('获取 Organizations 失败，请稍后再试')
  }
}

export function* addOrganization (action) {
  const { organization, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.organizations,
      data: organization
    })
    const result = readListAdapter(asyncData)
    yield put(organizationAdded(result))
    resolve()
  } catch (err) {
    yield put(addOrganizationFail())
    message.error('添加 Organization 失败，请稍后再试')
  }
}

export function* editOrganization (action) {
  const { organization } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.organizations}/${organization.id}`,
      data: organization
    })
    yield put(organizationEdited(organization))
  } catch (err) {
    yield put(editOrganizationFail())
    message.error('修改 Organization 失败，请稍后再试')
  }
}

export function* deleteOrganization (action) {
  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.organizations}/${id}`
    })
    yield put(organizationDeleted(id))
    resolve()
  } catch (err) {
    yield put(deleteOrganizationFail())
    message.error('删除当前 Organization 失败，请稍后再试')
  }
}

export function* getOrganizationDetail ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.organizations}/${payload.id}`)
    const organization = readListAdapter(asyncData)
    yield put(organizationDetailLoaded(organization))
  } catch (err) {
    console.log('getOrganizationDetail', err)
  }
}

export function* getOrganizationsProjects ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.organizations}/${id}/projects`)
    const organizations = readListAdapter(asyncData)
    yield put(organizationsProjectsLoaded(organizations.list))
  } catch (err) {
    yield put(loadOrganizationsProjectsFail())
    message.error('获取 Organizations 失败，请稍后再试')
  }
}

export function* getOrganizationsMembers ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.organizations}/${id}/members`)
    const organizations = readListAdapter(asyncData)
    yield put(organizationsMembersLoaded(organizations))
  } catch (err) {
    yield put(loadOrganizationsMembersFail())
    message.error('获取 Organizations 失败，请稍后再试')
  }
}

export function* getOrganizationsTeams ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.organizations}/${id}/teams`)
    const organizations = readListAdapter(asyncData)
    yield put(organizationsTeamsLoaded(organizations))
  } catch (err) {
    yield put(loadOrganizationsTeamsFail())
    message.error('获取 Organizations 失败，请稍后再试')
  }
}

export function* addTeam (action) {
  const { team, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.teams,
      data: team
      // data: writeAdapter(project)
    })
    const result = readListAdapter(asyncData)
    yield put(teamAdded(result))
    resolve()
  } catch (err) {
    yield put(addTeamFail())
    message.error('添加 Team 失败，请稍后再试')
  }
}

export function* searchMember ({payload}) {
  const {keyword} = payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.user}?keyword=${keyword}`
    })
    const msg = asyncData && asyncData.header && asyncData.header.msg ? asyncData.header.msg : ''
    const code = asyncData && asyncData.header && asyncData.header.code ? asyncData.header.code : ''
    if (code && code === 400) {
      message.error(msg)
    }
    if (code && code === 200) {
      const result = readListAdapter(asyncData)
      yield put(memberSearched(result))
    }
  } catch (err) {
    yield put(searchMemberFail())
    message.error('查找用户失败， 请稍后再试')
  }
}

export function* inviteMember ({payload}) {
  const {orgId, memId} = payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.organizations}/${orgId}/member/${memId}`,
      data: {
        orgId,
        memId
      }
    })
    const result = readListAdapter(asyncData)
    yield put(inviteMemberSuccess(result))
  } catch (err) {
    yield put(inviteMemberFail())
    message.error('邀请用户失败， 请稍后再试')
  }
}

export function* deleteOrganizationMember ({payload}) {
  const {relationId, resolve} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.organizations}/member/${relationId}`,
      method: 'delete'
    })
    yield put(organizationMemberDeleted(relationId))
    resolve()
  } catch (err) {
    yield put(deleteOrganizationMemberFail())
    message.error('删除 team member 失败，请稍后再试')
  }
}

export function* changeOrganizationMemberRole ({payload}) {
  const {relationId, newRole, resolve} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.organizations}/member/${relationId}`,
      method: 'put',
      data: {role: newRole}
    })
    const member = readListAdapter(asyncData)
    yield put(organizationMemberRoleChanged(relationId, member))
    yield resolve()
  } catch (err) {
    console.log(err)
    yield put(changeOrganizationMemberRoleFail())
    message.error('删除 team member 失败，请稍后再试')
  }
}

export default function* rootOrganizationSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_ORGANIZATIONS, getOrganizations),
    takeEvery(ADD_ORGANIZATION, addOrganization),
    takeEvery(EDIT_ORGANIZATION, editOrganization),
    takeEvery(DELETE_ORGANIZATION, deleteOrganization),
    takeLatest(LOAD_ORGANIZATION_DETAIL, getOrganizationDetail as any),
    takeLatest(LOAD_ORGANIZATIONS_MEMBERS, getOrganizationsMembers as any),
    takeLatest(LOAD_ORGANIZATIONS_PROJECTS, getOrganizationsProjects as any),
    takeLatest(LOAD_ORGANIZATIONS_TEAMS, getOrganizationsTeams as any),
    takeEvery(ADD_TEAM, addTeam),
    takeLatest(INVITE_MEMBER, inviteMember as any),
    throttle(600, SEARCH_MEMBER, searchMember as any),
    takeLatest(DELETE_ORGANIZATION_MEMBER, deleteOrganizationMember as any),
    takeLatest(CHANGE_MEMBER_ROLE_ORGANIZATION, changeOrganizationMemberRole as any)
  ]
}
