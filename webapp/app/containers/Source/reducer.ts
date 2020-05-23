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
import { ISourceState } from './types'

import { ActionTypes } from './constants'
import { SourceActionType } from './actions'

const initialState: ISourceState = {
  sources: null,
  listLoading: false,
  formLoading: false,
  testLoading: false,
  resetLoading: false,
  datasourcesInfo: []
}

const sourceReducer = (state = initialState, action: SourceActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_SOURCES:
        draft.listLoading = true
        break
      case ActionTypes.LOAD_SOURCES_SUCCESS:
        draft.listLoading = false
        draft.sources = action.payload.sources
        break
      case ActionTypes.LOAD_SOURCES_FAILURE:
        draft.listLoading = false
        break

      case ActionTypes.ADD_SOURCE:
        draft.formLoading = true
        break
      case ActionTypes.ADD_SOURCE_SUCCESS:
        draft.sources = [action.payload.result].concat(draft.sources || [])
        draft.formLoading = false
        break
      case ActionTypes.ADD_SOURCE_FAILURE:
        draft.formLoading = false
        break

      case ActionTypes.DELETE_SOURCE:
        draft.listLoading = true
        break
      case ActionTypes.DELETE_SOURCE_SUCCESS:
        draft.listLoading = false
        draft.sources = draft.sources.filter((g) => g.id !== action.payload.id)
        break
      case ActionTypes.DELETE_SOURCE_FAILURE:
        draft.listLoading = false
        break

      case ActionTypes.EDIT_SOURCE:
        draft.formLoading = true
        break
      case ActionTypes.EDIT_SOURCE_SUCCESS:
        draft.sources.splice(
          draft.sources.findIndex((g) => g.id === action.payload.result.id),
          1,
          action.payload.result
        )
        draft.formLoading = false
        break
      case ActionTypes.EDIT_SOURCE_FAILURE:
        draft.formLoading = false
        break

      case ActionTypes.TEST_SOURCE_CONNECTION:
        draft.testLoading = true
        break
      case ActionTypes.TEST_SOURCE_CONNECTION_SUCCESS:
      case ActionTypes.TEST_SOURCE_CONNECTION_FAILURE:
        draft.testLoading = false
        break

      case ActionTypes.RESET_SOURCE_CONNECTION:
        draft.resetLoading = true
        break
      case ActionTypes.RESET_SOURCE_CONNECTION_SUCCESS:
      case ActionTypes.RESET_SOURCE_CONNECTION_FAILURE:
        draft.resetLoading = false
        break

      case ActionTypes.LOAD_DATASOURCES_INFO_SUCCESS:
        draft.datasourcesInfo = action.payload.info
        break
    }
  })

export default sourceReducer
