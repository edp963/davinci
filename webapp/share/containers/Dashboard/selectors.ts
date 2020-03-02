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

const selectShare = (state) => state.shareDashboard

const makeSelectDashboard = () => createSelector(
  selectShare,
  (shareState) => shareState.dashboard
)

const makeSelectTitle = () => createSelector(
  selectShare,
  (shareState) => shareState.title
)
const makeSelectConfig = () => createSelector(
  selectShare,
  (shareState) => shareState.config
)
const makeSelectWidgets = () => createSelector(
  selectShare,
  (shareState) => shareState.widgets
)
const makeSelectItems = () => createSelector(
  selectShare,
  (shareState) => shareState.items
)
const makeSelectItemsInfo = () => createSelector(
  selectShare,
  (shareState) => shareState.itemsInfo
)
const makeSelectDashboardSelectOptions = () => createSelector(
  selectShare,
  (shareState) => shareState.dashboardSelectOptions
)

const makeSelectShareParams = () => createSelector(
  selectShare,
  (shareState) => shareState.shareParams
)

const makeSelectLinkages = () => createSelector(
  selectShare,
  (shareState) => {
    const config = shareState.config
    if (!config) { return [] }

    const emptyConfig = {}
    const { linkages } = JSON.parse(config || emptyConfig)
    if (!linkages) { return [] }

    const itemsInfo = shareState.itemsInfo
    const validLinkages = linkages.filter((l) => {
      const { linkager, trigger } = l
      return itemsInfo[linkager[0]] && itemsInfo[trigger[0]]
    })
    return validLinkages
  }
)

const makeSelectDownloadList = () => createSelector(
  selectShare,
  (globalState) => globalState.downloadList
)

const makeSelectDownloadListLoading = () => createSelector(
  selectShare,
  (globalState) => globalState.downloadListLoading
)


export {
  selectShare,
  makeSelectDashboard,
  makeSelectTitle,
  makeSelectConfig,
  makeSelectDashboardSelectOptions,
  makeSelectWidgets,
  makeSelectItems,
  makeSelectItemsInfo,
  makeSelectLinkages,
  makeSelectDownloadList,
  makeSelectDownloadListLoading,
  makeSelectShareParams
}
