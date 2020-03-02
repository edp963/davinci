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
import { ISourceState } from './types'

const selectSource = (state) => state.source

const makeSelectSources = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.sources
)

const makeSelectListLoading = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.listLoading
)

const makeSelectFormLoading = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.formLoading
)

const makeSelectTestLoading = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.testLoading
)

const makeSelectResetLoading = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.resetLoading
)

const makeSelectDatasourcesInfo = () => createSelector(
  selectSource,
  (sourceState: ISourceState) => sourceState.datasourcesInfo
)

export {
  selectSource,
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading,
  makeSelectResetLoading,
  makeSelectDatasourcesInfo
}
