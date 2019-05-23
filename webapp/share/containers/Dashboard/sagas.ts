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
import { call, put, all } from 'redux-saga/effects'
import {
  LOAD_SHARE_DASHBOARD,
  LOAD_SHARE_WIDGET,
  LOAD_SHARE_RESULTSET,
  LOAD_WIDGET_CSV,
  LOAD_SELECT_OPTIONS
} from './constants'
import {
  dashboardGetted,
  loadDashboardFail,
  widgetGetted,
  resultsetGetted,
  widgetCsvLoaded,
  loadWidgetCsvFail,
  selectOptionsLoaded,
  loadSelectOptionsFail
} from './actions'

import request from '../../../app/utils/request'
import { errorHandler } from '../../../app/utils/util'
import api from '../../../app/utils/api'
import config, { env } from '../../../app/globalConfig'
import { IDistinctValueReqeustParams } from '../../../app/components/Filters'
const shareHost = config[env].shareHost

export function* getDashboard (action) {
  const { payload } = action
  try {
    const dashboard = yield call(request, `${api.share}/dashboard/${payload.token}`)
    yield put(dashboardGetted(dashboard.payload))
  } catch (err) {
    yield put(loadDashboardFail())
    payload.reject(err)
  }
}

export function* getWidget (action) {
  const { payload } = action
  try {
    const widget = yield call(request, `${api.share}/widget/${payload.token}`)
    yield put(widgetGetted(widget.payload))

    if (payload.resolve) {
      payload.resolve(widget.payload)
    }
  } catch (err) {
    errorHandler(err)
    payload.reject(err)
  }
}

export function* getResultset (action) {
  const { payload } = action
  const { renderType, itemId, dataToken, requestParams } = payload
  const {
    filters,
    tempFilters,
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
    const resultset = yield call(request, {
      method: 'post',
      url: `${api.share}/data/${dataToken}`,
      data: {
        ...rest,
        filters: filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      }
    })
    const { resultList } = resultset.payload
    resultset.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    yield put(resultsetGetted(renderType, itemId, requestParams, resultset.payload))
  } catch (err) {
    errorHandler(err)
  }
}

export function* getWidgetCsv (action) {
  const { itemId, requestParams, token } = action.payload
  const { filters, tempFilters, linkageFilters, globalFilters, variables, linkageVariables, globalVariables, ...rest } = requestParams

  try {
    const path = yield call(request, {
      method: 'post',
      url: `${api.share}/csv/${token}`,
      data: {
        ...rest,
        filters: filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables)
      }
    })
    yield put(widgetCsvLoaded(itemId))
    location.href = path.payload
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    errorHandler(err)
  }
}

export function* getSelectOptions (action) {
  try {
    const { payload } = action
    const { controlKey, dataToken, requestParams, itemId } = payload
    const requestParamsMap: Array<[string, IDistinctValueReqeustParams]> = Object.entries(requestParams)
    const requests = requestParamsMap.map(([viewId, params]: [string, IDistinctValueReqeustParams]) => {
      const { columns, filters, variables } = params
      return call(request, {
        method: 'post',
        url: `${api.share}/data/${dataToken}/distinctvalue/${viewId}`,
        data: {
          columns,
          filters,
          params: variables
        }
      })
    })
    const results = yield all(requests)
    const values = results.reduce((payloads, r, index) => {
      const { columns } = requestParamsMap[index][1]
      if (columns.length === 1) {
        return payloads.concat(r.payload.map((obj) => obj[columns[0]]))
      }
      return payloads
    }, [])
    yield put(selectOptionsLoaded(controlKey, values, itemId))
  } catch (err) {
    yield put(loadSelectOptionsFail(err))
    errorHandler(err)
  }
}

export default function* rootDashboardSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_SHARE_DASHBOARD, getDashboard),
    takeEvery(LOAD_SHARE_WIDGET, getWidget),
    takeEvery(LOAD_SHARE_RESULTSET, getResultset),
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv),
    takeEvery(LOAD_SELECT_OPTIONS, getSelectOptions)
  ]
}
