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

import { ActionTypes } from './constants'
import { IBaseline } from './components/LayerItem'

export function loadDisplays (projectId) {
  return {
    type: ActionTypes.LOAD_DISPLAYS,
    payload: {
      projectId
    }
  }
}
export function displaysLoaded (displays) {
  return {
    type: ActionTypes.LOAD_DISPLAYS_SUCCESS,
    payload: {
      displays
    }
  }
}
export function loadDisplaysFail (error) {
  return {
    type: ActionTypes.LOAD_DISPLAYS_FAILURE,
    payload: {
      error
    }
  }
}

export function addDisplay (display, resolve) {
  return {
    type: ActionTypes.ADD_DISPLAY,
    payload: {
      display,
      resolve
    }
  }
}
export function displayAdded (result) {
  return {
    type: ActionTypes.ADD_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}
export function addDisplayFail () {
  return {
    type: ActionTypes.ADD_DISPLAY_FAILURE
  }
}

export function loadDisplayDetail (projectId, displayId) {
  return {
    type: ActionTypes.LOAD_DISPLAY_DETAIL,
    payload: {
      projectId,
      displayId
    }
  }
}
export function displayDetailLoaded (display, slide, layers, widgets, views) {
  return {
    type: ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS,
    payload: {
      display,
      slide,
      layers,
      widgets,
      views
    }
  }
}

export function editDisplay (display, resolve) {
  return {
    type: ActionTypes.EDIT_DISPLAY,
    payload: {
      display,
      resolve
    }
  }
}
export function displayEdited (result) {
  return {
    type: ActionTypes.EDIT_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}
export function editDisplayFail (error) {
  return {
    type: ActionTypes.EDIT_DISPLAY_FAILURE,
    payload: {
      error
    }
  }
}

export function editCurrentDisplay (display, resolve?) {
  return {
    type: ActionTypes.EDIT_CURRENT_DISPLAY,
    payload: {
      display,
      resolve
    }
  }
}
export function currentDisplayEdited (result) {
  return {
    type: ActionTypes.EDIT_CURRENT_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}
export function editCurrentDisplayFail (error) {
  return {
    type: ActionTypes.EDIT_CURRENT_DISPLAY_FAILURE,
    payload: {
      error
    }
  }
}

export function editCurrentSlide (displayId, slide, resolve?) {
  return {
    type: ActionTypes.EDIT_CURRENT_SLIDE,
    payload: {
      displayId,
      slide,
      resolve
    }
  }
}
export function currentSlideEdited (result) {
  return {
    type: ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS,
    payload: {
      result
    }
  }
}
export function editCurrentSlideFail (error) {
  return {
    type: ActionTypes.EDIT_CURRENT_SLIDE_FAILURE,
    payload: {
      error
    }
  }
}

export function uploadCurrentSlideCover (cover, resolve) {
  return {
    type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER,
    payload: {
      cover,
      resolve
    }
  }
}
export function currentSlideCoverUploaded (result) {
  return {
    type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_SUCCESS,
    payload: {
      result
    }
  }
}
export function uploadCurrentSlideCoverFail (error) {
  return {
    type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_FAILURE,
    payload: {
      error
    }
  }
}

export function deleteDisplay (id) {
  return {
    type: ActionTypes.DELETE_DISPLAY,
    payload: {
      id
    }
  }
}
export function displayDeleted (id) {
  return {
    type: ActionTypes.DELETE_DISPLAY_SUCCESS,
    payload: {
      id
    }
  }
}
export function deleteDisplayFail () {
  return {
    type: ActionTypes.DELETE_DISPLAY_FAILURE
  }
}

export function dragSelectedLayer ({ id, deltaX, deltaY }) {
  return {
    type: ActionTypes.DRAG_SELECT_LAYER,
    payload: {
      id,
      deltaX,
      deltaY
    }
  }
}

export function resizeLayers (layerIds) {
  return {
    type: ActionTypes.RESIZE_LAYERS,
    payload: {
      layerIds
    }
  }
}

export function selectLayer ({ id, selected, exclusive }) {
  return {
    type: ActionTypes.SELECT_LAYER,
    payload: {
      id,
      selected,
      exclusive
    }
  }
}

export function clearLayersSelection () {
  return {
    type: ActionTypes.CLEAR_LAYERS_SELECTION
  }
}

export function toggleLayersResizingStatus (layerIds: number[], resizing: boolean) {
  return {
    type: ActionTypes.TOGGLE_LAYERS_RESIZING_STATUS,
    payload: {
      layerIds,
      resizing
    }
  }
}
export function toggleLayersDraggingStatus (layerIds: number[], dragging: boolean) {
  return {
    type: ActionTypes.TOGGLE_LAYERS_DRAGGING_STATUS,
    payload: {
      layerIds,
      dragging
    }
  }
}

export function clearEditorBaselines () {
  return {
    type: ActionTypes.CLEAR_EDITOR_BASELINES
  }
}
export function showEditorBaselines (baselines: IBaseline[]) {
  return {
    type: ActionTypes.SHOW_EDITOR_BASELINES,
    payload: {
      baselines
    }
  }
}

export function copySlideLayers (slideId, layers: any[]) {
  return {
    type: ActionTypes.COPY_SLIDE_LAYERS,
    payload: {
      slideId,
      layers
    }
  }
}

export function pasteSlideLayers (displayId: number, slideId: number, layers: any[]) {
  return {
    type: ActionTypes.PASTE_SLIDE_LAYERS,
    payload: {
      displayId,
      slideId,
      layers
    }
  }
}
export function slideLayersPasted (result) {
  return {
    type: ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS,
    payload: {
      result
    }
  }
}
export function pasteSlideLayersFail () {
  return {
    type: ActionTypes.PASTE_SLIDE_LAYERS_FAILURE
  }
}

export function undoOperation (currentState) {
  return {
    type: ActionTypes.UNDO_OPERATION,
    payload: {
      currentState
    }
  }
}
export function undoOperationDone () {
  return {
    type: ActionTypes.UNDO_OPERATION_SUCCESS
  }
}
export function undoOperationFail () {
  return {
    type: ActionTypes.UNDO_OPERATION_FAILURE
  }
}
export function redoOperation (nextState) {
  return {
    type: ActionTypes.REDO_OPERATION,
    payload: {
      nextState
    }
  }
}
export function redoOperationDone () {
  return {
    type: ActionTypes.REDO_OPERATION_SUCCESS
  }
}
export function redoOperationFail () {
  return {
    type: ActionTypes.REDO_OPERATION_FAILURE
  }
}

export function addDisplayLayers (displayId: any, slideId: any, layers: any[]) {
  return {
    type: ActionTypes.ADD_DISPLAY_LAYERS,
    payload: {
      displayId,
      slideId,
      layers
    }
  }
}
export function displayLayersAdded (result) {
  return {
    type: ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS,
    payload: {
      result
    }
  }
}
export function addDisplayLayersFail () {
  return {
    type: ActionTypes.ADD_DISPLAY_LAYERS_FAILURE
  }
}

export function editDisplayLayers (displayId: any, slideId: any, layers: any[]) {
  return {
    type: ActionTypes.EDIT_DISPLAY_LAYERS,
    payload: {
      displayId,
      slideId,
      layers
    }
  }
}
export function displayLayersEdited (result) {
  return {
    type: ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS,
    payload: {
      result
    }
  }
}
export function editDisplayLayersFail () {
  return {
    type: ActionTypes.EDIT_DISPLAY_LAYERS_FAILURE
  }
}

export function deleteDisplayLayers (displayId: any, slideId: any, ids: any[]) {
  return {
    type: ActionTypes.DELETE_DISPLAY_LAYERS,
    payload: {
      displayId,
      slideId,
      ids
    }
  }
}
export function displayLayersDeleted (ids) {
  return {
    type: ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS,
    payload: {
      ids
    }
  }
}
export function deleteDisplayLayersFail () {
  return {
    type: ActionTypes.DELETE_DISPLAY_LAYERS_FAILURE
  }
}

export function loadDisplayShareLink (id, authName) {
  return {
    type: ActionTypes.LOAD_DISPLAY_SHARE_LINK,
    payload: {
      id,
      authName
    }
  }
}

export function displayShareLinkLoaded (shareInfo) {
  return {
    type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS,
    payload: {
      shareInfo
    }
  }
}

export function displaySecretLinkLoaded (secretInfo) {
  return {
    type: ActionTypes.LOAD_DISPLAY_SECRET_LINK_SUCCESS,
    payload: {
      secretInfo
    }
  }
}

export function loadDisplayShareLinkFail () {
  return {
    type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE
  }
}

export function resetDisplayState () {
  return {
    type: ActionTypes.RESET_DISPLAY_STATE
  }
}
