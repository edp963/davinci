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
import { ViewStateType } from './reducer'

const selectView = (state) => state.get('view')

const makeSelectViews = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('views')
)

const makeSelectEditingView = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('editingView')
)

const makeSelectEditingViewInfo = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('editingViewInfo')
)

const makeSelectFormedViews = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('formedViews')
)

const makeSelectSources = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('sources')
)

const makeSelectSourceTables = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('tables')
)

const makeSelectMapTableColumns = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('mapTableColumns')
)

const makeSelectSqlValidation = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('sqlValidation')
)

const makeSelectSqlDataSource = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('sqlDataSource')
)

const makeSelectSqlLimit = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('sqlLimit')
)

const makeSelectLoading = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('loading')
)

const makeSelectChannels = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('channels')
)
const makeSelectTenants = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('tenants')
)
const makeSelectBizs = () => createSelector(
  selectView,
  (viewState: ViewStateType) => viewState.get('bizs')
)

export {
  selectView,
  makeSelectViews,
  makeSelectEditingView,
  makeSelectEditingViewInfo,
  makeSelectFormedViews,
  makeSelectSources,
  makeSelectSourceTables,
  makeSelectMapTableColumns,
  makeSelectSqlValidation,
  makeSelectSqlDataSource,
  makeSelectSqlLimit,
  makeSelectLoading,

  makeSelectChannels,
  makeSelectTenants,
  makeSelectBizs
}
