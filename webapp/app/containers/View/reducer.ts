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
import { IViewState, IViewModel } from './types'

import { ActionTypes, DEFAULT_SQL_LIMIT, DEFAULT_PAGE_SIZE } from './constants'
import { ViewActionType } from './actions'

import { ActionTypes as SourceActionTypes } from 'containers/Source/constants'
import { SourceActionType } from 'containers/Source/actions'


const ViewRecord = Record<IViewState>({
  views: [],
  editingView: null,
  editingViewInfo: {
    model: [],
    variable: []
  },
  sources: [],
  tables: [],
  mapTableColumns: {},
  sqlValidation: {
    code: null,
    message: null
  },
  sqlDataSource: {
    columns: [],
    totalCount: 0,
    resultList: []
  },
  sqlLimit: DEFAULT_SQL_LIMIT,
  loading: {
    view: false,
    table: false,
    modal: false,
    execute: false
  }
})
const initialState = new ViewRecord()

function viewReducer (state = initialState, action: ViewActionType | SourceActionType): ViewStateType {
  const mapTableColumns = state.get('mapTableColumns')
  const sqlDatasource = state.get('sqlDataSource')
  const loading = state.get('loading')

  switch (action.type) {
    case ActionTypes.LOAD_VIEWS:
    case ActionTypes.DELETE_VIEW:
      return state.set('loading', { ...loading, view: true })
    case ActionTypes.LOAD_VIEWS_FAILURE:
    case ActionTypes.DELETE_VIEW_FAILURE:
      return state.set('loading', { ...loading, view: false })
    case ActionTypes.LOAD_VIEWS_SUCCESS:
      return state
        .set('views', action.payload.views)
        .set('loading', { ...loading, view: false })
    case ActionTypes.LOAD_VIEW_DETAIL_SUCCESS:
      const { variable, model } = action.payload.view
      return state
        .set('editingView', action.payload.view)
        .set('editingViewInfo', {
          model: JSON.parse((model || '[]')),
          variable: JSON.parse((variable || '[]'))
        })
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
    case ActionTypes.EXECUTE_SQL:
      return state
        .set('loading', { ...loading, execute: true })
        .set('sqlValidation', { code: null, message: null })
    case ActionTypes.EXECUTE_SQL_SUCCESS:
      return state
        .set('sqlDataSource', action.payload.result.payload)
        .set('loading', { ...loading, execute: false })
        .set('sqlValidation', {
          code: action.payload.result.header.code,
          message: action.payload.result.header.msg
        })
    case ActionTypes.EXECUTE_SQL_FAILURE:
      return state
        .set('sqlDataSource', {
          ...sqlDatasource,
          columns: [],
          totalCount: 0,
          resultList: []
        })
        .set('loading', { ...loading, execute: false })
        .set('sqlValidation', {
          code: action.payload.err.code,
          message: action.payload.err.msg
        })
    case ActionTypes.SET_SQL_LIMIT:
      return state.set('sqlLimit', action.payload.limit)
    case ActionTypes.RESET_VIEW_STATE:
      return new ViewRecord()
    default:
      return state
  }
}

export type ViewStateType = typeof initialState

export default viewReducer
