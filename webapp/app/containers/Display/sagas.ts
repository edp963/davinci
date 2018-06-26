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
import { call, fork, put, all } from 'redux-saga/effects'

import request from '../../utils/request'
import api from '../../utils/api'
import { readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import { getDefaultSlideParams } from '../../assets/json/SlideSettings'
import axios from 'axios' // FIXME

const message = require('antd/lib/message')

import {
  ActionTypes
} from './constants'
import {
  loadDisplays,
  displaysLoaded,
  loadDisplaysFail,

  loadDisplayDetail,
  displayDetailLoaded,

  displayAdded,
  addDisplayFail,
  displayEdited,
  editDisplayFail,
  currentDisplayEdited,
  editCurrentDisplayFail,
  displayDeleted,
  deleteDisplayFail,

  displayLayersAdded,
  addDisplayLayersFail,
  displayLayersDeleted,
  deleteDisplayLayersFail,
  displayLayersEdited,
  editDisplayLayersFail
} from './actions'
import messages from './messages'

function* getToken () {
  return yield call(axios, `/api/v3/login`, {
    method: 'post',
    data: {
      username: 'Fangkun',
      password: 'qwerty'
    }
  })
}

export function* getDisplays (action): IterableIterator<any> {
  const { projectId } = action.payload
  // FIXME
  const token = (yield getToken()).data.header.token

  const asyncData = yield call(request, `${api.display}?projectId=${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!asyncData.error) {
    const displays = readListAdapter(asyncData)
    yield put(displaysLoaded(displays))
  } else {
    yield put(loadDisplaysFail(asyncData.error))
  }
}

export function* addDisplay (action) {
  const { display, resolve } = action.payload
  try {
    // FIXME
    const token = (yield getToken()).data.header.token

    const asyncDisplayData = yield call(request, {
      method: 'post',
      url: api.display,
      data: display,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const resultDisplay = readObjectAdapter(asyncDisplayData)
    const { id } = resultDisplay
    const slide = {
      displayId: id,
      index: 0,
      config: JSON.stringify({ slideParams: getDefaultSlideParams() })
    }
    const asyncSlideData = yield call(request, {
      method: 'post',
      url: `${api.display}/${id}/slides`,
      data: slide,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const resultSlide = readObjectAdapter(asyncSlideData)
    display.slides = [resultSlide]
    yield put(displayAdded(display))
    resolve()
  } catch (err) {
    yield put(addDisplayFail())
    message.error('添加 Display 失败，请稍后再试')
  }
}

export function* getDisplayDetail (action): IterableIterator<any> {
  // FIXME
  const token = (yield getToken()).data.header.token

  const { id } = action.payload
  const asyncDataSlides = yield call(request, {
    url: `${api.display}/${id}/slides`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const slides = readListAdapter(asyncDataSlides)
  // FIXME
  const display = { ...slides[0] }
  const asyncDataWidgets = yield call(request, {
    url: `${api.display}/${id}/slides/${slides[0].id}/widgets`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  display.layers = readListAdapter(asyncDataWidgets)
  yield put(displayDetailLoaded(display))
  return display
}

export function* editDisplay (action): IterableIterator<any> {
  const { display, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.display}/${display.id}`,
      data: display
    })
    yield put(displayEdited(display))
    resolve()
  } catch (err) {
    yield put(editDisplayFail(err))
    message.error(err)
  }
}

export function* editCurrentDisplay (action): IterableIterator<any> {
  const { display, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.display}/${display.id}`,
      data: display
    })
    yield put(currentDisplayEdited(display))
    resolve()
  } catch (err) {
    yield put(editCurrentDisplayFail(err))
    message.error(err)
  }
}

export function* deleteDisplay (action) {
  const { id } = action.payload
  try {
    // FIXME
    const token = (yield getToken()).data.header.token

    yield call(request, {
      method: 'delete',
      url: `${api.display}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(displayDeleted(id))
  } catch (err) {
    yield put(deleteDisplayFail())
    message.error('删除当前 Display 失败，请稍后再试')
  }
}

export function* addDisplayLayers (action) {
  const { displayId, slideId, layers } = action.payload
  try {
    // FIXME
    const token = (yield getToken()).data.header.token
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.display}/${displayId}/slides/${slideId}/widgets`,
      data: layers, // FIXME
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const result = readListAdapter(asyncData)
    yield put(displayLayersAdded(result))
    return result
  } catch (err) {
    yield put(addDisplayLayersFail())
    message.error('当前 Display 添加图层失败，请稍后再试')
  }
}

export function* editDisplayLayers (action) {
  const { displayId, slideId, layers } = action.payload
  try {
    // FIXME
    const token = (yield getToken()).data.header.token
    yield call(request, {
      method: 'put',
      url: `${api.display}/${displayId}/slides/${slideId}/widgets`,
      data: layers,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(displayLayersEdited(layers))
  } catch (err) {
    yield put(editDisplayLayersFail())
    message.error(err)
  }
}

export function* deleteDisplayLayers (action) {
  const { displayId, slideId, ids } = action.payload
  try {
    // FIXME
    const token = (yield getToken()).data.header.token
    yield call(request, {
      method: 'put',
      url: `${api.display}/${displayId}/slides/${slideId}/widgets`,
      data: ids,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(displayLayersDeleted(ids))
  } catch (err) {
    yield put(deleteDisplayLayersFail())
    message.error('当前 Display 删除图层失败，请稍后再试')
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.LOAD_DISPLAYS, getDisplays),
    takeEvery(ActionTypes.ADD_DISPLAY, addDisplay),
    takeLatest(ActionTypes.LOAD_DISPLAY_DETAIL, getDisplayDetail),
    takeEvery(ActionTypes.EDIT_DISPLAY, editDisplay),
    takeEvery(ActionTypes.EDIT_CURRENT_DISPLAY, editCurrentDisplay),
    takeEvery(ActionTypes.DELETE_DISPLAY, deleteDisplay),
    takeEvery(ActionTypes.ADD_DISPLAY_LAYERS, addDisplayLayers),
    takeEvery(ActionTypes.EDIT_DISPLAY_LAYERS, editDisplayLayers),
    takeEvery(ActionTypes.DELETE_DISPLAY_LAYERS, deleteDisplayLayers)
  ]
}
