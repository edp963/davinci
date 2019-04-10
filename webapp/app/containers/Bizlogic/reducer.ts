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
  LOAD_BIZLOGICS,
  LOAD_BIZLOGICS_SUCCESS,
  ADD_BIZLOGIC,
  ADD_BIZLOGIC_SUCCESS,
  ADD_BIZLOGIC_FAILURE,
  DELETE_BIZLOGIC,
  DELETE_BIZLOGIC_SUCCESS,
  DELETE_BIZLOGIC_FAILURE,
  EDIT_BIZLOGIC,
  EDIT_BIZLOGIC_SUCCESS,
  EDIT_BIZLOGIC_FAILURE,
  EXECUTE_SQL,
  EXECUTE_SQL_SUCCESS,
  EXECUTE_SQL_FAILURE,
  LOAD_VIEW_TEAM,
  LOAD_VIEW_TEAM_SUCCESS,
  LOAD_VIEW_TEAM_FAILURE,
  RESET_VIEW_STATE
} from './constants'
import { LOAD_DASHBOARD_DETAIL_SUCCESS } from '../Dashboard/constants'
import { ActionTypes } from '../Display/constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  bizlogics: null,
  sqlValidateCode: false,
  sqlValidateMessage: false,
  tableLoading: false,
  modalLoading: false,
  schemaData: [],
  viewTeam: [],
  executeLoading: false
})

function bizlogicReducer (state = initialState, action) {
  const { type, payload } = action
  const bizlogics = state.get('bizlogics')
  switch (type) {
    case LOAD_BIZLOGICS:
      return state.set('tableLoading', true)
    case LOAD_BIZLOGICS_SUCCESS:
      return state
        .set('bizlogics', payload.bizlogics)
        .set('tableLoading', false)
    case ADD_BIZLOGIC:
      return state.set('modalLoading', true)
    case ADD_BIZLOGIC_SUCCESS:
      // if (bizlogics) {
      //   bizlogics.unshift(payload.result)
      //   return state
      //     .set('bizlogics', bizlogics.slice())
      //     .set('modalLoading', false)
      // } else {
        return state
          .set('bizlogics', [payload.result])
          .set('modalLoading', false)
      // }
    case ADD_BIZLOGIC_FAILURE:
      return state.set('modalLoading', false)
    case DELETE_BIZLOGIC:
      return state
    case DELETE_BIZLOGIC_SUCCESS:
      return state.set('bizlogics', bizlogics.filter((g) => g.id !== payload.id))
    case DELETE_BIZLOGIC_FAILURE:
      return state
    case EDIT_BIZLOGIC:
      return state.set('modalLoading', true)
    case EDIT_BIZLOGIC_SUCCESS:
      bizlogics.splice(bizlogics.findIndex((g) => g.id === payload.result.id), 1, payload.result)
      return state
        .set('bizlogics', bizlogics.slice())
        .set('modalLoading', false)
    case EDIT_BIZLOGIC_FAILURE:
      return state.set('modalLoading', false)
    case EXECUTE_SQL:
      return state.set('executeLoading', true)
    case EXECUTE_SQL_SUCCESS:
      const { code, msg } = payload.result
      return state.set('executeLoading', false)
            .set('sqlValidateMessage', undefined)
            .set('sqlValidateCode', 200)
    case EXECUTE_SQL_FAILURE:
      return state.set('executeLoading', false)
            .set('sqlValidateMessage', payload.error.response.data.header.msg)
            .set('sqlValidateCode', 1)
    case LOAD_VIEW_TEAM:
      return state
    case LOAD_VIEW_TEAM_SUCCESS:
      return state.set('viewTeam', payload.result)
    case LOAD_VIEW_TEAM_FAILURE:
      return state
    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state.set('bizlogics', payload.bizlogics)
    case ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
      return state.set('bizlogics', payload.bizlogics)
    case RESET_VIEW_STATE:
      return fromJS(initialState)
    default:
      return state
  }
}

export default bizlogicReducer
