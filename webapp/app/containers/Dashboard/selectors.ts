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

const selectDashboard = (state) => state.dashboard
const selectForm = (state) => state.form

const makeSelectCurrentDashboard = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboard
)
const makeSelectCurrentDashboardLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardLoading
)
const makeSelectCurrentDashboardShareInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardShareInfo
)
const makeSelectCurrentDashboardSecretInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardSecretInfo
)
const makeSelectCurrentDashboardShareInfoLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.currentDashboardShareInfoLoading
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
  makeSelectCurrentDashboardShareInfo,
  makeSelectCurrentDashboardSecretInfo,
  makeSelectCurrentDashboardShareInfoLoading,
  makeSelectCurrentDashboardSelectOptions,
  makeSelectCurrentLinkages,
  makeSelectControlForm
}
