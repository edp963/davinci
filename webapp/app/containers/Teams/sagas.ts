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
  LOAD_TEAM_TEAMS
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
  loadTeamTeamsFail
} from './actions'

import message from 'antd/lib/message'
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
  const { project, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: api.teams,
      data: writeAdapter(project)
    })
    yield put(teamEdited(project))
    resolve()
  } catch (err) {
    yield put(editTeamFail())
    message.error('修改 Team 失败，请稍后再试')
  }
}

export function* deleteTeam (action) {
  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.teams}/${id}`
    })
    yield put(teamDeleted(id))
  } catch (err) {
    yield put(deleteTeamFail())
    message.error('删除当前 Team 失败，请稍后再试')
  }
}

export function* getTeamDetail ({ payload }) {
  try {
    const asyncData = yield  call(request, `${api.teams}/${payload.id}`)
    const detail = readListAdapter(asyncData.project)
    yield put(teamDetailLoaded(detail))
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

export default function* rootTeamSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_TEAMS, getTeams),
    takeEvery(EDIT_TEAM, editTeam),
    takeEvery(DELETE_TEAM, deleteTeam),
    takeLatest(LOAD_TEAM_DETAIL, getTeamDetail as any),
    takeLatest(LOAD_TEAM_MEMBERS, getTeamMembers as any),
    takeLatest(LOAD_TEAM_PROJECTS, getTeamProjects as any),
    takeLatest(LOAD_TEAM_TEAMS, getTeamTeams as any)
  ]
}
