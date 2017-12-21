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

const selectDashboard = (state) => state.get('dashboard')

const makeSelectDashboards = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('dashboards')
)

const makeSelectCurrentDashboard = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDashboard')
)
const makeSelectCurrentDashboardLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDashboardLoading')
)
const makeSelectCurrentDashboardShareInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDashboardShareInfo')
)
const makeSelectCurrentDashboardSecretInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDashboardSecretInfo')
)
const makeSelectCurrentDashboardShareInfoLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDashboardShareInfoLoading')
)
const makeSelectCurrentItems = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItems')
)
const makeSelectCurrentDatasources = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentDatasources')
)
const makeSelectCurrentItemsLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsLoading')
)
const makeSelectCurrentItemsQueryParams = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsQueryParams')
)
const makeSelectCurrentItemsDownloadCsvLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsDownloadCsvLoading')
)
const makeSelectCurrentItemsShareInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsShareInfo')
)
const makeSelectCurrentItemsSecretInfo = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsSecretInfo')
)
const makeSelectCurrentItemsShareInfoLoading = () => createSelector(
  selectDashboard,
  (dashboardState) => dashboardState.get('currentItemsShareInfoLoading')
)

export {
  selectDashboard,
  makeSelectDashboards,
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentDatasources,
  makeSelectCurrentItemsLoading,
  makeSelectCurrentItemsQueryParams,
  makeSelectCurrentItemsDownloadCsvLoading,
  makeSelectCurrentDashboardShareInfo,
  makeSelectCurrentDashboardSecretInfo,
  makeSelectCurrentDashboardShareInfoLoading,
  makeSelectCurrentItemsShareInfo,
  makeSelectCurrentItemsSecretInfo,
  makeSelectCurrentItemsShareInfoLoading
}
