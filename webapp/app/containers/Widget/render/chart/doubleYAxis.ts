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

import { IChartProps } from '../../components/Chart'
import {
  decodeMetricName,
  getChartTooltipLabel,
  getTextWidth,
  getAggregatorLocale,
  metricAxisLabelFormatter
} from '../../components/util'
import {
  getLegendOption,
  getGridPositions,
  getDimetionAxisOption,
  getCartesianChartReferenceOptions
} from './util'
import { getFormattedValue } from '../../components/Config/Format'
import { getFieldAlias } from '../../components/Config/Field'
import ChartTypes from '../../config/chart/ChartTypes'

export default function (chartProps: IChartProps, drillOptions) {
  const {
    data,
    cols,
    metrics,
    chartStyles,
    // color,
    // tip,
    references
  } = chartProps

  const {
    legend,
    spec,
    doubleYAxis,
    xAxis,
    splitLine
  } = chartStyles

  const {
    legendPosition,
    fontSize
  } = legend

  const {
    stack,
    smooth,
    step,
    symbol,
    label
  } = spec

  const {
    yAxisLeft,
    yAxisRight,
    yAxisSplitNumber,
    dataZoomThreshold
  } = doubleYAxis

  const {
    labelColor,
    labelFontFamily,
    labelFontSize,
    lineColor,
    lineSize,
    lineStyle,
    showLabel,
    showLine,
    xAxisInterval,
    xAxisRotate
  } = xAxis

  const {
    showVerticalLine,
    verticalLineColor,
    verticalLineSize,
    verticalLineStyle,
    showHorizontalLine,
    horizontalLineColor,
    horizontalLineSize,
    horizontalLineStyle
  } = splitLine

  const labelOption = {
    label: {
      normal: {
        show: label,
        position: 'top'
      }
    }
  }

  const { selectedItems } = drillOptions
  const { secondaryMetrics } = chartProps

  const xAxisData = showLabel ? data.map((d) => d[cols[0].name]) : []
  const seriesData = secondaryMetrics
    ? getAixsMetrics('metrics', metrics, data, stack, labelOption, references, selectedItems, {key: 'yAxisLeft', type: yAxisLeft})
      .concat(getAixsMetrics('secondaryMetrics', secondaryMetrics, data, stack, labelOption, references, selectedItems, {key: 'yAxisRight', type: yAxisRight}))
    : getAixsMetrics('metrics', metrics, data, stack, labelOption, references, selectedItems, {key: 'yAxisLeft', type: yAxisLeft})

  const seriesObj = {
    series: seriesData.map((series) => {
      if (series.type === 'line') {
        return {
          ...series,
          symbol: symbol ? 'emptyCircle' : 'none',
          smooth,
          step
        }
      } else {
        return series
      }
    })
  }

  let legendOption
  let gridOptions
  if (seriesData.length > 1) {
    const seriesNames = seriesData.map((s) => s.name)
    legendOption = {
      legend: getLegendOption(legend, seriesNames)
    }
    gridOptions = {
      grid: getGridPositions(legend, seriesNames, 'doubleYAxis', false, null, xAxis, xAxisData)
    }
  }

  let leftMax
  let rightMax

  if (stack) {
    leftMax = metrics.reduce((num, m) => num + Math.max(...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`])), 0)
    rightMax = secondaryMetrics.reduce((num, m) => num + Math.max(...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`])), 0)
  } else {
    leftMax = Math.max(...metrics.map((m) => Math.max(...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`]))))
    rightMax = Math.max(...secondaryMetrics.map((m) => Math.max(...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`]))))
  }

  const leftInterval = getYaxisInterval(leftMax, (yAxisSplitNumber - 1))
  const rightInterval = rightMax > 0 ? getYaxisInterval(rightMax, (yAxisSplitNumber - 1)) : leftInterval

  const inverseOption = xAxis.inverse ? { inverse: true } : null

  const xAxisSplitLineConfig = {
    showLine: showVerticalLine,
    lineColor: verticalLineColor,
    lineSize: verticalLineSize,
    lineStyle: verticalLineStyle
  }

  const allMetrics = secondaryMetrics ? [].concat(metrics).concat(secondaryMetrics) : metrics
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'cross'},
      formatter (params) {
        const tooltipLabels = [getFormattedValue(params[0].name, cols[0].format), '<br/>']
        params.reduce((acc, param) => {
          const { color, value, seriesIndex } = param
          if (color) {
            acc.push(`<span class="widget-tooltip-circle" style="background: ${color}"></span>`)
          }
          acc.push(getFieldAlias(allMetrics[seriesIndex].field, {}) || decodeMetricName(allMetrics[seriesIndex].name))
          acc.push(': ', getFormattedValue(value, allMetrics[seriesIndex].format), '<br/>')
          return acc
        }, tooltipLabels)
        return tooltipLabels.join('')
      }
    },
    xAxis: getDimetionAxisOption(xAxis, xAxisSplitLineConfig, xAxisData),
    yAxis: [
      {
        type: 'value',
        key: 'yAxisIndex0',
        min: 0,
        max: rightMax > 0 ? rightInterval * (yAxisSplitNumber - 1) : leftInterval * (yAxisSplitNumber - 1),
        interval: rightInterval,
        position: 'right',
        ...getDoubleYAxis(doubleYAxis)
      },
      {
        type: 'value',
        key: 'yAxisIndex1',
        min: 0,
        max: leftInterval * (yAxisSplitNumber - 1),
        interval: leftInterval,
        position: 'left',
        ...getDoubleYAxis(doubleYAxis)
      }
    ],
    ...seriesObj,
    ...gridOptions,
    ...legendOption
  }

  return option
}

