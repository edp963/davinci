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

import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router'
import { matchDisplaySlidePath } from 'utils/router'

import { ActionTypes } from './constants'
import { ActionTypes as VizActionTypes } from 'containers/Viz/constants'
import { ActionTypes as ViewActionTypes } from '../View/constants'

import { GraphTypes } from './components/constants'
import { fieldGroupedSort } from 'containers/Widget/components/Config/Sort'

import { DisplayActionType } from './actions'
import { VizActionType } from '../Viz/actions'
import { ViewActionType } from '../View/actions'

import { IDisplayState, IDisplaySharePanelState } from './types'

const defaultSharePanelState: IDisplaySharePanelState = {
  id: 0,
  type: 'display',
  title: '',
  visible: false
}

export const initialState: IDisplayState = {
  currentDisplayShareToken: '',
  currentDisplayAuthorizedShareToken: '',
  currentDisplayPasswordShareToken: '',
  currentDisplayPasswordPassword: '',
  sharePanel: defaultSharePanelState,
  currentDisplaySelectOptions: {},

  currentSlideId: 0,

  currentDisplayWidgets: {},

  slideLayers: {},
  slideLayersInfo: {},
  slideLayersOperationInfo: {},

  clipboardSlides: [],
  clipboardLayers: [],

  lastOperationType: null,
  lastLayers: [],

  editorBaselines: [],
  operateItemParams: [],

  loading: {
    shareToken: false,
    slideLayers: false
  }
}

