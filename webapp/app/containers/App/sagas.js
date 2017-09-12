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

import { takeLatest } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'

import message from 'antd/lib/message'
import { LOGIN, GET_LOGIN_USER } from './constants'
import { logged } from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'

export function* login ({ payload }) {
  const { username, password, resolve } = payload

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.login,
      data: {
        username,
        password
      }
    })

    switch (asyncData.header.code) {
      case 400:
        message.error('密码错误')
        return null
      case 404:
        message.error('用户不存在')
        return null
      default:
        const loginUser = readListAdapter(asyncData)
        yield put(logged(loginUser))
        localStorage.setItem('loginUser', JSON.stringify(loginUser))
        resolve()
        return loginUser
    }
  } catch (err) {
    message.error('登录失败')
  }
}

export function* loginWatcher () {
  yield fork(takeLatest, LOGIN, login)
}

export const getLoginUser = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, `${api.user}/token`)
    const loginUser = readObjectAdapter(asyncData)
    yield put(logged(loginUser))
    localStorage.setItem('loginUser', JSON.stringify(loginUser))
    return loginUser
  },
  function (err) {
    message.error('获取登录用户失败')
  }
)

export function* getLoginUserWatcher () {
  yield fork(takeLatest, GET_LOGIN_USER, getLoginUser)
}

export default [
  loginWatcher,
  getLoginUserWatcher
]
