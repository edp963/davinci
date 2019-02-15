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
import {
  LOAD_BIZLOGICS,
  ADD_BIZLOGIC,
  DELETE_BIZLOGIC,
  EDIT_BIZLOGIC,
  LOAD_CASCADESOURCE,
  LOAD_BIZDATA_SCHEMA,
  LOAD_SCHEMA,
  EXECUTE_SQL,
  LOAD_DATA,
  LOAD_DISTINCT_VALUE,
  LOAD_DATA_FROM_ITEM,
  LOAD_VIEW_TEAM,
  LOAD_SOURCE_TABLE,
  LOAD_SOURCE_TABLE_COLUMN
} from './constants'
import {
  bizlogicsLoaded,
  loadBizlogicsFail,
  bizlogicAdded,
  addBizlogicFail,
  bizlogicDeleted,
  deleteBizlogicFail,
  bizlogicEdited,
  editBizlogicFail,
  cascadeSourceLoaded,
  loadCascadeSourceFail,
  bizdataSchemaLoaded,
  loadBizdataSchemaFail,
  schemaLoaded,
  loadSchemaFail,
  sqlExecuted,
  executeSqlFail,
  dataLoaded,
  loadDataFail,
  distinctValueLoaded,
  loadDistinctValueFail,
  dataFromItemLoaded,
  loadDataFromItemFail,
  viewTeamLoaded,
  loadViewTeamFail,
  sourceTableLoaded,
  sourceTableColumnLoaded,
  loadSourceTableFail,
  loadSourceTableColumnFail
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import resultsetConverter from '../../utils/resultsetConverter'
import { errorHandler } from '../../utils/util'

declare interface IObjectConstructor {
  assign (...objects: object[]): object
}

export function* getBizlogics (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.bizlogic}?projectId=${payload.projectId}`)
    const bizlogics = asyncData.payload
    yield put(bizlogicsLoaded(bizlogics))
    if (payload.resolve) {
      payload.resolve(bizlogics)
    }
  } catch (err) {
    yield put(loadBizlogicsFail())
    errorHandler(err)
  }
}

export function* addBizlogic (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.bizlogic,
      data: payload.bizlogic
    })
    yield put(bizlogicAdded(asyncData.payload))
    payload.resolve()
  } catch (err) {
    yield put(addBizlogicFail())
    errorHandler(err)
  }
}

export function* deleteBizlogic (action) {
  const { payload } = action
  try {
    const result = yield call(request, {
      method: 'delete',
      url: `${api.bizlogic}/${payload.id}`
    })
    yield put(bizlogicDeleted(payload.id))
  } catch (err) {
    yield put(deleteBizlogicFail())
    errorHandler(err)
  }
}

export function* editBizlogic (action) {
  const { payload } = action
  const { config, description, id, model, name, source, sql } = payload.bizlogic
  try {
    yield call(request, {
      method: 'put',
      url: `${api.bizlogic}/${id}`,
      data: {
        config,
        description,
        id,
        model,
        name,
        sourceId: source.id,
        sql
      }
    })
    yield put(bizlogicEdited(payload.bizlogic))
    payload.resolve()
  } catch (err) {
    yield put(editBizlogicFail())
    errorHandler(err)
  }
}

export function* getCascadeSource (action) {
  const { payload } = action
  try {
    const { controlId, viewId, columns, parents } = payload

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${viewId}/getdistinctvalue`,
      data: {
        columns,
        parents: parents || []
      }
    })
    yield put(cascadeSourceLoaded(controlId, columns, asyncData.payload))
  } catch (err) {
    yield put(loadCascadeSourceFail(err))
    errorHandler(err)
  }
}

export function* getBizdataSchema (action) {
  const { payload } = action
  try {
    const { id, resolve } = payload

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/resultset?limit=1`,
      data: {}
    })
    const bizdatas = resultsetConverter(asyncData.payload)
    yield put(bizdataSchemaLoaded(bizdatas.keys))
    resolve(bizdatas.keys)
  } catch (err) {
    yield put(loadBizdataSchemaFail(err))
  }
}

export function* getSchema (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.bizlogic}/database?sourceId=${payload.sourceId}`)
    const schema = asyncData.payload
    yield put(schemaLoaded(schema))
    payload.resolve(schema)
  } catch (err) {
    yield put(loadSchemaFail())
    errorHandler(err)
  }
}

