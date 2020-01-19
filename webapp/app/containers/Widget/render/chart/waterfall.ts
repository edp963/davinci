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
  getAggregatorLocale
} from '../../components/util'
import {
  getDimetionAxisOption,
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getGridPositions,
  makeGrouped,
  distinctXaxis
} from './util'
import { EChartOption } from 'echarts'
import { getFormattedValue } from '../../components/Config/Format'
const defaultTheme = require('assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

export default function (chartProps: IChartProps) {
  const {
    data,
    cols,
    metrics,
    chartStyles
  } = chartProps

  const {
    spec,
    label,
    xAxis,
    yAxis,
    splitLine
  } = chartStyles

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
    label: getLabelOption('waterfall', label, metrics)
  }

  const xAxisData = data.map((d) => d[cols[0].name] || '')
  let sourceData = []

  const series = []

  metrics.forEach((m) => {
    const metricName = `${m.agg}(${decodeMetricName(m.name)})`
    sourceData = data.map((d) => d[metricName])
    const baseData = []
    const seriesBaseData = [...data]
    const ascendOrder = []
    const discendOrder = []
    sourceData.forEach((a, index) => {
      a = parseFloat(a)
      if (index > 0) {
        const result = a - parseFloat(sourceData[index - 1])
        if (result >= 0) {
          ascendOrder.push(result)
          discendOrder.push('-')
          baseData.push(parseFloat(sourceData[index - 1]))
        } else {
          ascendOrder.push('-')
          discendOrder.push(Math.abs(result))
          baseData.push(parseFloat(sourceData[index - 1]) - Math.abs(result))
        }
        return result
      } else {
        ascendOrder.push(a)
        discendOrder.push('-')
        baseData.push(0)
        return a
      }
    })
    const totalAscend = ascendOrder.reduce((sum, val) => typeof val === 'number' ? sum + val : sum + 0, 0)
    const totalDiscendOrder = discendOrder.reduce((sum, val) => typeof val === 'number' ? sum + val : sum + 0, 0)
    const difference = totalAscend - totalDiscendOrder
    xAxisData.push('累计')
    baseData.push('-')
    if (difference > 0) {
      ascendOrder.push(difference)
      discendOrder.push('-')
    } else {
      discendOrder.push(Math.abs(difference))
      ascendOrder.push('-')
    }
    const baseDataObj = {
      name: `[${getAggregatorLocale(m.agg)}] ${decodeMetricName(m.name)}`,
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: baseData,
      itemStyle: {
        normal: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
          // opacity: interactIndex === undefined ? 1 : 0.25
        },
        emphasis: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
        }
      }
    }

    const ascendOrderObj = {
      name: '升',
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: ascendOrder,
      itemStyle: {
        // normal: {
        //   opacity: interactIndex === undefined ? 1 : 0.25
        // }
      },
      ...labelOption
    }

    const discendOrderObj = {
      name: '降',
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: discendOrder,
      itemStyle: {
        // normal: {
        //   opacity: interactIndex === undefined ? 1 : 0.25
        // }
      },
      ...labelOption
    }
    series.push(baseDataObj)
    series.push(ascendOrderObj)
    series.push(discendOrderObj)
  })

  const seriesNames = series.map((s) => s.name)

  const xAxisSplitLineConfig = {
    showLine: showVerticalLine,
    lineColor: verticalLineColor,
    lineSize: verticalLineSize,
    lineStyle: verticalLineStyle
  }

  const yAxisSplitLineConfig = {
    showLine: showHorizontalLine,
    lineColor: horizontalLineColor,
    lineSize: horizontalLineSize,
    lineStyle: horizontalLineStyle
  }

  const tooltip: EChartOption.Tooltip = {
    trigger: 'axis',
    formatter (param: EChartOption.Tooltip.Format[]) {
      let color
      const text = param.map((pa, index) => {
        const data = !index ? parseFloat(sourceData[pa.dataIndex]) : pa.data
        if (typeof data === 'number') {
          color = pa.color
        }
        const formattedValue = getFormattedValue(data, metrics[0].format)
        return `${pa.seriesName}: ${formattedValue}`
      })
      const xAxis = param[0]['axisValue']
      if (xAxis === '累计') {
        return ''
      } else {
        text.unshift(xAxis)
        if (color) {
          text[0] = `<span class="widget-tooltip-circle" style="background: ${color}"></span>` + text[0]
        }
        return text.join('<br/>')
      }
    }
  }

  return {
    xAxis: getDimetionAxisOption(xAxis, xAxisSplitLineConfig, xAxisData),
    yAxis: getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `)),
    series,
    tooltip,
    grid: getGridPositions({ showLegend: false }, seriesNames, '', false, yAxis, xAxis, xAxisData)
  }
}
