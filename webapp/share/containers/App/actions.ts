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

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'

export const AppActions = {
  login(username, password, shareToken, resolve, reject?) {
    return {
      type: ActionTypes.LOGIN,
      payload: {
        username,
        password,
        shareToken,
        resolve,
        reject
      }
    }
  },

  logout() {
    return {
      type: ActionTypes.LOGOUT
    }
  },

  logged(user) {
    return {
      type: ActionTypes.LOGGED,
      payload: {
        user
      }
    }
  },

  loginFail(error) {
    return {
      type: ActionTypes.LOGON_FAILURE,
      payload: {
        error
      }
    }
  },

  interceptor (token: string) {
    return {
      type: ActionTypes.INTERCEPTOR_PREFLIGHT,
      payload: {
        token
      }
    }
  },

  interceptored(shareType) {
    return {
      type: ActionTypes.INTERCEPTOR_PREFLIGHT_SUCCESS,
      payload: {
        shareType
      }
    }
  },

  interceptorFail() {
    return {
      type: ActionTypes.INTERCEPTOR_PREFLIGHT_FAIL
    }
  },

  getPermissions(token: string, type: string, password?: string, resolve?: () => void, reject?: () => void) {
    return {
      type: ActionTypes.GET_PERMISSIONS,
      payload: {
        token,
        type,
        password,
        resolve,
        reject
      }
    }
  },
  getPermissionsSuccess(download) {
    return {
      type: ActionTypes.GET_PERMISSIONS_SUCCESS,
      payload: {
        download
      }
    }
  },
  getPermissionsFail() {
    return {
      type: ActionTypes.GET_PERMISSIONS_FAIL
    }
  }

}

const mockAction = returnType(AppActions)
export type AppActionType = typeof mockAction

export default AppActions
