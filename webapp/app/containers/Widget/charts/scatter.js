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
 * Scatter chart options generator
 */

export default function (dataSource, flatInfo, chartParams) {
  const hasGroups = flatInfo.groups

  const {
    groups,
    xAxis,
    yAxis,
    xAxisInterval,
    xAxisRotate,
    dataZoomThreshold,
    splitLine,
    size,
    label,
    shadow,
    legend,
    toolbox,
    top,
    bottom,
    left,
    right
  } = chartParams

  let grouped,
    metricOptions,
    xAxisOptions,
    yAxisOptions,
    splitLineOptions,
    sizeOptions,
    labelOptions,
    shadowOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions

  // series 数据项
  let metricArr = []

  // 数据分组
  if (hasGroups && groups) {
    grouped = makeGourped(dataSource, [].concat(groups).filter(i => !!i))
  }

  sizeOptions = size && {
    symbolSize: function (data) {
      return Math.sqrt(data[0] * data[1]) / size
    }
  }
  shadowOptions = shadow && shadow.length && {
    shadowBlur: 10,
    shadowColor: 'rgba(0, 0, 0, 0.35)',
    shadowOffsetX: 10,
    shadowOffsetY: 10
  }
  labelOptions = label && {
    label: {
      emphasis: Object.assign({}, {
        show: true,
        opacity: 0.8,
        position: 'top',
        formatter: function (param) {
          return param.data[2]
        }
      }, shadowOptions)
    }
  }

  if (hasGroups && groups) {
    Object
      .keys(grouped)
      .forEach(k => {
        let serieObj = Object.assign({},
          {
            name: k,
            type: 'scatter',
            data: grouped[k].map(g => [g[xAxis], g[yAxis], g[label]])
          },
          sizeOptions,
          labelOptions
        )
        metricArr.push(serieObj)
      })
  } else {
    let serieObj = Object.assign({},
      {
        name: '数据',
        type: 'scatter',
        data: dataSource.map(g => [g[xAxis], g[yAxis], g[label]])
      },
      sizeOptions,
      labelOptions
    )
    metricArr.push(serieObj)
  }

  metricOptions = {
    series: metricArr
  }

  // 交叉轴
  splitLineOptions = splitLine && splitLine.length && {
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  }

  // x轴数据
  xAxisOptions = {
    xAxis: Object.assign({
      type: 'value',
      axisLabel: {
        interval: xAxisInterval,
        rotate: xAxisRotate
      }
    }, splitLineOptions)
  }

  yAxisOptions = {
    yAxis: Object.assign({
      type: 'value',
      scale: true
    }, splitLineOptions)
  }

  // legend
  legendOptions = legend && legend.length
    ? {
      legend: {
        data: metricArr.map(m => m.name),
        align: 'left',
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
        }
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

  return Object.assign({},
    metricOptions,
    xAxisOptions,
    yAxisOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    dataZoomOptions
  )
}

export function makeGourped (dataSource, groupColumns) {
  return dataSource.reduce((acc, val) => {
    let accColumn = groupColumns
      .reduce((arr, col) => {
        arr.push(val[col])
        return arr
      }, [])
      .join(' ')
    if (!acc[accColumn]) {
      acc[accColumn] = []
    }
    acc[accColumn].push(val)
    return acc
  }, {})
}
