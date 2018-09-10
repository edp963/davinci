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
    dimension,
    metrics,
    hasLegend,
    legendSelected,
    legendPosition,
    toolbox,
    top,
    bottom,
    left,
    right
  } = chartParams

  let metricOptions
  let legendOptions
  let toolboxOptions
  let gridOptions
  let data
  let radarOptions

  if (dimension && dimension.length) {
    if (metrics && metrics.length) {
      const metricData = metrics.map((me) => dataSource.map((data) => data[me]))
      data = metrics.map((me, index) => ({
        name: me,
        value: metricData[index]
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
          indicator: dataSource.map((data) => data[dimension]).map((name, index) => {
            const max = Math.max.apply(null, metrics.map((me) => dataSource.map((data) => data[me])).map((list) => list[index]).map((arr) => parseFloat(arr)))
            return {
              name,
              max: max + Math.floor(max * 0.1)
            }
          })
        }
      }
    }
  }
  metricOptions = {
    series: [{
     // name: metricName && metricName.length ? metricName : '',
      type: 'radar',
      data
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

  return {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    ...metricOptions,
    ...radarOptions,
    ...legendOptions,
    ...gridOptions,
    ...toolboxOptions
  }
}
