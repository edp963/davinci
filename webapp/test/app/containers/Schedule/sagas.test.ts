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

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import {call} from 'redux-saga/effects'
import request from 'app/utils/request'
import actions from 'app/containers/Schedule/actions'
import {
  getSchedules,
  getScheduleDetail,
  addSchedule,
  deleteSchedule,
  editSchedule,
  getSuggestMails,
  getVizsData,
  changeScheduleStatus,
  executeScheduleImmediately
} from 'app/containers/Schedule/sagas'
import { mockStore } from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('Schedule Sagas', () => {
  const {
    schedule,
    projectId,
    schedules,
    keywords,
    jobStatus,
    mails,
    api
  } = mockStore
  describe('getSchedules Saga', () => {
    const getSchedulesActions = actions.loadSchedules(projectId)
    it('should dispatch the schedulesLoaded action if it requests the data successfully', () => {
      return expectSaga(getSchedules, getSchedulesActions)
        .provide([[matchers.call.fn(request), getMockResponse(projectId)]])
        .dispatch(actions.schedulesLoaded(schedules))
        .run()
    })
    it('should call the loadSchedulesFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getSchedules, getSchedulesActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadSchedulesFail())
        .run()
    })
  })

  describe('getScheduleDetail Saga', () => {
    const getScheduleDetailActions = actions.loadScheduleDetail(schedule.id)
    it('should dispatch the scheduleDetailLoaded action if it requests the data successfully', () => {
      return expectSaga(getScheduleDetail, getScheduleDetailActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .dispatch(actions.scheduleDetailLoaded(schedule))
        .run()
    })
    it('should call the loadScheduleDetailFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getScheduleDetail, getScheduleDetailActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadScheduleDetailFail())
        .run()
    })
  })

  describe('addSchedule Saga', () => {
    const addScheduleActions = actions.addSchedule(schedule, () => void 0)
    it('should dispatch the scheduleAdded action if it requests the data successfully', () => {
      return expectSaga(addSchedule, addScheduleActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .dispatch(actions.scheduleAdded(schedule))
        .run()
    })
    it('should call the addScheduleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addSchedule, addScheduleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addScheduleFail())
        .run()
    })
  })

  describe('deleteSchedule Saga', () => {
    const deleteScheduleActions = actions.deleteSchedule(schedule.id)
    it('should dispatch the scheduleDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteSchedule, deleteScheduleActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule.id)]])
        .put(actions.scheduleDeleted(schedule.id))
        .run()
    })
    it('should call the deleteScheduleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteSchedule, deleteScheduleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteScheduleFail())
        .run()
    })
  })

  describe('editSchedule Saga', () => {
    const editScheduleActions = actions.editSchedule(schedule, () => void 0)
    it('should dispatch the scheduleEdited action if it requests the data successfully', () => {
      return expectSaga(editSchedule, editScheduleActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .put(actions.scheduleEdited(schedule))
        .run()
    })
    it('should call the editScheduleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(editSchedule, editScheduleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.editScheduleFail())
        .run()
    })
  })

  describe('getSuggestMails Saga', () => {
    const loadSuggestMailsActions = actions.loadSuggestMails(keywords)
    it('should dispatch the suggestMailsLoaded action if it requests the data successfully', () => {
      return expectSaga(getSuggestMails, loadSuggestMailsActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .dispatch(actions.suggestMailsLoaded(mails))
        .run()
    })
    it('should call the loadSuggestMailsFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getSuggestMails, loadSuggestMailsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadSuggestMailsFail())
        .run()
    })
  })

  describe('executeScheduleImmediately Saga', () => {
    const executeScheduleImmediatelyActions = actions.executeScheduleImmediately(
      schedule.id,
      () => void 0
    )
    it('should dispatch the executeScheduleImmediatelyActions action if it requests the data successfully', () => {
      return expectSaga(
        executeScheduleImmediately,
        executeScheduleImmediatelyActions
      )
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .run()
    })
  })

  describe('changeScheduleStatus Saga', () => {
    const changeScheduleStatusActions = actions.changeSchedulesStatus(
      schedule.id,
      jobStatus
    )
    it('should dispatch the scheduleStatusChanged action if it requests the data successfully', () => {
      return expectSaga(changeScheduleStatus, changeScheduleStatusActions)
        .provide([[matchers.call.fn(request), getMockResponse(schedule)]])
        .dispatch(actions.scheduleStatusChanged(schedule))
        .run()
    })
    it('should call the changeSchedulesStatusFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(changeScheduleStatus, changeScheduleStatusActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.changeSchedulesStatusFail())
        .run()
    })
  })

  describe('getVizsData Saga', () => {
    const loadVizsActions = actions.loadVizs(projectId)
    it('should dispatch the vizsLoaded action if it requests the data successfully', () => {
      return expectSaga(getVizsData, loadVizsActions)
        .provide([
          [call(request, api), getMockResponse(projectId)],
          [matchers.call.fn(request), getMockResponse(projectId)]
        ])
        .dispatch(actions.vizsLoaded(schedule))
        .run()
    })

    it('should call the loadVizsFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getVizsData, loadVizsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadVizsFail())
        .run()
    })
  })
})
