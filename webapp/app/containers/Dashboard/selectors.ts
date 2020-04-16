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
import { IDashboardState } from './types'

const selectDashboard = (state: { dashboard: IDashboardState }) => state.dashboard
const selectForm = (state) => state.form

const makeSelectCurrentDashboard = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboard
)

const makeSelectCurrentDashboardControlParams = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardGlobalControlParams
)

const makeSelectCurrentDashboardLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardLoading
)
const makeSelectCurrentDashboardShareToken = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardShareToken
)
const makeSelectCurrentDashboardAuthorizedShareToken = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardAuthorizedShareToken
)
const makeSelectCurrentDashboardShareLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardShareLoading
)
const makeSelectSharePanel = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.sharePanel
)
const makeSelectCurrentDashboardSelectOptions = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardSelectOptions
)
const makeSelectCurrentItems = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentItems
)
const makeSelectCurrentItemsInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentItemsInfo
)

const makeSelectControlForm = () => createSelector(
  selectForm,
  (formState) => formState.controlForm
)

const makeSelectCurrentLinkages = () => createSelector(
  selectDashboard,
  (dashboardState) => {
    const currentDashboard = dashboardState.currentDashboard
    const currentItemsInfo = dashboardState.currentItemsInfo
    if (!currentDashboard && !currentItemsInfo) { return [] }

    const emptyConfig = '{}'
    const { linkages } = JSON.parse(currentDashboard.config || emptyConfig)
    if (!linkages) { return [] }
    const validLinkages = linkages.filter((l) => {
      const { linkager, trigger } = l
      return currentItemsInfo[linkager[0]] && currentItemsInfo[trigger[0]]
    })
    return validLinkages
  }
)

export {
  selectDashboard,
  selectForm,
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentItemsInfo,
  makeSelectCurrentDashboardShareToken,
  makeSelectCurrentDashboardAuthorizedShareToken,
  makeSelectCurrentDashboardShareLoading,
  makeSelectSharePanel,
  makeSelectCurrentDashboardSelectOptions,
  makeSelectCurrentLinkages,
  makeSelectControlForm,
  makeSelectCurrentDashboardControlParams
}
