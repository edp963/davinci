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

import {
  call,
  put,
  all,
  select,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'

import produce from 'immer'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

import { ActionTypes } from './constants'
import DisplayActions, { DisplayActionType } from './actions'
import {
  ILayerRaw,
  Layer,
  ILayerFormed,
  LayersOperationInfo,
  DeltaPosition,
  DeltaSize
} from './components/types'
import { IWidgetRaw } from '../Widget/types'
import VizActions from 'containers/Viz/actions'
import ViewActions from 'containers/View/actions'
import { getViewsDetail } from 'containers/View/sagas'
import {
  makeSelectLayersBySlide,
  makeSelectCurrentSelectedLayerList,
  makeSelectCurrentLayerList,
  makeSelectCurrentSelectedLayerIds,
  makeSelectCurrentOperatingLayerList,
  makeSelectCurrentOtherLayerList,
  makeSelectClipboardLayers
} from './selectors'
import { makeSelectFormedViews } from 'containers/View/selectors'
import { bringToFront, sendToBottom, bringToUpper, sendToNext } from './util'
import { LayerOperations } from './components/constants'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide
} from '../Viz/selectors'
import { computeEditorBaselines, setLayersAlignment } from './components/util'
import { DefaultDisplayParams } from './components/Setting/constants'
import { IDisplayFormed } from '../Viz/types'

export function* getSlideDetail(action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_SLIDE_DETAIL) {
    return
  }

  const { displayId, slideId } = action.payload
  const layers: LayersOperationInfo = yield select((state) =>
    makeSelectLayersBySlide()(state, slideId)
  )
  if (layers) {
    return
  }
  const { slideDetailLoaded, loadSlideDetailFail } = DisplayActions
  try {
    const slideDetail = yield call(
      request,
      `${api.display}/${displayId}/slides/${slideId}`
    )
    const { items, views, widgets } = slideDetail.payload || {
      items: [],
      views: [],
      widgets: []
    }
    items.forEach((item: ILayerRaw) => {
      item.params = JSON.parse(item.params)
    })
    widgets.forEach((widget: IWidgetRaw) => {
      widget.config = JSON.parse(widget.config)
    })

    yield put(slideDetailLoaded(slideId, items, widgets, views))
  } catch (err) {
    yield put(loadSlideDetailFail(err))
  }
}

export function* uploadCurrentSlideCover(action: DisplayActionType) {
  if (action.type !== ActionTypes.UPLOAD_CURRENT_SLIDE_COVER) {
    return
  }

  const { cover, slide } = action.payload
  const {
    currentSlideCoverUploaded,
    uploadCurrentSlideCoverFail
  } = DisplayActions
  try {
    const formData = new FormData()
    formData.append('coverImage', new File([cover], 'coverImage.png'))
    const asyncData = yield call(request, `${api.display}/upload/coverImage`, {
      method: 'post',
      data: formData
    })
    const coverPath = asyncData.payload
    yield put(currentSlideCoverUploaded(coverPath))
    const editedSlide = produce(slide, (draft) => {
      draft.config.slideParams.avatar = coverPath
    })
    yield put(VizActions.editSlides([editedSlide]))
  } catch (err) {
    yield put(uploadCurrentSlideCoverFail(err))
    errorHandler(err)
  }
}

export function* addSlideLayers(action: DisplayActionType) {
  if (action.type !== ActionTypes.ADD_SLIDE_LAYERS) {
    return
  }

  const { displayId, slideId, layers, widgets } = action.payload
  const { slideLayersAdded, addSlideLayersFail } = DisplayActions
  const formedViews = yield select(makeSelectFormedViews())
  const requestViewIds = []
  if (Array.isArray(widgets)) {
    widgets.forEach((w) => {
      if (w.viewId && !formedViews[w.viewId]) {
        requestViewIds.push(w.viewId)
      }
    })
  }
  try {
    if (requestViewIds.length) {
      yield getViewsDetail(ViewActions.loadViewsDetail(requestViewIds))
    }
    const asyncData = yield call(
      request,
      `${api.display}/${displayId}/slides/${slideId}/widgets`,
      {
        method: 'post',
        data: layers.map<Omit<ILayerRaw, 'id'>>((layer) => ({
          ...layer,
          params: JSON.stringify(layer.params)
        }))
      }
    )
    const result: Layer[] = asyncData.payload
    result.forEach((item) => (item.params = JSON.parse(item.params as string)))
    yield put(slideLayersAdded(slideId, result as ILayerFormed[], widgets))
    return result
  } catch (err) {
    yield put(addSlideLayersFail())
    errorHandler(err)
  }
}

