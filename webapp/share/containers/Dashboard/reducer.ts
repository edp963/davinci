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

import produce from 'immer'
import { ActionTypes, DashboardItemStatus } from './constants'
import { DashboardActionType } from './actions'
import { DownloadStatus } from 'containers/App/constants'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'
import { IShareDashboardState } from './types'
import {
  getShareInitialItemInfo,
  initDefaultValuesFromShareParams
} from './util'
import { getGlobalControlInitialValues } from 'app/containers/Dashboard/util'

const initialState: IShareDashboardState = {
  dashboard: null,
  title: '',
  widgets: null,
  formedViews: {},
  items: null,
  itemsInfo: null,
  downloadListLoading: false,
  downloadList: null,
  downloadListInfo: null,
  shareParams: null,
  fullScreenPanelItemId: null
}

const shareReducer = (state = initialState, action: DashboardActionType) =>
  produce(state, (draft) => {
    let itemInfo
    let drillHistory

    switch (action.type) {
      case ActionTypes.SEND_SHARE_PARAMS:
        draft.shareParams = action.payload.params
        break

      case ActionTypes.LOAD_SHARE_DASHBOARD_SUCCESS:
        const { dashboard, items, widgets, formedViews } = action.payload

        initDefaultValuesFromShareParams(
          dashboard.config.filters,
          draft.shareParams
        )

        const globalControlsInitialValue = getGlobalControlInitialValues(
          dashboard.config.filters,
          formedViews
        )

        draft.title = dashboard.name
        draft.dashboard = dashboard
        draft.widgets = widgets
        draft.formedViews = formedViews
        draft.items = items
        draft.itemsInfo = items.reduce((info, item) => {
          const relatedWidget = widgets.find((w) => w.id === item.widgetId)
          const initialItemInfo = getShareInitialItemInfo(
            relatedWidget,
            formedViews
          )

          if (globalControlsInitialValue[item.id]) {
            const {
              globalFilters,
              globalVariables
            } = globalControlsInitialValue[item.id]
            initialItemInfo.queryConditions = {
              ...initialItemInfo.queryConditions,
              globalFilters,
              globalVariables
            }
          }

          info[item.id] = initialItemInfo
          return info
        }, {})
        break

      case ActionTypes.SET_INDIVIDUAL_DASHBOARD:
        draft.title = action.payload.widget.name
        draft.items = [
          {
            id: 1,
            x: 0,
            y: 0,
            width: 12,
            height: 12,
            polling: false,
            frequency: 0,
            widgetId: action.payload.widget.id,
            dashboardId: 0,
            config: ''
          }
        ]
        draft.itemsInfo = {
          1: getShareInitialItemInfo(
            action.payload.widget,
            action.payload.formedViews
          )
        }
        break

      case ActionTypes.LOAD_SHARE_WIDGET_SUCCESS:
        if (!draft.widgets) {
          draft.widgets = []
        }
        draft.widgets = draft.widgets.concat(action.payload.widget)
        draft.formedViews = action.payload.formedViews
        break

      case ActionTypes.SELECT_DASHBOARD_ITEM_CHART:
        draft.itemsInfo[action.payload.itemId].renderType =
          action.payload.renderType
        draft.itemsInfo[action.payload.itemId].selectedItems =
          action.payload.selectedItems
        break

      case ActionTypes.LOAD_SHARE_RESULTSET:
        draft.itemsInfo[action.payload.itemId].status =
          DashboardItemStatus.Pending
        draft.itemsInfo[action.payload.itemId].loading = true
        draft.itemsInfo[action.payload.itemId].errorMessage = ''
        break

      case ActionTypes.DRILL_DASHBOARDITEM:
        drillHistory =
          draft.itemsInfo[action.payload.itemId].queryConditions.drillHistory
        if (!drillHistory) {
          draft.itemsInfo[
            action.payload.itemId
          ].queryConditions.drillHistory = []
        }
        draft.itemsInfo[
          action.payload.itemId
        ].queryConditions.drillHistory.push(action.payload.drillHistory)
        break

      case ActionTypes.DELETE_DRILL_HISTORY:
        drillHistory =
          draft.itemsInfo[action.payload.itemId].queryConditions.drillHistory
        if (Array.isArray(drillHistory)) {
          drillHistory.splice(action.payload.index + 1)
        }
        break

      case ActionTypes.LOAD_SHARE_RESULTSET_SUCCESS:
        const {
          tempFilters,
          linkageFilters,
          globalFilters,
          variables,
          linkageVariables,
          globalVariables,
          pagination,
          nativeQuery,
          customOrders
        } = action.payload.requestParams

        fieldGroupedSort(action.payload.result.resultList, customOrders)

        draft.itemsInfo[action.payload.itemId] = {
          ...draft.itemsInfo[action.payload.itemId],
          status: DashboardItemStatus.Fulfilled,
          loading: false,
          datasource: action.payload.result,
          renderType: action.payload.renderType,
          queryConditions: {
            ...draft.itemsInfo[action.payload.itemId].queryConditions,
            tempFilters,
            linkageFilters,
            globalFilters,
            variables,
            linkageVariables,
            globalVariables,
            pagination,
            nativeQuery
          },
          selectedItems: []
        }
        break

      case ActionTypes.LOAD_SHARE_RESULTSET_FAILURE:
        draft.itemsInfo[action.payload.itemId] = {
          ...draft.itemsInfo[action.payload.itemId],
          status: DashboardItemStatus.Error,
          loading: false,
          errorMessage: action.payload.errorMessage
        }
        break

      case ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES:
        action.payload.relatedItems.forEach((itemId) => {
          draft.itemsInfo[itemId].status = DashboardItemStatus.Pending
          draft.itemsInfo[itemId].loading = true
          draft.itemsInfo[itemId].errorMessage = ''
        })
        break

      case ActionTypes.LOAD_WIDGET_CSV:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = true
        break

      case ActionTypes.LOAD_WIDGET_CSV_SUCCESS:
      case ActionTypes.LOAD_WIDGET_CSV_FAILURE:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = false
        break

      case ActionTypes.INITIATE_DOWNLOAD_TASK:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = true
        break

      case ActionTypes.INITIATE_DOWNLOAD_TASK_SUCCESS:
      case ActionTypes.INITIATE_DOWNLOAD_TASK_FAILURE:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = false
        break

      case ActionTypes.RESIZE_DASHBOARDITEM:
        itemInfo = draft.itemsInfo[action.payload.itemId]
        itemInfo.renderType = 'resize'
        itemInfo.datasource = { ...itemInfo.datasource }
        break

      case ActionTypes.RESIZE_ALL_DASHBOARDITEM:
        Object.values(draft.itemsInfo).forEach((itemInfo: any) => {
          itemInfo.renderType = 'resize'
          itemInfo.datasource = { ...itemInfo.datasource }
        })
        break

      case ActionTypes.RENDER_CHART_ERROR:
        draft.itemsInfo[
          action.payload.itemId
        ].errorMessage = action.payload.error.toString()
        break

      case ActionTypes.LOAD_DOWNLOAD_LIST:
        draft.downloadListLoading = true
        break

      case ActionTypes.LOAD_DOWNLOAD_LIST_SUCCESS:
        draft.downloadListLoading = false
        draft.downloadList = action.payload.list

        draft.downloadListInfo = action.payload.list.reduce((info, item) => {
          info[item.id] = {
            loading: false
          }
          return info
        }, {})
        break

      case ActionTypes.LOAD_DOWNLOAD_LIST_FAILURE:
        draft.downloadListLoading = false
        break

      case ActionTypes.DOWNLOAD_FILE_SUCCESS:
        draft.downloadList.find(({ id }) => id === action.payload.id).status =
          DownloadStatus.Downloaded
        break

      case ActionTypes.SET_FULL_SCREEN_PANEL_ITEM_ID:
        draft.fullScreenPanelItemId = action.payload.itemId
        break
    }
  })

export default shareReducer
