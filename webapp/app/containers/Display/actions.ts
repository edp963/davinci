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

import {
  IBaseline,
  ILayerFormed,
  DeltaSize,
  DeltaPosition,
  ILayerParams
} from './components/types'
import { IWidgetFormed } from 'containers/Widget/types'
import { IView } from 'containers/View/types'
import { ISlideFormed, ISlideParams } from 'containers/Viz/types'
import { LayerOperations, LayerAlignmentTypes } from './components/constants'

export const DisplayActions = {
  loadSlideDetail(displayId: number, slideId: number) {
    return {
      type: ActionTypes.LOAD_SLIDE_DETAIL,
      payload: {
        displayId,
        slideId
      }
    }
  },
  slideDetailLoaded(
    slideId: number,
    layers: ILayerFormed[],
    widgets: IWidgetFormed[],
    views: IView[]
  ) {
    return {
      type: ActionTypes.LOAD_SLIDE_DETAIL_SUCCESS,
      payload: {
        slideId,
        layers,
        widgets,
        views
      }
    }
  },
  loadSlideDetailFail(err) {
    return {
      type: ActionTypes.LOAD_SLIDE_DETAIL_FAILURE,
      payload: {
        err
      }
    }
  },

  uploadCurrentSlideCover(cover: Blob, slide: ISlideFormed) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER,
      payload: {
        cover,
        slide
      }
    }
  },
  currentSlideCoverUploaded(result: string) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_SUCCESS,
      payload: {
        result
      }
    }
  },
  uploadCurrentSlideCoverFail(error) {
    return {
      type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_FAILURE,
      payload: {
        error
      }
    }
  },

  resizeLayer(
    slideSize: Pick<ISlideParams, 'width' | 'height'>,
    scale: number,
    layerId: number,
    deltaSize: DeltaSize,
    finish: boolean
  ) {
    return {
      type: ActionTypes.RESIZE_LAYER,
      payload: {
        slideSize,
        scale,
        layerId,
        deltaSize,
        finish
      }
    }
  },
  resizeLayerAdjusted(layerIds: number[], deltaSize: DeltaSize, finish: boolean) {
    return {
      type: ActionTypes.RESIZE_LAYER_ADJUSTED,
      payload: {
        layerIds,
        deltaSize,
        finish
      }
    }
  },

  dragLayer(
    slideSize: Pick<ISlideParams, 'width' | 'height'>,
    scale: number,
    deltaPosition: DeltaPosition,
    finish: boolean,
    layerId?: number
  ) {
    return {
      type: ActionTypes.DRAG_LAYER,
      payload: {
        slideSize,
        scale,
        layerId,
        deltaPosition,
        finish
      }
    }
  },
  dragLayerAdjusted(
    layerIds: number[],
    slideSize: Pick<ISlideParams, 'width' | 'height'>,
    deltaPosition: DeltaPosition,
    finish: boolean,
  ) {
    return {
      type: ActionTypes.DRAG_LAYER_ADJUSTED,
      payload: {
        layerIds,
        slideSize,
        deltaPosition,
        finish
      }
    }
  },

  changeLayersStack(operation: LayerOperations) {
    return {
      type: ActionTypes.CHANGE_LAYERS_STACK,
      payload: {
        operation
      }
    }
  },
  setLayersAlignment(alignmentType: LayerAlignmentTypes) {
    return {
      type: ActionTypes.SET_LAYERS_ALIGNMENT,
      payload: {
        alignmentType
      }
    }
  },

  selectLayer(layerId: number, selected: boolean, exclusive: boolean) {
    return {
      type: ActionTypes.SELECT_LAYER,
      payload: {
        layerId,
        selected,
        exclusive
      }
    }
  },

  clearLayersSelection() {
    return {
      type: ActionTypes.CLEAR_LAYERS_SELECTION,
      payload: {}
    }
  },

  clearEditorBaselines() {
    return {
      type: ActionTypes.CLEAR_EDITOR_BASELINES,
      payload: {}
    }
  },
  showEditorBaselines(baselines: IBaseline[]) {
    return {
      type: ActionTypes.SHOW_EDITOR_BASELINES,
      payload: {
        baselines
      }
    }
  },

  copySlideLayers() {
    return {
      type: ActionTypes.COPY_SLIDE_LAYERS,
      payload: {}
    }
  },
  slideLayersCopied(layers: ILayerFormed[]) {
    return {
      type: ActionTypes.COPY_SLIDE_LAYERS_SUCCESS,
      payload: {
        layers
      }
    }
  },

  pasteSlideLayers() {
    return {
      type: ActionTypes.PASTE_SLIDE_LAYERS,
      payload: {}
    }
  },

  undoOperation(currentState) {
    return {
      type: ActionTypes.UNDO_OPERATION,
      payload: {
        currentState
      }
    }
  },
  undoOperationDone() {
    return {
      type: ActionTypes.UNDO_OPERATION_SUCCESS,
      payload: {}
    }
  },
  undoOperationFail() {
    return {
      type: ActionTypes.UNDO_OPERATION_FAILURE,
      payload: {}
    }
  },
  redoOperation(nextState) {
    return {
      type: ActionTypes.REDO_OPERATION,
      payload: {
        nextState
      }
    }
  },
  redoOperationDone() {
    return {
      type: ActionTypes.REDO_OPERATION_SUCCESS,
      payload: {}
    }
  },
  redoOperationFail() {
    return {
      type: ActionTypes.REDO_OPERATION_FAILURE,
      payload: {}
    }
  },

  addSlideLayers(
    displayId: number,
    slideId: number,
    layers: Array<Omit<ILayerFormed, 'id'>>,
    widgets?: IWidgetFormed[]
  ) {
    return {
      type: ActionTypes.ADD_SLIDE_LAYERS,
      payload: {
        displayId,
        slideId,
        layers,
        widgets
      }
    }
  },
  slideLayersAdded(
    slideId: number,
    layers: ILayerFormed[],
    widgets: IWidgetFormed[]
  ) {
    return {
      type: ActionTypes.ADD_SLIDE_LAYERS_SUCCESS,
      payload: {
        slideId,
        layers,
        widgets
      }
    }
  },
  addSlideLayersFail() {
    return {
      type: ActionTypes.ADD_SLIDE_LAYERS_FAILURE,
      payload: {}
    }
  },

  editSlideLayers(displayId: number, slideId: number, layers: ILayerFormed[]) {
    return {
      type: ActionTypes.EDIT_SLIDE_LAYERS,
      payload: {
        displayId,
        slideId,
        layers
      }
    }
  },
  slideLayersEdited(slideId: number, layers: ILayerFormed[]) {
    return {
      type: ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS,
      payload: {
        slideId,
        layers
      }
    }
  },
  editSlideLayersFail() {
    return {
      type: ActionTypes.EDIT_SLIDE_LAYERS_FAILURE,
      payload: {}
    }
  },
  editSlideLayerParams(layerId: number, changedParams: Partial<ILayerParams>) {
    return {
      type: ActionTypes.EDIT_SLIDE_LAYER_PARAMS,
      payload: {
        layerId,
        changedParams
      }
    }
  },

  deleteSlideLayers(displayId: number, slideId: number) {
    return {
      type: ActionTypes.DELETE_SLIDE_LAYERS,
      payload: {
        displayId,
        slideId
      }
    }
  },
  slideLayersDeleted(slideId: number, layerIds: number[]) {
    return {
      type: ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS,
      payload: {
        slideId,
        layerIds
      }
    }
  },
  deleteSlideLayersFail() {
    return {
      type: ActionTypes.DELETE_SLIDE_LAYERS_FAILURE,
      payload: {}
    }
  },

  loadDisplayShareLink(id: number, authName: string) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK,
      payload: {
        id,
        authName
      }
    }
  },

  displayShareLinkLoaded(shareInfo: string) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS,
      payload: {
        shareInfo
      }
    }
  },

  displaySecretLinkLoaded(secretInfo: string) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SECRET_LINK_SUCCESS,
      payload: {
        secretInfo
      }
    }
  },

  loadDisplayShareLinkFail() {
    return {
      type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE,
      payload: {}
    }
  },

  resetDisplayState() {
    return {
      type: ActionTypes.RESET_DISPLAY_STATE,
      payload: {}
    }
  },

  monitoredSyncDataAction() {
    return {
      type: ActionTypes.MONITORED_SYNC_DATA_ACTION,
      payload: {}
    }
  },

  monitoredSearchDataAction() {
    return {
      type: ActionTypes.MONITORED_SEARCH_DATA_ACTION,
      payload: {}
    }
  },

  monitoredLinkageDataAction() {
    return {
      type: ActionTypes.MONITORED_LINKAGE_DATA_ACTION,
      payload: {}
    }
  }
}

const mockAction = returnType(DisplayActions)
export type DisplayActionType = typeof mockAction

export default DisplayActions
