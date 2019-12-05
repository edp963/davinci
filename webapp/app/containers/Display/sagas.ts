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

import { call, fork, put, all, takeLatest, takeEvery } from 'redux-saga/effects'

import request from 'utils/request'
import api from 'utils/api'
import { getDefaultSlideParams } from './components/util'
import { errorHandler } from 'utils/util'

import {
  ActionTypes
} from './constants'
import DisplayActions, { DisplayActionType } from './actions'

export function* getDisplays (action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAYS) { return }

  const { projectId } = action.payload
  const { displaysLoaded, loadDisplaysFail } = DisplayActions
  try {
    const asyncData = yield call(request, `${api.display}?projectId=${projectId}`)
    const displays = asyncData.payload
    yield put(displaysLoaded(displays))
  } catch (err) {
    yield put(loadDisplaysFail(err))
  }
}

export function* addDisplay (action: DisplayActionType) {
  if (action.type !== ActionTypes.ADD_DISPLAY) { return }

  const { display, resolve } = action.payload
  const { displayAdded, addDisplayFail } = DisplayActions
  try {
    const asyncDisplayData = yield call(request, api.display, {
      method: 'post',
      data: display
    })
    const resultDisplay = asyncDisplayData.payload
    const { id } = resultDisplay
    const slide = {
      displayId: id,
      index: 0,
      config: JSON.stringify({ slideParams: getDefaultSlideParams() })
    }
    yield call(request, `${api.display}/${id}/slides`, {
      method: 'post',
      data: slide
    })
    yield put(displayAdded(resultDisplay))
    resolve()
  } catch (err) {
    yield put(addDisplayFail())
    errorHandler(err)
  }
}

export function* getDisplayDetail (action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAY_DETAIL) { return }

  const { projectId, displayId } = action.payload
  const { displayDetailLoaded, loadDisplaysFail } = DisplayActions
  try {
    const result = yield all({
      dashboardDetail: call(request, `${api.display}/${displayId}/slides`),
      widgets: call(request, `${api.widget}?projectId=${projectId}`)
    })
    const { dashboardDetail, widgets } = result
    const display = dashboardDetail.payload
    const slide = display.slides[0]
    delete display.slides
    const slideDetail = yield call(request, `${api.display}/${displayId}/slides/${slide.id}`)
    const { widgets: layers, views } = slideDetail.payload
    yield put(displayDetailLoaded(display, slide, layers, widgets.payload, views))
  } catch (err) {
    yield put(loadDisplaysFail(err))
  }
}

export function* editDisplay (action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_DISPLAY) { return }

  const { display, resolve } = action.payload
  const { displayEdited, editDisplayFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${display.id}`, {
      method: 'put',
      data: display
    })
    yield put(displayEdited(display))
    if (resolve) { resolve() }
  } catch (err) {
    yield put(editDisplayFail(err))
    errorHandler(err)
  }
}

export function* editCurrentDisplay (action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_CURRENT_DISPLAY) { return }

  const { display, resolve } = action.payload
  const { currentDisplayEdited, editCurrentDisplayFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${display.id}`, {
      method: 'put',
      data: display
    })
    yield put(currentDisplayEdited(display))
    if (resolve) { resolve() }
  } catch (err) {
    yield put(editCurrentDisplayFail(err))
    errorHandler(err)
  }
}

export function* editCurrentSlide (action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_CURRENT_SLIDE) { return }

  const { displayId, slide, resolve } = action.payload
  const { currentSlideEdited, editCurrentSlideFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${displayId}/slides`, {
      method: 'put',
      data: [{
        ...slide,
        displayId
      }]
    })
    yield put(currentSlideEdited(slide))
  } catch (err) {
    yield put(editCurrentSlideFail(err))
    errorHandler(err)
  }
}

export function* uploadCurrentSlideCover (action: DisplayActionType) {
  if (action.type !== ActionTypes.UPLOAD_CURRENT_SLIDE_COVER) { return }

  const { cover, resolve } = action.payload
  const { currentSlideCoverUploaded, uploadCurrentSlideCoverFail } = DisplayActions
  try {
    const formData = new FormData()
    formData.append('coverImage', new File([cover], 'coverImage.png'))
    const asyncData = yield call(request, `${api.display}/upload/coverImage`, {
      method: 'post',
      data: formData
    })
    const coverPath = asyncData.payload
    yield put(currentSlideCoverUploaded(coverPath))
    resolve(coverPath)
  } catch (err) {
    yield put(uploadCurrentSlideCoverFail(err))
    errorHandler(err)
  }
}

export function* deleteDisplay (action: DisplayActionType) {
  if (action.type !== ActionTypes.DELETE_DISPLAY) { return }

  const { id } = action.payload
  const { displayDeleted, deleteDisplayFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${id}`, {
      method: 'delete'
    })
    yield put(displayDeleted(id))
  } catch (err) {
    yield put(deleteDisplayFail())
    errorHandler(err)
  }
}

