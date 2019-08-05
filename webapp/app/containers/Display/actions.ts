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
import { returnType } from 'utils/redux'
import { IBaseline } from './components/LayerItem'

export const DisplayActions = {
  loadDisplays (projectId: number) {
    return {
      type: ActionTypes.LOAD_DISPLAYS,
      payload: {
        projectId
      }
    }
  },
  displaysLoaded (displays) {
    return {
      type: ActionTypes.LOAD_DISPLAYS_SUCCESS,
      payload: {
        displays
      }
    }
  },
  loadDisplaysFail (error) {
    return {
      type: ActionTypes.LOAD_DISPLAYS_FAILURE,
      payload: {
        error
      }
    }
  },

  addDisplay (display, resolve) {
    return {
      type: ActionTypes.ADD_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  displayAdded (result) {
    return {
      type: ActionTypes.ADD_DISPLAY_SUCCESS,
      payload: {
        result
      }
    }
  },
  addDisplayFail () {
    return {
      type: ActionTypes.ADD_DISPLAY_FAILURE,
      payload: {}
    }
  },

  loadDisplayDetail (projectId, displayId) {
    return {
      type: ActionTypes.LOAD_DISPLAY_DETAIL,
      payload: {
        projectId,
        displayId
      }
    }
  },
  displayDetailLoaded (display, slide, layers, widgets, views) {
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
  },

  editDisplay (display, resolve) {
    return {
      type: ActionTypes.EDIT_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  displayEdited (result) {
    return {
      type: ActionTypes.EDIT_DISPLAY_SUCCESS,
      payload: {
        result
      }
    }
  },
  editDisplayFail (error) {
    return {
      type: ActionTypes.EDIT_DISPLAY_FAILURE,
      payload: {
        error
      }
    }
  },

  editCurrentDisplay (display, resolve?) {
    return {
      type: ActionTypes.EDIT_CURRENT_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  currentDisplayEdited (result) {
    return {
      type: ActionTypes.EDIT_CURRENT_DISPLAY_SUCCESS,
      payload: {
        result
      }
    }
  },
  editCurrentDisplayFail (error) {
    return {
      type: ActionTypes.EDIT_CURRENT_DISPLAY_FAILURE,
      payload: {
        error
      }
    }
  },

  editCurrentSlide (displayId, slide, resolve?) {
    return {
      type: ActionTypes.EDIT_CURRENT_SLIDE,
      payload: {
        displayId,
        slide,
        resolve
      }
    }
  },
  currentSlideEdited (result) {
    return {
      type: ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS,
      payload: {
        result
      }
    }
  },
  editCurrentSlideFail (error) {
    return {
      type: ActionTypes.EDIT_CURRENT_SLIDE_FAILURE,
      payload: {
        error
      }
    }
  },

  uploadCurrentSlideCover (cover, resolve) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER,
      payload: {
        cover,
        resolve
      }
    }
  },
  currentSlideCoverUploaded (result) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_SUCCESS,
      payload: {
        result
      }
    }
  },
  uploadCurrentSlideCoverFail (error) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_FAILURE,
      payload: {
        error
      }
    }
  },

  deleteDisplay (id) {
    return {
      type: ActionTypes.DELETE_DISPLAY,
      payload: {
        id
      }
    }
  },
  displayDeleted (id) {
    return {
      type: ActionTypes.DELETE_DISPLAY_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteDisplayFail () {
    return {
      type: ActionTypes.DELETE_DISPLAY_FAILURE,
      payload: {}
    }
  },

  dragSelectedLayer ({ id, deltaX, deltaY }) {
    return {
      type: ActionTypes.DRAG_SELECT_LAYER,
      payload: {
        id,
        deltaX,
        deltaY
      }
    }
  },

  resizeLayers (layerIds) {
    return {
      type: ActionTypes.RESIZE_LAYERS,
      payload: {
        layerIds
      }
    }
  },

  selectLayer ({ id, selected, exclusive }) {
    return {
      type: ActionTypes.SELECT_LAYER,
      payload: {
        id,
        selected,
        exclusive
      }
    }
  },

  clearLayersSelection () {
    return {
      type: ActionTypes.CLEAR_LAYERS_SELECTION,
      payload: {}
    }
  },

  toggleLayersResizingStatus (layerIds: number[], resizing: boolean) {
    return {
      type: ActionTypes.TOGGLE_LAYERS_RESIZING_STATUS,
      payload: {
        layerIds,
        resizing
      }
    }
  },
  toggleLayersDraggingStatus (layerIds: number[], dragging: boolean) {
    return {
      type: ActionTypes.TOGGLE_LAYERS_DRAGGING_STATUS,
      payload: {
        layerIds,
        dragging
      }
    }
  },

  clearEditorBaselines () {
    return {
      type: ActionTypes.CLEAR_EDITOR_BASELINES,
      payload: {}
    }
  },
  showEditorBaselines (baselines: IBaseline[]) {
    return {
      type: ActionTypes.SHOW_EDITOR_BASELINES,
      payload: {
        baselines
      }
    }
  },

  copySlideLayers (slideId, layers: any[]) {
    return {
      type: ActionTypes.COPY_SLIDE_LAYERS,
      payload: {
        slideId,
        layers
      }
    }
  },

  pasteSlideLayers (displayId: number, slideId: number, layers: any[]) {
    return {
      type: ActionTypes.PASTE_SLIDE_LAYERS,
      payload: {
        displayId,
        slideId,
        layers
      }
    }
  },
  slideLayersPasted (result) {
    return {
      type: ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS,
      payload: {
        result
      }
    }
  },
  pasteSlideLayersFail () {
    return {
      type: ActionTypes.PASTE_SLIDE_LAYERS_FAILURE,
      payload: {}
    }
  },

  undoOperation (currentState) {
    return {
      type: ActionTypes.UNDO_OPERATION,
      payload: {
        currentState
      }
    }
  },
  undoOperationDone () {
    return {
      type: ActionTypes.UNDO_OPERATION_SUCCESS,
      payload: {}
    }
  },
  undoOperationFail () {
    return {
      type: ActionTypes.UNDO_OPERATION_FAILURE,
      payload: {}
    }
  },
  redoOperation (nextState) {
    return {
      type: ActionTypes.REDO_OPERATION,
      payload: {
        nextState
      }
    }
  },
  redoOperationDone () {
    return {
      type: ActionTypes.REDO_OPERATION_SUCCESS,
      payload: {}
    }
  },
  redoOperationFail () {
    return {
      type: ActionTypes.REDO_OPERATION_FAILURE,
      payload: {}
    }
  },

  addDisplayLayers (displayId: any, slideId: any, layers: any[]) {
    return {
      type: ActionTypes.ADD_DISPLAY_LAYERS,
      payload: {
        displayId,
        slideId,
        layers
      }
    }
  },
  displayLayersAdded (result) {
    return {
      type: ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS,
      payload: {
        result
      }
    }
  },
  addDisplayLayersFail () {
    return {
      type: ActionTypes.ADD_DISPLAY_LAYERS_FAILURE,
      payload: {}
    }
  },

  editDisplayLayers (displayId: any, slideId: any, layers: any[]) {
    return {
      type: ActionTypes.EDIT_DISPLAY_LAYERS,
      payload: {
        displayId,
        slideId,
        layers
      }
    }
  },
  displayLayersEdited (result) {
    return {
      type: ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS,
      payload: {
        result
      }
    }
  },
  editDisplayLayersFail () {
    return {
      type: ActionTypes.EDIT_DISPLAY_LAYERS_FAILURE,
      payload: {}
    }
  },

  deleteDisplayLayers (displayId: any, slideId: any, ids: any[]) {
    return {
      type: ActionTypes.DELETE_DISPLAY_LAYERS,
      payload: {
        displayId,
        slideId,
        ids
      }
    }
  },
  displayLayersDeleted (ids) {
    return {
      type: ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS,
      payload: {
        ids
      }
    }
  },
  deleteDisplayLayersFail () {
    return {
      type: ActionTypes.DELETE_DISPLAY_LAYERS_FAILURE,
      payload: {}
    }
  },

  loadDisplayShareLink (id, authName) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK,
      payload: {
        id,
        authName
      }
    }
  },

  displayShareLinkLoaded (shareInfo) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS,
      payload: {
        shareInfo
      }
    }
  },

  displaySecretLinkLoaded (secretInfo) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SECRET_LINK_SUCCESS,
      payload: {
        secretInfo
      }
    }
  },

  loadDisplayShareLinkFail () {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE,
      payload: {}
    }
  },

  resetDisplayState () {
    return {
      type: ActionTypes.RESET_DISPLAY_STATE,
      payload: {}
    }
  },

  monitoredSyncDataAction () {
    return {
      type: ActionTypes.MONITORED_SYNC_DATA_ACTION,
      payload: {}
    }
  },

  monitoredSearchDataAction () {
    return {
      type: ActionTypes.MONITORED_SEARCH_DATA_ACTION,
      payload: {}
    }
  },

  monitoredLinkageDataAction () {
    return {
      type: ActionTypes.MONITORED_LINKAGE_DATA_ACTION,
      payload: {}
    }
  },

  loadProjectDetail (pid) {
    return {
      type: ActionTypes.LOAD_CURRENT_PROJECT,
      payload: {
        pid
      }
    }
  },

  projectLoaded (result) {
    return {
      type: ActionTypes.LOAD_CURRENT_PROJECT_SUCCESS,
      payload: {
        result
      }
    }
  }
}

const mockAction = returnType(DisplayActions)
export type DisplayActionType = typeof mockAction

export default DisplayActions

