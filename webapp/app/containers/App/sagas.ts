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
import { LOGIN, GET_LOGIN_USER, CHECK_NAME, ACTIVE, UPDATE_PROFILE, CHANGE_USER_PASSWORD, JOIN_ORGANIZATION } from './constants'
import {
  logged,
  loginError,
  getLoginUserError,
  activeSuccess,
  activeError,
  joinOrganizationSuccess,
  joinOrganizationError,
  updateProfileSuccess,
  updateProfileError,
  userPasswordChanged,
  changeUserPasswordFail
} from './actions'
import request, { removeToken } from '../../utils/request'
// import request from '../../utils/request'
import api from '../../utils/api'
import { errorHandler } from '../../utils/util'

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

    const loginUser = asyncData.payload
    yield put(logged(loginUser))
    localStorage.setItem('loginUser', JSON.stringify(loginUser))
    resolve()
  } catch (err) {
    yield put(loginError())
    errorHandler(err)
  }
}


export function* activeUser (action): IterableIterator<any> {
  const {token, resolve} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.signup}/active/${token}`
    })
    switch (asyncData.header.code) {
      case 200:
        const loginUser = asyncData.payload
        yield put(activeSuccess(loginUser))
        localStorage.setItem('loginUser', JSON.stringify(loginUser))
        resolve()
        return loginUser
      case 302:
        message.error(asyncData.header.msg)
        setTimeout(() => location.replace('/'), 500)
        return
      default:
        yield put(activeError())
        message.error(asyncData.header.msg)
        return null
    }
  } catch (err) {
    yield put(activeError())
    errorHandler(err)
  }
}

export function* getLoginUser (action): IterableIterator<any> {
  try {
    const asyncData = yield call(request, `${api.user}/token`)
    const loginUser = asyncData.payload
    yield put(logged(loginUser))
    localStorage.setItem('loginUser', JSON.stringify(loginUser))
    action.payload.resolve()
  } catch (err) {
    yield put(getLoginUserError())
    errorHandler(err)
  }
}

export function* checkName (action): IterableIterator<any> {
  const { id, name, type, params, resolve, reject } = action.payload
  try {
    const asyncData = yield call(request, `${api.checkName}/${type}`, {
      method: 'get',
      params: {
        ...params,
        id,
        name
      }
    })
    const msg = asyncData && asyncData.header && asyncData.header.msg ? asyncData.header.msg : ''
    const code = asyncData && asyncData.header && asyncData.header.code ? asyncData.header.code : ''
    resolve(msg)
  } catch (err) {
    errorHandler(err)
  }
}

export function* checkNameUnique (action): IterableIterator<any> {
  const { pathname, data, resolve, reject } = action.payload
  try {
    if (!data.name) {
      return
    }
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.checkNameUnique}/${pathname}`,
      params: data
    })
    const msg = asyncData && asyncData.header && asyncData.header.msg ? asyncData.header.msg : ''
    const code = asyncData && asyncData.header && asyncData.header.code ? asyncData.header.code : ''
    resolve(msg)
  } catch (err) {
    errorHandler(err)
  }
}

export function* updateProfile (action): IterableIterator<any> {
  const {  id, name, description, department, resolve } = action.payload

  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.signup}/${id}`,
      data: {
        name,
        description,
        department
      }
    })
    resolve(asyncData)
  } catch (err) {
    yield put(updateProfileError())
    errorHandler(err)
  }
}

export function* changeUserPassword ({ payload }) {
  const {user} = payload
  try {
    const result = yield call(request, {
      method: 'put',
      url: `${api.user}/${user.id}/changepassword`,
      data: user
    })
    yield put(userPasswordChanged(payload.info))
    payload.resolve()
  } catch (err) {
    yield put(changeUserPasswordFail())
    errorHandler(err)
  }
}

export function* joinOrganization (action): IterableIterator<any> {
  const {token, resolve, reject} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.organizations}/confirminvite/${token}`
    })
    switch (asyncData.header.code) {
      case 200:
        const detail = asyncData.payload
        yield put(joinOrganizationSuccess(detail))
        if (resolve) {
          resolve(detail)
        }
        return token
      default:
        yield put(joinOrganizationError())
        message.error(asyncData.header.msg)
        return null
    }
  } catch (error) {
    if (reject) {
      reject(error)
    }
    if (error.response) {
      console.log(error.response.status)
      switch (error.response.status) {
        case 403:
          removeToken()
          localStorage.removeItem('TOKEN')
          break
        case 400:
          console.log({error})
          message.error(error.response.data.header.msg, 3)
          break
        default:
          break
      }
    }
  }
}
export default function* rootGroupSaga (): IterableIterator<any> {
  yield [
    throttle(1000, CHECK_NAME, checkNameUnique as any),
    takeLatest(GET_LOGIN_USER, getLoginUser as any),
    takeLatest(ACTIVE, activeUser as any),
    takeLatest(LOGIN, login as any),
    takeLatest(UPDATE_PROFILE, updateProfile as any),
    takeLatest(CHANGE_USER_PASSWORD, changeUserPassword as any),
    takeLatest(JOIN_ORGANIZATION, joinOrganization as any)
  ]
}

