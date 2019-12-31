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

export type DeltaPosition = { deltaX: number, deltaY: number }
export type DeltaSize = { deltaWidth: number, deltaHeight: number }

export type DragInfo = { dragging: boolean }
export type ResizeInfo = { resizing: boolean }
export type SelectionInfo = { selected: boolean }

export type OperationInfo = DragInfo & ResizeInfo & SelectionInfo
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
