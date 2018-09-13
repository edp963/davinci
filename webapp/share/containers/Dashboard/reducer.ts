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
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS,
  RESIZE_ALL_DASHBOARDITEM
} from './constants'

const initialState = fromJS({
  title: '',
  config: '{}',
  dashboardCascadeSources: null,
  widgets: null,
  items: null,
  itemsInfo: null
})

function shareReducer (state = initialState, { type, payload }) {
  const dashboardCascadeSources = state.get('dashboardCascadeSources')
  const itemsInfo = state.get('itemsInfo')
  let widgets = state.get('widgets')

  switch (type) {
    case LOAD_SHARE_DASHBOARD_SUCCESS:
      return state
        .set('title', payload.dashboard.name)
        .set('config', payload.dashboard.config)
        .set('dashboardCascadeSources', {})
        .set('widgets', payload.dashboard.widgets)
        .set('items', payload.dashboard.relations)
        .set('itemsInfo', payload.dashboard.relations.reduce((obj, item) => {
          obj[item.id] = {
            datasource: [],
            loading: false,
            queryParams: {
              linkageFilters: [],
              globalFilters: [],
              params: [],
              linkageParams: [],
              globalParams: []
            },
            downloadCsvLoading: false,
            interactId: '',
            renderType: 'rerender'
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
            datasource: [],
            loading: false,
            queryParams: {
              linkageFilters: [],
              globalFilters: [],
              params: [],
              linkageParams: [],
              globalParams: []
            },
            downloadCsvLoading: false,
            interactId: '',
            renderType: 'rerender'
          }
        })
    case LOAD_SHARE_WIDGET_SUCCESS:
      if (!widgets) {
        widgets = []
      }
      console.log(widgets.concat(payload.widget))
      return state.set('widgets', widgets.concat(payload.widget))
    case LOAD_SHARE_RESULTSET:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: true,
          queryParams: {
            linkageFilters: payload.params.linkageFilters,
            globalFilters: payload.params.globalFilters,
            params: payload.params.params,
            linkageParams: payload.params.linkageParams,
            globalParams: payload.params.globalParams
          }
        }
      })
    case LOAD_SHARE_RESULTSET_SUCCESS:
      return state.set('itemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: false,
          datasource: payload.resultset,
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
    case LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS:
      return state.set('dashboardCascadeSources', {
        ...dashboardCascadeSources,
        [payload.controlId]: {
          ...dashboardCascadeSources[payload.controlId],
          [payload.column]: payload.values
        }
      })
    case RESIZE_ALL_DASHBOARDITEM:
      return state.set(
        'itemsInfo',
        Object.entries(itemsInfo).reduce((info, [key, prop]: [string, any]) => {
          info[key] = {
            ...prop,
            renderType: 'resize',
            datasource: [...prop.datasource]
          }
          return info
        }, {})
      )
    default:
      return state
  }
}

export default shareReducer
