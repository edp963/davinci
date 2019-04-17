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

export interface IView {
  id: number
  name: string
  sql: string
  model: string
  config: string
  description: string
  projectId: number
  source: IPersistSource
  sourceId: number
}

export interface ISqlValidation {
  code: number
  message: string
}

export interface IViewLoading {
  table: boolean
  modal: boolean
  execute: boolean
}

export interface IExecuteSqlParams {
  sourceId: number
  sql: string
  pageNo: number
  pageSize: number
  limit: number
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

export interface IViewState {
  views: IView[]
  sources: IPersistSource[]
  tables: ISourceTable[]
  mapTableColumns: IMapTableColumns
  sqlValidation: ISqlValidation
  loading: IViewLoading
}
