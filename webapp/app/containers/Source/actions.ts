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

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'
import { ISourceRaw, ISource, ISourceTableColumns, ISourceTable, ICSVMetaInfo } from './types'

export const SourceActions = {
  loadSources (projectId: number) {
    return {
      type: ActionTypes.LOAD_SOURCES,
      payload: {
        projectId
      }
    }
  },
  sourcesLoaded (sources: ISourceRaw[]) {
    return {
      type: ActionTypes.LOAD_SOURCES_SUCCESS,
      payload: {
        sources
      }
    }
  },
  loadSourcesFail () {
    return {
      type: ActionTypes.LOAD_SOURCES_FAILURE,
      payload: {}
    }
  },
  addSource (source: ISource, resolve: () => void) {
    return {
      type: ActionTypes.ADD_SOURCE,
      payload: {
        source,
        resolve
      }
    }
  },
  sourceAdded (result: ISourceRaw) {
    return {
      type: ActionTypes.ADD_SOURCE_SUCCESS,
      payload: {
        result
      }
    }
  },
  addSourceFail () {
    return {
      type: ActionTypes.ADD_SOURCE_FAILURE,
      payload: {}
    }
  },
  deleteSource (id: number) {
    return {
      type: ActionTypes.DELETE_SOURCE,
      payload: {
        id
      }
    }
  },
  sourceDeleted (id: number) {
    return {
      type: ActionTypes.DELETE_SOURCE_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteSourceFail () {
    return {
      type: ActionTypes.DELETE_SOURCE_FAILURE,
      payload: {}
    }
  },
  editSource (source: ISource, resolve: () => void) {
    return {
      type: ActionTypes.EDIT_SOURCE,
      payload: {
        source,
        resolve
      }
    }
  },
  sourceEdited (result: ISource) {
    return {
      type: ActionTypes.EDIT_SOURCE_SUCCESS,
      payload: {
        result
      }
    }
  },
  editSourceFail () {
    return {
      type: ActionTypes.EDIT_SOURCE_FAILURE,
      payload: {}
    }
  },
  testSourceConnection (url: string) {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION,
      payload: {
        url
      }
    }
  },
  sourceConnected () {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION_SUCCESS,
      payload: {}
    }
  },
  testSourceConnectionFail () {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION_FAILURE,
      payload: {}
    }
  },
  getCsvMetaId (csvMeta: ICSVMetaInfo, resolve: () => void) {
    return {
      type: ActionTypes.GET_CSV_META_ID,
      payload: {
        csvMeta,
        resolve
      }
    }
  },
  csvMetaIdGeted () {
    return {
      type: ActionTypes.GET_CSV_META_ID_SUCCESS,
      payload: {}
    }
  },
  getCsvMetaIdFail (error) {
    return {
      type: ActionTypes.GET_CSV_META_ID_FAILURE,
      payload: {
        error
      }
    }
  },
  loadSourceTables (sourceId: number) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLES,
      payload: {
        sourceId
      }
    }
  },
  sourceTablesLoaded (tables: ISourceTable[]) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLES_SUCCESS,
      payload: {
        tables
      }
    }
  },
  loadSourceTablesFail (err) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLES_FAILURE,
      payload: {
        err
      }
    }
  },
  loadTableColumns (sourceId: number, tableName: string, resolve?) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS,
      payload: {
        sourceId,
        tableName,
        resolve
      }
    }
  },
  tableColumnsLoaded (sourceId: number, tableColumns: ISourceTableColumns) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS_SUCCESS,
      payload: {
        sourceId,
        tableColumns
      }
    }
  },
  loadTableColumnsFail (err) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS_FAILURE,
      payload: {
        err
      }
    }
  }
}

const mockAction = returnType(SourceActions)
export type SourceActionType = typeof mockAction

export default SourceActions

