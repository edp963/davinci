/*-
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
  DELETE_DASHBOARD_SUCCESS,
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  ADD_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  CLEAR_CURRENT_DASHBOARD
} from './constants'

import {
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS
} from '../Bizlogic/constants'

const initialState = fromJS({
  dashboards: false,
  currentDashboard: null,
  currentDashboardLoading: false,
  currentItems: false,
  currentDatasources: false,
  currentItemsLoading: false,
  currentItemsQueryParams: false
})

function dashboardReducer (state = initialState, { type, payload }) {
  let dashboards = state.get('dashboards')
  let items = state.get('currentItems')
  let datasources = state.get('currentDatasources')
  let itemsLoading = state.get('currentItemsLoading')
  let queryParams = state.get('currentItemsQueryParams')

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
      dashboards.splice(dashboards.indexOf(dashboards.find(d => d.id === payload.result.id)), 1, payload.result)
      return state.set('dashboards', dashboards.slice())

    case DELETE_DASHBOARD_SUCCESS:
      return state.set('dashboards', dashboards.filter(d => d.id !== payload.id))

    case LOAD_DASHBOARD_DETAIL:
      return state.set('currentDashboardLoading', true)

    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state
        .set('currentDashboardLoading', false)
        .set('currentDashboard', payload.dashboard)
        .set('currentItems', payload.dashboard.widgets)
        .set('currentDatasources', {})
        .set('currentItemsLoading', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = false
          return obj
        }, {}))
        .set('currentItemsQueryParams', payload.dashboard.widgets.reduce((obj, w) => {
          obj[w.id] = {
            filters: '',
            params: [],
            pagination: {}
          }
          return obj
        }, {}))

    case ADD_DASHBOARD_ITEM_SUCCESS:
      if (!items) {
        items = []
        itemsLoading = {}
        queryParams = {}
      }
      return state
        .set('currentItems', items.concat(payload.result))
        .set('currentItemsLoading', Object.assign({}, itemsLoading, {
          [payload.result.id]: false
        }))
        .set('currentItemsQueryParams', Object.assign({}, queryParams, {
          [payload.result.id]: {
            filters: '',
            params: [],
            pagination: {}
          }
        }))

    case EDIT_DASHBOARD_ITEM_SUCCESS:
      items.splice(items.indexOf(items.find(i => i.id === payload.result.id)), 1, payload.result)
      return state.set('currentItems', items.slice())

    case EDIT_DASHBOARD_ITEMS_SUCCESS:
      return state.set('currentItems', payload.result)

    case DELETE_DASHBOARD_ITEM_SUCCESS:
      return state.set('currentItems', items.filter(i => i.id !== payload.id))

    case CLEAR_CURRENT_DASHBOARD:
      return state
        .set('currentDashboard', null)
        .set('currentItems', false)
        .set('currentDatasources', false)
        .set('currentItemsLoading', false)

    case LOAD_BIZDATAS_FROM_ITEM:
      itemsLoading[payload.itemId] = true
      queryParams[payload.itemId] = {
        filters: payload.sql.manualFilters,
        params: payload.sql.params,
        pagination: {
          sorts: payload.sorts,
          offset: payload.offset,
          limit: payload.limit
        }
      }
      return state
        .set('currentItemsLoading', Object.assign({}, itemsLoading))
        .set('currentItemsQueryParams', Object.assign({}, queryParams))

    case LOAD_BIZDATAS_FROM_ITEM_SUCCESS:
      itemsLoading[payload.itemId] = false
      datasources[payload.itemId] = payload.bizdatas
      return state
        .set('currentItemsLoading', Object.assign({}, itemsLoading))
        .set('currentDatasources', Object.assign({}, datasources))

    default:
      return state
  }
}

export default dashboardReducer
