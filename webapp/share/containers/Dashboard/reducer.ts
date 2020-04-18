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
  LOAD_SHARE_DASHBOARD_SUCCESS,
  LOAD_SHARE_WIDGET_SUCCESS,
  SET_INDIVIDUAL_DASHBOARD,
  LOAD_SHARE_RESULTSET,
  LOAD_SHARE_RESULTSET_SUCCESS,
  LOAD_SHARE_RESULTSET_FAILURE,
  LOAD_WIDGET_CSV,
  LOAD_WIDGET_CSV_SUCCESS,
  LOAD_WIDGET_CSV_FAILURE,
  LOAD_SELECT_OPTIONS_SUCCESS,
  RESIZE_ALL_DASHBOARDITEM,
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY,
  SET_SELECT_OPTIONS,
  SELECT_DASHBOARD_ITEM_CHART,
  LOAD_DOWNLOAD_LIST,
  LOAD_DOWNLOAD_LIST_SUCCESS,
  LOAD_DOWNLOAD_LIST_FAILURE,
  DOWNLOAD_FILE_SUCCESS,
  SEND_SHARE_PARAMS
} from './constants'
import {
  IMapItemControlRequestParams,
  IControlRequestParams,
  IGlobalControl,
  IControlRelatedField
} from 'components/Filters/types'
import { DatePickerDefaultValues } from 'components/Filters/datePickerFormats'
import {
  getVariableValue,
  getModelValue,
  deserializeDefaultValue
} from 'components/Filters/util'
import { globalControlMigrationRecorder } from 'utils/migrationRecorders'
import { DashboardItemStatus } from '.'
import { DownloadStatus } from 'containers/App/types'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

const initialState = {
  dashboard: null,
  title: '',
  config: '{}',
  dashboardSelectOptions: null,
  widgets: null,
  items: null,
  itemsInfo: null,
  downloadListLoading: false,
  downloadList: null,
  downloadListInfo: null,
  shareParams: null
}

const shareReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    let itemInfo
    let drillHistory

    switch (action.type) {
      case SEND_SHARE_PARAMS:
        draft.shareParams = action.payload.params
        break

      case LOAD_SHARE_DASHBOARD_SUCCESS:
        const dashboardConfig = action.payload.dashboard.config
          ? JSON.parse(action.payload.dashboard.config)
          : {}
        const globalControls = (dashboardConfig.filters || [])
          .map((c) => globalControlMigrationRecorder(c))
          .map((ctrl) => {
            const { relatedViews, name } = ctrl
            if (draft.shareParams) {
              Object.entries(relatedViews).forEach(([key, value]) => {
                const defaultValue = draft.shareParams[name]
                if (defaultValue && defaultValue.length) {
                  if (ctrl && ctrl.type === 'date') {
                    ctrl.dynamicDefaultValue = DatePickerDefaultValues.Custom
                  }
                  ctrl.defaultValue =
                    Array.isArray(defaultValue) && defaultValue.length
                      ? defaultValue.map((val) => decodeURI(val))
                      : decodeURI(defaultValue)
                }
              })
            }
            return ctrl
          })

        const globalControlsInitialValue = {}
        globalControls.forEach((control: IGlobalControl) => {
          const { interactionType, relatedItems, relatedViews } = control
          const defaultValue = deserializeDefaultValue(control)
          if (defaultValue) {
            Object.entries(relatedItems).forEach(([itemId, config]) => {
              Object.entries(relatedViews).forEach(([viewId, fields]) => {
                if (config.checked && config.viewId === Number(viewId)) {
                  const filterValue =
                    interactionType === 'column'
                      ? getModelValue(
                          control,
                          fields as IControlRelatedField,
                          defaultValue
                        )
                      : getVariableValue(control, fields, defaultValue)
                  if (!globalControlsInitialValue[itemId]) {
                    globalControlsInitialValue[itemId] = {
                      filters: [],
                      variables: []
                    }
                  }
                  if (interactionType === 'column') {
                    globalControlsInitialValue[
                      itemId
                    ].filters = globalControlsInitialValue[
                      itemId
                    ].filters.concat(filterValue)
                  } else {
                    globalControlsInitialValue[
                      itemId
                    ].variables = globalControlsInitialValue[
                      itemId
                    ].variables.concat(filterValue)
                  }
                }
              })
            })
          }
        })

        draft.title = action.payload.dashboard.name
        draft.dashboard = {
          ...action.payload.dashboard,
          config: JSON.stringify({
            ...dashboardConfig,
            filters: globalControls
          })
        }
        draft.config = JSON.stringify({
          ...dashboardConfig,
          filters: globalControls
        })
        draft.dashboardSelectOptions = {}
        draft.widgets = action.payload.dashboard.widgets
        draft.items = action.payload.dashboard.relations
        draft.itemsInfo = action.payload.dashboard.relations.reduce(
          (obj, item) => {
            obj[item.id] = {
              status: DashboardItemStatus.Initial,
              datasource: { resultList: [] },
              loading: false,
              queryConditions: {
                tempFilters: [],
                linkageFilters: [],
                globalFilters: globalControlsInitialValue[item.id]
                  ? globalControlsInitialValue[item.id].filters
                  : [],
                variables: [],
                linkageVariables: [],
                globalVariables: globalControlsInitialValue[item.id]
                  ? globalControlsInitialValue[item.id].variables
                  : [],
                pagination: {}
              },
              downloadCsvLoading: false,
              interactId: '',
              renderType: 'rerender',
              controlSelectOptions: {},
              errorMessage: ''
            }
            return obj
          },
          {}
        )
        break

      case SET_INDIVIDUAL_DASHBOARD:
        draft.items = [
          {
            id: 1,
            x: 0,
            y: 0,
            width: 12,
            height: 12,
            polling: false,
            frequency: 0,
            widgetId: action.payload.widgetId,
            dataToken: action.payload.token
          }
        ]
        draft.itemsInfo = {
          1: {
            status: DashboardItemStatus.Initial,
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {}
            },
            downloadCsvLoading: false,
            interactId: '',
            renderType: 'rerender',
            controlSelectOptions: {},
            errorMessage: ''
          }
        }
        break

      case LOAD_SHARE_WIDGET_SUCCESS:
        if (!draft.widgets) {
          draft.widgets = []
        }
        draft.widgets = draft.widgets.concat(action.payload.widget)
        break

      case SELECT_DASHBOARD_ITEM_CHART:
        draft.itemsInfo[action.payload.itemId].renderType =
          action.payload.renderType
        draft.itemsInfo[action.payload.itemId].selectedItems =
          action.payload.selectedItems
        break

      case LOAD_SHARE_RESULTSET:
        itemInfo = draft.itemsInfo[action.payload.itemId]
        draft.itemsInfo[action.payload.itemId] = {
          ...itemInfo,
          selectedItems: [],
          loading: true,
          errorMessage: '',
          queryConditions: {
            ...itemInfo.queryConditions,
            tempFilters: action.payload.requestParams.tempFilters,
            linkageFilters: action.payload.requestParams.linkageFilters,
            globalFilters: action.payload.requestParams.globalFilters,
            variables: action.payload.requestParams.variables,
            linkageVariables: action.payload.requestParams.linkageVariables,
            globalVariables: action.payload.requestParams.globalVariables,
            pagination: action.payload.requestParams.pagination,
            nativeQuery: action.payload.requestParams.nativeQuery
          }
        }
        break

      case DRILL_DASHBOARDITEM:
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

      case DELETE_DRILL_HISTORY:
        drillHistory =
          draft.itemsInfo[action.payload.itemId].queryConditions.drillHistory
        if (Array.isArray(drillHistory)) {
          drillHistory.splice(action.payload.index + 1)
        }
        break

      case LOAD_SHARE_RESULTSET_SUCCESS:
        fieldGroupedSort(
          action.payload.resultset.resultList,
          action.payload.requestParams.customOrders
        )
        itemInfo = draft.itemsInfo[action.payload.itemId]
        draft.itemsInfo[action.payload.itemId] = {
          ...itemInfo,
          status: DashboardItemStatus.Fulfilled,
          loading: false,
          datasource: action.payload.resultset || { resultList: [] },
          renderType: action.payload.renderType
        }
        break

      case LOAD_SHARE_RESULTSET_FAILURE:
        itemInfo = draft.itemsInfo[action.payload.itemId]
        draft.itemsInfo[action.payload.itemId] = {
          ...itemInfo,
          status: DashboardItemStatus.Error,
          loading: false,
          errorMessage: action.payload.errorMessage
        }
        break

      case LOAD_WIDGET_CSV:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = true
        break

      case LOAD_WIDGET_CSV_SUCCESS:
      case LOAD_WIDGET_CSV_FAILURE:
        draft.itemsInfo[action.payload.itemId].downloadCsvLoading = false
        break

      case LOAD_SELECT_OPTIONS_SUCCESS:
        if (action.payload.itemId) {
          itemInfo = draft.itemsInfo[action.payload.itemId]
          itemInfo.controlSelectOptions[action.payload.controlKey] = action.payload.values
        } else {
          draft.dashboardSelectOptions[action.payload.controlKey] = action.payload.values
        }
        break

      case SET_SELECT_OPTIONS:
        if (action.payload.itemId) {
          itemInfo = draft.itemsInfo[action.payload.itemId]
          itemInfo.controlSelectOptions[action.payload.controlKey] = action.payload.options
        } else {
          draft.dashboardSelectOptions[action.payload.controlKey] = action.payload.options
        }
        break

      case RESIZE_ALL_DASHBOARDITEM:
        Object.values(draft.itemsInfo).forEach((itemInfo: any) => {
          itemInfo.renderType = 'resize'
          itemInfo.datasource = { ...itemInfo.datasource }
        })
        break

      case LOAD_DOWNLOAD_LIST:
        draft.downloadListLoading = true
        break

      case LOAD_DOWNLOAD_LIST_SUCCESS:
        draft.downloadListLoading = false
        draft.downloadList = action.payload.list

        draft.downloadListInfo = action.payload.list.reduce((info, item) => {
          info[item.id] = {
            loading: false
          }
          return info
        }, {})
        break

      case LOAD_DOWNLOAD_LIST_FAILURE:
        draft.downloadListLoading = false
        break

      case DOWNLOAD_FILE_SUCCESS:
        draft.downloadList.find(({ id }) => id === action.payload.id).status =
          DownloadStatus.Downloaded
        break
    }
  })

export default shareReducer
