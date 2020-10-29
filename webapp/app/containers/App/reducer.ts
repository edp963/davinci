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

import produce, { setAutoFreeze } from 'immer'

// @FIXME temporary not Object.freeze from immer produce to avoid current bugs
setAutoFreeze(false)

import {
  LOGIN,
  LOGGED,
  LOGIN_ERROR,
  LOGOUT,
  SHOW_NAVIGATOR,
  HIDE_NAVIGATOR,
  ACTIVE_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  LOAD_DOWNLOAD_LIST,
  LOAD_DOWNLOAD_LIST_SUCCESS,
  LOAD_DOWNLOAD_LIST_FAILURE,
  DOWNLOAD_FILE_SUCCESS,
  UPDATE_PROFILE_SUCCESS,
  GET_EXTERNAL_AUTH_PROVIDERS_SUCESS,
  DownloadStatus,
  GET_SERVER_CONFIGURATIONS_SUCCESS
} from './constants'

const initialState = {
  externalAuthProviders: null,
  logged: null,
  loginUser: null,
  loginLoading: false,
  navigator: true,
  downloadListLoading: false,
  downloadList: null,
  downloadListInfo: null,
  version: '',
  oauth2Enabled: false
}

const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case GET_EXTERNAL_AUTH_PROVIDERS_SUCESS:
        draft.externalAuthProviders = action.payload.externalAuthProviders
        break
      case LOGIN:
        draft.loginLoading = true
        break
      case LOGGED:
        draft.loginLoading = false
        draft.logged = true
        draft.loginUser = action.payload.user
        break
      case LOGIN_ERROR:
        draft.loginLoading = false
        break
      case ACTIVE_SUCCESS:
        draft.logged = true
        draft.loginUser = action.payload.user
        break
      case GET_SERVER_CONFIGURATIONS_SUCCESS:
        draft.version = action.payload.configurations.version
        draft.oauth2Enabled =
          action.payload.configurations.security.oauth2.enable
        break
      case LOGOUT:
        draft.logged = false
        draft.loginUser = null
        break
      case UPLOAD_AVATAR_SUCCESS:
        draft.loginUser.avatar = action.payload.path
        break
      case UPDATE_PROFILE_SUCCESS:
        const { id, name, department, description } = action.payload.user
        draft.loginUser = {
          ...draft.loginUser,
          id,
          name,
          department,
          description
        }
        break
      case SHOW_NAVIGATOR:
        draft.navigator = true
        break
      case HIDE_NAVIGATOR:
        draft.navigator = false
        break
      case LOAD_DOWNLOAD_LIST:
        draft.downloadListLoading = true
        break
      case LOAD_DOWNLOAD_LIST_SUCCESS:
        draft.downloadListLoading = false
        draft.downloadList = action.payload.list
        draft.downloadListInfo = action.payload.list.reduce((info, item) => {
          info[item.id] = {
            loading: false
          }
          return info
        }, {})
        break
      case LOAD_DOWNLOAD_LIST_FAILURE:
        draft.downloadListLoading = false
        break
      case DOWNLOAD_FILE_SUCCESS:
        draft.downloadList.find(({ id }) => action.payload.id === id).status =
          DownloadStatus.Downloaded
        break
    }
  })
export { initialState as appInitialState }
export default appReducer
