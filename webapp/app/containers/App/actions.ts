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
  GET_EXTERNAL_AUTH_PROVIDERS,
  GET_EXTERNAL_AUTH_PROVIDERS_SUCESS,
  TRY_EXTERNAL_AUTH,
  GET_SERVER_CONFIGURATIONS,
  GET_SERVER_CONFIGURATIONS_SUCCESS,
  GET_SERVER_CONFIGURATIONS_FAIL,
  LOGIN,
  LOGGED,
  LOGIN_ERROR,
  LOGOUT,
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
  GET_CAPTCHA_FOR_RESET_PASSWORD,
  GET_CAPTCHA_FOR_RESET_PASSWORD_SUCCESS,
  GET_CAPTCHA_FOR_RESET_PASSWORD_ERROE,
  RESET_PASSWORD_UNLOGGED,
  RESET_PASSWORD_UNLOGGED_ERROR,
  RESET_PASSWORD_UNLOGGED_SUCCESS,
  GET_USER_BY_TOKEN,
  GET_USER_BY_TOKEN_SUCCESS,
  GET_USER_BY_TOKEN_FAIL
} from './constants'

import {
  IGetgetCaptchaParams,
  IResetPasswordParams
} from '../FindPassword/types'

import { IReduxActionStruct } from 'utils/types'
import { IServerConfigurations } from './types'

export function getExternalAuthProviders() {
  return {
    type: GET_EXTERNAL_AUTH_PROVIDERS
  }
}

export function gotExternalAuthProviders(externalAuthProviders) {
  return {
    type: GET_EXTERNAL_AUTH_PROVIDERS_SUCESS,
    payload: {
      externalAuthProviders
    }
  }
}

export function tryExternalAuth(resolve) {
  return {
    type: TRY_EXTERNAL_AUTH,
    payload: {
      resolve
    }
  }
}

export function login(username, password, resolve) {
  return {
    type: LOGIN,
    payload: {
      username,
      password,
      resolve
    }
  }
}

export function getServerConfigurations() {
  return {
    type: GET_SERVER_CONFIGURATIONS
  }
}

export function serverConfigurationsGetted(
  configurations: IServerConfigurations
) {
  return {
    type: GET_SERVER_CONFIGURATIONS_SUCCESS,
    payload: {
      configurations
    }
  }
}

export function getServerConfigurationsFail(error) {
  return {
    type: GET_SERVER_CONFIGURATIONS_FAIL,
    payload: {
      error
    }
  }
}

export function logged(user) {
  return {
    type: LOGGED,
    payload: {
      user
    }
  }
}

export function loginError() {
  return {
    type: LOGIN_ERROR
  }
}

export function logout() {
  return {
    type: LOGOUT
  }
}

export function active(token, resolve) {
  return {
    type: ACTIVE,
    payload: {
      token,
      resolve
    }
  }
}

export function activeSuccess(user) {
  return {
    type: ACTIVE_SUCCESS,
    payload: {
      user
    }
  }
}

export function activeError() {
  return {
    type: ACTIVE_ERROR
  }
}

export function joinOrganization(token, resolve, reject) {
  return {
    type: JOIN_ORGANIZATION,
    payload: {
      token,
      resolve,
      reject
    }
  }
}

export function joinOrganizationSuccess(user) {
  return {
    type: JOIN_ORGANIZATION_SUCCESS,
    payload: {
      user
    }
  }
}

export function joinOrganizationError() {
  return {
    type: JOIN_ORGANIZATION_ERROR
  }
}

export function showNavigator() {
  return {
    type: SHOW_NAVIGATOR
  }
}

export function hideNavigator() {
  return {
    type: HIDE_NAVIGATOR
  }
}

export function checkNameAction(id, name, type, params, resolve, reject) {
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

export function checkNameUniqueAction(pathname, data, resolve, reject) {
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

export function updateProfile(id, name, description, department, resolve) {
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

export function uploadAvatarSuccess(path) {
  return {
    type: UPLOAD_AVATAR_SUCCESS,
    payload: {
      path
    }
  }
}

export function updateProfileSuccess(user) {
  return {
    type: UPDATE_PROFILE_SUCCESS,
    payload: {
      user
    }
  }
}

export function updateProfileError() {
  return {
    type: UPDATE_PROFILE_ERROR
  }
}

export function changeUserPassword(user, resolve, reject) {
  return {
    type: CHANGE_USER_PASSWORD,
    payload: {
      user,
      resolve,
      reject
    }
  }
}

export function userPasswordChanged(result) {
  return {
    type: CHANGE_USER_PASSWORD_SUCCESS,
    payload: {
      result
    }
  }
}

export function changeUserPasswordFail() {
  return {
    type: CHANGE_USER_PASSWORD_FAILURE
  }
}

export function loadDownloadList() {
  return {
    type: LOAD_DOWNLOAD_LIST
  }
}

export function downloadListLoaded(list) {
  return {
    type: LOAD_DOWNLOAD_LIST_SUCCESS,
    payload: {
      list
    }
  }
}

export function loadDownloadListFail(error) {
  return {
    type: LOAD_DOWNLOAD_LIST_FAILURE,
    payload: {
      error
    }
  }
}

export function downloadFile(id) {
  return {
    type: DOWNLOAD_FILE,
    payload: {
      id
    }
  }
}

export function fileDownloaded(id) {
  return {
    type: DOWNLOAD_FILE_SUCCESS,
    payload: {
      id
    }
  }
}

export function downloadFileFail(error) {
  return {
    type: DOWNLOAD_FILE_FAILURE,
    payload: {
      error
    }
  }
}

export function getCaptchaforResetPassword(
  params: IGetgetCaptchaParams
): IReduxActionStruct<IGetgetCaptchaParams> {
  return {
    type: GET_CAPTCHA_FOR_RESET_PASSWORD,
    payload: params
  }
}

export function getCaptchaforResetPasswordSuccess(result) {
  return {
    type: GET_CAPTCHA_FOR_RESET_PASSWORD_SUCCESS,
    payload: {
      result
    }
  }
}

export function getCaptchaforResetPasswordError(error) {
  return {
    type: GET_CAPTCHA_FOR_RESET_PASSWORD_ERROE,
    payload: {
      error
    }
  }
}

export function resetPasswordUnlogged(
  params: IResetPasswordParams
): IReduxActionStruct<IResetPasswordParams> {
  return {
    type: RESET_PASSWORD_UNLOGGED,
    payload: params
  }
}

export function resetPasswordUnloggedSuccess(result) {
  return {
    type: RESET_PASSWORD_UNLOGGED_SUCCESS,
    payload: {
      result
    }
  }
}

export function resetPasswordUnloggedFail(error) {
  return {
    type: RESET_PASSWORD_UNLOGGED_ERROR,
    payload: {
      error
    }
  }
}

export function getUserByToken(token) {
  return {
    type: GET_USER_BY_TOKEN,
    payload: {
      token
    }
  }
}

export function getUserByTokenSuccess(user) {
  return {
    type: GET_USER_BY_TOKEN_SUCCESS,
    payload: {
      user
    }
  }
}

export function getUserByTokenFail(error) {
  return {
    type: GET_USER_BY_TOKEN_FAIL,
    payload: {
      error
    }
  }
}
