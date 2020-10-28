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

import {
  call,
  all,
  put,
  fork,
  select,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'
import omit from 'lodash/omit'
import { ActionTypes } from './constants'
import { DashboardActions, DashboardActionType } from './actions'
import {
  makeSelectCurrentDashboard,
  makeSelectWidgets,
  makeSelectItemRelatedWidget,
  makeSelectItemInfo,
  makeSelectCurrentItems
} from './selectors'
import {
  makeSelectGlobalControlPanelFormValues,
  makeSelectLocalControlPanelFormValues
} from 'containers/ControlPanel/selectors'
import { makeSelectFormedViews } from '../View/selectors'
import {
  getRequestParams,
  getRequestBody,
  getCurrentControlValues,
  getUpdatedPagination,
  getInitialPagination
} from './util'
import {
  IDashboardDetailRaw,
  IDashboardConfig,
  IDashboardItemInfo,
  IDashboard,
  IQueryConditions,
  IDataDownloadStatistic
} from './types'
import {
  IGlobalControlConditionsByItem,
  IGlobalControlConditions,
  ILocalControlConditions
} from 'app/components/Control/types'
import { IWidgetFormed } from '../Widget/types'
import { IFormedViews } from '../View/types'
import { DownloadTypes } from '../App/constants'
import { dashboardConfigMigrationRecorder } from 'app/utils/migrationRecorders'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { RenderType } from '../Widget/components/Widget'
import { CancelTokenSource } from 'axios'
import request from 'utils/request'
import { errorHandler, getErrorMessage } from 'utils/util'
import { message } from 'antd'
import api from 'utils/api'
import { operationWidgetProps } from 'components/DataDrill/abstract/widgetOperating'
export function* getDashboardDetail(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_DASHBOARD_DETAIL) {
    return
  }
  const { dashboardDetailLoaded, loadDashboardDetailFail } = DashboardActions
  const { portalId, dashboardId } = action.payload

  try {
    const result = yield call(
      request,
      `${api.portal}/${portalId}/dashboards/${dashboardId}`
    )

    const {
      relations: items,
      views,
      config,
      ...rest
    } = result.payload as IDashboardDetailRaw
    const parsedConfig: IDashboardConfig = JSON.parse(config || '{}')
    const dashboard = {
      ...rest,
      config: dashboardConfigMigrationRecorder(parsedConfig)
    }

    const widgets: IWidgetFormed[] = yield select(makeSelectWidgets())

    operationWidgetProps.widgetIntoPool(widgets)

    const formedViews: IFormedViews = views.reduce((obj, view) => {
      obj[view.id] = {
        ...view,
        model: JSON.parse(view.model || '{}'),
        variable: JSON.parse(view.variable || '[]')
      }
      return obj
    }, {})

    yield put(dashboardDetailLoaded(dashboard, items, widgets, formedViews))
  } catch (err) {
    yield put(loadDashboardDetailFail())
    errorHandler(err)
  }
}

export function* addDashboardItems(action: DashboardActionType) {
  if (action.type !== ActionTypes.ADD_DASHBOARD_ITEMS) {
    return
  }
  const { dashboardItemsAdded, addDashboardItemsFail } = DashboardActions
  const { portalId, items, resolve } = action.payload

  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.portal}/${portalId}/dashboards/${items[0].dashboardId}/widgets`,
      data: items
    })
    const widgets: IWidgetFormed[] = yield select(makeSelectWidgets())
    const formedViews: IFormedViews = yield select(makeSelectFormedViews())
    yield put(dashboardItemsAdded(result.payload, widgets, formedViews))
    resolve(result.payload)
  } catch (err) {
    yield put(addDashboardItemsFail())
    errorHandler(err)
  }
}

export function* editDashboardItem(action: DashboardActionType) {
  if (action.type !== ActionTypes.EDIT_DASHBOARD_ITEM) {
    return
  }
  const { dashboardItemEdited, editDashboardItemFail } = DashboardActions
  const { portalId, item, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${portalId}/dashboards/widgets`,
      data: [item]
    })
    yield put(dashboardItemEdited(item))
    resolve()
  } catch (err) {
    yield put(editDashboardItemFail())
    errorHandler(err)
  }
}

