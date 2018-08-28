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
import { writeAdapter, readListAdapter } from '../../utils/asyncAdapter'


export function* getTeams () {
  try {
    const asyncData = yield call(request, api.teams)
    const projects = readListAdapter(asyncData)
    yield put(teamsLoaded(projects))
  } catch (err) {
    yield put(loadTeamsFail())
    message.error('获取 Teams 失败，请稍后再试')
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
  } catch (err) {
    console.log(err)
    yield put(editTeamFail())
    message.error('修改 Team 失败，请稍后再试')
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
    message.error('删除当前 Team 失败，请稍后再试')
  }
}

export function* getTeamDetail ({ payload }) {
  try {
    const asyncData = yield  call(request, `${api.teams}/${payload.id}`)
    const detail = readListAdapter(asyncData)
    yield put(teamDetailLoaded(detail))
    yield payload.resolve && payload.resolve(detail)
  } catch (err) {
    console.log('getTeamDetail', err)
  }
}

export function* getTeamProjects ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/projects`)
    const projects = readListAdapter(asyncData)
    yield put(teamProjectsLoaded(projects))
  } catch (err) {
    yield put(loadTeamProjectsFail())
    message.error('获取 teamProjects 失败，请稍后再试')
  }
}

export function* getTeamMembers ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/members`)
    const members = readListAdapter(asyncData)
    yield put(teamMembersLoaded(members))
  } catch (err) {
    yield put(loadTeamMembersFail())
    message.error('获取 teamMembers 失败，请稍后再试')
  }
}

export function* getTeamTeams ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, `${api.teams}/${id}/teams`)
    const teams = readListAdapter(asyncData)
    yield put(teamTeamsLoaded(teams))
  } catch (err) {
    yield put(loadTeamTeamsFail())
    message.error('获取 teamTeams 失败，请稍后再试')
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
    const projects = readListAdapter(asyncData)
    yield put(projectInTeamPulled(projects))
    resolve()
  } catch (err) {
    yield put(pullProjectInTeamFail())
    message.error('添加 teamProjects 失败，请稍后再试')
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
    const projects = readListAdapter(asyncData)
    yield put(teamProjectPermissionUpdated(projects))
    if (resolve) {
      resolve(projects)
    }
  } catch (err) {
    yield put(updateTeamProjectPermissionFail())
    message.error('更新 project permission 失败，请稍后再试')
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
    message.error('删除 team project 失败，请稍后再试')
  }
}

export function* pullMemberInTeam ({payload}) {
  const { teamId, memberId, resolve } = payload
  try {
    const asyncData = yield call(request, {
      url: `${api.teams}/${teamId}/member/${memberId}`,
      method: 'post'
    })
    const members = readListAdapter(asyncData)
    yield put(memberInTeamPulled(members))
    resolve()
  } catch (err) {
    yield put(pullMemberInTeamFail())
    message.error('添加 teamMembers 失败，请稍后再试')
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
    message.error('删除 team member 失败，请稍后再试')
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
    if (code && code === 400) {
      message.error(msg)
    }
    if (code && code === 200) {
      yield put(teamMemberRoleChanged(relationId, newRole))
    }
  } catch (err) {
    yield put(changeTeamMemberRoleFail())
    message.error('删除 team member 失败，请稍后再试')
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
