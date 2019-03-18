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

import { takeLatest, takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import {
  LOAD_TEAMS,
  EDIT_TEAM,
  DELETE_TEAM,
  LOAD_TEAM_DETAIL,
  LOAD_TEAM_MEMBERS,
  LOAD_TEAM_PROJECTS,
  LOAD_TEAM_TEAMS,
  PULL_PROJECT_IN_TEAM,
  UPDATE_TEAM_PROJECT_PERMISSION,
  DELETE_TEAM_PROJECT,
  PULL_MEMBER_IN_TEAM,
  DELETE_TEAM_MEMBER,
  CHANGE_MEMBER_ROLE_TEAM
} from './constants'

import {
  teamsLoaded,
  teamEdited,
  loadTeamsFail,
  teamDeleted,
  editTeamFail,
  deleteTeamFail,
  teamDetailLoaded,
  teamProjectsLoaded,
  loadTeamProjectsFail,
  teamMembersLoaded,
  loadTeamMembersFail,
  teamTeamsLoaded,
  loadTeamTeamsFail,
  projectInTeamPulled,
  pullProjectInTeamFail,
  teamProjectPermissionUpdated,
  updateTeamProjectPermissionFail,
  teamProjectDeleted,
  deleteTeamProjectFail,
  memberInTeamPulled,
  pullMemberInTeamFail,
  teamMemberDeleted,
  deleteTeamMemberFail,
  changeTeamMemberRoleFail,
  teamMemberRoleChanged
} from './actions'

const message =  require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { errorHandler } from '../../utils/util'


export function* getTeams () {
  try {
    const asyncData = yield call(request, api.teams)
    const projects = asyncData.payload
    yield put(teamsLoaded(projects))
  } catch (err) {
    yield put(loadTeamsFail())
    errorHandler(err)
  }
}

export function* editTeam (action) {
  const { team, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.teams}/${team.id}`,
      data: team
    })
    yield put(teamEdited(team))
    if (resolve) {
      resolve()
    }
    message.success('success')
  } catch (err) {
    yield put(editTeamFail())
    errorHandler(err)
  }
}

export function* deleteTeam (action) {
  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.teams}/${id}`
    })
    yield put(teamDeleted(id))
    resolve()
  } catch (err) {
    yield put(deleteTeamFail())
    errorHandler(err)
  }
}

export function* getTeamDetail ({ payload }) {
  try {
    const asyncData = yield  call(request, `${api.teams}/${payload.id}`)
    const detail = asyncData.payload
    yield put(teamDetailLoaded(detail))
    yield payload.resolve && payload.resolve(detail)
  } catch (err) {
    errorHandler(err)
  }
}

export function* getTeamProjects ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/projects`)
    const projects = asyncData.payload
    yield put(teamProjectsLoaded(projects))
  } catch (err) {
    yield put(loadTeamProjectsFail())
    errorHandler(err)
  }
}

export function* getTeamMembers ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/members`)
    const members = asyncData.payload
    yield put(teamMembersLoaded(members))
  } catch (err) {
    yield put(loadTeamMembersFail())
    errorHandler(err)
  }
}

export function* getTeamTeams ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/teams`)
    const teams = asyncData.payload
    yield put(teamTeamsLoaded(teams))
  } catch (err) {
    yield put(loadTeamTeamsFail())
    errorHandler(err)
  }
}

export function* pullProjectInTeam ({payload}) {
  const { id, projectId, resolve } = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/${id}/project`,
      method: 'post',
      data: {projectId}
    })
    const projects = asyncData.payload
    yield put(projectInTeamPulled(projects))
    resolve()
  } catch (err) {
    yield put(pullProjectInTeamFail())
    errorHandler(err)
  }
}

export function* updateTeamProjectPermission ({payload}) {
  const {relationId, relTeamProjectDto, resolve} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/project/${relationId}`,
      method: 'put',
      data: relTeamProjectDto
    })
    const projects = asyncData.payload
    yield put(teamProjectPermissionUpdated(projects))
    if (resolve) {
      resolve(projects)
    }
  } catch (err) {
    yield put(updateTeamProjectPermissionFail())
    errorHandler(err)
  }
}

export function* deleteTeamProject ({payload}) {
  const {relationId} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/project/${relationId}`,
      method: 'delete'
    })
    yield put(teamProjectDeleted(relationId))
  } catch (err) {
    yield put(deleteTeamProjectFail())
    errorHandler(err)
  }
}

export function* pullMemberInTeam ({payload}) {
  const { teamId, memberId, resolve } = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/${teamId}/member/${memberId}`,
      method: 'post'
    })
    const members = asyncData.payload
    yield put(memberInTeamPulled(members))
    resolve()
  } catch (err) {
    yield put(pullMemberInTeamFail())
    errorHandler(err)
  }
}

export function* deleteTeamMember ({payload}) {
  const {relationId} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/member/${relationId}`,
      method: 'delete'
    })
    yield put(teamMemberDeleted(relationId))
  } catch (err) {
    yield put(deleteTeamMemberFail())
    errorHandler(err)
  }
}

export function* changeTeamMemberRole ({payload}) {
  const {relationId, newRole} = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/member/${relationId}`,
      method: 'put',
      data:  {role: newRole}
    })
    const msg = asyncData && asyncData.header && asyncData.header.msg ? asyncData.header.msg : ''
    const code = asyncData && asyncData.header && asyncData.header.code ? asyncData.header.code : ''
    yield put(teamMemberRoleChanged(relationId, newRole))
  } catch (err) {
    yield put(changeTeamMemberRoleFail())
    errorHandler(err)
  }
}

export default function* rootTeamSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_TEAMS, getTeams),
    takeEvery(EDIT_TEAM, editTeam),
    takeEvery(DELETE_TEAM, deleteTeam),
    takeLatest(LOAD_TEAM_DETAIL, getTeamDetail as any),
    takeLatest(LOAD_TEAM_MEMBERS, getTeamMembers as any),
    takeLatest(LOAD_TEAM_PROJECTS, getTeamProjects as any),
    takeLatest(LOAD_TEAM_TEAMS, getTeamTeams as any),
    takeLatest(PULL_PROJECT_IN_TEAM, pullProjectInTeam as any),
    takeLatest(UPDATE_TEAM_PROJECT_PERMISSION, updateTeamProjectPermission as any),
    takeLatest(DELETE_TEAM_PROJECT, deleteTeamProject as any),
    takeLatest(DELETE_TEAM_MEMBER, deleteTeamMember as any),
    takeLatest(CHANGE_MEMBER_ROLE_TEAM, changeTeamMemberRole as any),
    takeLatest(PULL_MEMBER_IN_TEAM, pullMemberInTeam as any)
  ]
}
