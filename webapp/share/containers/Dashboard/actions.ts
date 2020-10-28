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

import { returnType } from 'utils/redux'
import { ActionTypes } from './constants'
import {
  IDashboard,
  IDashboardItem,
  IQueryConditions,
  IDataRequestParams
} from 'app/containers/Dashboard/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import {
  IShareFormedViews,
  IViewQueryResponse
} from 'app/containers/View/types'
import { RenderType } from 'app/containers/Widget/components/Widget'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { IDistinctValueReqeustParams } from 'app/components/Control/types'

export const DashboardActions = {
  getDashboard(token, reject) {
    return {
      type: ActionTypes.LOAD_SHARE_DASHBOARD,
      payload: {
        token,
        reject
      }
    }
  },

  dashboardGetted(
    dashboard: IDashboard,
    items: IDashboardItem[],
    widgets: IWidgetFormed[],
    formedViews: IShareFormedViews
  ) {
    return {
      type: ActionTypes.LOAD_SHARE_DASHBOARD_SUCCESS,
      payload: {
        dashboard,
        items,
        widgets,
        formedViews
      }
    }
  },

  loadDashboardFail() {
    return {
      type: ActionTypes.LOAD_SHARE_DASHBOARD_FAILURE
    }
  },

  getWidget(token, resolve, reject) {
    return {
      type: ActionTypes.LOAD_SHARE_WIDGET,
      payload: {
        token,
        resolve,
        reject
      }
    }
  },

  widgetGetted(widget: IWidgetFormed, formedViews: IShareFormedViews) {
    return {
      type: ActionTypes.LOAD_SHARE_WIDGET_SUCCESS,
      payload: {
        widget,
        formedViews
      }
    }
  },

  getResultset(
    renderType: RenderType,
    itemId: number,
    queryConditions: Partial<IQueryConditions>
  ) {
    return {
      type: ActionTypes.LOAD_SHARE_RESULTSET,
      payload: {
        renderType,
        itemId,
        queryConditions
      }
    }
  },

  resultsetGetted(
    renderType: RenderType,
    itemId: number,
    requestParams: IDataRequestParams,
    result: IViewQueryResponse
  ) {
    return {
      type: ActionTypes.LOAD_SHARE_RESULTSET_SUCCESS,
      payload: {
        renderType,
        itemId,
        requestParams,
        result
      }
    }
  },

  getResultsetFail(itemId, errorMessage) {
    return {
      type: ActionTypes.LOAD_SHARE_RESULTSET_FAILURE,
      payload: {
        itemId,
        errorMessage
      }
    }
  },

  getBatchDataWithControlValues(
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
        itemId
      }
    }
  },

  setIndividualDashboard(
    widget: IWidgetFormed,
    formedViews: IShareFormedViews,
    token: string
  ) {
    return {
      type: ActionTypes.SET_INDIVIDUAL_DASHBOARD,
      payload: {
        widget,
        formedViews,
        token
      }
    }
  },

  loadWidgetCsv(itemId, requestParams, token) {
    return {
      type: ActionTypes.LOAD_WIDGET_CSV,
      payload: {
        itemId,
        requestParams,
        token
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

  loadSelectOptions(
    controlKey: string,
    requestParams: { [viewId: string]: IDistinctValueReqeustParams },
    itemId: number
  ) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS,
      payload: {
        controlKey,
        requestParams,
        itemId
      }
    }
  },

  selectOptionsLoaded(controlKey, values, itemId) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS_SUCCESS,
      payload: {
        controlKey,
        values,
        itemId
      }
    }
  },

  loadSelectOptionsFail(error) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS_FAILURE,
      payload: {
        error
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

  loadDownloadList(shareClinetId, token) {
    return {
      type: ActionTypes.LOAD_DOWNLOAD_LIST,
      payload: {
        shareClinetId,
        token
      }
    }
  },

  downloadListLoaded(list) {
    return {
      type: ActionTypes.LOAD_DOWNLOAD_LIST_SUCCESS,
      payload: {
        list
      }
    }
  },

  loadDownloadListFail(error) {
    return {
      type: ActionTypes.LOAD_DOWNLOAD_LIST_FAILURE,
      payload: {
        error
      }
    }
  },

  downloadFile(id, shareClinetId, token) {
    return {
      type: ActionTypes.DOWNLOAD_FILE,
      payload: {
        id,
        shareClinetId,
        token
      }
    }
  },

  fileDownloaded(id) {
    return {
      type: ActionTypes.DOWNLOAD_FILE_SUCCESS,
      payload: {
        id
      }
    }
  },

  downloadFileFail(error) {
    return {
      type: ActionTypes.DOWNLOAD_FILE_FAILURE,
      payload: {
        error
      }
    }
  },

  initiateDownloadTask(shareClientId: string, itemId: number) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK,
      payload: {
        shareClientId,
        itemId
      }
    }
  },

  DownloadTaskInitiated(itemId: number) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK_SUCCESS,
      payload: {
        itemId
      }
    }
  },

  initiateDownloadTaskFail(error, itemId: number) {
    return {
      type: ActionTypes.INITIATE_DOWNLOAD_TASK_FAILURE,
      payload: {
        error,
        itemId
      }
    }
  },

  sendShareParams(params) {
    return {
      type: ActionTypes.SEND_SHARE_PARAMS,
      payload: {
        params
      }
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
