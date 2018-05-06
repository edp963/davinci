/*
 *
 * Schedule actions
 *
 */

import {
  ADD_SCHEDULES,
  LOAD_SCHEDULES,
  DELETE_SCHEDULES,
  ADD_SCHEDULES_SUCCESS,
  LOAD_SCHEDULES_SUCCESS,
  DELETE_SCHEDULES_SUCCESS,
  LOAD_SHEDULE_DETAIL,
  UPDATE_SCHEDULES,
  UPDATE_SCHEDULES_SUCCESS,
  UPDATE_SCHEDULES_FAILURE,
  CHANGE_SCHEDULE_STATUS,
  CHANGE_SCHEDULE_STATUS_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadSchedules = promiseActionCreator(LOAD_SCHEDULES)
export const addSchedule = promiseActionCreator(ADD_SCHEDULES, ['schedule'])
export const updateSchedule = promiseActionCreator(UPDATE_SCHEDULES, ['schedule'])
export const deleteSchedule = promiseActionCreator(DELETE_SCHEDULES, ['id'])
export const loadScheduleDetail = promiseActionCreator(LOAD_SHEDULE_DETAIL, ['id'])
export const changeSchedulesStatus = promiseActionCreator(CHANGE_SCHEDULE_STATUS, ['id', 'currentStatus'])

export function schedulesLoaded (schedules) {
  return {
    type: LOAD_SCHEDULES_SUCCESS,
    payload: {
      schedules
    }
  }
}

export function scheduleAdded (result) {
  return {
    type: ADD_SCHEDULES_SUCCESS,
    payload: {
      result
    }
  }
}

export function scheduleUpdated (result) {
  return {
    type: UPDATE_SCHEDULES_SUCCESS,
    payload: {
      result
    }
  }
}

export function updateScheduleFail () {
  return {
    type: UPDATE_SCHEDULES_FAILURE
  }
}

export function scheduleDeleted (id) {
  return {
    type: DELETE_SCHEDULES_SUCCESS,
    payload: {
      id
    }
  }
}

export function currentScheduleStatusChanged (id, schedules) {
  return {
    type: CHANGE_SCHEDULE_STATUS_SUCCESS,
    payload: {
      id,
      schedules
    }
  }
}

