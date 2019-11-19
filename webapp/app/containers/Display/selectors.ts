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

import { createSelector } from 'reselect'

const selectDisplay = (state) => state.display

const makeSelectDisplays = () => createSelector(
  selectDisplay,
  ({ present }) => present.displays
)

const makeSelectCurrentDisplay = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentDisplay
)

const makeSelectCurrentSlide = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentSlide
)

const makeSelectCurrentLayers = () => createSelector(
  selectDisplay,
  ({ present }) =>  present.currentLayers
)

const makeSelectCurrentLayersInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentLayersInfo
)
const makeSelectCurrentLayersOperationInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentLayersOperationInfo
)

const makeSelectCurrentSelectedLayers = () => createSelector(
  selectDisplay,
  ({ present }) => {
    const layersOperationInfo = present.currentLayersOperationInfo
    const layers = present.currentLayers
    return layers.filter((layer) => layersOperationInfo[layer.id].selected)
  }
)

const makeSelectClipboardLayers = () => createSelector(
  selectDisplay,
  ({ present }) => present.clipboardLayers
)

const makeSelectCurrentDisplayShareInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentDisplayShareInfo
)

const makeSelectCurrentDisplaySecretInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentDisplaySecretInfo
)

const makeSelectCurrentDisplayShareInfoLoading = () => createSelector(
  selectDisplay,
  ({ present }) => present.currentDisplayShareInfoLoading
)

const makeSelectCanUndo = () => createSelector(
  selectDisplay,
  ({ past }) => past.length > 0
)

const makeSelectCanRedo = () => createSelector(
  selectDisplay,
  ({ future }) => future.length > 0
)

const makeSelectCurrentState = () => createSelector(
  selectDisplay,
  ({ present }) => {
    const display = present.currentDisplay
    return {
      displayId: display && display.id,
      slide: present.currentSlide,
      layers: present.currentLayers,
      lastOperationType: present.lastOperationType,
      lastLayers: present.lastLayers
    }
  }
)

const makeSelectNextState = () => createSelector(
  selectDisplay,
  ({ future }) => {
    if (future.length === 0) { return {} }
    const item = future[0]
    return {
      displayId: item.currentDisplay.id,
      slide: item.currentSlide,
      layers: item.currentLayers,
      lastOperationType: item.lastOperationType,
      lastLayers: item.lastLayers
    }
  }
)

const makeSelectEditorBaselines = () =>  createSelector(
  selectDisplay,
  ({ present }) => present.editorBaselines
)

const makeSelectCurrentProject = () => createSelector(
  selectDisplay,
  ({present}) => present.currentProject
)

export {
  selectDisplay,
  makeSelectDisplays,
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectCurrentLayers,
  makeSelectCurrentLayersInfo,
  makeSelectCurrentLayersOperationInfo,

  makeSelectCurrentSelectedLayers,

  makeSelectClipboardLayers,

  makeSelectCurrentDisplayShareInfo,
  makeSelectCurrentDisplaySecretInfo,
  makeSelectCurrentDisplayShareInfoLoading,

  makeSelectCanUndo,
  makeSelectCanRedo,
  makeSelectCurrentState,
  makeSelectNextState,

  makeSelectEditorBaselines,
  makeSelectCurrentProject
}
