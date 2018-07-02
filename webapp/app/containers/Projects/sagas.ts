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
  LOAD_PROJECTS,
  ADD_PROJECT,
  EDIT_PROJECT,
  DELETE_PROJECT,
  LOAD_PROJECT_DETAIL
} from './constants'

import {
  projectsLoaded,
  loadProjectsFail,
  projectAdded,
  addProjectFail,
  projectEdited,
  editProjectFail,
  projectDeleted,
  deleteProjectFail,
  projectDetailLoaded
} from './actions'

import message from 'antd/lib/message'
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getProjects () {
  try {
    const asyncData = yield call(request, api.projects)
    const projects = readListAdapter(asyncData)
    yield put(projectsLoaded(projects))
  } catch (err) {
    yield put(loadProjectsFail())
    message.error('获取 Projects 失败，请稍后再试')
  }
}

export function* addProject (action) {
  const { project, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.projects,
      data: project
     // data: writeAdapter(project)
    })
    const result = readObjectAdapter(asyncData)
    yield put(projectAdded(result))
    resolve()
  } catch (err) {
    yield put(addProjectFail())
    message.error('添加 Project 失败，请稍后再试')
  }
}

export function* editProject (action) {
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
    yield put(editProjectFail())
    message.error('修改 Project 失败，请稍后再试')
  }
}

export function* deleteProject (action) {
  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.project}/${id}`
    })
    yield put(projectDeleted(id))
  } catch (err) {
    yield put(deleteProjectFail())
    message.error('删除当前 Project 失败，请稍后再试')
  }
}

export function* getProjectDetail ({ payload }) {
  try {
    const asyncData = yield all({
      project: call(request, `${api.project}/${payload.id}`),
      widgets: call(request, api.widget)
    })
    const project = readListAdapter(asyncData.project)
    const widgets = readListAdapter(asyncData.widgets)
    yield put(projectDetailLoaded(project, widgets))
  } catch (err) {
    console.log('getProjectDetail', err)
  }
}



export default function* rootProjectSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_PROJECTS, getProjects as any),
    takeEvery(ADD_PROJECT, addProject as any),
    takeEvery(EDIT_PROJECT, editProject as any),
    takeEvery(DELETE_PROJECT, deleteProject as any),
    takeLatest(LOAD_PROJECT_DETAIL, getProjectDetail as any)
  ]
}
