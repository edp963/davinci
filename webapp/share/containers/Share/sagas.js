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
  LOAD_SHARE_DASHBOARD,
  LOAD_SHARE_WIDGET,
  LOAD_SHARE_RESULTSET,
  LOAD_WIDGET_CSV
} from './constants'
import {
  dashboardGetted,
  widgetGetted,
  resultsetGetted,
  widgetCsvLoaded,
  loadWidgetCsvFail
} from './actions'

import message from 'antd/lib/message'
import request from '../../../app/utils/request'
import api from '../../../app/utils/api'
import { uuid } from '../../../app/utils/util'
import config, { env } from '../../../app/globalConfig'
const shareHost = config[env].shareHost

export function* getDashboard ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.share}/dashboard/${payload.token}`)
    const dashboard = asyncData.payload
    yield put(dashboardGetted(dashboard))
    payload.resolve(dashboard)
  } catch (err) {
    message.destroy()
    console.log('getDashboard', err)
    payload.reject(err)
  }
}

export function* getDashboardWatcher () {
  yield fork(takeLatest, LOAD_SHARE_DASHBOARD, getDashboard)
}

export function* getWidget ({ payload }) {
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

export function* getWidgetWatcher () {
  yield fork(takeEvery, LOAD_SHARE_WIDGET, getWidget)
}

export function* getResultset ({ payload }) {
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
    let queries = []

    if (offset !== undefined && limit !== undefined) {
      queries = queries
        .concat(`sortby=${sorts}`)
        .concat(`offset=${offset}`)
        .concat(`limit=${limit}`)
    }
    queries = queries.concat(`usecache=${useCache}`).concat(`expired=${useCache === 'false' ? 0 : expired}`)
    queries = `?${queries.join('&')}`

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/resultset/${token}${queries}`,
      data: sql
    })
    const resultset = resultsetConverter(asyncData.payload)
    yield put(resultsetGetted(itemId, resultset))
  } catch (err) {
    console.log('getResultset', err)
  }
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

    dataSource = arr.map(csvVal => {
      const jsonVal = csvParser.toArray(csvVal)
      let obj = {
        antDesignTableId: uuid(8, 32)
      }
      keys.forEach((k, index) => {
        obj[k] = jsonVal[index]
      })
      return obj
    })
  }

  return {
    dataSource: dataSource,
    keys: keys,
    types: types,
    pageSize: resultset.limit,
    pageIndex: parseInt(resultset.offset / resultset.limit) + 1,
    total: resultset.totalCount
  }
}

export function* getResultsetWatcher () {
  yield fork(takeEvery, LOAD_SHARE_RESULTSET, getResultset)
}

export function* getWidgetCsv ({ payload }) {
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

export function* getWidgetCsvWatcher () {
  yield fork(takeLatest, LOAD_WIDGET_CSV, getWidgetCsv)
}

export default [
  getDashboardWatcher,
  getWidgetWatcher,
  getResultsetWatcher,
  getWidgetCsvWatcher
]
