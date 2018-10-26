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
  getGridPositions,
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
    spec,
    toolbox
  } = chartStyles

  const {
    legendPosition,
    fontSize
  } = legend

  const {
    nodeWidth,
    nodeGap,
    orient,
    draggable
  } = spec

  const labelOption = {
    label: getLabelOption('sankey', label)
  }

  let dimensions = []
  if (cols.length) {
    dimensions = dimensions.concat(cols)
  }
  if (color.items.length) {
    dimensions = dimensions.concat(color.items.map((c) => c.name))
  }

  const metricsName = decodeMetricName(metrics[0].name)
  const agg = metrics[0].agg

  const nodesValues = []
  const links = []
  data.forEach((row) => {
    dimensions.forEach((dim, idx) => {
      if (nodesValues.indexOf(row[dim]) < 0) {
        nodesValues.push(row[dim])
      }
      if (dimensions[idx - 1]) {
        links.push({
          source: row[dimensions[idx - 1]],
          target: row[dimensions[idx]],
          value: row[`${agg}(${metricsName})`]
        })
      }
    })
  })

  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
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
