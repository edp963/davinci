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
  put,
  all,
  fork,
  select,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'

import { IWidgetFormed } from 'app/containers/Widget/types'
import { ActionTypes } from './constants'
import { DashboardActions, DashboardActionType } from './actions'
import {
  makeSelectDashboard,
  makeSelectItemRelatedWidget,
  makeSelectItemInfo,
  makeSelectFormedViews,
  makeSelectWidgets
} from './selectors'
import { makeSelectShareType } from 'share/containers/App/selectors'
import {
  makeSelectGlobalControlPanelFormValues,
  makeSelectLocalControlPanelFormValues
} from 'app/containers/ControlPanel/selectors'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { ActionTypes as AppActions } from 'share/containers/App/constants'
import {
  dashboardConfigMigrationRecorder,
  widgetConfigMigrationRecorder
} from 'app/utils/migrationRecorders'

import {
  getRequestParams,
  getRequestBody,
  getUpdatedPagination,
  getCurrentControlValues,
  getInitialPagination
} from 'app/containers/Dashboard/util'
import {
  IShareDashboardDetailRaw,
  IShareWidgetDetailRaw,
  IShareDashboardItemInfo
} from './types'
import {
  IDashboardConfig,
  IDashboard,
  IQueryConditions
} from 'app/containers/Dashboard/types'
import { IShareFormedViews } from 'app/containers/View/types'
import {
  IGlobalControlConditions,
  IGlobalControlConditionsByItem,
  ILocalControlConditions
} from 'app/components/Control/types'
import {
  IWidgetConfig,
  RenderType
} from 'app/containers/Widget/components/Widget'

import request, { IDavinciResponse } from 'utils/request'
import { errorHandler, getErrorMessage } from 'utils/util'
import api from 'utils/api'
import { message } from 'antd'
import { DownloadTypes } from 'app/containers/App/constants'
import { localStorageCRUD, getPasswordUrl } from '../../util'
import { operationWidgetProps } from 'app/components/DataDrill/abstract/widgetOperating'
export function* getDashboard(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_DASHBOARD) {
    return
  }

  const { dashboardGetted, loadDashboardFail } = DashboardActions
  const { token, reject } = action.payload

  const shareType = yield select(makeSelectShareType())
  const baseUrl = `${api.share}/dashboard/${token}`
  const requestUrl = getPasswordUrl(shareType, token, baseUrl)

  try {
    const result = yield call(request, requestUrl)
    const {
      widgets,
      views,
      relations,
      config,
      ...rest
    } = result.payload as IShareDashboardDetailRaw

    const parsedConfig: IDashboardConfig = JSON.parse(config || '{}')
    const dashboard = {
      ...rest,
      config: dashboardConfigMigrationRecorder(parsedConfig)
    }

    const formedWidgets = widgets.map((widget) => {
      const { config, ...rest } = widget
      const parsedConfig: IWidgetConfig = JSON.parse(config)
      return {
        ...rest,
        config: widgetConfigMigrationRecorder(parsedConfig, {
          viewId: widget.viewId
        })
      }
    })
    const formedViews = views.reduce(
      (obj, { id, model, variable, ...rest }) => ({
        ...obj,
        [id]: {
          ...rest,
          model: JSON.parse(model),
          variable: JSON.parse(variable)
        }
      }),
      {}
    )
    yield put(dashboardGetted(dashboard, relations, formedWidgets, formedViews))
    const getWidgets: IWidgetFormed = yield select(makeSelectWidgets())
    operationWidgetProps.widgetIntoPool(getWidgets)
  } catch (err) {
    yield put(loadDashboardFail())
    errorHandler(err)
    reject(err)
  }
}

