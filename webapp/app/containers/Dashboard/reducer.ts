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

import { ActionTypes } from './constants'
import { DashboardActionType } from './actions'
import { getInitialItemInfo, getGlobalControlInitialValues } from './util'
import { DownloadTypes } from '../App/constants'
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router'
import { ActionTypes as VizActionTypes } from 'containers/Viz/constants'
import { VizActionType } from '../Viz/actions'
import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'
import { IDashboardState, IDashboardSharePanelState } from './types'

const defaultSharePanelState: IDashboardSharePanelState = {
  id: 0,
  type: 'dashboard',
  title: '',
  visible: false
}

const initialState: IDashboardState = {
  currentDashboard: null,
  currentDashboardLoading: false,
  currentDashboardShareToken: '',
  currentDashboardAuthorizedShareToken: '',
  currentDashboardPasswordShareToken: '',
  currentDashboardPasswordSharePassword: '',
  currentDashboardShareLoading: false,
  sharePanel: defaultSharePanelState,
  currentItems: null,
  currentItemsInfo: null,
  fullScreenPanelItemId: null,
  cancelTokenSources: []
}

const dashboardReducer = (
  state = initialState,
  action: VizActionType | DashboardActionType | LocationChangeAction
): IDashboardState =>
  produce(state, (draft) => {
    let drillHistory
    let targetItemInfo

    switch (action.type) {
      case VizActionTypes.EDIT_CURRENT_DASHBOARD:
        draft.currentDashboardLoading = true
        break

      case VizActionTypes.EDIT_CURRENT_DASHBOARD_SUCCESS:
        draft.currentDashboard = action.payload.result
        draft.currentDashboardLoading = false
        break

      case VizActionTypes.EDIT_CURRENT_DASHBOARD_FAILURE:
        draft.currentDashboardLoading = false
        break

      case ActionTypes.LOAD_DASHBOARD_DETAIL:
        draft.currentDashboardLoading = true
        break

      case ActionTypes.LOAD_DASHBOARD_DETAIL_SUCCESS:
        const { dashboard, widgets, formedViews, items } = action.payload
        const globalControlsInitialValue = getGlobalControlInitialValues(
          dashboard.config.filters,
          formedViews
        )
        draft.currentDashboardLoading = false
        draft.currentDashboard = dashboard
        draft.currentDashboardShareToken = ''
        draft.currentDashboardPasswordShareToken = ''
        draft.currentDashboardAuthorizedShareToken = ''
        draft.currentItems = items
        draft.currentItemsInfo = items.reduce((info, item) => {
          const relatedWidget = widgets.find((w) => w.id === item.widgetId)
          const initialItemInfo = getInitialItemInfo(relatedWidget, formedViews)
          const drillpathSetting =
            item.config && item.config.length ? JSON.parse(item.config) : void 0

          if (globalControlsInitialValue[item.id]) {
            const {
              globalFilters,
              globalVariables
            } = globalControlsInitialValue[item.id]
            initialItemInfo.queryConditions = {
              ...initialItemInfo.queryConditions,
              globalFilters,
              globalVariables,
              ...drillpathSetting
            }
          }

          info[item.id] = initialItemInfo
          return info
        }, {})
        break

      case ActionTypes.LOAD_DASHBOARD_DETAIL_FAILURE:
        draft.currentDashboardLoading = false
        break

      case ActionTypes.ADD_DASHBOARD_ITEMS_SUCCESS:
        draft.currentItems = (draft.currentItems || []).concat(
          action.payload.items
        )
        action.payload.items.forEach((item) => {
          const relatedWidget = action.payload.widgets.find(
            (w) => w.id === item.widgetId
          )
          draft.currentItemsInfo[item.id] = getInitialItemInfo(
            relatedWidget,
            action.payload.formedViews
          )
        })
        break

      case ActionTypes.ADD_DASHBOARD_ITEMS_FAILURE:
        break

      case ActionTypes.EDIT_DASHBOARD_ITEM_SUCCESS:
        draft.currentItems.splice(
          draft.currentItems.findIndex(
            ({ id }) => id === action.payload.result.id
          ),
          1,
          action.payload.result
        )
        break

      case ActionTypes.EDIT_DASHBOARD_ITEM_FAILURE:
        break

      case ActionTypes.EDIT_DASHBOARD_ITEMS_SUCCESS:
        draft.currentItems = action.payload.items
        break

      case ActionTypes.EDIT_DASHBOARD_ITEMS_FAILURE:
        break

      case ActionTypes.DELETE_DASHBOARD_ITEM_SUCCESS:
        delete draft.currentItemsInfo[action.payload.id]
        draft.currentItems = draft.currentItems.filter(
          ({ id }) => id !== action.payload.id
        )
        break

      case ActionTypes.DELETE_DASHBOARD_ITEM_FAILURE:
        break

      case ActionTypes.CLEAR_CURRENT_DASHBOARD:
        draft.currentDashboard = null
        draft.currentItems = null
        draft.currentItemsInfo = null
        break

      case ActionTypes.LOAD_DASHBOARD_ITEM_DATA:
        draft.currentItemsInfo[action.payload.itemId].loading = true
        draft.currentItemsInfo[action.payload.itemId].errorMessage = ''
        draft.cancelTokenSources.push(action.payload.cancelTokenSource)
        break

      case ActionTypes.LOAD_DASHBOARD_ITEM_DATA_SUCCESS:
        // @TODO combine widget static filters with local filters
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

        draft.currentItemsInfo[action.payload.itemId] = {
          ...draft.currentItemsInfo[action.payload.itemId],
          loading: false,
          datasource: action.payload.result,
          renderType: action.payload.renderType,
          queryConditions: {
            ...draft.currentItemsInfo[action.payload.itemId].queryConditions,
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

      case ActionTypes.LOAD_DASHBOARD_ITEM_DATA_FAILURE:
        // LOAD_DASHBOARD_ITEM_DATA_FAILURE maybe executed after CLEAR_CURRENT_DASHBOARD when location changes
        if (draft.currentItemsInfo) {
          draft.currentItemsInfo[action.payload.itemId].loading = false
          draft.currentItemsInfo[action.payload.itemId].errorMessage =
            action.payload.errorMessage
        }
        break

      case ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES:
        action.payload.relatedItems.forEach((itemId) => {
          draft.currentItemsInfo[itemId].loading = true
          draft.currentItemsInfo[itemId].errorMessage = ''
        })
        draft.cancelTokenSources.push(action.payload.cancelTokenSource)
        break

      case ActionTypes.SELECT_DASHBOARD_ITEM_CHART:
        const selectedItem = draft.currentItemsInfo[action.payload.itemId]
        draft.currentItemsInfo[action.payload.itemId] = {
          ...selectedItem,
          renderType: action.payload.renderType,
          selectedItems: action.payload.selectedItems
        }
        break

      case ActionTypes.DRILL_DASHBOARDITEM:
        drillHistory =
          draft.currentItemsInfo[action.payload.itemId].queryConditions
            .drillHistory
        if (!drillHistory) {
          draft.currentItemsInfo[
            action.payload.itemId
          ].queryConditions.drillHistory = []
        }
        draft.currentItemsInfo[
          action.payload.itemId
        ].queryConditions.drillHistory.push(action.payload.drillHistory)
        break

      case ActionTypes.DRILL_PATH_SETTING:
        const drillSetting =
          draft.currentItemsInfo[action.payload.itemId].queryConditions
            .drillSetting
        if (!drillSetting) {
          draft.currentItemsInfo[
            action.payload.itemId
          ].queryConditions.drillSetting = [action.payload.history]
        } else {
          drillSetting.push(action.payload.history)
        }
        break

      case ActionTypes.DELETE_DRILL_HISTORY:
        drillHistory =
          draft.currentItemsInfo[action.payload.itemId].queryConditions
            .drillHistory
        if (Array.isArray(drillHistory)) {
          drillHistory.splice(action.payload.index + 1)
        }
        break

      case ActionTypes.LOAD_DASHBOARD_SHARE_LINK:
        draft.currentDashboardShareLoading = true
        if (action.payload.params.mode === 'AUTH') {
          draft.currentDashboardAuthorizedShareToken = ''
        }
        break

      case ActionTypes.LOAD_DASHBOARD_SHARE_LINK_SUCCESS:
        draft.currentDashboardShareToken = action.payload.shareToken
        draft.currentDashboardShareLoading = false
        break

      case ActionTypes.LOAD_DASHBOARD_AUTHORIZED_SHARE_LINK_SUCCESS:
        draft.currentDashboardAuthorizedShareToken =
          action.payload.authorizedShareToken
        draft.currentDashboardShareLoading = false
        break

      case ActionTypes.LOAD_DASHBOARD_PASSWORD_SHARE_LINK_SUCCESS:
        draft.currentDashboardPasswordShareToken = action.payload.passwordShareToken
        draft.currentDashboardPasswordSharePassword = action.payload.password
        draft.currentDashboardShareLoading = false
        break

      case ActionTypes.LOAD_DASHBOARD_SHARE_LINK_FAILURE:
        draft.currentDashboardShareLoading = false
        break

      case ActionTypes.LOAD_WIDGET_SHARE_LINK:
        draft.currentItemsInfo[action.payload.params.itemId].shareLoading = true
        if (action.payload.params.mode === 'AUTH') {
          draft.currentItemsInfo[
            action.payload.params.itemId
          ].authorizedShareToken = ''
        }
        break

      case ActionTypes.LOAD_WIDGET_SHARE_LINK_SUCCESS:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.shareToken = action.payload.shareToken
        targetItemInfo.shareLoading = false
        break

      case ActionTypes.LOAD_WIDGET_AUTHORIZED_SHARE_LINK_SUCCESS:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.authorizedShareToken =
          action.payload.authorizedShareToken
        targetItemInfo.shareLoading = false
        break

      case ActionTypes.LOAD_WIDGET_PASSWORD_SHARE_LINK_SUCCESS:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.passwordShareToken = action.payload.passwordShareToken
        targetItemInfo.password = action.payload.password
        targetItemInfo.shareLoading = false
        break

      case ActionTypes.LOAD_WIDGET_SHARE_LINK_FAILURE:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.shareLoading = false
        break

      case ActionTypes.OPEN_SHARE_PANEL:
        draft.sharePanel = {
          id: action.payload.id,
          type: action.payload.type,
          title: action.payload.title,
          itemId: action.payload.itemId,
          visible: true
        }
        break
      case ActionTypes.CLOSE_SHARE_PANEL:
        draft.sharePanel = defaultSharePanelState
        break

      case ActionTypes.LOAD_WIDGET_CSV:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.downloadCsvLoading = true
        break

      case ActionTypes.LOAD_WIDGET_CSV_SUCCESS:
      case ActionTypes.LOAD_WIDGET_CSV_FAILURE:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.downloadCsvLoading = false
        break

      case ActionTypes.INITIATE_DOWNLOAD_TASK:
        if (action.payload.type === DownloadTypes.Widget) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.downloadCsvLoading = true
        }
        break

      case ActionTypes.INITIATE_DOWNLOAD_TASK_SUCCESS:
      case ActionTypes.INITIATE_DOWNLOAD_TASK_FAILURE:
        if (action.payload.type === DownloadTypes.Widget) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.downloadCsvLoading = false
        }
        break

      case ActionTypes.RENDER_DASHBOARDITEM:
        draft.currentItemsInfo[action.payload.itemId].rendered = true
        break

      case ActionTypes.RESIZE_DASHBOARDITEM:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.renderType = 'resize'
        targetItemInfo.datasource = { ...targetItemInfo.datasource }
        break

      case ActionTypes.RESIZE_ALL_DASHBOARDITEM:
        Object.values(draft.currentItemsInfo).forEach((itemInfo: any) => {
          itemInfo.renderType = 'resize'
          itemInfo.datasource = { ...itemInfo.datasource }
        })
        break

      case ActionTypes.RENDER_CHART_ERROR:
        draft.currentItemsInfo[
          action.payload.itemId
        ].errorMessage = action.payload.error.toString()
        break

      case ActionTypes.SET_FULL_SCREEN_PANEL_ITEM_ID:
        draft.fullScreenPanelItemId = action.payload.itemId
        if (action.payload.itemId) {
          draft.currentItemsInfo[action.payload.itemId].renderType = 'clear'
          draft.currentItemsInfo[action.payload.itemId].rendered = true
        }
        break

      case LOCATION_CHANGE:
        if (state.cancelTokenSources.length) {
          state.cancelTokenSources.forEach((source) => {
            source.cancel()
          })
          draft.cancelTokenSources = []
        }
        break
    }
  })

export default dashboardReducer
