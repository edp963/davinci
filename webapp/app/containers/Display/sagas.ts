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
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import { getDefaultDisplayParams } from '../../assets/json/displaySettings'
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
      password: '123456qwerty'
    }
  })
}

export function* getDisplays (): IterableIterator<any> {
  // FIXME
  const token = (yield getToken()).data.header.token

  const asyncData = yield call(request, `${api.display}/1`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!asyncData.error) {
    const displays = readListAdapter(asyncData, 'display')
    yield put(displaysLoaded(displays))
  } else {
    yield put(loadDisplaysFail(asyncData.error))
  }
}

export function* addDisplay (action) {
  const { display, resolve } = action.payload
  display['display_params'] = getDefaultDisplayParams()
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.display,
      data: writeAdapter(display, 'display')
    })
    const result = readObjectAdapter(asyncData, 'display')
    yield put(displayAdded(display))
    resolve()
  } catch (err) {
    yield put(addDisplayFail())
    message.error('添加 Display 失败，请稍后再试')
  }
}

export function* getDisplayDetail (action): IterableIterator<any> {
  const { id } = action.payload
  const asyncData = yield call(request, `${api.display}/${id}`)
  const display = readListAdapter(asyncData, 'display')
  // FIXME
  display.layers = yield call(request, `${api.display}/layers`)
  yield put(displayDetailLoaded(display))
  return display
}

export function* editDisplay (action): IterableIterator<any> {
  const { display, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.display}/${display.id}`,
      data: writeAdapter(display, 'display')
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
      data: writeAdapter(display, 'display')
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
    yield call(request, {
      method: 'delete',
      url: `${api.display}/${id}`
    })
    yield put(displayDeleted(id))
  } catch (err) {
    yield put(deleteDisplayFail())
    message.error('删除当前 Display 失败，请稍后再试')
  }
}

export function* addDisplayLayers (action) {
  const { layers } = action.payload
  // FIXME
  layers.forEach((l) => {
    l.id = +require('../../utils/util').uuid(3, 10)
  })
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.display}/layers`,
      data: writeAdapter(layers[0], 'display') // FIXME
    })
    const result = readObjectAdapter(asyncData, 'display')
    yield put(displayLayersAdded([result]))
    return result
  } catch (err) {
    yield put(addDisplayLayersFail())
    message.error('当前 Display 添加图层失败，请稍后再试')
  }
}

export function* editDisplayLayers (action) {
  const { layers } = action.payload
  try {
    // FIXME
    yield all(layers.map((x) => call(request, {
      method: 'put',
      url: `${api.display.replace('displays', 'layers')}/${x.id}`,
      data: writeAdapter(x, 'display')
    })))
    yield put(displayLayersEdited(layers))
  } catch (err) {
    yield put(editDisplayLayersFail())
    message.error(err)
  }
}

export function* deleteDisplayLayers (action) {
  const { ids } = action.payload
  try {
    // FIXME
    yield all(ids.map((id) => call(request, {
      method: 'delete',
      url: `${api.display.replace('displays', 'layers')}/${id}`
    })))
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
