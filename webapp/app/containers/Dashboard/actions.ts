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

import axios from 'axios'
import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'
import {
  IDashboard,
  IDashboardItem,
  IQueryConditions,
  IDataRequestParams,
  IDataDownloadStatistic
} from './types'
import { IWidgetFormed } from '../Widget/types'
import { IFormedViews, IViewQueryResponse } from '../View/types'
import { RenderType } from '../Widget/components/Widget'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { DownloadTypes } from '../App/constants'
import { IShareTokenParams } from 'app/components/SharePanel/types'
const CancelToken = axios.CancelToken

export const DashboardActions = {
  addDashboardItems(
    portalId: number,
    items: Array<Omit<IDashboardItem, 'id' | 'config'>>,
    resolve: (items: IDashboardItem[]) => void
  ) {
    return {
      type: ActionTypes.ADD_DASHBOARD_ITEMS,
      payload: {
        portalId,
        items,
        resolve
      }
    }
  },

  deleteDashboardItem(id, resolve) {
    return {
      type: ActionTypes.DELETE_DASHBOARD_ITEM,
      payload: {
        id,
        resolve
      }
    }
  },

  clearCurrentDashboard() {
    return {
      type: ActionTypes.CLEAR_CURRENT_DASHBOARD
    }
  },

  loadDashboardItemData(
    renderType: RenderType,
    itemId: number,
    queryConditions?: Partial<IQueryConditions>
  ) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_ITEM_DATA,
      payload: {
        renderType,
        itemId,
        queryConditions,
        cancelTokenSource: CancelToken.source()
      }
    }
  },

  dashboardItemDataLoaded(
    renderType: RenderType,
    itemId: number,
    requestParams: IDataRequestParams,
    result: IViewQueryResponse,
    statistic
  ) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_ITEM_DATA_SUCCESS,
      payload: {
        renderType,
        itemId,
        requestParams,
        result
      },
      statistic
    }
  },

  loadDashboardItemDataFail(itemId: number, errorMessage: string) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_ITEM_DATA_FAILURE,
      payload: {
        itemId,
        errorMessage
      }
    }
  },

  loadBatchDataWithControlValues(
    type: ControlPanelTypes,
    relatedItems: number[],
    formValues?: object,
    itemId?: number
  ) {
    return {
      type: ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES,
      payload: {
        type,
        relatedItems,
        formValues,
        itemId,
        cancelTokenSource: CancelToken.source()
      }
    }
  },

  initiateDownloadTask(type: DownloadTypes, id?: number, itemId?: number) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK,
      payload: {
        type,
        id,
        itemId
      }
    }
  },

  DownloadTaskInitiated(
    type: DownloadTypes,
    statistic: IDataDownloadStatistic[],
    itemId?: number
  ) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK_SUCCESS,
      payload: {
        type,
        itemId
      },
      statistic
    }
  },

  initiateDownloadTaskFail(error, type: DownloadTypes, itemId?: number) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK_FAILURE,
      payload: {
        error,
        type,
        itemId
      }
    }
  },

  loadDashboardDetail(portalId, dashboardId) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_DETAIL,
      payload: {
        portalId,
        dashboardId
      }
    }
  },

  dashboardDetailLoaded(
    dashboard: IDashboard,
    items: IDashboardItem[],
    widgets: IWidgetFormed[],
    formedViews: IFormedViews
  ) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_DETAIL_SUCCESS,
      payload: {
        dashboard,
        items,
        widgets,
        formedViews
      }
    }
  },

  loadDashboardDetailFail() {
    return {
      type: ActionTypes.LOAD_DASHBOARD_DETAIL_FAILURE
    }
  },

  dashboardItemsAdded(
    items: IDashboardItem[],
    widgets: IWidgetFormed[],
    formedViews: IFormedViews
  ) {
    return {
      type: ActionTypes.ADD_DASHBOARD_ITEMS_SUCCESS,
      payload: {
        items,
        widgets,
        formedViews
      }
    }
  },

  addDashboardItemsFail() {
    return {
      type: ActionTypes.ADD_DASHBOARD_ITEMS_FAILURE
    }
  },

  editDashboardItem(portalId, item, resolve) {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEM,
      payload: {
        portalId,
        item,
        resolve
      }
    }
  },

  dashboardItemEdited(result) {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEM_SUCCESS,
      payload: {
        result
      }
    }
  },

  editDashboardItemFail() {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEM_FAILURE
    }
  },

  editDashboardItems(portalId, items) {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEMS,
      payload: {
        portalId,
        items
      }
    }
  },

  dashboardItemsEdited(items) {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEMS_SUCCESS,
      payload: {
        items
      }
    }
  },

  editDashboardItemsFail() {
    return {
      type: ActionTypes.EDIT_DASHBOARD_ITEMS_FAILURE
    }
  },

  dashboardItemDeleted(id) {
    return {
      type: ActionTypes.DELETE_DASHBOARD_ITEM_SUCCESS,
      payload: {
        id
      }
    }
  },

  deleteDashboardItemFail() {
    return {
      type: ActionTypes.DELETE_DASHBOARD_ITEM_FAILURE
    }
  },

  loadDashboardShareLink(params: IShareTokenParams) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_SHARE_LINK,
      payload: {
        params
      }
    }
  },

  dashboardShareLinkLoaded(shareToken) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_SHARE_LINK_SUCCESS,
      payload: {
        shareToken
      }
    }
  },

  dashboardAuthorizedShareLinkLoaded(authorizedShareToken) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_AUTHORIZED_SHARE_LINK_SUCCESS,
      payload: {
        authorizedShareToken
      }
    }
  },

  dashboardPasswordShareLinkLoaded(passwordShareToken, password) {
    return {
      type: ActionTypes.LOAD_DASHBOARD_PASSWORD_SHARE_LINK_SUCCESS,
      payload: {
        passwordShareToken,
        password
      }
    }
  },

  loadDashboardShareLinkFail() {
    return {
      type: ActionTypes.LOAD_DASHBOARD_SHARE_LINK_FAILURE
    }
  },

  loadWidgetShareLink(params: IShareTokenParams) {
    return {
      type: ActionTypes.LOAD_WIDGET_SHARE_LINK,
      payload: {
        params
      }
    }
  },

  widgetShareLinkLoaded(shareToken, itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_SHARE_LINK_SUCCESS,
      payload: {
        shareToken,
        itemId
      }
    }
  },

  widgetAuthorizedShareLinkLoaded(authorizedShareToken, itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_AUTHORIZED_SHARE_LINK_SUCCESS,
      payload: {
        authorizedShareToken,
        itemId
      }
    }
  },

  widgetPasswordShareLinkLoaded(passwordShareToken, password, itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_PASSWORD_SHARE_LINK_SUCCESS,
      payload: {
        passwordShareToken,
        password,
        itemId
      }
    }
  },

  loadWidgetShareLinkFail(itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_SHARE_LINK_FAILURE,
      payload: {
        itemId
      }
    }
  },

  openSharePanel(id, type, title, itemId?) {
    return {
      type: ActionTypes.OPEN_SHARE_PANEL,
      payload: {
        id,
        type,
        title,
        itemId
      }
    }
  },

  closeSharePanel() {
    return {
      type: ActionTypes.CLOSE_SHARE_PANEL
    }
  },

  loadWidgetCsv(itemId, widgetId, requestParams) {
    return {
      type: ActionTypes.LOAD_WIDGET_CSV,
      payload: {
        itemId,
        widgetId,
        requestParams
      }
    }
  },

  widgetCsvLoaded(itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_CSV_SUCCESS,
      payload: {
        itemId
      }
    }
  },

  loadWidgetCsvFail(itemId) {
    return {
      type: ActionTypes.LOAD_WIDGET_CSV_FAILURE,
      payload: {
        itemId
      }
    }
  },

  renderDashboardItem(itemId) {
    return {
      type: ActionTypes.RENDER_DASHBOARDITEM,
      payload: {
        itemId
      }
    }
  },

  resizeDashboardItem(itemId) {
    return {
      type: ActionTypes.RESIZE_DASHBOARDITEM,
      payload: {
        itemId
      }
    }
  },

  resizeAllDashboardItem() {
    return {
      type: ActionTypes.RESIZE_ALL_DASHBOARDITEM
    }
  },

  renderChartError(itemId: number, error: Error) {
    return {
      type: ActionTypes.RENDER_CHART_ERROR,
      payload: {
        itemId,
        error
      }
    }
  },

  drillDashboardItem(itemId, drillHistory) {
    return {
      type: ActionTypes.DRILL_DASHBOARDITEM,
      payload: {
        itemId,
        drillHistory
      }
    }
  },

  deleteDrillHistory(itemId, index) {
    return {
      type: ActionTypes.DELETE_DRILL_HISTORY,
      payload: {
        itemId,
        index
      }
    }
  },

  drillPathsetting(itemId, history) {
    return {
      type: ActionTypes.DRILL_PATH_SETTING,
      payload: {
        itemId,
        history
      }
    }
  },

  selectDashboardItemChart(itemId, renderType, selectedItems) {
    return {
      type: ActionTypes.SELECT_DASHBOARD_ITEM_CHART,
      payload: {
        itemId,
        renderType,
        selectedItems
      }
    }
  },

  monitoredSyncDataAction() {
    return {
      type: ActionTypes.MONITORED_SYNC_DATA_ACTION
    }
  },

  monitoredSearchDataAction() {
    return {
      type: ActionTypes.MONITORED_SEARCH_DATA_ACTION
    }
  },

  monitoredLinkageDataAction() {
    return {
      type: ActionTypes.MONITORED_LINKAGE_DATA_ACTION
    }
  },

  setFullScreenPanelItemId(itemId) {
    return {
      type: ActionTypes.SET_FULL_SCREEN_PANEL_ITEM_ID,
      payload: {
        itemId
      }
    }
  }
}

const mockAction = returnType(DashboardActions)
export type DashboardActionType = typeof mockAction

export default DashboardActions
