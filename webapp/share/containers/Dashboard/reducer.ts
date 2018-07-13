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
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS
} from './constants'

const initialState = fromJS({
  title: '',
  config: '{}',
  dashboardCascadeSources: false,
  widgets: false,
  items: false,
  dataSources: false,
  loadings: false,
  itemQueryParams: false,
  downloadCsvLoadings: false,
  itemsCascadeSources: false
})

function shareReducer (state = initialState, { type, payload }) {
  const dashboardCascadeSources = state.get('dashboardCascadeSources')
  let widgets = state.get('widgets')
  const dataSources = state.get('dataSources')
  const loadings = state.get('loadings')
  const itemQueryParams = state.get('itemQueryParams')
  const downloadCsvLoadings = state.get('downloadCsvLoadings')
  const itemsCascadeSources = state.get('itemsCascadeSources')

  switch (type) {
    case LOAD_SHARE_DASHBOARD_SUCCESS:
      return state
        .set('title', payload.dashboard.name)
        .set('config', payload.dashboard.config)
        .set('dashboardCascadeSources', {})
        .set('items', payload.dashboard.widgets)
        .set('dataSources', {})
        .set('loadings', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('itemQueryParams', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = {
            filters: '',
            linkageFilters: '',
            globalFilters: '',
            params: [],
            linkageParams: [],
            globalParams: [],
            pagination: {}
          }
          return obj
        }, {}))
        .set('downloadCsvLoadings', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('itemsCascadeSources', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = {}
          return obj
        }, {}))
    case SET_INDIVIDUAL_DASHBOARD:
      return state
        .set('items', [{
          id: 1,
          position_x: 0,
          position_y: 0,
          width: 12,
          length: 10,
          trigger_type: 'manual',
          trigger_params: '',
          widget_id: payload.widgetId,
          aesStr: payload.token
        }])
        .set('dataSources', {})
        .set('loadings', {1: false})
        .set('itemQueryParams', {
          1: {
            filters: '',
            linkageFilters: '',
            globalFilters: '',
            params: [],
            linkageParams: [],
            globalParams: [],
            pagination: {}
          }
        })
        .set('downloadCsvLoadings', {1: false})
    case LOAD_SHARE_WIDGET_SUCCESS:
      if (!widgets) {
        widgets = []
      }
      return state.set('widgets', widgets.concat(payload.widget))
    case LOAD_SHARE_RESULTSET:
      loadings[payload.itemId] = true
      itemQueryParams[payload.itemId] = {
        filters: payload.sql.filters,
        linkageFilters: payload.sql.linkageFilters,
        globalFilters: payload.sql.globalFilters,
        params: payload.sql.params,
        linkageParams: payload.sql.linkageParams,
        globalParams: payload.sql.globalParams,
        pagination: {
          sorts: payload.sorts,
          offset: payload.offset,
          limit: payload.limit
        }
      }
      return state
        .set('loadings', { ...loadings })
        .set('itemQueryParams', { ...itemQueryParams })
    case LOAD_SHARE_RESULTSET_SUCCESS:
      loadings[payload.itemId] = false
      dataSources[payload.itemId] = payload.resultset
      return state
        .set('loadings', { ...loadings })
        .set('dataSources', { ...dataSources })
    case LOAD_WIDGET_CSV:
      return state.set('downloadCsvLoadings', {
        ...downloadCsvLoadings,
        [payload.itemId]: true
      })
    case LOAD_WIDGET_CSV_SUCCESS:
    case LOAD_WIDGET_CSV_FAILURE:
      return state.set('downloadCsvLoadings', {
        ...downloadCsvLoadings,
        [payload.itemId]: false
      })
    case LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS:
      return state.set('itemsCascadeSources', {
        ...itemsCascadeSources,
        [payload.itemId]: {
          ...itemsCascadeSources[payload.itemId],
          [payload.controlId]: payload.values
        }
      })
    case LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS:
      return state.set('dashboardCascadeSources', {
        ...dashboardCascadeSources,
        [payload.controlId]: payload.values
      })
    default:
      return state
  }
}

export default shareReducer
