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

import {
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  LOAD_DASHBOARD_DETAIL_FAILURE,
  ADD_DASHBOARD_ITEMS_SUCCESS,
  ADD_DASHBOARD_ITEMS_FAILURE,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM_FAILURE,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  EDIT_DASHBOARD_ITEMS_FAILURE,
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
  DRILL_PATH_SETTING,
  SELECT_DASHBOARD_ITEM_CHART,
  SET_SELECT_OPTIONS
} from './constants'
import {
  INITIATE_DOWNLOAD_TASK,
  INITIATE_DOWNLOAD_TASK_SUCCESS,
  INITIATE_DOWNLOAD_TASK_FAILURE
} from '../App/constants'
import { ActionTypes as VizActionTypes } from 'containers/Viz/constants'
import { ActionTypes as ViewActionTypes } from '../View/constants'
import { ViewActionType } from '../View/actions'
import { VizActionType } from '../Viz/actions'

import {
  IGlobalControl,
  IControlRelatedField,
  IMapItemControlRequestParams,
  IControlRequestParams
} from 'components/Filters/types'
import {
  getVariableValue,
  getModelValue,
  deserializeDefaultValue
} from 'components/Filters/util'
import { DownloadTypes } from '../App/types'
import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'
import { globalControlMigrationRecorder } from 'app/utils/migrationRecorders'

const initialState = {
  currentDashboard: null,
  currentDashboardLoading: false,
  currentDashboardShareInfo: '',
  currentDashboardSecretInfo: '',
  currentDashboardShareInfoLoading: false,
  currentDashboardSelectOptions: {},
  currentItems: null,
  currentItemsInfo: null
}

