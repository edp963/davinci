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

import { Record } from 'immutable'
import { ISourceState } from './types'

import { ActionTypes } from './constants'

const SourceRecord = Record<ISourceState>({
  sources: null,
  listLoading: false,
  formLoading: false,
  testLoading: false,
  sourceFormValues: null,
  uploadFormValues: null
})
const initialState = new SourceRecord()

function sourceReducer (state = initialState, action) {
  const { type, payload } = action
  const sources = state.get('sources')

  switch (type) {
    case ActionTypes.LOAD_SOURCES:
      return state.set('listLoading', true)
    case ActionTypes.LOAD_SOURCES_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', payload.sources)
    case ActionTypes.LOAD_SOURCES_FAILURE:
      return state.set('listLoading', false)
    case ActionTypes.ADD_SOURCE:
      return state.set('formLoading', true)
    case ActionTypes.ADD_SOURCE_SUCCESS:
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
    case ActionTypes.ADD_SOURCE_FAILURE:
      return state.set('formLoading', false)
    case ActionTypes.DELETE_SOURCE:
      return state.set('listLoading', true)
    case ActionTypes.DELETE_SOURCE_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', sources.filter((g) => g.id !== payload.id))
    case ActionTypes.DELETE_SOURCE_FAILURE:
      return state.set('listLoading', false)
    case ActionTypes.LOAD_SOURCE_DETAIL:
      return state
    case ActionTypes.LOAD_SOURCE_DETAIL_SUCCESS:
      return state
    case ActionTypes.EDIT_SOURCE:
      return state.set('formLoading', true)
    case ActionTypes.EDIT_SOURCE_SUCCESS:
      sources.splice(sources.findIndex((g) => g.id === payload.result.id), 1, payload.result)
      return state
        .set('formLoading', false)
        .set('sources', sources.slice())
    case ActionTypes.EDIT_SOURCE_FAILURE:
      return state.set('formLoading', false)
    case ActionTypes.TEST_SOURCE_CONNECTION:
      return state.set('testLoading', true)
    case ActionTypes.TEST_SOURCE_CONNECTION_SUCCESS:
    case ActionTypes.TEST_SOURCE_CONNECTION_FAILURE:
      return state.set('testLoading', false)
    case ActionTypes.SET_SOURCE_FORM_VALUE:
      return state.set('sourceFormValues', payload.values)
    case ActionTypes.SET_UPLOAD_FORM_VALUE:
      return state.set('uploadFormValues', payload.values)
    default:
      return state
  }
}

export default sourceReducer
