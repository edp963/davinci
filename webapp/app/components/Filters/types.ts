import { FilterTypes } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'
import { QueryVariable } from 'containers/Dashboard/Grid'
import { SqlTypes } from 'app/globalConstants'
import { ViewVariableValueTypes } from 'app/containers/View/constants'
import DatePickerFormats from './datePickerFormats'

export type InteractionType = 'column' | 'variable'

export interface IGlobalControlRelatedItem {
  viewId: number
  checked: boolean
}

export interface IControlRelatedField {
  name: string
  type: SqlTypes | ViewVariableValueTypes
  optionsFromColumn?: boolean
  column?: string
}

export interface IControlSelectOption {
  text: string
  value: string
  variable?: string
}

export interface IControlBase {
  key: string
  name: string
  type: FilterTypes
  interactionType: InteractionType
  operator: OperatorTypes
  dateFormat?: DatePickerFormats
  multiple?: boolean
  cache: boolean
  expired: number
  customOptions?: boolean
  options?: IControlSelectOption[]
  width: number
  dynamicDefaultValue?: any
  defaultValue?: any
  parent?: string
}

export interface IGlobalControl extends IControlBase {
  relatedItems: {
    [itemId: string]: IGlobalControlRelatedItem
  }
  relatedViews: {
    [viewId: string]: IControlRelatedField | IControlRelatedField[]
  }
}

export interface ILocalControl extends IControlBase {
  fields: IControlRelatedField | IControlRelatedField[]
}

export interface IRenderTreeItem extends IControlBase {
  children?: IRenderTreeItem[]
}

export interface IGlobalRenderTreeItem extends IRenderTreeItem {
  relatedItems: {
    [itemId: string]: IGlobalControlRelatedItem
  }
  relatedViews: {
    [viewId: string]: IControlRelatedField | IControlRelatedField[]
  }
}

export interface ILocalRenderTreeItem extends IRenderTreeItem {
  fields: IControlRelatedField | IControlRelatedField[]
}

export interface IControlRequestParams {
  variables: QueryVariable
  filters: string[]
}

export interface IMapItemControlRequestParams {
  [itemId: number]: IControlRequestParams
}

export interface IDistinctValueReqeustParams {
  columns: string[]
  filters?: string[]
  variables?: Array<{name: string, value: string | number}>
  cache: boolean
  expired: number
}

export type OnGetControlOptions = (
  controlKey: string,
  userOptions: boolean,
  paramsOrOptions: { [viewId: string]: IDistinctValueReqeustParams } | any[],
  itemId?: number
) => void

export type ControlOptions = Array<{
  [key: string]: Array<number | string>
}>

export interface IMapControlOptions {
  [controlKey: string]: ControlOptions
}

export interface IFilters {
  name: string
  type: string
  value: any
  operator: string
  sqlType: string
  children?: IFilters
}

export enum GlobalControlQueryMode {
  Immediately,
  Manually
}
