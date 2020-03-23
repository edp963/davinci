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

import React, { FC, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SharePanelComponent from 'app/components/SharePanel'
import {
  loadDashboardShareLink,
  loadWidgetShareLink,
  closeSharePanel
} from '../actions'
import {
  makeSelectSharePanel,
  makeSelectCurrentDashboardShareToken,
  makeSelectCurrentDashboardAuthorizedShareToken,
  makeSelectCurrentDashboardShareLoading,
  makeSelectCurrentItemsInfo
} from '../selectors'

const SharePanel: FC = () => {
  const dispatch = useDispatch()
  const sharePanelStates = useSelector(makeSelectSharePanel())
  const dashboardShareToken = useSelector(makeSelectCurrentDashboardShareToken())
  const dashboardAuthorizedShareToken = useSelector(makeSelectCurrentDashboardAuthorizedShareToken())
  const dashboardShareLoading = useSelector(makeSelectCurrentDashboardShareLoading())
  const currentItemsInfo = useSelector(makeSelectCurrentItemsInfo())

  const onLoadDashboardShareLink = useCallback((id, authUser) => {
    dispatch(loadDashboardShareLink(id, authUser))
  }, [])

  const onLoadWidgetShareLink = useCallback((id, itemId, authUser) => {
    dispatch(loadWidgetShareLink(id, itemId, authUser))
  }, [])

  const onCloseSharePanel = useCallback(() => {
    dispatch(closeSharePanel())
  }, [])

  const { type, itemId } = sharePanelStates
  let shareToken = ''
  let authorizedShareToken = ''
  let shareLoading = false

  switch (type) {
    case 'dashboard':
      shareToken = dashboardShareToken
      authorizedShareToken = dashboardAuthorizedShareToken
      shareLoading = dashboardShareLoading
      break
    case 'widget':
      const itemInfo = currentItemsInfo[itemId]
      shareToken = itemInfo.shareToken
      authorizedShareToken = itemInfo.authorizedShareToken
      shareLoading = itemInfo.shareLoading
      break
  }

  return (
    <SharePanelComponent
      {...sharePanelStates}
      shareToken={shareToken}
      authorizedShareToken={authorizedShareToken}
      loading={shareLoading}
      onLoadDashboardShareLink={onLoadDashboardShareLink}
      onLoadWidgetShareLink={onLoadWidgetShareLink}
      onClose={onCloseSharePanel}
    />
  )
}

export default SharePanel
