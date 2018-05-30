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
import {
  ActionTypes
} from './constants'

import {
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
  LOAD_BIZDATAS_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS
} from '../Bizlogic/constants'

const initialState = fromJS({
  displays: [],
  editingLayers: [],
  layersStatus: {},
  currentDatasources: null,
  currentItemsLoading: null,
  currentItemsQueryParams: null
})

function displayReducer (state = initialState, action) {
  const { type, payload } = action

  const editingLayers = state.get('editingLayers')

  const datasources = state.get('currentDatasources')
  const itemsLoading = state.get('currentItemsLoading')
  const queryParams = state.get('currentItemQueryParams')

  const layersStatus = state.get('layersStatus')

  switch (action.type) {
    case ActionTypes.LOAD_DISPLAYS:
      return state
    case ActionTypes.LOAD_DISPLAYS_SUCCESS:
      return state.set('displays', payload.displays)
    case ActionTypes.SELECT_WIDGET_LAYERS:
      return state.set('editingLayers', editingLayers.concat(payload.layers))
    case ActionTypes.ADD_SECONDARY_GRAPH_LAYER:
      return state.set('editingLayers', editingLayers.concat(payload.layer))
    case ActionTypes.DELETE_LAYERS:
      return state
        .set('layerStatus', Object.keys(layersStatus).reduce((acc, key) => {
          if (payload.ids.indexOf(key) < 0) {
            acc[key] = layersStatus[key]
          }
          return acc
        }, {}))
        .set('editingLayers', editingLayers.filter((layer) => payload.ids.indexOf(layer.id) < 0))

    case LOAD_BIZDATAS_FROM_ITEM:
      return state
        .set('currentItemsLoading', {
          ...itemsLoading,
          [payload.itemId]: true
        })
        .set('currentItemsQueryParams', {
          ...queryParams,
          [payload.itemId]: {
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
        .set('currentItemsLoading', {
          ...itemsLoading,
          [payload.itemId]: false
        })
        .set('currentDatasources', {
          ...datasources,
          [payload.itemId]: payload.bizdatas
        })
    case LOAD_BIZDATAS_FROM_ITEM_FAILURE:
      return state.set('currentItemsLoading', {
        ...itemsLoading,
        [payload.itemId]: false
      })

    case ActionTypes.UPDATE_LAYER_SELECTION_STATUS:
      return state.set('layersStatus', {
        ...layersStatus,
        [payload.id]: payload.selected
      })

    default:
      return state
  }
}

export default displayReducer
