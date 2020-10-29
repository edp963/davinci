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

import { getLastItemValueOfArray } from './util'

import { RequireAtLeastOne } from 'utils/types'

import WidgetAbstract, {
  DrillCharts,
  DrillType,
  WidgetDimensions,
  IDrillDetail,
  IDrillStrategies,
  ISourceDataFilter
} from './types'

import { IFilter } from '../Control/types'

import { getValidColumnValue } from 'app/components/Control/util'

import OperatingWidget, {
  operationWidgetProps,
  setDefaultReplaceNull
} from './abstract/widgetOperating'

import { IWidgetDimension } from 'containers/Widget/components/Widget'

const setDefaultEmptyArray = setDefaultReplaceNull((f) => f, [])

export const strategiesOfDrillUpHasDrillHistory = (
  lastDrillHistory: IDrillDetail,
  currentWidgetProps: WidgetAbstract
) => (
  widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>,
  sourceData?,
  sourceGroup?: string[]
) => {
  return {
    [DrillCharts.PIVOT]: (): IDrillDetail => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension,
        currentWidgetProps
      )
      const { widgetProps, filters } = drillStragegies
      const lastGroupOfCols =
        currentWidgetProps.cols && currentWidgetProps.cols.length !== 0
          ? getLastItemValueOfArray(currentWidgetProps.cols, 'name')
          : null
      const lastGroupOfRows =
        currentWidgetProps.rows && currentWidgetProps.rows.length !== 0
          ? getLastItemValueOfArray(currentWidgetProps.rows, 'name')
          : null

      return {
        ...drillStragegies,
        filters: mappingFilters(
          sourceData,
          lastGroupOfCols || lastGroupOfRows
        ).concat(filters)
      }
    },
    [DrillCharts.COUSTOMTABLE]: (): IDrillStrategies => {
      // 缺少对 sourceDataGroup 的处理, sourceDataGroup 只是对cols有影响，对filters没有影响。cols又决定table的表头
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension
      )
      const coustomTableFilters = compose(
        combineFilters,
        collectKeyValue,
        setDefaultEmptyArray
      )(sourceData)
      return {
        ...drillStragegies,
        filters: coustomTableFilters.concat(drillStragegies.filters)
      }
    }
  }
  function common(): IDrillStrategies {
    const WP = operationWidgetProps
    const { groups, filters } = lastDrillHistory
    const widgetProps = WP.deleteWithSthRowsOrCols(
      WP.deleteWithSthRowsOrCols(
        currentWidgetProps,
        WidgetDimensions.ROW,
        widgetDimension
      ),
      WidgetDimensions.COL,
      widgetDimension
    )
    return {
      cols: widgetProps.cols,
      rows: widgetProps.rows,
      type: DrillType.UP,
      groups: groups.filter((group) => group !== widgetDimension.name),
      filters,
      widgetProps,
      currentGroup: widgetDimension.name
    }
  }
}

