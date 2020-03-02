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

/**
 * Direct selector to the schedule state domain
 */
const selectSchedule = (state) => state.schedule

/**
 * Other specific selectors
 */

/**
 * Default selector used by Schedule
 */

const makeSelectSchedules = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.schedules
)

const makeSelectEditingSchedule = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.editingSchedule
)

const makeSelectLoading = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.loading
)

const makeSelectSuggestMails = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.suggestMails
)

const makeSelectPortalDashboards = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.portalDashboards
)

const makeSelectVizs = () => createSelector(
  selectSchedule,
  (scheduleState) => scheduleState.vizs
)

export {
  selectSchedule,
  makeSelectSchedules,
  makeSelectEditingSchedule,
  makeSelectLoading,
  makeSelectSuggestMails,
  makeSelectPortalDashboards,
  makeSelectVizs
}
