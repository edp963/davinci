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
  IChartProps
} from '../../components/Chart'
import {
  decodeMetricName,
  getChartTooltipLabel,
  getSizeValue,
  getSizeRate
} from '../../components/util'
import {
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getSymbolSize
} from './util'
import { EChartOption } from 'echarts'
import { getFormattedValue } from '../../components/Config/Format'

export default function (chartProps: IChartProps) {
  const {
    width,
    height,
    data,
    cols,
    metrics,
    chartStyles,
    tip
  } = chartProps

  const {
    label,
    spec,
    toolbox
  } = chartStyles

  const {
    nodeWidth,
    nodeGap,
    orient,
    draggable
  } = spec

  const labelOption = {
    label: getLabelOption('sankey', label, metrics)
  }

  let dimensions = []
  if (cols.length) {
    dimensions = dimensions.concat(cols)
  }

  const metricsName = decodeMetricName(metrics[0].name)
  const agg = metrics[0].agg

  const nodesValues = []
  const links = []
  data.forEach((row) => {
    dimensions.forEach(({ name }, idx) => {
      if (!nodesValues.includes(row[name])) {
        nodesValues.push(row[name])
      }
      if (dimensions[idx - 1]) {
        const source = row[dimensions[idx - 1].name]
        const target = row[dimensions[idx].name]
        const value = +row[`${agg}(${metricsName})`]
        if (isNaN(value)) { return }
        const existedLink = links.length && links.find((lnk) => lnk.source === source && lnk.target === target)
        if (!existedLink) {
          links.push({
            source,
            target,
            value
          })
        } else {
          existedLink.value += value
        }
      }
    })
  })

  const tooltip: EChartOption.Tooltip = {
    trigger: 'item',
    triggerOn: 'mousemove',
    formatter (params: EChartOption.Tooltip.Format) {
      const { name, value, color } = params
      const tooltipLabels = []
      if (color) {
        tooltipLabels.push(`<span class="widget-tooltip-circle" style="background: ${color}"></span>`)
      }
      tooltipLabels.push(name)
      if (value) {
        tooltipLabels.push(': ')
        tooltipLabels.push(getFormattedValue(value as number, metrics[0].format))
      }
      return tooltipLabels.join('')
    }
  }

  return {
    tooltip,
    series: [{
      type: 'sankey',
      layout: 'none',
      ...labelOption,
      data: nodesValues.map((val) => ({
        name: val
      })),
      links,
      orient,
      draggable,
      nodeWidth,
      nodeGap,
      focusNodeAdjacency: true,
      itemStyle: {
        normal: {
          borderWidth: 1,
          borderColor: '#aaa'
        }
      },
      lineStyle: {
        normal: {
          color: 'source',
          curveness: 0.5
        }
      }
    }]
  }
}