export function* editSlideLayers(action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_SLIDE_LAYERS) {
    return
  }

  const { displayId, slideId, layers } = action.payload
  const { slideLayersEdited, editSlideLayersFail } = DisplayActions
  try {
    yield call(
      request,
      `${api.display}/${displayId}/slides/${slideId}/widgets`,
      {
        method: 'put',
        data: layers.map<ILayerRaw>((layer) => ({
          ...layer,
          params: JSON.stringify(layer.params)
        }))
      }
    )
    yield put(slideLayersEdited(slideId, layers))
  } catch (err) {
    yield put(editSlideLayersFail())
    errorHandler(err)
  }
}

export function* editSlideLayerParams(action: DisplayActionType) {
  if (action.type !== ActionTypes.EDIT_SLIDE_LAYER_PARAMS) {
    return
  }
  const layerList: ILayerFormed[] = yield select(makeSelectCurrentLayerList())
  const layer = layerList.find(({ id }) => id === action.payload.layerId)
  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())
  const updateLayer = {
    ...layer,
    params: {
      ...layer.params,
      ...action.payload.changedParams
    }
  }
  yield put(DisplayActions.editSlideLayers(displayId, slideId, [updateLayer]))
}

export function* deleteSlideLayers(action: DisplayActionType) {
  if (action.type !== ActionTypes.DELETE_SLIDE_LAYERS) {
    return
  }

  const { displayId, slideId } = action.payload
  const { slideLayersDeleted, deleteSlideLayersFail } = DisplayActions
  const selectedLayerIds: number[] = yield select(makeSelectCurrentSelectedLayerIds())
  if (!selectedLayerIds.length) {
    return
  }
  try {
    yield call(
      request,
      `${api.display}/${displayId}/slides/${slideId}/widgets`,
      {
        method: 'delete',
        data: selectedLayerIds
      }
    )
    yield put(slideLayersDeleted(slideId, selectedLayerIds))
  } catch (err) {
    yield put(deleteSlideLayersFail())
    errorHandler(err)
  }
}

export function* dragLayer(action: DisplayActionType) {
  if (action.type !== ActionTypes.DRAG_LAYER) {
    return
  }
  const { deltaPosition, layerId, finish, slideSize, scale } = action.payload

  const movingLayers: ILayerFormed[] = yield select((state) =>
    makeSelectCurrentOperatingLayerList()(state, layerId)
  )
  if (!movingLayers.length) {
    return
  }
  const otherLayers = yield select((state) =>
    makeSelectCurrentOtherLayerList()(state, layerId)
  )
  const {
    id: displayId,
    config: { displayParams }
  }: IDisplayFormed = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())

  const baselines = computeEditorBaselines(
    movingLayers,
    otherLayers,
    slideSize,
    (displayParams || DefaultDisplayParams).grid,
    scale,
    { ...deltaPosition, deltaWidth: 0, deltaHeight: 0 },
    'position'
  )

  const { deltaX, deltaY } = deltaPosition
  const deltaPositionAdjusted: DeltaPosition = baselines.reduce<DeltaPosition>(
    (acc, bl) => ({
      deltaX: acc.deltaX + bl.adjust[0],
      deltaY: acc.deltaY + bl.adjust[1]
    }),
    { deltaX, deltaY }
  )

  if (finish) {
    const updateLayers = produce(movingLayers, (draft) => {
      draft.forEach((layer) => {
        layer.params.positionX += deltaX
        layer.params.positionY += deltaY
      })
    })
    yield put(DisplayActions.editSlideLayers(displayId, slideId, updateLayers))
    yield put(DisplayActions.clearEditorBaselines())
  } else {
    yield put(DisplayActions.showEditorBaselines(baselines))
  }

  yield put(
    DisplayActions.dragLayerAdjusted(
      movingLayers.map(({ id }) => id),
      slideSize,
      deltaPositionAdjusted,
      finish
    )
  )
}