export function* editDashboardItems(action: DashboardActionType) {
  if (action.type !== ActionTypes.EDIT_DASHBOARD_ITEMS) {
    return
  }
  const { dashboardItemsEdited, editDashboardItemsFail } = DashboardActions
  const { portalId, items } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${portalId}/dashboards/widgets`,
      data: items
    })
    yield put(dashboardItemsEdited(items))
  } catch (err) {
    yield put(editDashboardItemsFail())
    errorHandler(err)
  }
}

export function* deleteDashboardItem(action: DashboardActionType) {
  if (action.type !== ActionTypes.DELETE_DASHBOARD_ITEM) {
    return
  }
  const { dashboardItemDeleted, deleteDashboardItemFail } = DashboardActions
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

function* getData(
  renderType: RenderType,
  itemId: number,
  queryConditions: Partial<IQueryConditions>,
  cancelTokenSource: CancelTokenSource,
  resetPagination?: boolean
) {
  const {
    dashboardItemDataLoaded,
    loadDashboardItemDataFail
  } = DashboardActions
  const itemInfo: IDashboardItemInfo = yield select((state) =>
    makeSelectItemInfo()(state, itemId)
  )
  const relatedWidget: IWidgetFormed = yield select((state) =>
    makeSelectItemRelatedWidget()(state, itemId)
  )
  const requestParams = getRequestParams(
    relatedWidget,
    itemInfo.queryConditions,
    renderType === 'flush',
    queryConditions
  )
  if (resetPagination) {
    const initialPagination = getInitialPagination(relatedWidget)
    if (initialPagination) {
      const { pageNo, pageSize } = initialPagination
      requestParams.pagination = {
        ...requestParams.pagination,
        pageNo,
        pageSize
      }
    }
  }
  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.view}/${relatedWidget.viewId}/getdata`,
      data: getRequestBody(requestParams),
      cancelToken: cancelTokenSource.token
    })
    result.payload = result.payload || {}
    const { payload } = result
    payload.resultList = payload.resultList || []
    requestParams.pagination = getUpdatedPagination(
      requestParams.pagination,
      result.payload
    )
    yield put(
      dashboardItemDataLoaded(
        renderType,
        itemId,
        requestParams,
        result.payload,
        {
          ...requestParams,
          widget: relatedWidget
        }
      )
    )
  } catch (err) {
    yield put(loadDashboardItemDataFail(itemId, getErrorMessage(err)))
  }
}

export function* getDashboardItemData(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_DASHBOARD_ITEM_DATA) {
    return
  }
  const {
    renderType,
    itemId,
    queryConditions,
    cancelTokenSource
  } = action.payload
  yield getData(renderType, itemId, queryConditions, cancelTokenSource)
}

export function* getBatchDataWithControlValues(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES) {
    return
  }
  const { type, itemId, formValues, cancelTokenSource } = action.payload
  const formedViews: IFormedViews = yield select(makeSelectFormedViews())

  if (type === ControlPanelTypes.Global) {
    const currentDashboard: IDashboard = yield select(
      makeSelectCurrentDashboard()
    )
    const globalControlFormValues = yield select(
      makeSelectGlobalControlPanelFormValues()
    )
    const globalControlConditionsByItem = getCurrentControlValues(
      type,
      currentDashboard.config.filters,
      formedViews,
      globalControlFormValues,
      formValues
    )
    const globalControlConditionsByItemEntries: Array<[
      string,
      IGlobalControlConditions
    ]> = Object.entries(
      globalControlConditionsByItem as IGlobalControlConditionsByItem
    )
    while (globalControlConditionsByItemEntries.length) {
      const [itemId, queryConditions] = globalControlConditionsByItemEntries[0]
      yield fork(
        getData,
        'clear',
        Number(itemId),
        queryConditions,
        cancelTokenSource,
        true
      )
      globalControlConditionsByItemEntries.shift()
    }
  } else {
    const relatedWidget: IWidgetFormed = yield select((state) =>
      makeSelectItemRelatedWidget()(state, itemId)
    )
    const localControlFormValues = yield select((state) =>
      makeSelectLocalControlPanelFormValues()(state, itemId)
    )
    const localControlConditions = getCurrentControlValues(
      type,
      relatedWidget.config.controls,
      formedViews,
      localControlFormValues,
      formValues
    )
    yield getData(
      'clear',
      itemId,
      localControlConditions as ILocalControlConditions,
      cancelTokenSource,
      true
    )
  }
}

