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

import produce from 'immer'
import undoable, { includeAction } from 'redux-undo'

import { ActionTypes } from './constants'
import { GraphTypes } from './components/util'
import { ActionTypes as ViewActionTypes } from '../View/constants'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

const initialState = {
  displays: [],
  currentDisplay: null,
  currentDisplayLoading: false,
  currentDisplayShareInfo: '',
  currentDisplaySecretInfo: '',
  currentSlide: null,
  currentSlideLoading: false,
  currentDisplaySelectOptions: {},

  currentLayers: [],
  currentLayersInfo: {},
  currentLayersOperationInfo: {},

  displayLoading: false,
  clipboardLayers: [],
  lastOperationType: '',
  lastLayers: [],

  currentProject: null,
  editorBaselines: [],

  currentDisplayShareInfoLoading: false
}

const displayReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_DISPLAYS_SUCCESS:
        draft.displays = action.payload.displays
        break

      case ActionTypes.LOAD_DISPLAYS_FAILURE:
        break

      case ActionTypes.ADD_DISPLAY:
        draft.displayLoading = true
        break

      case ActionTypes.ADD_DISPLAY_SUCCESS:
        draft.displays.unshift(action.payload.result)
        draft.displayLoading = false
        break

      case ActionTypes.ADD_DISPLAY_FAILURE:
        draft.displayLoading = false
        break

      case ActionTypes.EDIT_DISPLAY:
        draft.displayLoading = true
        break

      case ActionTypes.EDIT_DISPLAY_SUCCESS:
        draft.displays = draft.displays.splice(draft.displays.findIndex(({ id }) => id === action.payload.result.id), 1, action.payload.result)
        break

      case ActionTypes.EDIT_DISPLAY_FAILURE:
        draft.displayLoading = false
        break

      case ActionTypes.EDIT_CURRENT_DISPLAY:
        draft.currentDisplayLoading = true
        break

      case ActionTypes.EDIT_CURRENT_DISPLAY_SUCCESS:
        draft.currentDisplay = action.payload.result
        draft.currentDisplayLoading = false
        break

      case ActionTypes.EDIT_CURRENT_DISPLAY_FAILURE:
        draft.currentDisplayLoading = false
        break

      case ActionTypes.EDIT_CURRENT_SLIDE:
        draft.currentSlideLoading = true
        break

      case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
        draft.lastOperationType = ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS
        draft.currentSlide = action.payload.result
        draft.currentSlideLoading = false
        break

      case ActionTypes.EDIT_CURRENT_SLIDE_FAILURE:
        draft.currentSlideLoading = false
        break

      case ActionTypes.LOAD_DISPLAY_DETAIL:
        draft.currentDisplayLoading = true
        draft.currentDisplayShareInfo = ''
        draft.currentDisplaySecretInfo = ''
        break

      case ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
        draft.currentDisplayLoading = false
        draft.currentDisplay = action.payload.display
        draft.currentDisplaySelectOptions = {}
        draft.currentSlide = action.payload.slide
        draft.currentLayers = action.payload.layers || []
        draft.currentLayersInfo = (action.payload.layers || []).reduce((obj, layer) => {
          obj[layer.id] = (layer.type === GraphTypes.Chart) ? {
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {}
            },
            interactId: '',
            rendered: false,
            renderType: 'rerender'
          } : {
            loading: false,
            datasource: { resultList: [] }
          }
          return obj
        }, {})
        draft.currentLayersOperationInfo = (action.payload.layers || []).reduce((obj, layer) => {
          obj[layer.id] = {
            selected: false,
            dragging: false,
            resizing: false
          }
          return obj
        }, {})
        draft.editorBaselines = []
        break

      case ActionTypes.LOAD_DISPLAY_DETAIL_FAILURE:
        draft.currentDisplayLoading = false
        draft.currentDisplay = null
        break

      case ActionTypes.DELETE_DISPLAY_SUCCESS:
        draft.displays = draft.displays.filter((d) => d.id !== action.payload.id)
        break

      case ActionTypes.DELETE_DISPLAY_FAILURE:
        break

      case ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS:
        draft.lastOperationType = ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS
        draft.lastLayers = action.payload.result
        draft.currentLayers = draft.currentLayers.concat(action.payload.result)
        action.payload.result.forEach((layer) => {
          draft.currentLayersInfo[layer.id] = (layer.type === GraphTypes.Chart) ? {
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {}
            },
            interactId: '',
            rendered: false,
            renderType: 'rerender'
          } : {
            datasource: { resultList: [] },
            loading: false
          }

          draft.currentLayersOperationInfo[layer.id] = {
            selected: false,
            resizing: false,
            dragging: false
          }
        })
        break

      case ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS:
        draft.lastOperationType = ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS
        draft.lastLayers = draft.currentLayers.filter((layer) => action.payload.ids.indexOf(layer.id.toString()) >= 0)
        draft.currentLayers = draft.currentLayers.filter((layer) => action.payload.ids.indexOf(layer.id.toString()) < 0)
        action.payload.ids.forEach((id) => {
          delete draft.currentLayersInfo[id]
          delete draft.currentLayersOperationInfo[id]
        })
        break

      case ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS:
        const lastLayers = []
        action.payload.result.forEach((layer) => {
          lastLayers.push(draft.currentLayers.find((l) => l.id === layer.id))
          draft.currentLayers.splice(draft.currentLayers.findIndex((l) => l.id === layer.id), 1, layer)
        })
        draft.lastOperationType = ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS
        draft.lastLayers = lastLayers
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
        if (action.payload.vizType === 'display') {
          const layerInfo = draft.currentLayersInfo[action.payload.itemId]
          layerInfo.loading = true
          layerInfo.queryConditions = {
            tempFilters: action.payload.requestParams.tempFilters,
            linkageFilters: action.payload.requestParams.linkageFilters,
            globalFilters: action.payload.requestParams.globalFilters,
            variables: action.payload.requestParams.variables,
            linkageVariables: action.payload.requestParams.linkageVariables,
            globalVariables: action.payload.requestParams.globalVariables
          }
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS:
        if (action.payload.vizType === 'display') {
          fieldGroupedSort(action.payload.result.resultList, action.payload.requestParams.customOrders)
          const layerInfo = draft.currentLayersInfo[action.payload.itemId]
          layerInfo.loading = false
          layerInfo.datasource = action.payload.result
          layerInfo.renderType = action.payload.renderType
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE:
        if (action.payload.vizType === 'display') {
          draft.currentLayersInfo[action.payload.layerId].loading = false
        }
        break

      case ActionTypes.DRAG_SELECT_LAYER:
        draft.currentLayers.forEach((layer) => {
          if (!draft.currentLayersOperationInfo[layer.id].selected || layer.id === action.payload.id) { return layer }
          const layerParams = JSON.parse(layer.params)
          const { positionX, positionY } = layerParams
          layerParams.positionX = positionX + action.payload.deltaX
          layerParams.positionY = positionY + action.payload.deltaY
          layer.params = JSON.stringify(layerParams)
        })
        break

      case ActionTypes.RESIZE_LAYERS:
        action.payload.layerIds.forEach((layerId) => {
          const layerInfo = draft.currentLayersInfo[layerId]
          layerInfo.renderType = 'resize'
          layerInfo.datasource = { ...layerInfo.datasource }
        })
        break

      case ActionTypes.SELECT_LAYER:
        Object.entries(draft.currentLayersOperationInfo).forEach(([id, layerOperationInfo]: [string, any]) => {
          if (action.payload.selected && action.payload.exclusive) {
            layerOperationInfo.selected = false
          }
          if (id === action.payload.id.toString) {
            layerOperationInfo.selected = action.payload.selected
          }
        })
        break

      case ActionTypes.CLEAR_LAYERS_SELECTION:
        Object.values(draft.currentLayersOperationInfo).forEach((layerOperationInfo: any) => {
          layerOperationInfo.selected = false
        })
        break

      case ActionTypes.TOGGLE_LAYERS_RESIZING_STATUS:
        action.payload.layerIds.forEach((layerId) => {
          draft.currentLayersOperationInfo[layerId].resizing = action.payload.resizing
        })
        break

      case ActionTypes.TOGGLE_LAYERS_DRAGGING_STATUS:
        action.payload.layerIds.forEach((layerId) => {
          draft.currentLayersOperationInfo[layerId].dragging = action.payload.dragging
        })
        break

      case ActionTypes.CLEAR_EDITOR_BASELINES:
        draft.editorBaselines = []
        break

      case ActionTypes.SHOW_EDITOR_BASELINES:
        draft.editorBaselines = action.payload.baselines
        break

      case ActionTypes.COPY_SLIDE_LAYERS:
        draft.clipboardLayers = action.payload.layers
        break

      case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
        draft.lastOperationType = ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS
        draft.lastLayers = action.payload.result
        draft.currentLayers = draft.currentLayers.concat(action.payload.result)
        action.payload.result.forEach((layer) => {
          draft.currentLayersInfo[layer.id] = (layer.type === GraphTypes.Chart) ? {
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: [],
              pagination: {}
            },
            interactId: '',
            rendered: false,
            renderType: 'rerender'
          } : {
            datasource: { resultList: [] },
            loading: false
          }

          draft.currentLayersOperationInfo[layer.id] = {
            selected: false,
            resizing: false,
            dragging: false
          }
        })
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK:
        draft.currentDisplayShareInfoLoading = true
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS:
        draft.currentDisplayShareInfo = action.payload.shareInfo
        draft.currentDisplayShareInfoLoading = false
        break

      case ActionTypes.LOAD_DISPLAY_SECRET_LINK_SUCCESS:
        draft.currentDisplaySecretInfo = action.payload.secretInfo
        draft.currentDisplayShareInfoLoading = false
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE:
        draft.currentDisplayShareInfoLoading = false
        break

      case ActionTypes.LOAD_CURRENT_PROJECT_SUCCESS:
        draft.currentProject = action.payload.result
        break

      case ActionTypes.RESET_DISPLAY_STATE:
        return initialState
    }
  })

const undoableDisplayReducer = undoable(displayReducer, {
  initTypes: [ActionTypes.LOAD_DISPLAY_DETAIL],
  ignoreInitialState: true,
  filter: includeAction([
    ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS,
    ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS,
    ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS
  ]),
  undoType: ActionTypes.UNDO_OPERATION_SUCCESS,
  redoType: ActionTypes.REDO_OPERATION_SUCCESS
})

export default undoableDisplayReducer
