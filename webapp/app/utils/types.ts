import { RouteComponentProps } from 'react-router-dom'

export interface IRouteParams {
  organizationId?: string
  pid?: string
  portalId?: string
  dashboardId?: string
  wid?: string
  displayId?: string
  viewId?: string
  uid?: string
}

export type RouteComponentWithParams = RouteComponentProps<IRouteParams, {}>
