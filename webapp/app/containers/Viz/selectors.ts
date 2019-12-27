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
import { IVizState } from './types'

const selectViz = (state: { viz: IVizState }) => state.viz

const makeSelectPortals = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.portals
  )

const makeSelectDisplays = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.displays
  )

const makeSelectPortalDashboards = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.portalDashboards
  )

const makeSelectCurrentPortal = () =>
  createSelector(
    selectViz,
    (vizState) =>
      vizState.portals.find(({ id }) => id == vizState.currentPortalId) || {}
  )

const makeSelectCurrentDashboards = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.portalDashboards[vizState.currentPortalId] || []
  )

const makeSelectDisplaySlides = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.displaySlides
  )

const makeSelectCurrentDisplay = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.currentDisplay
  )

const makeSelectCurrentSlide = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.currentSlide
  )

const makeSelectCurrentSlides = () =>
  createSelector(
    selectViz,
    ({ currentDisplay, displaySlides }) =>
      currentDisplay ? displaySlides[currentDisplay.id] : []
  )

const makeSelectVizLoading = () =>
  createSelector(
    selectViz,
    (vizState) => vizState.loading
  )

export {
  selectViz,
  makeSelectPortals,
  makeSelectDisplays,
  makeSelectPortalDashboards,
  makeSelectCurrentPortal,
  makeSelectCurrentDashboards,
  makeSelectDisplaySlides,
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectCurrentSlides,
  makeSelectVizLoading
}
