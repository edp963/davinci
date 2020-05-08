import { RouteComponentProps } from 'react-router-dom'

export interface IRouteParams {
  organizationId?: string
  projectId?: string
  portalId?: string
  dashboardId?: string
  widgetId?: string
  displayId?: string
  slideId?: string
  viewId?: string
  scheduleId?: string
  userId?: string
}

export type RouteComponentWithParams = RouteComponentProps<IRouteParams, {}>

export type IValue<T, U extends keyof T> = T[U]

export type Diff<T extends object, U extends object> = Omit<
  T,
  Extract<keyof T, keyof U>
>

export type Compute<T extends any> = T extends () => void
  ? T
  : { [U in keyof T]: T[U] }

export type Merge<T extends object, U extends object> = Compute<
  T & Omit<U, keyof T>
>

export type DeepPartial<T> = {
  [U in keyof T]?: T[U] extends object ? DeepPartial<T[U]> : T[U]
}

export type OverWrite<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>

export type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]


export interface IReduxActionStruct<T>  {
  type?: string,
  payload: T
}
