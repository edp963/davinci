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
import { initialState } from './reducer'

const selectGlobal = (state) => state.global || initialState

const makeSelectLoginLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.loading
)

const makeSelectLogged = () => createSelector(
  selectGlobal,
  (globalState) => globalState.logged
)

const makeSelectLoginUser = () => createSelector(
  selectGlobal,
  (globalState) => globalState.loginUser
)

const makeSelectShareType = () => createSelector(
  selectGlobal,
  (globalState) => {
    return globalState.shareType
  }
)

const makeSelectVizType = () => createSelector(
  selectGlobal,
  (globalState) => {
    return globalState.vizType
  }
)

const makeSelectPermission = () => createSelector(
  selectGlobal,
  (globalState) => {
    return globalState.download
  }
)

const makeSelectPermissionLoading = () => createSelector(
  selectGlobal,
  (globalState) => {
    return globalState.permissionLoading
  }
)





export {
  selectGlobal,
  makeSelectLoginLoading,
  makeSelectLogged,
  makeSelectLoginUser,
  makeSelectShareType,
  makeSelectVizType,
  makeSelectPermission,
  makeSelectPermissionLoading
}
