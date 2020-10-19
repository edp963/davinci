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
import { mockAnonymousAction } from 'test/utils/fixtures'
import { mockStore } from './fixtures'

describe('projectsReducer', () => {
  const { scheduleId, schedules, schedule } = mockStore
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

  it('should handle the  relRoleProjectLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.table = false
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
})
