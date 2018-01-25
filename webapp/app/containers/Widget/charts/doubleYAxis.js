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
 * doubleYAxis chart options generator
 */

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    xAxis,
    vertical,
    stack,
    label,
    smooth,
    step,
    symbol,
    xAxisInterval,
    xAxisRotate,
    yAxisSplitNumber,
    dataZoomThreshold,
    hasLegend,
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
    leftMetrics,
    rightMetrics,
    yAxisLeft,
    yAxisRight,
    suffixYLeftAxis,
    suffixYRightAxis
  } = chartParams

  let metricOptions,
    xAxisOptions,
    yAxisOptions,
    stackOption,
    labelOption,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions,
    suffixYLeftAxisOptions,
    suffixYRightAxisOptions,
    splitLineYOption,
    smoothOption,
    stepOption,
    symbolOption

  let seriesArrLeft = []
  let seriesArrRight = []
  let yAxis = []

  // symbol
  symbolOption = symbol && symbol.length
    ? { symbol: 'emptyCircle' }
    : { symbol: 'none' }
  // smooth
  smoothOption = smooth && smooth.length ? { smooth: true } : null
  // step
  stepOption = step && step.length ? { step: true } : null
  // stack
  stackOption = (axis) => {
    if (stack && stack.length) {
      return { stack: axis }
    } else {
      return null
    }
  }

  suffixYLeftAxisOptions = suffixYLeftAxis && suffixYLeftAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYLeftAxis}`
  }} : null
  suffixYRightAxisOptions = suffixYRightAxis && suffixYRightAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYRightAxis}`
  }} : null
  splitLineYOption = {
    splitLine: {
      show: splitLineY && splitLineY.length,
      lineStyle: {
        width: splitLineWidth,
        type: splitLineStyle
      }
    }
  }
  if (vertical && vertical.length) {
    labelOption = {
      label: {
        normal: {
          show: true,
          position: 'insideLeft'
        }
      }
    }
  } else {
    labelOption = label && label.length
      ? {
        label: {
          normal: {
            show: true,
            position: stack && stack.length ? 'insideTop' : 'top'
          }
        }
      } : null
  }

  if (yAxisLeft && yAxisRight) {
    const leftMax = leftMetrics.reduce((num, m) => num + Math.max(...dataSource.map(d => d[m])), 0)
    const rightMax = rightMetrics.reduce((num, m) => num + Math.max(...dataSource.map(d => d[m])), 0)
    const leftInterval = getYaxisInterval(leftMax, (yAxisSplitNumber - 1))
    const rightInterval = getYaxisInterval(rightMax, (yAxisSplitNumber - 1))

    yAxis[0] = Object.assign({
      type: 'value',
      key: 'yAxisIndex0',
      min: 0,
      max: leftInterval * (yAxisSplitNumber - 1),
      interval: leftInterval
    }, suffixYLeftAxisOptions, splitLineYOption)
    yAxis[1] = Object.assign({
      type: 'value',
      key: 'yAxisIndex1',
      min: 0,
      max: rightInterval * (yAxisSplitNumber - 1),
      interval: rightInterval
    }, suffixYRightAxisOptions, splitLineYOption)
    yAxisOptions = {
      yAxis
    }
    if (leftMetrics && leftMetrics.length > 0) {
      seriesArrLeft = leftMetrics.map(left => ({
        name: left,
        type: yAxisLeft,
        data: dataSource.map(d => d[left]),
        ...labelOption,
        ...stackOption('left')
      }))
    }
    if (rightMetrics && rightMetrics.length > 0) {
      seriesArrRight = rightMetrics.map(right => ({
        name: right,
        type: yAxisRight,
        yAxisIndex: 1,
        data: dataSource.map(d => d[right]),
        ...labelOption,
        ...stackOption('right')
      }))
    }

    let metricArray = [...seriesArrLeft, ...seriesArrRight]

    metricOptions = {
      series: metricArray.map(series => {
        if (series.type === 'line') {
          return Object.assign({},
            series,
            symbolOption,
            smoothOption,
            stepOption)
        } else {
          return Object.assign({},
            series)
        }
      })
    }
  }

  if (xAxis) {
    xAxisOptions = {
      xAxis: [{
        data: dataSource.map(d => d[xAxis]),
        type: 'category',
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
      }]
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
        adjustedRight = 180
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

    legendOptions = {
      legend: Object.assign({
        data: metricOptions.series.map(m => m.name),
        type: 'scroll'
      }, orient, positions)
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
      top: top,
      left: left,
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
  let doubleYOptions = Object.assign({
    tooltip: {
      trigger: 'axis'
    }
  },
    metricOptions,
    xAxisOptions,
    yAxisOptions,
    legendOptions,
    gridOptions,
    toolboxOptions,
    dataZoomOptions
  )
  return doubleYOptions
}

function getYaxisInterval (max, splitNumber) {
  const roughInterval = parseInt(max / splitNumber)
  const divisor = Math.pow(10, (`${roughInterval}`.length - 1))
  return (parseInt(roughInterval / divisor) + 1) * divisor
}
