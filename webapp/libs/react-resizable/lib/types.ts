import { ReactElement, SyntheticEvent } from 'react'

type Axis = 'both' | 'x' | 'y' | 'none'
export type ResizeHandle = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'

export type ResizeCallbackData = {
  node: HTMLElement
  size: { width: number; height: number }
  handle: ResizeHandle
}
export type ResizableProps = {
  children: ReactElement<any>
  className?: string
  width: number
  height: number
  scale?: number
  handle: (resizeHandle: ResizeHandle) => ReactElement<any> | ReactElement<any>
  handleSize: [number, number]
  resizeHandles: ResizeHandle[]
  lockAspectRatio: boolean
  axis: Axis
  minConstraints: [number, number]
  maxConstraints: [number, number]
  onResizeStop?: (e: SyntheticEvent, data: ResizeCallbackData) => any
  onResizeStart?: (e: SyntheticEvent, data: ResizeCallbackData) => any
  onResize?: (e: SyntheticEvent, data: ResizeCallbackData) => any
  draggableOpts?: object
}
