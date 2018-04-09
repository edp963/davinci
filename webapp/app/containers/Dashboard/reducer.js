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
  LOAD_DASHBOARDS_SUCCESS,
  ADD_DASHBOARD_SUCCESS,
  EDIT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD,
  EDIT_CURRENT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD_FAILURE,
  DELETE_DASHBOARD_SUCCESS,
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  ADD_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  CLEAR_CURRENT_DASHBOARD,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_DASHBOARD_SHARE_LINK_SUCCESS,
  LOAD_DASHBOARD_SECRET_LINK_SUCCESS,
  LOAD_DASHBOARD_SHARE_LINK_FAILURE,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK_SUCCESS,
  LOAD_WIDGET_SECRET_LINK_SUCCESS,
  LOAD_WIDGET_SHARE_LINK_FAILURE,
  LOAD_WIDGET_CSV,
  LOAD_WIDGET_CSV_SUCCESS,
  LOAD_WIDGET_CSV_FAILURE
} from './constants'

import {
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
  LOAD_BIZDATAS_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS
} from '../Bizlogic/constants'

const initialState = fromJS({
  dashboards: false,
  currentDashboard: null,
  currentDashboardLoading: false,
  currentDashboardShareInfo: '',
  currentDashboardSecretInfo: '',
  currentDashboardShareInfoLoading: false,
  currentDashboardCascadeSources: false,
  currentItems: false,
  currentDatasources: false,
  currentItemsLoading: false,
  currentItemsQueryParams: false,
  currentItemsShareInfo: false,
  currentItemsSecretInfo: false,
  currentItemsShareInfoLoading: false,
  currentItemsDownloadCsvLoading: false,
  currentItemsCascadeSources: false
})

