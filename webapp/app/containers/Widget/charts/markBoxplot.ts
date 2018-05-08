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

import dataTool from 'echarts/extension-src/dataTool/prepareBoxplotData'

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    xAxis,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
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
    suffixYAxis,
    markMetrics
  } = chartParams
  let { metrics } = chartParams
  let metricOptions
  let xAxisOptions
  let yAxisOptions
  let legendOptions
  let toolboxOptions
  let gridOptions
  let dataZoomOptions
  let suffixYAxisOptions
  let data
  let xAxisData

  if (xAxis && metrics && metrics.length) {
    const data = dataSource.map((data) => data[xAxis])
    xAxisData = data.filter((x, index) => data.indexOf(x) === index)
    xAxisOptions = {
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
          show: true
        },
        axisLabel: {
          interval: xAxisInterval,
          rotate: xAxisRotate,
          formatter: '{value}'
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
  }
  data = []
  if (metrics && metrics.length) {
    metrics = [metrics]
    const step1 = xAxisData.map((xData) => dataSource.filter((data) => data[xAxis] === xData))
    const step2 = step1.map((step) => metrics.map((me) => step.map((st) => st[me])))
    const step3 = metrics.map((me, i) => {
      const arr = []
      step2.forEach((step, index) => {
        arr.push(step[i])
      })
      return arr
    })
    data = step3.map((step) => dataTool(step))

    metricOptions = {
      series: data.reduce((a, b, index) => a.concat({
        name: metrics[index],
        type: 'boxplot',
        data: b.boxData,
        tooltip: { formatter }
      }, {
        name: metrics[index],
        type: 'pictorialBar',
        symbolPosition: 'end',
        symbolSize: 8,
        barGap: '30%',
        data: b.outliers,
        tooltip: {
          formatter: (param) => ([
              `${param.name} `,
              `异常值: ${param.data[1]}`
            ].join('<br/>'))
        }
      }), [])
    }
  }
  if (markMetrics && markMetrics.length) {
    const step1 = dataSource.map((data) => ({[xAxis]: data[xAxis], [markMetrics]: data[markMetrics]}))
    const step2 = step1.reduce((next, value) => ({ ...next, [value[xAxis]]: value[markMetrics] }), {})
    const data = Object.values(step2)
    metricOptions.series.push({
      name: markMetrics,
      type: 'scatter',
      data,
      itemStyle: {
        normal: {
          color: 'rgb(251, 118, 123)'
        }
      }
    })
  }

  suffixYAxisOptions = suffixYAxis && suffixYAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYAxis}`
  }} : null

  yAxisOptions = {
    yAxis: {
      type: 'value',
      splitArea: {show: false},
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
        selected: metrics.reduce((obj, m) => ({ ...obj, [m]: false }), {})
      } : null

    legendOptions = {
      legend: {
        data: metrics,
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

  // console.log(metricOptions)
  return {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    ...metricOptions,
    ...xAxisOptions,
    ...yAxisOptions,
    ...legendOptions,
    ...gridOptions,
    ...toolboxOptions,
    ...dataZoomOptions
  }
}

function formatter (param) {
  const result = [
    `${param.name} `,
    `最大值: ${param.data[5]}`,
    `上四分位数: ${param.data[4]}`,
    `中位数: ${param.data[3]}`,
    `下四分位数: ${param.data[2]}`,
    `最小值: ${param.data[1]}`
  ].join('<br/>')
  return result
}
