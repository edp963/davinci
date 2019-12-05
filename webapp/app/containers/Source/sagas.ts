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

import { call, put, all, takeLatest, takeEvery } from 'redux-saga/effects'
import { ActionTypes } from './constants'
import { SourceActions, SourceActionType } from './actions'
import omit from 'lodash/omit'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'
import { message } from 'antd'
import { ISourceBase, ISourceRaw, ISource, ISourceDatabases, IDatabaseTables, ITableColumns } from './types'

export function* getSources (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_SOURCES) { return }
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.source}?projectId=${payload.projectId}`)
    const sources = asyncData.payload as ISourceBase[]
    yield put(SourceActions.sourcesLoaded(sources))
  } catch (err) {
    yield put(SourceActions.loadSourcesFail())
    errorHandler(err)
  }
}

export function* addSource (action: SourceActionType) {
  if (action.type !== ActionTypes.ADD_SOURCE) { return }
  const { payload } = action
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.source,
      data: payload.source
    })
    payload.resolve()
    yield put(SourceActions.sourceAdded(asyncData.payload))
  } catch (err) {
    yield put(SourceActions.addSourceFail())
    errorHandler(err)
  }
}

export function* getSourceDetail (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_SOURCE_DETAIL) { return }
  const { sourceId, resolve } = action.payload
  try {
    const asyncData = yield call(request, `${api.source}/${sourceId}`)
    const sourceRaw = asyncData.payload as ISourceRaw
    const source: ISource = { ...sourceRaw, config: JSON.parse(sourceRaw.config) }
    yield put(SourceActions.sourceDetailLoaded(source))
    if (resolve) { resolve(source) }
  } catch (err) {
    yield put(SourceActions.loadSourceDetailFail())
    errorHandler(err)
  }
}

export function* deleteSource (action: SourceActionType) {
  if (action.type !== ActionTypes.DELETE_SOURCE) { return }
  const { payload } = action
  try {
    const result = yield call(request, {
      method: 'delete',
      url: `${api.source}/${payload.id}`
    })
    const { code } = result.header
    yield put(SourceActions.sourceDeleted(payload.id))
  } catch (err) {
    yield put(SourceActions.deleteSourceFail())
    errorHandler(err)
  }
}

export function* editSource (action: SourceActionType) {
  if (action.type !== ActionTypes.EDIT_SOURCE) { return }
  const { source, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.source}/${source.id}`,
      data: source
    })
    const sourceBase = omit(source, 'config')
    yield put(SourceActions.sourceEdited(sourceBase))
    resolve()
  } catch (err) {
    yield put(SourceActions.editSourceFail())
    errorHandler(err)
  }
}

export function* testSourceConnection (action: SourceActionType) {
  if (action.type !== ActionTypes.TEST_SOURCE_CONNECTION) { return }
  const { payload } = action
  try {
    const res = yield call(request, {
      method: 'post',
      url: `${api.source}/test`,
      data: payload.testSource
    })
    yield put(SourceActions.sourceConnected())
    message.success('测试成功')
  } catch (err) {
    yield put(SourceActions.testSourceConnectionFail())
    errorHandler(err)
  }
}

export function* resetSourceConnection (action: SourceActionType) {
  if (action.type !== ActionTypes.RESET_SOURCE_CONNECTION) { return }
  const { properties, resolve } = action.payload
  const { sourceId, username, password } = properties
  try {
    yield call(request, {
      method: 'post',
      url: `${api.source}/reconnect/${sourceId}`,
      data: {
        dbUser: username,
        dbPassword: password
      }
    })
    yield put(SourceActions.sourceReset())
    message.success('连接重置成功')
    resolve()
  } catch (err) {
    yield put(SourceActions.resetSourceConnectionFail())
    errorHandler(err)
  }
}

