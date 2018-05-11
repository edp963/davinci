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

import { takeEvery, takeLatest } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'
import {
  LOAD_USERS,
  ADD_USER,
  DELETE_USER,
  LOAD_USER_DETAIL,
  LOAD_USER_GROUPS,
  EDIT_USER_INFO,
  CHANGE_USER_PASSWORD
} from './constants'
import {
  usersLoaded,
  userAdded,
  userDeleted,
  userDetailLoaded,
  userGroupsLoaded,
  userInfoEdited,
  userPasswordChanged
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export const getUsers = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.user)
    const users = readListAdapter(asyncData)
    yield put(usersLoaded(users))
    return users
  },
  function (err) {
    console.log('getUsers', err)
  }
)

export const addUser = promiseSagaCreator(
  function* ({ user }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.user,
      data: writeAdapter(user)
    })
    const result = readObjectAdapter(asyncData)
    yield put(userAdded(result))
    return result
  },
  function (err) {
    console.log('addUser', err)
  }
)

export const deleteUser = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.user}/${id}`
    })
    yield put(userDeleted(id))
  },
  function (err) {
    console.log('deleteUser', err)
  }
)

export const getUserDetail = promiseSagaCreator(
  function* ({ id }) {
    const user = yield call(request, `${api.user}/${id}`)
    yield put(userDetailLoaded(user))
    return user
  },
  function (err) {
    console.log('getUserDetail', err)
  }
)

export const getUserGroups = promiseSagaCreator(
  function* ({ id }) {
    const asyncData = yield call(request, `${api.user}/${id}/groups`)
    const groups = readListAdapter(asyncData)
    yield put(userGroupsLoaded(groups))
    return groups
  },
  function (err) {
    console.log('getUserGroups', err)
  }
)

export const editUserInfo = promiseSagaCreator(
  function* ({ user }) {
    yield call(request, {
      method: 'put',
      url: api.user,
      data: writeAdapter(user)
    })
    yield put(userInfoEdited(user))
  },
  function (err) {
    console.log('editUserInfo', err)
  }
)

export const changeUserPassword = promiseSagaCreator(
  function* ({ info }) {
    yield call(request, {
      method: 'post',
      url: `${api.changepwd}/users`,
      data: info
        // writeAdapter(info)
    })
    // yield put(userPasswordChanged())
  },
  function (err) {
    console.log('changeUserPassword', err)
  }
)

export default function* rootUserSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_USERS, getUsers),
    takeEvery(ADD_USER, addUser),
    takeEvery(DELETE_USER, deleteUser),
    takeLatest(LOAD_USER_DETAIL, getUserDetail),
    takeLatest(LOAD_USER_GROUPS, getUserGroups),
    takeEvery(EDIT_USER_INFO, editUserInfo),
    takeEvery(CHANGE_USER_PASSWORD, changeUserPassword)
  ]
}
