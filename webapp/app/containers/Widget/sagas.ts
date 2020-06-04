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

import { call, put, all, takeLatest, takeEvery } from 'redux-saga/effects'
import { ActionTypes } from './constants'
import omit from 'lodash/omit'

import { WidgetActions, WidgetActionType } from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getWidgets(action: WidgetActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGETS) {
    return
  }

  const { projectId } = action.payload
  try {
    const result = yield call(request, `${api.widget}?projectId=${projectId}`)
    yield put(WidgetActions.widgetsLoaded(result.payload))
  } catch (err) {
    yield put(WidgetActions.widgetsLoadedFail())
    errorHandler(err)
  }
}

export function* addWidget(action: WidgetActionType) {
  if (action.type !== ActionTypes.ADD_WIDGET) {
    return
  }

  const { widget, resolve } = action.payload
  try {
    const result = yield call(request, {
      method: 'post',
      url: api.widget,
      data: widget
    })

    yield put(WidgetActions.widgetAdded(result.payload))
    resolve()
  } catch (err) {
    yield put(WidgetActions.addWidgetFail())
    errorHandler(err)
  }
}

export function* deleteWidget(action: WidgetActionType) {
  if (action.type !== ActionTypes.DELETE_WIDGET) {
    return
  }

  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.widget}/${id}`
    })
    yield put(WidgetActions.widgetDeleted(id))
  } catch (err) {
    yield put(WidgetActions.deleteWidgetFail())
    errorHandler(err)
  }
}

export function* getWidgetDetail(action: WidgetActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGET_DETAIL) {
    return
  }

  const { id } = action.payload
  try {
    const result = yield call(request, `${api.widget}/${id}`)
    const viewId = result.payload.viewId
    const view = yield call(request, `${api.view}/${viewId}`)
    yield put(WidgetActions.widgetDetailLoaded(result.payload, view.payload))
  } catch (err) {
    yield put(WidgetActions.loadWidgetDetailFail(err))
    errorHandler(err)
  }
}

export function* editWidget(action: WidgetActionType) {
  if (action.type !== ActionTypes.EDIT_WIDGET) {
    return
  }

  const { widget, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.widget}/${widget.id}`,
      data: widget
    })
    yield put(WidgetActions.widgetEdited())
    resolve()
  } catch (err) {
    yield put(WidgetActions.editWidgetFail())
    errorHandler(err)
  }
}

export function* copyWidget(action: WidgetActionType) {
  if (action.type !== ActionTypes.COPY_WIDGET) {
    return
  }

  const { widget, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.widget,
      data: omit(widget, 'id')
    })
    yield put(WidgetActions.widgetCopied(widget.id, asyncData.payload))
    resolve()
  } catch (err) {
    yield put(WidgetActions.copyWidgetFail())
    errorHandler(err)
  }
}

export function* executeComputed(action: WidgetActionType) {
  if (action.type !== ActionTypes.EXECUTE_COMPUTED_SQL) {
    return
  }

  const { sql } = action.payload
  try {
    const result = yield call(request, {
      method: 'post',
      //  url: api.widget,
      data: sql
    })
    // todo  返回sql校验结果
  } catch (err) {
    errorHandler(err)
  }
}

export default function* rootWidgetSaga() {
  yield all([
    takeLatest(ActionTypes.LOAD_WIDGETS, getWidgets),
    takeEvery(ActionTypes.ADD_WIDGET, addWidget),
    takeEvery(ActionTypes.DELETE_WIDGET, deleteWidget),
    takeLatest(ActionTypes.LOAD_WIDGET_DETAIL, getWidgetDetail),
    takeEvery(ActionTypes.EDIT_WIDGET, editWidget),
    takeEvery(ActionTypes.COPY_WIDGET, copyWidget),
    takeEvery(ActionTypes.EXECUTE_COMPUTED_SQL, executeComputed)
  ])
}
