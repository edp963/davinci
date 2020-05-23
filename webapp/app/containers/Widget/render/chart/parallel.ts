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
  getSizeValue,
  getSizeRate,
  getTextWidth,
  metricAxisLabelFormatter
} from '../../components/util'
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
    legend,
    axis,
    areaSelect,
    spec,
    toolbox
  } = chartStyles

  const {
    legendPosition,
    fontSize
  } = legend

  const {
    inverse,
    showLine,
    lineStyle,
    lineSize,
    lineColor,
    showLabel,
    labelFontFamily,
    labelFontSize,
    labelColor,
    labelStyle,
    labelWeight,
    titleFontFamily,
    titleFontSize,
    titleFontStyle,
    titleColor,
    nameLocation,
    nameRotate,
    nameGap,
    showTitleAndUnit
  } = axis

  const {
    layout,
    smooth
  } = spec

  const parallelPosition: {
    left: number,
    top: number,
    right: number,
    bottom: number
  } = { // by default
    left: 80,
    top: 60,
    right: 80,
    bottom: 60
  }

  let series
  let parallel = {
    layout,
    ...parallelPosition,
    parallelAxisDefault: {
      nameLocation,
      nameGap,
      nameRotate,
      inverse,
      nameTextStyle: {
        color: titleColor,
        fontStyle: titleFontStyle,
        fontFamily: titleFontFamily,
        fontSize: titleFontSize
      },
      axisLabel: {
        show: showLabel,
        color: labelColor,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize
      },
      axisLine: {
        show: showLine,
        lineStyle: {
          color: lineColor,
          width: lineSize,
          type: lineStyle
        }
      },
      areaSelectStyle: areaSelect
    }
  }
  const legendData = []

  let axisDimensions = []
  if (cols.length) {
    axisDimensions = axisDimensions.concat(cols)
  }
  const dimensionsData = data.map((row) => (
    axisDimensions.map(({ name }) => row[name])
  ))

  if (color.items.length) {
    const groupKeys = color.items.map((c) => c.name)
    const grouped = data.reduce((obj, row) => {
      const grpText = groupKeys.map((key) => row[key]).join(String.fromCharCode(0))
      if (!obj[grpText]) {
        obj[grpText] = []
      }
      obj[grpText].push(row)
      return obj
    }, {})

    series = Object.entries(grouped).map(([grpText, rows]) => {
      legendData.push(grpText)
      const data = rows.map((r) => {
        const dimData = axisDimensions.map((name) => r[name])
        const metricData = metrics.map((m) => r[`${m.agg}(${decodeMetricName(m.name)})`])
        return dimData.concat(metricData)
      })
      return {
        name: grpText,
        type: 'parallel',
        smooth,
        lineStyle,
        data
      }
    })

    if (legend.showLegend) {
      const legendWidth = 56 + Math.max(...legendData.map((s) => getTextWidth(s, '', `${fontSize}px`)))
      switch (legendPosition) {
        case 'top':
          parallelPosition.top += 32
          break
        case 'bottom':
          parallelPosition.bottom += 32
          break
        case 'left':
          parallelPosition.left += legendWidth
          break
        case 'right':
          parallelPosition.right += legendWidth
      }
      parallel = {
        ...parallel,
        ...parallelPosition
      }
    }
  } else {
    series = [{
      name: '',
      type: 'parallel',
      smooth: smooth ? 1 : 0,
      lineStyle,
      data: data.map((row) => (
        [
          ...axisDimensions.map(({ name }) => row[name]),
          ...metrics.map((m) => row[`${m.agg}(${decodeMetricName(m.name)})`])
        ]
      ))
    }]
  }

  const parallelAxis = [
    ...axisDimensions.map(({ name }, idx) => ({
      dim: idx,
      name: showTitleAndUnit ? name : '',
      type: 'category',
      data: dimensionsData.map((d) => d[idx]).filter((d, dIdx, arr) => arr.indexOf(d) === dIdx)
    })),
    ...metrics.map((m, idx) => ({
      dim: axisDimensions.length + idx,
      name: showTitleAndUnit ? decodeMetricName(m.name) : '',
      axisLabel: {
        formatter: showLabel ? metricAxisLabelFormatter : ''
      }
    }))
  ]

  const legendOption = getLegendOption(legend, legendData)

  return {
    tooltip: {},
    legend: legendOption,
    parallel,
    parallelAxis,
    series
  }
}
