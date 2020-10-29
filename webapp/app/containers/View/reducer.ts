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
import pick from 'lodash/pick'
import { IViewState, IView, IFormedViews, IViewBase } from './types'
import { getFormedView, getValidModel } from './util'

import { ActionTypes, DEFAULT_SQL_LIMIT } from './constants'
import { ViewActionType } from './actions'

import { ActionTypes as SourceActionTypes } from 'containers/Source/constants'
import { SourceActionType } from 'containers/Source/actions'

import { ActionTypes as WidgetActionTypes } from 'containers/Widget/constants'
import { WidgetActionType } from 'containers/Widget/actions'
import { ActionTypes as DashboardActionTypes } from 'containers/Dashboard/constants'
import { DashboardActionType } from 'containers/Dashboard/actions'

import { ActionTypes as DisplayActionTypes } from 'containers/Display/constants'
import { DisplayActionType } from 'containers/Display/actions'
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router'

const emptyView: IView = {
  id: null,
  name: '',
  sql: '',
  model: '',
  variable: '',
  roles: [],
  config: '',
  description: '',
  projectId: null,
  sourceId: null
}

const initialState: IViewState = {
  views: [],
  formedViews: {},
  editingView: emptyView,
  editingViewInfo: {
    model: {},
    variable: [],
    roles: []
  },
  sources: [],
  schema: {
    mapDatabases: {},
    mapTables: {},
    mapColumns: {}
  },
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
    execute: false,
    copy: false
  },

  channels: [],
  tenants: [],
  bizs: [],
  cancelTokenSources: [],
  isLastExecuteWholeSql: true
}

