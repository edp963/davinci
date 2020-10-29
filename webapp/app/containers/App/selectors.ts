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
import { RouterState } from 'connected-react-router'

const selectGlobal = (state) => state.global

const selectRouter = (state: { router: RouterState }) => state.router

const makeSelectExternalAuthProviders = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.externalAuthProviders
  )

const makeSelectLogged = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.logged
  )

const makeSelectLoginUser = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.loginUser
  )

const makeSelectLoginLoading = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.loginLoading
  )

const makeSelectNavigator = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.navigator
  )

const makeSelectDownloadList = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.downloadList
  )

const makeSelectDownloadListLoading = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.downloadListLoading
  )

const makeSelectLocation = () =>
  createSelector(
    selectRouter,
    (routerState) => routerState.location
  )

const makeSelectVersion = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.version
  )

const makeSelectOauth2Enabled = () =>
  createSelector(
    selectGlobal,
    (globalState) => globalState.oauth2Enabled
  )

export {
  selectGlobal,
  makeSelectVersion,
  makeSelectOauth2Enabled,
  makeSelectExternalAuthProviders,
  makeSelectLogged,
  makeSelectLoginUser,
  makeSelectLoginLoading,
  makeSelectNavigator,
  makeSelectLocation,
  makeSelectDownloadList,
  makeSelectDownloadListLoading
}
