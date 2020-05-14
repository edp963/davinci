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

import omit from 'lodash/omit'
import {
  deserializeDefaultValue,
  getModelValue,
  getVariableValue
} from 'app/components/Control/util'
import { widgetDimensionMigrationRecorder } from 'app/utils/migrationRecorders'
import { FieldSortTypes } from '../Widget/components/Config/Sort'
import { decodeMetricName } from '../Widget/components/util'
import {
  IDashboardItemInfo,
  IQueryConditions,
  IDataRequestParams,
  IDataRequestBody
} from './types'
import { IWidgetFormed } from '../Widget/types'
import ChartTypes from '../Widget/config/chart/ChartTypes'
import {
  IGlobalControl,
  IControlRelatedField,
  ILocalControl,
  IGlobalControlConditionsByItem,
  ILocalControlConditions
} from 'app/components/Control/types'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { IViewQueryResponse } from '../View/types'
import { IPaginationParams } from '../Widget/components/Widget'

export function getInitialPagination(
  widget: IWidgetFormed
): IPaginationParams {
  const { mode, selectedChart, chartStyles } = widget.config
  if (mode === 'chart' && selectedChart === ChartTypes.Table) {
    const { withPaging, pageSize } = chartStyles.table
    return {
      withPaging,
      pageSize: withPaging ? Number(pageSize) : 0,
      pageNo: withPaging ? 1 : 0,
      totalCount: 0
    }
  } else {
    return null
  }
}

export function getInitialNativeQuery(
  widget: IWidgetFormed
): boolean {
  const { mode, selectedChart, chartStyles } = widget.config
  if (mode === 'chart' && selectedChart === ChartTypes.Table) {
    return chartStyles.table.withNoAggregators
  } else {
    return false
  }
}

export function getInitialPaginationAndNativeQuery(
  widget: IWidgetFormed
) {
  return {
    pagination: getInitialPagination(widget),
    nativeQuery: getInitialNativeQuery(widget)
  }
}

export function getUpdatedPagination(
  pagination: IPaginationParams,
  result: IViewQueryResponse
): IPaginationParams {
  if (!pagination) {
    return pagination
  }
  const { pageNo, pageSize, totalCount } = result
  return {
    ...pagination,
    pageNo,
    pageSize,
    totalCount
  }
}

export function getInitialItemInfo(widget: IWidgetFormed): IDashboardItemInfo {
  return {
    datasource: {
      columns: [],
      pageNo: 0,
      pageSize: 0,
      totalCount: 0,
      resultList: []
    },
    loading: false,
    queryConditions: {
      tempFilters: [], // @TODO combine widget static filters with local filters
      linkageFilters: [],
      globalFilters: [],
      variables: [],
      linkageVariables: [],
      globalVariables: [],
      drillpathInstance: [],
      ...getInitialPaginationAndNativeQuery(widget)
    },
    shareToken: '',
    shareLoading: false,
    authorizedShareToken: '',
    downloadCsvLoading: false,
    interactId: '',
    rendered: false,
    renderType: 'rerender',
    selectedItems: [],
    errorMessage: ''
  }
}

interface IGlobalControlInitialValues {
  [itemId: string]: Pick<IQueryConditions, 'globalFilters' | 'globalVariables'>
}

export function getGlobalControlInitialValues(
  controls: IGlobalControl[]
): IGlobalControlInitialValues {
  const initialValues: IGlobalControlInitialValues = {}
  controls.forEach((control: IGlobalControl) => {
    const { interactionType, relatedItems, relatedViews } = control
    const defaultValue = deserializeDefaultValue(control)
    if (defaultValue) {
      Object.entries(relatedItems).forEach(([itemId, config]) => {
        Object.entries(relatedViews).forEach(([viewId, fields]) => {
          if (config.checked && config.viewId === Number(viewId)) {
            const filterValue =
              interactionType === 'column'
                ? getModelValue(
                    control,
                    fields as IControlRelatedField,
                    defaultValue
                  )
                : getVariableValue(control, fields, defaultValue)
            if (!initialValues[itemId]) {
              initialValues[itemId] = {
                globalFilters: [],
                globalVariables: []
              }
            }
            if (interactionType === 'column') {
              initialValues[itemId].globalFilters = initialValues[
                itemId
              ].globalFilters.concat(filterValue)
            } else {
              initialValues[itemId].globalVariables = initialValues[
                itemId
              ].globalVariables.concat(filterValue)
            }
          }
        })
      })
    }
  })
  return initialValues
}

