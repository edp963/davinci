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
 * Line chart options generator
 */
export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    xAxis,
    metrics,
    lower,
    upper,
    label,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    smooth,
    step,
    symbol,
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

  let metricOptions
  let xAxisOptions
  let smoothOption
  let stepOption
  let symbolOption
  let toolboxOptions
  let gridOptions
  let labelOption
  let dataZoomOptions
  let suffixYAxisOptions

  const base = -dataSource.reduce((min, val) => Math.floor(Math.min(min, +val[lower])), Infinity)

  suffixYAxisOptions = {
    axisLabel: {
      formatter: (val) => `${val - base} ${suffixYAxis || ''}`
    }
  }
  // symbol
  symbolOption = symbol && symbol.length ? { symbol: 'emptyCircle' } : { symbol: 'none' }
  // smooth
  smoothOption = smooth && smooth.length ? {
    smooth: true
  } : null
  // step
  stepOption = step && step.length ? {
    step: true
  } : null
  // label
  labelOption = label && label.length ? {
    label: {
      normal: {
        show: true,
        position: 'top'
      }
    }
  } : null

  // series 数据项； series = metrics * confidenceBand
  const metricArr = []

  if (metrics) {
    const serieObj = {
      name: metrics,
      type: 'line',
      sampling: 'average',
      symbol: symbolOption,
      data: dataSource.map((d, index) => {
        if (index === interactIndex) {
          return {
            value: +d[metrics] + base,
            lineStyle: {
              normal: {
                opacity: 1
              }
            },
            itemStyle: {
              normal: {
                opacity: 1
              }
            }
          }
        } else {
          return +d[metrics] + base
        }
      }),
      lineStyle: {
        normal: {
          opacity: interactIndex === undefined ? 1 : 0.25
        }
      },
      itemStyle: {
        normal: {
          opacity: interactIndex === undefined ? 1 : 0.25
        }
      },
      ...symbolOption,
      ...smoothOption,
      ...stepOption,
      ...labelOption
    }
    metricArr.push(serieObj)
  }

  const baseConfidenceBand = {
    type: 'line',
    lineStyle: {
      normal: {
        opacity: 0
      }
    },
    stack: 'confidence-band',
    symbol: 'none'
  }

  const seriesConfidenceBand = [{
    name: 'L',
    data: dataSource.map((item) => +item[lower] + base)
  }, {
    name: 'U',
    data: dataSource.map((item) => +item[upper] - item[lower]),
    areaStyle: {
      normal: {
        color: '#ccc'
      }
    }
  }]

  seriesConfidenceBand.forEach((item) => {
    Object.assign(item, baseConfidenceBand)
  })
  metricArr.push(...seriesConfidenceBand)

  metricOptions = {
    series: metricArr
  }

  // x轴数据
  xAxisOptions = xAxis && {
    xAxis: {
      data: dataSource.map((d) => d[xAxis]),
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

  // toolbox
  toolboxOptions = toolbox && toolbox.length ? {
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
      right,
      bottom
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
      axisLabel: {
        formatter: (val) => +val - base
      },
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
      trigger: 'axis',
      formatter: (params) => `${params[0].name}<br />${params[0].value}`
    },
    ...metricOptions,
    ...xAxisOptions,
    ...toolboxOptions,
    ...gridOptions,
    ...dataZoomOptions
  }
}
