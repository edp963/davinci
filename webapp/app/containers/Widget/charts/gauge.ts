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
 * gauge chart options generator
 */
const danger = '#c23531'
const colorList = [
  '#2f4554',
  '#61a0a8',
  '#d48265',
  '#91c7ae',
  '#749f83',
  '#ca8622',
  '#bda29a',
  '#6e7074',
  '#546570',
  '#c4ccd3']
export default function (dataSource, flatInfo, chartParams) {
  const {
    tooltip,
    toolbox,
    axisLine,
    pointer,
    radius,
    subsection,
    metrics,
    prefix,
    suffix,
    gaugeName
  } = chartParams
  let metricOptions
  let tooltipOptions
  let toolboxOptions
  let subsectionMax

  // series 数据项
  const metricArr = []
  const color = []
  if (subsection) {
    const tiny = 1 / subsection
    for (let index = 0; index < subsection; index++) {
      color.push(index === subsection - 1 ? [1, danger] : [tiny * (index + 1), colorList[index]])
    }
  }

  const prefixOption = prefix && prefix.length ? prefix : ''
  const suffixOption = suffix && suffix.length ? suffix : ''

  if (dataSource && dataSource[0] && dataSource[0][metrics]) {
    const metric = dataSource[0][metrics]
    const first = parseInt(metric[0], 10) + 1
    const length = parseInt(metric, 10).toString().length
    subsectionMax = first * Math.pow(10, length - 1)
  }

  const serieObj = {
    name: '业务指标',
    type: 'gauge',
    radius: `${radius}%`, // 仪表盘半径
    detail: {formatter: `${prefixOption}{value}${suffixOption}`},
    min: 0,
    max: subsectionMax,
    // splitNumber: 'none', 显示刻度
    axisLine: {
      show: true,
      width: 20, // 仪表盘轴线宽度
      shadowBlur: 0,
      lineStyle: {
        width: axisLine,
        shadowBlur: 0
      }
    },
    axisTick: {         // 坐标轴刻度线
      show: true
    },
    splitLine: {         // 坐标轴刻度分隔线
      show: true
    },
    pointer: {          // 5 指针宽度
      width: pointer
    },
    data: [{
      name: gaugeName && gaugeName.length ? gaugeName : '',
      value: dataSource && dataSource[0] && dataSource[0][metrics] ? dataSource[0][metrics] : 0
    }]
  }
  if (color && color.length > 3) {
    serieObj.axisLine.lineStyle['color'] = color
  }
  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // tooltip
  tooltipOptions = tooltip && tooltip.length
    ? {
      tooltip: {
        formatter: `{a} <br/>{b} : ${prefixOption}{c}${suffixOption}`
      }
    } : null

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {
            pixelRatio: 2
          }
        },
        right: 8
      }
    } : null

  return {
    ...metricOptions,
    ...tooltipOptions,
    ...toolboxOptions
  }
}