export function getRequestParams(
  widget: IWidgetFormed,
  cachedQueryConditions: IQueryConditions,
  flush: boolean,
  inputQueryConditions?: Partial<IQueryConditions>
): IDataRequestParams {
  const {
    cols,
    rows,
    metrics,
    secondaryMetrics,
    color,
    label,
    size,
    xAxis,
    tip,
    cache,
    expired
  } = widget.config
  const updatedCols = cols.map((col) => widgetDimensionMigrationRecorder(col))
  const updatedRows = rows.map((row) => widgetDimensionMigrationRecorder(row))
  const customOrders = updatedCols
    .concat(updatedRows)
    .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
    .map(({ name, sort }) => ({
      name,
      list: sort[FieldSortTypes.Custom].sortList
    }))

  // @TODO combine widget static filters with local filters
  let tempFilters = cachedQueryConditions.tempFilters
  let linkageFilters = cachedQueryConditions.linkageFilters
  let globalFilters = cachedQueryConditions.globalFilters
  let paginationOrders = cachedQueryConditions.orders
  let variables = cachedQueryConditions.variables
  let linkageVariables = cachedQueryConditions.linkageVariables
  let globalVariables = cachedQueryConditions.globalVariables
  let pagination = cachedQueryConditions.pagination
  let nativeQuery = cachedQueryConditions.nativeQuery
  let drillStatus = cachedQueryConditions.drillStatus

  const prevDrillHistory = cachedQueryConditions.drillHistory
    ? cachedQueryConditions.drillHistory[
        cachedQueryConditions.drillHistory.length - 1
      ]
    : {}

  if (inputQueryConditions) {
    tempFilters = inputQueryConditions.tempFilters || tempFilters
    linkageFilters = inputQueryConditions.linkageFilters || linkageFilters
    globalFilters = inputQueryConditions.globalFilters || globalFilters
    paginationOrders = inputQueryConditions.orders || paginationOrders
    variables = inputQueryConditions.variables || variables
    linkageVariables = inputQueryConditions.linkageVariables || linkageVariables
    globalVariables = inputQueryConditions.globalVariables || globalVariables
    drillStatus = inputQueryConditions.drillStatus || prevDrillHistory
    pagination = inputQueryConditions.pagination || pagination
    nativeQuery =
      inputQueryConditions.nativeQuery !== void 0
        ? inputQueryConditions.nativeQuery
        : nativeQuery
  }

  let groups = cols
    .concat(rows)
    .filter((g) => g.name !== '指标名称')
    .map((g) => g.name)

  let aggregators = metrics.map((m) => ({
    column: decodeMetricName(m.name),
    func: m.agg
  }))

  let orders = widget.config.orders

  const filters = widget.config.filters.reduce(
    (a, b) => a.concat(b.config.sqlModel),
    []
  )

  if (secondaryMetrics && secondaryMetrics.length) {
    aggregators = aggregators.concat(
      secondaryMetrics.map((second) => ({
        column: decodeMetricName(second.name),
        func: second.agg
      }))
    )
  }

  if (color) {
    groups = groups.concat(color.items.map((c) => c.name))
  }
  if (label) {
    groups = groups.concat(
      label.items.filter((l) => l.type === 'category').map((l) => l.name)
    )
    aggregators = aggregators.concat(
      label.items
        .filter((l) => l.type === 'value')
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        }))
    )
  }
  if (size) {
    aggregators = aggregators.concat(
      size.items.map((s) => ({
        column: decodeMetricName(s.name),
        func: s.agg
      }))
    )
  }
  if (xAxis) {
    aggregators = aggregators.concat(
      xAxis.items.map((x) => ({
        column: decodeMetricName(x.name),
        func: x.agg
      }))
    )
  }
  if (tip) {
    aggregators = aggregators.concat(
      tip.items.map((t) => ({
        column: decodeMetricName(t.name),
        func: t.agg
      }))
    )
  }
  if (paginationOrders) {
    orders = orders.concat(paginationOrders)
  }

  return {
    groups,
    aggregators,
    filters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    orders,
    cache,
    expired,
    flush,
    pagination,
    nativeQuery,
    customOrders,
    drillStatus
  }
}

