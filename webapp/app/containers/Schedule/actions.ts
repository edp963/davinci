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

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'
import { IUserInfo, ISchedule, JobStatus, JobType } from './components/types'

export const ScheduleActions = {
  loadSchedules(projectId: number) {
    return {
      type: ActionTypes.LOAD_SCHEDULES,
      payload: {
        projectId
      }
    }
  },
  schedulesLoaded(schedules: ISchedule[]) {
    return {
      type: ActionTypes.LOAD_SCHEDULES_SUCCESS,
      payload: {
        schedules
      }
    }
  },
  loadSchedulesFail() {
    return {
      type: ActionTypes.LOAD_SCHEDULES_FAILURE,
      payload: {}
    }
  },
  loadScheduleDetail(scheduleId: number) {
    return {
      type: ActionTypes.LOAD_SCHEDULE_DETAIL,
      payload: {
        scheduleId
      }
    }
  },
  scheduleDetailLoaded(schedule: ISchedule) {
    return {
      type: ActionTypes.LOAD_SCHEDULE_DETAIL_SUCCESS,
      payload: {
        schedule
      }
    }
  },
  loadScheduleDetailFail() {
    return {
      type: ActionTypes.LOAD_SCHEDULE_DETAIL_FAILURE,
      payload: {}
    }
  },
  addSchedule(schedule: ISchedule, resolve: () => void) {
    return {
      type: ActionTypes.ADD_SCHEDULE,
      payload: {
        schedule,
        resolve
      }
    }
  },
  scheduleAdded(result: ISchedule) {
    return {
      type: ActionTypes.ADD_SCHEDULE_SUCCESS,
      payload: {
        result
      }
    }
  },
  addScheduleFail() {
    return {
      type: ActionTypes.ADD_SCHEDULE_FAILURE,
      payload: {}
    }
  },
  editSchedule(schedule: ISchedule, resolve: () => void) {
    return {
      type: ActionTypes.EDIT_SCHEDULE,
      payload: {
        schedule,
        resolve
      }
    }
  },
  scheduleEdited(result: ISchedule) {
    return {
      type: ActionTypes.EDIT_SCHEDULE_SUCCESS,
      payload: {
        result
      }
    }
  },
  editScheduleFail() {
    return {
      type: ActionTypes.EDIT_SCHEDULE_FAILURE,
      payload: {}
    }
  },
  deleteSchedule(id: number) {
    return {
      type: ActionTypes.DELETE_SCHEDULE,
      payload: {
        id
      }
    }
  },
  scheduleDeleted(id: number) {
    return {
      type: ActionTypes.DELETE_SCHEDULE_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteScheduleFail() {
    return {
      type: ActionTypes.DELETE_SCHEDULE_FAILURE,
      payload: {}
    }
  },
  changeSchedulesStatus(id: number, currentStatus: JobStatus) {
    return {
      type: ActionTypes.CHANGE_SCHEDULE_STATUS,
      payload: {
        id,
        currentStatus
      }
    }
  },
  scheduleStatusChanged(schedule: ISchedule) {
    return {
      type: ActionTypes.CHANGE_SCHEDULE_STATUS_SUCCESS,
      payload: {
        schedule
      }
    }
  },
  changeScheduleJobType(jobType: JobType) {
    return {
      type: ActionTypes.CHANGE_SCHEDULE_JOB_TYPE,
      payload: {
        jobType
      }
    }
  },
  changeSchedulesStatusFail() {
    return {
      type: ActionTypes.CHANGE_SCHEDULE_STATUS_FAILURE,
      payload: {}
    }
  },

  executeScheduleImmediately (id: number, resolve: () => void) {
    return {
      type: ActionTypes.EXECUTE_SCHEDULE_IMMEDIATELY,
      payload: {
        id,
        resolve
      }
    }
  },

  resetScheduleState () {
    return {
      type: ActionTypes.RESET_SCHEDULE_STATE,
      payload: {}
    }
  },

  loadSuggestMails(keyword: string) {
    return {
      type: ActionTypes.LOAD_SUGGEST_MAILS,
      payload: {
        keyword
      }
    }
  },
  suggestMailsLoaded(mails: IUserInfo[]) {
    return {
      type: ActionTypes.LOAD_SUGGEST_MAILS_SUCCESS,
      payload: {
        mails
      }
    }
  },
  loadSuggestMailsFail() {
    return {
      type: ActionTypes.LOAD_SUGGEST_MAILS_FAILURE,
      payload: {}
    }
  },

  portalDashboardsLoaded(portalId: number, dashboards: any[]) {
    return {
      type: ActionTypes.LOAD_PORTAL_DASHBOARDS_SUCCESS,
      payload: {
        portalId,
        dashboards
      }
    }
  },

  loadVizs(projectId) {
    return {
      type: ActionTypes.LOAD_VIZS,
      payload: {
        projectId
      }
    }
  },
  vizsLoaded(result) {
    return {
      type: ActionTypes.LOAD_VIZS_SUCCESS,
      payload: {
        result
      }
    }
  },
  loadVizsFail() {
    return {
      type: ActionTypes.LOAD_VIZS_FAILUER
    }
  }
}


const mockAction = returnType(ScheduleActions)
export type ScheduleActionType = typeof mockAction

export default ScheduleActions
