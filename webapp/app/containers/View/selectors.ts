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
import { IViewState } from './types'

const selectView = (state) => state.view

const makeSelectViews = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.views
)

const makeSelectEditingView = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.editingView
)

const makeSelectEditingViewInfo = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.editingViewInfo
)

const makeSelectFormedViews = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.formedViews
)

const makeSelectSources = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.sources
)

const makeSelectSchema = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.schema
)

const makeSelectSqlValidation = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.sqlValidation
)

const makeSelectSqlDataSource = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.sqlDataSource
)

const makeSelectSqlLimit = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.sqlLimit
)

const makeSelectLoading = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.loading
)

const makeSelectChannels = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.channels
)
const makeSelectTenants = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.tenants
)
const makeSelectBizs = () => createSelector(
  selectView,
  (viewState: IViewState) => viewState.bizs
)

export {
  selectView,
  makeSelectViews,
  makeSelectEditingView,
  makeSelectEditingViewInfo,
  makeSelectFormedViews,
  makeSelectSources,
  makeSelectSchema,
  makeSelectSqlValidation,
  makeSelectSqlDataSource,
  makeSelectSqlLimit,
  makeSelectLoading,

  makeSelectChannels,
  makeSelectTenants,
  makeSelectBizs
}