export function* getCsvMetaId (action: SourceActionType) {
  if (action.type !== ActionTypes.GET_CSV_META_ID) { return }
  const { resolve } = action.payload
  const { sourceId, replaceMode, tableName } = action.payload.csvMeta
  try {
    yield call(request, {
      url: `${api.source}/${sourceId}/csvmeta`,
      method: 'post',
      data: {
        mode: replaceMode,
        tableName
      }
    })
    yield put(SourceActions.csvMetaIdGeted())
    resolve()
  } catch (err) {
    yield put(SourceActions.getCsvMetaIdFail(err))
    errorHandler(err)
  }
}

export function* getSourceDatabases (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_SOURCE_DATABASES) { return }
  const { sourceId } = action.payload
  try {
    const asyncData = yield call(request, `${api.source}/${sourceId}/databases`)
    const sourceDatabases: ISourceDatabases = asyncData.payload
    yield put(SourceActions.sourceDatabasesLoaded(sourceDatabases))
  } catch (err) {
    yield put(SourceActions.loadSourceDatabasesFail(err))
    errorHandler(err)
  }
}

export function* getDatabaseTables (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_SOURCE_DATABASE_TABLES) { return }
  const { databaseName, sourceId } = action.payload
  try {
    const asyncData = yield call(request, `${api.source}/${sourceId}/tables?dbName=${databaseName}`)
    const databaseTables: IDatabaseTables = asyncData.payload
    yield put(SourceActions.databaseTablesLoaded(databaseTables))
  } catch (err) {
    yield put(SourceActions.loadDatabaseTablesFail(err))
    errorHandler(err)
  }
}

export function* getTableColumns (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_SOURCE_TABLE_COLUMNS) { return }
  const { sourceId, databaseName, tableName, resolve } = action.payload
  try {
    const asyncData = yield call(request, `${api.source}/${sourceId}/table/columns?dbName=${databaseName}&tableName=${tableName}`)
    const tableColumns: ITableColumns = { ...asyncData.payload, dbName: databaseName }
    yield put(SourceActions.tableColumnsLoaded(databaseName, tableColumns))
    if (resolve) {
      resolve(tableColumns)
    }
  } catch (err) {
    yield put(SourceActions.loadTableColumnsFail(err))
    errorHandler(err)
  }
}

export function* getDatasourcesInfo (action: SourceActionType) {
  if (action.type !== ActionTypes.LOAD_DATASOURCES_INFO) { return }
  try {
    const asyncData = yield call(request, `${api.source}/jdbc/datasources`)
    yield put(SourceActions.datasourcesInfoLoaded(asyncData.payload))
  } catch (err) {
    yield put(SourceActions.loadDatasourcesInfoFail(err))
    errorHandler(err)
  }
}

export default function* rootSourceSaga (): IterableIterator<any> {
  yield all([
    takeLatest(ActionTypes.LOAD_SOURCES, getSources),
    takeEvery(ActionTypes.LOAD_SOURCE_DETAIL, getSourceDetail),
    takeEvery(ActionTypes.ADD_SOURCE, addSource),
    takeEvery(ActionTypes.DELETE_SOURCE, deleteSource),
    takeEvery(ActionTypes.EDIT_SOURCE, editSource),
    takeEvery(ActionTypes.TEST_SOURCE_CONNECTION, testSourceConnection),
    takeEvery(ActionTypes.RESET_SOURCE_CONNECTION, resetSourceConnection),
    takeEvery(ActionTypes.GET_CSV_META_ID, getCsvMetaId),
    takeEvery(ActionTypes.LOAD_SOURCE_DATABASES, getSourceDatabases),
    takeEvery(ActionTypes.LOAD_SOURCE_DATABASE_TABLES, getDatabaseTables),
    takeEvery(ActionTypes.LOAD_SOURCE_TABLE_COLUMNS, getTableColumns),
    takeLatest(ActionTypes.LOAD_DATASOURCES_INFO, getDatasourcesInfo)
  ])
}
