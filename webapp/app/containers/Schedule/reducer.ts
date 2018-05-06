/*
 *
 * Schedule reducer
 *
 */

import { fromJS } from 'immutable'
import {
  LOAD_SCHEDULES,
  LOAD_SCHEDULES_SUCCESS,
  ADD_SCHEDULES,
  ADD_SCHEDULES_SUCCESS,
  DELETE_SCHEDULES,
  DELETE_SCHEDULES_SUCCESS,
  CHANGE_SCHEDULE_STATUS,
  CHANGE_SCHEDULE_STATUS_SUCCESS,
  UPDATE_SCHEDULES,
  UPDATE_SCHEDULES_SUCCESS
} from './constants'
import {
  LOAD_DASHBOARDS_SUCCESS,
  LOAD_DASHBOARD_DETAIL_SUCCESS
} from '../Dashboard/constants'
import {
  LOAD_WIDGETS_SUCCESS
} from '../Widget/constants'

const initialState = fromJS({
  widgets: false,
  schedule: false,
  dashboards: false,
  currentDashboard: false
})

function scheduleReducer (state = initialState, action) {
  const { type, payload } = action
  const schedule = state.get('schedule')
  const dashboards = state.get('dashboards')
  switch (type) {
    case LOAD_WIDGETS_SUCCESS:
      return state.set('widgets', payload.widgets)
    case LOAD_DASHBOARDS_SUCCESS:
      return state.set('dashboards', payload.dashboards)
    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state
        .set('currentDashboard', payload.dashboard)
    case LOAD_SCHEDULES:
      return state
    case LOAD_SCHEDULES_SUCCESS:
      return state.set('schedule', payload.schedules)
    case ADD_SCHEDULES_SUCCESS:
      if (schedule) {
        schedule.unshift(payload.result)
        return state.set('schedule', schedule.slice())
      } else {
        return state.set('schedule', [payload.result])
      }
    case DELETE_SCHEDULES:
      return state
    case DELETE_SCHEDULES_SUCCESS:
      return state.set('schedule', schedule.filter((g) => g.id !== payload.id))
    case CHANGE_SCHEDULE_STATUS:
      return state
    case CHANGE_SCHEDULE_STATUS_SUCCESS:
      return state.set('schedule', schedule.map((s) => s.id === payload.id ? payload.schedules : s))
    case UPDATE_SCHEDULES:
      return state
    case UPDATE_SCHEDULES_SUCCESS:
      return state.set('schedule', schedule.map((s) => s.id === payload.result.id ? payload.result : s))
    default:
      return state
  }
}

export default scheduleReducer