function getDownloadInfo(
  type: DownloadTypes,
  itemId: number,
  itemInfo: IDashboardItemInfo,
  relatedWidget: IWidgetFormed,
  formedViews: IFormedViews,
  localControlFormValues: object,
  globalControlConditions: IGlobalControlConditions
): IDataDownloadStatistic {
  const localControlConditions = getCurrentControlValues(
    ControlPanelTypes.Local,
    relatedWidget.config.controls,
    formedViews,
    localControlFormValues
  )
  const requestParams = getRequestParams(
    relatedWidget,
    itemInfo.queryConditions,
    false,
    {
      ...globalControlConditions,
      ...localControlConditions
    }
  )
  const id = type === DownloadTypes.Dashboard ? itemId : relatedWidget.id
  return {
    id,
    param: {
      ...getRequestBody(requestParams),
      flush: true,
      pageNo: 0,
      pageSize: 0
    },
    itemId,
    widget: relatedWidget
  }
}

export function* initiateDownloadTask(action: DashboardActionType) {
  if (action.type !== ActionTypes.INITIATE_DOWNLOAD_TASK) {
    return
  }
  const { DownloadTaskInitiated, initiateDownloadTaskFail } = DashboardActions
  const { type, itemId } = action.payload
  const currentDashboard: IDashboard = yield select(
    makeSelectCurrentDashboard()
  )
  const formedViews: IFormedViews = yield select(makeSelectFormedViews())
  const globalControlFormValues = yield select(
    makeSelectGlobalControlPanelFormValues()
  )
  const globalControlConditionsByItem: IGlobalControlConditionsByItem = getCurrentControlValues(
    ControlPanelTypes.Global,
    currentDashboard.config.filters,
    formedViews,
    globalControlFormValues
  )

  let id = action.payload.id
  const downloadInfo: IDataDownloadStatistic[] = []

  if (type === DownloadTypes.Dashboard) {
    const currentItems = yield select(makeSelectCurrentItems())
    const itemIds = currentItems.map((item) => item.id)
    while (itemIds.length) {
      const itemId = itemIds[0]
      const globalControlConditions = globalControlConditionsByItem[itemId]
      const itemInfo: IDashboardItemInfo = yield select((state) =>
        makeSelectItemInfo()(state, itemId)
      )
      const relatedWidget: IWidgetFormed = yield select((state) =>
        makeSelectItemRelatedWidget()(state, itemId)
      )
      const localControlFormValues = yield select((state) =>
        makeSelectLocalControlPanelFormValues()(state, itemId)
      )
      downloadInfo.push(
        getDownloadInfo(
          type,
          itemId,
          itemInfo,
          relatedWidget,
          formedViews,
          localControlFormValues,
          globalControlConditions
        )
      )
      itemIds.shift()
    }
  } else {
    const itemInfo: IDashboardItemInfo = yield select((state) =>
      makeSelectItemInfo()(state, itemId)
    )
    const relatedWidget: IWidgetFormed = yield select((state) =>
      makeSelectItemRelatedWidget()(state, itemId)
    )
    const localControlFormValues = yield select((state) =>
      makeSelectLocalControlPanelFormValues()(state, itemId)
    )
    id = relatedWidget.id
    downloadInfo.push(
      getDownloadInfo(
        type,
        itemId,
        itemInfo,
        relatedWidget,
        formedViews,
        localControlFormValues,
        globalControlConditionsByItem[itemId]
      )
    )
  }

  try {
    yield call(request, {
      method: 'POST',
      url: `${api.download}/submit/${type}/${id}`,
      data: downloadInfo.map((d) => omit(d, 'widget', 'itemId'))
    })
    message.success('下载任务创建成功！')
    yield put(DownloadTaskInitiated(type, downloadInfo, itemId))
  } catch (err) {
    yield put(initiateDownloadTaskFail(err, type, itemId))
    errorHandler(err)
  }
}

