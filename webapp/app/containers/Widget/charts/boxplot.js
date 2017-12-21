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
    metrics,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    tooltip,
    legend,
    toolbox,
    top,
    bottom,
    left,
    right,
    suffixYAxis
  } = chartParams

  let metricOptions,
    xAxisOptions,
    yAxisOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions,
    suffixYAxisOptions,
    data,
    xAxisData

  if (xAxis && metrics && metrics.length) {
    let data = dataSource.map(data => data[xAxis])
    xAxisData = data.filter((x, index) => data.indexOf(x) === index)
    xAxisOptions = {
      xAxis: {
        type: 'category',
        data: metrics,
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
          show: false
        },
        axisLabel: {
          interval: xAxisInterval,
          rotate: xAxisRotate,
          formatter: '{value}'
        },
        splitLine: {
          show: false
        }
      }
    }
  }
  data = []
  if (metrics && metrics.length) {
    let step1 = xAxisData.map(xData => dataSource.filter(data => data[xAxis] === xData))
    let step2 = step1.map(step => metrics.map(me => step.map(st => st[me])))
    data = step2.map(step => dataTool(step))

    metricOptions = {
      series: data.map((d, index) => ({
        name: xAxisData[index],
        type: 'boxplot',
        data: d.boxData,
        tooltip: {formatter: formatter}
      }))
    }
  }

  suffixYAxisOptions = suffixYAxis && suffixYAxis.length ? {axisLabel: {
    formatter: `{value} ${suffixYAxis}`
  }} : null

  yAxisOptions = {
    yAxis: Object.assign({
      type: 'value',
      splitArea: {show: true}
    }, suffixYAxisOptions)
  }

  // tooltip
  tooltipOptions = tooltip && tooltip.length
    ? {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      }
    } : null
  // legend
  legendOptions = legend && legend.length
    ? {
      legend: {
        data: metricOptions.series.map(m => m.name),
        align: 'left',
        top: 3,
        right: 200
      }
    } : null
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
        right: 22
      }
    } : null
  // grid
  gridOptions = {
    grid: {
      top: top,
      left: left,
      right: right,
      bottom: bottom
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
  return Object.assign({},
    metricOptions,
    xAxisOptions,
    yAxisOptions,
    legendOptions,
    gridOptions,
    tooltipOptions,
    toolboxOptions,
    dataZoomOptions
  )
}

function formatter (param) {
  return [
    `Experiment ${param.name}: `,
    `upper: ${param.data[0]}`,
    `Q1: ${param.data[1]}`,
    `median: ${param.data[2]}`,
    `Q3: ${param.data[3]}`,
    `lower: ${param.data[4]}`
  ].join('<br/>')
}
