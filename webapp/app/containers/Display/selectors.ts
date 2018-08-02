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
  (displayState) => displayState.get('displays')
)

const makeSelectCurrentDisplay = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentDisplay')
)

const makeSelectCurrentSlide = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentSlide')
)

const makeSelectCurrentLayers = () => createSelector(
  selectDisplay,
  (displayState) =>  displayState.get('currentLayers')
)

const makeSelectCurrentDatasources = () => createSelector(
  selectDisplay,
  (displayState) =>  displayState.get('currentDatasources')
)

const makeSelectCurrentLayersLoading = () => createSelector(
  selectDisplay,
  (displayState) =>  displayState.get('currentLayersLoading')
)

const makeSelectCurrentLayersQueryParams = () => createSelector(
  selectDisplay,
  (displayState) =>  displayState.get('currentLayersQueryParams')
)

const makeSelectCurrentLayersStatus = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentLayersStatus')
)

const makeSelectCurrentSelectedLayers = () => createSelector(
  selectDisplay,
  (displayState) => {
    const layerStatus = displayState.get('currentLayersStatus')
    const layers = displayState.get('currentLayers')
    return layers.filter((layer) => layerStatus[layer.id])
  }
)

const makeSelectClipboardLayers = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('clipboardLayers')
)

const makeSelectCurrentDisplayShareInfo = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentDisplayShareInfo')
)

const makeSelectCurrentDisplaySecretInfo = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentDisplaySecretInfo')
)

const makeSelectCurrentDisplayShareInfoLoading = () => createSelector(
  selectDisplay,
  (displayState) => displayState.get('currentDisplayShareInfoLoading')
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
  makeSelectCurrentDisplayShareInfoLoading
}