export function* resizeLayer(action: DisplayActionType) {
  if (action.type !== ActionTypes.RESIZE_LAYER) {
    return
  }

  const { deltaSize, layerId, finish, slideSize, scale } = action.payload

  const resizingLayers: ILayerFormed[] = yield select((state) =>
    makeSelectCurrentOperatingLayerList()(state, layerId)
  )
  if (!resizingLayers.length) {
    return
  }
  const otherLayers = yield select((state) =>
    makeSelectCurrentOtherLayerList()(state, layerId)
  )
  const {
    id: displayId,
    config: { displayParams }
  }: IDisplayFormed = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())

  const baselines = computeEditorBaselines(
    resizingLayers,
    otherLayers,
    slideSize,
    (displayParams || DefaultDisplayParams).grid,
    scale,
    { ...deltaSize, deltaX: 0, deltaY: 0 },
    'size'
  )

  const { deltaWidth, deltaHeight } = deltaSize
  const deltaSizeAdjusted: DeltaSize = baselines.reduce<DeltaSize>(
    (acc, bl) => ({
      deltaWidth: acc.deltaWidth + bl.adjust[0],
      deltaHeight: acc.deltaHeight + bl.adjust[1]
    }),
    { deltaWidth, deltaHeight }
  )

  if (finish) {
    const updateLayers = produce(resizingLayers, (draft) => {
      draft.forEach((layer) => {
        layer.params.width += deltaWidth
        layer.params.height += deltaHeight
      })
    })
    yield put(DisplayActions.editSlideLayers(displayId, slideId, updateLayers))
    yield put(DisplayActions.clearEditorBaselines())
  } else {
    yield put(DisplayActions.showEditorBaselines(baselines))
  }
  yield put(
    DisplayActions.resizeLayerAdjusted(
      resizingLayers.map(({ id }) => id),
      deltaSizeAdjusted,
      finish
    )
  )
}

export function* copySlideLayers(action: DisplayActionType) {
  if (action.type !== ActionTypes.COPY_SLIDE_LAYERS) {
    return
  }
  const selectedLayers: ILayerFormed[] = yield select(makeSelectCurrentSelectedLayerList())
  if (!selectedLayers) {
    return
  }
  yield put(DisplayActions.slideLayersCopied(selectedLayers))
}

export function* pasteSlideLayers(action: DisplayActionType) {
  if (action.type !== ActionTypes.PASTE_SLIDE_LAYERS) {
    return
  }

  const clipboardLayers: ILayerFormed[] = yield select(makeSelectClipboardLayers())
  if (!clipboardLayers.length) {
    return
  }
  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())
  const layers = produce(clipboardLayers, (draft) => {
    draft.forEach((layer) => {
      layer.id = undefined
      layer.displaySlideId = slideId
    })
  })
  yield put(DisplayActions.addSlideLayers(displayId, slideId, layers))
}

export function* changeLayersStack(action: DisplayActionType) {
  if (action.type !== ActionTypes.CHANGE_LAYERS_STACK) {
    return
  }

  const selectedLayerList = yield select(makeSelectCurrentSelectedLayerList())
  if (!selectedLayerList.length) {
    return
  }

  const { operation } = action.payload
  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())
  const layers = yield select(makeSelectCurrentLayerList())

  let updateLayers: ILayerFormed[]
  switch (operation) {
    case LayerOperations.BringToFront:
      updateLayers = bringToFront(selectedLayerList, layers)
      break
    case LayerOperations.SendToBottom:
      updateLayers = sendToBottom(selectedLayerList, layers)
      break
    case LayerOperations.BringToUpper:
      updateLayers = bringToUpper(selectedLayerList, layers)
      break
    case LayerOperations.SendToNext:
      updateLayers = sendToNext(selectedLayerList, layers)
      break
  }
  if (!updateLayers.length) {
    return
  }
  yield put(DisplayActions.editSlideLayers(displayId, slideId, updateLayers))
}

export function* updateLayersAlignment(action: DisplayActionType) {
  if (action.type !== ActionTypes.SET_LAYERS_ALIGNMENT) {
    return
  }

  const selectedLayerList = yield select(makeSelectCurrentSelectedLayerList())
  if (!selectedLayerList.length) {
    return
  }

  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  const { id: slideId } = yield select(makeSelectCurrentSlide())
  const updateLayers = setLayersAlignment(
    selectedLayerList,
    action.payload.alignmentType
  )
  yield put(DisplayActions.editSlideLayers(displayId, slideId, updateLayers))
}

