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

import { takeLatest, throttle } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

const message = require('antd/lib/message')
import { LOGIN, GET_LOGIN_USER, CHECK_NAME } from './constants'
import { logged, loginError, getLoginUserError } from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'
import axios from 'axios' // FIXME

export function* login (action): IterableIterator<any> {
  const { username, password, resolve } = action.payload

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
        yield put(loginError())
        return null
      case 404:
        message.error('用户不存在')
        yield put(loginError())
        return null
      default:
        const loginUser = readListAdapter(asyncData)
        yield put(logged(loginUser))
        localStorage.setItem('loginUser', JSON.stringify(loginUser))
        resolve()
        return loginUser
    }
  } catch (err) {
    yield put(loginError())
    message.error('登录失败')
  }
}

export function* loginWatcher (): IterableIterator<any> {
  yield takeLatest(LOGIN, login)
}

export function* getLoginUser (action): IterableIterator<any> {
  try {
    const asyncData = yield call(request, `${api.user}/token`)
    const loginUser = readObjectAdapter(asyncData)
    yield put(logged(loginUser))
    localStorage.setItem('loginUser', JSON.stringify(loginUser))
    action.payload.resolve()
  } catch (err) {
    yield put(getLoginUserError())
    message.error('获取登录用户失败')
  }
}

export function* getLoginUserWatcher (): IterableIterator<any> {
  yield takeLatest(GET_LOGIN_USER, getLoginUser)
}

// FIX ME
function* getToken () {
  const response = yield call(axios, `/api/v3/login`, {
    method: 'post',
    data: {
      username: 'Fangkun',
      password: 'qwerty'
    }
  })
  const token = response.data.header.token
  localStorage.setItem('TEMP_TOKEN', token)
  return token
}

export function* checkName (action): IterableIterator<any> {
  // FIXME
  const token = (yield getToken())

  const { id, name, type, params, resolve, reject } = action.payload
  try {
    const asyncData = yield call(request, `${api.checkName}/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
      method: 'get',
      params: {
        ...params,
        id,
        name
      }
    })
    const msg = asyncData && asyncData.header && asyncData.header.msg ? asyncData.header.msg : ''
    const code = asyncData && asyncData.header && asyncData.header.code ? asyncData.header.code : ''
    if (code && code === 400) {
      reject(msg)
    }
    if (code && code === 200) {
      resolve(msg)
    }
  } catch (err) {
    console.log(err)
  }
}

export function* checkNameWatcher (): IterableIterator<any> {
  yield throttle(1000, CHECK_NAME, checkName)
}

export default [
  loginWatcher,
  getLoginUserWatcher,
  checkNameWatcher
]
