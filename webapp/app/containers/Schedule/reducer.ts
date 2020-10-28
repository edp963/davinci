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
import { ActionTypes, EmptySchedule, EmptyWeChatWorkSchedule } from './constants'
import { ScheduleActionType } from './actions'

export const initialState = {
  schedules: [],
  editingSchedule: EmptySchedule,
  loading: {
    table: false,
    schedule: false,
    edit: false
  },
  suggestMails: [],
  vizs: false,
  portalDashboards: {} // @TODO refactor to viz reducer
}

const scheduleReducer = (state = initialState, action: ScheduleActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.LOAD_SCHEDULES:
      case ActionTypes.DELETE_SCHEDULE:
        draft.loading.table = true
        break
      case ActionTypes.LOAD_SCHEDULES_SUCCESS:
        draft.schedules = action.payload.schedules
        draft.loading.table = false
        break
      case ActionTypes.DELETE_SCHEDULE_SUCCESS:
        draft.schedules = draft.schedules.filter(
          ({ id }) => id !== action.payload.id
        )
        draft.loading.table = false
        break
      case ActionTypes.LOAD_SCHEDULES_FAILURE:
      case ActionTypes.DELETE_SCHEDULE_FAILURE:
        draft.loading.table = false
        break

      case ActionTypes.LOAD_SCHEDULE_DETAIL:
        draft.loading.schedule = true
        break
      case ActionTypes.LOAD_SCHEDULE_DETAIL_SUCCESS:
        draft.editingSchedule = action.payload.schedule
        draft.loading.schedule = false
        break
      case ActionTypes.LOAD_SCHEDULE_DETAIL_FAILURE:
        draft.loading.schedule = false
        break

      case ActionTypes.ADD_SCHEDULE:
      case ActionTypes.EDIT_SCHEDULE:
        draft.loading.edit = true
        break
      case ActionTypes.ADD_SCHEDULE_SUCCESS:
        draft.schedules.unshift(action.payload.result)
        draft.loading.edit = false
        break
      case ActionTypes.EDIT_SCHEDULE_SUCCESS:
        draft.schedules.splice(
          draft.schedules.findIndex(
            ({ id }) => id === action.payload.result.id
          ),
          1,
          action.payload.result
        )
        draft.loading.edit = false
        break
      case ActionTypes.ADD_SCHEDULE_FAILURE:
      case ActionTypes.EDIT_SCHEDULE_FAILURE:
        draft.loading.edit = false
        break
      case ActionTypes.RESET_SCHEDULE_STATE:
        return initialState

      case ActionTypes.CHANGE_SCHEDULE_STATUS_SUCCESS:
        draft.schedules.splice(
          draft.schedules.findIndex(
            ({ id }) => id === action.payload.schedule.id
          ),
          1,
          action.payload.schedule
        )
        break
      case ActionTypes.CHANGE_SCHEDULE_JOB_TYPE:
          draft.editingSchedule = action.payload.jobType === 'email' ?　EmptySchedule : EmptyWeChatWorkSchedule
          break
      case ActionTypes.LOAD_SUGGEST_MAILS_SUCCESS:
        draft.suggestMails = action.payload.mails
        break
      case ActionTypes.LOAD_SUGGEST_MAILS_FAILURE:
        draft.suggestMails = []
        break
      case ActionTypes.LOAD_PORTAL_DASHBOARDS_SUCCESS:
        draft.portalDashboards[action.payload.portalId] = action.payload.dashboards
        break
      // @FIXME
      case ActionTypes.LOAD_VIZS_SUCCESS:
        draft.vizs = action.payload.result
        break
    }
  })

export default scheduleReducer