export const strategiesOfDrillDownHasDrillHistory = (
  lastDrillHistory: IDrillDetail,
  currentWidgetProps: WidgetAbstract
) => (
  widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>,
  sourceData,
  sourceDataGroup
) => {
  const WP = operationWidgetProps
  const cursor: Pick<IWidgetDimension, 'name'> = coustomTableCursor(
    sourceData,
    sourceDataGroup
  )

  function common(
    widgetDimension: IWidgetDimension,
    currentWidgetProps: WidgetAbstract
  ): IDrillStrategies {
    const { cols, rows, groups, filters } = lastDrillHistory
    return {
      cols,
      rows,
      type: DrillType.DOWN,
      groups,
      filters,
      widgetProps: currentWidgetProps,
      currentGroup: widgetDimension.name
    }
  }

  return {
    [DrillCharts.PIVOTCOL]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension,
        currentWidgetProps
      )
      const { groups, filters, widgetProps } = drillStragegies
      const nextWidgetProps = WP.insertWithSthRowsOrCols(
        widgetProps,
        WidgetDimensions.COL,
        widgetDimension
      )
      const lastGroup = groups[groups.length - 1]
      return {
        ...drillStragegies,
        widgetProps: nextWidgetProps,
        groups: groups.concat(widgetDimension.name),
        filters: mappingFilters(sourceData, lastGroup).concat(filters),
        cols: nextWidgetProps.cols,
        rows: nextWidgetProps.rows
      }
    },
    [DrillCharts.PIVOTROW]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension,
        currentWidgetProps
      )
      const { groups, filters, widgetProps } = drillStragegies
      const nextWidgetProps = WP.insertWithSthRowsOrCols(
        widgetProps,
        WidgetDimensions.ROW,
        widgetDimension
      )
      const lastGroup = groups[groups.length - 1]
      return {
        ...drillStragegies,
        widgetProps: nextWidgetProps,
        groups: groups.concat(widgetDimension.name),
        filters: mappingFilters(sourceData, lastGroup).concat(filters),
        cols: nextWidgetProps.cols,
        rows: nextWidgetProps.rows
      }
    },
    [DrillCharts.COUSTOMTABLE]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension,
        currentWidgetProps
      )
      const { groups, filters, widgetProps } = drillStragegies
      const nextWidgetProps = WP.insertWithSthRowsOrCols(
        widgetProps,
        WidgetDimensions.COL,
        widgetDimension,
        cursor
      )
      const coustomTableFilters = compose(
        combineFilters,
        collectKeyValue,
        setDefaultEmptyArray
      )(sourceData)
      return {
        ...drillStragegies,
        groups: groups.concat(widgetDimension.name),
        filters: coustomTableFilters.concat(filters),
        cols: nextWidgetProps.cols,
        rows: nextWidgetProps.rows,
        widgetProps: nextWidgetProps
      }
    },
    [DrillCharts.DIMETIONAXISCOL]: defaultStrategies,
    [DrillCharts.DIMETIONAXISROW]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension,
        currentWidgetProps
      )
      const { groups, filters, widgetProps } = drillStragegies
      const nextWidgetProps = WP.overWriteRowsOrCols(
        widgetProps,
        WidgetDimensions.ROW,
        widgetDimension
      )
      const lastGroup = groups[groups.length - 1]
      return {
        ...drillStragegies,
        widgetProps: nextWidgetProps,
        groups: [widgetDimension.name],
        filters: mappingFilters(sourceData, lastGroup).concat(filters),
        cols: nextWidgetProps.cols,
        rows: nextWidgetProps.rows
      }
    },
    [DrillCharts.DEFAULT]: defaultStrategies
  }
  function defaultStrategies(): IDrillStrategies {
    const drillStragegies: IDrillStrategies = common.call(
      null,
      widgetDimension,
      currentWidgetProps
    )
    const { groups, filters, widgetProps } = drillStragegies
    const nextWidgetProps = WP.overWriteRowsOrCols(
      widgetProps,
      WidgetDimensions.COL,
      widgetDimension
    )
    const lastGroup = groups[groups.length - 1]
    return {
      ...drillStragegies,
      groups: [widgetDimension.name],
      filters: mappingFilters(sourceData, lastGroup).concat(filters),
      cols: nextWidgetProps.cols,
      rows: nextWidgetProps.rows,
      widgetProps: nextWidgetProps
    }
  }
}

