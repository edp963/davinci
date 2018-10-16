// eslint-disable-next-line no-use-before-define
export type DraggableEventHandler = (e: MouseEvent, data: IDraggableData) => void | false

export interface IDraggableData {
  node: HTMLElement,
  x: number, y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
}

export interface IBounds {
  left: number, top: number, right: number, bottom: number
}
export interface IControlPosition {x: number, y: number}
export type EventHandler<T> = (e: T) => void | false

// Missing targetTouches
export interface ITouchEvent2 extends TouchEvent {
  changedTouches: TouchList
  targetTouches: TouchList
}

export type MouseTouchEvent = MouseEvent & ITouchEvent2
