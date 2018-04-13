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

const initialState = fromJS({
  schedule: false
})

function scheduleReducer (state = initialState, {type, payload}) {
  const schedule = state.get('schedule')
  switch (type) {
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
      return state.set('schedule', schedule.filter(g => g.id !== payload.id))
    case CHANGE_SCHEDULE_STATUS:
      return state
    case CHANGE_SCHEDULE_STATUS_SUCCESS:
      return state.set('schedule', schedule.map(s => { if (s.id === payload.id) return payload.schedules }))
    case UPDATE_SCHEDULES:
      return state
    case UPDATE_SCHEDULES_SUCCESS:
      return state.set('schedule', schedule.map(s => { if (s.id === payload.result.id) return payload.result }))
    default:
      return state
  }
}

export default scheduleReducer
