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
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

export default function (chartProps: IChartProps) {
  const {
    data,
    cols,
    metrics,
    chartStyles,
    color,
    tip
  } = chartProps

  const {
    spec,
    label,
    legend,
    xAxis,
    yAxis,
    splitLine
  } = chartStyles

  const {
    stack,
    barChart,
    percentage
  } = spec

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
    label: getLabelOption('bar', label)
  }

  let xAxisData = data.map((d) => d[cols[0]] || '')
  let grouped = {}
  let percentGrouped = {}
  if (color.items.length) {
    xAxisData = distinctXaxis(data, cols[0])
    grouped = makeGrouped(data, color.items.map((c) => c.name), cols[0], metrics, xAxisData)

    const configValue = color.items[0].config.values
    const configKeys = []
    Object.entries(configValue).forEach(([k, v]: [string, string]) => {
      configKeys.push(k)
    })
    percentGrouped = makeGrouped(data, cols, color.items[0].name, metrics, configKeys)
  }

  const series = []
  const seriesData = []
  metrics.forEach((m, i) => {
    const decodedMetricName = decodeMetricName(m.name)
    const localeMetricName = `[${getAggregatorLocale(m.agg)}] ${decodedMetricName}`
    const stackOption = (stack || percentage) ? { stack: 'stack' } : null
    if (color.items.length) {
      const sumArr = []
      Object.entries(percentGrouped).forEach(([k, v]: [string, any[]]) => {
        sumArr.push(getColorDataSum(v, metrics))
      })

      Object
        .entries(grouped)
        .forEach(([k, v]: [string, any[]]) => {
          const serieObj = {
            name: `${k} ${localeMetricName}`,
            type: 'bar',
            ...stackOption,
            sampling: 'average',
            data: v.map((g, index) => {
              // if (index === interactIndex) {
              //   return {
              //     value: g[m],
              //     itemStyle: {
              //       normal: {
              //         opacity: 1
              //       }
              //     }
              //   }
              // } else {
              if (percentage) {
                return g[`${m.agg}(${decodedMetricName})`] / sumArr[index] * 100
              } else {
                return g[`${m.agg}(${decodedMetricName})`]
              }
              // }
            }),
            itemStyle: {
              normal: {
                // opacity: interactIndex === undefined ? 1 : 0.25
                color: color.items[0].config.values[k]
              }
            },
            ...labelOption
          }
          series.push(serieObj)
          seriesData.push(grouped[k])
        })
    } else {
      const serieObj = {
        name: decodedMetricName,
        type: 'bar',
        ...stackOption,
        sampling: 'average',
        data: data.map((d, index) => {
          // if (index === interactIndex) {
          //   return {
          //     value: d[m],
          //     lineStyle: {
          //       normal: {
          //         opacity: 1
          //       }
          //     },
          //     itemStyle: {
          //       normal: {
          //         opacity: 1
          //       }
          //     }
          //   }
          // } else {
            if (percentage) {
              return d[`${m.agg}(${decodedMetricName})`] / getDataSum(data, metrics)[index] * 100
            } else {
              return d[`${m.agg}(${decodedMetricName})`]
            }
          // }
        }),
        // lineStyle: {
        //   normal: {
        //     opacity: interactIndex === undefined ? 1 : 0.25
        //   }
        // },
        itemStyle: {
          normal: {
            // opacity: interactIndex === undefined ? 1 : 0.25
            // color: color.value[m.name] || defaultThemeColors[i]
          }
        },
        ...labelOption
      }
      series.push(serieObj)
      seriesData.push([...data])
    }
  })

  const seriesNames = series.map((s) => s.name)

  let legendOption
  if (color.items.length || metrics.length > 1) {
    legendOption = {
      legend: getLegendOption(legend, seriesNames)
    }
  }

  // dataZoomOptions = dataZoomThreshold > 0 && dataZoomThreshold < dataSource.length && {
  //   dataZoom: [{
  //     type: 'inside',
  //     start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
  //     end: 100
  //   }, {
  //     start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
  //     end: 100,
  //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
  //     handleSize: '80%',
  //     handleStyle: {
  //       color: '#fff',
  //       shadowBlur: 3,
  //       shadowColor: 'rgba(0, 0, 0, 0.6)',
  //       shadowOffsetX: 2,
  //       shadowOffsetY: 2
  //     }
  //   }]
  // }

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

  const dimetionAxisOption = getDimetionAxisOption(xAxis, xAxisSplitLineConfig, xAxisData)
  const metricAxisOption = getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `), 'x', percentage)
  return {
    xAxis: barChart ? metricAxisOption : dimetionAxisOption,
    yAxis: barChart ? dimetionAxisOption : metricAxisOption,
    series,
    tooltip: {
      formatter: getChartTooltipLabel('bar', seriesData, { cols, metrics, color, tip })
    },
    ...legendOption,
    grid: getGridPositions(legend, seriesNames, barChart, yAxis, xAxis, xAxisData)
  }
}

export function getDataSum (data, metrics) {
  const dataSum = data.map((d, index) => {
    const metricArr = []
    let maSum = 0
    metrics.forEach((m, i) => {
      const decodedMetricName = decodeMetricName(m.name)
      const metricName = d[`${m.agg}(${decodedMetricName})`]
      metricArr.push(metricName)
      if (metricArr.length === metrics.length) {
        metricArr.forEach((mr) => {
          maSum += mr
        })
      }
    })
    return maSum
  })
  return dataSum
}

export function getColorDataSum (data, metrics) {
  let maSum = 0
  const dataSum = data.map((d, index) => {
    let metricArr = 0
    metrics.forEach((m, i) => {
      const decodedMetricName = decodeMetricName(m.name)
      const metricName = d[`${m.agg}(${decodedMetricName})`]
      metricArr += metricName
    })
    return metricArr
  })
  dataSum.forEach((mr) => {
    maSum += mr
  })
  return maSum
}
