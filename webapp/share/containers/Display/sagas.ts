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
import { call, select, put, all, takeLatest, takeEvery } from 'redux-saga/effects'

import { message } from 'antd'
import request from 'utils/request'
import api from 'utils/api'
import { ActionTypes } from './constants'
import ShareDisplayActions, { ShareDisplayActionType } from './actions'
import { getPasswordUrl } from 'share/util'
import {
  makeSelectShareType
} from 'share/containers/App/selectors'
import { displayParamsMigrationRecorder, widgetConfigMigrationRecorder } from 'app/utils/migrationRecorders'
import { SecondaryGraphTypes } from 'app/containers/Display/components/Setting'
import { ILayerRaw, ILayerParams } from 'app/containers/Display/components/types'
import { IWidgetConfig } from 'app/containers/Widget/components/Widget'
export function* getDisplay (action: ShareDisplayActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_DISPLAY) { return }

  const { token, resolve, reject } = action.payload
  const { loadDisplayFail, displayLoaded } = ShareDisplayActions

  const shareType = yield select(makeSelectShareType())
  const baseUrl = `${api.share}/display/${token}`
  const requestUrl = getPasswordUrl(shareType, token, baseUrl)


  try {
    const asyncData = yield call(request, requestUrl)
    const { header, payload } = asyncData
    if (header.code === 401) {
      reject(header.msg)
      yield put(loadDisplayFail(header.msg))
      return
    }
    const { slides, widgets, views, ...display } = payload
    display.config = JSON.parse(display.config || '{}')
    slides.sort((s1, s2) => s1.index - s2.index).forEach((slide) => {
      slide.config = JSON.parse(slide.config)
      slide.relations.forEach((layer: ILayerRaw) => {
        const { subType } = layer
        const parsedParams: ILayerParams = JSON.parse(layer.params)
        layer.params = SecondaryGraphTypes.Label === subType ? displayParamsMigrationRecorder(parsedParams) : parsedParams
      })
    })
    const formedWidgets = widgets.map((widget) => {
      const { config, ...rest } = widget
      const parsedConfig: IWidgetConfig = JSON.parse(config)
      return {
        ...rest,
        config: widgetConfigMigrationRecorder(parsedConfig, {
          viewId: widget.viewId
        })
      }
    })
    const formedViews = views.reduce(
      (obj, { id, model, variable }) => ({
        ...obj,
        [id]: {
          model: JSON.parse(model),
          variable: JSON.parse(variable)
        }
      }),
      {}
    )

    yield put(displayLoaded(display, slides, formedWidgets, formedViews))
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
    tempFilters,  // @TODO combine widget static filters with local filters
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
    const responsePayload = response.payload || { resultList: [] }
    responsePayload.resultList = responsePayload.resultList || []
    yield put(layerDataLoaded(renderType, slideNumber, layerId, responsePayload, requestParams))
  } catch (err) {
    yield put(loadLayerDataFail(slideNumber, layerId, err))
  }
}

export default function* rootDisplaySaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_SHARE_DISPLAY, getDisplay),
    takeEvery(ActionTypes.LOAD_LAYER_DATA, getData)
  ])
}
