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

import { SqlTypes } from 'app/globalConstants'
import { ISourceSimple, ISourceBase, ISchema } from 'containers/Source/types'
import { ViewModelTypes, ViewModelVisualTypes, ViewVariableTypes, ViewVariableValueTypes } from './constants'
import { CancelTokenSource } from 'axios'

export interface IViewBase {
  id: number
  name: string
  description: string
  sourceName: string
}

type IViewTemp = Omit<IViewBase, 'sourceName'>

export interface IView extends IViewTemp {
  sql: string
  model: string
  variable: string
  config: string
  projectId: number
  source?: ISourceSimple
  sourceId: number
  roles: IViewRoleRaw[]
}

type IViewTemp2 = Omit<Omit<Omit<IView, 'model'>, 'variable'>, 'roles'>

export interface IFormedView extends IViewTemp2 {
  model: IViewModel
  variable: IViewVariable[]
  roles: IViewRole[]
}

export interface ISqlValidation {
  code: number
  message: string
}

export interface IViewLoading {
  view: boolean
  table: boolean
  modal: boolean
  execute: boolean
  copy: boolean
}

export interface IExecuteSqlParams {
  sourceId: number
  sql: string
  limit: number
  variables: IViewVariableBase[]
}

export interface ISqlColumn {
  name: string
  type: SqlTypes
}

export interface IExecuteSqlResponse {
  columns: ISqlColumn[]
  totalCount: number
  resultList: Array<{[key: string]: string | number}>
}

export interface IViewModelProps {
  name: string
  sqlType: SqlTypes,
  visualType: ViewModelVisualTypes,
  modelType: ViewModelTypes
}

export interface IViewModel {
  [name: string]: Omit<IViewModelProps, 'name'>
}

interface IViewVariableChannel {
  bizId: number
  name: string
  tenantId: number
}

interface IViewVariableBase {
  name: string
  type: ViewVariableTypes
  valueType: ViewVariableValueTypes
  defaultValues: Array<string | number | boolean>
  channel?: IViewVariableChannel
  udf: boolean
}

export interface IViewVariable extends IViewVariableBase {
  key: string
  alias: string
  fromService: boolean
}

export interface IViewRoleRaw {
  roleId: number
  columnAuth: string
  rowAuth: string
}

export interface IViewRoleRowAuth {
  name: string
  values: Array<string | number | boolean>
  enable: boolean
}

export interface IViewRole {
  roleId: number
  /**
   * view columns name
   * @type {string[]}
   * @memberof IViewRole
   */
  columnAuth: string[]

  /**
   * query variable values
   * @type {(Array<string | number>)}
   * @memberof IViewRole
   */
  rowAuth: IViewRoleRowAuth[]
}

export interface IViewInfo {
  model: IViewModel
  variable: IViewVariable[]
  roles: IViewRole[]
}

export interface IFormedViews {
  [viewId: number]: IFormedView
}

export type IDacChannel = string
export interface IDacTenant {
  id: number
  name: string
}
export interface IDacBiz {
  id: number
  name: string
}

export interface IViewState {
  views: IViewBase[]
  formedViews: IFormedViews
  editingView: IView
  editingViewInfo: IViewInfo
  sources: ISourceBase[]
  schema: ISchema
  sqlValidation: ISqlValidation
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  loading: IViewLoading

  channels: IDacChannel[]
  tenants: IDacTenant[]
  bizs: IDacBiz[]

  cancelTokenSources: CancelTokenSource[]
}