export function* getWidget(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_WIDGET) {
    return
  }
  const { widgetGetted } = DashboardActions
  const { token, resolve, reject } = action.payload
  const shareType = yield select(makeSelectShareType())
  const baseUrl = `${api.share}/widget/${token}`
  const requestUrl = getPasswordUrl(shareType, token, baseUrl)
  try {
    const result = yield call(request, requestUrl)
    const { widget, views } = result.payload as IShareWidgetDetailRaw
    const { config, ...rest } = widget
    const parsedConfig: IWidgetConfig = JSON.parse(config)
    const formedWidget = {
      ...rest,
      config: widgetConfigMigrationRecorder(parsedConfig, {
        viewId: widget.viewId
      })
    }
    const formedViews = views.reduce(
      (obj, { id, model, variable, ...rest }) => ({
        ...obj,
        [id]: {
          ...rest,
          model: JSON.parse(model),
          variable: JSON.parse(variable)
        }
      }),
      {}
    )
    yield put(widgetGetted(formedWidget, formedViews))
    const getWidgets: IWidgetFormed = yield select(makeSelectWidgets())
    operationWidgetProps.widgetIntoPool(getWidgets)
    if (resolve) {
      resolve(formedWidget, formedViews)
    }
  } catch (err) {
    errorHandler(err)
    reject(err)
  }
}

function* getData(
  renderType: RenderType,
  itemId: number,
  queryConditions: Partial<IQueryConditions>,
  resetPagination?: boolean
) {
  const { resultsetGetted, getResultsetFail } = DashboardActions
  const itemInfo: IShareDashboardItemInfo = yield select((state) =>
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
      url: `${api.share}/data/${relatedWidget.dataToken}`,
      data: getRequestBody(requestParams)
    })
    result.payload.resultList = result.payload.resultList || []
    requestParams.pagination = getUpdatedPagination(
      requestParams.pagination,
      result.payload
    )
    yield put(
      resultsetGetted(renderType, itemId, requestParams, result.payload)
    )
  } catch (err) {
    yield put(getResultsetFail(itemId, getErrorMessage(err)))
  }
}

export function* getResultset(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_RESULTSET) {
    return
  }
  const { renderType, itemId, queryConditions } = action.payload
  yield getData(renderType, itemId, queryConditions)
}

export function* getBatchDataWithControlValues(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES) {
    return
  }
  const { type, itemId, formValues } = action.payload
  const formedViews: IShareFormedViews = yield select(makeSelectFormedViews())

  if (type === ControlPanelTypes.Global) {
    const currentDashboard: IDashboard = yield select(makeSelectDashboard())
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
      yield fork(getData, 'clear', Number(itemId), queryConditions, true)
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
      true
    )
  }
}

export function* getWidgetCsv(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGET_CSV) {
    return
  }
  const { widgetCsvLoaded, loadWidgetCsvFail } = DashboardActions
  const { itemId, requestParams, token } = action.payload
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
      url: `${api.share}/csv/${token}`,
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

export function* getSelectOptions(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SELECT_OPTIONS) {
    return
  }
  const { selectOptionsLoaded, loadSelectOptionsFail } = DashboardActions
  try {
    const { controlKey, requestParams, itemId } = action.payload
    const formedViews: IShareFormedViews = yield select(makeSelectFormedViews())
    const requests = Object.entries(requestParams).map(([viewId, params]) => {
      const { columns, filters, variables, cache, expired } = params
      const { dataToken } = formedViews[viewId]
      return call(request, {
        method: 'post',
        url: `${api.share}/data/${dataToken}/distinctvalue`,
        data: {
          columns: Object.values(columns).filter((c) => !!c),
          filters,
          params: variables,
          cache,
          expired
        }
      })
    })
    const results: Array<IDavinciResponse<object[]>> = yield all(requests)
    yield put(
      selectOptionsLoaded(
        controlKey,
        results.reduce((arr, result) => arr.concat(result.payload), []),
        itemId
      )
    )
  } catch (err) {
    yield put(loadSelectOptionsFail(err))
  }
}

