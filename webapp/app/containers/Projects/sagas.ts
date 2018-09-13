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

import {takeLatest, takeEvery, throttle} from 'redux-saga'
import { call, all, put } from 'redux-saga/effects'
import {
  LOAD_PROJECTS,
  ADD_PROJECT,
  EDIT_PROJECT,
  DELETE_PROJECT,
  LOAD_PROJECT_DETAIL,
  TRANSFER_PROJECT,
  SEARCH_PROJECT,
  GET_PROJECT_STAR_USER,
  PROJECT_UNSTAR
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
  projectDetailLoaded,
  transferProjectFail,
  projectTransfered,
  projectSearched,
  searchProjectFail,
  unStarProjectSuccess,
  unStarProjectFail,
  getProjectStarUserSuccess,
  getProjectStarUserFail
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { errorHandler } from '../../utils/util'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getProjects (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, api.projects)
    const projects = readListAdapter(asyncData)
    yield put(projectsLoaded(projects))
  } catch (err) {
    yield put(loadProjectsFail())
    errorHandler(err)
  }
}

export function* addProject (action) {
  const { project, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.projects,
      data: project
    })
    const result = readListAdapter(asyncData)
    yield put(projectAdded(result))
    resolve()
  } catch (err) {
    yield put(addProjectFail())
    errorHandler(err)
  }
}

export function* editProject (action) {
  const { project, resolve } = action.payload
  const {id} = project
  try {
    yield call(request, {
      method: 'put',
      url: `${api.projects}/${id}`,
      data: project
     // data: writeAdapter(project)
    })
    yield put(projectEdited(project))
    resolve()
  } catch (err) {
    yield put(editProjectFail())
    errorHandler(err)
  }
}

export function* deleteProject (action) {
  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.projects}/${id}`
    })
    yield put(projectDeleted(id))
  } catch (err) {
    yield put(deleteProjectFail())
    errorHandler(err)
  }
}
export function* getProjectDetail ({ payload }) {
  try {
    const asyncData = yield  call(request, `${api.projects}/${payload.id}`)
    const project = readListAdapter(asyncData)
    yield put(projectDetailLoaded(project))
  } catch (err) {
    errorHandler(err)
  }
}

export function* transferProject ({payload}) {
  const {id, orgId} = payload
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.projects}/${id}/transfer`,
      data: {orgId}
    })
    const result = readListAdapter(asyncData)
    yield put(projectTransfered(result))
  } catch (err) {
    yield put(transferProjectFail())
    errorHandler(err)
  }
}

export function* searchProject ({payload}) {
  const {param: {keywords, pageNum, pageSize}} = payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.projects}/search/?pageNum=${pageNum || 1}&pageSize=${pageSize || 10}&keywords=${keywords || ''}`
    })
    const result = readListAdapter(asyncData)
    yield put(projectSearched(result))
  } catch (err) {
    yield put(searchProjectFail())
    errorHandler(err)
  }
}

export function* unStarProject ({payload}) {
  const {id, resolve} = payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.star}/project/${id}`,
      data: {id}
    })
    const result = readListAdapter(asyncData)
    yield put(unStarProjectSuccess(result))
    yield resolve()
  } catch (err) {
    yield put(unStarProjectFail())
    errorHandler(err)
  }
}

export function* getProjectStarUser ({payload}) {
  const {id} = payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.star}/project/${id}`
    })
    const result = readListAdapter(asyncData)
    yield put(getProjectStarUserSuccess(result))
  } catch (err) {
    yield put(getProjectStarUserFail())
    errorHandler(err)
  }
}

export default function* rootProjectSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_PROJECTS, getProjects as any),
    takeEvery(ADD_PROJECT, addProject as any),
    takeEvery(EDIT_PROJECT, editProject as any),
    takeEvery(DELETE_PROJECT, deleteProject as any),
    takeLatest(LOAD_PROJECT_DETAIL, getProjectDetail as any),
    takeEvery(TRANSFER_PROJECT, transferProject as any),
    takeEvery(PROJECT_UNSTAR, unStarProject as any),
    takeEvery(GET_PROJECT_STAR_USER, getProjectStarUser as any),
    throttle(1000, SEARCH_PROJECT, searchProject as any)
  ]
}
