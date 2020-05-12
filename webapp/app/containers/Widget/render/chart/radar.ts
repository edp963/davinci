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
import { EChartOption } from 'echarts'
import {
  decodeMetricName,
  getSizeValue,
  getSizeRate
} from '../../components/util'
import { getFieldAlias } from '../../components/Config/Field'
import { getFormattedValue } from '../../components/Config/Format'
import {
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getSymbolSize
} from './util'

export default function (chartProps: IChartProps) {
  const {
    width,
    height,
    data,
    cols,
    metrics,
    chartStyles,
    color,
    tip
  } = chartProps

  const { label, legend, radar, toolbox } = chartStyles

  const { legendPosition, fontSize } = legend

  const labelOption = {
    label: getLabelOption('radar', label, metrics)
  }

  let dimensions = []
  if (cols.length) {
    dimensions = dimensions.concat(cols)
  }

  const metricsNames = metrics.map((m) => decodeMetricName(m.name))

  let seriesData
  let indicator
  let indicatorMax = -Infinity
  let legendData

  if (!dimensions.length) {
    if (color.items.length) {
      dimensions = dimensions.concat(color.items.map((c) => c.name))
    }
    const metricsData = !data.length
      ? []
      : metrics.map((m) => data[0][`${m.agg}(${decodeMetricName(m.name)})`])
    seriesData = !data.length ? [] : [{ value: metricsData }]
    indicatorMax = Math.max(...metricsData)
    indicatorMax = indicatorMax + Math.round(indicatorMax * 0.1)
    indicator = metrics.map((m) => ({
      name: decodeMetricName(m.name),
      max: indicatorMax
    }))
  } else {
    legendData = metricsNames
    const dimension = dimensions[0]
    const indicatorData = {}
    const dimensionData = metricsNames.reduce(
      (acc, name) => ({
        ...acc,
        [name]: {}
      }),
      {}
    )
    data.forEach((row) => {
      if (!indicatorData[row[dimension.name]]) {
        indicatorData[row[dimension.name]] = -Infinity
      }

      metrics.forEach((m) => {
        const name = decodeMetricName(m.name)
        const cellVal = row[`${m.agg}(${name})`]
        indicatorMax = Math.max(indicatorMax, cellVal)
        if (!dimensionData[name][row[dimension.name]]) {
          dimensionData[name][row[dimension.name]] = 0
        }
        dimensionData[name][row[dimension.name]] += cellVal
      })
    })
    indicator = Object.keys(indicatorData).map((name: string) => ({
      name,
      max: indicatorMax + Math.round(indicatorMax * 0.1)
    }))
    seriesData =
      data.length > 0
        ? Object.entries(dimensionData).map(([name, value]) => ({
            name,
            value: Object.values(value)
          }))
        : []
  }

  const tooltip: EChartOption.Tooltip = {
    formatter(params: EChartOption.Tooltip.Format) {
      const { dataIndex, data, color } = params

      let tooltipLabels = []
      if (dimensions.length) {
        const metric = metrics[dataIndex]
        tooltipLabels.push(
          getFieldAlias(metric.field, {}) || decodeMetricName(metric.name)
        )
        tooltipLabels = tooltipLabels.concat(
          indicator.map(
            ({ name }, idx) =>
              `${name}: ${getFormattedValue(data.value[idx], metric.format)}`
          )
        )
        if (color) {
          tooltipLabels[0] =
            `<span class="widget-tooltip-circle" style="background: ${color}"></span>` +
            tooltipLabels[0]
        }
      } else {
        tooltipLabels = tooltipLabels.concat(
          indicator.map(
            ({ name }, idx) =>
              `${name}: ${getFormattedValue(
                data.value[idx],
                metrics[idx].format
              )}`
          )
        )
      }

      return tooltipLabels.join('<br/>')
    }
  }

  return {
    tooltip,
    legend: legendData && getLegendOption(legend, legendData),
    radar: {
      // type: 'log',
      indicator,
      ...radar
    },
    series: [
      {
        name: '',
        type: 'radar',
        data: seriesData,
        ...labelOption
      }
    ]
  }
}
