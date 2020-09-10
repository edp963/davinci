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

import { IDashboardRaw, IDashboardNode } from './types'
import { IWidgetConfig, RenderType } from '../Widget/components/Widget'
import { FieldSortTypes } from '../Widget/components/Config/Sort'
import { IQueryConditions } from '../Dashboard/types'
import { decodeMetricName } from '../Widget/components/util'

type MapDashboardNodes = { [parentId: number]: IDashboardNode[] }

export function getDashboardNodes(dashboards: IDashboardRaw[]): IDashboardNode[] {
  if (!Array.isArray(dashboards)) {
    return []
  }
  const mapDashboardNodes = dashboards.reduce<MapDashboardNodes>(
    (map, node) => {
      if (!map[node.parentId]) {
        map[node.parentId] = []
      }
      map[node.parentId].push(node)
      return map
    },
    {}
  )

  const dashboardNodes = dashboards as IDashboardNode[]
  dashboardNodes.forEach((currentNode) => {
    const childNodes = mapDashboardNodes[currentNode.id]
    if (Array.isArray(childNodes)) {
      currentNode.children = childNodes
    }
  })

  const ancestorNodes = dashboardNodes.filter(({ parentId }) => !parentId)
  return ancestorNodes
}

export function getRequestParamsByWidgetConfig(
  renderType: RenderType,
  widgetConfig: IWidgetConfig,
  prevQueryConditions: Partial<IQueryConditions>,
  queryConditions?: Partial<IQueryConditions>
) {
  const {
    cols,
    rows,
    metrics,
    secondaryMetrics,
    filters,
    color,
    label,
    size,
    xAxis,
    tip,
    orders,
    limit,
    cache,
    expired
  } = widgetConfig

  const customOrders = cols
    .concat(rows)
    .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
    .map(({ name, sort }) => ({
      name,
      list: sort[FieldSortTypes.Custom].sortList
    }))

  let tempFilters // @TODO combine widget static filters with local filters
  let linkageFilters
  let globalFilters
  let tempOrders
  let variables
  let linkageVariables
  let globalVariables
  let pagination
  let nativeQuery

  if (queryConditions) {
    tempFilters =
      queryConditions.tempFilters !== void 0
        ? queryConditions.tempFilters
        : prevQueryConditions.tempFilters
    linkageFilters =
      queryConditions.linkageFilters !== void 0
        ? queryConditions.linkageFilters
        : prevQueryConditions.linkageFilters
    globalFilters =
      queryConditions.globalFilters !== void 0
        ? queryConditions.globalFilters
        : prevQueryConditions.globalFilters
    tempOrders =
      queryConditions.orders !== void 0
        ? queryConditions.orders
        : prevQueryConditions.orders
    variables = queryConditions.variables || prevQueryConditions.variables
    linkageVariables =
      queryConditions.linkageVariables || prevQueryConditions.linkageVariables
    globalVariables =
      queryConditions.globalVariables || prevQueryConditions.globalVariables
    pagination = queryConditions.pagination || prevQueryConditions.pagination
    nativeQuery = queryConditions.nativeQuery || prevQueryConditions.nativeQuery
  } else {
    tempFilters = prevQueryConditions.tempFilters
    linkageFilters = prevQueryConditions.linkageFilters
    globalFilters = prevQueryConditions.globalFilters
    tempOrders = prevQueryConditions.orders
    variables = prevQueryConditions.variables
    linkageVariables = prevQueryConditions.linkageVariables
    globalVariables = prevQueryConditions.globalVariables
    pagination = prevQueryConditions.pagination
    nativeQuery = prevQueryConditions.nativeQuery
  }

  let groups = cols
    .concat(rows)
    .filter((g) => g.name !== '指标名称')
    .map((g) => g.name)
  let aggregators = metrics.map((m) => ({
    column: decodeMetricName(m.name),
    func: m.agg
  }))

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
      xAxis.items.map((l) => ({
        column: decodeMetricName(l.name),
        func: l.agg
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

  const requestParamsFilters = filters.reduce((a, b) => {
    return a.concat(b.config.sqlModel)
  }, [])

  const requestParams = {
    groups,
    aggregators,
    filters: requestParamsFilters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    orders,
    limit,
    cache,
    expired,
    flush: renderType === 'flush',
    pagination,
    nativeQuery,
    customOrders
  }

  if (tempOrders) {
    requestParams.orders = requestParams.orders.concat(tempOrders)
  }

  return requestParams
}
