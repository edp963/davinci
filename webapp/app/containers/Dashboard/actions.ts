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

import {
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  LOAD_DASHBOARD_DETAIL_FAILURE,
  ADD_DASHBOARD_ITEMS,
  ADD_DASHBOARD_ITEMS_SUCCESS,
  ADD_DASHBOARD_ITEMS_FAILURE,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM_FAILURE,
  EDIT_DASHBOARD_ITEMS,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  EDIT_DASHBOARD_ITEMS_FAILURE,
  DELETE_DASHBOARD_ITEM,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_FAILURE,
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
  LOAD_WIDGET_CSV_FAILURE,
  RENDER_DASHBOARDITEM,
  RESIZE_DASHBOARDITEM,
  RESIZE_ALL_DASHBOARDITEM,
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY,
  DRILL_PATH_DASHBOARDITEM,
  DELETE_DRILL_PATH_HISTORY,
  DRILL_PATH_SETTING,
  SELECT_DASHBOARD_ITEM_CHART,
  SET_SELECT_OPTIONS,
  SET_CONTROL_FORM_VALUES,
  MONITORED_SYNC_DATA_ACTION,
  MONITORED_SEARCH_DATA_ACTION,
  MONITORED_LINKAGE_DATA_ACTION
} from './constants'

export function addDashboardItems (portalId, items, resolve) {
  return {
    type: ADD_DASHBOARD_ITEMS,
    payload: {
      portalId,
      items,
      resolve
    }
  }
}

export function deleteDashboardItem (id, resolve) {
  return {
    type: DELETE_DASHBOARD_ITEM,
    payload: {
      id,
      resolve
    }
  }
}

export function clearCurrentDashboard () {
  return {
    type: CLEAR_CURRENT_DASHBOARD
  }
}

export function loadDashboardDetail (projectId, portalId, dashboardId) {
  return {
    type: LOAD_DASHBOARD_DETAIL,
    payload: {
      projectId,
      portalId,
      dashboardId
    }
  }
}

export function dashboardDetailLoaded (dashboardId, dashboardDetail, widgets, views) {
  return {
    type: LOAD_DASHBOARD_DETAIL_SUCCESS,
    payload: {
      dashboardId,
      dashboardDetail,
      widgets,
      views
    }
  }
}

export function loadDashboardDetailFail () {
  return {
    type: LOAD_DASHBOARD_DETAIL_FAILURE
  }
}

export function dashboardItemsAdded (result) {
  return {
    type: ADD_DASHBOARD_ITEMS_SUCCESS,
    payload: {
      result
    }
  }
}

export function addDashboardItemsFail () {
  return {
    type: ADD_DASHBOARD_ITEMS_FAILURE
  }
}

export function editDashboardItem (portalId, item, resolve) {
  return {
    type: EDIT_DASHBOARD_ITEM,
    payload: {
      portalId,
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

export function editDashboardItemFail () {
  return {
    type: EDIT_DASHBOARD_ITEM_FAILURE
  }
}

export function editDashboardItems (portalId, items) {
  return {
    type: EDIT_DASHBOARD_ITEMS,
    payload: {
      portalId,
      items
    }
  }
}

export function dashboardItemsEdited (items) {
  return {
    type: EDIT_DASHBOARD_ITEMS_SUCCESS,
    payload: {
      items
    }
  }
}

export function editDashboardItemsFail () {
  return {
    type: EDIT_DASHBOARD_ITEMS_FAILURE
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

export function deleteDashboardItemFail () {
  return {
    type: DELETE_DASHBOARD_ITEM_FAILURE
  }
}

export function loadDashboardShareLink (id, authName) {
  return {
    type: LOAD_DASHBOARD_SHARE_LINK,
    payload: {
      id,
      authName
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

export function dashboardSecretLinkLoaded (secretInfo) {
  return {
    type: LOAD_DASHBOARD_SECRET_LINK_SUCCESS,
    payload: {
      secretInfo
    }
  }
}

export function loadDashboardShareLinkFail () {
  return {
    type: LOAD_DASHBOARD_SHARE_LINK_FAILURE
  }
}

export function loadWidgetShareLink (id, itemId, authName, resolve) {
  return {
    type: LOAD_WIDGET_SHARE_LINK,
    payload: {
      id,
      itemId,
      authName,
      resolve
    }
  }
}

export function widgetShareLinkLoaded (shareInfo, itemId) {
  return {
    type: LOAD_WIDGET_SHARE_LINK_SUCCESS,
    payload: {
      shareInfo,
      itemId
    }
  }
}

export function widgetSecretLinkLoaded (shareInfo, itemId) {
  return {
    type: LOAD_WIDGET_SECRET_LINK_SUCCESS,
    payload: {
      shareInfo,
      itemId
    }
  }
}

export function loadWidgetShareLinkFail (itemId) {
  return {
    type: LOAD_WIDGET_SHARE_LINK_FAILURE,
    payload: {
      itemId
    }
  }
}

export function loadWidgetCsv (itemId, widgetId, requestParams) {
  return {
    type: LOAD_WIDGET_CSV,
    payload: {
      itemId,
      widgetId,
      requestParams
    }
  }
}

export function widgetCsvLoaded (itemId) {
  return {
    type: LOAD_WIDGET_CSV_SUCCESS,
    payload: {
      itemId
    }
  }
}

export function loadWidgetCsvFail (itemId) {
  return {
    type: LOAD_WIDGET_CSV_FAILURE,
    payload: {
      itemId
    }
  }
}

export function renderDashboardItem (itemId) {
  return {
    type: RENDER_DASHBOARDITEM,
    payload: {
      itemId
    }
  }
}

export function resizeDashboardItem (itemId) {
  return {
    type: RESIZE_DASHBOARDITEM,
    payload: {
      itemId
    }
  }
}

export function resizeAllDashboardItem () {
  return {
    type: RESIZE_ALL_DASHBOARDITEM
  }
}

export function drillDashboardItem (itemId, drillHistory) {
  return {
    type: DRILL_DASHBOARDITEM,
    payload: {
      itemId,
      drillHistory
    }
  }
}

export function deleteDrillHistory (itemId, index) {
  return {
    type: DELETE_DRILL_HISTORY,
    payload: {
      itemId,
      index
    }
  }
}

export function drillPathsetting (itemId, history) {
  return {
    type: DRILL_PATH_SETTING,
    payload: {
      itemId,
      history
    }
  }
}

export function selectDashboardItemChart (itemId, renderType, selectedItems) {
  return {
    type: SELECT_DASHBOARD_ITEM_CHART,
    payload: {
      itemId,
      renderType,
      selectedItems
    }
  }
}

export function setSelectOptions (controlKey, options, itemId?) {
  return {
    type: SET_SELECT_OPTIONS,
    payload: {
      controlKey,
      options,
      itemId
    }
  }
}

export function setControlFormValues (formValues) {
  return {
    type: SET_CONTROL_FORM_VALUES,
    payload: {
      formValues
    }
  }
}

export function monitoredSyncDataAction () {
  return {
    type: MONITORED_SYNC_DATA_ACTION
  }
}

export function monitoredSearchDataAction () {
  return {
    type: MONITORED_SEARCH_DATA_ACTION
  }
}

export function monitoredLinkageDataAction () {
  return {
    type: MONITORED_LINKAGE_DATA_ACTION
  }
}
