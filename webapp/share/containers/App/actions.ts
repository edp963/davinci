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

import {
  LOGIN,
  LOGGED,
  LOGOUT,
  LOGON_FAILURE
} from './constants'

export function login (username, password, shareToken, resolve) {
  return {
    type: LOGIN,
    payload: {
      username,
      password,
      shareToken,
      resolve
    }
  }
}

export function logout () {
  return {
    type: LOGOUT
  }
}

export function logged (user) {
  return {
    type: LOGGED,
    payload: {
      user
    }
  }
}

export function logonFail (error) {
  return {
    type: LOGON_FAILURE,
    payload: {
      error
    }
  }
}
