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

const selectShare = (state) => state.get('shareDisplay')

const makeSelectTitle = () => createSelector(
  selectShare,
  (shareState) => shareState.get('title')
)

const makeSelectDisplay = () => createSelector(
  selectShare,
  (shareState) => shareState.get('display')
)

const makeSelectSlide = () => createSelector(
  selectShare,
  (shareState) => shareState.get('slide')
)

const makeSelectLayers = () => createSelector(
  selectShare,
  (shareState) => shareState.get('layers')
)

const makeSelectWidgets = () => createSelector(
  selectShare,
  (shareState) => shareState.get('widgets')
)

const makeSelectLayersInfo = () => createSelector(
  selectShare,
  (shareState) => shareState.get('layersInfo')
)

export {
  selectShare,
  makeSelectTitle,
  makeSelectDisplay,
  makeSelectSlide,
  makeSelectLayers,
  makeSelectWidgets,
  makeSelectLayersInfo
}
