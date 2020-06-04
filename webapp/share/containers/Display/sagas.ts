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

import omit from 'lodash/omit'
import { call, fork, put, all, takeLatest, takeEvery } from 'redux-saga/effects'

import { message } from 'antd'
import request from 'utils/request'
import api from 'utils/api'
import { ActionTypes } from './constants'
import ShareDisplayActions, { ShareDisplayActionType } from './actions'

export function* getDisplay (action: ShareDisplayActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_DISPLAY) { return }

  const { token, resolve, reject } = action.payload
  const { loadDisplayFail, displayLoaded } = ShareDisplayActions
  try {
    const asyncData = yield call(request, `${api.share}/display/${token}`)
    const { header, payload } = asyncData
    if (header.code === 401) {
      reject(header.msg)
      yield put(loadDisplayFail(header.msg))
      return
    }
    const { slides, widgets, ...display } = payload
    display.config = JSON.parse(display.config || '{}')
    slides.sort((s1, s2) => s1.index - s2.index).forEach((slide) => {
      slide.config = JSON.parse(slide.config)
      slide.relations.forEach((layer) => {
        layer.params = JSON.parse(layer.params)
      })
    })
    if (Array.isArray(widgets)) {
      widgets.forEach((widget) => {
        widget.config = JSON.parse(widget.config)
        widget.model = JSON.parse(widget.model)
      })
    }
    yield put(displayLoaded(display, slides, widgets || [])) // @FIXME should return empty array in response
    resolve(display, slides, widgets)
  } catch (err) {
    message.destroy()
    yield put(loadDisplayFail(err))
    message.error('获取 Display 信息失败，请刷新重试')
    reject(err)
  }
}

export function* getData (action: ShareDisplayActionType) {
  if (action.type !== ActionTypes.LOAD_LAYER_DATA) { return }

  const { renderType, slideNumber, layerId, dataToken, requestParams } = action.payload
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
  const { layerDataLoaded, loadLayerDataFail } = ShareDisplayActions

  try {
    const response = yield call(request, {
      method: 'post',
      url: `${api.share}/data/${dataToken}`,
      data: {
        ...omit(rest, 'customOrders'),
        filters: filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      }
    })
    let responsePayload = response.payload || { resultList: [] }
    const { resultList } = responsePayload
    responsePayload.resultList = (resultList && resultList.slice(0, 600)) || []
    yield put(layerDataLoaded(renderType, slideNumber, layerId, responsePayload, requestParams))
  } catch (err) {
    yield put(loadLayerDataFail(slideNumber, layerId, err))
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield all([
    takeLatest(ActionTypes.LOAD_SHARE_DISPLAY, getDisplay),
    takeEvery(ActionTypes.LOAD_LAYER_DATA, getData)
  ])
}
