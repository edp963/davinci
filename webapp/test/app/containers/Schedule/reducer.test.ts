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

import produce from 'immer'
import reducer, { initialState } from 'app/containers/Schedule/reducer'
import actions from 'app/containers/Schedule/actions'
import { EmptySchedule, EmptyWeChatWorkSchedule } from 'app/containers/Schedule/constants'
import { mockAnonymousAction } from 'test/utils/fixtures'
import { mockStore } from './fixtures'

describe('projectsReducer', () => {
  const { scheduleId, schedules, schedule, jobType, mails, dashboard } = mockStore
  let state
  beforeEach(() => {
    state = initialState
  })

  it('should return the initial state', () => {
    expect(reducer(void 0, mockAnonymousAction)).toEqual(state)
  })

  it('should handle the  loadSchedules action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.table = true
    })
    expect(reducer(state, actions.loadSchedules(scheduleId))).toEqual(
      expectedResult
    )
  })

  it('should handle the  schedulesLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.table = false
      draft.schedules = schedules
    })
    expect(reducer(state, actions.schedulesLoaded(schedules))).toEqual(
      expectedResult
    )
  })

  it('should handle the  relRoleProjectLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.table = false
      draft.schedules = draft.schedules.filter(({ id }) => id !== scheduleId)
    })
    expect(reducer(state, actions.scheduleDeleted(scheduleId))).toEqual(
      expectedResult
    )
  })

  it('should handle the  scheduleAdded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.edit = false
      draft.schedules.unshift(schedule)
    })
    expect(reducer(state, actions.scheduleAdded(schedule))).toEqual(
      expectedResult
    )
  })

  it('should handle the  deleteScheduleFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.table = false
    })
    expect(reducer(state, actions.deleteScheduleFail())).toEqual(expectedResult)
  })

  it('should handle the  loadScheduleDetail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.schedule = true
    })
    expect(reducer(state, actions.loadScheduleDetail(scheduleId))).toEqual(
      expectedResult
    )
  })

  it('should handle the  scheduleDetailLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.editingSchedule = schedule
      draft.loading.schedule = false
    })
    expect(reducer(state, actions.scheduleDetailLoaded(schedule))).toEqual(
      expectedResult
    )
  })

  it('should handle the  loadScheduleDetailFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.schedule = false
    })
    expect(reducer(state, actions.loadScheduleDetailFail())).toEqual(
      expectedResult
    )
  })

  it('should handle the  addSchedule and editSchedule action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.edit = true
    })
    expect(
      reducer(
        state,
        actions.addSchedule(schedule, () => void 0)
      )
    ).toEqual(expectedResult)
    expect(
      reducer(
        state,
        actions.editSchedule(schedule, () => void 0)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the  scheduleEdited action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.schedules.splice(
        draft.schedules.findIndex(({ id }) => id === scheduleId),
        1,
        schedule
      )
      draft.loading.edit = false
    })
    expect(reducer(state, actions.scheduleEdited(schedule))).toEqual(
      expectedResult
    )
  })

  it('should handle the  addScheduleFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.edit = false
    })
    expect(reducer(state, actions.addScheduleFail())).toEqual(
      expectedResult
    )
    expect(reducer(state, actions.editScheduleFail())).toEqual(
      expectedResult
    )
  })

  it('should handle the  scheduleStatusChanged action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.schedules.splice(
        draft.schedules.findIndex(
          ({ id }) => id === scheduleId
        ),
        1,
        schedule
      )
    })
    expect(reducer(state, actions.scheduleStatusChanged(schedule))).toEqual(
      expectedResult
    )
  })

  it('should handle the  changeScheduleJobType action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.editingSchedule = jobType === 'email' ?　EmptySchedule : EmptyWeChatWorkSchedule

    })
    expect(reducer(state, actions.changeScheduleJobType(jobType))).toEqual(
      expectedResult
    )
  })

  it('should handle the  suggestMailsLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.suggestMails = mails
    })
    expect(reducer(state, actions.suggestMailsLoaded(mails))).toEqual(
      expectedResult
    )
  })

  it('should handle the  loadSuggestMailsFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.suggestMails = []
    })
    expect(reducer(state, actions.loadSuggestMailsFail())).toEqual(
      expectedResult
    )
  })

  it('should handle the  portalDashboardsLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.portalDashboards[scheduleId] = [dashboard]
    })
    expect(reducer(state, actions.portalDashboardsLoaded(scheduleId, [dashboard]))).toEqual(
      expectedResult
    )
  })

})
