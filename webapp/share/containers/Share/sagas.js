/*-
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
  LOAD_SHARE_RESULTSET
} from './constants'
import {
  dashboardGetted,
  widgetGetted,
  resultsetGetted
} from './actions'

import request from '../../../app/utils/request'
import api from '../../../app/utils/api'
import { notifySagasError, uuid } from '../../../app/utils/util'
import { promiseSagaCreator } from '../../../app/utils/reduxPromisation'

export const getDashboard = promiseSagaCreator(
  function* ({ token }) {
    const asyncData = yield call(request, `${api.share}/dashboard/${token}`)
    const dashboard = asyncData.payload
    yield put(dashboardGetted(dashboard))
    return dashboard
  },
  function (err) {
    notifySagasError(err, 'getDashboard')
  }
)

export function* getDashboardWatcher () {
  yield fork(takeLatest, LOAD_SHARE_DASHBOARD, getDashboard)
}

export const getWidget = promiseSagaCreator(
  function* ({ token }) {
    const asyncData = yield call(request, `${api.share}/widget/${token}`)
    const widget = asyncData.payload
    yield put(widgetGetted(widget))
    return widget[0]
  },
  function (err) {
    notifySagasError(err, 'getWidget')
  }
)

export function* getWidgetWatcher () {
  yield fork(takeEvery, LOAD_SHARE_WIDGET, getWidget)
}

export const getResultset = promiseSagaCreator(
  function* ({ token, sql, sortby, offset, limit }) {
    let queries = ''
    if (offset !== undefined && limit !== undefined) {
      queries = `?sortby=${sortby}&offset=${offset}&limit=${limit}`
    }
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/resultset/${token}${queries}`,
      data: sql
    })
    const resultset = resultsetConverter(asyncData.payload)
    yield put(resultsetGetted(resultset))
    return resultset
  },
  function (err) {
    notifySagasError(err, 'getResultset')
  }
)

function resultsetConverter (resultset) {
  let dataSource = []
  let keys = []
  let types = []

  if (resultset.result && resultset.result.length) {
    const arr = resultset.result
    const keysWithType = csvParser.toArray(arr.splice(0, 1)[0])

    keysWithType.forEach(kwt => {
      const kwtArr = kwt.split(':')
      keys.push(kwtArr[0])
      types.push(kwtArr[1])
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

export default [
  getDashboardWatcher,
  getWidgetWatcher,
  getResultsetWatcher
]
