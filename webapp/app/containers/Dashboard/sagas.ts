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

import { takeLatest, takeEvery } from 'redux-saga'
import { call, all, put } from 'redux-saga/effects'

import {
  LOAD_DASHBOARDS,
  ADD_DASHBOARD,
  EDIT_DASHBOARD,
  EDIT_CURRENT_DASHBOARD,
  DELETE_DASHBOARD,
  LOAD_DASHBOARD_DETAIL,
  ADD_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEMS,
  DELETE_DASHBOARD_ITEM,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_CSV,
  UPDAATE_MARK
} from './constants'

import {
  dashboardsLoaded,
  loadDashboardsFail,
  dashboardAdded,
  addDashboardFail,
  dashboardEdited,
  editDashboardFail,
  currentDashboardEdited,
  editCurrentDashboardFail,
  dashboardDeleted,
  deleteDashboardFail,
  dashboardDetailLoaded,
  loadDashboardDetailFail,
  dashboardItemAdded,
  addDashboardItemFail,
  dashboardItemEdited,
  editDashboardItemFail,
  dashboardItemsEdited,
  editDashboardItemsFail,
  dashboardItemDeleted,
  deleteDashboardItemFail,
  dashboardShareLinkLoaded,
  dashboardSecretLinkLoaded,
  widgetSecretLinkLoaded,
  loadDashboardShareLinkFail,
  widgetShareLinkLoaded,
  loadWidgetShareLinkFail,
  widgetCsvLoaded,
  loadWidgetCsvFail
} from './actions'

import message from 'antd/lib/message'
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import config, { env } from '../../globalConfig'
const shareHost = config[env].shareHost

export function* getDashboards ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.portal}/${payload.portalId}/dashboards`)
    const dashboards = readListAdapter(asyncData)
    yield put(dashboardsLoaded(dashboards))
    payload.resolve(dashboards)
  } catch (err) {
    yield put(loadDashboardsFail())
    message.error('获取 Dashboards 失败，请稍后再试')
  }
}

export function* addDashboard ({ payload }) {
  const { dashboard, resolve } = payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.portal}/${dashboard.dashboardPortalId}/dashboards`,
      data: dashboard
    })
    yield put(dashboardAdded(asyncData.payload))
    resolve(asyncData.payload.id)
  } catch (err) {
    yield put(addDashboardFail())
    message.error('添加 Dashboard 失败，请稍后再试')
  }
}

export function* editDashboard ({ payload }) {
  const { formType, dashboard, resolve } = payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${dashboard[0].dashboardPortalId}/dashboards`,
      data: dashboard
    })
    yield put(dashboardEdited(dashboard, formType))
    resolve(dashboard)
  } catch (err) {
    yield put(editDashboardFail())
    message.error('修改 Dashboard 失败，请稍后再试')
  }
}

export function* editCurrentDashboard (action) {
  const { dashboard, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${dashboard.dashboardPortalId}/dashboards`,
      data: [dashboard]
    })
    yield put(currentDashboardEdited(dashboard))
    resolve()
  } catch (err) {
    yield put(editCurrentDashboardFail())
    message.error('修改当前 Dashboard 内容失败，请稍后再试')
  }
}

export function* deleteDashboard ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/dashboards/${payload.id}`
    })
    yield put(dashboardDeleted(payload.id))
    payload.resolve()
  } catch (err) {
    yield put(deleteDashboardFail())
    message.error('删除当前 Dashboard 失败，请稍后再试')
  }
}

export function* getDashboardDetail ({ payload }) {
  const { projectId, portalId, dashboardId } = payload

  try {
    const result = yield all({
      dashboardDetail: call(request, `${api.portal}/${portalId}/dashboards/${dashboardId}`),
      widgets: call(request, `${api.widget}?projectId=${projectId}`)
    })
    yield put(dashboardDetailLoaded(dashboardId, result.dashboardDetail.payload, result.widgets.payload))
  } catch (err) {
    yield put(loadDashboardDetailFail())
    message.error('获取 Dashboard 详细信息失败，请稍后再试')
  }
}

export function* addDashboardItem (action) {
  const { portalId, item, resolve } = action.payload
  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.portal}/${portalId}/dashboards/${item.dashboardId}/widgets`,
      data: item
    })
    yield put(dashboardItemAdded(result))
    resolve(result)
  } catch (err) {
    yield put(addDashboardItemFail())
    message.error('新增失败，请稍后再试')
  }
}

