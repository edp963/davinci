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
  LOAD_DASHBOARDS_FAILURE,
  ADD_DASHBOARD,
  ADD_DASHBOARD_SUCCESS,
  ADD_DASHBOARD_FAILURE,
  EDIT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD,
  EDIT_CURRENT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD_FAILURE,
  DELETE_DASHBOARD_SUCCESS,
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
  SET_SELECT_OPTIONS,
  GLOBAL_CONTROL_CHANGE
} from './constants'
import {
  INITIATE_DOWNLOAD_TASK,
  INITIATE_DOWNLOAD_TASK_SUCCESS,
  INITIATE_DOWNLOAD_TASK_FAILURE
} from '../App/constants'
import { ActionTypes as ViewActionTypes } from '../View/constants'
import { ViewActionType } from '../View/actions'

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

const initialState = fromJS({
  dashboards: null,
  currentDashboard: null,
  currentDashboardLoading: false,
  currentDashboardShareInfo: '',
  currentDashboardSecretInfo: '',
  currentDashboardShareInfoLoading: false,
  currentDashboardSelectOptions: {},
  currentItems: null,
  currentItemsInfo: null,
  modalLoading: false
})

function dashboardReducer (state = initialState, action: ViewActionType | any) {
  const { type, payload } = action
  const dashboards = state.get('dashboards')
  const dashboardSelectOptions = state.get('currentDashboardSelectOptions')
  const items = state.get('currentItems')
  const itemsInfo = state.get('currentItemsInfo')

  switch (type) {
    case LOAD_DASHBOARDS_SUCCESS:
      return state.set('dashboards', payload.dashboards)
    case LOAD_DASHBOARDS_FAILURE:
      return state

    case ADD_DASHBOARD:
      return state.set('modalLoading', true)
    case ADD_DASHBOARD_SUCCESS:
      if (dashboards) {
        dashboards.push(payload.result)
        return state
          .set('dashboards', dashboards.slice())
          .set('modalLoading', false)
      } else {
        return state
          .set('dashboards', [payload.result])
          .set('modalLoading', false)
      }
    case ADD_DASHBOARD_FAILURE:
      return state.set('modalLoading', false)

    case EDIT_DASHBOARD_SUCCESS:
      const { result, formType } = payload
      if (formType === 'edit') {
        result.forEach((r) => {
          dashboards.splice(dashboards.findIndex((d) => d.id === r.id), 1, r)
        })
      } else if (formType === 'move') {
        result.forEach((r) => {
          dashboards.splice(dashboards.findIndex((d) => d.id === r.id), 1)
        })
        Array.prototype.push.apply(dashboards, result)
      }
      return state.set('dashboards', dashboards.slice())
    case EDIT_CURRENT_DASHBOARD:
      return state.set('currentDashboardLoading', true)
    case EDIT_CURRENT_DASHBOARD_SUCCESS:
      return state
        .set('currentDashboard', payload.result)
        .set('currentDashboardSelectOptions', {})
        .set('currentDashboardLoading', false)
    case EDIT_CURRENT_DASHBOARD_FAILURE:
      return state.set('currentDashboardLoading', false)

    case DELETE_DASHBOARD_SUCCESS:
      return state.set('dashboards', dashboards.filter((i) => i.id !== payload.id))

    case LOAD_DASHBOARD_DETAIL:
      return state
        .set('currentDashboardLoading', true)
        .set('currentDashboardShareInfo', '')
        .set('currentDashboardSecretInfo', '')

    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      const { dashboardDetail } = payload
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
      return state
        .set('currentDashboardLoading', false)
        .set('currentDashboard', payload.dashboardDetail)
        .set('currentDashboardSelectOptions', {})
        .set('currentItems', payload.dashboardDetail.widgets)
        .set('currentItemsInfo', payload.dashboardDetail.widgets.reduce((obj, w) => {
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
            errorMessage: ''
          }
          return obj
        }, {}))
    case LOAD_DASHBOARD_DETAIL_FAILURE:
      return state.set('currentDashboardLoading', false)

    case ADD_DASHBOARD_ITEMS_SUCCESS:
      return state
        .set('currentItems', (items || []).concat(payload.result))
        .set('currentItemsInfo', {
          ...itemsInfo,
          ...payload.result.reduce((obj, item) => {
            obj[item.id] = {
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
              errorMessage: ''
            }
            return obj
          }, {})
        })
    case ADD_DASHBOARD_ITEMS_FAILURE:
      return state

    case EDIT_DASHBOARD_ITEM_SUCCESS:
      items.splice(items.indexOf(items.find((i) => i.id === payload.result.id)), 1, payload.result)
      return state.set('currentItems', items.slice())
    case EDIT_DASHBOARD_ITEM_FAILURE:
      return state

    case EDIT_DASHBOARD_ITEMS_SUCCESS:
      return state.set('currentItems', payload.items)
    case EDIT_DASHBOARD_ITEMS_FAILURE:
      return state

    case DELETE_DASHBOARD_ITEM_SUCCESS:
      delete itemsInfo[payload.id]
      return state.set('currentItems', items.filter((i) => i.id !== payload.id))
    case DELETE_DASHBOARD_ITEM_FAILURE:
      return state

    case CLEAR_CURRENT_DASHBOARD:
      return state
        .set('currentDashboard', null)
        .set('currentItems', null)
        .set('currentItemsInfo', null)

    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
      return payload.vizType !== 'dashboard' ? state : state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            loading: true,
            errorMessage: ''
          }
        })

    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS:
      fieldGroupedSort(payload.result.resultList, payload.requestParams.customOrders)
      return payload.vizType !== 'dashboard' ? state : state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: false,
          datasource: payload.result,
          selectedItems: [],
          renderType: payload.renderType,
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            tempFilters: payload.requestParams.tempFilters,
            linkageFilters: payload.requestParams.linkageFilters,
            globalFilters: payload.requestParams.globalFilters,
            variables: payload.requestParams.variables,
            linkageVariables: payload.requestParams.linkageVariables,
            globalVariables: payload.requestParams.globalVariables,
            pagination: payload.requestParams.pagination,
            nativeQuery: payload.requestParams.nativeQuery
          }
        }
      })
    case GLOBAL_CONTROL_CHANGE:
      const controlRequestParamsByItem: IMapItemControlRequestParams = payload.controlRequestParamsByItem
      Object.entries(controlRequestParamsByItem)
        .forEach(([itemId, requestParams]: [string, IControlRequestParams]) => {
          const { filters: globalFilters, variables: globalVariables } = requestParams
          itemsInfo[itemId].queryConditions = {
            ...itemsInfo[itemId].queryConditions,
            ...globalFilters && { globalFilters },
            ...globalVariables && { globalVariables }
          }
        })
      return state.set('currentItemsInfo', itemsInfo)
    case SELECT_DASHBOARD_ITEM_CHART:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          renderType: payload.renderType,
          selectedItems: payload.selectedItems
        }
      })
    case DRILL_DASHBOARDITEM:
      if (!itemsInfo[payload.itemId].queryConditions.drillHistory) {
        itemsInfo[payload.itemId].queryConditions.drillHistory = []
      }
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            drillHistory: itemsInfo[payload.itemId].queryConditions.drillHistory.concat(payload.drillHistory)
          }
        }
      })
    case DRILL_PATH_SETTING:
      if (!itemsInfo[payload.itemId].queryConditions.drillSetting) {
        itemsInfo[payload.itemId].queryConditions.drillSetting = []
      }
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            drillSetting: itemsInfo[payload.itemId].queryConditions.drillSetting.concat(payload.history)
          }
        }
      })
    case DELETE_DRILL_HISTORY:
      const drillHistoryArray = itemsInfo[payload.itemId].queryConditions.drillHistory
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryConditions: {
            ...itemsInfo[payload.itemId].queryConditions,
            drillHistory: Array.isArray(drillHistoryArray) ? drillHistoryArray.slice(0, payload.index + 1) : drillHistoryArray
          }
        }
      })
    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE:
      return payload.vizType === 'dashboard'
        ? !!itemsInfo
          ? state.set('currentItemsInfo', {
            ...itemsInfo,
            [payload.itemId]: {
              ...itemsInfo[payload.itemId],
              loading: false,
              errorMessage: payload.errorMessage
            }
          })
          : state
        : state

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
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          shareInfoLoading: true
        }
      })
    case LOAD_WIDGET_SHARE_LINK_SUCCESS:
      return state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            shareInfo: payload.shareInfo,
            shareInfoLoading: false
          }
        })
    case LOAD_WIDGET_SECRET_LINK_SUCCESS:
      return state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            secretInfo: payload.shareInfo,
            shareInfoLoading: false
          }
        })
    case LOAD_WIDGET_SHARE_LINK_FAILURE:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          shareInfoLoading: false
        }
      })

    case LOAD_WIDGET_CSV:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: true
        }
      })
    case LOAD_WIDGET_CSV_SUCCESS:
    case LOAD_WIDGET_CSV_FAILURE:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: false
        }
      })
    case INITIATE_DOWNLOAD_TASK:
      return payload.type === DownloadTypes.Widget
        ? state.set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            downloadCsvLoading: true
          }
        })
        : state
    case INITIATE_DOWNLOAD_TASK_SUCCESS:
    case INITIATE_DOWNLOAD_TASK_FAILURE:
      return payload.type === DownloadTypes.Widget
        ? state.set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            downloadCsvLoading: false
          }
        })
        : state
    case ViewActionTypes.LOAD_SELECT_OPTIONS_SUCCESS:
      return payload.itemId
        ?  state.set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            controlSelectOptions: {
              ...itemsInfo[payload.itemId].controlSelectOptions,
              [payload.controlKey]: payload.values
            }
          }
        })
        : state.set('currentDashboardSelectOptions', {
          ...dashboardSelectOptions,
          [payload.controlKey]: payload.values
        })
    case SET_SELECT_OPTIONS:
      return payload.itemId
        ? state.set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            controlSelectOptions: {
              ...itemsInfo[payload.itemId].controlSelectOptions,
              [payload.controlKey]: payload.options
            }
          }
        })
        : state.set('currentDashboardSelectOptions', {
          ...dashboardSelectOptions,
          [payload.controlKey]: payload.options
        })
    case RENDER_DASHBOARDITEM:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          rendered: true
        }
      })
    case RESIZE_DASHBOARDITEM:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          renderType: 'resize',
          datasource: {...itemsInfo[payload.itemId].datasource}
        }
      })
    case RESIZE_ALL_DASHBOARDITEM:
      return state.set(
        'currentItemsInfo',
        Object.entries(itemsInfo).reduce((info, [key, prop]: [string, any]) => {
          info[key] = {
            ...prop,
            renderType: 'resize',
            datasource: {...prop.datasource}
          }
          return info
        }, {})
      )
    default:
      return state
  }
}

export default dashboardReducer
