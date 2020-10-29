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

import { compose } from 'redux'
import { ViewModelTypes } from 'containers/View/constants'
import { RequireAtLeastOne } from 'utils/types'
import WidgetAbstract, { WidgetDimensions, IWidgetPool } from '../types'
import { decodeMetricName } from 'containers/Widget/components/util'
import {
  IWidgetDimension,
  WidgetMode,
  IWidgetFilter
} from 'app/containers/Widget/components/Widget'
import { OperateObjectAbstract } from 'utils/abstract/OperateObjectAbstract'
import {
  getTypesOfModelByKeyName,
  getListsByViewModelTypes
} from 'containers/View/util'
import ChartTypes from 'containers/Widget/config/chart/ChartTypes'

export default class OperatingWidget extends OperateObjectAbstract {
  private widgetPool: IWidgetPool
  private currentWidgetId: number
  private widgetProps: WidgetAbstract = new WidgetAbstract()

  public receive(widgetId: number) {
    const target = this.getWidgetById(widgetId)
    if (target) {
      this.currentWidgetId = widgetId
      this.main(target)
    }
  }

  private getWidgetPool() {
    return this.widgetPool
  }

  public main(target: WidgetAbstract) {
    this.setTargetProps<WidgetAbstract>(this.widgetProps, target)
  }

  public widgetIntoPool(widgets) {
    const widgetPool = widgets.reduce((iteratee, widget) => {
      const { id, config } = widget
      iteratee[Number(id)] = config // possible performance defects
      return iteratee
    }, {})
    this.widgetPool = widgetPool
  }

  private getWidgetById(widgetId: number): WidgetAbstract {
    return this.widgetPool[widgetId]
  }

  public getWidgetProps() {
    return this.getTarget<WidgetAbstract>(this.widgetProps)
  }

