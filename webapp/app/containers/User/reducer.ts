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
  LOAD_USERS,
  LOAD_USERS_SUCCESS,
  LOAD_USERS_FAILURE,
  ADD_USER,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  DELETE_USER,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  // LOAD_USER_DETAIL,
  // LOAD_USER_DETAIL_SUCCESS,
  EDIT_USER_INFO,
  EDIT_USER_INFO_SUCCESS,
  EDIT_USER_INFO_FAILURE
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  users: false,
  tableLoading: false,
  formLoading: false
})

function userReducer (state = initialState, action) {
  const { type, payload } = action
  const users = state.get('users')
  switch (type) {
    case LOAD_USERS:
      return state.set('tableLoading', true)
    case LOAD_USERS_SUCCESS:
      return state
        .set('users', payload.users)
        .set('tableLoading', false)
    case LOAD_USERS_FAILURE:
      return state.set('tableLoading', false)
    case ADD_USER:
      return state.set('formLoading', true)
    case ADD_USER_SUCCESS:
      if (users) {
        users.unshift(payload.result)
        return state
          .set('users', users.slice())
          .set('formLoading', false)
      } else {
        return state
          .set('users', [payload.result])
          .set('formLoading', false)
      }
    case ADD_USER_FAILURE:
      return state.set('formLoading', false)
    case DELETE_USER:
      return state
    case DELETE_USER_SUCCESS:
      return state.set('users', users.filter((u) => u.id !== payload.id))
    case DELETE_USER_FAILURE:
      return state
    // case LOAD_USER_DETAIL:
    //   return state
    // case LOAD_USER_DETAIL_SUCCESS:
    //   return state
    case EDIT_USER_INFO:
      return state.set('formLoading', true)
    case EDIT_USER_INFO_SUCCESS:
      users.splice(users.findIndex((u) => u.id === payload.result.id), 1, payload.result)
      return state
        .set('users', users.slice())
        .set('formLoading', false)
    case EDIT_USER_INFO_FAILURE:
      return state.set('formLoading', false)
    default:
      return state
  }
}

export default userReducer
