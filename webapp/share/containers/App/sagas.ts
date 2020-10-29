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

import { ActionTypes } from './constants'
import { AppActions, AppActionType } from './actions'

import request, { IDavinciResponse, setTokenExpired } from 'utils/request'
import { errorHandler } from 'utils/util'
import { IServerConfigurations } from 'app/containers/App/types'
import api from 'utils/api'

export function* login(action: AppActionType) {
  if (action.type !== ActionTypes.LOGIN) {
    return
  }
  const { username, password, shareToken, resolve, reject } = action.payload
  const { logged, loginFail } = AppActions
  try {
    const userInfo = yield call(request, {
      method: 'post',
      url: `${api.share}/login/${shareToken}`,
      data: {
        username,
        password
      }
    })
    yield put(logged(userInfo.payload))
    localStorage.setItem('loginUser', JSON.stringify(userInfo.payload))
    if (resolve) {
      resolve()
    }
  } catch (err) {
    if (reject) {
      return reject()
    }
    yield put(loginFail(err))
    errorHandler(err)
  }
}

export function* interceptor(action: AppActionType) {
  if (action.type !== ActionTypes.INTERCEPTOR_PREFLIGHT) {
    return
  }
  const { token } = action.payload
  const { interceptored, interceptorFail } = AppActions
  try {
    const check = yield call(request, {
      method: 'get',
      url: `${api.share}/preflight/${token}`
    })
    const { type, vizType } = check.payload

    yield put(interceptored(type, vizType))
  } catch (error) {
    yield put(interceptorFail())
    errorHandler(error)
  }
}

export function* getPermissions(action: AppActionType) {
  if (action.type !== ActionTypes.GET_PERMISSIONS) {
    return
  }
  const { token, password, resolve, reject } = action.payload
  const { getPermissionsSuccess, getPermissionsFail } = AppActions
  try {
    const check = yield call(request, {
      method: 'get',
      url: `${api.share}/permissions/${token}`,
      params: { password }
    })
    yield put(getPermissionsSuccess(check?.payload?.download))
    if (resolve) {
      resolve()
    }
  } catch (error) {
    if (reject) {
      return reject()
    }
    yield put(getPermissionsFail())
    errorHandler(error)
  }
}

export function* getServerConfigurations(action: AppActionType) {
  if (action.type !== ActionTypes.GET_SERVER_CONFIGURATIONS) {
    return
  }
  const { serverConfigurationsGetted, getServerConfigurationsFail } = AppActions
  try {
    const result: IDavinciResponse<IServerConfigurations> = yield call(
      request,
      {
        method: 'get',
        url: api.configurations
      }
    )
    const configurations = result.payload
    setTokenExpired(configurations.jwtToken.timeout)
    yield put(serverConfigurationsGetted(configurations))
  } catch (err) {
    yield put(getServerConfigurationsFail(err))
    errorHandler(err)
  }
}

export default function* rootAppSaga() {
  yield all([
    takeLatest(ActionTypes.LOGIN, login),
    takeEvery(ActionTypes.INTERCEPTOR_PREFLIGHT, interceptor),
    takeEvery(ActionTypes.GET_PERMISSIONS, getPermissions),
    takeLatest(ActionTypes.GET_SERVER_CONFIGURATIONS, getServerConfigurations)
  ])
}
