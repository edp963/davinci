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

import {
  LOAD_DASHBOARDS,
  LOAD_DASHBOARDS_SUCCESS,
  ADD_DASHBOARD,
  ADD_DASHBOARD_SUCCESS,
  EDIT_DASHBOARD,
  EDIT_DASHBOARD_SUCCESS,
  DELETE_DASHBOARD,
  DELETE_DASHBOARD_SUCCESS,
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  ADD_DASHBOARD_ITEM,
  ADD_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEMS,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  DELETE_DASHBOARD_ITEM,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  CLEAR_CURRENT_DASHBOARD,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_DASHBOARD_SHARE_LINK_SUCCESS,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadDashboards = promiseActionCreator(LOAD_DASHBOARDS)

export const addDashboard = promiseActionCreator(ADD_DASHBOARD, ['dashboard'])

export const editDashboard = promiseActionCreator(EDIT_DASHBOARD, ['dashboard'])

export const deleteDashboard = promiseActionCreator(DELETE_DASHBOARD, ['id'])

export const loadDashboardDetail = promiseActionCreator(LOAD_DASHBOARD_DETAIL, ['id'])

export const addDashboardItem = promiseActionCreator(ADD_DASHBOARD_ITEM, ['id', 'item'])

export const deleteDashboardItem = promiseActionCreator(DELETE_DASHBOARD_ITEM, ['id'])

export const clearCurrentDashboard = promiseActionCreator(CLEAR_CURRENT_DASHBOARD)

export const loadDashboardShareLink = promiseActionCreator(LOAD_DASHBOARD_SHARE_LINK, ['id'])

export const loadWidgetShareLink = promiseActionCreator(LOAD_WIDGET_SHARE_LINK, ['id'])

export function dashboardsLoaded (dashboards) {
  return {
    type: LOAD_DASHBOARDS_SUCCESS,
    payload: {
      dashboards
    }
  }
}

export function dashboardAdded (result) {
  return {
    type: ADD_DASHBOARD_SUCCESS,
    payload: {
      result
    }
  }
}

export function dashboardEdited (result) {
  return {
    type: EDIT_DASHBOARD_SUCCESS,
    payload: {
      result
    }
  }
}

export function dashboardDeleted (id) {
  return {
    type: DELETE_DASHBOARD_SUCCESS,
    payload: {
      id
    }
  }
}

export function dashboardDetailLoaded (dashboard) {
  return {
    type: LOAD_DASHBOARD_DETAIL_SUCCESS,
    payload: {
      dashboard
    }
  }
}

export function dashboardItemAdded (result) {
  return {
    type: ADD_DASHBOARD_ITEM_SUCCESS,
    payload: {
      result
    }
  }
}

export function editDashboardItem (item, resolve) {
  return {
    type: EDIT_DASHBOARD_ITEM,
    payload: {
      item,
      resolve
    }
  }
}

export function dashboardItemEdited (result) {
  return {
    type: EDIT_DASHBOARD_ITEM_SUCCESS,
    payload: {
      result
    }
  }
}

export function editDashboardItems (items, resolve) {
  return {
    type: EDIT_DASHBOARD_ITEMS,
    payload: {
      items,
      resolve
    }
  }
}

export function dashboardItemsEdited (result) {
  return {
    type: EDIT_DASHBOARD_ITEMS_SUCCESS,
    payload: {
      result
    }
  }
}

export function dashboardItemDeleted (id) {
  return {
    type: DELETE_DASHBOARD_ITEM_SUCCESS,
    payload: {
      id
    }
  }
}

export function dashboardShareLinkLoaded (shareInfo) {
  return {
    type: LOAD_DASHBOARD_SHARE_LINK_SUCCESS,
    payload: {
      shareInfo
    }
  }
}

export function widgetShareLinkLoaded (shareInfo) {
  return {
    type: LOAD_WIDGET_SHARE_LINK_SUCCESS,
    payload: {
      shareInfo
    }
  }
}
