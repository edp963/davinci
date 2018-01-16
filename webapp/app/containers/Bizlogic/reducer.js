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
  LOAD_BIZLOGICS_SUCCESS,
  ADD_BIZLOGIC_SUCCESS,
  DELETE_BIZLOGIC_SUCCESS,
  EDIT_BIZLOGIC_SUCCESS,
  SQL_VALIDATE_SUCCESS
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  bizlogics: false,
  sqlValidateCode: false,
  sqlValidateMessage: false
})

function bizlogicReducer (state = initialState, { type, payload }) {
  const bizlogics = state.get('bizlogics')
  switch (type) {
    case LOAD_BIZLOGICS_SUCCESS:
      return state.set('bizlogics', payload.bizlogics)
    case ADD_BIZLOGIC_SUCCESS:
      if (bizlogics) {
        bizlogics.unshift(payload.result)
        return state.set('bizlogics', bizlogics.slice())
      } else {
        return state.set('bizlogics', [payload.result])
      }
    case DELETE_BIZLOGIC_SUCCESS:
      return state.set('bizlogics', bizlogics.filter(g => g.id !== payload.id))
    case EDIT_BIZLOGIC_SUCCESS:
      bizlogics.splice(bizlogics.findIndex(g => g.id === payload.result.id), 1, payload.result)
      return state.set('bizlogics', bizlogics.slice())
    case SQL_VALIDATE_SUCCESS:
      return state.set('sqlValidateMessage', payload && payload.msg ? payload.msg : undefined)
            .set('sqlValidateCode', payload && payload.code ? payload.code : undefined)
    default:
      return state
  }
}

export default bizlogicReducer