  public initGroups() {
    let widget = this.getWidgetById(this.currentWidgetId)
    if (!widget.initGroups) {
      const { rows, cols, color, label } = widget
      const setDefaultEmptyArray = setDefaultReplaceNull((f) => f, [])
      const groups = [
        ...compose(mappingName, filterByName, setDefaultEmptyArray)(cols),
        ...compose(mappingName, filterByName, setDefaultEmptyArray)(rows),
        ...compose(
          mappingName,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(color),
        ...compose(
          mappingName,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(label)
      ]
      widget = {
        ...widget,
        initGroups: groups
      }
      return groups
    }
    return widget.initGroups
  }

  public initAggregators() {
    const widget = this.getWidgetById(this.currentWidgetId)
    if (!widget.initAggregators) {
      const { metrics, secondaryMetrics, label, size, xAxis, tip } = widget
      const setDefaultEmptyArray = setDefaultReplaceNull((f) => f, [])
      const aggregators = [
        ...compose(mappingAggregators, setDefaultEmptyArray)(metrics),
        ...compose(mappingAggregators, setDefaultEmptyArray)(secondaryMetrics),
        ...compose(
          mappingAggregators,
          filterByValue,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(label),
        ...compose(
          mappingAggregators,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(size),
        ...compose(
          mappingAggregators,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(xAxis),
        ...compose(
          mappingAggregators,
          setDefaultEmptyArray,
          getItem,
          setDefaultEmptyArray
        )(tip)
      ]
      widget.initAggregators = aggregators
      return aggregators
    }
    return widget.initAggregators
  }

  public getMode() {
    return this.getTargetPropsByProperty<WidgetAbstract, 'mode'>(
      this.widgetProps,
      'mode'
    )
  }

  public isPivot() {
    return this.getMode() === 'pivot'
  }

  public getModel() {
    return this.getTargetPropsByProperty<WidgetAbstract, 'model'>(
      this.widgetProps,
      'model'
    )
  }

  public isCoustomTable(): boolean {
    const selectedChart = this.getSelectedChart()
    return selectedChart === ChartTypes.Table
  }

  public getDimetionAxis() {
    return this.getTargetPropsByProperty<WidgetAbstract, 'dimetionAxis'>(
      this.widgetProps,
      'dimetionAxis'
    )
  }

  public getSelectedChart() {
    return this.getTargetPropsByProperty<WidgetAbstract, 'selectedChart'>(
      this.widgetProps,
      'selectedChart'
    )
  }

  public getRowsOrCols(dimension: WidgetDimensions) {
    return (
      this.getTargetPropsByProperty<WidgetAbstract, WidgetDimensions>(
        this.widgetProps,
        dimension
      ) || []
    )
  }

  public overWriteRowsOrCols(
    source: WidgetAbstract,
    dimension: WidgetDimensions,
    widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>
  ): WidgetAbstract {
    return {
      ...source,
      ...{ [dimension]: [widgetDimension] }
    }
  }

  public deleteWithSthRowsOrCols(
    source: WidgetAbstract,
    dimension: WidgetDimensions,
    widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>
  ): WidgetAbstract {
    const target = this.getTargetPropsByProperty<
      WidgetAbstract,
      WidgetDimensions
    >(source, dimension)
    return {
      ...source,
      ...{
        [dimension]: target.filter((dm) => dm.name !== widgetDimension['name'])
      }
    }
  }

  public insertSthInCursor(
    target: IWidgetDimension[],
    widgetDimension: RequireAtLeastOne<
      IWidgetDimension,
      keyof IWidgetDimension
    >,
    cursor?: Pick<IWidgetDimension, 'name'>
  ) {
    return cursor
      ? target.reduce((iteratee, t) => {
          iteratee = iteratee.concat(
            t.name === cursor.name ? [t, widgetDimension] : t
          )
          return iteratee
        }, [])
      : target.concat(widgetDimension as IWidgetDimension)
  }

  public insertWithSthRowsOrCols(
    source: WidgetAbstract,
    dimension: WidgetDimensions,
    widgetDimension: RequireAtLeastOne<
      IWidgetDimension,
      keyof IWidgetDimension
    >,
    cursor?: Pick<IWidgetDimension, 'name'>
  ): WidgetAbstract {
    const target = this.getTargetPropsByProperty<
      WidgetAbstract,
      WidgetDimensions
    >(source, dimension)
    const Bridged = this.insertSthInCursor(target, widgetDimension, cursor)
    return {
      ...source,
      ...{ [dimension]: Bridged }
    }
  }

  public initWidgetNativeFilters() {
    const filters = this.getTargetPropsByProperty<WidgetAbstract, 'filters'>(
      this.widgetProps,
      'filters'
    )
    return filters && filters.length
      ? filters.reduce((iteratee, target: IWidgetFilter) => {
          iteratee = iteratee.concat(target.config.sqlModel)
          return iteratee
        }, [])
      : []
  }

  public getTypesOfModelByKeyName = getTypesOfModelByKeyName
  public getListsByViewModelTypes = getListsByViewModelTypes
  private jsonParse(widgetConfig: string) {
    try {
      return JSON.parse(widgetConfig)
    } catch (error) {
      throw new Error(error)
    }
  }

  private static instance: OperatingWidget

  private constructor() {
    super()
  }

  public static getInstance() {
    if (!OperatingWidget.instance) {
      OperatingWidget.instance = new OperatingWidget()
    }
    return OperatingWidget.instance
  }
}

function filterByName(target) {
  return target.filter((t) => t.name !== '指标名字')
}

function filterByCategory(target) {
  return target.filter((t) => t.type === ViewModelTypes.Category)
}

function filterByValue(target) {
  return target.filter((t) => t.type === ViewModelTypes.Value)
}

function getItem(target) {
  return target.items
}

function mappingName(target) {
  return target.map((t) => t.name)
}

function mappingAggregators(target) {
  return target.map((t) => ({
    column: decodeMetricName(t.name),
    func: t.agg
  }))
}

export function setDefaultReplaceNull(func, others?): Function {
  const defaultValue = Array.prototype.slice.call(arguments, 1)
  return function (val?) {
    const arg = Array.from(arguments).map((t, i) => {
      return t != null ? t : defaultValue[i]
    })
    return func.apply(null, arg)
  }
}

export const operationWidgetProps = OperatingWidget.getInstance()