const displayReducer = (
  state = initialState,
  action:
    | DisplayActionType
    | VizActionType
    | ViewActionType
    | LocationChangeAction
) =>
  produce(state, (draft: IDisplayState) => {
    let slideId: number
    let layerId: number

    const layersInfo = draft.slideLayersInfo[draft.currentSlideId]
    const layersOperationInfo =
      draft.slideLayersOperationInfo[draft.currentSlideId]

    switch (action.type) {
      case VizActionTypes.EDIT_SLIDES_SUCCESS:
        draft.lastOperationType = VizActionTypes.EDIT_SLIDES_SUCCESS
        break

      case ActionTypes.LOAD_SLIDE_DETAIL:
        draft.loading.slideLayers = true
        break

      case ActionTypes.LOAD_SLIDE_DETAIL_SUCCESS:
        slideId = action.payload.slideId
        if (!draft.currentSlideId) {
          draft.currentSlideId = slideId
        }
        draft.currentDisplaySelectOptions = {}
        draft.currentDisplayWidgets = action.payload.widgets.reduce(
          (obj, widget) => {
            obj[widget.id] = widget
            return obj
          },
          draft.currentDisplayWidgets
        )

        draft.slideLayers[slideId] = (action.payload.layers || []).reduce(
          (obj, layer) => {
            obj[layer.id] = layer
            return obj
          },
          {}
        )
        draft.slideLayersInfo[slideId] = (action.payload.layers || []).reduce(
          (obj, layer) => {
            obj[layer.id] =
              layer.type === GraphTypes.Chart
                ? {
                    datasource: { resultList: [] },
                    loading: false,
                    queryConditions: {
                      tempFilters: [], // @TODO combine widget static filters with local filters
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
                  }
                : {
                    loading: false,
                    datasource: { resultList: [] }
                  }
            return obj
          },
          {}
        )
        draft.slideLayersOperationInfo[slideId] = (
          action.payload.layers || []
        ).reduce((obj, layer) => {
          obj[layer.id] = {
            selected: false,
            dragging: false,
            resizing: false,
            editing: false
          }
          return obj
        }, {})
        draft.editorBaselines = []

        break

      case ActionTypes.LOAD_SLIDE_DETAIL_FAILURE:
        draft.loading.slideLayers = false
        break

      case ActionTypes.ADD_SLIDE_LAYERS_SUCCESS:
        draft.lastOperationType = ActionTypes.ADD_SLIDE_LAYERS_SUCCESS
        draft.lastLayers = action.payload.layers
        slideId = action.payload.slideId
        Object.entries(layersOperationInfo).forEach(
          ([id, layerOperationInfo]: [string, any]) => {
            draft.slideLayersOperationInfo[slideId][+id] = {
              ...layerOperationInfo,
              selected: false
            }
          }
        )
        draft.slideLayersOperationInfo[slideId] = {
          ...layersOperationInfo
        }
        action.payload.layers.forEach((layer) => {
          draft.slideLayers[slideId][layer.id] = layer
          draft.slideLayersInfo[slideId][layer.id] =
            layer.type === GraphTypes.Chart
              ? {
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
                  rendered: false,
                  renderType: 'rerender'
                }
              : {
                  datasource: { resultList: [] },
                  loading: false
                }
          draft.slideLayersOperationInfo[slideId][layer.id] = {
            selected: true,
            resizing: false,
            dragging: false,
            editing: false
          }

          if (Array.isArray(action.payload.widgets)) {
            action.payload.widgets.forEach((w) => {
              draft.currentDisplayWidgets[w.id] = w
            })
          }
        })
        break

      case ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS:
        slideId = action.payload.slideId
        draft.lastOperationType = ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS
        draft.lastLayers = action.payload.layerIds.map(
          (layerId) => draft.slideLayers[slideId][layerId]
        )
        action.payload.layerIds.forEach((id) => {
          delete draft.slideLayers[slideId][id]
          delete draft.slideLayersInfo[slideId][id]
          delete draft.slideLayersOperationInfo[slideId][id]
        })
        break

      case ActionTypes.LOAD_DISPLAY_PASSWORD_SHARE_LINK_SUCCESS:
        draft.currentDisplayPasswordShareToken = action.payload.passwordShareToken
        draft.currentDisplayPasswordPassword = action.payload.password
        draft.loading.shareToken = false
        break
      case ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS:
        slideId = action.payload.slideId
        const lastLayers = []
        action.payload.layers.forEach((layer) => {
          lastLayers.push(draft.slideLayers[slideId][layer.id])
          draft.slideLayers[slideId][layer.id] = layer
          if (draft.slideLayersInfo[slideId][layer.id].renderType) {
            draft.slideLayersInfo[slideId][layer.id].renderType = 'resize'
            draft.slideLayersInfo[slideId][layer.id].datasource = {
              ...draft.slideLayersInfo[slideId][layer.id].datasource
            }
          }
        })
        draft.lastOperationType = ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS
        draft.lastLayers = lastLayers
        break

      case ActionTypes.CHANGE_LAYER_OPERATION_INFO:
        Object.entries(layersOperationInfo).forEach(
          ([id, layerOperationInfo]: [string, any]) => {
            Object.entries(action.payload.changedInfo).forEach(
              ([type, status]: [string, boolean]) => {
                if (status) {
                  return (draft.slideLayersOperationInfo[draft.currentSlideId][
                    id
                  ] = {
                    ...layerOperationInfo,
                    [type]: +id === action.payload.layerId
                  })
                } else {
                  return (draft.slideLayersOperationInfo[draft.currentSlideId][
                    id
                  ] = {
                    ...layerOperationInfo,
                    [type]: status
                  })
                }
              }
            )
          }
        )
        draft.slideLayersOperationInfo[draft.currentSlideId] = {
          ...layersOperationInfo
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM:
        if (action.payload.vizType === 'display') {
          ;[slideId, layerId] = action.payload.itemId as [number, number]
          const layerInfo = draft.slideLayersInfo[slideId][layerId]
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
          ;[slideId, layerId] = action.payload.itemId as [number, number]
          fieldGroupedSort(
            action.payload.result.resultList,
            action.payload.requestParams.customOrders
          )
          const layerInfo = draft.slideLayersInfo[slideId][layerId]
          layerInfo.loading = false
          layerInfo.datasource = action.payload.result
          layerInfo.renderType = action.payload.renderType
        }
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM_FAILURE:
        if (action.payload.vizType === 'display') {
          ;[slideId, layerId] = action.payload.itemId as [number, number]
          if (draft.slideLayersInfo[slideId]) {
            draft.slideLayersInfo[slideId][layerId].loading = false
          }
        }
        break

      case ActionTypes.RESIZE_LAYER_ADJUSTED:
        const resizingLayerIds = action.payload.layerIds
        resizingLayerIds.forEach((layerId) => {
          if (!action.payload.finish) {
            draft.slideLayers[draft.currentSlideId][layerId].params.width +=
              action.payload.deltaSize.deltaWidth
            draft.slideLayers[draft.currentSlideId][layerId].params.height +=
              action.payload.deltaSize.deltaHeight
          }
          if (layersInfo[layerId].renderType) {
            layersInfo[layerId].renderType = 'resize'
            layersInfo[layerId].datasource = {
              ...layersInfo[layerId].datasource
            }
          }
          draft.slideLayersOperationInfo[draft.currentSlideId][
            layerId
          ].resizing = !action.payload.finish
        })
        break
      case ActionTypes.DRAG_LAYER_ADJUSTED: {
        const {
          slideSize: { width: slideWidth, height: slideHeight },
          layerIds,
          deltaPosition
        } = action.payload
        const isEmpty = draft.operateItemParams.length === 0
        layerIds.forEach((layerId) => {
          if (isEmpty) {
            draft.operateItemParams.push({
              ...draft.slideLayers[draft.currentSlideId][layerId]
            })
          }
          const item = draft.operateItemParams.find(
            (item) => item.id === layerId
          )

          if (item) {
            item.params.positionX += deltaPosition.deltaX
            item.params.positionY += deltaPosition.deltaY
            if (item.params.positionX < 0) {
              item.params.positionX = 0
            } else if (item.params.positionX + item.params.width > slideWidth) {
              item.params.positionX = slideWidth - item.params.width
            }
            if (item.params.positionY < 0) {
              item.params.positionY = 0
            } else if (
              item.params.positionY + item.params.height >
              slideHeight
            ) {
              item.params.positionY = slideHeight - item.params.height
            }
            draft.slideLayersOperationInfo[draft.currentSlideId][
              layerId
            ].dragging = true
          }
        })
        break
      }

      case ActionTypes.SELECT_LAYER:
        Object.entries(layersOperationInfo).forEach(
          ([id, layerOperationInfo]: [string, any]) => {
            if (action.payload.selected && action.payload.exclusive) {
              draft.slideLayersOperationInfo[draft.currentSlideId][id] = {
                ...layerOperationInfo,
                selected: false,
                editing: false
              }
            }
            if (+id === action.payload.layerId) {
              draft.slideLayersOperationInfo[draft.currentSlideId][id] = {
                ...layerOperationInfo,
                selected: action.payload.selected
              }
            }
          }
        )
        draft.slideLayersOperationInfo[draft.currentSlideId] = {
          ...layersOperationInfo
        }
        break

      case ActionTypes.CLEAR_LAYERS_OPERATION_INFO:
        if (layersOperationInfo) {
          Object.values(layersOperationInfo).forEach(
            (layerOperationInfo: any) => {
              return Object.entries(action.payload.changedInfo).forEach(
                ([type, value]: [string, boolean]) => {
                  layerOperationInfo[type] = value
                }
              )
            }
          )
        }
        break

      case ActionTypes.CLEAR_EDITOR_BASELINES:
        draft.editorBaselines = []
        draft.operateItemParams = []
        Object.values(
          draft.slideLayersOperationInfo[draft.currentSlideId]
        ).forEach((item) => {
          item.dragging = false
        })
        break

      case ActionTypes.SHOW_EDITOR_BASELINES:
        draft.editorBaselines = action.payload.baselines
        break

      case ActionTypes.COPY_SLIDE_LAYERS_SUCCESS:
        draft.clipboardLayers = action.payload.layers
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK:
        draft.loading.shareToken = true
        if (action.payload.params.mode === 'AUTH') {
          draft.currentDisplayAuthorizedShareToken = ''
        }
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS:
        draft.currentDisplayShareToken = action.payload.shareToken
        draft.loading.shareToken = false
        break

      case ActionTypes.LOAD_DISPLAY_AUTHORIZED_SHARE_LINK_SUCCESS:
        draft.currentDisplayAuthorizedShareToken =
          action.payload.authorizedShareToken
        draft.loading.shareToken = false
        break

      case ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE:
        draft.loading.shareToken = false
        break

      case ActionTypes.OPEN_SHARE_PANEL:
        draft.sharePanel = {
          id: action.payload.id,
          type: 'display',
          title: action.payload.title,
          visible: true
        }
        break

      case ActionTypes.CLOSE_SHARE_PANEL:
        draft.sharePanel = defaultSharePanelState
        break

      case ActionTypes.RESET_DISPLAY_STATE:
        return initialState

      case LOCATION_CHANGE:
        const matchSlide = matchDisplaySlidePath(
          action.payload.location.pathname
        )
        if (matchSlide) {
          draft.currentSlideId = +matchSlide.params.slideId || null
        } else {
          return initialState
        }
        break
    }
  })
export { initialState as displayInitialState}
export default displayReducer
