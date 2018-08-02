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

import { takeLatest, takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import {
  LOAD_BIZLOGICS,
  ADD_BIZLOGIC,
  DELETE_BIZLOGIC,
  EDIT_BIZLOGIC,
  LOAD_BIZDATAS,
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_DASHBOARD,
  LOAD_BIZDATA_SCHEMA,
  LOAD_SCHEMA,
  EXECUTE_SQL
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
  bizdatasLoaded,
  loadBizdatasFail,
  bizdatasFromItemLoaded,
  loadBizdatasFromItemFail,
  cascadeSourceFromItemLoaded,
  loadCascadeSourceFromItemFail,
  cascadeSourceFromDashboardLoaded,
  loadCascadeSourceFromDashboardFail,
  bizdataSchemaLoaded,
  loadBizdataSchemaFail,
  schemaLoaded,
  loadSchemaFail,
  sqlExecuted,
  executeSqlFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { readListAdapter } from '../../utils/asyncAdapter'
import resultsetConverter from '../../utils/resultsetConverter'

declare interface IObjectConstructor {
  assign (...objects: object[]): object
}

export function* getBizlogics ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.bizlogic}?projectId=${payload.projectId}`)
    const bizlogics = readListAdapter(asyncData)
    yield put(bizlogicsLoaded(bizlogics))
  } catch (err) {
    yield put(loadBizlogicsFail())
    message.error('加载 View 列表失败')
  }
}

export function* addBizlogic ({ payload }) {
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
    message.error('新增失败')
  }
}

export function* deleteBizlogic ({ payload }) {
  try {
    const result = yield call(request, {
      method: 'delete',
      url: `${api.bizlogic}/${payload.id}`
    })
    const { code } = result.header
    if (code === 200) {
      yield put(bizlogicDeleted(payload.id))
    } else if (code === 400) {
      message.error(result.header.msg, 3)
      yield put(deleteBizlogicFail())
    }
  } catch (err) {
    yield put(deleteBizlogicFail())
    message.error('删除失败')
  }
}

export function* editBizlogic ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: `${api.bizlogic}/${payload.bizlogic.id}`,
      data: payload.bizlogic
    })
    yield put(bizlogicEdited(payload.bizlogic))
    payload.resolve()
  } catch (err) {
    yield put(editBizlogicFail())
    message.error('修改失败')
  }
}

export function* getBizdatas ({ payload }) {
  try {
    const { id, sql, sorts, offset, limit } = payload

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/getdata`
    })
    const bizdatas =  resultsetConverter(readListAdapter(asyncData))
    yield put(bizdatasLoaded(bizdatas))
  } catch (err) {
    yield put(loadBizdatasFail(err))
  }
}

export function* getBizdatasFromItem ({ payload }) {
  try {
    const { itemId, id, sql, sorts, offset, limit, useCache, expired } = payload

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/getdata`,
      data: {}
    })
    const bizdatas = resultsetConverter(readListAdapter(asyncData))
    // const bizdatas = readListAdapter(asyncData)
    yield put(bizdatasFromItemLoaded(itemId, bizdatas))
  } catch (err) {
    yield put(loadBizdatasFromItemFail(err))
  }
}

export function* getCascadeSourceFromItem ({ payload }) {
  try {
    const { itemId, controlId, id, sql, column, parents } = payload
    const { adHoc, filters, linkageFilters, globalFilters, params, linkageParams, globalParams } = sql
    const data = (Object as IObjectConstructor).assign({
      adHoc,
      manualFilters: [filters, linkageFilters, globalFilters]
        .filter((f) => !!f)
        .join(' and '),
      params: [].concat(params).concat(linkageParams).concat(globalParams),
      childFieldName: column
    }, parents && { parents })

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/distinct_value`,
      data
    })
    const values = resultsetConverter(readListAdapter(asyncData)).dataSource
    yield put(cascadeSourceFromItemLoaded(itemId, controlId, column, values))
  } catch (err) {
    yield put(loadCascadeSourceFromItemFail(err))
  }
}

export function* getCascadeSourceFromDashboard ({ payload }) {
  try {
    const { controlId, id, column, parents } = payload

    const data = (Object as IObjectConstructor).assign({
      adHoc: '',
      manualFilters: '',
      params: [],
      childFieldName: column
    }, parents && { parents })

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/distinct_value`,
      data
    })
    const values = resultsetConverter(readListAdapter(asyncData)).dataSource
    yield put(cascadeSourceFromDashboardLoaded(controlId, column, values))
  } catch (err) {
    yield put(loadCascadeSourceFromDashboardFail(err))
  }
}

export function* getBizdataSchema ({ payload }) {
  try {
    const { id, resolve } = payload

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/resultset?limit=1`,
      data: {}
    })
    const bizdatas = resultsetConverter(readListAdapter(asyncData))
    yield put(bizdataSchemaLoaded(bizdatas.keys))
    resolve(bizdatas.keys)
  } catch (err) {
    yield put(loadBizdataSchemaFail(err))
  }
}

export function* getSchema ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.bizlogic}/database?sourceId=${payload.sourceId}`)
    const schema = readListAdapter(asyncData)
    yield put(schemaLoaded(schema))
    payload.resolve(schema)
  } catch (err) {
    yield put(loadSchemaFail())
    message.error('加载 Schema 列表失败')
  }
}

export function* executeSql ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/executesql`,
      data: {
        sql: payload.sql,
        sourceId: payload.sourceId
      }
    })
    const result = asyncData && asyncData.header
    yield put(sqlExecuted(result))
    payload.resolve(asyncData.payload)
  } catch (err) {
    yield put(executeSqlFail())
    message.error('执行 SQL 失败')
  }
}

export default function* rootBizlogicSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_BIZLOGICS, getBizlogics as any),
    takeEvery(ADD_BIZLOGIC, addBizlogic as any),
    takeEvery(DELETE_BIZLOGIC, deleteBizlogic as any),
    takeEvery(EDIT_BIZLOGIC, editBizlogic as any),
    takeEvery(LOAD_BIZDATAS, getBizdatas as any),
    takeEvery(LOAD_BIZDATAS_FROM_ITEM, getBizdatasFromItem as any),
    takeEvery(LOAD_CASCADESOURCE_FROM_ITEM, getCascadeSourceFromItem as any),
    takeEvery(LOAD_CASCADESOURCE_FROM_DASHBOARD, getCascadeSourceFromDashboard as any),
    takeEvery(LOAD_BIZDATA_SCHEMA, getBizdataSchema as any),
    takeLatest(LOAD_SCHEMA, getSchema as any),
    takeLatest(EXECUTE_SQL, executeSql as any)
  ]
}
