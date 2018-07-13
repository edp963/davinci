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
import { getDefaultSlideParams } from '../../assets/json/slideSettings'
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
  currentSlideEdited,
  editCurrentSlideFail,
  currentSlideCoverUploaded,
  uploadCurrentSlideCoverFail,
  displayDeleted,
  deleteDisplayFail,

  displayLayersAdded,
  addDisplayLayersFail,
  displayLayersDeleted,
  deleteDisplayLayersFail,
  displayLayersEdited,
  editDisplayLayersFail,
  displaySecretLinkLoaded,
  displayShareLinkLoaded,
  loadDisplayShareLinkFail
} from './actions'
import messages from './messages'

// FIX ME
function* getToken () {
  const response = yield call(axios, `/api/v3/login`, {
    method: 'post',
    data: {
      username: 'Fangkun',
      password: 'qwerty'
    }
  })
  const token = response.data.header.token
  localStorage.setItem('TEMP_TOKEN', token)
  return token
}

export function* getDisplays (action): IterableIterator<any> {
  const { projectId } = action.payload
  // FIXME
  const token = (yield getToken())

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
    const token = (yield getToken())

    const asyncDisplayData = yield call(request, api.display, {
      method: 'post',
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
    yield call(request, `${api.display}/${id}/slides`, {
      method: 'post',
      data: slide,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(displayAdded(resultDisplay))
    resolve()
  } catch (err) {
    yield put(addDisplayFail())
    message.error('添加 Display 失败，请稍后再试')
  }
}

export function* getDisplayDetail (action): IterableIterator<any> {
  // FIXME
  const token = (yield getToken())

  const { id } = action.payload
  const asyncDataDetail = yield call(request, `${api.display}/${id}/slides`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const display = readObjectAdapter(asyncDataDetail)
  const slide = display.slides[0]
  delete display.slides
  const asyncDataWidgets = yield call(request, `${api.display}/${id}/slides/${slide.id}/widgets`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const layers = readListAdapter(asyncDataWidgets)
  yield put(displayDetailLoaded(display, slide, layers))
  return display
}

export function* editDisplay (action): IterableIterator<any> {
  const { display, resolve } = action.payload
  try {
    // FIXME
    const token = (yield getToken())

    yield call(request, `${api.display}/${display.id}`, {
      method: 'put',
      data: display,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(displayEdited(display))
    if (resolve) { resolve() }
  } catch (err) {
    yield put(editDisplayFail(err))
    message.error(err)
  }
}

export function* editCurrentDisplay (action): IterableIterator<any> {
  const { display, resolve } = action.payload
  try {
    // FIXME
    const token = (yield getToken())

    yield call(request, `${api.display}/${display.id}`, {
      method: 'put',
      data: display,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(currentDisplayEdited(display))
    if (resolve) { resolve() }
  } catch (err) {
    yield put(editCurrentDisplayFail(err))
    message.error(err)
  }
}

export function* editCurrentSlide (action): IterableIterator<any> {
  const { displayId, slide, resolve } = action.payload
  try {
    // FIXME
    const token = (yield getToken())

    yield call(request, `${api.display}/${displayId}/slides`, {
      method: 'put',
      data: [{
        ...slide,
        displayId
      }],
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    yield put(currentSlideEdited(slide))
  } catch (err) {
    yield put(editCurrentSlideFail(err))
    message.error(err)
  }
}

export function* uploadCurrentSlideCover (action): IterableIterator<any> {
  const { cover, resolve } = action.payload
  try {
    // FIXME
    const token = (yield getToken())
    const formData = new FormData()
    formData.append('coverImage', new File([cover], 'coverImage.png'))
    const asyncData = yield call(request, `${api.display}/upload/coverImage`, {
      method: 'post',
      data: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const coverPath = readObjectAdapter(asyncData)
    console.log(asyncData)
    yield put(currentSlideCoverUploaded(coverPath))
    resolve(coverPath)
  } catch (err) {
    yield put(uploadCurrentSlideCoverFail(err))
    message.error(err)
  }
}

export function* deleteDisplay (action) {
  const { id } = action.payload
  try {
    // FIXME
    const token = (yield getToken())

    yield call(request, `${api.display}/${id}`, {
      method: 'delete',
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
    const token = (yield getToken())
    const asyncData = yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'post',
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
    const token = (yield getToken())
    yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'put',
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
    const token = (yield getToken())
    yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'delete',
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

export function* getDisplayShareLink (action) {
  const { id, authName } = action.payload
  try {
    // FIXME
    const token = (yield getToken())
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.display}/${id}/share`,
      params: { username: authName },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const shareInfo = readListAdapter(asyncData)
    if (authName) {
      yield put(displaySecretLinkLoaded(shareInfo))
    } else {
      yield put(displayShareLinkLoaded(shareInfo))
    }
  } catch (err) {
    yield put(loadDisplayShareLinkFail())
    message.error('获取 Display 分享链接失败，请稍后再试')
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.LOAD_DISPLAYS, getDisplays),
    takeEvery(ActionTypes.ADD_DISPLAY, addDisplay),
    takeLatest(ActionTypes.LOAD_DISPLAY_DETAIL, getDisplayDetail),
    takeEvery(ActionTypes.EDIT_DISPLAY, editDisplay),
    takeEvery(ActionTypes.EDIT_CURRENT_DISPLAY, editCurrentDisplay),
    takeEvery(ActionTypes.EDIT_CURRENT_SLIDE, editCurrentSlide),
    takeEvery(ActionTypes.UPLOAD_CURRENT_SLIDE_COVER, uploadCurrentSlideCover),
    takeEvery(ActionTypes.DELETE_DISPLAY, deleteDisplay),
    takeEvery(ActionTypes.ADD_DISPLAY_LAYERS, addDisplayLayers),
    takeEvery(ActionTypes.EDIT_DISPLAY_LAYERS, editDisplayLayers),
    takeEvery(ActionTypes.DELETE_DISPLAY_LAYERS, deleteDisplayLayers),
    takeLatest(ActionTypes.LOAD_DISPLAY_SHARE_LINK, getDisplayShareLink)
  ]
}
