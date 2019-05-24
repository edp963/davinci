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

import { message } from 'antd'
import request from 'utils/request'
import api from 'utils/api'
import { ActionTypes } from './constants'
import { displayLoaded, loadDisplayFail, layerDataLoaded, loadLayerDataFail } from './actions'

export function* getDisplay (action) {
  const { token, resolve, reject } = action.payload
  try {
    const asyncData = yield call(request, `${api.share}/display/${token}`)
    const { header, payload } = asyncData
    if (header.code === 401) {
      reject(header.msg)
      yield put(loadDisplayFail(header.msg))
      return
    }
    const display = payload
    const { slides, widgets } = display
    yield put(displayLoaded(display, slides[0], widgets))
    resolve(display, slides[0], widgets)
  } catch (err) {
    message.destroy()
    yield put(loadDisplayFail(err))
    message.error('获取 Display 信息失败，请刷新重试')
    reject(err)
  }
}

export function* getData (action) {
  const { payload } = action
  const { renderType, layerId, dataToken, requestParams } = payload
  const {
    filters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    ...rest
  } = requestParams

  try {
    const response = yield call(request, {
      method: 'post',
      url: `${api.share}/data/${dataToken}`,
      data: {
        ...rest,
        filters: filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables)
      }
    })
    const { resultList } = response.payload
    response.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    yield put(layerDataLoaded(renderType, layerId, response.payload))
  } catch (err) {
    yield put(loadLayerDataFail(err))
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.LOAD_SHARE_DISPLAY, getDisplay),
    takeEvery(ActionTypes.LOAD_LAYER_DATA, getData)
  ]
}
