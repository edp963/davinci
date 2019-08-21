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

import { fromJS } from 'immutable'
import undoable, { includeAction } from 'redux-undo'

import { ActionTypes } from './constants'
import { GraphTypes } from './components/util'
import { ActionTypes as ViewActionTypes } from '../View/constants'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

const emptyDisplayState = {
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
  editorBaselines: []
}

const initialState = fromJS(emptyDisplayState)

function displayReducer (state = initialState, action) {
  const { type, payload } = action

  const displays = state.get('displays')
  const displaySelectOptions = state.get('currentDisplaySelectOptions')
  const layers = state.get('currentLayers')
  const layersInfo = state.get('currentLayersInfo')
  const layersOperationInfo = state.get('currentLayersOperationInfo')

  switch (type) {
    case ActionTypes.LOAD_DISPLAYS_SUCCESS:
      return state.set('displays', payload.displays)
    case ActionTypes.LOAD_DISPLAYS_FAILURE:
      return state

    case ActionTypes.ADD_DISPLAY:
      return state.set('displayLoading', true)
    case ActionTypes.ADD_DISPLAY_SUCCESS:
      return state
        .set('displays', [payload.result, ...displays])
        .set('displayLoading', false)
    case ActionTypes.ADD_DISPLAY_FAILURE:
      return state.set('displayLoading', false)

    case ActionTypes.EDIT_DISPLAY:
      return state.set('displayLoading', true)
    case ActionTypes.EDIT_DISPLAY_SUCCESS:
      return state.set('displays', displays.map((d) => (
        (d.id === payload.result.id) ? payload.result : d
      )))
    case ActionTypes.EDIT_DISPLAY_FAILURE:
    return state.set('displayLoading', false)

    case ActionTypes.EDIT_CURRENT_DISPLAY:
      return state.set('currentDisplayLoading', true)
    case ActionTypes.EDIT_CURRENT_DISPLAY_SUCCESS:
      return state
        .set('currentDisplay', payload.result)
        .set('currentDisplayLoading', false)
    case ActionTypes.EDIT_CURRENT_DISPLAY_FAILURE:
      return state.set('currentDisplayLoading', false)

    case ActionTypes.EDIT_CURRENT_SLIDE:
      return state.set('currentSlideLoading', true)
    case ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS)
        .set('currentSlide', payload.result)
        .set('currentSlideLoading', false)
    case ActionTypes.EDIT_CURRENT_SLIDE_FAILURE:
      return state.set('currentSlideLoading', false)

    case ActionTypes.LOAD_DISPLAY_DETAIL:
      return state
        .set('currentDisplayLoading', true)
        .set('currentDisplayShareInfo', '')
        .set('currentDisplaySecretInfo', '')
    case ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
      return state
        .set('currentDisplayLoading', false)
        .set('currentDisplay', payload.display)
        .set('currentDisplaySelectOptions', {})
        .set('currentSlide', payload.slide)
        .set('currentLayers', payload.layers || [])
        .set('currentLayersInfo', (payload.layers || []).reduce((obj, layer) => {
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
        }, {}))
        .set('currentLayersOperationInfo', (payload.layers || []).reduce((obj, layer) => {
          obj[layer.id] = {
            selected: false,
            dragging: false,
            resizing: false
          }
          return obj
        }, {}))
        .set('editorBaselines', [])
    case ActionTypes.LOAD_DISPLAY_DETAIL_FAILURE:
      return state
        .set('currentDisplayLoading', false)
        .set('currentDisplay', null)

    case ActionTypes.DELETE_DISPLAY_SUCCESS:
      return state.set('displays', displays.filter((d) => d.id !== payload.id))
    case ActionTypes.DELETE_DISPLAY_FAILURE:
      return state

    case ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', [...payload.result])
        .set('currentLayers', [...layers, ...payload.result])
        .set('currentLayersInfo', {
          ...layersInfo,
          ...payload.result.reduce((obj, layer) => {
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
              datasource: { resultList: [] },
              loading: false
            }
            return obj
          }, {})
        })
        .set('currentLayersOperationInfo', {
          ...layersOperationInfo,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {
              selected: false,
              resizing: false,
              dragging: false
            }
            return obj
          }, {})
        })
    case ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', layers.filter((layer) => payload.ids.indexOf(layer.id.toString()) >= 0))
        .set('currentLayers', layers.filter((layer) => payload.ids.indexOf(layer.id.toString()) < 0))
        .set('currentLayersInfo', Object.entries(layersInfo).reduce((acc, [id, value]) => (
          payload.ids.indexOf(id) >= 0 ? acc : {
            ...acc,
            [id]: value
          }
        ), {}))
        .set('currentLayersOperationInfo', Object.entries(layersOperationInfo).reduce((acc, [id, value]) => (
          payload.ids.indexOf(id) >= 0 ? acc : {
            ...acc,
            [id]: value
          }
        ), {}))
    case ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS:
      const copyLayers = fromJS(layers).toJS()
      const lastLayers = []
      payload.result.forEach((layer) => {
        lastLayers.push(copyLayers.find((l) => l.id === layer.id))
        copyLayers.splice(copyLayers.findIndex((l) => l.id === layer.id), 1, layer)
      })
      return state
        .set('lastOperationType', ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', lastLayers)
        .set('currentLayers', copyLayers)

    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
      return payload.vizType !== 'display' ? state : state
        .set('currentLayersInfo', {
          ...layersInfo,
          [payload.itemId]: {
            ...layersInfo[payload.itemId],
            loading: true,
            queryConditions: {
              tempFilters: payload.requestParams.tempFilters,
              linkageFilters: payload.requestParams.linkageFilters,
              globalFilters: payload.requestParams.globalFilters,
              variables: payload.requestParams.variables,
              linkageVariables: payload.requestParams.linkageVariables,
              globalVariables: payload.requestParams.globalVariables
            }
          }
        })
    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS:
      fieldGroupedSort(payload.result.resultList, payload.requestParams.customOrders)
      return payload.vizType !== 'display' ? state : state
        .set('currentLayersInfo', {
          ...layersInfo,
          [payload.itemId]: {
            ...layersInfo[payload.itemId],
            loading: false,
            datasource: payload.result,
            renderType: payload.renderType
          }
        })
    case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE:
      return payload.vizType !== 'display' ? state : state.set('currentLayersInfo', {
        ...layersInfo,
        [payload.layerId]: {
          ...layersInfo[payload.layerId],
          loading: false
        }
      })

    case ActionTypes.DRAG_SELECT_LAYER:
      return state.set('currentLayers', layers.map((layer) => {
        if (!layersOperationInfo[layer.id].selected || layer.id === payload.id) { return layer }
        const layerParams = JSON.parse(layer.params)
        const { positionX, positionY } = layerParams
        return {
          ...layer,
          params: JSON.stringify({
            ...layerParams,
            positionX: positionX + payload.deltaX,
            positionY: positionY + payload.deltaY
          })
        }
      }))
    case ActionTypes.RESIZE_LAYERS:
      return state.set('currentLayersInfo',
        Object.entries(layersInfo).reduce((obj, [key, prop]: [string, any]) => {
          if (payload.layerIds.indexOf(+key) >= 0) {
            obj[key] = {
              ...prop,
              renderType: 'resize',
              datasource: {...prop.datasource}
            }
          } else {
            obj[key] = prop
          }
          return obj
        }, {}))
    case ActionTypes.SELECT_LAYER:
      return state.set('currentLayersOperationInfo', Object.entries(layersOperationInfo).reduce((acc, [id, value]: [string, any]) => {
        let selected = value.selected
        if (payload.selected && payload.exclusive) {
          selected = false
        }
        if (id === payload.id.toString()) {
          selected = payload.selected
        }
        return {
          ...acc,
          [id]: {
            ...value,
            selected
          }
        }
      }, {}))
    case ActionTypes.CLEAR_LAYERS_SELECTION:
      return state.set('currentLayersOperationInfo', Object.entries(layersOperationInfo).reduce((acc, [id, value]) => (
        {
          ...acc,
          [id]: {
            ...value,
            selected: false
          }
        }
      ), {}))

    case ActionTypes.TOGGLE_LAYERS_RESIZING_STATUS:
      return state.set('currentLayersOperationInfo', payload.layerIds.reduce((acc, layerId) => ({
        ...acc,
        [layerId]: {
          ...acc[layerId],
          resizing: payload.resizing
        }
      }), layersOperationInfo))
    case ActionTypes.TOGGLE_LAYERS_DRAGGING_STATUS:
      return state.set('currentLayersOperationInfo', payload.layerIds.reduce((acc, layerId) => ({
        ...acc,
        [layerId]: {
          ...acc[layerId],
          dragging: payload.dragging
        }
      }), layersOperationInfo))
    case ActionTypes.CLEAR_EDITOR_BASELINES:
      return state.set('editorBaselines', [])
    case ActionTypes.SHOW_EDITOR_BASELINES:
      return state.set('editorBaselines', payload.baselines)

    case ActionTypes.COPY_SLIDE_LAYERS:
      return state.set('clipboardLayers', payload.layers)
    case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS)
        .set('lastLayers', [...payload.result])
        .set('currentLayers', [...layers, ...payload.result])
        .set('currentLayersInfo', {
          ...layersInfo,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = (layer.type === GraphTypes.Chart) ? {
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
            return obj
          }, {})
        })
        .set('currentLayersOperationInfo', {
          ...layersOperationInfo,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {
              selected: false,
              resizing: false,
              dragging: false
            }
            return obj
          }, {})
        })

    case ActionTypes.LOAD_DISPLAY_SHARE_LINK:
      return state.set('currentDisplayShareInfoLoading', true)
    case ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS:
      return state
        .set('currentDisplayShareInfo', payload.shareInfo)
        .set('currentDisplayShareInfoLoading', false)
    case ActionTypes.LOAD_DISPLAY_SECRET_LINK_SUCCESS:
      return state
        .set('currentDisplaySecretInfo', payload.secretInfo)
        .set('currentDisplayShareInfoLoading', false)
    case ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE:
      return state.set('currentDisplayShareInfoLoading', false)
    case ActionTypes.LOAD_CURRENT_PROJECT_SUCCESS:
      return state
        .set('currentProject', payload.result)
    case ActionTypes.RESET_DISPLAY_STATE:
      return fromJS(emptyDisplayState)
    default:
      return state
  }
}

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