export function* loadSourceTable (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.source}/${payload.sourceId}/tables`)
    const table = asyncData.payload
    yield put(sourceTableLoaded(table))
    payload.resolve(table)
  } catch (err) {
    yield put(loadSourceTableFail(err))
    errorHandler(err)
  }
}

export function* loadSourceTableColumn (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.source}/${payload.sourceId}/table/columns?tableName=${payload.tableName}`)
    const column = asyncData.payload
    yield put(sourceTableColumnLoaded(column))
    payload.resolve(column)
  } catch (err) {
    yield put(loadSourceTableColumnFail(err))
    errorHandler(err)
  }
}

export function* executeSql (action) {
  const { payload } = action
  const { sourceIdGeted, sql, pageNo, pageSize, limit} = payload.requestObj
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/executesql`,
      data: {
        sourceId: sourceIdGeted,
        sql,
        pageNo,
        pageSize,
        limit
      }
    })
    const result = asyncData && asyncData.header
    yield put(sqlExecuted(result))
    if (payload.resolve) {
      payload.resolve(asyncData.payload)
    }
  } catch (err) {
    yield put(executeSqlFail(err))
  }
}

export function* getData (action) {
  const { payload } = action
  try {
    const { id, requestParams, resolve } = payload

    const response = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/getdata`,
      data: requestParams
    })
    yield put(dataLoaded())
    const { resultList } = response.payload
    response.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    resolve(response.payload)
  } catch (err) {
    yield put(loadDataFail(err))
    errorHandler(err)
  }
}

export function* getDistinctValue (action) {
  const { payload } = action
  try {
    const { viewId, fieldName, filters, resolve } = payload
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${viewId}/getdistinctvalue`,
      data: {
        columns: [fieldName],
        parents: filters
          ? Object.entries(filters).map(([column, value]) => ({ column, value }))
          : []
      }
    })
    const result = asyncData.payload.map((item) => item[fieldName])
    yield put(distinctValueLoaded(result, fieldName))
    if (resolve) {
      resolve(asyncData.payload)
    }
  } catch (err) {
    yield put(loadDistinctValueFail(err))
    errorHandler(err)
  }
}

export function* getDataFromItem (action) {
  const { renderType, itemId, viewId, requestParams, vizType } = action.payload
  const {
    filters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    pagination,
    ...rest
  } = requestParams
  const { pageSize, pageNo } = pagination || { pageSize: 0, pageNo: 0 }

  try {
    const response = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${viewId}/getdata`,
      data: {
        ...rest,
        filters: filters.concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      }
    })
    const { resultList } = response.payload
    response.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    yield put(dataFromItemLoaded(renderType, itemId, requestParams, response.payload, vizType))
  } catch (err) {
    yield put(loadDataFromItemFail(itemId, vizType))
    errorHandler(err)
  }
}

export function* getViewTeams (action) {
  const { projectId, resolve } = action.payload
  try {
    const project = yield call(request, `${api.projects}/${projectId}`)
    const currentProject = project.payload
    const organization = yield call(request, `${api.organizations}/${currentProject.orgId}/teams`)
    const orgTeam = organization.payload
    yield put(viewTeamLoaded(orgTeam))
    if (resolve) {
      resolve(orgTeam)
    }
  } catch (err) {
    yield put(loadViewTeamFail(err))
    errorHandler(err)
  }
}

export default function* rootBizlogicSaga (): IterableIterator<any> {
  yield all([
    takeLatest(LOAD_BIZLOGICS, getBizlogics),
    takeEvery(ADD_BIZLOGIC, addBizlogic),
    takeEvery(DELETE_BIZLOGIC, deleteBizlogic),
    takeEvery(EDIT_BIZLOGIC, editBizlogic),
    takeEvery(LOAD_CASCADESOURCE, getCascadeSource),
    takeEvery(LOAD_BIZDATA_SCHEMA, getBizdataSchema),
    takeLatest(LOAD_SCHEMA, getSchema),
    takeEvery(LOAD_SOURCE_TABLE, loadSourceTable),
    takeEvery(LOAD_SOURCE_TABLE_COLUMN, loadSourceTableColumn),
    takeLatest(EXECUTE_SQL, executeSql),
    takeEvery(LOAD_DATA, getData),
    takeEvery(LOAD_DISTINCT_VALUE, getDistinctValue),
    takeEvery(LOAD_DATA_FROM_ITEM, getDataFromItem),
    takeLatest(LOAD_VIEW_TEAM, getViewTeams)
  ])
}
