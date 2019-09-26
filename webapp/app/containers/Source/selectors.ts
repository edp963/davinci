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
import { SourceStateType } from './reducer'

const selectSource = (state) => state.get('source')

const makeSelectSources = () => createSelector(
  selectSource,
  (sourceState: SourceStateType) => sourceState.get('sources')
)

const makeSelectListLoading = () => createSelector(
  selectSource,
  (sourceState: SourceStateType) => sourceState.get('listLoading')
)

const makeSelectFormLoading = () => createSelector(
  selectSource,
  (sourceState: SourceStateType) => sourceState.get('formLoading')
)

const makeSelectTestLoading = () => createSelector(
  selectSource,
  (sourceState: SourceStateType) => sourceState.get('testLoading')
)

const makeSelectDatasourcesInfo = () => createSelector(
  selectSource,
  (sourceState: SourceStateType) => sourceState.get('datasourcesInfo')
    .map((info) => ({
      label: info.name,
      value: info.name,
      ...info.versions && {
        children: info.versions.map((ver) => ({
          label: ver,
          value: ver
        }))
      }
    }))
)

export {
  selectSource,
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading,
  makeSelectDatasourcesInfo
}
