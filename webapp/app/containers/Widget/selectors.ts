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
import { IWidgetState } from './types'
import { initialState } from './reducer'

const selectWidget = (state: { widget: IWidgetState }) => state.widget || initialState

const makeSelectWidgets = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.widgets
)

const makeSelectCurrentWidget = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.currentWidget
)

const makeSelectLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.loading
)

const makeSelectDataLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.dataLoading
)

const makeSelectDistinctColumnValues = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.distinctColumnValues
)

const makeSelectColumnValueLoading = () => createSelector(
  selectWidget,
  (widgetState) => widgetState.columnValueLoading
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
