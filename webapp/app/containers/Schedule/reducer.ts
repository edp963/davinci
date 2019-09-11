/*
 *
 * Schedule reducer
 *
 */

import produce from 'immer'
import {
  LOAD_SCHEDULES,
  LOAD_SCHEDULES_SUCCESS,
  LOAD_SCHEDULES_FAILUER,
  ADD_SCHEDULES,
  ADD_SCHEDULES_SUCCESS,
  ADD_SCHEDULES_FAILURE,
  DELETE_SCHEDULES,
  DELETE_SCHEDULES_SUCCESS,
  CHANGE_SCHEDULE_STATUS,
  CHANGE_SCHEDULE_STATUS_SUCCESS,
  UPDATE_SCHEDULES,
  UPDATE_SCHEDULES_SUCCESS,
  UPDATE_SCHEDULES_FAILURE,
  CHANGE_SCHEDULE_STATUS_FAILURE,
  LOAD_VIZS_SUCCESS,
  LOAD_VIZS_FAILUER
} from './constants'
import {
  LOAD_DASHBOARDS_SUCCESS,
  LOAD_DASHBOARD_DETAIL_SUCCESS
} from '../Dashboard/constants'
import {
  LOAD_WIDGETS_SUCCESS
} from '../Widget/constants'

const initialState = {
  widgets: false,
  schedule: null,
  dashboards: false,
  currentDashboard: false,
  tableLoading: false,
  formLoading: false,
  vizs: false
}

const scheduleReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_WIDGETS_SUCCESS:
        draft.widgets = action.payload.widgets
        break

      case LOAD_DASHBOARDS_SUCCESS:
        draft.dashboards = action.payload.dashboards
        break

      case LOAD_DASHBOARD_DETAIL_SUCCESS:
        draft.currentDashboard = action.payload.dashboard
        break

      case LOAD_SCHEDULES:
        draft.tableLoading = true
        break

      case LOAD_SCHEDULES_SUCCESS:
        draft.schedule = action.payload.schedules
        draft.tableLoading = false
        break

      case LOAD_SCHEDULES_FAILUER:
        draft.tableLoading = false
        break

      case ADD_SCHEDULES:
        draft.formLoading = true
        break

      case ADD_SCHEDULES_SUCCESS:
        if (draft.schedule) {
          draft.schedule.unshift(action.payload.result)
          draft.formLoading = false
        } else {
          draft.schedule = [action.payload.result]
          draft.formLoading = false
        }
        break

      case ADD_SCHEDULES_FAILURE:
        draft.formLoading = false
        break

      case DELETE_SCHEDULES:
        break

      case DELETE_SCHEDULES_SUCCESS:
        draft.schedule = draft.schedule.filter((g) => g.id !== action.payload.id)
        break

      case CHANGE_SCHEDULE_STATUS:
        break

      case CHANGE_SCHEDULE_STATUS_SUCCESS:
        draft.schedule.splice(draft.schedule.findIndex(({ id }) => id === action.payload.id), 1, action.payload.schedules)
        break

      case CHANGE_SCHEDULE_STATUS_FAILURE:
        break

      case UPDATE_SCHEDULES:
        draft.formLoading = true
        break

      case UPDATE_SCHEDULES_SUCCESS:
        draft.schedule.splice(draft.schedule.findIndex(({ id }) => id === action.payload.result.id), 1, action.payload.result)
        draft.formLoading = false
        break

      case UPDATE_SCHEDULES_FAILURE:
        draft.formLoading = false
        break

      case LOAD_VIZS_SUCCESS:
        draft.vizs = action.payload.result
        break

      case LOAD_VIZS_FAILUER:
        break
    }
  })

export default scheduleReducer
