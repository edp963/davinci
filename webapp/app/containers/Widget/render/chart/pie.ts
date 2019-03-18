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
import {
  decodeMetricName,
  getTextWidth
} from '../../components/util'
import {
  getLegendOption,
  getLabelOption
} from './util'

export default function (chartProps: IChartProps) {
  const {
    width,
    height,
    data,
    cols,
    metrics,
    chartStyles,
    color,
    tip
  } = chartProps

  const {
    label,
    legend,
    spec,
    toolbox
  } = chartStyles

  const {
    legendPosition,
    fontSize
  } = legend

  const {
    circle,
    roseType
  } = spec

  // formatter: '{b}({d}%)'
  const labelOption = {
    label: getLabelOption('pie', label)
  }

  const roseTypeValue = roseType ? 'radius' : ''
  const radiusValue = (!circle && !roseType) || (!circle && roseType) ? `70%` : ['48%', '70%']

  let seriesObj = {}
  const seriesArr = []
  let legendData = []
  metrics.forEach((m) => {
    const decodedMetricName = decodeMetricName(m.name)
    if (cols.length || color.items.length) {
      const groupColumns = color.items.map((c) => c.name).concat(cols)
      .reduce((distinctColumns, col) => {
        if (!distinctColumns.includes(col)) {
          distinctColumns.push(col)
        }
        return distinctColumns
      }, [])
      const grouped = data.reduce((obj, val) => {
        const groupingKey = groupColumns
          .reduce((keyArr, col) => keyArr.concat(val[col]), [])
          .join(String.fromCharCode(0))
        if (!obj[groupingKey]) {
          obj[groupingKey] = []
        }
        obj[groupingKey].push(val)
        return obj
      }, {})

      const seriesData = []
      Object.entries(grouped).forEach(([key, value]) => {
        const legendStr = key.replace(String.fromCharCode(0), ' ')
        legendData.push(legendStr)
        value.forEach((v) => {
          const obj = {
            name: legendStr,
            value: v[`${m.agg}(${decodedMetricName})`]
          }
          seriesData.push(obj)
        })
      })

      let leftValue
      let topValue
      const pieLeft = 56 + Math.max(...legendData.map((s) => getTextWidth(s, '', `${fontSize}px`)))
      switch (legendPosition) {
        case 'top':
          leftValue = width / 2
          topValue = (height + 32) / 2
          break
        case 'bottom':
          leftValue = width / 2
          topValue = (height - 32) / 2
          break
        case 'left':
          leftValue = (width + pieLeft) / 2
          topValue = height / 2
          break
        case 'right':
          leftValue = (width - pieLeft) / 2
          topValue = height / 2
          break
      }

      let colorArr = []
      if (color.items.length) {
        const colorvaluesObj = color.items[0].config.values
        for (const keys in colorvaluesObj) {
          if (colorvaluesObj.hasOwnProperty(keys)) {
            colorArr.push(colorvaluesObj[keys])
          }
        }
      } else {
        colorArr = ['#509af2']
      }

      seriesObj = {
        name: '',
        type: 'pie',
        avoidLabelOverlap: false,
        center: legend.showLegend ? [leftValue, topValue] : [width / 2, height / 2],
        color: colorArr,
        data: seriesData,
        itemStyle: {
          emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        ...labelOption,
        roseType: roseTypeValue,
        radius: radiusValue
      }
    } else {
      legendData = []
      seriesObj = {
        name: decodedMetricName,
        type: 'pie',
        avoidLabelOverlap: false,
        center: [width / 2, height / 2],
        data: data.map((d, index) => {
          return {
            name: decodedMetricName,
            value: d[`${m.agg}(${decodedMetricName})`]
          }
        }),
        itemStyle: {
          emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        ...labelOption,
        roseType: roseTypeValue,
        radius: radiusValue
      }
    }
    seriesArr.push(seriesObj)
  })

  return {
    tooltip : {
        trigger: 'item',
        formatter: '{b} <br/>{c} ({d}%)'
    },
    legend: getLegendOption(legend, legendData),
    series: seriesArr
  }
}
