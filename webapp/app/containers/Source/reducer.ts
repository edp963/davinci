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
import { SourceActionType } from './actions'

const SourceRecord = Record<ISourceState>({
  sources: null,
  listLoading: false,
  formLoading: false,
  testLoading: false,
  datasourcesInfo: []
})
const initialState = new SourceRecord()

function sourceReducer (state = initialState, action: SourceActionType) {
  const sources = state.get('sources')

  switch (action.type) {
    case ActionTypes.LOAD_SOURCES:
      return state.set('listLoading', true)
    case ActionTypes.LOAD_SOURCES_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', action.payload.sources)
    case ActionTypes.LOAD_SOURCES_FAILURE:
      return state.set('listLoading', false)
    case ActionTypes.ADD_SOURCE:
      return state.set('formLoading', true)
    case ActionTypes.ADD_SOURCE_SUCCESS:
      const updatedSources = (sources || [])
      updatedSources.unshift(action.payload.result)
      return state
        .set('formLoading', false)
        .set('sources', updatedSources.slice())
    case ActionTypes.ADD_SOURCE_FAILURE:
      return state.set('formLoading', false)
    case ActionTypes.DELETE_SOURCE:
      return state.set('listLoading', true)
    case ActionTypes.DELETE_SOURCE_SUCCESS:
      return state
        .set('listLoading', false)
        .set('sources', sources.filter((g) => g.id !== action.payload.id))
    case ActionTypes.DELETE_SOURCE_FAILURE:
      return state.set('listLoading', false)
    case ActionTypes.EDIT_SOURCE:
      return state.set('formLoading', true)
    case ActionTypes.EDIT_SOURCE_SUCCESS:
      sources.splice(sources.findIndex((g) => g.id === action.payload.result.id), 1, action.payload.result)
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
    case ActionTypes.LOAD_DATASOURCES_INFO_SUCCESS:
      return state.set('datasourcesInfo', action.payload.info)
    default:
      return state
  }
}

export type SourceStateType = typeof initialState

export default sourceReducer
