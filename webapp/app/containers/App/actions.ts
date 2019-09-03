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
  GET_LOGIN_USER,
  GET_LOGIN_USER_ERROR,
  SHOW_NAVIGATOR,
  HIDE_NAVIGATOR,
  CHECK_NAME,
  ACTIVE,
  ACTIVE_SUCCESS,
  ACTIVE_ERROR,
  JOIN_ORGANIZATION,
  JOIN_ORGANIZATION_SUCCESS,
  JOIN_ORGANIZATION_ERROR,
  UPDATE_PROFILE,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_ERROR,
  CHANGE_USER_PASSWORD,
  CHANGE_USER_PASSWORD_FAILURE,
  CHANGE_USER_PASSWORD_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  LOAD_DOWNLOAD_LIST,
  LOAD_DOWNLOAD_LIST_SUCCESS,
  LOAD_DOWNLOAD_LIST_FAILURE,
  DOWNLOAD_FILE,
  DOWNLOAD_FILE_FAILURE,
  DOWNLOAD_FILE_SUCCESS,
  INITIATE_DOWNLOAD_TASK,
  INITIATE_DOWNLOAD_TASK_SUCCESS,
  INITIATE_DOWNLOAD_TASK_FAILURE
} from './constants'

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

export function logout () {
  return {
    type: LOGOUT
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

export function joinOrganization (token, resolve, reject) {
  return {
    type: JOIN_ORGANIZATION,
    payload: {
      token,
      resolve,
      reject
    }
  }
}

export function joinOrganizationSuccess (user) {
  return {
    type: JOIN_ORGANIZATION_SUCCESS,
    payload: {
      user
    }
  }
}

export function joinOrganizationError () {
  return {
    type: JOIN_ORGANIZATION_ERROR
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


export function changeUserPassword (user, resolve, reject) {
  return {
    type: CHANGE_USER_PASSWORD,
    payload: {
      user,
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

export function loadDownloadList () {
  return {
    type: LOAD_DOWNLOAD_LIST
  }
}

export function downloadListLoaded (list) {
  return {
    type: LOAD_DOWNLOAD_LIST_SUCCESS,
    payload: {
      list
    }
  }
}

export function loadDownloadListFail (error) {
  return {
    type: LOAD_DOWNLOAD_LIST_FAILURE,
    payload: {
      error
    }
  }
}

export function downloadFile (id) {
  return {
    type: DOWNLOAD_FILE,
    payload: {
      id
    }
  }
}

export function fileDownloaded (id) {
  return {
    type: DOWNLOAD_FILE_SUCCESS,
    payload: {
      id
    }
  }
}

export function downloadFileFail (error) {
  return {
    type: DOWNLOAD_FILE_FAILURE,
    payload: {
      error
    }
  }
}

export function initiateDownloadTask (id, type, downloadParams?, itemId?) {
  return {
    type: INITIATE_DOWNLOAD_TASK,
    payload: {
      id,
      type,
      downloadParams,
      itemId
    }
  }
}

export function DownloadTaskInitiated (type, itemId?, statistic?) {
  return {
    type: INITIATE_DOWNLOAD_TASK_SUCCESS,
    payload: {
      type,
      itemId
    },
    statistic
  }
}

export function initiateDownloadTaskFail (error) {
  return {
    type: INITIATE_DOWNLOAD_TASK_FAILURE,
    payload: {
      error
    }
  }
}
