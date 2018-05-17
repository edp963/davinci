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
  SQL_VALIDATE_SUCCESS
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  bizlogics: false,
  sqlValidateCode: false,
  sqlValidateMessage: false,
  tableLoading: false,
  formLoading: false
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
      return state.set('formLoading', true)
    case ADD_BIZLOGIC_SUCCESS:
      if (bizlogics) {
        bizlogics.unshift(payload.result)
        return state
          .set('bizlogics', bizlogics.slice())
          .set('formLoading', false)
      } else {
        return state
          .set('bizlogics', [payload.result])
          .set('formLoading', false)
      }
    case ADD_BIZLOGIC_FAILURE:
      return state.set('formLoading', false)
    case DELETE_BIZLOGIC:
      return state
    case DELETE_BIZLOGIC_SUCCESS:
      return state.set('bizlogics', bizlogics.filter((g) => g.id !== payload.id))
    case DELETE_BIZLOGIC_FAILURE:
      return state
    case EDIT_BIZLOGIC:
      return state.set('formLoading', true)
    case EDIT_BIZLOGIC_SUCCESS:
      bizlogics.splice(bizlogics.findIndex((g) => g.id === payload.result.id), 1, payload.result)
      return state
        .set('bizlogics', bizlogics.slice())
        .set('formLoading', false)
    case EDIT_BIZLOGIC_FAILURE:
      return state.set('formLoading', false)
    case SQL_VALIDATE_SUCCESS:
      return state.set('sqlValidateMessage', payload && payload.msg ? payload.msg : undefined)
            .set('sqlValidateCode', payload && payload.code ? payload.code : undefined)
    default:
      return state
  }
}

export default bizlogicReducer
