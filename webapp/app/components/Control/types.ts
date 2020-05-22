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

import { ControlTypes, DatePickerFormats } from './constants'
import { OperatorTypes } from 'utils/operatorTypes'
import { IQueryConditions } from 'containers/Dashboard/types'
import { SqlTypes } from 'app/globalConstants'
import { ViewVariableValueTypes } from 'app/containers/View/constants'

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

export interface IControlOption {
  text: string
  value: string
  variable?: string
}

export interface IControlBase {
  key: string
  name: string
  type: ControlTypes
  interactionType: InteractionType
  operator: OperatorTypes
  dateFormat?: DatePickerFormats
  multiple?: boolean
  cache: boolean
  expired: number
  customOptions?: boolean
  options?: IControlOption[]
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

export type ILocalControlConditions = Pick<
  IQueryConditions,
  'tempFilters' | 'variables'
>
export type IGlobalControlConditions = Pick<
  IQueryConditions,
  'globalFilters' | 'globalVariables'
>

export interface IGlobalControlConditionsByItem {
  [itemId: number]: IGlobalControlConditions
}

export interface IDistinctValueReqeustParams {
  columns: string[]
  filters?: string[]
  variables?: Array<{ name: string; value: string | number }>
  cache: boolean
  expired: number
}

export type OnGetControlOptions = (
  controlKey: string,
  userOptions: boolean,
  paramsOrOptions: { [viewId: string]: IDistinctValueReqeustParams } | any[],
  itemId?: number
) => void

export interface IMapControlOptions {
  [controlKey: string]: IControlOption[]
}

export interface IFilters {
  name: string
  type: string
  value: string[]
  operator: string
  sqlType: string
  children?: IFilters
}

export enum GlobalControlQueryMode {
  Immediately,
  Manually
}
