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

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    indicator,
    metrics,
    metricName,
    hasLegend,
    legendSelected,
    legendPosition,
    toolbox,
    top,
    bottom,
    left,
    right
  } = chartParams

  let metricOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    data,
    radarOptions,
    metricsArr

  if (indicator && indicator.length) {
    if (metrics && metrics.length) {
      let indicatorData = indicator.map(indi => dataSource.map(data => data[indi]))
      metricsArr = dataSource.map(data => data[metrics])
      data = metricsArr.map((ti, index) => ({
        name: ti,
        value: indicatorData.map(indica => indica[index])
      }))
      radarOptions = {
        radar: {
          name: {
            textStyle: {
              color: '#fff',
              backgroundColor: '#999',
              borderRadius: 3,
              padding: [3, 5]
            }
          },
          indicator: indicator.map(name => {
            let max = Math.max.apply(null, dataSource.map(data => data[name]).map(arr => parseFloat(arr)))
            return {
              name: name,
              max: max + parseInt(max * 0.1)
            }
          })
        }
      }
    }
  }

  metricOptions = {
    series: [{
      name: metricName && metricName.length ? metricName : '',
      type: 'radar',
      data: data
    }]
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
        selected: metricsArr.reduce((obj, m) => Object.assign(obj, { [m]: false }), {})
      } : null

    legendOptions = {
      legend: Object.assign({
        data: metricsArr,
        type: 'scroll'
      }, orient, positions, selected)
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

  console.log(Object.assign({
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    }
  },
    metricOptions,
    radarOptions,
    legendOptions,
    gridOptions,
    toolboxOptions
  ))

  return Object.assign({
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    }
  },
    metricOptions,
    radarOptions,
    legendOptions,
    gridOptions,
    toolboxOptions
  )
}
