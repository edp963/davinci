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

import { fromJS } from 'immutable'

import {
  LOAD_SHARE_DASHBOARD_SUCCESS,
  LOAD_SHARE_WIDGET_SUCCESS,
  SET_INDIVIDUAL_DASHBOARD,
  LOAD_SHARE_RESULTSET,
  LOAD_SHARE_RESULTSET_SUCCESS,
  LOAD_SHARE_RESULTSET_FAILURE,
  LOAD_WIDGET_CSV,
  LOAD_WIDGET_CSV_SUCCESS,
  LOAD_WIDGET_CSV_FAILURE,
  LOAD_SELECT_OPTIONS_SUCCESS,
  RESIZE_ALL_DASHBOARDITEM,
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY,
  SET_SELECT_OPTIONS,
  SELECT_DASHBOARD_ITEM_CHART,
  GLOBAL_CONTROL_CHANGE,
  LOAD_DOWNLOAD_LIST,
  LOAD_DOWNLOAD_LIST_SUCCESS,
  LOAD_DOWNLOAD_LIST_FAILURE,
  DOWNLOAD_FILE_SUCCESS,
  SEND_SHARE_PARAMS
} from './constants'
import {
  IMapItemControlRequestParams,
  IControlRequestParams,
  IGlobalControl,
  IControlRelatedField
} from 'app/components/Filters/types'
import {
  getVariableValue,
  getModelValue,
  deserializeDefaultValue
} from 'app/components/Filters/util'
import { globalControlMigrationRecorder } from 'app/utils/migrationRecorders'
import { DashboardItemStatus } from '.'
import { DownloadStatus } from 'app/containers/App/types'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

const initialState = fromJS({
  dashboard: null,
  title: '',
  config: '{}',
  dashboardSelectOptions: null,
  widgets: null,
  items: null,
  itemsInfo: null,
  downloadListLoading: false,
  downloadList: null,
  downloadListInfo: null,
  shareParams: null
})

