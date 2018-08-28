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
 * Pie chart options generator
 */

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    title,
    value,
    circle,
    insideRadius,
    outsideRadius,
    hasLegend,
    legendSelected,
    legendPosition,
    toolbox,
    top,
    roseType,
    left
  } = chartParams

  let metricOptions
  let labelOptions
  let legendOptions
  let toolboxOptions
  let roseOptions

  // legend
  let adjustedLeft = 0

  if (hasLegend && hasLegend.length) {
    let orient
    let positions

    switch (legendPosition) {
      case 'right':
        orient = { orient: 'vertical' }
        positions = { right: 8, top: 40, bottom: 16 }
        adjustedLeft = 45
        break
      case 'bottom':
        orient = { orient: 'horizontal' }
        positions = { bottom: 16, left: 8, right: 8 }
        break
      default:
        orient = { orient: 'horizontal' }
        positions = { top: 3, left: 8, right: 96 }
        break
    }

    const selected = legendSelected === 'unselectAll'
      ? {
        selected: dataSource.reduce((obj, d) => ({ ...obj, [d[title]]: false }), {})
      } : null

    legendOptions = {
      legend: {
        data: dataSource.map((d) => d[title]),
        type: 'scroll',
        ...orient,
        ...positions,
        ...selected
      }
    }
  }

  // series 数据项
  const metricArr = []

  labelOptions = circle && circle.length
    ? {
      label: {
        normal: {
          show: true,
          position: 'inside',
          formatter: '{d}%'
        },
        emphasis: {
          show: true,
          position: 'center',
          textStyle: {
            fontSize: '16',
            fontWeight: 'bold'
          }
        }
      }
    }
    : {
      label: {
        normal: {
          show: true,
          formatter: '{b}({d}%)'
        }
      }
    }
  roseOptions = roseType && roseType.length ? {roseType: 'radius'} : null
  const serieObj = {
    name: title,
    type: 'pie',
    radius: circle && circle.length ? [`${insideRadius}%`, `${outsideRadius}%`] : `${insideRadius}%`,
    center: [
      adjustedLeft && legendPosition === 'right' ? `${Math.min(left, adjustedLeft)}%` : `${left}%`,
      `${top}%`
    ],
    avoidLabelOverlap: !circle || !circle.length,
    data: dataSource.map((d, index) => {
      if (index === interactIndex) {
        return {
          name: d[title],
          value: Number(d[value]),
          itemStyle: {
            normal: {
              opacity: 1
            }
          }
        }
      } else {
        return {
          name: d[title],
          value: Number(d[value])
        }
      }
    }),
    itemStyle: {
      normal: {
        opacity: interactIndex === undefined ? 1 : 0.25
      }
    },
    ...roseOptions,
    ...labelOptions
  }
  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          dataView: {readOnly: false},
          restore: {},
          saveAsImage: {}
        },
        right: 8
      }
    } : null

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b} <br/>{c} ({d}%)'
    },
    ...metricOptions,
    ...legendOptions,
    ...toolboxOptions
  }
}
