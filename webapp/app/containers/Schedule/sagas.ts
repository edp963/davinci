import { call, put, all, takeEvery, takeLatest } from 'redux-saga/effects'

import { ActionTypes } from './constants'
import { ScheduleActions, ScheduleActionType, loadVizsFail, vizsLoaded } from './actions'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'
import { message } from 'antd'
import { IScheduleRaw, ISchedule } from './components/types'

export function* getSchedules (action: ScheduleActionType) {
  if (action.type !== ActionTypes.LOAD_SCHEDULES) { return }

  try {
    const asyncData = yield call(request, `${api.schedule}?projectId=${action.payload.projectId}`)
    const rawSchedules: IScheduleRaw[] = asyncData.payload
    const schedules = rawSchedules.map<ISchedule>((schedule) => ({ ...schedule, config: JSON.parse(schedule.config) }))
    yield put(ScheduleActions.schedulesLoaded(schedules))
  } catch (err) {
    yield put(ScheduleActions.loadSchedulesFail())
    errorHandler(err)
  }
}

export function* getScheduleDetail (action: ScheduleActionType) {
  if (action.type !== ActionTypes.LOAD_SCHEDULE_DETAIL) { return }

  try {
    const asyncData = yield call(request, `${api.schedule}/${action.payload.scheduleId}`)
    const schedule = asyncData.payload
    schedule.config = JSON.parse(schedule.config)
    yield put(ScheduleActions.scheduleDetailLoaded(schedule))
  } catch (err) {
    yield put(ScheduleActions.loadScheduleDetailFail())
    errorHandler(err)
  }
}

export function* addSchedule (action: ScheduleActionType) {
  if (action.type !== ActionTypes.ADD_SCHEDULE) { return }

  const { schedule, resolve } = action.payload
  const rawSchedule: IScheduleRaw = { ...schedule, config: JSON.stringify(schedule.config) }
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.schedule,
      data: rawSchedule
    })
    const result = asyncData.payload
    result.config = JSON.parse(result.config)
    yield put(ScheduleActions.scheduleAdded(result))
    resolve()
  } catch (err) {
    yield put(ScheduleActions.addScheduleFail())
    errorHandler(err)
  }
}

export function* deleteSchedule (action: ScheduleActionType) {
  if (action.type !== ActionTypes.DELETE_SCHEDULE) { return }

  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.schedule}/${id}`
    })
    yield put(ScheduleActions.scheduleDeleted(id))
  } catch (err) {
    yield put(ScheduleActions.deleteScheduleFail())
    errorHandler(err)
  }
}

export function* changeScheduleStatus (action: ScheduleActionType) {
  if (action.type !== ActionTypes.CHANGE_SCHEDULE_STATUS) { return }

  const { currentStatus, id } = action.payload
  try {
    let nextStatus = ''
    switch (currentStatus) {
      case 'new':
      case 'stopped':
      case 'failed':
        nextStatus = 'start'
        break
      case 'started':
        nextStatus = 'stop'
        break
    }
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.schedule}/${nextStatus}/${id}`
    })
    const result = asyncData.payload
    result.config = JSON.parse(result.config)
    yield put(ScheduleActions.scheduleStatusChanged(result))
  } catch (err) {
    yield put(ScheduleActions.changeSchedulesStatusFail())
    errorHandler(err)
  }
}

export function* executeScheduleImmediately (action: ScheduleActionType) {
  if (action.type !== ActionTypes.EXECUTE_SCHEDULE_IMMEDIATELY) { return }

  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'post',
      url: `${api.schedule}/execute/${id}`
    })
    resolve()
  } catch (err) {
    errorHandler(err)
  }
}

export function* editSchedule (action: ScheduleActionType) {
  if (action.type !== ActionTypes.EDIT_SCHEDULE) { return }

  const { schedule, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.schedule}/${schedule.id}`,
      data: schedule
    })
    yield put(ScheduleActions.scheduleEdited(schedule))
    resolve()
  } catch (err) {
    yield put(ScheduleActions.editScheduleFail())
    errorHandler(err)
  }
}

export function* getSuggestMails (action: ScheduleActionType) {
  if (action.type !== ActionTypes.LOAD_SUGGEST_MAILS) { return }

  const { keyword } = action.payload
  if (!keyword) {
    yield put(ScheduleActions.suggestMailsLoaded([]))
    return
  }
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.user}?keyword=${keyword}&includeSelf=true`
    })
    const mails = asyncData.payload
    yield put(ScheduleActions.suggestMailsLoaded(mails))
  } catch (err) {
    yield put(ScheduleActions.loadSuggestMailsFail())
    errorHandler(err)
  }
}

// @FIXME need remove
export function* getVizsData (action) {
  const { projectId } = action.payload
  try {
    const portalsData = yield call(request, `${api.portal}?projectId=${projectId}`)
    const portalsList = portalsData.payload

    const displayData = yield call(request, `${api.display}?projectId=${projectId}`)
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

export default function* rootScheduleSaga () {
  yield all([
    takeEvery(ActionTypes.LOAD_SCHEDULES, getSchedules),
    takeEvery(ActionTypes.LOAD_SCHEDULE_DETAIL, getScheduleDetail),
    takeEvery(ActionTypes.ADD_SCHEDULE, addSchedule),
    takeEvery(ActionTypes.DELETE_SCHEDULE, deleteSchedule),
    takeEvery(ActionTypes.CHANGE_SCHEDULE_STATUS, changeScheduleStatus),
    takeEvery(ActionTypes.EXECUTE_SCHEDULE_IMMEDIATELY, executeScheduleImmediately),
    takeEvery(ActionTypes.EDIT_SCHEDULE, editSchedule),
    takeLatest(ActionTypes.LOAD_SUGGEST_MAILS, getSuggestMails),
    takeEvery(ActionTypes.LOAD_VIZS, getVizsData)
  ])
}
