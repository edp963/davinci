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
  CHECK_NAME,
  PROJECTS_CHECK_NAME,
  ACTIVE,
  ACTIVE_SUCCESS,
  ACTIVE_ERROR,
  UPDATE_PROFILE,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_ERROR,
  CHANGE_USER_PASSWORD,
  CHANGE_USER_PASSWORD_FAILURE,
  CHANGE_USER_PASSWORD_SUCCESS,
  UPLOAD_AVATAR_SUCCESS
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

export function active (token, resolve) {
  return {
    type: ACTIVE,
    payload: {
      token,
      resolve
    }
  }
}

export function activeSuccess (user) {
  return {
    type: ACTIVE_SUCCESS,
    payload: {
      user
    }
  }
}

export function activeError () {
  return {
    type: ACTIVE_ERROR
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

export function checkNameAction (id, name, type, resolve, reject) {
  return {
    type: CHECK_NAME,
    payload: {
      id,
      name,
      type,
      resolve,
      reject
    }
  }
}

export function checkNameUniqueAction (pathname, data, resolve, reject) {
  return {
    type: CHECK_NAME,
    payload: {
      pathname,
      data,
      resolve,
      reject
    }
  }
}

export function projectsCheckName (pId, id, name, type, resolve, reject) {
  return {
    type: PROJECTS_CHECK_NAME,
    payload: {
      pId,
      id,
      name,
      type,
      resolve,
      reject
    }
  }
}

export function updateProfile (id, name, description, department, resolve) {
  return {
    type: UPDATE_PROFILE,
    payload: {
      id,
      name,
      description,
      department,
      resolve
    }
  }
}

export function uploadAvatarSuccess (path) {
  return {
    type: UPLOAD_AVATAR_SUCCESS,
    payload: {
      path
    }
  }
}

export function updateProfileSuccess (user) {
  return {
    type: UPDATE_PROFILE_SUCCESS,
    payload: {
      user
    }
  }
}

export function updateProfileError () {
  return {
    type: UPDATE_PROFILE_ERROR
  }
}


export function changeUserPassword (info, resolve, reject) {
  return {
    type: CHANGE_USER_PASSWORD,
    payload: {
      info,
      resolve,
      reject
    }
  }
}

export function userPasswordChanged (result) {
  return {
    type: CHANGE_USER_PASSWORD_SUCCESS,
    payload: {
      result
    }
  }
}

export function changeUserPasswordFail () {
  return {
    type: CHANGE_USER_PASSWORD_FAILURE
  }
}

