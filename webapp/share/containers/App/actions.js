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

import {
  LOGIN,
  LOGGED,
  LOGOUT,
  SET_LOGIN_USER,
  GET_LOGIN_USER
} from './constants'

import { promiseActionCreator } from '../../../app/utils/reduxPromisation'

export const login = promiseActionCreator(LOGIN, ['username', 'password'])

export const logout = promiseActionCreator(LOGOUT)

export const setLoginUser = promiseActionCreator(SET_LOGIN_USER, ['user'])

export const getLoginUser = promiseActionCreator(GET_LOGIN_USER)

export function logged (user) {
  return {
    type: LOGGED,
    payload: {
      user
    }
  }
}
