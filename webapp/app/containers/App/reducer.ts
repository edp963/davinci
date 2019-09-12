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
  SHOW_NAVIGATOR,
  HIDE_NAVIGATOR,
  ACTIVE_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  LOAD_DOWNLOAD_LIST,
  LOAD_DOWNLOAD_LIST_SUCCESS,
  LOAD_DOWNLOAD_LIST_FAILURE,
  DOWNLOAD_FILE_SUCCESS
} from './constants'
import { fromJS } from 'immutable'
import { DownloadStatus } from './types'


const initialState = fromJS({
  logged: false,
  loginUser: null,
  loginLoading: false,
  navigator: true,
  downloadListLoading: false,
  downloadList: null,
  downloadListInfo: null
})

function appReducer (state = initialState, action) {
  const { type, payload } = action
  const loginUser = state.get('loginUser')
  const downloadList = state.get('downloadList')
  switch (type) {
    case LOGIN:
      return state
        .set('loginLoading', true)
    case LOGGED:
      return state
        .set('loginLoading', false)
        .set('logged', true)
        .set('loginUser', payload.user)
    case LOGIN_ERROR:
      return state
        .set('loginLoading', false)
    case ACTIVE_SUCCESS:
      return state
        .set('logged', true)
        .set('loginUser', payload.user)
    case LOGOUT:
      return state
        .set('logged', false)
        .set('loginUser', null)
    case UPLOAD_AVATAR_SUCCESS:
      const newLoginUser = {...loginUser, ...{avatar: payload.path}}
      localStorage.setItem('loginUser', JSON.stringify(newLoginUser))
      return state
        .set('loginUser', newLoginUser)
    case SHOW_NAVIGATOR:
      return state.set('navigator', true)
    case HIDE_NAVIGATOR:
      return state.set('navigator', false)
    case LOAD_DOWNLOAD_LIST:
      return state.set('downloadListLoading', true)
    case LOAD_DOWNLOAD_LIST_SUCCESS:
      return state
        .set('downloadListLoading', false)
        .set('downloadList', payload.list)
        .set('downloadListInfo', payload.list.reduce((info, item) => {
          info[item.id] = {
            loading: false
          }
          return info
        }, {}))
    case LOAD_DOWNLOAD_LIST_FAILURE:
      return state.set('downloadListLoading', false)
    case DOWNLOAD_FILE_SUCCESS:
      return state.set('downloadList', downloadList.map((item) => {
        return item.id === payload.id
          ? { ...item, status: DownloadStatus.Downloaded }
          : item
      }))
    default:
      return state
  }
}

export default appReducer
