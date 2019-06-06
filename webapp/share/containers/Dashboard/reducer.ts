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
  LOAD_WIDGET_CSV,
  LOAD_WIDGET_CSV_SUCCESS,
  LOAD_WIDGET_CSV_FAILURE,
  LOAD_SELECT_OPTIONS_SUCCESS,
  RESIZE_ALL_DASHBOARDITEM,
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY,
  SET_SELECT_OPTIONS,
  SELECT_DASHBOARD_ITEM_CHART
} from './constants'

const initialState = fromJS({
  dashboard: null,
  title: '',
  config: '{}',
  dashboardSelectOptions: null,
  widgets: null,
  items: null,
  itemsInfo: null
})

function shareReducer (state = initialState, { type, payload }) {
  const dashboardSelectOptions = state.get('dashboardSelectOptions')
  const itemsInfo = state.get('itemsInfo')
  let widgets = state.get('widgets')

  switch (type) {
    case LOAD_SHARE_DASHBOARD_SUCCESS:
      return state
        .set('title', payload.dashboard.name)
        .set('dashboard', payload.dashboard)
        .set('config', payload.dashboard.config)
        .set('dashboardSelectOptions', {})
        .set('widgets', payload.dashboard.widgets)
        .set('items', payload.dashboard.relations)
        .set('itemsInfo', payload.dashboard.relations.reduce((obj, item) => {
          obj[item.id] = {
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
            controlSelectOptions: {}
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
            controlSelectOptions: {}
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
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: false,
          datasource: payload.resultset || { resultList: [] },
          renderType: payload.renderType
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
    default:
      return state
  }
}

export default shareReducer
