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
  ADD_SCHEDULES_FAILURE,
  LOAD_SCHEDULES_SUCCESS,
  LOAD_SCHEDULES_FAILUER,
  DELETE_SCHEDULES_SUCCESS,
  // LOAD_SHEDULE_DETAIL,
  UPDATE_SCHEDULES,
  UPDATE_SCHEDULES_SUCCESS,
  UPDATE_SCHEDULES_FAILURE,
  CHANGE_SCHEDULE_STATUS,
  CHANGE_SCHEDULE_STATUS_SUCCESS,
  DELETE_SCHEDULES_FAILURE,
  CHANGE_SCHEDULE_STATUS_FAILURE,
  LOAD_VIZS,
  LOAD_VIZS_SUCCESS,
  LOAD_VIZS_FAILUER
} from './constants'

// export const loadScheduleDetail = promiseActionCreator(LOAD_SHEDULE_DETAIL, ['id'])

export function loadSchedules (pid) {
  return {
    type: LOAD_SCHEDULES,
    payload: {
      pid
    }
  }
}

export function schedulesLoaded (schedules) {
  return {
    type: LOAD_SCHEDULES_SUCCESS,
    payload: {
      schedules
    }
  }
}

export function loadSchedulesFail () {
  return {
    type: LOAD_SCHEDULES_FAILUER
  }
}

export function addSchedule (schedule, resolve) {
  return {
    type: ADD_SCHEDULES,
    payload: {
      schedule,
      resolve
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

export function addScheduleFail () {
  return {
    type: ADD_SCHEDULES_FAILURE
  }
}

export function updateSchedule (schedule, resolve) {
  return {
    type: UPDATE_SCHEDULES,
    payload: {
      schedule,
      resolve
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

export function deleteSchedule (id) {
  return {
    type: DELETE_SCHEDULES,
    payload: {
      id
    }
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

export function deleteScheduleFail () {
  return {
    type: DELETE_SCHEDULES_FAILURE
  }
}

export function changeSchedulesStatus (id, currentStatus) {
  return {
    type: CHANGE_SCHEDULE_STATUS,
    payload: {
      id,
      currentStatus
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

export function changeSchedulesStatusFail () {
  return {
    type: CHANGE_SCHEDULE_STATUS_FAILURE
  }
}

export function loadVizs (pid) {
  return {
    type: LOAD_VIZS,
    payload: {
      pid
    }
  }
}

export function vizsLoaded (result) {
  return {
    type: LOAD_VIZS_SUCCESS,
    payload: {
      result
    }
  }
}

export function loadVizsFail () {
  return {
    type: LOAD_VIZS_FAILUER
  }
}
