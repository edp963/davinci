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

import {
  selectSchedule,
  makeSelectSchedules,
  makeSelectEditingSchedule,
  makeSelectLoading,
  makeSelectSuggestMails,
  makeSelectPortalDashboards,
  makeSelectVizs
} from 'app/containers/Schedule/selectors'
import { initialState } from 'app/containers/Schedule/reducer'

const state = {
  schedule: initialState
}

describe('selectProject', () => {
  it('should select the projects state', () => {
    expect(selectSchedule(state)).toEqual(state.schedule)
  })
})

describe('makeSelectProjects', () => {
  const scheduleSelector = makeSelectSchedules()
  const editingScheduleSelector = makeSelectEditingSchedule()
  const loadingSelector = makeSelectLoading()
  const suggestMailsSelector = makeSelectSuggestMails()
  const portalDashboardSelector = makeSelectPortalDashboards()
  const vizsSelector = makeSelectVizs()

  it('should select the scheduleSelector', () => {
    expect(scheduleSelector(state)).toEqual(state.schedule.schedules)
  })

  it('should select the editingScheduleSelector', () => {
    expect(editingScheduleSelector(state)).toEqual(
      state.schedule.editingSchedule
    )
  })

  it('should select the loadingSelector', () => {
    expect(loadingSelector(state)).toEqual(state.schedule.loading)
  })

  it('should select the suggestMailsSelector', () => {
    expect(suggestMailsSelector(state)).toEqual(state.schedule.suggestMails)
  })

  it('should select the portalDashboardSelector', () => {
    expect(portalDashboardSelector(state)).toEqual(
      state.schedule.portalDashboards
    )
  })

  it('should select the vizsSelector', () => {
    expect(vizsSelector(state)).toEqual(state.schedule.vizs)
  })
})
