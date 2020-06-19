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
  GlobalControlQueryMode,
  IGlobalControlConditionsByItem,
  IGlobalControlConditions,
  ILocalControlConditions
} from 'app/components/Control/types'
import { IWidgetRaw, IWidgetFormed } from '../Widget/types'
import { DownloadTypes } from '../App/constants'
import {
  globalControlMigrationRecorder,
  localControlMigrationRecorder
} from 'app/utils/migrationRecorders'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { RenderType, IWidgetConfig } from '../Widget/components/Widget'
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
  const { projectId, portalId, dashboardId } = action.payload

  try {
    const result = yield all({
      dashboardDetail: call(
        request,
        `${api.portal}/${portalId}/dashboards/${dashboardId}`
      ),
      widgets: call(request, `${api.widget}?projectId=${projectId}`)
    })
    const { dashboardDetail, widgets } = result

    const {
      widgets: items,
      views,
      config,
      ...rest
    } = dashboardDetail.payload as IDashboardDetailRaw
    const parsedConfig: IDashboardConfig = JSON.parse(config || '{}')
    const filters = (parsedConfig.filters || []).map((c) =>
      globalControlMigrationRecorder(c)
    )
    const linkages = parsedConfig.linkages || []
    const queryMode =
      parsedConfig.queryMode || GlobalControlQueryMode.Immediately
    const dashboard = {
      ...rest,
      config: {
        filters,
        linkages,
        queryMode
      }
    }

    const formedWidgets: IWidgetFormed[] = widgets.payload.map(
      (widget: IWidgetRaw) => {
        const parsedConfig: IWidgetConfig = JSON.parse(widget.config)
        parsedConfig.controls = parsedConfig.controls.map((c) =>
          localControlMigrationRecorder(c)
        )
        return {
          ...widget,
          config: parsedConfig
        }
      }
    )

    operationWidgetProps.widgetIntoPool(formedWidgets)

    yield put(dashboardDetailLoaded(dashboard, items, formedWidgets, views))
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
      url: `${api.portal}/${portalId}/dashboards/${
        items[0].dashboardId
      }/widgets`,
      data: items
    })
    const widgets: IWidgetFormed[] = yield select(makeSelectWidgets())
    yield put(dashboardItemsAdded(result.payload, widgets))
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
    payload.resultList = payload.resultList.slice(0, 600)
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
      globalControlFormValues,
      formValues
    )
    const globalControlConditionsByItemEntries: Array<
      [string, IGlobalControlConditions]
    > = Object.entries(
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
  localControlFormValues: object,
  globalControlConditions: IGlobalControlConditions
): IDataDownloadStatistic {
  const localControlConditions = getCurrentControlValues(
    ControlPanelTypes.Local,
    relatedWidget.config.controls,
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
  const globalControlFormValues = yield select(
    makeSelectGlobalControlPanelFormValues()
  )
  const globalControlConditionsByItem: IGlobalControlConditionsByItem = getCurrentControlValues(
    ControlPanelTypes.Global,
    currentDashboard.config.filters,
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
    loadDashboardShareLinkFail
  } = DashboardActions
  const { id, authUser } = action.payload
  try {
    const result = yield call(request, {
      method: 'get',
      url: `${api.portal}/dashboards/${id}/share`,
      params: { username: authUser || '' }
    })
    if (authUser) {
      yield put(dashboardAuthorizedShareLinkLoaded(result.payload))
    } else {
      yield put(dashboardShareLinkLoaded(result.payload))
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
    widgetShareLinkLoaded,
    loadWidgetShareLinkFail
  } = DashboardActions
  const { id, authUser, itemId } = action.payload
  try {
    const result = yield call(request, {
      method: 'get',
      url: `${api.widget}/${id}/share`,
      params: { username: authUser || '' }
    })
    if (authUser) {
      yield put(widgetAuthorizedShareLinkLoaded(result.payload, itemId))
    } else {
      yield put(widgetShareLinkLoaded(result.payload, itemId))
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

export default function* rootDashboardSaga(): IterableIterator<any> {
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
