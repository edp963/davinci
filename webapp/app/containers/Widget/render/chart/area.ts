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

/*
 * Area chart options generator
 */
export default function (dataSource, flatInfo, chartParams) {
  const hasGroups = flatInfo.groups

  const {
    xAxis,
    metrics,
    groups,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    smooth,
    step,
    stack,
    symbol,
    hasLegend,
    legendSelected,
    legendPosition,
    toolbox,
    splitLineX,
    splitLineY,
    splitLineStyle,
    splitLineWidth,
    top,
    bottom,
    left,
    right,
    suffixYAxis
  } = chartParams

  let grouped
  let metricOptions
  let xAxisOptions
  let smoothOption
  let stepOption
  let stackOption
  let symbolOption
  let legendOptions
  let toolboxOptions
  let gridOptions
  let dataZoomOptions
  let suffixYAxisOptions

  suffixYAxisOptions = suffixYAxis && suffixYAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYAxis}`
  }} : null

  // symbol
  symbolOption = symbol && symbol.length
    ? { symbol: 'emptyCircle' }
    : { symbol: 'none' }
  // smooth
  smoothOption = smooth && smooth.length ? { smooth: true } : null
  // step
  stepOption = step && step.length ? { step: true } : null
  // stack
  stackOption = stack && stack.length ? { stack: 'stack' } : null

  // 数据分组
  let xAxisDistincted = []

  if (hasGroups && groups && groups.length) {
    xAxisDistincted = getGroupedXaxis(dataSource, xAxis)
    grouped = makeGrouped(dataSource, [].concat(groups).filter((i) => !!i), xAxis, metrics, xAxisDistincted)
  }

  // series 数据项； series = metrics * groups
  const metricArr = []

  if (metrics) {
    metrics.forEach((m) => {
      if (hasGroups && groups && groups.length) {
        Object
          .keys(grouped)
          .forEach((k) => {
            const serieObj = {
              name: `${k} ${m}`,
              type: 'line',
              areaStyle: {normal: {}},
              sampling: 'average',
              data: grouped[k].map((g) => g[m]),
              ...symbolOption,
              ...smoothOption,
              ...stepOption,
              ...stackOption
            }
            metricArr.push(serieObj)
          })
      } else {
        const serieObj = {
          name: m,
          type: 'line',
          areaStyle: {normal: {}},
          sampling: 'average',
          symbol: symbolOption,
          data: dataSource.map((d) => d[m]),
          ...symbolOption,
          ...smoothOption,
          ...stepOption
        }
        metricArr.push(serieObj)
      }
    })
    metricOptions = {
      series: metricArr
    }
  }

  // x轴数据
  xAxisOptions = xAxis && {
    xAxis: {
      data: hasGroups && groups && groups.length
        ? xAxisDistincted
        : dataSource.map((d) => d[xAxis]),
      axisLabel: {
        interval: xAxisInterval,
        rotate: xAxisRotate
      },
      splitLine: {
        show: splitLineX && splitLineX.length,
        lineStyle: {
          width: splitLineWidth,
          type: splitLineStyle
        }
      }
    }
  }

  // legend
  let adjustedBottom = 0
  let adjustedRight = 0

  if (hasLegend && hasLegend.length) {
    let orient
    let positions

    switch (legendPosition) {
      case 'right':
        orient = { orient: 'vertical' }
        positions = { right: 8, top: 40, bottom: 16 }
        adjustedRight = 108
        break
      case 'bottom':
        orient = { orient: 'horizontal' }
        positions = { bottom: 16, left: 8, right: 8 }
        adjustedBottom = 72
        break
      default:
        orient = { orient: 'horizontal' }
        positions = { top: 3, left: 8, right: 120 }
        break
    }

    const selected = legendSelected === 'unselectAll'
      ? {
        selected: metricArr.reduce((obj, m) => ({...obj, [m.name]: false }), {})
      } : null

    legendOptions = {
      legend: {
        data: metricArr.map((m) => m.name),
        type: 'scroll',
        ...orient,
        ...positions,
        ...selected
      }
    }
  }

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {
            pixelRatio: 2
          }
        },
        right: 8
      }
    } : null

  // grid
  gridOptions = {
    grid: {
      top,
      left,
      right: Math.max(right, adjustedRight),
      bottom: Math.max(bottom, adjustedBottom)
    }
  }

  dataZoomOptions = dataZoomThreshold > 0 && dataZoomThreshold < dataSource.length && {
    dataZoom: [{
      type: 'inside',
      start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
      end: 100
    }, {
      start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
      end: 100,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }]
  }

  return {
    yAxis: {
      type: 'value',
      splitLine: {
        show: splitLineY && splitLineY.length,
        lineStyle: {
          width: splitLineWidth,
          type: splitLineStyle
        }
      },
      ...suffixYAxisOptions
    },
    tooltip: {
      trigger: 'axis'
    },
    ...metricOptions,
    ...xAxisOptions,
    ...legendOptions,
    ...toolboxOptions,
    ...gridOptions,
    ...dataZoomOptions
  }
}

export function makeGrouped (dataSource, groupColumns, xAxis, metrics, xAxisDistincted) {
  const grouped = {}

  if (xAxis && metrics) {
    dataSource.forEach((ds) => {
      const accColumn = groupColumns
        .reduce((arr, col) => arr.concat(ds[col]), [])
        .join(' ')
      if (!grouped[accColumn]) {
        grouped[accColumn] = {}
      }
      grouped[accColumn][ds[xAxis]] = ds
    })

    Object.keys(grouped).map((accColumn) => {
      const currentGroupValues = grouped[accColumn]

      grouped[accColumn] = xAxisDistincted.map((xd) => {
        if (currentGroupValues[xd]) {
          return currentGroupValues[xd]
        } else {
          return metrics.reduce((obj, m) => ({ ...obj, [m]: 0 }), {})
        }
      })
    })
  }

  return grouped
}

export function getGroupedXaxis (dataSource, xAxis) {
  return xAxis
    ? Object.keys(dataSource.reduce((distinct, ds) => {
      if (!distinct[ds[xAxis]]) {
        distinct[ds[xAxis]] = true
      }
      return distinct
    }, {}))
    : []
}
