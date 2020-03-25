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

import { createSelector, createSelectorCreator } from 'reselect'
import { IDisplayState } from './types'
import { initialState } from './reducer'
import { LayerContextValue } from './components/types'

const selectDisplay = (state: { display: IDisplayState }) =>
  state.display || initialState

const selectPropsSlideId = (_, slideId: number) => slideId
const selectPropsLayerId = (_, layerId: number) => layerId

const selectCurrentSlideId = (state: { display: IDisplayState }) =>
  state.display ? state.display.currentSlideId : initialState.currentSlideId
const selectSlideLayers = (state: { display: IDisplayState }) =>
  state.display ? state.display.slideLayers : initialState.slideLayers
const selectSlideLayersInfo = (state: { display: IDisplayState }) =>
  state.display ? state.display.slideLayersInfo : initialState.slideLayersInfo
const selectSlideLayersOperationInfo = (state: { display: IDisplayState }) =>
  state.display
    ? state.display.slideLayersOperationInfo
    : initialState.slideLayersOperationInfo

const selectCurrentLayers = (state: { display: IDisplayState }) =>
  state.display
    ? state.display.slideLayers[state.display.currentSlideId] || {}
    : {}

const makeSelectCurrentLayersOperationInfo = () => (state: {
  display: IDisplayState
}) =>
  state.display
    ? state.display.slideLayersOperationInfo[state.display.currentSlideId] || {}
    : {}

const makeSelectLayersBySlide = () =>
  createSelector(
    selectSlideLayers,
    selectPropsSlideId,
    (slideLayers, slideId) => slideLayers[slideId]
  )

const makeSelectLayerIdsBySlide = () =>
  createSelector(
    makeSelectLayersBySlide(),
    (layers) => (!layers ? [] : Object.keys(layers).map((id) => +id))
  )

const makeSelectCurrentLayerList = () =>
  createSelector(
    selectCurrentLayers,
    (currentLayers) =>
      Object.values(currentLayers).sort((l1, l2) => l2.index - l1.index)
  )
const makeSelectCurrentLayerIds = () =>
  createSelector(
    selectCurrentLayers,
    (currentLayers) => Object.keys(currentLayers).map((id) => +id)
  )

const makeSelectSlideLayerContextValue = () =>
  createSelector(
    selectSlideLayers,
    selectSlideLayersOperationInfo,
    selectSlideLayersInfo,
    (_, slideId: number) => slideId,
    (_1, _2, layerId: number) => layerId,
    (_1, _2, _3, editing: boolean = true) => editing,
    (
      slideLayers,
      slideLayersOperationInfo,
      slideLayersInfo,
      slideId,
      layerId,
      editing
    ) => {
      const layerContextValue: LayerContextValue = {
        layer: slideLayers[slideId][layerId],
        layerInfo: slideLayersInfo[slideId][layerId]
      }
      if (editing) {
        layerContextValue.operationInfo = slideLayersOperationInfo[slideId][layerId]
      }
      return layerContextValue
    }
  )

const makeSelectCurrentLayersMaxIndex = () =>
  createSelector(
    makeSelectCurrentLayerList(),
    (currentLayerList) =>
      currentLayerList.length
        ? currentLayerList[currentLayerList.length - 1].index
        : 0
  )

const makeSelectCurrentSelectedLayerList = () =>
  createSelector(
    makeSelectCurrentLayerList(),
    makeSelectCurrentLayersOperationInfo(),
    (currentLayerList, currentLayersOperationInfo) =>
      currentLayerList.filter(
        ({ id }) => currentLayersOperationInfo[id].selected
      )
  )
const makeSelectCurrentSelectedLayerIds = () =>
  createSelector(
    makeSelectCurrentLayersOperationInfo(),
    (currentLayersOperationInfo) =>
      Object.keys(currentLayersOperationInfo)
        .filter((id) => currentLayersOperationInfo[+id].selected)
        .map((id) => +id)
  )

const makeSelectCurrentOperatingLayerList = () =>
  createSelector(
    selectPropsLayerId,
    selectCurrentLayers,
    makeSelectCurrentLayersOperationInfo(),
    makeSelectCurrentSelectedLayerList(),
    (layerId, currentLayers, currentLayersOperationInfo, selectedLayerList) => {
      if (layerId && !currentLayersOperationInfo[layerId].selected) {
        return [currentLayers[layerId]]
      } else {
        return selectedLayerList
      }
    }
  )

const makeSelectCurrentOtherLayerList = () =>
  createSelector(
    selectPropsLayerId,
    makeSelectCurrentLayersOperationInfo(),
    makeSelectCurrentSelectedLayerIds(),
    selectCurrentLayers,
    (layerId, currentLayersOperationInfo, selectedLayerIds, currentLayers) => {
      if (layerId && !currentLayersOperationInfo[layerId].selected) {
        return [currentLayers[layerId]]
      } else {
        return Object.entries(currentLayers)
          .filter(([id]) => !selectedLayerIds.includes(+id))
          .map(([_, layer]) => layer)
      }
    }
  )

const makeSelectCurrentDisplayWidgets = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.currentDisplayWidgets
  )

const makeSelectClipboardLayers = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.clipboardLayers
  )

const makeSelectCurrentDisplayShareToken = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.currentDisplayShareToken
  )

const makeSelectCurrentDisplayAuthorizedShareToken = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.currentDisplayAuthorizedShareToken
  )

const makeSelectSharePanel = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.sharePanel
  )

const makeSelectDisplayLoading = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.loading
  )

const makeSelectEditorBaselines = () =>
  createSelector(
    selectDisplay,
    (displayState) => displayState.editorBaselines
  )

export {
  selectDisplay,
  //
  makeSelectLayersBySlide,
  makeSelectLayerIdsBySlide,
  //
  makeSelectCurrentLayerList,
  makeSelectCurrentLayerIds,
  makeSelectSlideLayerContextValue,
  makeSelectCurrentLayersMaxIndex,
  makeSelectCurrentLayersOperationInfo,
  makeSelectCurrentSelectedLayerList,
  makeSelectCurrentSelectedLayerIds,
  //
  makeSelectCurrentOperatingLayerList,
  makeSelectCurrentOtherLayerList,
  //
  makeSelectCurrentDisplayWidgets,
  makeSelectClipboardLayers,
  makeSelectCurrentDisplayShareToken,
  makeSelectCurrentDisplayAuthorizedShareToken,
  makeSelectSharePanel,
  makeSelectDisplayLoading,
  makeSelectEditorBaselines
}