function shareReducer (state = initialState, { type, payload }) {
  const dashboardSelectOptions = state.get('dashboardSelectOptions')
  const itemsInfo = state.get('itemsInfo')
  let widgets = state.get('widgets')
  const downloadList = state.get('downloadList')
  const shareParams = state.get('shareParams')
  switch (type) {
    case SEND_SHARE_PARAMS:
      return state.set('shareParams', payload.params)
    case LOAD_SHARE_DASHBOARD_SUCCESS:
      const dashboardConfig = payload.dashboard.config ? JSON.parse(payload.dashboard.config) : {}
      const globalControls = (dashboardConfig.filters || []).map((c) => globalControlMigrationRecorder(c)).map((ctrl) => {
        const {relatedViews} = ctrl
        let newCtrl = {...ctrl}
        if (shareParams) {
          Object.entries(relatedViews).forEach(([key, value]) => {
            const defaultValue = shareParams[value['name']]
            if (defaultValue && defaultValue.length) {
               newCtrl = {
                 ...ctrl,
                 defaultValue: decodeURI(defaultValue)
               }
            }
          })
        }
        return newCtrl
      })

      const globalControlsInitialValue = {}
      globalControls.forEach((control: IGlobalControl) => {
        const { interactionType, relatedItems, relatedViews } = control
        const defaultValue = deserializeDefaultValue(control)
        if (defaultValue) {
          Object.entries(relatedItems).forEach(([itemId, config]) => {
            Object.entries(relatedViews).forEach(([viewId, fields]) => {
              if (config.checked && config.viewId === Number(viewId)) {
                const filterValue = interactionType === 'column'
                  ? getModelValue(control, fields as IControlRelatedField, defaultValue)
                  : getVariableValue(control, fields, defaultValue)
                if (!globalControlsInitialValue[itemId]) {
                  globalControlsInitialValue[itemId] = {
                    filters: [],
                    variables: []
                  }
                }
                if (interactionType === 'column') {
                  globalControlsInitialValue[itemId].filters = globalControlsInitialValue[itemId].filters.concat(filterValue)
                } else {
                  globalControlsInitialValue[itemId].variables = globalControlsInitialValue[itemId].variables.concat(filterValue)
                }
              }
            })
          })
        }
      })

      return state
        .set('title', payload.dashboard.name)
        .set('dashboard', {
          ...payload.dashboard,
          config: JSON.stringify({
            ...dashboardConfig,
            filters: globalControls
          })
        })
        .set('config', JSON.stringify({
          ...dashboardConfig,
          filters: globalControls
        }))
        .set('dashboardSelectOptions', {})
        .set('widgets', payload.dashboard.widgets)
        .set('items', payload.dashboard.relations)
        .set('itemsInfo', payload.dashboard.relations.reduce((obj, item) => {
          obj[item.id] = {
            status: DashboardItemStatus.Initial,
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: globalControlsInitialValue[item.id] ? globalControlsInitialValue[item.id].filters : [],
              variables: [],
              linkageVariables: [],
              globalVariables: globalControlsInitialValue[item.id] ? globalControlsInitialValue[item.id].variables : [],
              pagination: {}
            },
            downloadCsvLoading: false,
            interactId: '',
            renderType: 'rerender',
            controlSelectOptions: {},
            errorMessage: ''
          }
          return obj
        }, {}))
    case SET_INDIVIDUAL_DASHBOARD:
      return state
        .set('items', [{
          id: 1,
          x: 0,
          y: 0,
          width: 12,
          height: 12,
          polling: false,
          frequency: 0,
          widgetId: payload.widgetId,
          dataToken: payload.token
        }])
        .set('itemsInfo', {
          1: {
            status: DashboardItemStatus.Initial,
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {}
            },
            downloadCsvLoading: false,
            interactId: '',
            renderType: 'rerender',
            controlSelectOptions: {},
            errorMessage: ''
          }
        })
    case LOAD_SHARE_WIDGET_SUCCESS:
      if (!widgets) {
        widgets = []
      }
      return state.set('widgets', widgets.concat(payload.widget))
    case SELECT_DASHBOARD_ITEM_CHART:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          renderType: payload.renderType,
          selectedItems: payload.selectedItems
        }
      })
    case LOAD_SHARE_RESULTSET:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          selectedItems: [],
          loading: true,
          errorMessage: '',
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            tempFilters: payload.requestParams.tempFilters,
            linkageFilters: payload.requestParams.linkageFilters,
            globalFilters: payload.requestParams.globalFilters,
            variables: payload.requestParams.variables,
            linkageVariables: payload.requestParams.linkageVariables,
            globalVariables: payload.requestParams.globalVariables,
            pagination: payload.requestParams.pagination,
            nativeQuery: payload.requestParams.nativeQuery
          }
        }
      })
    case GLOBAL_CONTROL_CHANGE:
      const controlRequestParamsByItem: IMapItemControlRequestParams = payload.controlRequestParamsByItem
      Object.entries(controlRequestParamsByItem)
        .forEach(([itemId, requestParams]: [string, IControlRequestParams]) => {
          const { filters: globalFilters, variables: globalVariables } = requestParams
          itemsInfo[itemId].queryConditions = {
            ...itemsInfo[itemId].queryConditions,
            ...globalFilters && { globalFilters },
            ...globalVariables && { globalVariables }
          }
        })
      return state.set('itemsInfo', itemsInfo)
    case DRILL_DASHBOARDITEM:
      if (!itemsInfo[payload.itemId].queryConditions.drillHistory) {
        itemsInfo[payload.itemId].queryConditions.drillHistory = []
      }
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            drillHistory: itemsInfo[payload.itemId].queryConditions.drillHistory.concat(payload.drillHistory)
          }
        }
      })
    case DELETE_DRILL_HISTORY:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            drillHistory: itemsInfo[payload.itemId].queryConditions.drillHistory.slice(0, payload.index + 1)
          }
        }
      })
    case LOAD_SHARE_RESULTSET_SUCCESS:
      fieldGroupedSort(payload.resultset.resultList, payload.requestParams.customOrders)
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          status: DashboardItemStatus.Fulfilled,
          loading: false,
          datasource: payload.resultset || { resultList: [] },
          renderType: payload.renderType
        }
      })
    case LOAD_SHARE_RESULTSET_FAILURE:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          status: DashboardItemStatus.Error,
          loading: false,
          errorMessage: payload.errorMessage
        }
      })
    case LOAD_WIDGET_CSV:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: true
        }
      })
    case LOAD_WIDGET_CSV_SUCCESS:
    case LOAD_WIDGET_CSV_FAILURE:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: false
        }
      })
    case LOAD_SELECT_OPTIONS_SUCCESS:
      return payload.itemId
        ? state.set('itemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            controlSelectOptions: {
              ...itemsInfo[payload.itemId].controlSelectOptions,
              [payload.controlKey]: payload.values
            }
          }
        })
        : state.set('dashboardSelectOptions', {
          ...dashboardSelectOptions,
          [payload.controlKey]: payload.values
        })
    case SET_SELECT_OPTIONS:
      return payload.itemId
        ? state.set('itemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            controlSelectOptions: {
              ...itemsInfo[payload.itemId].controlSelectOptions,
              [payload.controlKey]: payload.options
            }
          }
        })
        : state.set('dashboardSelectOptions', {
          ...dashboardSelectOptions,
          [payload.controlKey]: payload.options
        })
    case RESIZE_ALL_DASHBOARDITEM:
      return state.set(
        'itemsInfo',
        Object.entries(itemsInfo).reduce((info, [key, prop]: [string, any]) => {
          info[key] = {
            ...prop,
            renderType: 'resize',
            datasource: {...prop.datasource}
          }
          return info
        }, {})
      )
    case LOAD_DOWNLOAD_LIST:
      return state.set('downloadListLoading', true)
    case LOAD_DOWNLOAD_LIST_SUCCESS:
      return state
        .set('downloadListLoading', false)
        .set('downloadList', payload.list)
        .set('downloadListInfo', payload.list.reduce((info, item) => {
          info[item.id] = {
            loading: false
          }
          return info
        }, {}))
    case LOAD_DOWNLOAD_LIST_FAILURE:
      return state.set('downloadListLoading', false)
    case DOWNLOAD_FILE_SUCCESS:
        return state.set('downloadList', downloadList.map((item) => {
          return item.id === payload.id
            ? { ...item, status: DownloadStatus.Downloaded }
            : item
        }))
    default:
      return state
  }
}

export default shareReducer
