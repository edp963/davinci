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

export type SourceType = 'csv' | 'jdbc'

export interface ISourceSimple {
  id: number
  name: string
}

interface ISourceBase extends ISourceSimple {
  type: SourceType
  description: string
  projectId: number
}

export interface ISourceRaw extends ISourceBase {
  config: string
}

export interface ISource extends ISourceBase {
  config: {
    username: string
    password: string
    url: string
    parameters: string
  }
}

export type ISourceTable = string

export interface ISourceColumn {
  name: string
  type: SqlTypes
}

export interface ISourceTableColumns {
  columns: ISourceColumn[]
  primaryKeys: string[]
  tableName: ISourceTable
}

export interface IMapTableColumns {
  [tableName: string]: ISourceTableColumns
}

export interface ICSVMetaInfo {
  sourceId: number
  tableName: string
  replaceMode: number
  primaryKeys: string
  indexKeys: string
}

export interface ISourceState {
  sources: ISource[]
  listLoading: boolean
  formLoading: boolean
  testLoading: boolean
}

