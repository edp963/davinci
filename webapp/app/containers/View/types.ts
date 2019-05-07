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
import { IPersistSource, ISourceTable, IMapTableColumns } from 'containers/Source/types'
import { ViewModelTypes, ViewModelVisualTypes, ViewVariableTypes, ViewVariableValueTypes } from './constants'

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
  source?: IPersistSource
  sourceId: number
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
}

export interface IExecuteSqlParams {
  sourceId: number
  sql: string
  limit: number
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

export interface IViewModel {
  name: string
  sqlType: SqlTypes,
  visualType: ViewModelVisualTypes,
  modelType: ViewModelTypes
}

export interface IViewVariable {
  name: string
  type: ViewVariableTypes
  valueType: ViewVariableValueTypes
  defaultValues: Array<string | number | boolean>
  fromService: boolean
}

export interface IViewRoleAuth {
  roleId: number
  /**
   * view columns name
   * @type {string[]}
   * @memberof IViewRoleAuth
   */
  columnAuth: string[]

  /**
   * query variable values
   * @type {(Array<string | number>)}
   * @memberof IViewRoleAuth
   */
  rowAuth: Array<{ name: string, values: Array<string | number> }>
}

export interface IViewInfo {
  model: IViewModel[]
  variable: IViewVariable[]
}

export interface IViewState {
  views: IViewBase[]
  editingView: IView
  editingViewInfo: IViewInfo
  sources: IPersistSource[]
  tables: ISourceTable[]
  mapTableColumns: IMapTableColumns
  sqlValidation: ISqlValidation
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  loading: IViewLoading
}