export function* editDashboardItem (action) {
  const { item, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.dashboard}/widgets`,
      data: writeAdapter(item)
    })
    yield put(dashboardItemEdited(item))
    resolve()
  } catch (err) {
    yield put(editDashboardItemFail())
    message.error('修改失败，请稍后再试')
  }
}

export function* editDashboardItems (action) {
  const { items, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/dashboards/widgets`,
      data: items
    })
    yield put(dashboardItemsEdited(items))
    resolve()
  } catch (err) {
    yield put(editDashboardItemsFail())
    message.error('修改失败，请稍后再试')
  }
}

export function* deleteDashboardItem (action) {
  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/dashboards/widgets/${id}`
    })
    yield put(dashboardItemDeleted(id))
    resolve()
  } catch (err) {
    yield put(deleteDashboardItemFail())
    message.error('删除失败，请稍后再试')
  }
}

export function* getDashboardShareLink (action) {
  const { id, authName } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/dashboard/${id}`,
      params: {auth_name: authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (authName) {
      yield put(dashboardSecretLinkLoaded(shareInfo))
    } else {
      yield put(dashboardShareLinkLoaded(shareInfo))
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    message.error('获取 Dashboard 分享链接失败，请稍后再试')
  }
}

export function* getWidgetShareLink (action) {
  const { id, authName, itemId } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/widget/${id}`,
      params: {auth_name: authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (authName) {
      yield put(widgetSecretLinkLoaded(shareInfo, itemId))
    } else {
      yield put(widgetShareLinkLoaded(shareInfo, itemId))
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(itemId))
    message.error('获取 Widget 分享链接失败，请稍后再试')
  }
}

export function* getWidgetCsv (action) {
  const { token, sql, sorts, offset, limit, itemId } = action.payload
  let queries = ''

  if (offset !== undefined && limit !== undefined) {
    queries = `?sortby=${sorts}&offset=${offset}&limit=${limit}`
  }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/csv/${token}${queries}`,
      data: sql || {}
    })
    yield put(widgetCsvLoaded(itemId))
    const path = readListAdapter(asyncData)
    location.href = `${shareHost.substring(0, shareHost.lastIndexOf('/'))}/${path}`
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    message.error('获取csv文件失败，请稍后再试')
  }
}

export function* updateMarkRepos (action) {
  const {id, params, resolve, reject} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/mark`,
      data: {params}
    })
    const result = readListAdapter(asyncData)
    resolve(result)
  } catch (err) {
    reject(err)
  }
}

export default function* rootDashboardSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_DASHBOARDS, getDashboards as any),
    takeLatest(ADD_DASHBOARD, addDashboard as any),
    takeEvery(EDIT_DASHBOARD, editDashboard as any),
    takeEvery(EDIT_CURRENT_DASHBOARD, editCurrentDashboard),
    takeEvery(DELETE_DASHBOARD, deleteDashboard as any),
    takeLatest(LOAD_DASHBOARD_DETAIL, getDashboardDetail as any),
    takeEvery(ADD_DASHBOARD_ITEM, addDashboardItem as any),
    takeEvery(EDIT_DASHBOARD_ITEM, editDashboardItem),
    takeEvery(EDIT_DASHBOARD_ITEMS, editDashboardItems),
    takeEvery(DELETE_DASHBOARD_ITEM, deleteDashboardItem as any),
    takeLatest(LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink),
    takeLatest(LOAD_WIDGET_SHARE_LINK, getWidgetShareLink),
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv),
    takeLatest(UPDAATE_MARK, updateMarkRepos)
  ]
}
