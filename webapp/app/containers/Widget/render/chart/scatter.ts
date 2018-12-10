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
  getChartTooltipLabel,
  getSizeValue,
  getSizeRate
} from '../../components/util'
import {
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getGridPositions,
  getSymbolSize
} from './util'
import { PIVOT_DEFAULT_SCATTER_SIZE } from '../../../../globalConstants'

export default function (chartProps: IChartProps) {
  const {
    data,
    cols,
    metrics,
    chartStyles,
    color,
    tip,
    size
  } = chartProps

  const {
    spec,
    xAxis,
    yAxis,
    splitLine,
    label: labelStyleConfig,
    legend
  } = chartStyles

  const {
    showVerticalLine,
    verticalLineColor,
    verticalLineSize,
    verticalLineStyle,
    showHorizontalLine,
    horizontalLineColor,
    horizontalLineSize,
    horizontalLineStyle
  } = splitLine

  const labelOption = {
    label: getLabelOption('scatter', labelStyleConfig, true, {
      formatter (param) {
        return param.data.value[2]
      }
    })
  }

  let sizeRate = 0
  let sizeItemName = ''
  if (size.items.length) {
    const sizeItem = size.items[0]
    sizeItemName = `${sizeItem.agg}(${decodeMetricName(sizeItem.name)})`
    const sizeValues = data.map((d) => d[sizeItemName])
    sizeRate = getSizeRate(Math.min(...sizeValues), Math.max(...sizeValues))
  }

  const series = []
  const seriesData = []

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

    const labelItemName = color.items.length
      ? color.items[0].name
      : cols[0]

    Object.entries(grouped).forEach(([key, value]) => {
      series.push({
        name: key.replace(String.fromCharCode(0), ' '),
        type: 'scatter',
        data: value.map((v) => {
          const [x, y] = metrics
          const currentSize = size.items.length ? v[sizeItemName] : PIVOT_DEFAULT_SCATTER_SIZE
          const sizeValue = getSizeValue(size.value['all'])
          return {
            value: [
              v[`${x.agg}(${decodeMetricName(x.name)})`],
              v[`${y.agg}(${decodeMetricName(y.name)})`],
              v[labelItemName],
              currentSize
            ],
            symbolSize: size.items.length
              ? getSymbolSize(sizeRate, currentSize) * sizeValue
              : currentSize * sizeValue
          }
        }),
        itemStyle: {
          normal: {
            color: color.items.length
              ? color.items[0].config.values[key.split(String.fromCharCode(0))[0]]
              : color.value['all']
          }
        },
        ...labelOption
      })
      seriesData.push(value)
    })
  } else {
    series.push({
      name: 'single',
      type: 'scatter',
      data: data.map((d) => {
        const [x, y] = metrics
        const currentSize = size.items.length ? d[sizeItemName] : PIVOT_DEFAULT_SCATTER_SIZE
        const sizeValue = getSizeValue(size.value['all'])
        return {
          value: [
            d[`${x.agg}(${decodeMetricName(x.name)})`],
            d[`${y.agg}(${decodeMetricName(y.name)})`],
            '',
            currentSize
          ],
          symbolSize: size.items.length
            ? getSymbolSize(sizeRate, currentSize) * sizeValue
            : currentSize * sizeValue
        }
      }),
      itemStyle: {
        normal: {
          color: color.value['all']
        }
      },
      ...labelOption
    })
    seriesData.push(data)
  }

  const seriesNames = series.map((s) => s.name)

  let legendOption
  if (cols.length || color.items.length) {
    legendOption = {
      legend: getLegendOption(legend, seriesNames)
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

  const xAxisSplitLineConfig = {
    showLine: showVerticalLine,
    lineColor: verticalLineColor,
    lineSize: verticalLineSize,
    lineStyle: verticalLineStyle
  }

  const yAxisSplitLineConfig = {
    showLine: showHorizontalLine,
    lineColor: horizontalLineColor,
    lineSize: horizontalLineSize,
    lineStyle: horizontalLineStyle
  }

  return {
    xAxis: getMetricAxisOption(xAxis, xAxisSplitLineConfig, decodeMetricName(metrics[0].name), 'x'),
    yAxis: getMetricAxisOption(yAxis, yAxisSplitLineConfig, decodeMetricName(metrics[1].name)),
    series,
    tooltip: {
      formatter: getChartTooltipLabel('scatter', seriesData, { cols, metrics, color, tip })
    },
    ...legendOption,
    grid: getGridPositions(legend, seriesNames, false, yAxis)
  }
}