const dashboardReducer = (state = initialState, action: ViewActionType | VizActionType | any) =>
  produce(state, (draft) => {
    let drillHistory
    let targetItemInfo

    switch (action.type) {

      case VizActionTypes.EDIT_CURRENT_DASHBOARD:
        draft.currentDashboardLoading = true
        break

      case VizActionTypes.EDIT_CURRENT_DASHBOARD_SUCCESS:
        draft.currentDashboard = action.payload.result
        draft.currentDashboardSelectOptions = {}
        draft.currentDashboardLoading = false
        break

      case VizActionTypes.EDIT_CURRENT_DASHBOARD_FAILURE:
        draft.currentDashboardLoading = false
        break

      case LOAD_DASHBOARD_DETAIL:
        draft.currentDashboardLoading = true
        draft.currentDashboardShareInfo = ''
        draft.currentDashboardSecretInfo = ''
        break

      case LOAD_DASHBOARD_DETAIL_SUCCESS:
        const { dashboardDetail } = action.payload
        const dashboardConfig = dashboardDetail.config ? JSON.parse(dashboardDetail.config) : {}
        const globalControls = (dashboardConfig.filters || []).map((c) => globalControlMigrationRecorder(c))
        const globalControlsInitialValue = {}

        globalControls.forEach((control: IGlobalControl) => {
          const { interactionType, relatedItems, relatedViews } = control
          const defaultValue = deserializeDefaultValue(control)
          if (defaultValue) {
            Object.entries(relatedItems).forEach(([itemId, config]) => {
              Object.entries(relatedViews).forEach(([viewId, fields]) => {
                if (config.checked && config.viewId === Number(viewId)) {
                  const filterValue = interactionType === 'column'
                    ? getModelValue(control, fields as IControlRelatedField, defaultValue)
                    : getVariableValue(control, fields, defaultValue)
                  if (!globalControlsInitialValue[itemId]) {
                    globalControlsInitialValue[itemId] = {
                      filters: [],
                      variables: []
                    }
                  }
                  if (interactionType === 'column') {
                    globalControlsInitialValue[itemId].filters = globalControlsInitialValue[itemId].filters.concat(filterValue)
                  } else {
                    globalControlsInitialValue[itemId].variables = globalControlsInitialValue[itemId].variables.concat(filterValue)
                  }
                }
              })
            })
          }
        })
        draft.currentDashboardLoading = false
        draft.currentDashboard = action.payload.dashboardDetail
        draft.currentDashboardSelectOptions = {}
        draft.currentItems = action.payload.dashboardDetail.widgets
        draft.currentItemsInfo = action.payload.dashboardDetail.widgets.reduce((obj, w) => {
            const drillpathSetting = w.config && w.config.length ? JSON.parse(w.config) : void 0
            obj[w.id] = {
              datasource: { resultList: [] },
              loading: false,
              queryConditions: {
                tempFilters: [],
                linkageFilters: [],
                globalFilters: globalControlsInitialValue[w.id] ? globalControlsInitialValue[w.id].filters : [],
                variables: [],
                linkageVariables: [],
                globalVariables: globalControlsInitialValue[w.id] ? globalControlsInitialValue[w.id].variables : [],
                pagination: {},
                drillpathInstance: [],
                ...drillpathSetting
              },
              shareInfo: '',
              shareInfoLoading: false,
              secretInfo: '',
              downloadCsvLoading: false,
              interactId: '',
              rendered: false,
              renderType: 'rerender',
              controlSelectOptions: {},
              selectedItems: [],
              errorMessage: ''
            }
            return obj
          }, {})
        break

      case LOAD_DASHBOARD_DETAIL_FAILURE:
        draft.currentDashboardLoading = false
        break

      case ADD_DASHBOARD_ITEMS_SUCCESS:
        draft.currentItems = (draft.currentItems || []).concat(action.payload.result)
        action.payload.result.forEach((item) => {
          draft.currentItemsInfo[item.id] = {
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {},
              drillpathInstance: []
            },
            shareInfo: '',
            shareInfoLoading: false,
            secretInfo: '',
            downloadCsvLoading: false,
            interactId: '',
            rendered: false,
            renderType: 'rerender',
            controlSelectOptions: {},
            selectedItems: [],
            errorMessage: ''
          }
        })
        break

      case ADD_DASHBOARD_ITEMS_FAILURE:
        break

      case EDIT_DASHBOARD_ITEM_SUCCESS:
        draft.currentItems.splice(draft.currentItems.findIndex(({ id }) => id === action.payload.result.id), 1, action.payload.result)
        break

      case EDIT_DASHBOARD_ITEM_FAILURE:
        break

      case EDIT_DASHBOARD_ITEMS_SUCCESS:
        draft.currentItems = action.payload.items
        break

      case EDIT_DASHBOARD_ITEMS_FAILURE:
        break

      case DELETE_DASHBOARD_ITEM_SUCCESS:
        delete draft.currentItemsInfo[action.payload.id]
        draft.currentItems = draft.currentItems.filter(({ id }) => id !== action.payload.id)
        break

      case DELETE_DASHBOARD_ITEM_FAILURE:
        break

      case CLEAR_CURRENT_DASHBOARD:
        draft.currentDashboard = null
        draft.currentItems = null
        draft.currentItemsInfo = null
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
        if (action.payload.vizType === 'dashboard') {
          const vizItemInfo = draft.currentItemsInfo[action.payload.itemId]
          vizItemInfo.loading = true
          vizItemInfo.errorMessage = ''
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS:
        if (action.payload.vizType === 'dashboard') {
          fieldGroupedSort(action.payload.result.resultList, action.payload.requestParams.customOrders)
          const vizItemInfo = draft.currentItemsInfo[action.payload.itemId]
          draft.currentItemsInfo[action.payload.itemId] = {
            ...vizItemInfo,
            loading: false,
            datasource: action.payload.result,
            renderType: action.payload.renderType,
            queryConditions: {
              ...vizItemInfo.queryConditions,
              tempFilters: action.payload.requestParams.tempFilters,
              linkageFilters: action.payload.requestParams.linkageFilters,
              globalFilters: action.payload.requestParams.globalFilters,
              variables: action.payload.requestParams.variables,
              linkageVariables: action.payload.requestParams.linkageVariables,
              globalVariables: action.payload.requestParams.globalVariables,
              pagination: action.payload.requestParams.pagination,
              nativeQuery: action.payload.requestParams.nativeQuery
            },
            selectedItems: []
          }
        }
        break

      case SELECT_DASHBOARD_ITEM_CHART:
        const selectedItem = draft.currentItemsInfo[action.payload.itemId]
        draft.currentItemsInfo[action.payload.itemId] = {
          ...selectedItem,
          renderType: action.payload.renderType,
          selectedItems: action.payload.selectedItems
        }
        break

      case DRILL_DASHBOARDITEM:
        drillHistory = draft.currentItemsInfo[action.payload.itemId].queryConditions.drillHistory
        if (!drillHistory) {
          draft.currentItemsInfo[action.payload.itemId].queryConditions.drillHistory = []
        }
        draft.currentItemsInfo[action.payload.itemId].queryConditions.drillHistory.push(action.payload.drillHistory)
        break

      case DRILL_PATH_SETTING:
        const drillSetting = draft.currentItemsInfo[action.payload.itemId].queryConditions.drillSetting
        if (!drillSetting) {
          draft.currentItemsInfo[action.payload.itemId].queryConditions.drillSetting = [action.payload.history]
        } else {
          drillSetting.push(action.payload.history)
        }
        break

      case DELETE_DRILL_HISTORY:
        drillHistory = draft.currentItemsInfo[action.payload.itemId].queryConditions.drillHistory
        if (Array.isArray(drillHistory)) {
          drillHistory.splice(action.payload.index + 1)
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE:
        if (action.payload.vizType === 'dashboard' && draft.currentItemsInfo) {
          const vizItemInfo = draft.currentItemsInfo[action.payload.itemId]
          vizItemInfo.loading = false
          vizItemInfo.errorMessage = action.payload.errorMessage
        }
        break

      case LOAD_DASHBOARD_SHARE_LINK:
        draft.currentDashboardShareInfoLoading = true
        break

      case LOAD_DASHBOARD_SHARE_LINK_SUCCESS:
        draft.currentDashboardShareInfo = action.payload.shareInfo
        draft.currentDashboardShareInfoLoading = false
        break

      case LOAD_DASHBOARD_SECRET_LINK_SUCCESS:
        draft.currentDashboardSecretInfo = action.payload.secretInfo
        draft.currentDashboardShareInfoLoading = false
        break

      case LOAD_DASHBOARD_SHARE_LINK_FAILURE:
        draft.currentDashboardShareInfoLoading = false
        break

      case LOAD_WIDGET_SHARE_LINK:
        draft.currentItemsInfo[action.payload.itemId].shareInfoLoading = true
        break

      case LOAD_WIDGET_SHARE_LINK_SUCCESS:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.shareInfo = action.payload.shareInfo
        targetItemInfo.shareInfoLoading = false
        break

      case LOAD_WIDGET_SECRET_LINK_SUCCESS:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.secretInfo = action.payload.shareInfo
        targetItemInfo.shareInfoLoading = false
        break

      case LOAD_WIDGET_SHARE_LINK_FAILURE:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.shareInfoLoading = false
        break

      case LOAD_WIDGET_CSV:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.downloadCsvLoading = true
        break

      case LOAD_WIDGET_CSV_SUCCESS:
      case LOAD_WIDGET_CSV_FAILURE:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.downloadCsvLoading = false
        break

      case INITIATE_DOWNLOAD_TASK:
        if (action.payload.type === DownloadTypes.Widget) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.downloadCsvLoading = true
        }
        break

      case INITIATE_DOWNLOAD_TASK_SUCCESS:
      case INITIATE_DOWNLOAD_TASK_FAILURE:
        if (action.payload.type === DownloadTypes.Widget) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.downloadCsvLoading = false
        }
        break

      case ViewActionTypes.LOAD_SELECT_OPTIONS_SUCCESS:
        if (action.payload.itemId) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.controlSelectOptions[action.payload.controlKey] = action.payload.values
        } else {
          draft.currentDashboardSelectOptions[action.payload.controlKey] = action.payload.values
        }
        break

      case SET_SELECT_OPTIONS:
        if (action.payload.itemId) {
          targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
          targetItemInfo.controlSelectOptions[action.payload.controlKey] = action.payload.options
        } else {
          draft.currentDashboardSelectOptions[action.payload.controlKey] = action.payload.options
        }
        break

      case RENDER_DASHBOARDITEM:
        draft.currentItemsInfo[action.payload.itemId].rendered = true
        break

      case RESIZE_DASHBOARDITEM:
        targetItemInfo = draft.currentItemsInfo[action.payload.itemId]
        targetItemInfo.renderType = 'resize'
        targetItemInfo.datasource = { ...targetItemInfo.datasource }
        break

      case RESIZE_ALL_DASHBOARDITEM:
        Object.values(draft.currentItemsInfo).forEach((itemInfo: any) => {
          itemInfo.renderType = 'resize'
          itemInfo.datasource = { ...itemInfo.datasource }
        })
        break
    }
  })

export default dashboardReducer
