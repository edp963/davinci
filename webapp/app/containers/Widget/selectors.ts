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

const selectWidget = (state) => state.get('widget')

const makeSelectWidgets = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('widgets')
)

const makeSelectCurrentWidget = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('currentWidget')
)

const makeSelectLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('loading')
)

const makeSelectDataLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('dataLoading')
)

const makeSelectDistinctColumnValues = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('distinctColumnValues')
)

const makeSelectColumnValueLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.get('columnValueLoading')
)

export {
  selectWidget,
  makeSelectWidgets,
  makeSelectCurrentWidget,
  makeSelectLoading,
  makeSelectDataLoading,
  makeSelectDistinctColumnValues,
  makeSelectColumnValueLoading
}
