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
import {
  LOAD_SHARE_DASHBOARD,
  LOAD_SHARE_WIDGET,
  LOAD_SHARE_RESULTSET,
  LOAD_WIDGET_CSV,
  LOAD_CASCADESOURCE_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_DASHBOARD
} from './constants'
import {
  dashboardGetted,
  loadDashboardFail,
  widgetGetted,
  resultsetGetted,
  widgetCsvLoaded,
  loadWidgetCsvFail,
  cascadeSourceFromItemLoaded,
  loadCascadeSourceFromItemFail,
  cascadeSourceFromDashboardLoaded,
  loadCascadeSourceFromDashboardFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../../app/utils/request'
import api from '../../../app/utils/api'
import config, { env } from '../../../app/globalConfig'
import { readListAdapter } from '../../../app/utils/asyncAdapter'
const shareHost = config[env].shareHost
import resultsetConverter from '../../../app/utils/resultsetConverter'

export function* getDashboard (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.share}/dashboard/${payload.token}`)
    const dashboard = asyncData.payload
    yield put(dashboardGetted(dashboard))
    payload.resolve(dashboard)
  } catch (err) {
    message.destroy()
    console.log('getDashboard', err)
    yield put(loadDashboardFail())
    payload.reject(err)
  }
}

export function* getWidget (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.share}/widget/${payload.token}`)
    const widget = asyncData.payload
    yield put(widgetGetted(widget))

    if (payload.resolve) {
      payload.resolve(widget[0])
    }
  } catch (err) {
    message.destroy()
    console.log('getWidget', err)
    payload.reject(err)
  }
}

export function* getResultset (action) {
  const { payload } = action
  const {
    itemId,
    token,
    sql,
    sorts,
    offset,
    limit,
    useCache,
    expired
  } = payload

  try {
    let queries: any[] | string = []

    if (offset !== undefined && limit !== undefined) {
      queries = queries
        .concat(`sortby=${sorts}`)
        .concat(`offset=${offset}`)
        .concat(`limit=${limit}`)
    }
    queries = queries.concat(`usecache=${useCache}`).concat(`expired=${useCache === 'false' ? 0 : expired}`)
    queries = `?${queries.join('&')}`

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
      url: `${api.share}/resultset/${token}${queries}`,
      data
    })
    const resultset = resultsetConverter(asyncData.payload)
    yield put(resultsetGetted(itemId, resultset))
  } catch (err) {
    console.log('getResultset', err)
  }
}

export function* getWidgetCsv (action) {
  const { payload } = action
  const { token, sql, sorts, offset, limit } = payload
  let queries = ''

  if (offset !== undefined && limit !== undefined) {
    queries = `?sortby=${sorts}&offset=${offset}&limit=${limit}`
  }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/csv/${token}${queries}`,
      data: sql || {}
    })
    yield put(widgetCsvLoaded(payload.itemId))
    const path = asyncData.payload
    location.href = `${shareHost.substring(0, shareHost.lastIndexOf('/'))}/${path}`
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(payload.itemId))
    message.error('获取csv文件失败，请稍后再试')
  }
}

export function* getCascadeSourceFromItem (action) {
  const { payload } = action
  try {
    const { itemId, controlId, token, sql, column, parents } = payload
    const { adHoc, filters, linkageFilters, globalFilters, params, linkageParams, globalParams } = sql
    const data = {
      adHoc,
      manualFilters: [filters, linkageFilters, globalFilters]
        .filter((f) => !!f)
        .join(' and '),
      params: [].concat(params).concat(linkageParams).concat(globalParams),
      childFieldName: column,
      parents
    }

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/resultset/${token}/distinct_value`,
      data
    })
    const values = resultsetConverter(readListAdapter(asyncData)).dataSource
    yield put(cascadeSourceFromItemLoaded(itemId, controlId, column, values))
  } catch (err) {
    yield put(loadCascadeSourceFromItemFail(err))
  }
}

export function* getCascadeSourceFromDashboard (action) {
  try {
    const { payload } = action
    const { flatTableId, controlId, token, column, parents } = payload

    const data = {
      adHoc: '',
      manualFilters: '',
      params: [],
      childFieldName: column,
      parents
    }

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/resultset/${token}/distinct_value/${flatTableId}`,
      data
    })
    const values = resultsetConverter(readListAdapter(asyncData)).dataSource
    yield put(cascadeSourceFromDashboardLoaded(controlId, column, values))
  } catch (err) {
    yield put(loadCascadeSourceFromDashboardFail(err))
  }
}

export default function* rootDashboardSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_SHARE_DASHBOARD, getDashboard),
    takeEvery(LOAD_SHARE_WIDGET, getWidget),
    takeEvery(LOAD_SHARE_RESULTSET, getResultset),
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv),
    takeEvery(LOAD_CASCADESOURCE_FROM_ITEM, getCascadeSourceFromItem),
    takeEvery(LOAD_CASCADESOURCE_FROM_DASHBOARD, getCascadeSourceFromDashboard)
  ]
}