export function* getDownloadList(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_DOWNLOAD_LIST) {
    return
  }
  const { downloadListLoaded, loadDownloadListFail } = DashboardActions
  const { shareClinetId, token } = action.payload

  const shareType = yield select(makeSelectShareType())
  const baseUrl = `${api.download}/share/page/${shareClinetId}/${token}`
  const requestUrl = getPasswordUrl(shareType, token, baseUrl)

  try {
    const result = yield call(request, requestUrl)
    yield put(downloadListLoaded(result.payload))
  } catch (err) {
    yield put(loadDownloadListFail(err))
    errorHandler(err)
  }
}

export function* downloadFile(action: DashboardActionType) {
  if (action.type !== ActionTypes.DOWNLOAD_FILE) {
    return
  }
  const { fileDownloaded, downloadFileFail } = DashboardActions
  const { id, shareClinetId, token } = action.payload
  try {
    location.href = `${api.download}/share/record/file/${id}/${shareClinetId}/${token}`
    yield put(fileDownloaded(id))
  } catch (err) {
    yield put(downloadFileFail(err))
    errorHandler(err)
  }
}

export function* initiateDownloadTask(action: DashboardActionType) {
  if (action.type !== ActionTypes.INITIATE_DOWNLOAD_TASK) {
    return
  }
  const { DownloadTaskInitiated, initiateDownloadTaskFail } = DashboardActions
  const { shareClientId, itemId } = action.payload
  const currentDashboard: IDashboard = yield select(makeSelectDashboard())
  const currentDashboardFilters = currentDashboard?.config.filters || []
  const formedViews: IShareFormedViews = yield select(makeSelectFormedViews())
  const globalControlFormValues = yield select(
    makeSelectGlobalControlPanelFormValues()
  )
  const globalControlConditionsByItem: IGlobalControlConditionsByItem = getCurrentControlValues(
    ControlPanelTypes.Global,
    currentDashboardFilters,
    formedViews,
    globalControlFormValues
  )
  const itemInfo: IShareDashboardItemInfo = yield select((state) =>
    makeSelectItemInfo()(state, itemId)
  )
  const relatedWidget: IWidgetFormed = yield select((state) =>
    makeSelectItemRelatedWidget()(state, itemId)
  )
  const localControlFormValues = yield select((state) =>
    makeSelectLocalControlPanelFormValues()(state, itemId)
  )
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
      ...globalControlConditionsByItem[itemId],
      ...localControlConditions
    }
  )

  const { dataToken } = relatedWidget
  try {
    yield call(request, {
      method: 'POST',
      url: `${api.download}/share/submit/${DownloadTypes.Widget}/${shareClientId}/${dataToken}`,
      data: [
        {
          id: relatedWidget.id,
          param: {
            ...getRequestBody(requestParams),
            flush: true,
            pageNo: 0,
            pageSize: 0
          }
        }
      ]
    })
    message.success('下载任务创建成功！')
    yield put(DownloadTaskInitiated(itemId))
  } catch (err) {
    yield put(initiateDownloadTaskFail(err, itemId))
    errorHandler(err)
  }
}

export default function* rootDashboardSaga() {
  yield all([
    takeLatest(ActionTypes.LOAD_SHARE_DASHBOARD, getDashboard),
    takeEvery(ActionTypes.LOAD_SHARE_WIDGET, getWidget),
    takeEvery(ActionTypes.LOAD_SHARE_RESULTSET, getResultset),
    takeEvery(
      ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES,
      getBatchDataWithControlValues
    ),
    takeLatest(ActionTypes.LOAD_WIDGET_CSV, getWidgetCsv),
    takeEvery(ActionTypes.LOAD_SELECT_OPTIONS, getSelectOptions),
    takeLatest(ActionTypes.LOAD_DOWNLOAD_LIST, getDownloadList),
    takeLatest(ActionTypes.DOWNLOAD_FILE, downloadFile),
    takeEvery(ActionTypes.INITIATE_DOWNLOAD_TASK, initiateDownloadTask)
  ])
}
