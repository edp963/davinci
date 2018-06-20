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
  SHOW_NAVIGATOR,
  HIDE_NAVIGATOR
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  logged: false,
  loginUser: null,
  loginLoading: false,
  navigator: true
})

function appReducer (state = initialState, action) {
  const { type, payload } = action
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
    case LOGOUT:
      return state
        .set('logged', false)
        .set('loginUser', null)
    case SET_LOGIN_USER:
      return state
        .set('loginUser', payload.user)
    case SHOW_NAVIGATOR:
      return state.set('navigator', true)
    case HIDE_NAVIGATOR:
      return state.set('navigator', false)
    default:
      return state
  }
}

export default appReducer
