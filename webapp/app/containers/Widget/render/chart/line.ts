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
  getAggregatorLocale
} from '../../components/util'
import {
  getDimetionAxisOption,
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getGridPositions,
  makeGrouped,
  distinctXaxis
} from './util'
import { getFormattedValue, IFieldFormatConfig } from '../../components/Config/Format'
import { IFieldConfig, getFieldAlias } from '../../components/Config/Field'
import { IWidgetMetric, IWidgetDimension } from '../../components/Widget'
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

export default function (chartProps: IChartProps, drillOptions?: any) {
  const {
    data,
    cols,
    metrics,
    chartStyles,
    queryVariables,
    color,
    tip
  } = chartProps

  const {
    spec,
    xAxis,
    yAxis,
    splitLine,
    label,
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

  const {
    smooth,
    step
  } = spec

  const { selectedItems } = drillOptions

  // only 1 dimension and multiple metrics, maybe with 1 color dimension

  let datasetSource = data

  const dimensions = [...cols, ...color.items]
  const dimension = cols[0]
  const { name: xAxisName, format: dimensionFormat } = dimension

  const metricNames = metrics.map((m) => {
    const name = decodeMetricName(m.name)
    const expression = `${m.agg}(${name})`
    const text = `[${getAggregatorLocale(m.agg)}]${name}`
    return { expression, text }
  })

  let seriesNames: string[]
  let mapSeriesNames: { [key: string]: { metricIdx: number, categoryValue?: number | string } }

  if (color.items.length) {
    const seriesNamesSet = new Set<string>()
    mapSeriesNames = {}
    const categoryName = color.items[0].name
    const mapDatasetSource = data.reduce((map, record) => {
      const dimValue = record[xAxisName]
      if (!map[dimValue]) { map[dimValue] = { [xAxisName]: dimValue } }
      const categoryValue = record[categoryName]
      metricNames.forEach(({ expression, text }, metricIdx) => {
        const groupKey = [categoryValue, text].join(' ')
        seriesNamesSet.add(groupKey)
        if (!mapSeriesNames[groupKey]) {
          mapSeriesNames[groupKey] = { metricIdx, categoryValue }
        }
        const metricValue = record[expression] || 0
        const groupValue = map[dimValue][groupKey] || 0
        map[dimValue][groupKey] = groupValue + metricValue
      })
      return map
    }, {})
    seriesNames = Array.from(seriesNamesSet)
    datasetSource = Object.values(mapDatasetSource)
    datasetSource.forEach((row) => {
      seriesNames.forEach((seriesName) => {
        if (!row[seriesName]) {
          row[seriesName] = 0
        }
      })
    })
  } else {
    seriesNames = metricNames.map(({ expression }) => expression)
    mapSeriesNames = metricNames.reduce<typeof mapSeriesNames>((map, { expression }, metricIdx) => {
      map[expression] = { metricIdx }
      return map
    }, {})
  }

  const series = seriesNames.map((seriesName, idx) => ({
    name: seriesName,
    type: 'line',
    sampling: 'average',
    dimensions: [xAxisName].concat(seriesNames),
    itemStyle: {
      normal: {
        color: color.items.length
          ? color.items[0].config.values[mapSeriesNames[seriesName].categoryValue]
          : color.value[seriesName] || defaultThemeColors[idx],
        opacity: selectedItems && selectedItems.length > 0 ? 0.7 : 1
      }
    },
    smooth,
    step,
    label: getLabelOption('line', label, false, {
      formatter: (params) => {
        const { value } = params
        const { format } = metrics[mapSeriesNames[seriesName].metricIdx]
        const formatted = getFormattedValue(value, format)
        return formatted
      }
    })
  }))

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

  const options = {
    xAxis: getDimetionAxisOption(xAxis, xAxisSplitLineConfig),
    yAxis: getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `)),
    dataset: {
      source: datasetSource
    },
    series,
    // tooltip: {},
    // tooltip: {
    //   formatter: getChartTooltipLabel('line', datasetSource, { cols, metrics, color, tip })
    // },
    tooltip: {
      formatter (params) {
        let tooltipItems = []
        const { seriesName, data, dataIndex } = params
        const { metricIdx, categoryValue } = mapSeriesNames[seriesName]

        tooltipItems = tooltipItems.concat(cols.map((dim) => {
          const dimensionAlias = getFieldAlias(dim.field, queryVariables) || dim.name
          const dimensionText = data[dim.name]
          return `${dimensionAlias}: ${dimensionText}`
        }))

        if (color.items.length) {
          tooltipItems = tooltipItems.concat(color.items.map((category) => {
            const categoryAlias = getFieldAlias(category.field, queryVariables) || category.name
            return `${categoryAlias}: ${categoryValue}`
          }))
        }

        const { field, format } = metrics[metricIdx]
        const metricAlias = getFieldAlias(field, queryVariables) || metricNames[metricIdx].text
        const formattedValue = getFormattedValue(data[seriesName], format)
        tooltipItems = tooltipItems.concat(`${metricAlias}: ${formattedValue}`)

        return tooltipItems.join('<br/>')
      }
    },
    legend: getLegendOption(legend, seriesNames),
    grid: getGridPositions(legend, seriesNames, '', false, yAxis, xAxis)
  }

  options.xAxis.type = 'category'

  return options
}
