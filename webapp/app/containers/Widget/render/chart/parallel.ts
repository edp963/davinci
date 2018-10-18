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

export default function(chartProps: IChartProps) {
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
    shape
  } = spec

  const labelOption = {
    label: getLabelOption('parallel', label)
  }

  let axisDimensions = []
  if (cols.length) {
    axisDimensions = axisDimensions.concat(cols)
  }
  if (color.items.length) {
    axisDimensions = axisDimensions.concat(color.items.map((c) => c.name))
  }

  const dimensionsData = data.map((row) => (
    axisDimensions.map((name) => row[name])
  ))
  const seriesData = data.map((row, idx) =>
    (dimensionsData[idx].concat(metrics.map((m) => row[`${m.agg}(${decodeMetricName(m.name)})`])))
  )

  const parallelAxis = [
    ...axisDimensions.map((name, idx) => ({
      dim: idx,
      name,
      type: 'category',
      data: dimensionsData.filter((d, idx) => dimensionsData.indexOf(d) === idx)
    })),
    ...metrics.map((m, idx) => ({
      dim: axisDimensions.length + idx,
      name: decodeMetricName(m.name)
    }))
  ]

  return {
    parallelAxis,
    series: [{
      type: 'parallel',
      data: seriesData,
      lineStyle: {
        width: 2
      }
    }]
  }
}
