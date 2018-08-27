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
import { ActionTypes } from './constants'
import { GraphTypes } from 'utils/util'

const initialState = fromJS({
  title: '',
  display: null,
  slide: null,
  layers: [],
  widgets: [],
  datasources: {},
  loadings: {},
  layersQueryParams: {}
})

function displayReducer (state = initialState, { type, payload }) {
  const datasources = state.get('datasources')
  const loadings = state.get('loadings')

  switch (type) {
    case ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS:
      return state
        .set('title', payload.display.name)
        .set('display', payload.display)
        .set('slide', payload.slide)
        .set('layers', payload.slide.relations)
        .set('widgets', payload.widgets)
        .set('datasources', {})
        .set('loadings', {})
        .set('layersQueryParams', payload.slide.relations.reduce((obj, layer) => {
          if (layer.type === GraphTypes.Chart) {
            obj[layer.id] = {
              filters: '',
              linkageFilters: '',
              globalFilters: '',
              params: [],
              linkageParams: [],
              globalParams: [],
              pagination: {}
            }
          }
          return obj
        }, {}))
    case ActionTypes.LOAD_SHARE_DISPLAY_FAILURE:
      return state
        .set('display', null)
        .set('slide', null)
        .set('layers', [])
        .set('widgets', [])
        .set('datasources', {})
    case ActionTypes.LOAD_LAYER_DATA:
      return state
        .set('loadings', {
          ...loadings,
          [payload.layerId]: true
        })
    case ActionTypes.LOAD_LAYER_DATA_SUCCESS:
      return state
        .set('datasources', {
          ...datasources,
          [payload.layerId]: payload.data
        })
        .set('loadings', {
          ...loadings,
          [payload.layerId]: false
        })
    case ActionTypes.LOAD_LAYER_DATA_FAILURE:
      return state
        .set('loadings', {
          ...loadings,
          [payload.layerId]: false
        })
    default:
        return state
  }
}

export default displayReducer
