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

import { IChartProps } from '../../components/Chart'
import { metricAxisLabelFormatter, decodeMetricName, getChartTooltipLabel, getAggregatorLocale, getTextWidth } from '../../components/util'
import { makeGrouped, distinctXaxis, getGridPositions, getGridBase } from './line'

export default function (chartProps: IChartProps) {
  const {
    data,
    cols,
    metrics,
    chartStyles,
    color,
    tip
  } = chartProps

  const {
    spec,
    label,
    legend,
    xAxis,
    yAxis,
    splitLine
  } = chartStyles

  const {
    showLine: showLineX,
    lineStyle: lineStyleX,
    lineSize: lineSizeX,
    lineColor: lineColorX,
    showLabel: showLabelX,
    labelFontFamily: labelFontFamilyX,
    labelFontSize: labelFontSizeX,
    labelColor: labelColorX
  } = xAxis

  const {
    showLine: showLineY,
    lineStyle: lineStyleY,
    lineSize: lineSizeY,
    lineColor: lineColorY,
    showLabel: showLabelY,
    labelFontFamily: labelFontFamilyY,
    labelFontSize: labelFontSizeY,
    labelColor: labelColorY,
    showTitleAndUnit,
    titleFontFamily,
    titleFontSize,
    titleColor
  } = yAxis

  const {
    showHorizontalLine,
    horizontalLineStyle,
    horizontalLineSize,
    horizontalLineColor,
    showVerticalLine,
    verticalLineStyle,
    verticalLineSize,
    verticalLineColor
  } = splitLine

  const {
    showLabel,
    labelPosition,
    labelFontFamily,
    labelFontSize,
    labelColor
  } = label

  const {
    legendPosition,
    selectAll
  } = legend

  const labelOption = {
    label: {
      normal: {
        show: showLabel,
        position: labelPosition,
        color: labelColor,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize
      }
    }
  }

  let xAxisData = data.map((d) => d[cols[0]] || '')
  let grouped = {}
  if (color.items.length) {
    xAxisData = distinctXaxis(data, cols[0])
    grouped = makeGrouped(data, color.items.map((c) => c.name), cols[0], metrics, xAxisData)
  }

  const series = []
  const seriesData = []

  metrics.forEach((m) => {
    const decodedMetricName = decodeMetricName(m.name)
    const localeMetricName = `[${getAggregatorLocale(m.agg)}] ${decodedMetricName}`
    if (color.items.length) {
      Object
        .entries(grouped)
        .forEach(([k, v]: [string, any[]]) => {
          const serieObj = {
            name: `${k} ${localeMetricName}`,
            type: 'bar',
            stack: m.name,
            sampling: 'average',
            data: v.map((g, index) => {
              // if (index === interactIndex) {
              //   return {
              //     value: g[m],
              //     itemStyle: {
              //       normal: {
              //         opacity: 1
              //       }
              //     }
              //   }
              // } else {
                return g[`${m.agg}(${decodedMetricName})`]
              // }
            }),
            itemStyle: {
              normal: {
                // opacity: interactIndex === undefined ? 1 : 0.25
                color: color.items[0].config.values[k.split(',')[0]]
              }
            },
            ...labelOption
          }
          series.push(serieObj)
          seriesData.push(grouped[k])
        })
    } else {
      const serieObj = {
        name: decodedMetricName,
        type: 'bar',
        sampling: 'average',
        data: data.map((d, index) => {
          // if (index === interactIndex) {
          //   return {
          //     value: d[m],
          //     lineStyle: {
          //       normal: {
          //         opacity: 1
          //       }
          //     },
          //     itemStyle: {
          //       normal: {
          //         opacity: 1
          //       }
          //     }
          //   }
          // } else {
            return d[`${m.agg}(${decodedMetricName})`]
          // }
        }),
        // lineStyle: {
        //   normal: {
        //     opacity: interactIndex === undefined ? 1 : 0.25
        //   }
        // },
        itemStyle: {
          normal: {
            // opacity: interactIndex === undefined ? 1 : 0.25
            color: color.value[m.name] || color.value['all']
          }
        },
        ...labelOption
      }
      series.push(serieObj)
      seriesData.push([...data])
    }
  })

  let legendOption
  if (color.items.length || metrics.length > 1) {
    let orient
    let positions

    switch (legendPosition) {
      case 'top':
        orient = { orient: 'horizontal' }
        positions = { top: 8, left: 8, right: 8, height: 32 }
        break
      case 'bottom':
        orient = { orient: 'horizontal' }
        positions = { bottom: 8, left: 8, right: 8, height: 32 }
        break
      case 'left':
        orient = { orient: 'vertical' }
        positions = { left: 8, top: 30, bottom: 30, width: 96 }
        break
      default:
        orient = { orient: 'vertical' }
        positions = { right: 8, top: 30, bottom: 30, width: 96 }
        break
    }

    const selected = {
      selected: series.reduce((obj, s) => ({
        ...obj,
        [s.name]: selectAll
      }), {})
    }

    legendOption = {
      legend: {
        data: series.map((s) => s.name),
        type: 'scroll',
        ...orient,
        ...positions,
        ...selected
      }
    }
  }

  // dataZoomOptions = dataZoomThreshold > 0 && dataZoomThreshold < dataSource.length && {
  //   dataZoom: [{
  //     type: 'inside',
  //     start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
  //     end: 100
  //   }, {
  //     start: Math.round((1 - dataZoomThreshold / dataSource.length) * 100),
  //     end: 100,
  //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
  //     handleSize: '80%',
  //     handleStyle: {
  //       color: '#fff',
  //       shadowBlur: 3,
  //       shadowColor: 'rgba(0, 0, 0, 0.6)',
  //       shadowOffsetX: 2,
  //       shadowOffsetY: 2
  //     }
  //   }]
  // }

  return {
    xAxis: {
      data: xAxisData,
      axisLabel: {
        show: showLabelX,
        color: labelColorX,
        fontFamily: labelFontFamilyX,
        fontSize: labelFontSizeX
      },
      axisLine: {
        show: showLineX,
        lineStyle: {
          color: lineColorX,
          width: lineSizeX,
          type: lineStyleX
        }
      },
      axisTick: {
        show: showLineX,
        lineStyle: {
          color: lineColorX
        }
      },
      splitLine: {
        show: showVerticalLine,
        lineStyle: {
          color: verticalLineColor,
          width: verticalLineSize,
          type: verticalLineStyle
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: showLabelY,
        color: labelColorY,
        fontFamily: labelFontFamilyY,
        fontSize: labelFontSizeY,
        formatter: metricAxisLabelFormatter
      },
      axisLine: {
        show: showLineY,
        lineStyle: {
          color: lineColorY,
          width: lineSizeY,
          type: lineStyleY
        }
      },
      axisTick: {
        show: showLineY,
        lineStyle: {
          color: lineColorY
        }
      },
      ...showTitleAndUnit && {
        name: metrics.map((m) => decodeMetricName(m.name)).join(` / `),
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: {
          color: titleColor,
          fontFamily: titleFontFamily,
          fontSize: titleFontSize
        }
      },
      splitLine: {
        show: showHorizontalLine,
        lineStyle: {
          color: horizontalLineColor,
          width: horizontalLineSize,
          type: horizontalLineStyle
        }
      }
    },
    tooltip: {
      formatter: getChartTooltipLabel(seriesData, { cols, metrics, color, tip })
    },
    series,
    ...legendOption,
    grid: getGridPositions(legendPosition, series.map((s) => s.name))
  }
}
