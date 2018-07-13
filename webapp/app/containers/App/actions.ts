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
  LOGIN_ERROR,
  LOGOUT,
  SET_LOGIN_USER,
  GET_LOGIN_USER,
  GET_LOGIN_USER_ERROR,
  SHOW_NAVIGATOR,
  HIDE_NAVIGATOR,
  CHECK_NAME
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const logout = promiseActionCreator(LOGOUT)

export const setLoginUser = promiseActionCreator(SET_LOGIN_USER, ['user'])

export function login (username, password, resolve) {
  return {
    type: LOGIN,
    payload: {
      username,
      password,
      resolve
    }
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

export function loginError () {
  return {
    type: LOGIN_ERROR
  }
}

export function getLoginUser (resolve) {
  return {
    type: GET_LOGIN_USER,
    payload: {
      resolve
    }
  }
}

export function getLoginUserError () {
  return {
    type: GET_LOGIN_USER_ERROR
  }
}

export function showNavigator () {
  return {
    type: SHOW_NAVIGATOR
  }
}

export function hideNavigator () {
  return {
    type: HIDE_NAVIGATOR
  }
}

export function checkNameAction (id, name, type, params, resolve, reject) {
  return {
    type: CHECK_NAME,
    payload: {
      id,
      name,
      type,
      params,
      resolve,
      reject
    }
  }
}

