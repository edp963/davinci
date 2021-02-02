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

import { IWidgetFormed } from 'containers/Widget/types'
import { IViewModel } from 'app/containers/View/types'
import { RenderType } from 'app/containers/Widget/components/Widget'
import { IQueryConditions } from 'app/containers/Dashboard/types'
import { ILayerOperationInfo } from 'app/containers/Display/components/types'
import { ILayerFormed } from '../types'
import { ILayerInfo } from '../../types'
import { DragTriggerTypes } from '../../constants'

export type DeltaPosition = { deltaX: number, deltaY: number }
export type DeltaSize = { deltaWidth: number, deltaHeight: number }

export type DragInfo = { dragging: boolean }
export type ResizeInfo = { resizing: boolean }
export type SelectionInfo = { selected: boolean }
export type EditorInfo = { editing: boolean }

export type OperationInfo = DragInfo & ResizeInfo & SelectionInfo & EditorInfo
export type LayersOperationInfo = { [layerId: number]: OperationInfo }

export type DraggableChildrenProps = {
  style?: React.CSSProperties
  // other mouse or touch event from DraggableCore
}

export type ContextMenuChildrenProps = {
  className?: string
  // other mouse or touch event from antd DropDown(ContextMenu)
}

export type ResizableChildrenProps = {
  className?: string
  // other props
  // libs/react-resizable/lib/Resizable.tsx Line #225
}

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
    eventTrigger: DragTriggerTypes,
    finish?: boolean
  ) => void
  onResize?: (layerId: number, deltaSize: DeltaSize, finish?: boolean) => void
  onSelectionChange?: (
    layerId: number,
    selected: boolean,
    exclusive: boolean
  ) => void
  onEditLabelChange?: (
    layerId: number,
    changedInfo: Partial<ILayerOperationInfo>
  ) => void
}

export type LayerContextValue = {
  layer: ILayerFormed
  layerInfo: ILayerInfo
  operationInfo?: OperationInfo
}
