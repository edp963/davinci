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

import React from 'react'
import { OperationInfo, DeltaSize, DeltaPosition } from './types'
import { ILayerFormed } from '../types'
import { ILayerInfo } from '../../types'
import { IWidgetFormed } from 'containers/Widget/types'
import { IViewModel } from 'app/containers/View/types'
import { RenderType } from 'app/containers/Widget/components/Widget'
import { IQueryConditions } from 'app/containers/Dashboard/Grid'

export type LayerListContextValue = {
  currentDisplayWidgets: { [widgetId: number]: IWidgetFormed }
  editWidget?: (widgetId: number) => void
  getWidgetViewModel: (viewId: number, widgetId: number) => IViewModel
  getChartData: (
    renderType: RenderType,
    slideId: number,
    layerId: number,
    widget: IWidgetFormed,
    prevQueryCondition?: Partial<IQueryConditions>,
    queryConditions?: Partial<IQueryConditions>
  ) => void
  onDrag?: (
    layerId: number,
    deltaPosition: DeltaPosition,
    finish?: boolean
  ) => void
  onResize?: (layerId: number, deltaSize: DeltaSize, finish?: boolean) => void
  onSelectionChange?: (
    layerId: number,
    selected: boolean,
    exclusive: boolean
  ) => void
}

export const LayerListContext = React.createContext<LayerListContextValue>({
  currentDisplayWidgets: {},
  editWidget: () => {},
  getWidgetViewModel: () => null,
  getChartData: () => {},
  onDrag: () => {},
  onResize: () => {},
  onSelectionChange: () => {}
})

export type LayerContextValue = {
  layer: ILayerFormed
  layerInfo: ILayerInfo
  operationInfo?: OperationInfo
}

export const LayerContext = React.createContext<LayerContextValue>({
  layer: null,
  layerInfo: null,
  operationInfo: {
    dragging: false,
    resizing: false,
    selected: false
  }
})
