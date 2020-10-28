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
import { initialState } from './reducer'
import { DashboardItemStatus } from '../Dashboard/constants'

const selectShare = (state) => state.shareDisplay || initialState
const selectPropsSlideNumber = (_, slideNumber: number) => slideNumber
const selectPropsLayerId = (_1, _2, layerId: number) => layerId

const selectSlidesLayers = createSelector(
  selectShare,
  (shareState) => shareState.slidesLayers
)

const selectSlideLayersInfo = createSelector(
  selectShare,
  (shareState) => shareState.slideLayersInfo
)

const makeSelectTitle = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.title
  )

const makeSelectDisplay = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.display
  )

const makeSelectSlidesCount = () =>
  createSelector(
    selectSlidesLayers,
    (slidesLayers) => slidesLayers.length
  )
const makeSelectSlideLayers = () =>
  createSelector(
    selectSlidesLayers,
    selectPropsSlideNumber,
    (slidesLayers, slideNumber) => slidesLayers[slideNumber - 1]
  )

const makeSelectWidgets = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.widgets
  )

const makeSelectFormedViews = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.formedViews
  )

const makeSelectSlideLayerContextValue = () =>
  createSelector(
    selectSlidesLayers,
    selectSlideLayersInfo,
    selectPropsSlideNumber,
    selectPropsLayerId,
    (slidesLayers, slideLayersInfo, slideNumber, layerId) => {
      return {
        layer: slidesLayers[slideNumber - 1].relations.find(
          ({ id }) => id === layerId
        ),
        layerInfo: slideLayersInfo[slideNumber][layerId]
      }
    }
  )

const makeSelectSlideLayersLoaded = () =>
  createSelector(
    selectSlideLayersInfo,
    selectPropsSlideNumber,
    (slideLayersInfo, slideNumber) =>
      Object.values(slideLayersInfo[slideNumber]).every(
        ({ status }) => status !== DashboardItemStatus.Pending
      )
  )

export {
  selectShare,
  makeSelectTitle,
  makeSelectDisplay,
  makeSelectSlidesCount,
  makeSelectSlideLayers,
  makeSelectWidgets,
  makeSelectFormedViews,
  makeSelectSlideLayerContextValue,
  makeSelectSlideLayersLoaded
}