export const strategiesOfDrillUpNullDrillHistory = (
  WP: OperatingWidget,
  target: WidgetAbstract
) => (
  widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>,
  sourceData?
) => {
  const initGroups = WP.initGroups()
  const initNativeFilters = WP.initWidgetNativeFilters()

  return {
    [DrillCharts.PIVOT]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension
      )
      const { widgetProps } = drillStragegies
      const lastGroupOfCols =
        target.cols && target.cols.length !== 0
          ? getLastItemValueOfArray(target.cols, 'name')
          : null
      const lastGroupOfRows =
        target.rows && target.rows.length !== 0
          ? getLastItemValueOfArray(target.rows, 'name')
          : null

      return {
        ...drillStragegies,
        filters: mappingFilters(
          sourceData,
          lastGroupOfCols || lastGroupOfRows
        ).concat(initNativeFilters)
      }
    },
    [DrillCharts.COUSTOMTABLE]: (): IDrillStrategies => {
      const drillStragegies: IDrillStrategies = common.call(
        null,
        widgetDimension
      )
      const coustomTableFilters = compose(
        combineFilters,
        collectKeyValue,
        setDefaultEmptyArray
      )(sourceData)
      return {
        ...drillStragegies,
        filters: coustomTableFilters.concat(initNativeFilters)
      }
    }
  }
  function common(): IDrillStrategies {
    const widgetProps = WP.deleteWithSthRowsOrCols(
      WP.deleteWithSthRowsOrCols(target, WidgetDimensions.ROW, widgetDimension),
      WidgetDimensions.COL,
      widgetDimension
    )
    return {
      widgetProps,
      type: DrillType.UP,
      groups: initGroups.filter((group) => group !== widgetDimension.name),
      currentGroup: widgetDimension.name,
      filters: initNativeFilters,
      cols: widgetProps.cols,
      rows: widgetProps.rows
    }
  }
}

export const strategiesOfDrillDownNullDrillHistory = (
  WP: OperatingWidget,
  target: WidgetAbstract
) => (
  widgetDimension: RequireAtLeastOne<IWidgetDimension, keyof IWidgetDimension>,
  sourceData,
  sourceDataGroup
) => {
  const initGroups = WP.initGroups()
  const initNativeFilters = WP.initWidgetNativeFilters()
  const getCols = WP.getRowsOrCols(WidgetDimensions.COL)
  const getRows = WP.getRowsOrCols(WidgetDimensions.ROW)
  const cursor: Pick<IWidgetDimension, 'name'> = coustomTableCursor(
    sourceData,
    sourceDataGroup
  )

  return {
    [DrillCharts.PIVOTCOL]: (): IDrillStrategies => {
      const widgetProps = WP.insertWithSthRowsOrCols(
        target,
        WidgetDimensions.COL,
        widgetDimension
      )
      const lastGroupOfCols =
        getCols.length !== 0 ? getLastItemValueOfArray(getCols, 'name') : null
      const lastGroupOfRows =
        getRows.length !== 0 ? getLastItemValueOfArray(getRows, 'name') : null
      return {
        widgetProps,
        type: DrillType.DOWN,
        groups: initGroups.concat(widgetDimension.name),
        currentGroup: widgetDimension.name,
        filters: mappingFilters(
          sourceData,
          lastGroupOfCols || lastGroupOfRows
        ).concat(initNativeFilters),
        cols: widgetProps.cols,
        rows: widgetProps.rows
      }
    },
    [DrillCharts.PIVOTROW]: (): IDrillStrategies => {
      const widgetProps = WP.insertWithSthRowsOrCols(
        target,
        WidgetDimensions.ROW,
        widgetDimension
      )
      const lastGroupOfCols =
        getCols.length !== 0 ? getLastItemValueOfArray(getCols, 'name') : null
      const lastGroupOfRows =
        getRows.length !== 0 ? getLastItemValueOfArray(getRows, 'name') : null
      return {
        widgetProps,
        type: DrillType.DOWN,
        groups: initGroups.concat(widgetDimension.name),
        currentGroup: widgetDimension.name,
        filters: mappingFilters(
          sourceData,
          lastGroupOfCols || lastGroupOfRows
        ).concat(initNativeFilters),
        cols: widgetProps.cols,
        rows: widgetProps.rows
      }
    },
    [DrillCharts.COUSTOMTABLE]: (): IDrillStrategies => {
      const widgetProps = WP.insertWithSthRowsOrCols(
        target,
        WidgetDimensions.COL,
        widgetDimension,
        cursor
      )
      const coustomTableFilters = compose(
        combineFilters,
        collectKeyValue,
        setDefaultEmptyArray
      )(sourceData)
      return {
        widgetProps,
        type: DrillType.DOWN,
        // groups only determine the result of the data set, the order of the table header is determined by cols
        groups: initGroups.concat(widgetDimension.name),
        currentGroup: widgetDimension.name,
        filters: coustomTableFilters.concat(initNativeFilters),
        cols: widgetProps.cols,
        rows: widgetProps.rows
      }
    },
    [DrillCharts.DIMETIONAXISCOL]: defaultStrategies,
    [DrillCharts.DIMETIONAXISROW]: (): IDrillStrategies => {
      const widgetProps = WP.overWriteRowsOrCols(
        target,
        WidgetDimensions.ROW,
        widgetDimension
      )
      const lastGroup =
        getRows.length !== 0 ? getLastItemValueOfArray(getRows, 'name') : null
      return {
        widgetProps,
        type: DrillType.DOWN,
        groups: [widgetDimension.name],
        currentGroup: widgetDimension.name,
        filters: mappingFilters(sourceData, lastGroup).concat(
          initNativeFilters
        ),
        cols: widgetProps.cols,
        rows: widgetProps.rows
      }
    },
    [DrillCharts.DEFAULT]: defaultStrategies
  }

  function defaultStrategies(): IDrillStrategies {
    const widgetProps = WP.overWriteRowsOrCols(
      target,
      WidgetDimensions.COL,
      widgetDimension
    )
    const lastGroup =
      getCols.length !== 0 ? getLastItemValueOfArray(getCols, 'name') : null
    return {
      widgetProps,
      type: DrillType.DOWN,
      groups: [widgetDimension.name],
      currentGroup: widgetDimension.name,
      filters: mappingFilters(sourceData, lastGroup).concat(initNativeFilters),
      cols: widgetProps.cols,
      rows: widgetProps.rows
    }
  }
}

