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
import {
  LOAD_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  // LOAD_GROUP_DETAIL,
  EDIT_GROUP
} from './constants'
import {
  groupsLoaded,
  loadGroupFail,
  groupAdded,
  addGroupFail,
  groupDeleted,
  deleteGroupFail,
  // groupDetailLoaded,
  groupEdited,
  editGroupFail
} from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getGroups () {
  try {
    const asyncData = yield call(request, api.group)
    const groups = asyncData.payload
    yield put(groupsLoaded(groups))
  } catch (err) {
    yield put(loadGroupFail())
    errorHandler(err)
  }
}

export function* addGroup ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.group,
      data: [payload.group]
    })
    const result = asyncData.payload
    yield put(groupAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addGroupFail())
    errorHandler(err)
  }
}

export function* deleteGroup ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.group}/${payload.id}`
    })
    yield put(groupDeleted(payload.id))
  } catch (err) {
    yield put(deleteGroupFail())
    errorHandler(err)
  }
}

export function* editGroup ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.group,
      data: [payload.group]
    })
    yield put(groupEdited(payload.group))
    payload.resolve()
  } catch (err) {
    yield put(editGroupFail())
    errorHandler(err)
  }
}

export default function* rootGroupSaga (): IterableIterator<any> {
  yield all([
    takeLatest(LOAD_GROUPS, getGroups),
    takeEvery(ADD_GROUP, addGroup as any),
    takeEvery(DELETE_GROUP, deleteGroup as any),
    // takeLatest(LOAD_GROUP_DETAIL, getGroupDetail),
    takeEvery(EDIT_GROUP, editGroup as any)
  ])
}
