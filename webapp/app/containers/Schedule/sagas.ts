import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import {ADD_SCHEDULES, DELETE_SCHEDULES, LOAD_SCHEDULES, CHANGE_SCHEDULE_STATUS, UPDATE_SCHEDULES} from './constants'
import {
  schedulesLoaded,
  loadSchedulesFail,
  scheduleAdded,
  addScheduleFail,
  scheduleDeleted,
  deleteScheduleFail,
  currentScheduleStatusChanged,
  changeSchedulesStatusFail,
  scheduleUpdated,
  updateScheduleFail
} from './actions'
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'
const message = require('antd/lib/message')

export function* getSchedules ({payload}) {
  try {
    const asyncData = yield call(request, `${api.schedule}?projectId=${payload.pid}`)
    const schedules = readListAdapter(asyncData)
    yield put(schedulesLoaded(schedules))
  } catch (err) {
    yield put(loadSchedulesFail())
    message.error('加载 Schedules 列表失败')
  }
}

export function* addSchedules ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.schedule,
      data: writeAdapter(payload.schedule)
    })
    const result = readObjectAdapter(asyncData)
    yield put(scheduleAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addScheduleFail())
    message.error('新增失败')
  }
}

export function* deleteSchedule ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.schedule}/${payload.id}`
    })
    yield put(scheduleDeleted(payload.id))
  } catch (err) {
    yield put(deleteScheduleFail())
    message.error('删除失败')
  }
}

export function* changeScheduleStatus ({ payload }) {
  try {
    let status = ''
    switch (payload.currentStatus) {
      case 'new':
        status = 'start'
        break
      case 'failed':
        status = 'start'
        break
      case 'started':
        status = 'stop'
        break
      case 'stopped':
        status = 'start'
        break
      default:
        break
    }
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.schedule}/${status}/${payload.id}`
    })
    const result = readObjectAdapter(asyncData)
    yield put(currentScheduleStatusChanged(payload.id, result))
  } catch (err) {
    yield put(changeSchedulesStatusFail())
    message.error('更改状态失败')
  }
}

export function* updateSchedule ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: api.schedule,
      data: writeAdapter(payload.schedule)
    })
    const result = readObjectAdapter(asyncData)
    yield put(scheduleUpdated(result))
    payload.resolve()
  } catch (err) {
    yield put(updateScheduleFail())
    message.error('修改失败')
  }
}

export default function* rootScheduleSaga (): IterableIterator<any> {
  yield [
    takeEvery(LOAD_SCHEDULES, getSchedules as any),
    takeEvery(ADD_SCHEDULES, addSchedules as any),
    takeEvery(DELETE_SCHEDULES, deleteSchedule as any),
    takeEvery(CHANGE_SCHEDULE_STATUS, changeScheduleStatus as any),
    takeEvery(UPDATE_SCHEDULES, updateSchedule as any)
  ]
}