export function getAixsMetrics (type, axisMetrics, data, stack, labelOption, references, selectedItems, axisPosition?: {key: string, type: string}) {
  const seriesNames = []
  const seriesAxis = []
  const referenceOptions = getCartesianChartReferenceOptions(references, ChartTypes.DoubleYAxis, axisMetrics, data)
  axisMetrics.forEach((m, amIndex) => {
    const decodedMetricName = decodeMetricName(m.name)
    const localeMetricName = `[${getAggregatorLocale(m.agg)}] ${decodedMetricName}`
    seriesNames.push(decodedMetricName)
    const stackOption = stack && axisPosition.type === 'bar' && axisMetrics.length > 1 ? { stack: axisPosition.key } : null
    const itemData = data.map((g, index) => {
      const itemStyle = selectedItems && selectedItems.length && selectedItems.some((item) => item === index) ? {itemStyle: {normal: {opacity: 1, borderWidth: 6}}} : null
      return {
        value: g[`${m.agg}(${decodedMetricName})`],
        ...itemStyle
      }
    })

    seriesAxis.push({
      name: decodedMetricName,
      type: axisPosition && axisPosition.type ? axisPosition.type : type === 'metrics' ? 'line' : 'bar',
      ...stackOption,
      yAxisIndex: type === 'metrics' ? 1 : 0,
      data: itemData,
      ...labelOption,
      ...(amIndex === axisMetrics.length - 1 && referenceOptions),
      itemStyle: {
        normal: {
          opacity: selectedItems && selectedItems.length > 0 ? 0.25 : 1
        }
      }
    })
  })
  return seriesAxis
}

export function getYaxisInterval (max, splitNumber) {
  const roughInterval = parseInt(`${max / splitNumber}`, 10)
  const divisor = Math.pow(10, (`${roughInterval}`.length - 1))
  return (parseInt(`${roughInterval / divisor}`, 10) + 1) * divisor
}

export function getDoubleYAxis (doubleYAxis) {
  const {
    inverse,
    showLine,
    lineStyle,
    lineSize,
    lineColor,
    showLabel,
    labelFontFamily,
    labelFontSize,
    labelColor
  } = doubleYAxis

  return {
    inverse,
    axisLine: {
      show: showLine,
      lineStyle: {
        color: lineColor,
        width: Number(lineSize),
        type: lineStyle
      }
    },
    axisLabel: {
      show: showLabel,
      color: labelColor,
      fontFamily: labelFontFamily,
      fontSize: Number(labelFontSize),
      formatter: metricAxisLabelFormatter
    }
  }
}
