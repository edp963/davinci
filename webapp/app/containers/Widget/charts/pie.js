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
    tooltip,
    legend,
    toolbox,
    top,
    left
  } = chartParams

  let metricOptions,
    labelOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions

  // series 数据项
  let metricArr = []

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

  let serieObj = Object.assign({},
    {
      name: title,
      type: 'pie',
      radius: circle && circle.length ? [`${insideRadius}%`, `${outsideRadius}%`] : `${insideRadius}%`,
      center: [`${left}%`, `${top}%`],
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
      }
    },
    labelOptions
  )
  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // tooltip
  tooltipOptions = tooltip && tooltip.length
    ? {
      tooltip: {
        trigger: 'item',
        formatter: '{b} <br/>{c} ({d}%)'
      }
    } : null

  // legend
  legendOptions = legend && legend.length
    ? {
      legend: {
        data: dataSource.map(d => d[title]),
        orient: 'vertical',
        x: 'left'
      }
    } : null

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          dataView: {readOnly: false},
          restore: {},
          saveAsImage: {}
        }
      }
    } : null

  return Object.assign({},
    metricOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions
  )
}