function dashboardReducer (state = initialState, { type, payload }) {
  let dashboards = state.get('dashboards')
  let dashboardCascadeSources = state.get('currentDashboardCascadeSources')
  let items = state.get('currentItems')
  let datasources = state.get('currentDatasources')
  let itemsLoading = state.get('currentItemsLoading')
  let queryParams = state.get('currentItemsQueryParams')
  let itemsShareInfo = state.get('currentItemsShareInfo')
  let itemsShareInfoLoading = state.get('currentItemsShareInfoLoading')
  let itemsDownloadCsvLoading = state.get('currentItemsDownloadCsvLoading')
  let itemsCascadeSources = state.get('currentItemsCascadeSources')

  switch (type) {
    case LOAD_DASHBOARDS_SUCCESS:
      return state.set('dashboards', payload.dashboards)

    case ADD_DASHBOARD_SUCCESS:
      if (dashboards) {
        dashboards.unshift(payload.result)
        return state.set('dashboards', dashboards.slice())
      } else {
        return state.set('dashboards', [payload.result])
      }

    case EDIT_DASHBOARD_SUCCESS:
      dashboards.splice(dashboards.findIndex(d => d.id === payload.result.id), 1, payload.result)
      return state.set('dashboards', dashboards.slice())

    case EDIT_CURRENT_DASHBOARD:
      return state.set('currentDashboardLoading', true)
    case EDIT_CURRENT_DASHBOARD_SUCCESS:
      return state
        .set('currentDashboard', payload.result)
        .set('currentDashboardCascadeSources', {})
        .set('currentDashboardLoading', false)
    case EDIT_CURRENT_DASHBOARD_FAILURE:
      return state.set('currentDashboardLoading', false)

    case DELETE_DASHBOARD_SUCCESS:
      return state.set('dashboards', dashboards.filter(d => d.id !== payload.id))

    case LOAD_DASHBOARD_DETAIL:
      return state.set('currentDashboardLoading', true)

    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state
        .set('currentDashboardLoading', false)
        .set('currentDashboard', payload.dashboard)
        .set('currentDashboardCascadeSources', {})
        .set('currentItems', payload.dashboard.widgets)
        .set('currentDatasources', {})
        .set('currentItemsLoading', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('currentItemsQueryParams', payload.dashboard.widgets.reduce((obj, w) => {
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
        .set('currentItemsShareInfo', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = ''
          return obj
        }, {}))
        .set('currentItemsShareInfoLoading', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('currentItemsDownloadCsvLoading', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('currentItemsCascadeSources', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = {}
          return obj
        }, {}))

    case ADD_DASHBOARD_ITEM_SUCCESS:
      if (!items) {
        items = []
        itemsLoading = {}
        queryParams = {}
        itemsShareInfo = {}
        itemsShareInfoLoading = {}
        itemsDownloadCsvLoading = {}
        itemsCascadeSources = {}
      }
      return state
        .set('currentItems', items.concat(payload.result))
        .set('currentItemsLoading', Object.assign({}, itemsLoading, {
          [payload.result.id]: false
        }))
        .set('currentItemsQueryParams', Object.assign({}, queryParams, {
          [payload.result.id]: {
            filters: '',
            linkageFilters: '',
            globalFilters: '',
            params: [],
            linkageParams: [],
            globalParams: [],
            pagination: {}
          }
        }))
        .set('currentItemsShareInfo', Object.assign({}, itemsShareInfo, {
          [payload.result.id]: ''
        }))
        .set('currentItemsShareInfoLoading', Object.assign({}, itemsShareInfoLoading, {
          [payload.result.id]: false
        }))
        .set('currentItemsDownloadCsvLoading', Object.assign({}, itemsDownloadCsvLoading, {
          [payload.result.id]: false
        }))
        .set('currentItemsCascadeSources', Object.assign({}, itemsCascadeSources, {
          [payload.result.id]: {}
        }))

    case EDIT_DASHBOARD_ITEM_SUCCESS:
      items.splice(items.indexOf(items.find(i => i.id === payload.result.id)), 1, payload.result)
      return state.set('currentItems', items.slice())

    case EDIT_DASHBOARD_ITEMS_SUCCESS:
      return state.set('currentItems', payload.result)

    case DELETE_DASHBOARD_ITEM_SUCCESS:
      delete datasources[payload.id]
      delete itemsLoading[payload.id]
      delete queryParams[payload.id]
      delete itemsShareInfo[payload.id]
      delete itemsShareInfoLoading[payload.id]
      delete itemsDownloadCsvLoading[payload.id]
      return state.set('currentItems', items.filter(i => i.id !== payload.id))

    case CLEAR_CURRENT_DASHBOARD:
      return state
        .set('currentDashboard', null)
        .set('currentItems', false)
        .set('currentDatasources', false)
        .set('currentItemsLoading', false)
        .set('currentItemsShareInfo', false)
        .set('currentItemsShareInfoLoading', false)
        .set('currentItemsDownloadCsvLoading', false)
        .set('currentItemsCascadeSources', false)

    case LOAD_BIZDATAS_FROM_ITEM:
      return state
        .set('currentItemsLoading', Object.assign({}, itemsLoading, {
          [payload.itemId]: true
        }))
        .set('currentItemsQueryParams', Object.assign({}, queryParams, {
          [payload.itemId]: {
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
        }))

    case LOAD_BIZDATAS_FROM_ITEM_SUCCESS:
      return state
        .set('currentItemsLoading', Object.assign({}, itemsLoading, {
          [payload.itemId]: false
        }))
        .set('currentDatasources', Object.assign({}, datasources, {
          [payload.itemId]: payload.bizdatas
        }))
    case LOAD_BIZDATAS_FROM_ITEM_FAILURE:
      return state.set('currentItemsLoading', Object.assign({}, itemsLoading, {
        [payload.itemId]: false
      }))

    case LOAD_DASHBOARD_SHARE_LINK:
      return state.set('currentDashboardShareInfoLoading', true)
    case LOAD_DASHBOARD_SHARE_LINK_SUCCESS:
      return state
        .set('currentDashboardShareInfo', payload.shareInfo)
        .set('currentDashboardShareInfoLoading', false)
    case LOAD_DASHBOARD_SECRET_LINK_SUCCESS:
      return state
        .set('currentDashboardSecretInfo', payload.secretInfo)
        .set('currentDashboardShareInfoLoading', false)
    case LOAD_DASHBOARD_SHARE_LINK_FAILURE:
      return state.set('currentDashboardShareInfoLoading', false)

    case LOAD_WIDGET_SHARE_LINK:
      return state.set('currentItemsShareInfoLoading', Object.assign({}, itemsShareInfoLoading, {
        [payload.itemId]: true
      }))
    case LOAD_WIDGET_SHARE_LINK_SUCCESS:
      return state
        .set('currentItemsShareInfo', Object.assign({}, itemsShareInfo, {
          [payload.itemId]: payload.shareInfo
        }))
        .set('currentItemsShareInfoLoading', Object.assign({}, itemsShareInfoLoading, {
          [payload.itemId]: false
        }))
    case LOAD_WIDGET_SECRET_LINK_SUCCESS:
      return state
        .set('currentItemsSecretInfo', Object.assign({}, itemsShareInfo, {
          [payload.itemId]: payload.shareInfo
        }))
        .set('currentItemsShareInfoLoading', Object.assign({}, itemsShareInfoLoading, {
          [payload.itemId]: false
        }))
    case LOAD_WIDGET_SHARE_LINK_FAILURE:
      return state.set('currentItemsShareInfoLoading', Object.assign({}, itemsShareInfoLoading, {
        [payload.itemId]: false
      }))

    case LOAD_WIDGET_CSV:
      return state.set('currentItemsDownloadCsvLoading', Object.assign({}, itemsDownloadCsvLoading, {
        [payload.itemId]: true
      }))
    case LOAD_WIDGET_CSV_SUCCESS:
    case LOAD_WIDGET_CSV_FAILURE:
      return state.set('currentItemsDownloadCsvLoading', Object.assign({}, itemsDownloadCsvLoading, {
        [payload.itemId]: false
      }))
    case LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS:
      return state.set('currentItemsCascadeSources', Object.assign({}, itemsCascadeSources, {
        [payload.itemId]: Object.assign({}, itemsCascadeSources[payload.itemId], {
          [payload.controlId]: payload.values
        })
      }))
    case LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS:
      return state.set('currentDashboardCascadeSources', Object.assign({}, dashboardCascadeSources, {
        [payload.controlId]: payload.values
      }))
    default:
      return state
  }
}

export default dashboardReducer
