import { call, put, all, takeEvery } from 'redux-saga/effects'

import {ADD_SCHEDULES, DELETE_SCHEDULES, LOAD_SCHEDULES, CHANGE_SCHEDULE_STATUS, UPDATE_SCHEDULES, LOAD_VIZS} from './constants'
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
  updateScheduleFail,
  vizsLoaded,
  loadVizsFail
} from './actions'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'
import { message } from 'antd'

export function* getSchedules ({payload}) {
  try {
    const asyncData = yield call(request, `${api.schedule}?projectId=${payload.pid}`)
    const schedules = asyncData.payload
    yield put(schedulesLoaded(schedules))
  } catch (err) {
    yield put(loadSchedulesFail())
    errorHandler(err)
  }
}

export function* addSchedules ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.schedule,
      data: payload.schedule
    })
    const result = asyncData.payload
    yield put(scheduleAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addScheduleFail())
    errorHandler(err)
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
    errorHandler(err)
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
    const result = asyncData.payload
    yield put(currentScheduleStatusChanged(payload.id, result))
  } catch (err) {
    yield put(changeSchedulesStatusFail())
    errorHandler(err)
  }
}

export function* updateSchedule ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.schedule}/${payload.schedule.id}`,
      data: payload.schedule
    })
    const result = asyncData.payload
    yield put(scheduleUpdated(result))
    payload.resolve()
  } catch (err) {
    yield put(updateScheduleFail())
    errorHandler(err)
  }
}

export function* getVizsData ({ payload }) {
  const { pid } = payload
  try {
    const portalsData = yield call(request, `${api.portal}?projectId=${pid}`)
    const portalsList = portalsData.payload


    const displayData = yield call(request, `${api.display}?projectId=${pid}`)
    const displayList = displayData.payload.map((display) => ({
      ...display,
      vizType: 'display',
      contentType: 'display',
      title: `${display.name}`,
      key: display.name,
      value: `${display.id}(d)`,
      isLeaf: true
    }))

    const list = yield all(portalsList.map((portals, index) => {
      return call(request, `${api.portal}/${portals.id}/dashboards`)
    }))
    const portals = portalsList.map((portal, index) => {
      portal.children =  buildTree(list[index].payload)
      return {
        ...portal,
        vizType: 'portal',
        contentType: 'portal',
        title: `${portal.name}`,
        key: portal.name,
        value: `${portal.id}(p)`,
        isLeaf: !portal.children.length
      }
    })
    const result = [{
      contentType: 'display',
      title: `Display`,
      key: 'DISPLAYS',
      value: 'display',
      isTitle: true,
      children: displayList
    },
    {
      contentType: 'portal',
      title: `Dashboard`,
      key: 'DASHBOARDS',
      value: 'portal',
      isTitle: true,
      children: portals
    }]
    yield put(vizsLoaded(result))
  } catch (err) {
    yield put(loadVizsFail())
    message.error('获取失败')
  }

  function buildTree (list) {
    const temp = {}
    const tree = {}
    const result = []
    list.forEach((l, index) => temp[list[index].id] = list[index])
    for (const i in temp) {
      if (temp[i].parentId) {
        if (!temp[temp[i].parentId].children) {
          temp[temp[i].parentId].children = {}
        }
        temp[temp[i].parentId].children[temp[i].id] = temp[i]
      } else {
        tree[temp[i].id] =  temp[i]
      }
    }
    function arr (tree, wrapper) {
      for (const attr in tree) {
        if (tree[attr]['children']) {
          tree[attr] = {
            ...tree[attr],
            ...{
                vizType: 'dashboard',
                contentType: 'portal',
                label: `${tree[attr].name}`,
                key: tree[attr].name,
                value: `${tree[attr].id}(p)`,
                isLeaf: true
            }
          }
          wrapper.push(tree[attr])
          const children = tree[attr]['children']
          tree[attr]['children'] = []
          arr(children, tree[attr]['children'])
        } else {
          tree[attr] = {
            ...tree[attr],
            ...{
                vizType: 'dashboard',
                contentType: 'portal',
                label: `${tree[attr].name}`,
                key: tree[attr].name,
                value: `${tree[attr].id}(p)`,
                isLeaf: true
            }
          }
          wrapper.push(tree[attr])
        }
      }
    }
    arr(tree, result)
    return result
  }
}

export default function* rootScheduleSaga (): IterableIterator<any> {
  yield all([
    takeEvery(LOAD_SCHEDULES, getSchedules as any),
    takeEvery(ADD_SCHEDULES, addSchedules as any),
    takeEvery(DELETE_SCHEDULES, deleteSchedule as any),
    takeEvery(CHANGE_SCHEDULE_STATUS, changeScheduleStatus as any),
    takeEvery(UPDATE_SCHEDULES, updateSchedule as any),
    takeEvery(LOAD_VIZS, getVizsData as any)
  ])
}
