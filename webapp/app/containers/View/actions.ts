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
import { IDavinciResponse } from 'utils/request'
import {
  IViewBase,
  IView,
  IExecuteSqlParams,
  IExecuteSqlResponse,
  IViewInfo,
  IDacChannel,
  IDacTenant,
  IDacBiz,
  IViewQueryResponse
} from './types'
import { IDataRequestBody } from '../Dashboard/types'
import { RenderType } from 'containers/Widget/components/Widget'
import { IDistinctValueReqeustParams } from 'app/components/Control/types'
import { EExecuteType } from './Editor'
const CancelToken = axios.CancelToken

export const ViewActions = {
  viewsLoaded (views: IViewBase[]) {
    return {
      type: ActionTypes.LOAD_VIEWS_SUCCESS,
      payload: {
        views
      }
    }
  },
  loadViews (projectId: number, resolve?: (views: IViewBase[]) => void) {
    return {
      type: ActionTypes.LOAD_VIEWS,
      payload: {
        projectId,
        resolve
      }
    }
  },
  loadViewsFail () {
    return {
      type: ActionTypes.LOAD_VIEWS_FAILURE,
      payload: {}
    }
  },

  viewsDetailLoaded (views: IView[], isEditing: boolean) {
    return {
      type: ActionTypes.LOAD_VIEWS_DETAIL_SUCCESS,
      payload: {
        views,
        isEditing
      }
    }
  },
  loadViewsDetail (
    viewIds: number[],
    resolve?: (views: IView[]) => void,
    isEditing: boolean = false
  ) {
    return {
      type: ActionTypes.LOAD_VIEWS_DETAIL,
      payload: {
        viewIds,
        isEditing,
        resolve
      }
    }
  },
  loadViewsDetailFail () {
    return {
      type: ActionTypes.LOAD_VIEWS_DETAIL_FAILURE,
      payload: {}
    }
  },

  addView (view: IView, resolve: () => void) {
    return {
      type: ActionTypes.ADD_VIEW,
      payload: {
        view,
        resolve
      }
    }
  },
  viewAdded (result: IView) {
    return {
      type: ActionTypes.ADD_VIEW_SUCCESS,
      payload: {
        result
      }
    }
  },
  addViewFail () {
    return {
      type: ActionTypes.ADD_VIEW_FAILURE,
      payload: {}
    }
  },

  editView (view: IView, resolve: () => void) {
    return {
      type: ActionTypes.EDIT_VIEW,
      payload: {
        view,
        resolve
      }
    }
  },
  viewEdited (result: IView) {
    return {
      type: ActionTypes.EDIT_VIEW_SUCCESS,
      payload: {
        result
      }
    }
  },
  editViewFail () {
    return {
      type: ActionTypes.EDIT_VIEW_FAILURE,
      payload: {}
    }
  },

  deleteView (id: number, resolve: (id: number) => void) {
    return {
      type: ActionTypes.DELETE_VIEW,
      payload: {
        id,
        resolve
      }
    }
  },
  viewDeleted (id: number) {
    return {
      type: ActionTypes.DELETE_VIEW_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteViewFail () {
    return {
      type: ActionTypes.DELETE_VIEW_FAILURE,
      payload: {}
    }
  },

  copyView (view: IViewBase, resolve: () => void) {
    return {
      type: ActionTypes.COPY_VIEW,
      payload: {
        view,
        resolve
      }
    }
  },
  viewCopied (fromViewId: number, result: IView) {
    return {
      type: ActionTypes.COPY_VIEW_SUCCESS,
      payload: {
        fromViewId,
        result
      }
    }
  },
  copyViewFail () {
    return {
      type: ActionTypes.COPY_VIEW_FAILURE,
      payload: {}
    }
  },

  setIsLastExecuteWholeSql (isLastExecuteWholeSql: boolean) {
    return {
      type: ActionTypes.IS_LAST_EXECUTE_WHOLE_SQL,
      payload: {
        isLastExecuteWholeSql
      }
    }
  },

  executeSql (params: IExecuteSqlParams, exeType: EExecuteType) {
    return {
      type: ActionTypes.EXECUTE_SQL,
      payload: {
        params,
        exeType
      }
    }
  },
  sqlExecuted (result: IDavinciResponse<IExecuteSqlResponse>) {
    return {
      type: ActionTypes.EXECUTE_SQL_SUCCESS,
      payload: {
        result
      }
    }
  },
  executeSqlFail (err: IDavinciResponse<any>['header']) {
    return {
      type: ActionTypes.EXECUTE_SQL_FAILURE,
      payload: {
        err
      }
    }
  },
  executeSqlCancel () {
    return {
      type: ActionTypes.EXECUTE_SQL_CANCEL,
      payload: {}
    }
  },

  updateEditingView (view: IView) {
    return {
      type: ActionTypes.UPDATE_EDITING_VIEW,
      payload: {
        view
      }
    }
  },
  updateEditingViewInfo (viewInfo: IViewInfo) {
    return {
      type: ActionTypes.UPDATE_EDITING_VIEW_INFO,
      payload: {
        viewInfo
      }
    }
  },

  setSqlLimit (limit: number) {
    return {
      type: ActionTypes.SET_SQL_LIMIT,
      payload: {
        limit
      }
    }
  },

  resetViewState () {
    return {
      type: ActionTypes.RESET_VIEW_STATE,
      payload: {}
    }
  },

  /** Actions for fetch external authorization variables values */
  loadDacChannels () {
    return {
      type: ActionTypes.LOAD_DAC_CHANNELS,
      payload: {}
    }
  },
  dacChannelsLoaded (channels: IDacChannel[]) {
    return {
      type: ActionTypes.LOAD_DAC_CHANNELS_SUCCESS,
      payload: {
        channels
      }
    }
  },
  loadDacChannelsFail () {
    return {
      type: ActionTypes.LOAD_DAC_CHANNELS_FAILURE,
      payload: {}
    }
  },

  loadDacTenants (channelName: string) {
    return {
      type: ActionTypes.LOAD_DAC_TENANTS,
      payload: {
        channelName
      }
    }
  },
  dacTenantsLoaded (tenants: IDacTenant[]) {
    return {
      type: ActionTypes.LOAD_DAC_TENANTS_SUCCESS,
      payload: {
        tenants
      }
    }
  },
  loadDacTenantsFail () {
    return {
      type: ActionTypes.LOAD_DAC_TENANTS_FAILURE,
      payload: {}
    }
  },

  loadDacBizs (channelName: string, tenantId: number) {
    return {
      type: ActionTypes.LOAD_DAC_BIZS,
      payload: {
        channelName,
        tenantId
      }
    }
  },
  dacBizsLoaded (bizs: IDacBiz[]) {
    return {
      type: ActionTypes.LOAD_DAC_BIZS_SUCCESS,
      payload: {
        bizs
      }
    }
  },
  loadDacBizsFail () {
    return {
      type: ActionTypes.LOAD_DAC_BIZS_FAILURE,
      payload: {}
    }
  },
  /** */

  /** Actions for external usages */
  loadSelectOptions (
    controlKey: string,
    requestParams: { [viewId: string]: IDistinctValueReqeustParams },
    itemId?: number
  ) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS,
      payload: {
        controlKey,
        requestParams,
        itemId,
        cancelTokenSource: CancelToken.source()
      }
    }
  },
  selectOptionsLoaded (
    controlKey: string,
    values: object[],
    itemId?: number
  ) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS_SUCCESS,
      payload: {
        controlKey,
        values,
        itemId
      }
    }
  },
  loadSelectOptionsFail (err) {
    return {
      type: ActionTypes.LOAD_SELECT_OPTIONS_FAILURE,
      payload: {
        err
      }
    }
  },

  loadViewData (
    id: number,
    requestParams: IDataRequestBody,
    resolve: (data: any[]) => void,
    reject: (error) => void
  ) {
    return {
      type: ActionTypes.LOAD_VIEW_DATA,
      payload: {
        id,
        requestParams,
        resolve,
        reject
      }
    }
  },
  viewDataLoaded () {
    return {
      type: ActionTypes.LOAD_VIEW_DATA_SUCCESS
    }
  },
  loadViewDataFail (err) {
    return {
      type: ActionTypes.LOAD_VIEW_DATA_FAILURE,
      payload: {
        err
      }
    }
  },

  loadColumnDistinctValue(
    paramsByViewId: {
      [viewId: string]: Omit<IDistinctValueReqeustParams, 'cache' | 'expired'>
    },
    callback: (options?: object[]) => void
  ) {
    return {
      type: ActionTypes.LOAD_COLUMN_DISTINCT_VALUE,
      payload: {
        paramsByViewId,
        callback
      }
    }
  },

  loadViewDataFromVizItem (
    renderType: RenderType,
    itemId: number | [number, number],
    viewId: number,
    requestParams: any,
    vizType: 'dashboard' | 'display',
    statistic
  ) {
    return {
      type: ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM,
      payload: {
        renderType,
        itemId,
        viewId,
        requestParams,
        vizType,
        cancelTokenSource: CancelToken.source()
      },
      statistic
    }
  },
  viewDataFromVizItemLoaded (
    renderType: RenderType,
    itemId: number | [number, number],
    requestParams: any,
    result: IViewQueryResponse,
    vizType: 'dashboard' | 'display',
    statistic
  ) {
    return {
      type: ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS,
      payload: {
        renderType,
        itemId,
        requestParams,
        result,
        vizType
      },
      statistic
    }
  },
  loadViewDataFromVizItemFail (
    itemId: number | [number, number],
    vizType: 'dashboard' | 'display',
    errorMessage: string
  ) {
    return {
      type: ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE,
      payload: {
        itemId,
        vizType,
        errorMessage
      }
    }
  }
  /** */
}
const mockAction = returnType(ViewActions)
export type ViewActionType = typeof mockAction

export default ViewActions
