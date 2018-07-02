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
import { call, all, put } from 'redux-saga/effects'
import {
  LOAD_TEAMS,
  ADD_TEAM,
  EDIT_TEAM,
  DELETE_TEAM,
  LOAD_TEAM_DETAIL
} from './constants'

import {
  projectsLoaded,
  loadTeamsFail,
  projectAdded,
  addTeamFail,
  projectEdited,
  editTeamFail,
  projectDeleted,
  deleteTeamFail,
  projectDetailLoaded
} from './actions'

import message from 'antd/lib/message'
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getTeams () {
  try {
    const asyncData = yield call(request, api.project)
    const projects = readListAdapter(asyncData)
    yield put(projectsLoaded(projects))
  } catch (err) {
    yield put(loadTeamsFail())
    message.error('获取 Teams 失败，请稍后再试')
  }
}

export function* addTeam (action) {
  const { project, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.project,
      data: writeAdapter(project)
    })
    const result = readObjectAdapter(asyncData)
    yield put(projectAdded(result))
    resolve()
  } catch (err) {
    yield put(addTeamFail())
    message.error('添加 Team 失败，请稍后再试')
  }
}

export function* editTeam (action) {
  const { project, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: api.project,
      data: writeAdapter(project)
    })
    yield put(projectEdited(project))
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
      url: `${api.project}/${id}`
    })
    yield put(projectDeleted(id))
  } catch (err) {
    yield put(deleteTeamFail())
    message.error('删除当前 Team 失败，请稍后再试')
  }
}

export function* getTeamDetail ({ payload }) {
  try {
    const asyncData = yield all({
      project: call(request, `${api.project}/${payload.id}`),
      widgets: call(request, api.widget)
    })
    const project = readListAdapter(asyncData.project)
    const widgets = readListAdapter(asyncData.widgets)
    yield put(projectDetailLoaded(project, widgets))
  } catch (err) {
    console.log('getTeamDetail', err)
  }
}



export default function* rootTeamSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_TEAMS, getTeams),
    takeEvery(ADD_TEAM, addTeam),
    takeEvery(EDIT_TEAM, editTeam),
    takeEvery(DELETE_TEAM, deleteTeam),
    takeLatest(LOAD_TEAM_DETAIL, getTeamDetail as any)
  ]
}
