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

import { GraphTypes } from 'containers/Display/constants'
import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'
import { DashboardItemStatus } from '../Dashboard/constants'

export const initialState = {
  title: '',
  display: null,
  slidesLayers: [],
  slideLayersInfo: {},
  widgets: {},
  formedViews: {}
}

const displayReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS:
        draft.title = action.payload.display.name
        draft.display = action.payload.display
        draft.slidesLayers = action.payload.slides
        draft.widgets = action.payload.widgets.reduce((obj, w) => {
          obj[w.id] = w
          return obj
        }, {})
        draft.formedViews = action.payload.formedViews
        draft.slideLayersInfo = action.payload.slides.reduce(
          (obj, slide, idx) => {
            obj[idx + 1] = slide.relations.reduce((info, layer) => {
              info[layer.id] =
                layer.type === GraphTypes.Chart
                  ? {
                      status: DashboardItemStatus.Pending,
                      datasource: { resultList: [] },
                      loading: false,
                      queryConditions: {
                        tempFilters: [],  // @TODO combine widget static filters with local filters
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
              return info
            }, {})
            return obj
          },
          {}
        )
        break

      case ActionTypes.LOAD_SHARE_DISPLAY_FAILURE:
        draft.display = null
        draft.slidesLayers = null
        draft.widgets = {}
        draft.slideLayersInfo = {}
        break

      case ActionTypes.LOAD_LAYER_DATA:
        draft.slideLayersInfo[action.payload.slideNumber][
          action.payload.layerId
        ].loading = true
        break

      case ActionTypes.LOAD_LAYER_DATA_SUCCESS:
        fieldGroupedSort(
          action.payload.data.resultList,
          action.payload.requestParams.customOrders
        )
        draft.slideLayersInfo[action.payload.slideNumber][
          action.payload.layerId
        ] = {
          ...draft.slideLayersInfo[action.payload.slideNumber][
            action.payload.layerId
          ],
          status: DashboardItemStatus.Fulfilled,
          loading: false,
          datasource: action.payload.data,
          renderType: action.payload.renderType
        }
        break

      case ActionTypes.LOAD_LAYER_DATA_FAILURE:
        draft.slideLayersInfo[action.payload.slideNumber][
          action.payload.layerId
        ] = {
          ...draft.slideLayersInfo[action.payload.slideNumber][
            action.payload.layerId
          ],
          status: DashboardItemStatus.Error,
          loading: false
        }
        break
    }
  })

export default displayReducer