const viewReducer = (
  state = initialState,
  action:
    | ViewActionType
    | WidgetActionType
    | DashboardActionType
    | DisplayActionType
    | SourceActionType
    | LocationChangeAction
): IViewState =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_VIEWS:
      case ActionTypes.DELETE_VIEW:
        draft.loading.view = true
        break
      case ActionTypes.LOAD_VIEWS_FAILURE:
      case ActionTypes.DELETE_VIEW_FAILURE:
        draft.loading.view = false
        break
      case ActionTypes.LOAD_VIEWS_SUCCESS:
        draft.views = action.payload.views
        draft.formedViews = Object.entries(draft.formedViews).reduce(
          (obj, [viewId, formedView]) => {
            const existView = action.payload.views.find(
              (v) => v.id === Number(viewId)
            )
            if (existView) {
              obj[viewId] = formedView
            }
            return obj
          },
          {}
        )
        draft.loading.view = false
        break
      case ActionTypes.LOAD_VIEWS_DETAIL:
        draft.formedViews = action.payload.viewIds.reduce((acc, id) => {
          if (!acc[id]) {
            acc[id] = {
              id,
              name: '',
              description: '',
              sql: '',
              config: '',
              sourceId: 0,
              projectId: 0,
              model: {},
              variable: [],
              roles: []
            }
          }
          return acc
        }, draft.formedViews)
        break
      case ActionTypes.LOAD_VIEWS_DETAIL_SUCCESS:
        const detailedViews = action.payload.views
        if (action.payload.isEditing) {
          draft.editingView = detailedViews[0]
          draft.editingViewInfo = pick(getFormedView(detailedViews[0]), [
            'model',
            'variable',
            'roles'
          ])
        }
        draft.formedViews = detailedViews.reduce((acc, view) => {
          const { id, model, variable, roles } = getFormedView(view)
          acc[id] = {
            ...view,
            model,
            variable,
            roles
          }
          return acc
        }, draft.formedViews)
        break
      case SourceActionTypes.LOAD_SOURCES_SUCCESS:
        draft.sources = action.payload.sources
        draft.schema = {
          mapDatabases: {},
          mapTables: {},
          mapColumns: {}
        }
        break
      case SourceActionTypes.LOAD_SOURCE_DATABASES_SUCCESS:
        const { sourceDatabases } = action.payload
        draft.schema.mapDatabases[sourceDatabases.sourceId] =
          sourceDatabases.databases
        break
      case SourceActionTypes.LOAD_SOURCE_DATABASE_TABLES_SUCCESS:
        const { databaseTables } = action.payload
        draft.schema.mapTables[
          `${databaseTables.sourceId}_${databaseTables.dbName}`
        ] = databaseTables
        break
      case SourceActionTypes.LOAD_SOURCE_TABLE_COLUMNS_SUCCESS:
        const { databaseName, tableColumns } = action.payload
        draft.schema.mapColumns[
          `${tableColumns.sourceId}_${databaseName}_${tableColumns.tableName}`
        ] = tableColumns
        break
      case ActionTypes.IS_LAST_EXECUTE_WHOLE_SQL:
        draft.isLastExecuteWholeSql = action.payload.isLastExecuteWholeSql
        break
      case ActionTypes.EXECUTE_SQL:
        draft.loading.execute = true
        draft.sqlValidation = { code: null, message: null }
        break
      case ActionTypes.EXECUTE_SQL_SUCCESS:
        const sqlResponse = action.payload.result
        const validModel = getValidModel(
          draft.editingViewInfo.model,
          sqlResponse.payload.columns
        )
        draft.sqlDataSource = sqlResponse.payload
        draft.editingViewInfo.model = validModel
        draft.loading.execute = false
        draft.sqlValidation = {
          code: sqlResponse.header.code,
          message: sqlResponse.header.msg
        }
        break
      case ActionTypes.EXECUTE_SQL_FAILURE:
        draft.sqlDataSource = {
          ...draft.sqlDataSource,
          columns: [],
          totalCount: 0,
          resultList: []
        }
        draft.loading.execute = false
        draft.sqlValidation = {
          code: action.payload.err.code,
          message: action.payload.err.msg
        }
        break
      case ActionTypes.EXECUTE_SQL_CANCEL:
        draft.sqlDataSource = {
          ...draft.sqlDataSource,
          columns: [],
          totalCount: 0,
          resultList: []
        }
        draft.loading.execute = false
        break
      case ActionTypes.UPDATE_EDITING_VIEW:
        draft.editingView = action.payload.view
        break
      case ActionTypes.UPDATE_EDITING_VIEW_INFO:
        draft.editingViewInfo = action.payload.viewInfo
        break
      case ActionTypes.SET_SQL_LIMIT:
        draft.sqlLimit = action.payload.limit
        break
      case ActionTypes.EDIT_VIEW_SUCCESS:
        draft.editingView = emptyView
        draft.editingViewInfo = { model: {}, variable: [], roles: [] }
        draft.formedViews[action.payload.result.id] = getFormedView(
          action.payload.result
        )
        break

      case ActionTypes.COPY_VIEW:
        draft.loading.copy = true
        break
      case ActionTypes.COPY_VIEW_SUCCESS:
        const fromViewId = action.payload.fromViewId
        const { id, name, description, source } = action.payload.result
        const copiedView: IViewBase = {
          id,
          name,
          description,
          sourceName: source.name
        }
        draft.views.splice(
          draft.views.findIndex(({ id }) => id === fromViewId) + 1,
          0,
          copiedView
        )
        draft.loading.copy = false
        break
      case ActionTypes.COPY_VIEW_FAILURE:
        draft.loading.copy = false
        break

      case ActionTypes.LOAD_DAC_CHANNELS_SUCCESS:
        draft.channels = action.payload.channels
        break
      case ActionTypes.LOAD_DAC_TENANTS_SUCCESS:
        draft.tenants = action.payload.tenants
        break
      case ActionTypes.LOAD_DAC_TENANTS_FAILURE:
        draft.tenants = []
        break
      case ActionTypes.LOAD_DAC_BIZS_SUCCESS:
        draft.bizs = action.payload.bizs
        break
      case ActionTypes.LOAD_DAC_BIZS_FAILURE:
        draft.bizs = []
        break
      case ActionTypes.RESET_VIEW_STATE:
        return initialState
        break
      case WidgetActionTypes.LOAD_WIDGET_DETAIL_SUCCESS:
        const widgetView = action.payload.view
        draft.formedViews[widgetView.id] = {
          ...widgetView,
          model: JSON.parse(widgetView.model || '{}'),
          variable: JSON.parse(widgetView.variable || '[]')
        }
        break
      case DashboardActionTypes.LOAD_DASHBOARD_DETAIL_SUCCESS:
      case DisplayActionTypes.LOAD_SLIDE_DETAIL_SUCCESS:
        draft.formedViews = {
          ...draft.formedViews,
          ...action.payload.formedViews
        }
        break
      case ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
      case ActionTypes.LOAD_SELECT_OPTIONS:
        draft.cancelTokenSources.push(action.payload.cancelTokenSource)
        break
      case LOCATION_CHANGE:
        if (state.cancelTokenSources.length) {
          state.cancelTokenSources.forEach((source) => {
            source.cancel()
          })
          draft.cancelTokenSources = []
        }
        break
      default:
        break
    }
  })

export { initialState as viewInitialState }
export default viewReducer
