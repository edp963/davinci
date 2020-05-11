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
import { IShareDashboardState } from './types'

const selectShare = (state: { shareDashboard: IShareDashboardState }) =>
  state.shareDashboard
const selectItemId = (_, itemId: number) => itemId

const makeSelectDashboard = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.dashboard
  )

const makeSelectTitle = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.title
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

const makeSelectItems = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.items
  )

const makeSelectItemsInfo = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.itemsInfo
  )

const makeSelectItem = () =>
  createSelector(
    makeSelectItems(),
    selectItemId,
    (currentItems, itemId) => currentItems.find((item) => item.id === itemId)
  )

const makeSelectItemInfo = () =>
  createSelector(
    makeSelectItemsInfo(),
    selectItemId,
    (currentItemsInfo, itemId) => currentItemsInfo[itemId]
  )

const makeSelectItemRelatedWidget = () =>
  createSelector(
    makeSelectWidgets(),
    makeSelectItem(),
    (widgets, item) => widgets.find((w) => w.id === item.widgetId)
  )

const makeSelectShareParams = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.shareParams
  )

const makeSelectLinkages = () =>
  createSelector(
    makeSelectDashboard(),
    makeSelectItemsInfo(),
    (dashboard, itemsInfo) => {
      if (!dashboard || !itemsInfo) {
        return []
      }

      const validLinkages = dashboard.config.linkages.filter((l) => {
        const { linkager, trigger } = l
        return itemsInfo[linkager[0]] && itemsInfo[trigger[0]]
      })
      return validLinkages
    }
  )

const makeSelectDownloadList = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.downloadList
  )

const makeSelectDownloadListLoading = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.downloadListLoading
  )

const makeSelectFullScreenPanelItemId = () =>
  createSelector(
    selectShare,
    (shareState) => shareState.fullScreenPanelItemId
  )

export {
  selectShare,
  makeSelectDashboard,
  makeSelectTitle,
  makeSelectWidgets,
  makeSelectFormedViews,
  makeSelectItems,
  makeSelectItemsInfo,
  makeSelectLinkages,
  makeSelectDownloadList,
  makeSelectDownloadListLoading,
  makeSelectShareParams,
  makeSelectItemInfo,
  makeSelectItemRelatedWidget,
  makeSelectFullScreenPanelItemId
}
