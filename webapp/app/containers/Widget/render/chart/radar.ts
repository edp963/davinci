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
  getChartTooltipLabel,
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

  const {
    label,
    legend,
    radar,
    toolbox
  } = chartStyles

  const {
    legendPosition,
    fontSize
  } = legend

  const labelOption = {
    label: getLabelOption('radar', label, metrics)
  }

  let dimensions = []
  if (cols.length) {
    dimensions = dimensions.concat(cols)
  }
  if (color.items.length) {
    dimensions = dimensions.concat(color.items.map((c) => c.name))
  }
  const dimension = dimensions[0]

  const metricsNames = metrics.map((m) => decodeMetricName(m.name))
  const legendData = metricsNames
  const indicatorData = {}
  let indicatorMax = -Infinity
  const dimensionData = metricsNames.reduce((acc, name) => ({
    ...acc,
    [name]: {}
  }), {})
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
  const indicator = Object.keys(indicatorData).map((name: string) => ({
    name,
    max: indicatorMax + Math.round(indicatorMax * 0.1)
  }))
  const seriesData = data.length > 0 ? Object.entries(dimensionData).map(([name, value]) => ({
    name,
    value: Object.values(value)
  })) : []

  const tooltip: EChartOption.Tooltip = {
    formatter (params: EChartOption.Tooltip.Format) {
      const { dataIndex, data, color } = params
      const metric = metrics[dataIndex]
      let tooltipLabels = []
      tooltipLabels.push(getFieldAlias(metric.field, {}) || decodeMetricName(metric.name))
      tooltipLabels = tooltipLabels.concat(indicator.map(({ name }, idx) => (`${name}: ${getFormattedValue(data.value[idx], metric.format)}`)))
      if (color) {
        tooltipLabels[0] = `<span class="widget-tooltip-circle" style="background: ${color}"></span>` + tooltipLabels[0]
      }
      return tooltipLabels.join('<br/>')
    }
  }

  return {
    tooltip,
    legend: getLegendOption(legend, legendData),
    radar: {
      // type: 'log',
      indicator,
      ...radar
    },
    series: [{
      name: '',
      type: 'radar',
      data: seriesData,
      ...labelOption
    }]
  }
}
