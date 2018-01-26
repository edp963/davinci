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
 * Waterfall chart options generator
 */

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    xAxis,
    vertical,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    hasLegend,
    legendPosition,
    toolbox,
    top,
    label,
    bottom,
    left,
    right,
    suffixYAxis
  } = chartParams
  let {metrics} = chartParams
  let metricOptions,
    xAxisOptions,
    yAxisOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions,
    suffixYAxisOptions

  // series 数据项
  let metricArr = []
  let sourceData = []
  metrics = [metrics]
  if (metrics && metrics.length) {
    let dataOption = metrics.map(me => dataSource.map(data => data[me]))
    let wrapper = []
    dataOption.forEach((data, index) => {
      data.forEach((da, i) => {
        if (wrapper[i]) {
          wrapper[i].push(da)
        } else {
          wrapper[i] = [da]
        }
      })
    })
    wrapper = wrapper.map((wrap, index) => wrap.reduce((sum, val) => sum + Number(val), 0))
    metrics.forEach(m => {
      sourceData = dataSource.map((d, index) => d[m]
        // if (index === interactIndex) {
        //   return {
        //     value: d[m],
        //     itemStyle: {
        //       normal: {
        //         opacity: 1
        //       }
        //     }
        //   }
        // } else {
        //   return d[m]
        // }
      )
      let baseData = []
      let ascendOrder = []
      let discendOrder = []
      sourceData.map((a, index) => {
        a = parseFloat(a)
        if (index > 0) {
          let result = a - parseFloat(sourceData[index - 1])
          if (result >= 0) {
            ascendOrder.push(result)
            discendOrder.push('-')
            baseData.push(parseFloat(sourceData[index - 1]))
          } else {
            ascendOrder.push('-')
            discendOrder.push(Math.abs(result))
            baseData.push(parseFloat(sourceData[index - 1]) - Math.abs(result))
          }
          return result
        } else {
          ascendOrder.push(a)
          discendOrder.push('-')
          baseData.push(0)
          return a
        }
      })
      let baseDataObj = Object.assign(
        {
          name: m,
          type: 'bar',
          sampling: 'average',
          data: baseData,
          itemStyle: {
            normal: {
              barBorderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)',
              opacity: interactIndex === undefined ? 1 : 0.25
            },
            emphasis: {
              barBorderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)'
            }
          }
        },
        {stack: 'stack'}
      )
      let ascendOrderObj = Object.assign(
        {
          name: '升',
          type: 'bar',
          sampling: 'average',
          data: ascendOrder,
          itemStyle: {
            normal: {
              opacity: interactIndex === undefined ? 1 : 0.25
            }
          }
        },
        {stack: 'stack'},
        {label: {
          normal: {
            show: !!(label && label.length),
            position: 'top'
          }
        }}
      )
      let discendOrderObj = Object.assign(
        {
          name: '降',
          type: 'bar',
          sampling: 'average',
          data: discendOrder,
          itemStyle: {
            normal: {
              opacity: interactIndex === undefined ? 1 : 0.25
            }
          }
        },
        {stack: 'stack'},
        {label: {
          normal: {
            show: !!(label && label.length),
            position: 'bottom'
          }
        }}
      )
      metricArr.push(baseDataObj)
      metricArr.push(ascendOrderObj)
      metricArr.push(discendOrderObj)
    })
    metricOptions = {
      series: metricArr
    }
  }

  // x轴与y轴数据
  suffixYAxisOptions = suffixYAxis && suffixYAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYAxis}`
  }} : null
  if (vertical && vertical.length) {
    if (xAxis) {
      xAxisOptions = {
        yAxis: {
          data: dataSource.map(d => d[xAxis]),
          axisLabel: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        }
      }
    }

    yAxisOptions = {
      xAxis: {
        type: 'value',
        position: 'top',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        axisLabel: {
          interval: xAxisInterval,
          rotate: xAxisRotate
        }
      }
    }
  } else {
    if (xAxis) {
      xAxisOptions = {
        xAxis: {
          data: dataSource.map(d => d[xAxis]),
          axisLabel: {
            interval: xAxisInterval,
            rotate: xAxisRotate
          }
        }
      }
    }

    yAxisOptions = {
      yAxis: {
        ...{type: 'value'},
        ...suffixYAxisOptions
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

    legendOptions = {
      legend: Object.assign({
        data: metricArr.map(m => m.name),
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
  return Object.assign({
    tooltip: {
      trigger: 'axis',
      formatter: function (param) {
        let text = param.map((pa, index) => {
          let data
          if (index === 0) {
            data = parseFloat(sourceData[pa.dataIndex])
          } else {
            data = pa.data
          }
          return `${pa.seriesName}: ${data}`
        })
        let xAxis = param[0]['axisValue']
        text.unshift(xAxis)
        return text.join('<br/>')
      }
    }
  },
    metricOptions,
    xAxisOptions,
    yAxisOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions
  )
}
