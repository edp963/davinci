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
  LOAD_SOURCES,
  LOAD_SOURCES_SUCCESS,
  LOAD_SOURCES_FAILURE,
  ADD_SOURCE,
  ADD_SOURCE_SUCCESS,
  ADD_SOURCE_FAILURE,
  DELETE_SOURCE,
  DELETE_SOURCE_SUCCESS,
  DELETE_SOURCE_FAILURE,
  LOAD_SOURCE_DETAIL,
  LOAD_SOURCE_DETAIL_SUCCESS,
  EDIT_SOURCE,
  EDIT_SOURCE_SUCCESS,
  EDIT_SOURCE_FAILURE,
  TEST_SOURCE_CONNECTION,
  TEST_SOURCE_CONNECTION_SUCCESS,
  TEST_SOURCE_CONNECTION_FAILURE,
  GET_CSV_META_ID,
  GET_CSV_META_ID_SUCCESS,
  GET_CSV_META_ID_FAILURE,
  SET_SOURCE_FORM_VALUE,
  SET_UPLOAD_FORM_VALUE
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  sources: null,
  listLoading: false,
  formLoading: false,
  testLoading: false,
  sourceFormValues: null,
  uploadFormValues: null
})

function sourceReducer (state = initialState, action) {
  const { type, payload } = action
  const sources = state.get('sources')

  switch (type) {
    case LOAD_SOURCES:
      return state.set('listLoading', true)
    case LOAD_SOURCES_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', payload.sources)
    case LOAD_SOURCES_FAILURE:
      return state.set('listLoading', false)
    case ADD_SOURCE:
      return state.set('formLoading', true)
    case ADD_SOURCE_SUCCESS:
      if (sources) {
        sources.unshift(payload.result)
        return state
          .set('formLoading', false)
          .set('sources', sources.slice())
      } else {
        return state
          .set('formLoading', false)
          .set('sources', [payload.result])
      }
    case ADD_SOURCE_FAILURE:
      return state.set('formLoading', false)
    case DELETE_SOURCE:
      return state.set('listLoading', true)
    case DELETE_SOURCE_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', sources.filter((g) => g.id !== payload.id))
    case DELETE_SOURCE_FAILURE:
      return state.set('listLoading', false)
    case LOAD_SOURCE_DETAIL:
      return state
    case LOAD_SOURCE_DETAIL_SUCCESS:
      return state
    case EDIT_SOURCE:
      return state.set('formLoading', true)
    case EDIT_SOURCE_SUCCESS:
      sources.splice(sources.findIndex((g) => g.id === payload.result.id), 1, payload.result)
      return state
        .set('formLoading', false)
        .set('sources', sources.slice())
    case EDIT_SOURCE_FAILURE:
      return state.set('formLoading', false)
    case TEST_SOURCE_CONNECTION:
      return state.set('testLoading', true)
    case TEST_SOURCE_CONNECTION_SUCCESS:
    case TEST_SOURCE_CONNECTION_FAILURE:
      return state.set('testLoading', false)
    case SET_SOURCE_FORM_VALUE:
      return state.set('sourceFormValues', payload.values)
    case SET_UPLOAD_FORM_VALUE:
      return state.set('uploadFormValues', payload.values)
    default:
      return state
  }
}

export default sourceReducer
