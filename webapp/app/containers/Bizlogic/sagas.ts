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

export function* getBizlogics (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.bizlogic}?projectId=${payload.projectId}`)
    const bizlogics = readListAdapter(asyncData)
    yield put(bizlogicsLoaded(bizlogics))
  } catch (err) {
    yield put(loadBizlogicsFail())
    message.error('加载 View 列表失败')
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
    message.error('新增失败')
  }
}

export function* deleteBizlogic (action) {
  const { payload } = action
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
    message.error('修改失败')
  }
}

export function* getBizdatas (action) {
  const { payload } = action
  try {
    const { id, sql, sorts, offset, limit } = payload

    let queries = []

    if (offset !== undefined && limit !== undefined) {
      queries = queries
        .concat(`sortby=${sorts}`)
        .concat(`offset=${offset}`)
        .concat(`limit=${limit}`)
    }
    queries = queries.concat('usecache=false').concat('expired=0')
    queries = `?${queries.join('&')}` as any

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/resultset${queries}`,
      data: sql || {}
    })
    const bizdatas = resultsetConverter(readListAdapter(asyncData))
    yield put(bizdatasLoaded(bizdatas))
  } catch (err) {
    yield put(loadBizdatasFail(err))
  }
}

export function* getBizdatasFromItem (action) {
  const { payload } = action
  try {
    const { itemId, id, sql, sorts, offset, limit, useCache, expired } = payload

    let queries = []

    if (offset !== undefined && limit !== undefined) {
      queries = queries
        .concat(`sortby=${sorts}`)
        .concat(`offset=${offset}`)
        .concat(`limit=${limit}`)
    }
    queries = queries.concat(`usecache=${useCache}`).concat(`expired=${useCache === 'false' ? 0 : expired}`)
    queries = `?${queries.join('&')}` as any

    const { adHoc, filters, linkageFilters, globalFilters, params, linkageParams, globalParams } = sql
    const data = {
      adHoc,
      manualFilters: [filters, linkageFilters, globalFilters]
        .filter((f) => !!f)
        .join(' and '),
      params: [].concat(params).concat(linkageParams).concat(globalParams)
    }

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/resultset${queries}`,
      data
    })
    const bizdatas = resultsetConverter(readListAdapter(asyncData))
    yield put(bizdatasFromItemLoaded(itemId, bizdatas))
  } catch (err) {
    yield put(loadBizdatasFromItemFail(err))
  }
}

export function* getCascadeSourceFromItem (action) {
  const  { payload } = action
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

export function* getCascadeSourceFromDashboard (action) {
  const { payload } = action
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

export function* getBizdataSchema (action) {
  const { payload } = action
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

export function* getSchema (action) {
  const { payload } = action
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

export function* executeSql (action) {
  const { payload } = action
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
    takeLatest(LOAD_BIZLOGICS, getBizlogics),
    takeEvery(ADD_BIZLOGIC, addBizlogic),
    takeEvery(DELETE_BIZLOGIC, deleteBizlogic),
    takeEvery(EDIT_BIZLOGIC, editBizlogic),
    takeEvery(LOAD_BIZDATAS, getBizdatas),
    takeEvery(LOAD_BIZDATAS_FROM_ITEM, getBizdatasFromItem),
    takeEvery(LOAD_CASCADESOURCE_FROM_ITEM, getCascadeSourceFromItem),
    takeEvery(LOAD_CASCADESOURCE_FROM_DASHBOARD, getCascadeSourceFromDashboard),
    takeEvery(LOAD_BIZDATA_SCHEMA, getBizdataSchema),
    takeLatest(LOAD_SCHEMA, getSchema),
    takeLatest(EXECUTE_SQL, executeSql)
  ]
}
