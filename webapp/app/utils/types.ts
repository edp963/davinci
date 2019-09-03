import { RouteComponentProps } from 'react-router-dom'

export interface IRouteParams {
  pid?: string
  displayId?: string
}

export type RouteComponentWithParams = RouteComponentProps<IRouteParams, {}>
