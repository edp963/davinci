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
import DisplayActions from '../actions'
import {
  makeSelectSharePanel,
  makeSelectDisplayLoading,
  makeSelectCurrentDisplayShareToken,
  makeSelectCurrentDisplayAuthorizedShareToken,
  makeSelectCurrentDisplayPasswordShareToken,
  makeSelectCurrentDisplayPasswordSharePassword
} from '../selectors'
import { makeSelectCurrentOrganizationMembers } from 'containers/Organizations/selectors'
import { makeSelectProjectRoles } from 'containers/Projects/selectors'

const SharePanel: FC = () => {
  const dispatch = useDispatch()
  const sharePanelStates = useSelector(makeSelectSharePanel())
  const shareToken = useSelector(makeSelectCurrentDisplayShareToken())
  const authorizedShareToken = useSelector(
    makeSelectCurrentDisplayAuthorizedShareToken()
  )
  const { shareToken: shareLoading } = useSelector(makeSelectDisplayLoading())
  const projectRoles = useSelector(makeSelectProjectRoles())
  const organizationMembers = useSelector(
    makeSelectCurrentOrganizationMembers()
  )
  const displayPasswordShareToken = useSelector(
    makeSelectCurrentDisplayPasswordShareToken()
  )
  const displayPasswordSharePassword = useSelector(
    makeSelectCurrentDisplayPasswordSharePassword()
  )

  const onLoadDisplayShareLink = useCallback(
    ({ id, mode, expired, permission, roles, viewers }) => {
      dispatch(
        DisplayActions.loadDisplayShareLink({
          id,
          mode,
          expired,
          permission,
          roles,
          viewers
        })
      )
    },
    []
  )

  const onCloseSharePanel = useCallback(() => {
    dispatch(DisplayActions.closeSharePanel())
  }, [])

  return (
    <SharePanelComponent
      {...sharePanelStates}
      shareToken={shareToken}
      passwordShareToken={displayPasswordShareToken}
      authorizedShareToken={authorizedShareToken}
      password={displayPasswordSharePassword}
      loading={shareLoading}
      projectRoles={projectRoles}
      organizationMembers={organizationMembers}
      onLoadDisplayShareLink={onLoadDisplayShareLink}
      onClose={onCloseSharePanel}
    />
  )
}

export default SharePanel
