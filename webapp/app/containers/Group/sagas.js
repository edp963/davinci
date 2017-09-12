/*-
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
import { call, fork, put } from 'redux-saga/effects'
import {
  LOAD_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  LOAD_GROUP_DETAIL,
  EDIT_GROUP
} from './constants'
import {
  groupsLoaded,
  groupAdded,
  groupDeleted,
  groupDetailLoaded,
  groupEdited
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'

export const getGroups = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.group)
    const groups = readListAdapter(asyncData)
    yield put(groupsLoaded(groups))
    return groups
  },
  function (err) {
    console.log('getGroups', err)
  }
)

export function* getGroupsWatcher () {
  yield fork(takeLatest, LOAD_GROUPS, getGroups)
}

export const addGroup = promiseSagaCreator(
  function* ({ group }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.group,
      data: writeAdapter(group)
    })
    const result = readObjectAdapter(asyncData)
    yield put(groupAdded(result))
    return result
  },
  function (err) {
    console.log('addGroup', err)
  }
)

export function* addGroupWatcher () {
  yield fork(takeEvery, ADD_GROUP, addGroup)
}

export const deleteGroup = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.group}/${id}`
    })
    yield put(groupDeleted(id))
  },
  function (err) {
    console.log('deleteGroup', err)
  }
)

export function* deleteGroupWatcher () {
  yield fork(takeEvery, DELETE_GROUP, deleteGroup)
}

export const getGroupDetail = promiseSagaCreator(
  function* (payload) {
    const asyncData = yield call(request, `${api.group}/${payload.id}`)
    const group = readObjectAdapter(asyncData)
    yield put(groupDetailLoaded(group))
    return group
  },
  function (err) {
    console.log('getGroupDetail', err)
  }
)

export function* getGroupDetailWatcher () {
  yield fork(takeLatest, LOAD_GROUP_DETAIL, getGroupDetail)
}

export const editGroup = promiseSagaCreator(
  function* ({ group }) {
    yield call(request, {
      method: 'put',
      url: api.group,
      data: writeAdapter(group)
    })
    yield put(groupEdited(group))
  },
  function (err) {
    console.log('editGroup', err)
  }
)

export function* editGroupWatcher () {
  yield fork(takeEvery, EDIT_GROUP, editGroup)
}

export default [
  getGroupsWatcher,
  addGroupWatcher,
  deleteGroupWatcher,
  getGroupDetailWatcher,
  editGroupWatcher
]
