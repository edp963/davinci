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

import { IDashboard } from 'app/containers/Viz/types'
import { IMapControlOptions, IGridCtrlParams } from 'app/components/Filters/types'
import { RenderType } from '../Widget/components/Widget'
import { IFieldSortDescriptor } from '../Widget/components/Config/Sort'
import { SharePanelType, ISharePanel } from 'app/components/SharePanel/type'

export interface IDashboardItem {
  id: number
  dashboardId: number
  widgetId: number
  width: number
  height: number
  x: number
  y: number
  polling: boolean
  frequency: number
  config: string
}

export interface IDashboardItemInfo {
  datasource: {
    pageNo: number
    pageSize: number
    resultList: any[]
    totalCount: number
  }
  loading: boolean
  queryConditions: IQueryConditions
  shareToken: string
  authorizedShareToken: string
  shareLoading: boolean
  downloadCsvLoading: boolean
  interactId: string
  rendered: boolean
  renderType: RenderType
  controlSelectOptions: IMapControlOptions
  selectedItems: number[]
  errorMessage: string
}

export type QueryVariable = Array<{name: string, value: string | number}>

export interface IQueryVariableMap {
  [key: string]: string | number
}

export interface IQueryConditions {
  tempFilters?: string[]
  linkageFilters?: string[]
  globalFilters?: string[]
  orders?: Array<{column: string, direction: string}>
  variables?: QueryVariable
  linkageVariables?: QueryVariable
  globalVariables?: QueryVariable
  pagination?: {
    pageNo: number
    pageSize: number
  }
  nativeQuery?: boolean
  drillStatus?: any
  drillHistory?: Array<{filter?: any, type?: string, col?: string[], row?: string[], groups?: string[], name: string}>
  drillpathSetting?: any
  drillpathInstance?: any
  drillSetting?: any
}

export interface IDataRequestParams {
  groups: string[]
  aggregators: Array<{column: string, func: string}>
  filters: string[]
  tempFilters?: string[]
  linkageFilters?: string[]
  globalFilters?: string[]
  variables?: QueryVariable
  linkageVariables?: QueryVariable
  globalVariables?: QueryVariable
  orders: Array<{column: string, direction: string}>
  cache: boolean
  expired: number
  flush: boolean
  pagination?: {
    pageNo: number
    pageSize: number
  }
  nativeQuery?: boolean
  customOrders?: IFieldSortDescriptor[]
  drillStatus?: {
    filter: {
      sqls: []
    }
    groups: string[]
  }
}

export interface IDataDownloadParams extends IDataRequestParams {
  id: number
}

export interface IDashboardState {
  currentDashboard: IDashboard
  currentDashboardLoading: boolean
  currentDashboardShareToken: string
  currentDashboardAuthorizedShareToken: string
  currentDashboardShareLoading: boolean
  sharePanel: IDashboardSharePanelState
  currentDashboardSelectOptions: IMapControlOptions
  currentItems: IDashboardItem[]
  currentItemsInfo: {
    [key: string]: IDashboardItemInfo
  }
  currentDashboardGlobalControlParams: IGridCtrlParams
}

export interface IDashboardSharePanelState extends Pick<ISharePanel, 'id' | 'itemId' | 'type' | 'title'> {
  visible: boolean
}

export { IDashboard, SharePanelType }
