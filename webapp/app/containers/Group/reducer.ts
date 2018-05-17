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
  LOAD_GROUPS,
  LOAD_GROUPS_SUCCESS,
  LOAD_GROUP_FAILURE,
  ADD_GROUP,
  ADD_GROUP_SUCCESS,
  ADD_GROUP_FAILURE,
  DELETE_GROUP,
  DELETE_GROUP_SUCCESS,
  DELETE_GROUP_FAILURE,
  // LOAD_GROUP_DETAIL,
  // LOAD_GROUP_DETAIL_SUCCESS,
  EDIT_GROUP,
  EDIT_GROUP_SUCCESS,
  EDIT_GROUP_FAILURE
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  groups: false,
  tableLoading: false,
  formLoading: false
})

function groupReducer (state = initialState, action) {
  const { type, payload } = action
  const groups = state.get('groups')
  switch (type) {
    case LOAD_GROUPS:
      return state.set('tableLoading', true)
    case LOAD_GROUPS_SUCCESS:
      return state
        .set('groups', payload.groups)
        .set('tableLoading', false)
    case LOAD_GROUP_FAILURE:
      return state.set('tableLoading', false)
    case ADD_GROUP:
      return state.set('formLoading', true)
    case ADD_GROUP_SUCCESS:
      if (groups) {
        groups.unshift(payload.result)
        return state
          .set('groups', groups.slice())
          .set('formLoading', false)
      } else {
        return state
          .set('groups', [payload.result])
          .set('formLoading', false)
      }
    case ADD_GROUP_FAILURE:
      return state.set('formLoading', false)
    case DELETE_GROUP:
      return state
    case DELETE_GROUP_SUCCESS:
      return state.set('groups', groups.filter((g) => g.id !== payload.id))
    case DELETE_GROUP_FAILURE:
      return state
    // case LOAD_GROUP_DETAIL:
    //   return state
    // case LOAD_GROUP_DETAIL_SUCCESS:
    //   return state
    case EDIT_GROUP:
      return state.set('formLoading', true)
    case EDIT_GROUP_SUCCESS:
      groups.splice(groups.findIndex((g) => g.id === payload.result.id), 1, payload.result)
      return state
        .set('groups', groups.slice())
        .set('formLoading', false)
    case EDIT_GROUP_FAILURE:
      return state.set('formLoading', false)
    default:
      return state
  }
}

export default groupReducer
