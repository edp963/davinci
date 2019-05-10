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
import { IViewState, IViewModel, IFormedView, IFormedViews } from './types'
import { getValidModel } from './util'

import { ActionTypes, DEFAULT_SQL_LIMIT } from './constants'
import { ViewActionType } from './actions'

import { ActionTypes as SourceActionTypes } from 'containers/Source/constants'
import { SourceActionType } from 'containers/Source/actions'

import { LOAD_DASHBOARD_DETAIL, LOAD_DASHBOARD_DETAIL_SUCCESS } from 'containers/Dashboard/constants'

import { ActionTypes as DisplayActionTypes } from 'containers/Display/constants'

const ViewRecord = Record<IViewState>({
  views: [],
  formedViews: {},
  editingView: null,
  editingViewInfo: {
    model: {},
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

function viewReducer (state = initialState, action: ViewActionType | SourceActionType | any): ViewStateType {
  const mapTableColumns = state.get('mapTableColumns')
  const sqlDatasource = state.get('sqlDataSource')
  const editingViewInfo = state.get('editingViewInfo')
  const formedViews = state.get('formedViews')
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
      const { id: viewId, variable, model } = action.payload.view
      const formedModel = JSON.parse((model || '{}'))
      const formedVariable = JSON.parse((variable || '[]'))
      return state
        .set('editingView', action.payload.view)
        .set('editingViewInfo', {
          model: formedModel,
          variable: formedVariable
        })
        .set('formedViews', {
          ...formedViews,
          [viewId]: {
            ...action.payload.view,
            model: formedModel,
            variable: formedVariable
          }
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
      const sqlResponse = action.payload.result
      const validModel = getValidModel(editingViewInfo.model, sqlResponse.payload.columns)
      return state
        .set('sqlDataSource', sqlResponse.payload)
        .set('editingViewInfo', {
          ...editingViewInfo,
          model: validModel
        })
        .set('loading', { ...loading, execute: false })
        .set('sqlValidation', {
          code: sqlResponse.header.code,
          message: sqlResponse.header.msg
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
    case LOAD_DASHBOARD_DETAIL_SUCCESS:
    case DisplayActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
      const updatedViews: IFormedViews = action.payload.views.reduce((obj, view) => {
        obj[view.id] = {
          ...view,
          model: JSON.parse(view.model || '{}'),
          variable: JSON.parse(view.variable || '[]')
        }
        return obj
      }, {})
      return state.set('formedViews', { ...formedViews, ...updatedViews })
    default:
      return state
  }
}

export type ViewStateType = typeof initialState

export default viewReducer