export function* addDisplayLayers (action: DisplayActionType) {
  if (action.type !== ActionTypes.ADD_DISPLAY_LAYERS) { return }

  const { displayId, slideId, layers } = action.payload
  const { displayLayersAdded, addDisplayLayersFail } = DisplayActions
  try {
    const asyncData = yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'post',
      data: layers
    })
    const result = asyncData.payload
    yield put(displayLayersAdded(result))
    return result
  } catch (err) {
    yield put(addDisplayLayersFail())
    errorHandler(err)
  }
}

export function* editDisplayLayers (action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_DISPLAY_LAYERS) { return }

  const { displayId, slideId, layers } = action.payload
  const { displayLayersEdited, editDisplayLayersFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'put',
      data: layers
    })
    yield put(displayLayersEdited(layers))
  } catch (err) {
    yield put(editDisplayLayersFail())
    errorHandler(err)
  }
}

export function* deleteDisplayLayers (action: DisplayActionType) {
  if (action.type !== ActionTypes.DELETE_DISPLAY_LAYERS) { return }

  const { displayId, slideId, ids } = action.payload
  const { displayLayersDeleted, deleteDisplayLayersFail } = DisplayActions
  try {
    yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'delete',
      data: ids
    })
    yield put(displayLayersDeleted(ids))
  } catch (err) {
    yield put(deleteDisplayLayersFail())
    errorHandler(err)
  }
}

export function* pasteSlideLayers (action: DisplayActionType) {
  if (action.type !== ActionTypes.PASTE_SLIDE_LAYERS) { return }

  const { displayId, slideId, layers } = action.payload
  const { slideLayersPasted, pasteSlideLayersFail } = DisplayActions
  try {
    const asyncData = yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
      method: 'post',
      data: layers
    })
    const result = asyncData.payload
    yield put(slideLayersPasted(result))
    return result
  } catch (err) {
    yield put(pasteSlideLayersFail())
    errorHandler(err)
  }
}

export function* getDisplayShareLink (action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAY_SHARE_LINK) { return }

  const { id, authName } = action.payload
  const { displaySecretLinkLoaded, displayShareLinkLoaded, loadDisplayShareLinkFail } = DisplayActions
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.display}/${id}/share`,
      params: { username: authName }
    })
    const shareInfo = asyncData.payload
    if (authName) {
      yield put(displaySecretLinkLoaded(shareInfo))
    } else {
      yield put(displayShareLinkLoaded(shareInfo))
    }
  } catch (err) {
    yield put(loadDisplayShareLinkFail())
    errorHandler(err)
  }
}

export function* undoOperation (action: DisplayActionType) {
  if (action.type !== ActionTypes.UNDO_OPERATION) { return }

  const { currentState } = action.payload
  const { displayId, slide, lastOperationType, lastLayers } = currentState
  const slideId = slide.id
  const { undoOperationDone, undoOperationFail } = DisplayActions
  try {
    switch (lastOperationType) {
      case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides`, {
          method: 'put',
          data: [{
            ...slide,
            displayId
          }]
        })
        break
      case ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS:
      case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
        const deleteLayerIds = lastLayers.map((l) => l.id)
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'delete',
          data: deleteLayerIds
        })
        break
      case ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'post',
          data: lastLayers
        })
        break
      case ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'put',
          data: lastLayers
        })
        break
    }
    yield put(undoOperationDone())
  } catch (err) {
    yield put(undoOperationFail())
    errorHandler(err)
  }
}

export function* redoOperation (action: DisplayActionType) {
  if (action.type !== ActionTypes.REDO_OPERATION) { return }

  const { nextState } = action.payload
  const { displayId, slide, lastOperationType, lastLayers } = nextState
  const slideId = slide.id
  const { redoOperationDone, redoOperationFail } = DisplayActions
  try {
    switch (lastOperationType) {
      case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides`, {
          method: 'put',
          data: [{
            ...slide,
            displayId
          }]
        })
        break
      case ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS:
      case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'post',
          data: lastLayers
        })
        break
      case ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS:
        const deleteLayerIds = lastLayers.map((l) => l.id)
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'delete',
          data: deleteLayerIds
        })
        break
      case ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides/${slideId}/widgets`, {
          method: 'put',
          data: lastLayers
        })
        break
    }
    yield put(redoOperationDone())
  } catch (err) {
    yield put(redoOperationFail())
    errorHandler(err)
  }
}


export function* loadProjectDetail (action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_CURRENT_PROJECT) { return }

  const { projectLoaded } = DisplayActions
  const { pid } = action.payload
  try {
    const asyncData = yield call(request, `${api.projects}/${pid}`)
    const project = asyncData.payload
    yield put(projectLoaded(project))
  } catch (err) {
    errorHandler(err)
  }
}

export default function* rootDisplaySaga () {
  yield all([
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
    takeEvery(ActionTypes.PASTE_SLIDE_LAYERS, pasteSlideLayers),
    takeLatest(ActionTypes.LOAD_DISPLAY_SHARE_LINK, getDisplayShareLink),
    takeEvery(ActionTypes.UNDO_OPERATION, undoOperation),
    takeEvery(ActionTypes.REDO_OPERATION, redoOperation),
    takeEvery(ActionTypes.LOAD_CURRENT_PROJECT, loadProjectDetail)
  ])
}
