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

import { IDashboardBase, IDashboardRaw } from 'app/containers/Viz/types'
import { IControl } from 'app/components/Control/types'
import { ControlQueryMode } from 'app/components/Control/constants'
import { RenderType, IPaginationParams } from '../Widget/components/Widget'
import { IFieldSortDescriptor } from '../Widget/components/Config/Sort'
import { TShareVizsType, ISharePanel } from 'app/components/SharePanel/types'
import { IWidgetFormed } from '../Widget/types'
import { IView, IViewQueryResponse } from '../View/types'
import { CancelTokenSource } from 'axios'
import { IDrillDetail } from 'components/DataDrill/types'

export interface IDashboard extends IDashboardBase {
  config: IDashboardConfig
}

export interface IDashboardConfig {
  filters: IControl[]
  linkages: any[]
  queryMode: ControlQueryMode
}

export interface IDashboardDetailRaw extends IDashboardRaw {
  relations: IDashboardItem[]
  views: IView[]
}

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
  alias?: string
}

export interface IDashboardItemInfo {
  datasource: IViewQueryResponse
  loading: boolean
  queryConditions: IQueryConditions
  shareToken: string
  passwordShareToken?: string
  password?: string
  authorizedShareToken: string
  shareLoading: boolean
  downloadCsvLoading: boolean
  interactId: string
  rendered: boolean
  renderType: RenderType
  selectedItems: number[]
  errorMessage: string
}

export type QueryVariable = Array<{ name: string; value: string | number }>

export interface IQueryVariableMap {
  [key: string]: string | number
}

export interface IQueryConditions {
  tempFilters: string[] // @TODO combine widget static filters with local filters
  linkageFilters: string[]
  globalFilters: string[]
  variables: QueryVariable
  linkageVariables: QueryVariable
  globalVariables: QueryVariable
  pagination: IPaginationParams
  nativeQuery: boolean
  orders?: Array<{ column: string; direction: string }>
  drillStatus?: any
  drillHistory?: IDrillDetail[]
  drillpathSetting?: any
  drillpathInstance?: any
  drillSetting?: any
}

export interface IDataRequestParams {
  groups: string[]
  aggregators: Array<{ column: string; func: string }>
  filters: string[]
  tempFilters: string[]
  linkageFilters: string[]
  globalFilters: string[]
  variables: QueryVariable
  linkageVariables: QueryVariable
  globalVariables: QueryVariable
  orders: Array<{ column: string; direction: string }>
  limit: number
  cache: boolean
  expired: number
  flush: boolean
  pagination?: IPaginationParams
  nativeQuery: boolean
  customOrders?: IFieldSortDescriptor[]
  drillStatus?: {
    filters: any[]
    groups: string[]
  }
}

export interface IDataRequestBody {
  groups: string[]
  aggregators: Array<{ column: string; func: string }>
  filters: string[]
  params?: QueryVariable
  orders?: Array<{ column: string; direction: string }>
  limit: number
  cache: boolean
  expired: number
  flush: boolean
  pageNo: number
  pageSize: number
  nativeQuery: boolean
}

export interface IDataDownloadStatistic {
  id: number
  param: IDataRequestBody
  itemId: number
  widget: IWidgetFormed
}

export interface IDashboardState {
  currentDashboard: IDashboard
  currentDashboardLoading: boolean
  currentDashboardShareToken: string
  currentDashboardAuthorizedShareToken: string
  currentDashboardPasswordShareToken: string
  currentDashboardPasswordSharePassword: string
  currentDashboardShareLoading: boolean
  sharePanel: IDashboardSharePanelState
  currentItems: IDashboardItem[]
  currentItemsInfo: {
    [itemId: string]: IDashboardItemInfo
  }
  fullScreenPanelItemId: number
  cancelTokenSources: CancelTokenSource[]
}

export interface IDashboardSharePanelState
  extends Pick<ISharePanel, 'id' | 'itemId' | 'type' | 'title'> {
  visible: boolean
}

export type ILoadData = (
  renderType: RenderType,
  itemId: number,
  queryConditions?: Partial<IQueryConditions>
) => void

export { IDashboardRaw, TShareVizsType }
