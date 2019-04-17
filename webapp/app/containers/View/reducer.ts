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
import { IViewState } from './types'

import { ActionTypes } from './constants'
import { ViewActionType } from './actions'

import { ActionTypes as SourceActionTypes } from 'containers/Source/constants'
import { SourceActionType } from 'containers/Source/actions'


const ViewRecord = Record<IViewState>({
  views: [],
  sources: [],
  tables: [],
  mapTableColumns: {},
  sqlValidation: {
    code: 200,
    message: null
  },
  loading: {
    table: false,
    modal: false,
    execute: false
  }
})
const initialState = new ViewRecord()

function viewReducer (state = initialState, action: ViewActionType | SourceActionType): ViewStateType {
  const views = state.get('views')
  const mapTableColumns = state.get('mapTableColumns')

  switch (action.type) {
    case ActionTypes.LOAD_VIEWS_SUCCESS:
      return state.set('views', action.payload.views)
    case SourceActionTypes.LOAD_SOURCES_SUCCESS:
      return state.set('sources', action.payload.sources)
    case SourceActionTypes.LOAD_SOURCE_TABLES_SUCCESS:
      return state
        .set('tables', action.payload.tables)
        .set('mapTableColumns', {})
    case SourceActionTypes.LOAD_SOURCE_TABLE_COLUMNS_SUCCESS:
      const { tableColumns } = action.payload
      return state.set('mapTableColumns', {
        ...mapTableColumns,
        [tableColumns.tableName]: tableColumns
      })
    default:
      return state
  }
}

export type ViewStateType = typeof initialState

export default viewReducer
