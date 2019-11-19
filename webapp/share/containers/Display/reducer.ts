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
import { ActionTypes } from './constants'
import { GraphTypes } from 'containers/Display/components/util'

import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'
import { DashboardItemStatus } from '../Dashboard'

const initialState = {
  title: '',
  display: null,
  slide: null,
  layers: [],
  layersInfo: {},
  widgets: []
}

const displayReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS:
        draft.title = action.payload.display.name
        draft.display = action.payload.display
        draft.slide = action.payload.slide
        draft.layers = action.payload.slide.relations
        draft.widgets = action.payload.widgets
        draft.layersInfo = action.payload.slide.relations.reduce(
          (obj, layer) => {
            obj[layer.id] =
              layer.type === GraphTypes.Chart
                ? {
                    status: DashboardItemStatus.Initial,
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
                  }
                : {
                    loading: false
                  }
            return obj
          },
          {}
        )
        break

      case ActionTypes.LOAD_SHARE_DISPLAY_FAILURE:
        draft.display = null
        draft.slide = null
        draft.layers = []
        draft.widgets = []
        draft.layersInfo = {}
        break

      case ActionTypes.LOAD_LAYER_DATA:
        draft.layersInfo[action.payload.layerId].loading = true
        break

      case ActionTypes.LOAD_LAYER_DATA_SUCCESS:
        fieldGroupedSort(
          action.payload.data.resultList,
          action.payload.requestParams.customOrders
        )
        draft.layersInfo[action.payload.layerId] = {
          ...draft.layersInfo[action.payload.layerId],
          status: DashboardItemStatus.Fulfilled,
          loading: false,
          datasource: action.payload.data,
          renderType: action.payload.renderType
        }
        break

      case ActionTypes.LOAD_LAYER_DATA_FAILURE:
        draft.layersInfo[action.payload.layerId] = {
          ...draft.layersInfo[action.payload.layerId],
          status: DashboardItemStatus.Error,
          loading: false
        }
        break
    }
  })

export default displayReducer
