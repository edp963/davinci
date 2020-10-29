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

import { IViewModel } from 'containers/View/types'

import { Merge } from 'utils/types'

import { IFilter } from 'app/components/Control/types'

import { IQueryVariableMap } from 'containers/Dashboard/types'

import {
  IWidgetDimension,
  IWidgetFilter,
  IWidgetMetric,
  IWidgetSecondaryMetric,
  IChartStyles,
  DimetionType,
  RenderType,
  WidgetMode,
  IPaginationParams,
  IWidgetConfig
} from 'containers/Widget/components/Widget'

import { IDataParamProperty } from 'containers/Widget/components/Workbench/OperatingPanel'
import { number } from 'prop-types'

export enum DrillType {
  UP = 'up',
  DOWN = 'down'
}

export enum DrillCharts {
  DRILLUP = 'drillUp',
  PIVOTROW = 'pivotRow',
  PIVOTCOL = 'pivotCol',
  DIMETIONAXISCOL = 'dimetionAxisCol',
  DIMETIONAXISROW = 'dimetionAxisRow',
  COUSTOMTABLE = 'coustomTable',
  DEFAULT = 'defaultScenes',
  PIVOT = 'pivot',
  COMMON = 'common'
}

export enum WidgetDimensions {
  COL = 'cols',
  ROW = 'rows'
}

export enum WidgetDimension {
  COL = 'col',
  ROW = 'row'
}

export interface IWidgetPool {
  [widgetId: number]: WidgetAbstract
}

export default class WidgetAbstract {
  public data: object[]
  public cols: IWidgetDimension[]
  public rows: IWidgetDimension[]
  public metrics: IWidgetMetric[]
  public secondaryMetrics?: IWidgetSecondaryMetric[]
  public filters: IWidgetFilter[]
  public chartStyles: IChartStyles
  public selectedChart: number
  public interacting?: boolean
  public color?: IDataParamProperty
  public label?: IDataParamProperty
  public size?: IDataParamProperty
  public xAxis?: IDataParamProperty
  public tip?: IDataParamProperty
  public yAxis?: IDataParamProperty
  public dimetionAxis?: DimetionType
  public renderType?: RenderType
  public orders: Array<{ column: string; direction: string }>
  public mode: WidgetMode
  public model: IViewModel
  public pagination?: IPaginationParams
  public queryVariables?: IQueryVariableMap
  public controls: any[]
  public limit: number
  public cache: boolean
  public expired: number
  public autoLoadData: boolean
  public initGroups?: string[]
  public initAggregators?: object[]
}
export interface IDrillDetail {
  type: DrillType
  groups: string[]
  filters: IFilter[]
  currentGroup: string // 对应原 name
  [WidgetDimensions.COL]?: IWidgetDimension[]
  [WidgetDimensions.ROW]?: IWidgetDimension[]
}

export type IDrillStrategies = Merge<
  Required<IDrillDetail>,
  { widgetProps: WidgetAbstract }
>

export interface ISourceDataFilter {
  key: string
  value: string
}

export interface IDataDrillProps {
  widgetConfig: IWidgetConfig
  drillHistory?: IDrillDetail[]
  key?: string | number
  currentData?: object[]
  onDataDrillPath?: () => any
  onDataDrillDown?: (name: string, dimensions?: WidgetDimension) => any
  onDataDrillUp?: (name: string) => any
  drillpathSetting?: []
}

export interface IEnhancerPanel {
  isSelectedfilter: object[]
  isSelectedGroup: string[]
  chartStyle: number
}
