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

import { DownloadStatus } from './types'

export const GET_EXTERNAL_AUTH_PROVIDERS = 'davinci/App/GET_EXTERNAL_AUTH_PROVIDERS'
export const GET_EXTERNAL_AUTH_PROVIDERS_SUCESS = 'davinci/App/GET_EXTERNAL_AUTH_PROVIDERS_SUCESS'
export const TRY_EXTERNAL_AUTH = 'davinci/App/TRY_EXTERNAL_AUTH'
export const EXTERNAL_AUTH_LOGOUT = 'davinci/App/EXTERNAL_AUTH_LOGOUT'
export const LOGIN = 'davinci/App/LOGIN'
export const LOGGED = 'davinci/App/LOGGED'
export const LOGIN_ERROR = 'davinci/App/LOGIN_ERROR'
export const ACTIVE = 'davinci/App/ACTIVE'
export const ACTIVE_SUCCESS = 'davinci/App/ACTIVE_SUCCESS'
export const ACTIVE_ERROR = 'davinci/App/ACTIVE_ERROR'

export const JOIN_ORGANIZATION = 'davinci/App/JOIN_ORGANIZATION'
export const JOIN_ORGANIZATION_SUCCESS = 'davinci/App/JOIN_ORGANIZATION_SUCCESS'
export const JOIN_ORGANIZATION_ERROR = 'davinci/App/JOIN_ORGANIZATION_ERROR'

export const LOGOUT = 'davinci/App/LOGOUT'
export const GET_LOGIN_USER = 'davinci/App/GET_LOGIN_USER'
export const GET_LOGIN_USER_ERROR = 'davinci/App/GET_LOGIN_USER_ERROR'
export const SHOW_NAVIGATOR = 'davinci/App/SHOW_NAVIGATOR'
export const HIDE_NAVIGATOR = 'davinci/App/HIDE_NAVIGATOR'
export const CHECK_NAME = 'davinci/App/CHECK_NAME'

export const UPDATE_PROFILE = 'davinci/App/UPDATE_PROFILE'
export const UPDATE_PROFILE_SUCCESS = 'davinci/App/UPDATE_PROFILE_SUCCESS'
export const UPDATE_PROFILE_ERROR = 'davinci/App/UPDATE_PROFILE_ERROR'

export const UPLOAD_AVATAR_SUCCESS = 'davinci/App/UPLOAD_AVATAR_SUCCESS'

export const CHANGE_USER_PASSWORD = 'davinci/User/CHANGE_USER_PASSWORD'
export const CHANGE_USER_PASSWORD_SUCCESS = 'davinci/User/CHANGE_USER_PASSWORD_SUCCESS'
export const CHANGE_USER_PASSWORD_FAILURE = 'davinci/User/CHANGE_USER_PASSWORD_FAILURE'

export const LOAD_DOWNLOAD_LIST = 'davinci/Download/LOAD_DOWNLOAD_LIST'
export const LOAD_DOWNLOAD_LIST_SUCCESS = 'davinci/Download/LOAD_DOWNLOAD_LIST_SUCCESS'
export const LOAD_DOWNLOAD_LIST_FAILURE = 'davinci/Download/LOAD_DOWNLOAD_LIST_FAILURE'
export const DOWNLOAD_FILE = 'davinci/Download/DOWNLOAD_FILE'
export const DOWNLOAD_FILE_SUCCESS = 'davinci/Download/DOWNLOAD_FILE_SUCCESS'
export const DOWNLOAD_FILE_FAILURE = 'davinci/Download/DOWNLOAD_FILE_FAILURE'
export const INITIATE_DOWNLOAD_TASK = 'davinci/Download/INITIATE_DOWNLOAD_TASK'
export const INITIATE_DOWNLOAD_TASK_SUCCESS = 'davinci/Download/INITIATE_DOWNLOAD_TASK_SUCCESS'
export const INITIATE_DOWNLOAD_TASK_FAILURE = 'davinci/Download/INITIATE_DOWNLOAD_TASK_FAILURE'

export const CREATE_ORGANIZATION_PROJECT = 'davinci/permission/CREATE_ORGANIZATION_PROJECT'
export const DELETE_ORGANIZATION_PROJECT = 'davinci/permission/DELETE_ORGANIZATION_PROJECT'
export const INVITE_ORGANIZATION_MEMBER = 'davinci/permission/CREATE_ORGANIZATION_PROJECT'
export const CHANGE_ORGANIZATION_MEMBER_ROLE = 'davinci/permission/CHANGE_ORGANIZATION_MEMBER_ROLE'
export const DELETE_ORGANIZATION_MEMBER = 'davinci/permission/DELETE_ORGANIZATION_MEMBER'
export const CREATE_ORGANIZATION_TEAM = 'davinci/permission/CREATE_ORGANIZATION_TEAM'
export const UPDATE_ORGANIZATION = 'davinci/permission/UPDATE_ORGANIZATION'
export const UPDATE_PROJECT_VISIBILITY = 'davinci/permission/UPDATE_PROJECT_VISIBILITY'
export const DELETE_ORGANIZATION = 'davinci/permission/DELETE_ORGANIZATION'
export const TRANSFER_PROJECT_TO_ORGANIZATION = 'davinci/permission/TRANSFER_PROJECT_TO_ORGANIZATION'
export const ADD_TEAM_MEMBER = 'davinci/permission/ADD_TEAM_MEMBER'
export const CHANGE_TEAM_MEMBER_ROLE = 'davinci/permission/CHANGE_TEAM_MEMBER_ROLE'
export const DELETE_TEAM_MEMBER = 'davinci/permission/DELETE_TEAM_MEMBER'
export const ADD_TEAM_PROJECT = 'davinci/permission/ADD_TEAM_PROJECT'
export const DELETE_TEAM_PROJECT = 'davinci/permission/DELETE_TEAM_PROJECT'
export const UPDATE_TEAM_PROJECT_PERMISSION = 'davinci/permission/UPDATE_TEAM_PROJECT_PERMISSION'
export const UPDATE_TEAM = 'davinci/permission/UPDATE_TEAM'
export const DELETE_TEAM = 'davinci/permission/DELETE_TEAM'

export const DOWNLOAD_STATUS_COLORS = {
  [DownloadStatus.Processing]: 'blue',
  [DownloadStatus.Success]: 'green',
  [DownloadStatus.Failed]: 'red',
  [DownloadStatus.Downloaded]: 'grey'
}

export const DOWNLOAD_STATUS_LOCALE = {
  [DownloadStatus.Processing]: '处理中',
  [DownloadStatus.Success]: '成功',
  [DownloadStatus.Failed]: '失败',
  [DownloadStatus.Downloaded]: '已下载'
}
