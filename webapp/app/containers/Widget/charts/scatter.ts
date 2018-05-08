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
 * Scatter chart options generator
 */

export default function (dataSource, flatInfo, chartParams) {
  const hasGroups = flatInfo.groups

  const {
    groups,
    xAxis,
    yAxis,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    size,
    label,
    showLabel,
    value,
    shadow,
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
  let yAxisOptions
  let sizeOptions
  let labelOptions
  let shadowOptions
  let legendOptions
  let toolboxOptions
  let gridOptions
  let dataZoomOptions
  let suffixYAxisOptions

  // series 数据项
  const metricArr = []

  // 数据分组
  if (hasGroups && groups) {
    grouped = makeGrouped(dataSource, [].concat(groups).filter((i) => !!i))
  }

  sizeOptions = size && {
    symbolSize: (data) => {
      return data[3] / size
    }
  }
  shadowOptions = shadow && shadow.length && {
    itemStyle: {
      normal: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffsetY: 5
      }
    }
  }

  if (label || showLabel && showLabel.length) {
    let normal
    let emphasis

    if (label) {
      emphasis = {
        emphasis: {
          show: true,
          opacity: 0.8,
          position: 'top',
          formatter: (param) => {
            return param.data[2]
          }
        }
      }
    }

    if (showLabel && showLabel.length) {
      normal = {
        normal: {
          show: true,
          opacity: 0.8,
          position: 'top',
          formatter: (param) => {
            return param.data[2]
          }
        }
      }
    }

    labelOptions = {
      label: {
        ...normal,
        ...emphasis
      }
    }
  }

  if (hasGroups && groups) {
    Object
      .keys(grouped)
      .forEach((k) => {
        const serieObj = {
          name: k,
          type: 'scatter',
          data: grouped[k].map((g) => [g[xAxis], g[yAxis], g[label], g[value]]),
          ...sizeOptions,
          ...labelOptions,
          ...shadowOptions
        }
        metricArr.push(serieObj)
      })
  } else {
    const serieObj = {
      name: '数据',
      type: 'scatter',
      data: dataSource.map((g) => [g[xAxis], g[yAxis], g[label], g[value]]),
      ...sizeOptions,
      ...labelOptions,
      ...shadowOptions
    }
    metricArr.push(serieObj)
  }

  metricOptions = {
    series: metricArr
  }

  // x轴数据
  xAxisOptions = {
    xAxis: {
      type: 'value',
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
  suffixYAxisOptions = suffixYAxis && suffixYAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYAxis}`
  }} : null
  yAxisOptions = {
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: {
        show: splitLineY && splitLineY.length,
        lineStyle: {
          width: splitLineWidth,
          type: splitLineStyle
        }
      },
      ...suffixYAxisOptions
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
        selected: metricArr.reduce((obj, m) => ({ ...obj, [m.name]: false }), {})
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
    tooltip: {
      formatter: (node) => {
        const nodeValues = node.data
        return `<span>
          ${nodeValues[2] || ''} <br/>
          ${value}: ${nodeValues[3] || 0} <br/>
          ${xAxis}: ${nodeValues[0] || 0} <br/>
          ${yAxis}: ${nodeValues[1] || 0} <br/>
        </span>`
      }
    },
    ...metricOptions,
    ...xAxisOptions,
    ...yAxisOptions,
    ...legendOptions,
    ...toolboxOptions,
    ...gridOptions,
    ...dataZoomOptions
  }
}

export function makeGrouped (dataSource, groupColumns) {
  return dataSource.reduce((acc, val) => {
    const accColumn = groupColumns
      .reduce((arr, col) => arr.concat(val[col]), [])
      .join(' ')
    if (!acc[accColumn]) {
      acc[accColumn] = []
    }
    acc[accColumn].push(val)
    return acc
  }, {})
}