export function* getDashboardShareLink(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_DASHBOARD_SHARE_LINK) {
    return
  }
  const {
    dashboardAuthorizedShareLinkLoaded,
    dashboardShareLinkLoaded,
    dashboardPasswordShareLinkLoaded,
    loadDashboardShareLinkFail
  } = DashboardActions

  const {
    id,
    mode,
    permission,
    expired,
    roles,
    viewers
  } = action.payload.params

  let requestData = null
  switch (mode) {
    case 'AUTH':
      requestData = { mode, expired, permission, roles, viewers }
      break
    case 'PASSWORD':
    case 'NORMAL':
      requestData = { mode, expired }
      break
    default:
      break
  }

  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.portal}/dashboards/${id}/share`,
      data: requestData
    })

    const { token, password } = result.payload
    switch (mode) {
      case 'AUTH':
        yield put(dashboardAuthorizedShareLinkLoaded(token))
        break
      case 'PASSWORD':
        yield put(dashboardPasswordShareLinkLoaded(token, password))
        break
      case 'NORMAL':
        yield put(dashboardShareLinkLoaded(token))
        break
      default:
        break
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    errorHandler(err)
  }
}

export function* getWidgetShareLink(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGET_SHARE_LINK) {
    return
  }
  const {
    widgetAuthorizedShareLinkLoaded,
    widgetPasswordShareLinkLoaded,
    widgetShareLinkLoaded,
    loadWidgetShareLinkFail
  } = DashboardActions
  const {
    id,
    itemId,
    mode,
    expired,
    permission,
    roles,
    viewers
  } = action.payload.params

  let requestData = null
  switch (mode) {
    case 'AUTH':
      requestData = { mode, expired, permission, roles, viewers }
      break
    case 'PASSWORD':
    case 'NORMAL':
      requestData = { mode, expired }
      break
    default:
      break
  }

  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.widget}/${id}/share`,
      data: requestData
    })
    const { token, password } = result.payload
    switch (mode) {
      case 'AUTH':
        yield put(widgetAuthorizedShareLinkLoaded(token, itemId))
        break
      case 'PASSWORD':
        yield put(widgetPasswordShareLinkLoaded(token, password, itemId))
        break
      case 'NORMAL':
        yield put(widgetShareLinkLoaded(token, itemId))
        break
      default:
        break
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(itemId))
    errorHandler(err)
  }
}

export function* getWidgetCsv(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGET_CSV) {
    return
  }
  const { widgetCsvLoaded, loadWidgetCsvFail } = DashboardActions
  const { itemId, widgetId, requestParams } = action.payload
  // @TODO combine widget static filters with local filters
  const {
    filters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    ...rest
  } = requestParams

  try {
    const path = yield call(request, {
      method: 'post',
      url: `${api.widget}/${widgetId}/excel`,
      data: {
        ...rest,
        filters: filters
          .concat(tempFilters)
          .concat(linkageFilters)
          .concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables)
      }
    })
    yield put(widgetCsvLoaded(itemId))
    location.href = path.payload
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    errorHandler(err)
  }
}

export default function* rootDashboardSaga() {
  yield all([
    takeLatest(ActionTypes.LOAD_DASHBOARD_DETAIL, getDashboardDetail),
    takeEvery(ActionTypes.ADD_DASHBOARD_ITEMS, addDashboardItems),
    takeEvery(ActionTypes.EDIT_DASHBOARD_ITEM, editDashboardItem),
    takeEvery(ActionTypes.EDIT_DASHBOARD_ITEMS, editDashboardItems),
    takeEvery(ActionTypes.DELETE_DASHBOARD_ITEM, deleteDashboardItem),
    takeEvery(ActionTypes.LOAD_DASHBOARD_ITEM_DATA, getDashboardItemData),
    takeEvery(
      ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES,
      getBatchDataWithControlValues
    ),
    takeEvery(ActionTypes.INITIATE_DOWNLOAD_TASK, initiateDownloadTask),
    takeLatest(ActionTypes.LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink),
    takeLatest(ActionTypes.LOAD_WIDGET_SHARE_LINK, getWidgetShareLink),
    takeLatest(ActionTypes.LOAD_WIDGET_CSV, getWidgetCsv)
  ])
}
