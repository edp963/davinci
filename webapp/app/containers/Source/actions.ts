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
import {
  ISourceBase,
  ISource,
  SourceResetConnectionProperties,
  ITableColumns,
  ISourceDatabases,
  ICSVMetaInfo,
  IDatabaseTables,
  IDatasourceInfo
} from './types'

export const SourceActions = {
  loadSources(projectId: number) {
    return {
      type: ActionTypes.LOAD_SOURCES,
      payload: {
        projectId
      }
    }
  },
  sourcesLoaded(sources: ISourceBase[]) {
    return {
      type: ActionTypes.LOAD_SOURCES_SUCCESS,
      payload: {
        sources
      }
    }
  },
  loadSourcesFail() {
    return {
      type: ActionTypes.LOAD_SOURCES_FAILURE
    }
  },

  loadSourceDetail(sourceId: number, resolve?: (source: ISource) => void) {
    return {
      type: ActionTypes.LOAD_SOURCE_DETAIL,
      payload: {
        sourceId,
        resolve
      }
    }
  },
  sourceDetailLoaded(source: ISource) {
    return {
      type: ActionTypes.LOAD_SOURCE_DETAIL_SUCCESS,
      payload: {
        source
      }
    }
  },
  loadSourceDetailFail() {
    return {
      type: ActionTypes.LOAD_SOURCE_DETAIL_FAIL,
      payload: {}
    }
  },

  addSource(source: ISource, resolve: () => void) {
    return {
      type: ActionTypes.ADD_SOURCE,
      payload: {
        source,
        resolve
      }
    }
  },
  sourceAdded(result: ISourceBase) {
    return {
      type: ActionTypes.ADD_SOURCE_SUCCESS,
      payload: {
        result
      }
    }
  },
  addSourceFail() {
    return {
      type: ActionTypes.ADD_SOURCE_FAILURE,
      payload: {}
    }
  },
  deleteSource(id: number) {
    return {
      type: ActionTypes.DELETE_SOURCE,
      payload: {
        id
      }
    }
  },
  sourceDeleted(id: number) {
    return {
      type: ActionTypes.DELETE_SOURCE_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteSourceFail() {
    return {
      type: ActionTypes.DELETE_SOURCE_FAILURE,
      payload: {}
    }
  },
  editSource(source: ISource, resolve: () => void) {
    return {
      type: ActionTypes.EDIT_SOURCE,
      payload: {
        source,
        resolve
      }
    }
  },
  sourceEdited(result: ISourceBase) {
    return {
      type: ActionTypes.EDIT_SOURCE_SUCCESS,
      payload: {
        result
      }
    }
  },
  editSourceFail() {
    return {
      type: ActionTypes.EDIT_SOURCE_FAILURE,
      payload: {}
    }
  },
  testSourceConnection(testSource) {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION,
      payload: {
        testSource
      }
    }
  },
  sourceConnected() {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION_SUCCESS,
      payload: {}
    }
  },
  testSourceConnectionFail() {
    return {
      type: ActionTypes.TEST_SOURCE_CONNECTION_FAILURE,
      payload: {}
    }
  },

  resetSourceConnection(
    properties: SourceResetConnectionProperties,
    resolve: () => void
  ) {
    return {
      type: ActionTypes.RESET_SOURCE_CONNECTION,
      payload: {
        properties,
        resolve
      }
    }
  },
  sourceReset() {
    return {
      type: ActionTypes.RESET_SOURCE_CONNECTION_SUCCESS,
      payload: {}
    }
  },
  resetSourceConnectionFail() {
    return {
      type: ActionTypes.RESET_SOURCE_CONNECTION_FAILURE,
      payload: {}
    }
  },

  validateCsvTableName(
    csvMeta: Pick<ICSVMetaInfo, 'sourceId' | 'tableName' | 'mode'>,
    callback: (errMsg?: string) => void
  ) {
    return {
      type: ActionTypes.VALIDATE_CSV_TABLE_NAME,
      payload: {
        csvMeta,
        callback
      }
    }
  },

  uploadCsvFile(csvMeta: ICSVMetaInfo, resolve: () => void, reject: () => void) {
    return {
      type: ActionTypes.UPLOAD_CSV_FILE,
      payload: {
        csvMeta,
        resolve,
        reject
      }
    }
  },

  loadSourceDatabases(sourceId: number) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASES,
      payload: {
        sourceId
      }
    }
  },
  sourceDatabasesLoaded(sourceDatabases: ISourceDatabases) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASES_SUCCESS,
      payload: {
        sourceDatabases
      }
    }
  },
  loadSourceDatabasesFail(err) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASES_FAILURE,
      payload: {
        err
      }
    }
  },

  loadDatabaseTables(sourceId: number, databaseName: string, resolve?) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASE_TABLES,
      payload: {
        sourceId,
        databaseName,
        resolve
      }
    }
  },
  databaseTablesLoaded(databaseTables: IDatabaseTables) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASE_TABLES_SUCCESS,
      payload: {
        databaseTables
      }
    }
  },
  loadDatabaseTablesFail(err) {
    return {
      type: ActionTypes.LOAD_SOURCE_DATABASE_TABLES_FAILURE,
      payload: {
        err
      }
    }
  },
  loadTableColumns(
    sourceId: number,
    databaseName: string,
    tableName: string,
    resolve?
  ) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS,
      payload: {
        sourceId,
        databaseName,
        tableName,
        resolve
      }
    }
  },
  tableColumnsLoaded(databaseName: string, tableColumns: ITableColumns) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS_SUCCESS,
      payload: {
        databaseName,
        tableColumns
      }
    }
  },
  loadTableColumnsFail(err) {
    return {
      type: ActionTypes.LOAD_SOURCE_TABLE_COLUMNS_FAILURE,
      payload: {
        err
      }
    }
  },
  loadDatasourcesInfo() {
    return {
      type: ActionTypes.LOAD_DATASOURCES_INFO
    }
  },
  datasourcesInfoLoaded(info: IDatasourceInfo[]) {
    return {
      type: ActionTypes.LOAD_DATASOURCES_INFO_SUCCESS,
      payload: {
        info
      }
    }
  },
  loadDatasourcesInfoFail(err) {
    return {
      type: ActionTypes.LOAD_DATASOURCES_INFO_FAILURE,
      payload: {
        err
      }
    }
  }
}

const mockAction = returnType(SourceActions)
export type SourceActionType = typeof mockAction

export default SourceActions