function collectKeyValue(sourceDataFilter) {
  return sourceDataFilter.reduce((iteratee, target) => {
    iteratee[target['key']] === undefined
      ? (iteratee[target['key']] = [target['value']])
      : iteratee[target['key']].push(target['value'])
    return iteratee
  }, {})
}

function mappingFilters(sourceDataFilter, group): IFilter[] {
  if (!(sourceDataFilter && sourceDataFilter.length)) {
    return []
  }
  const mappgingSource = sourceDataFilter.map((source) =>
    source && source[group] ? source[group] : source
  )
  const sqlType = getSqlType(group)
  return [
    {
      name: group,
      operator: 'in',
      type: 'filter',
      value: mappgingSource.map((val) => getValidColumnValue(val, sqlType)),
      sqlType
    }
  ]
}

function getSqlType(target: string) {
  return operationWidgetProps.getTypesOfModelByKeyName(
    operationWidgetProps.getModel(),
    'sqlType'
  )(target)
}

function combineFilters(keyValuds): IFilter[] {
  return Object.keys(keyValuds).reduce((iteratee, target) => {
    const sqlType = getSqlType(target)
    return iteratee.concat({
      name: target,
      operator: 'in',
      type: 'filter',
      value: keyValuds[target].map((v) => getValidColumnValue(v, sqlType)),
      sqlType
    })
  }, [])
}

function coustomTableCursor(
  sourceDataFilter: ISourceDataFilter[],
  sourceDataGroup?
) {
  return {
    name:
      sourceDataFilter && sourceDataFilter.length
        ? getLastItemValueOfArray(sourceDataFilter, 'key')
        : sourceDataGroup && sourceDataGroup.length
        ? sourceDataGroup.pop()
        : ''
  }
}
