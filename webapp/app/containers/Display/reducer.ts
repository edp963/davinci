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
import { GraphTypes } from 'utils/util'
import {
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
  LOAD_BIZDATAS_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS
} from '../Bizlogic/constants'

const initialState = fromJS({
  displays: [],
  currentDisplay: null,
  currentDisplayLoading: false,
  currentDisplayShareInfo: '',
  currentDisplaySecretInfo: '',
  currentSlide: null,
  currentSlideLoading: false,
  currentDisplayCascadeSources: {},
  currentLayers: [],
  currentLayersStatus: {},
  clipboardLayers: [],

  currentDatasources: {},
  currentLayersLoading: {},
  currentLayersQueryParams: {},
  currentLayersCascadeSources: {},

  lastOperationType: '',
  lastLayers: []
})

function displayReducer (state = initialState, action) {
  const { type, payload } = action

  const displays = state.get('displays')
  const displayCascadeSources = state.get('currentDisplayCascadeSources')
  const currentDisplay = state.get('currentDisplay')
  const currentLayers = state.get('currentLayers')

  const datasources = state.get('currentDatasources')
  const layersLoading = state.get('currentLayersLoading')
  const queryParams = state.get('currentLayersQueryParams')
  const layersCascadeSources = state.get('currentLayersCascadeSources')

  const layersStatus = state.get('currentLayersStatus')

  switch (type) {
    case ActionTypes.LOAD_DISPLAYS_SUCCESS:
      return state.set('displays', payload.displays)
    case ActionTypes.LOAD_DISPLAYS_FAILURE:
      return state

    case ActionTypes.ADD_DISPLAY_SUCCESS:
        displays.unshift(payload.result)
        return state.set('displays', displays.slice())
    case ActionTypes.ADD_DISPLAY_FAILURE:
      return state

    case ActionTypes.EDIT_DISPLAY_SUCCESS:
      displays.splice(displays.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      return state.set('displays', displays.slice())

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
        .set('currentSlide', payload.slide)
        .set('currentLayers', payload.layers || [])
        .set('currentDatasources', {})
        .set('currentLayersLoading', {})
        .set('currentLayersQueryParams', payload.layers.reduce((obj, layer) => {
          if (layer.type !== GraphTypes.Chart) { return obj }
          obj[layer.id] = {
            filters: '',
            linkageFilters: '',
            globalFilters: '',
            params: [],
            linkageParams: [],
            globalParams: [],
            pagination: {}
          }
          return obj
        }, {}))
        .set('currentLayersCascadeSources', payload.layers.reduce((obj, layer) => {
          if (layer.type !== GraphTypes.Chart) { return obj }
          obj[layer.id] = {}
          return obj
        }, {}))
    case ActionTypes.LOAD_DISPLAY_DETAIL_FAILURE:
      return state
        .set('currentDisplayLoading', false)
        .set('currentDisplay', null)

    case ActionTypes.DELETE_DISPLAY_SUCCESS:
      return state.set('displays', displays.filter((d) => d.id !== payload.id))

    case ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', [...payload.result])
        .set('currentLayers', [...currentLayers, ...payload.result])
        .set('currentLayersLoading', {
          ...layersLoading,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = false
            return obj
          }, {})
        })
        .set('currentLayersQueryParams', {
          ...queryParams,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {
              filters: '',
              linkageFilters: '',
              globalFilters: '',
              params: [],
              linkageParams: [],
              globalParams: [],
              pagination: {}
            }
            return obj
          }, {})
        })
        .set('currentLayersCascadeSources', {
          ...layersCascadeSources,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {}
            return obj
          }, {})
        })
    case ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS:
      payload.ids.forEach((id) => {
        delete datasources[id]
        delete layersLoading[id]
        delete queryParams[id]
      })
      return state
        .set('lastOperationType', ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', currentLayers.filter((layer) => payload.ids.indexOf(layer.id.toString()) >= 0))
        .set('currentLayersStatus', Object.keys(layersStatus).reduce((acc, key) => {
          if (payload.ids.indexOf(key) < 0) {
            acc[key] = layersStatus[key]
          }
          return acc
        }, {}))
        .set('currentLayers', currentLayers.filter((layer) => payload.ids.indexOf(layer.id.toString()) < 0))
    case ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS:
      const copyLayers = fromJS(currentLayers).toJS()
      const lastLayers = []
      payload.result.forEach((layer) => {
        lastLayers.push(copyLayers.find((l) => l.id === layer.id))
        copyLayers.splice(copyLayers.findIndex((l) => l.id === layer.id), 1, layer)
      })
      return state
        .set('lastOperationType', ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS)
        .set('lastLayers', lastLayers)
        .set('currentLayers', copyLayers)

    case LOAD_BIZDATAS_FROM_ITEM:
      return state
        .set('currentLayersLoading', {
          ...layersLoading,
          [payload.layerId]: true
        })
        .set('currentLayersQueryParams', {
          ...queryParams,
          [payload.layerId]: {
            filters: payload.sql.filters,
            linkageFilters: payload.sql.linkageFilters,
            globalFilters: payload.sql.globalFilters,
            params: payload.sql.params,
            linkageParams: payload.sql.linkageParams,
            globalParams: payload.sql.globalParams,
            pagination: {
              sorts: payload.sorts,
              offset: payload.offset,
              limit: payload.limit
            }
          }
        })
    case LOAD_BIZDATAS_FROM_ITEM_SUCCESS:
      return state
        .set('currentLayersLoading', {
          ...layersLoading,
          [payload.itemId]: false
        })
        .set('currentDatasources', {
          ...datasources,
          [payload.itemId]: payload.bizdatas
        })
    case LOAD_BIZDATAS_FROM_ITEM_FAILURE:
      return state.set('currentLayersLoading', {
        ...layersLoading,
        [payload.layerId]: false
      })

    case ActionTypes.DRAG_SELECT_LAYER:
      return state.set('currentLayers', currentLayers.map((layer) => {
        if (!layersStatus[layer.id] || layer.id === payload.id) { return layer }
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
    case ActionTypes.RESIZE_SELECT_LAYER:
      return state.set('currentLayers', currentLayers.map((layer) => {
        if (!layersStatus[layer.id] || layer.id === payload.id) { return layer }
        const layerParams = JSON.parse(layer.params)
        const { width, height } = layerParams
        return {
          ...layer,
          params: JSON.stringify({
            ...layerParams,
            width: width + payload.deltaWidth,
            height: height + payload.deltaHeight
          })
        }
      }))
    case ActionTypes.SELECT_LAYER:
      if (payload.selected && payload.exclusive) {
        Object.entries(layersStatus).forEach(([key]) => layersStatus[key] = false)
      }
      return state.set('currentLayersStatus', {
        ...layersStatus,
        [payload.id]: payload.selected
      })

    case ActionTypes.COPY_SLIDE_LAYERS:
      return state.set('clipboardLayers', payload.layers)
    case ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS:
      return state
        .set('lastOperationType', ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS)
        .set('lastLayers', [...payload.result])
        .set('currentLayers', [...currentLayers, ...payload.result])
        .set('currentLayersLoading', {
          ...layersLoading,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = false
            return obj
          }, {})
        })
        .set('currentLayersQueryParams', {
          ...queryParams,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {
              filters: '',
              linkageFilters: '',
              globalFilters: '',
              params: [],
              linkageParams: [],
              globalParams: [],
              pagination: {}
            }
            return obj
          }, {})
        })
        .set('currentLayersCascadeSources', {
          ...layersCascadeSources,
          ...payload.result.reduce((obj, layer) => {
            obj[layer.id] = {}
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

    default:
      return state
  }
}

export default undoable(displayReducer, {
  filter: includeAction([
    ActionTypes.EDIT_CURRENT_SLIDE_SUCCESS,
    ActionTypes.ADD_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.EDIT_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.DELETE_DISPLAY_LAYERS_SUCCESS,
    ActionTypes.PASTE_SLIDE_LAYERS_SUCCESS
  ]),
  undoType: ActionTypes.UNDO_OPERATION_SUCCESS,
  redoType: ActionTypes.REDO_OPERATION_SUCCESS
})