export function* getDisplayShareLink(action: DisplayActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAY_SHARE_LINK) {
    return
  }

  const { id, authName } = action.payload
  const {
    displaySecretLinkLoaded,
    displayShareLinkLoaded,
    loadDisplayShareLinkFail
  } = DisplayActions
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

export function* undoOperation(action: DisplayActionType) {
  if (action.type !== ActionTypes.UNDO_OPERATION) {
    return
  }

  const { currentState } = action.payload
  const { displayId, slide, lastOperationType, lastLayers } = currentState
  const slideId = slide.id
  const { undoOperationDone, undoOperationFail } = DisplayActions
  try {
    switch (lastOperationType) {
      case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides`, {
          method: 'put',
          data: [
            {
              ...slide,
              displayId
            }
          ]
        })
        break
      case ActionTypes.ADD_SLIDE_LAYERS_SUCCESS:
      case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
        const deleteLayerIds = lastLayers.map((l) => l.id)
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'delete',
            data: deleteLayerIds
          }
        )
        break
      case ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS:
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'post',
            data: lastLayers
          }
        )
        break
      case ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS:
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'put',
            data: lastLayers
          }
        )
        break
    }
    yield put(undoOperationDone())
  } catch (err) {
    yield put(undoOperationFail())
    errorHandler(err)
  }
}

export function* redoOperation(action: DisplayActionType) {
  if (action.type !== ActionTypes.REDO_OPERATION) {
    return
  }

  const { nextState } = action.payload
  const { displayId, slide, lastOperationType, lastLayers } = nextState
  const slideId = slide.id
  const { redoOperationDone, redoOperationFail } = DisplayActions
  try {
    switch (lastOperationType) {
      case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
        yield call(request, `${api.display}/${displayId}/slides`, {
          method: 'put',
          data: [
            {
              ...slide,
              displayId
            }
          ]
        })
        break
      case ActionTypes.ADD_SLIDE_LAYERS_SUCCESS:
      case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'post',
            data: lastLayers
          }
        )
        break
      case ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS:
        const deleteLayerIds = lastLayers.map((l) => l.id)
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'delete',
            data: deleteLayerIds
          }
        )
        break
      case ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS:
        yield call(
          request,
          `${api.display}/${displayId}/slides/${slideId}/widgets`,
          {
            method: 'put',
            data: lastLayers
          }
        )
        break
    }
    yield put(redoOperationDone())
  } catch (err) {
    yield put(redoOperationFail())
    errorHandler(err)
  }
}

export default function* rootDisplaySaga() {
  yield all([
    takeLatest(ActionTypes.LOAD_SLIDE_DETAIL, getSlideDetail),
    takeEvery(ActionTypes.UPLOAD_CURRENT_SLIDE_COVER, uploadCurrentSlideCover),

    takeEvery(ActionTypes.ADD_SLIDE_LAYERS, addSlideLayers),
    takeEvery(ActionTypes.EDIT_SLIDE_LAYERS, editSlideLayers),
    takeEvery(ActionTypes.EDIT_SLIDE_LAYER_PARAMS, editSlideLayerParams),
    takeEvery(ActionTypes.DELETE_SLIDE_LAYERS, deleteSlideLayers),

    takeEvery(ActionTypes.COPY_SLIDE_LAYERS, copySlideLayers),
    takeEvery(ActionTypes.PASTE_SLIDE_LAYERS, pasteSlideLayers),

    takeLatest(ActionTypes.DRAG_LAYER, dragLayer),
    takeLatest(ActionTypes.RESIZE_LAYER, resizeLayer),
    takeEvery(ActionTypes.CHANGE_LAYERS_STACK, changeLayersStack),
    takeLatest(ActionTypes.SET_LAYERS_ALIGNMENT, updateLayersAlignment),

    takeLatest(ActionTypes.LOAD_DISPLAY_SHARE_LINK, getDisplayShareLink),
    takeEvery(ActionTypes.UNDO_OPERATION, undoOperation),
    takeEvery(ActionTypes.REDO_OPERATION, redoOperation)
  ])
}
