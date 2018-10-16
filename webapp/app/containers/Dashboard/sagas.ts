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
  LOAD_WIDGET_CSV
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

import request from '../../utils/request'
import { errorHandler } from '../../utils/util'
import api from '../../utils/api'
import config, { env } from '../../globalConfig'
const shareHost = config[env].shareHost

export function* getDashboards ({ payload }) {
  try {
    const dashboards = yield call(request, `${api.portal}/${payload.portalId}/dashboards`)
    yield put(dashboardsLoaded(dashboards.payload))
    payload.resolve(dashboards.payload)
  } catch (err) {
    yield put(loadDashboardsFail())
    errorHandler(err)
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
    errorHandler(err)
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
    errorHandler(err)
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
    errorHandler(err)
  }
}

export function* deleteDashboard ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/dashboards/${payload.id}`
    })
    yield put(dashboardDeleted(payload.id))
    if (payload.resolve) {
      payload.resolve()
    }
  } catch (err) {
    yield put(deleteDashboardFail())
    errorHandler(err)
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
    errorHandler(err)
  }
}

export function* addDashboardItem (action) {
  const { portalId, item, resolve } = action.payload

  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.portal}/${portalId}/dashboards/${item[0].dashboardId}/widgets`,
      data: item
    })
    yield put(dashboardItemAdded(result.payload))
    resolve(result)
  } catch (err) {
    yield put(addDashboardItemFail())
    errorHandler(err)
  }
}

export function* editDashboardItem (action) {
  const { item, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/dashboards/widgets`,
      data: [item]
    })
    yield put(dashboardItemEdited(item))
    resolve()
  } catch (err) {
    yield put(editDashboardItemFail())
    errorHandler(err)
  }
}

export function* editDashboardItems (action) {
  const { items } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/dashboards/widgets`,
      data: items
    })
    yield put(dashboardItemsEdited(items))
  } catch (err) {
    yield put(editDashboardItemsFail())
    errorHandler(err)
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
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(deleteDashboardItemFail())
    errorHandler(err)
  }
}

export function* getDashboardShareLink (action) {
  const { id, authName } = action.payload
  try {
    const shareInfo = yield call(request, {
      method: 'get',
      url: `${api.portal}/dashboards/${id}/share`,
      params: {username: authName}
    })
    if (authName) {
      yield put(dashboardSecretLinkLoaded(shareInfo.payload))
    } else {
      yield put(dashboardShareLinkLoaded(shareInfo.payload))
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    errorHandler(err)
  }
}

export function* getWidgetShareLink (action) {
  const { id, authName, itemId, resolve } = action.payload
  try {
    const shareInfo = yield call(request, {
      method: 'get',
      url: `${api.widget}/${id}/share`,
      params: {username: authName}
    })
    if (authName) {
      yield put(widgetSecretLinkLoaded(shareInfo.payload, itemId))
    } else {
      yield put(widgetShareLinkLoaded(shareInfo.payload, itemId))
    }
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(itemId))
    errorHandler(err)
  }
}

export function* getWidgetCsv (action) {
  const { itemId, params, token } = action.payload

  try {
    const path = yield call(request, {
      method: 'post',
      url: `${api.widget}/${itemId}/csv`,
      data: params
    })
    yield put(widgetCsvLoaded(itemId))
    location.href = path.payload
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    errorHandler(err)
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
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv)
  ]
}
