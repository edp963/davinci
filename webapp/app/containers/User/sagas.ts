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

import { call, put, all, takeEvery, takeLatest } from 'redux-saga/effects'
import {
  LOAD_USERS,
  ADD_USER,
  DELETE_USER,
  // LOAD_USER_DETAIL,
  LOAD_USER_GROUPS,
  EDIT_USER_INFO,
  CHANGE_USER_PASSWORD
} from './constants'
import {
  usersLoaded,
  loadUsersFail,
  userAdded,
  addUserFail,
  userDeleted,
  deleteUserFail,
  // userDetailLoaded,
  userGroupsLoaded,
  loadUserGroupsFail,
  userInfoEdited,
  editUserInfoFail,
  userPasswordChanged,
  changeUserPasswordFail
} from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getUsers () {
  try {
    const asyncData = yield call(request, api.user)
    const users = asyncData.payload
    yield put(usersLoaded(users))
  } catch (err) {
    yield put(loadUsersFail())
    errorHandler(err)
  }
}

export function* addUser ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.user,
      data: [payload.user]
    })
    const result = asyncData.payload
    yield put(userAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addUserFail())
    errorHandler(err)
  }
}

export function* deleteUser ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.user}/${payload.id}`
    })
    yield put(userDeleted(payload.id))
  } catch (err) {
    yield put(deleteUserFail())
    errorHandler(err)
  }
}

// export const getUserDetail = promiseSagaCreator(
//   function* ({ id }) {
//     const user = yield call(request, `${api.user}/${id}`)
//     yield put(userDetailLoaded(user))
//     return user
//   },
//   function (err) {
//     console.log('getUserDetail', err)
//   }
// )

export function* getUserGroups ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.user}/${payload.id}/groups`)
    const groups = asyncData.payload
    yield put(userGroupsLoaded(groups))
    payload.resolve(groups)
  } catch (err) {
    yield put(loadUserGroupsFail())
    errorHandler(err)
  }
}

export function* editUserInfo ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.user,
      data: [payload.user]
    })
    yield put(userInfoEdited(payload.user))
    payload.resolve()
  } catch (err) {
    yield put(editUserInfoFail())
    errorHandler(err)
  }
}

export function* changeUserPassword ({ payload }) {
  const { id } = payload
  try {
    const result = yield call(request, {
      method: 'put',
      url: `${api.signup}/${id}/changepassword`,
      data: payload.info
    })
    yield put(userPasswordChanged(payload.info))
    payload.resolve()
  } catch (err) {
    yield put(changeUserPasswordFail())
    errorHandler(err)
  }
}

export default function* rootUserSaga (): IterableIterator<any> {
  yield all([
    takeLatest(LOAD_USERS, getUsers),
    takeEvery(ADD_USER, addUser as any),
    takeEvery(DELETE_USER, deleteUser as any),
    takeLatest(LOAD_USER_GROUPS, getUserGroups as any),
    takeEvery(EDIT_USER_INFO, editUserInfo as any),
    takeEvery(CHANGE_USER_PASSWORD, changeUserPassword as any)
  ])
}
