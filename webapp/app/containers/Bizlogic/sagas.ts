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
import { call, fork, put } from 'redux-saga/effects'
import csvParser from 'jquery-csv'
import {
  LOAD_BIZLOGICS,
  ADD_BIZLOGIC,
  DELETE_BIZLOGIC,
  LOAD_BIZLOGIC_DETAIL,
  LOAD_BIZLOGIC_GROUPS,
  EDIT_BIZLOGIC,
  LOAD_BIZDATAS,
  LOAD_BIZDATAS_FROM_ITEM,
  SQL_VALIDATE,
  LOAD_CASCADESOURCE_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_DASHBOARD,
  LOAD_BIZDATA_SCHEMA
} from './constants'
import {
  bizlogicsLoaded,
  bizlogicAdded,
  bizlogicDeleted,
  bizlogicDetailLoaded,
  bizlogicGroupsLoaded,
  bizlogicEdited,
  bizdatasLoaded,
  loadBizdatasFail,
  bizdatasFromItemLoaded,
  loadBizdatasFromItemFail,
  validateSqlSuccess,
  validateSqlFailure,
  cascadeSourceFromItemLoaded,
  loadCascadeSourceFromItemFail,
  cascadeSourceFromDashboardLoaded,
  loadCascadeSourceFromDashboardFail,
  bizdataSchemaLoaded,
  loadBizdataSchemaFail
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { uuid } from '../../utils/util'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'
import { KEY_COLUMN } from '../../globalConstants'

declare interface IObjectConstructor {
  assign (...objects: object[]): object
}

export const getBizlogics = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.bizlogic)
    const bizlogics = readListAdapter(asyncData)
    yield put(bizlogicsLoaded(bizlogics))
    return bizlogics
  },
  function (err) {
    console.log('getBizlogics', err)
  }
)

export function* getBizlogicsWatcher () {
  yield takeLatest(LOAD_BIZLOGICS, getBizlogics)
}

export const addBizlogic = promiseSagaCreator(
  function* ({ bizlogic }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.bizlogic,
      data: writeAdapter(bizlogic)
    })
    const result = readObjectAdapter(asyncData)
    yield put(bizlogicAdded(result))
    return result
  },
  function (err) {
    console.log('addBizlogic', err)
  }
)

export function* addBizlogicWatcher () {
  yield takeEvery(ADD_BIZLOGIC, addBizlogic)
}

export const deleteBizlogic = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.bizlogic}/${id}`
    })
    yield put(bizlogicDeleted(id))
  },
  function (err) {
    console.log('deleteBizlogic', err)
  }
)

export function* deleteBizlogicWatcher () {
  yield takeEvery(DELETE_BIZLOGIC, deleteBizlogic)
}

export const getBizlogicDetail = promiseSagaCreator(
  function* ({ id }) {
    const bizlogic = yield call(request, `${api.bizlogic}/${id}`)
    yield put(bizlogicDetailLoaded(bizlogic))
    return bizlogic
  },
  function (err) {
    console.log('getBizlogicDetail', err)
  }
)

export function* getBizlogicDetailWatcher () {
  yield takeLatest(LOAD_BIZLOGIC_DETAIL, getBizlogicDetail)
}

export const getBizlogicGroups = promiseSagaCreator(
  function* ({ id }) {
    const asyncData = yield call(request, `${api.bizlogic}/${id}/groups`)
    const groups = readListAdapter(asyncData)
    yield put(bizlogicGroupsLoaded(groups))
    return groups
  },
  function (err) {
    console.log('getBizlogicGroups', err)
  }
)

export function* getBizlogicGroupsWatcher () {
  yield takeLatest(LOAD_BIZLOGIC_GROUPS, getBizlogicGroups)
}

export const editBizlogic = promiseSagaCreator(
  function* ({ bizlogic }) {
    yield call(request, {
      method: 'put',
      url: api.bizlogic,
      data: writeAdapter(bizlogic)
    })
    yield put(bizlogicEdited(bizlogic))
  },
  function (err) {
    console.log('editBizlogic', err)
  }
)

export function* editBizlogicWatcher () {
  yield takeEvery(EDIT_BIZLOGIC, editBizlogic)
}

export function* getBizdatas ({ payload }) {
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

export function* getBizdatasWatcher () {
  yield takeEvery(LOAD_BIZDATAS, getBizdatas as any)
}

export function* getBizdatasFromItem ({ payload }) {
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

export function* getBizdatasFromItemWatcher () {
  yield takeEvery(LOAD_BIZDATAS_FROM_ITEM, getBizdatasFromItem as any)
}

export function* getSqlValidate ({payload}) {
  const {sourceId, sql} = payload
  try {
    const repos = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${sourceId}`,
      data: sql
    })
    const result = repos && repos.header
    yield put(validateSqlSuccess(result))
  } catch (err) {
    yield put(validateSqlFailure(err))
  }
}

export function* getSqlValidateWatcher () {
  yield takeEvery(SQL_VALIDATE, getSqlValidate as any)
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

export function* getCascadeSourceFromItemWatcher () {
  yield takeEvery(LOAD_CASCADESOURCE_FROM_ITEM, getCascadeSourceFromItem as any)
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

export function* getCascadeSourceFromDashboardWatcher () {
  yield takeEvery(LOAD_CASCADESOURCE_FROM_DASHBOARD, getCascadeSourceFromDashboard as any)
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

export function* getBizdataSchemaWatcher () {
  yield takeEvery(LOAD_BIZDATA_SCHEMA, getBizdataSchema as any)
}

function resultsetConverter (resultset) {
  let dataSource = []
  let keys = []
  let types = []

  if (resultset.result && resultset.result.length) {
    const arr = resultset.result

    arr.splice(0, 2).forEach((d, index) => {
      if (index) {
        types = csvParser.toArray(d)
      } else {
        keys = csvParser.toArray(d)
      }
    })

    dataSource = arr.map((csvVal) => {
      const jsonVal = csvParser.toArray(csvVal)
      const obj = {
        [KEY_COLUMN]: uuid(8, 32)
      }
      keys.forEach((k, index) => {
        obj[k] = jsonVal[index]
      })
      return obj
    })
  }

  return {
    ['dataSource']: dataSource,
    ['keys']: keys,
    ['types']: types,
    pageSize: resultset.limit,
    pageIndex: parseInt(`${resultset.offset / resultset.limit}`, 10) + 1,
    total: resultset.totalCount
  }
}

export default [
  getBizlogicsWatcher,
  addBizlogicWatcher,
  deleteBizlogicWatcher,
  getBizlogicDetailWatcher,
  getBizlogicGroupsWatcher,
  editBizlogicWatcher,
  getBizdatasWatcher,
  getBizdatasFromItemWatcher,
  getSqlValidateWatcher,
  getCascadeSourceFromItemWatcher,
  getCascadeSourceFromDashboardWatcher,
  getBizdataSchemaWatcher
]
