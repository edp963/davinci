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

const selectDisplay = (state) => state.get('display')

const makeSelectDisplays = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('displays')
)

const makeSelectCurrentDisplay = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentDisplay')
)

const makeSelectCurrentSlide = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentSlide')
)

const makeSelectCurrentLayers = () => createSelector(
  selectDisplay,
  ({ present }) =>  present.get('currentLayers')
)

const makeSelectCurrentDatasources = () => createSelector(
  selectDisplay,
  ({ present }) =>  present.get('currentDatasources')
)

const makeSelectCurrentLayersLoading = () => createSelector(
  selectDisplay,
  ({ present }) =>  present.get('currentLayersLoading')
)

const makeSelectCurrentLayersQueryParams = () => createSelector(
  selectDisplay,
  ({ present }) =>  present.get('currentLayersQueryParams')
)

const makeSelectCurrentLayersStatus = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentLayersStatus')
)

const makeSelectCurrentSelectedLayers = () => createSelector(
  selectDisplay,
  ({ present }) => {
    const layerStatus = present.get('currentLayersStatus')
    const layers = present.get('currentLayers')
    return layers.filter((layer) => layerStatus[layer.id])
  }
)

const makeSelectClipboardLayers = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('clipboardLayers')
)

const makeSelectCurrentDisplayShareInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentDisplayShareInfo')
)

const makeSelectCurrentDisplaySecretInfo = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentDisplaySecretInfo')
)

const makeSelectCurrentDisplayShareInfoLoading = () => createSelector(
  selectDisplay,
  ({ present }) => present.get('currentDisplayShareInfoLoading')
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
    const display = present.get('currentDisplay')
    return {
      displayId: display && display.id,
      slide: present.get('currentSlide'),
      layers: present.get('currentLayers'),
      lastOperationType: present.get('lastOperationType'),
      lastLayers: present.get('lastLayers')
    }
  }
)

const makeSelectNextState = () => createSelector(
  selectDisplay,
  ({ future }) => {
    if (future.length === 0) { return {} }
    const item = future[0]
    return {
      displayId: item.get('currentDisplay').id,
      slide: item.get('currentSlide'),
      layers: item.get('currentLayers'),
      lastOperationType: item.get('lastOperationType'),
      lastLayers: item.get('lastLayers')
    }
  }
)

export {
  selectDisplay,
  makeSelectDisplays,
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectCurrentLayers,

  makeSelectCurrentDatasources,
  makeSelectCurrentLayersLoading,
  makeSelectCurrentLayersQueryParams,

  makeSelectCurrentLayersStatus,
  makeSelectCurrentSelectedLayers,

  makeSelectClipboardLayers,

  makeSelectCurrentDisplayShareInfo,
  makeSelectCurrentDisplaySecretInfo,
  makeSelectCurrentDisplayShareInfoLoading,

  makeSelectCanUndo,
  makeSelectCanRedo,
  makeSelectCurrentState,
  makeSelectNextState
}
