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
import {
  LOGIN,
  LOGGED,
  LOGOUT,
  LOGON_FAILURE
} from './constants'

const initialState = {
  loading: false,
  logged: false,
  loginUser: null
}

const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOGIN:
        draft.loading = true
        break
      case LOGGED:
        draft.loading = false
        draft.logged = true
        draft.loginUser = action.payload.user
        break
      case LOGON_FAILURE:
        draft.loading = false
        break
      case LOGOUT:
        draft.logged = false
        draft.loginUser = null
        break
    }
  })

export default appReducer
