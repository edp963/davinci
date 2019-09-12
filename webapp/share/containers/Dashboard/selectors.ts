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

const selectShare = (state) => state.get('shareDashboard')

const makeSelectDashboard = () => createSelector(
  selectShare,
  (shareState) => shareState.get('dashboard')
)

const makeSelectTitle = () => createSelector(
  selectShare,
  (shareState) => shareState.get('title')
)
const makeSelectConfig = () => createSelector(
  selectShare,
  (shareState) => shareState.get('config')
)
const makeSelectWidgets = () => createSelector(
  selectShare,
  (shareState) => shareState.get('widgets')
)
const makeSelectItems = () => createSelector(
  selectShare,
  (shareState) => shareState.get('items')
)
const makeSelectItemsInfo = () => createSelector(
  selectShare,
  (shareState) => shareState.get('itemsInfo')
)
const makeSelectDashboardSelectOptions = () => createSelector(
  selectShare,
  (shareState) => shareState.get('dashboardSelectOptions')
)

const makeSelectShareParams = () => createSelector(
  selectShare,
  (shareState) => shareState.get('shareParams')
)

const makeSelectLinkages = () => createSelector(
  selectShare,
  (shareState) => {
    const config = shareState.get('config')
    if (!config) { return [] }

    const emptyConfig = {}
    const { linkages } = JSON.parse(config || emptyConfig)
    if (!linkages) { return [] }

    const itemsInfo = shareState.get('itemsInfo')
    const validLinkages = linkages.filter((l) => {
      const { linkager, trigger } = l
      return itemsInfo[linkager[0]] && itemsInfo[trigger[0]]
    })
    return validLinkages
  }
)

const makeSelectDownloadList = () => createSelector(
  selectShare,
  (globalState) => globalState.get('downloadList')
)

const makeSelectDownloadListLoading = () => createSelector(
  selectShare,
  (globalState) => globalState.get('downloadListLoading')
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
