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

import { ActionTypes } from 'app/containers/Schedule/constants'
import actions from 'app/containers/Schedule/actions'
import { mockStore } from './fixtures'

describe('Schedule Actions', () => {
  const {
    schedule,
    projectId,
    mails,
    schedules,
    scheduleId,
    resolve,
    jobType
  } = mockStore
  describe('loadSchedules', () => {
    it('loadSchedules should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULES,
        payload: {
          projectId
        }
      }
      expect(actions.loadSchedules(projectId)).toEqual(expectedResult)
    })
  })
  describe('schedulesLoaded', () => {
    it('schedulesLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULES_SUCCESS,
        payload: {
          schedules
        }
      }
      expect(actions.schedulesLoaded(schedules)).toEqual(expectedResult)
    })
  })
  describe('loadSchedulesFail', () => {
    it('loadSchedulesFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULES_FAILURE,
        payload: {}
      }
      expect(actions.loadSchedulesFail()).toEqual(expectedResult)
    })
  })
  describe('loadScheduleDetail', () => {
    it('loadScheduleDetail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULE_DETAIL,
        payload: {
          scheduleId
        }
      }
      expect(actions.loadScheduleDetail(scheduleId)).toEqual(expectedResult)
    })
  })
  describe('scheduleDetailLoaded', () => {
    it('scheduleDetailLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULE_DETAIL_SUCCESS,
        payload: {
          schedule
        }
      }
      expect(actions.scheduleDetailLoaded(schedule)).toEqual(expectedResult)
    })
  })
  describe('loadScheduleDetailFail', () => {
    it('loadScheduleDetailFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SCHEDULE_DETAIL_FAILURE,
        payload: {}
      }
      expect(actions.loadScheduleDetailFail()).toEqual(expectedResult)
    })
  })
  describe('addSchedule', () => {
    it('addSchedule should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SCHEDULE,
        payload: {
          schedule,
          resolve
        }
      }
      expect(actions.addSchedule(schedule, resolve)).toEqual(expectedResult)
    })
  })
  describe('scheduleAdded', () => {
    it('scheduleAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SCHEDULE_SUCCESS,
        payload: {
          result: schedule
        }
      }
      expect(actions.scheduleAdded(schedule)).toEqual(expectedResult)
    })
  })
  describe('addScheduleFail', () => {
    it('addScheduleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SCHEDULE_FAILURE,
        payload: {}
      }
      expect(actions.addScheduleFail()).toEqual(expectedResult)
    })
  })
  describe('editSchedule', () => {
    it('editSchedule should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SCHEDULE,
        payload: {
          schedule,
          resolve
        }
      }
      expect(actions.editSchedule(schedule, resolve)).toEqual(expectedResult)
    })
  })
  describe('scheduleEdited', () => {
    it('scheduleEdited should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SCHEDULE_SUCCESS,
        payload: {
          result: schedule
        }
      }
      expect(actions.scheduleEdited(schedule)).toEqual(expectedResult)
    })
  })
  describe('editScheduleFail', () => {
    it('editScheduleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SCHEDULE_FAILURE,
        payload: {}
      }
      expect(actions.editScheduleFail()).toEqual(expectedResult)
    })
  })
  describe('deleteSchedule', () => {
    it('deleteSchedule should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SCHEDULE,
        payload: {
          id: scheduleId
        }
      }
      expect(actions.deleteSchedule(scheduleId)).toEqual(expectedResult)
    })
  })
  describe('scheduleDeleted', () => {
    it('scheduleDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SCHEDULE_SUCCESS,
        payload: {
          id: scheduleId
        }
      }
      expect(actions.scheduleDeleted(scheduleId)).toEqual(expectedResult)
    })
  })

  describe('deleteScheduleFail', () => {
    it('deleteScheduleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SCHEDULE_FAILURE,
        payload: {}
      }
      expect(actions.deleteScheduleFail()).toEqual(expectedResult)
    })
  })
  describe('changeSchedulesStatus', () => {
    it('changeSchedulesStatus should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_SCHEDULE_STATUS,
        payload: {
          id: scheduleId,
          currentStatus: 'new'
        }
      }
      expect(actions.changeSchedulesStatus(scheduleId, 'new')).toEqual(
        expectedResult
      )
    })
  })
  describe('scheduleStatusChanged', () => {
    it('scheduleStatusChanged should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_SCHEDULE_STATUS_SUCCESS,
        payload: {
          schedule
        }
      }
      expect(actions.scheduleStatusChanged(schedule)).toEqual(expectedResult)
    })
  })
  describe('changeScheduleJobType', () => {
    it('changeScheduleJobType should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_SCHEDULE_JOB_TYPE,
        payload: {
          jobType
        }
      }
      expect(actions.changeScheduleJobType(jobType)).toEqual(expectedResult)
    })
  })
  describe('changeSchedulesStatusFail', () => {
    it('changeSchedulesStatusFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_SCHEDULE_STATUS_FAILURE,
        payload: {}
      }
      expect(actions.changeSchedulesStatusFail()).toEqual(expectedResult)
    })
  })
  describe('executeScheduleImmediately', () => {
    it('executeScheduleImmediately should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EXECUTE_SCHEDULE_IMMEDIATELY,
        payload: {
          id: scheduleId,
          resolve
        }
      }
      expect(actions.executeScheduleImmediately(scheduleId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('resetScheduleState', () => {
    it('resetScheduleState should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.RESET_SCHEDULE_STATE,
        payload: {}
      }
      expect(actions.resetScheduleState()).toEqual(expectedResult)
    })
  })
  describe('loadSuggestMails', () => {
    it('loadSuggestMails should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SUGGEST_MAILS,
        payload: {
          keyword: ''
        }
      }
      expect(actions.loadSuggestMails('')).toEqual(expectedResult)
    })
  })
  describe('suggestMailsLoaded', () => {
    it('suggestMailsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SUGGEST_MAILS_SUCCESS,
        payload: {
          mails
        }
      }
      expect(actions.suggestMailsLoaded(mails)).toEqual(expectedResult)
    })
  })
  describe('loadSuggestMailsFail', () => {
    it('loadSuggestMailsFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SUGGEST_MAILS_FAILURE,
        payload: {}
      }
      expect(actions.loadSuggestMailsFail()).toEqual(expectedResult)
    })
  })
  describe('portalDashboardsLoaded', () => {
    it('portalDashboardsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PORTAL_DASHBOARDS_SUCCESS,
        payload: {
          portalId: scheduleId,
          dashboards: []
        }
      }
      expect(actions.portalDashboardsLoaded(scheduleId, [])).toEqual(
        expectedResult
      )
    })
  })
  describe('loadVizs', () => {
    it('loadVizs should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_VIZS,
        payload: {
          projectId: scheduleId
        }
      }
      expect(actions.loadVizs(scheduleId)).toEqual(expectedResult)
    })
  })
  describe('vizsLoaded', () => {
    it('vizsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_VIZS_SUCCESS,
        payload: {
          result: schedule
        }
      }
      expect(actions.vizsLoaded(schedule)).toEqual(expectedResult)
    })
  })
  describe('loadVizsFail', () => {
    it('loadVizsFail should return the correct type', () => {
      const expectedResult = { type: ActionTypes.LOAD_VIZS_FAILUER }
      expect(actions.loadVizsFail()).toEqual(expectedResult)
    })
  })
})
