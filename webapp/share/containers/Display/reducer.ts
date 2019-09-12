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
import { GraphTypes } from '../../../app/containers/Display/components/util'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

const initialState = fromJS({
  title: '',
  display: null,
  slide: null,
  layers: [],
  layersInfo: {},
  widgets: []
})

function displayReducer (state = initialState, { type, payload }) {
  const layersInfo = state.get('layersInfo')

  switch (type) {
    case ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS:
      return state
        .set('title', payload.display.name)
        .set('display', payload.display)
        .set('slide', payload.slide)
        .set('layers', payload.slide.relations)
        .set('widgets', payload.widgets)
        .set('layersInfo', payload.slide.relations.reduce((obj, layer) => {
          obj[layer.id] = (layer.type === GraphTypes.Chart) ? {
            datasource: { resultList: [] },
            loading: false,
            queryConditions: {
              tempFilters: [],
              linkageFilters: [],
              globalFilters: [],
              variables: [],
              linkageVariables: [],
              globalVariables: []
            },
            interactId: '',
            renderType: 'rerender'
          } : {
            loading: false
          }
          return obj
        }, {}))
    case ActionTypes.LOAD_SHARE_DISPLAY_FAILURE:
      return state
        .set('display', null)
        .set('slide', null)
        .set('layers', [])
        .set('widgets', [])
        .set('layersInfo', {})
    case ActionTypes.LOAD_LAYER_DATA:
      return state
        .set('layersInfo', {
          ...layersInfo,
          [payload.layerId]: {
            ...layersInfo[payload.layerId],
            loading: true
          }
        })
    case ActionTypes.LOAD_LAYER_DATA_SUCCESS:
      fieldGroupedSort(payload.data.resultList, payload.requestParams.customOrders)
      return state
        .set('layersInfo', {
          ...layersInfo,
          [payload.layerId]: {
            ...layersInfo[payload.layerId],
            loading: false,
            datasource: payload.data,
            renderType: payload.renderType
          }
        })
    case ActionTypes.LOAD_LAYER_DATA_FAILURE:
      return state
        .set('loadings', {
          ...layersInfo,
          [payload.layerId]: {
            ...layersInfo[payload.layerId],
            loading: false
          }
        })
    default:
        return state
  }
}

export default displayReducer