export function getRequestBody(
  requestParams: IDataRequestParams
): IDataRequestBody {
  const {
    filters,
    tempFilters, // @TODO combine widget static filters with local filters
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    pagination,
    drillStatus,
    groups,
    ...rest
  } = requestParams

  const { pageSize, pageNo } = pagination || { pageSize: 0, pageNo: 0 }

  let combinedFilters = filters
    .concat(tempFilters)
    .concat(linkageFilters)
    .concat(globalFilters)
  if (drillStatus && drillStatus.filters) {
    combinedFilters = combinedFilters.concat(drillStatus.filters)
  }

  return {
    ...omit(rest, 'customOrders'),
    groups: drillStatus && drillStatus.groups ? drillStatus.groups : groups,
    filters: combinedFilters,
    params: variables.concat(linkageVariables).concat(globalVariables),
    pageSize,
    pageNo
  }
}

export function getFormValuesRelatedItems(
  controls: IGlobalControl[],
  formValues: object
): number[] {
  return Object.keys(formValues).reduce((items, key) => {
    const control = controls.find((c) => c.key === key)
    const { relatedItems } = control
    const checkedItems = Object.entries(relatedItems)
      .filter(([itemId, config]) => config.checked)
      .map(([itemId]) => itemId)
    return Array.from(new Set([...items, ...checkedItems]))
  }, [])
}

export function getCurrentControlValues(
  type: ControlPanelTypes,
  controls: IGlobalControl[] | ILocalControl[],
  allFormValues: object,
  changedFormValues?: object
): IGlobalControlConditionsByItem | ILocalControlConditions {
  const updatedFormValues = {
    ...allFormValues,
    ...changedFormValues
  }

  if (type === ControlPanelTypes.Global) {
    const changedFormValuesRelatedItems = getFormValuesRelatedItems(
      controls as IGlobalControl[],
      changedFormValues || allFormValues
    )

    const conditionsByItem: IGlobalControlConditionsByItem = {}

    changedFormValuesRelatedItems.forEach((itemId) => {
      Object.entries(updatedFormValues).forEach(([key, value]) => {
        const control = (controls as IGlobalControl[]).find(
          (c) => c.key === key
        )

        if (control) {
          const { interactionType, relatedViews, relatedItems } = control
          const relatedItem = relatedItems[itemId]

          if (relatedItem && relatedItem.checked) {
            const fields = relatedViews[relatedItem.viewId]
            if (!conditionsByItem[itemId]) {
              conditionsByItem[itemId] = {
                globalVariables: [],
                globalFilters: []
              }
            }
            if (interactionType === 'column') {
              const controlFilters = getModelValue(
                control,
                fields as IControlRelatedField,
                value
              )
              conditionsByItem[itemId].globalFilters = conditionsByItem[
                itemId
              ].globalFilters.concat(controlFilters)
            } else {
              const controlVariables = getVariableValue(control, fields, value)
              conditionsByItem[itemId].globalVariables = conditionsByItem[
                itemId
              ].globalVariables.concat(controlVariables)
            }
          }
        }
      })
    })

    return conditionsByItem
  } else {
    const conditions: ILocalControlConditions = {
      tempFilters: [],
      variables: []
    }

    Object.entries(updatedFormValues).forEach(([key, value]) => {
      const control = (controls as ILocalControl[]).find((c) => c.key === key)

      if (control) {
        const { interactionType, fields } = control
        if (interactionType === 'column') {
          const controlFilters = getModelValue(
            control,
            fields as IControlRelatedField,
            value
          )
          conditions.tempFilters = conditions.tempFilters.concat(controlFilters)
        } else {
          const controlVariables = getVariableValue(control, fields, value)
          conditions.variables = conditions.variables.concat(controlVariables)
        }
      }
    })

    return conditions
  }
}
