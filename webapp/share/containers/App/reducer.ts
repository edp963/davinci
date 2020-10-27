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

import produce from 'immer'
import { ActionTypes } from './constants'
import { Tmode } from 'app/components/SharePanel/types'

interface IState {
  loading: boolean,
  logged: boolean,
  loginUser: object
  shareType: Tmode
  vizType: 'dashboard' | 'widget' | 'display' | ''
  permissionLoading: boolean
  download: boolean
}

export const initialState: IState = {
  loading: false,
  logged: false,
  loginUser: null,
  shareType: '',
  vizType: '',
  permissionLoading: false,
  download: false
}

const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOGIN:
        draft.loading = true
        break
      case ActionTypes.LOGGED:
        draft.loading = false
        draft.logged = true
        draft.loginUser = action.payload.user
        break
      case ActionTypes.LOGON_FAILURE:
        draft.loading = false
        break
      case ActionTypes.LOGOUT:
        draft.logged = false
        draft.loginUser = null
        break
      case ActionTypes.INTERCEPTOR_PREFLIGHT_SUCCESS:
        draft.shareType = action.payload.shareType
        draft.vizType = action.payload.vizType
        break
      case ActionTypes.GET_PERMISSIONS:
        draft.permissionLoading = true
        break
      case ActionTypes.GET_PERMISSIONS_SUCCESS:
        draft.permissionLoading = false
        draft.download = action.payload.download
        break
      case ActionTypes.GET_PERMISSIONS_FAIL:
        draft.permissionLoading = false
    }
  })

export default appReducer
