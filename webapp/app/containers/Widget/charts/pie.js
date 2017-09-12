/*-
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

export default function (dataSource, flatInfo, chartParams) {
  const {
    title,
    value,
    circle,
    tooltip,
    legend,
    toolbox
  } = chartParams

  let metricOptions,
    labelOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions,
    gridOptions

  // series 数据项
  let metricArr = []

  labelOptions = circle && circle.length && {
    label: {
      normal: {
        show: false,
        position: 'center'
      },
      emphasis: {
        show: true,
        textStyle: {
          fontSize: '30',
          fontWeight: 'bold'
        }
      }
    }
  }

  let serieObj = Object.assign({},
    {
      name: '数据',
      type: 'pie',
      radius: circle && circle.length ? ['50%', '70%'] : '60%',
      data: dataSource.map(d => ({
        name: d[title],
        value: Number(d[value])
      }))
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
        trigger: 'item'
      }
    } : null

  // legend
  legendOptions = legend && legend.length
    ? {
      legend: {
        data: dataSource.map(d => d.name),
        align: 'left'
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

  // grid
  gridOptions = {
    grid: {
      top: legend && legend.length  // FIXME
        ? Math.ceil(metricArr.length / Math.round((document.documentElement.clientWidth - 40 - 320 - 32 - 200) / 100)) * 30 + 10
        : 40,
      left: 60,
      right: 60,
      bottom: 30
    }
  }

  return Object.assign({},
    metricOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions,
    gridOptions
  )
}
