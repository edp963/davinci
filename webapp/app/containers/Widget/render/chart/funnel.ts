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
  getTextWidth
} from '../../components/util'
import { getLegendOption, getLabelOption } from './util'
import { EChartOption } from 'echarts'
import { getFormattedValue } from '../../components/Config/Format'

export default function (chartProps: IChartProps, drillOptions?: any) {
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

  const { label, legend, spec, toolbox } = chartStyles

  const { legendPosition, fontSize } = legend

  const { alignmentMode, gapNumber, sortMode } = spec

  const labelOption = {
    label: getLabelOption('funnel', label, metrics)
  }

  const { selectedItems } = drillOptions

  let seriesObj = {}
  const seriesArr = []
  let legendData = []
  let grouped: { [key: string]: object[] } = {}

  if (metrics.length <= 1) {
    const groupColumns = color.items
      .map((c) => c.name)
      .concat(cols.map((c) => c.name))
      .reduce((distinctColumns, col) => {
        if (!distinctColumns.includes(col)) {
          distinctColumns.push(col)
        }
        return distinctColumns
      }, [])

    grouped = data.reduce<{ [key: string]: object[] }>((obj, val) => {
      const groupingKey = groupColumns
        .reduce((keyArr, col) => keyArr.concat(val[col]), [])
        .join(String.fromCharCode(0))
      if (!obj[groupingKey]) {
        obj[groupingKey] = []
      }
      obj[groupingKey].push(val)
      return obj
    }, {})

    metrics.forEach((metric) => {
      const decodedMetricName = decodeMetricName(metric.name)

      const seriesData = []
      Object.entries(grouped).forEach(([key, value]) => {
        const legendStr = key.replace(String.fromCharCode(0), ' ')
        legendData.push(legendStr)
        value.forEach((v) => {
          const obj = {
            name: legendStr,
            value: v[`${metric.agg}(${decodedMetricName})`]
          }
          seriesData.push(obj)
        })
      })

      const maxValue = Math.max(
        ...data.map((s) => s[`${metric.agg}(${decodedMetricName})`])
      )
      const minValue = Math.min(
        ...data.map((s) => s[`${metric.agg}(${decodedMetricName})`])
      )

      const numValueArr = data.map(
        (d) => d[`${metric.agg}(${decodedMetricName})`] >= 0
      )
      const minSizePer = (minValue / maxValue) * 100
      const minSizeValue =
        numValueArr.indexOf(false) === -1 ? `${minSizePer}%` : '0%'

      const funnelLeft =
        56 +
        Math.max(...legendData.map((s) => getTextWidth(s, '', `${fontSize}px`)))
      const leftValue =
        legendPosition === 'left' ? width * 0.15 + funnelLeft : width * 0.15
      const topValue =
        legendPosition === 'top' ? height * 0.12 + 32 : height * 0.12

      const heightValue =
        legendPosition === 'left' || legendPosition === 'right'
          ? height - height * 0.12 * 2
          : height - 32 - height * 0.12 * 2
      const widthValue =
        legendPosition === 'left' || legendPosition === 'right'
          ? width - funnelLeft - width * 0.15 * 2
          : width - width * 0.15 * 2

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
        type: 'funnel',
        min: minValue,
        max: maxValue,
        minSize: minSizeValue,
        maxSize: '100%',
        sort: sortMode,
        funnelAlign: alignmentMode,
        gap: gapNumber || 0,
        left: leftValue,
        top: topValue,
        width: widthValue,
        height: heightValue,
        color: colorArr,
        //  data: seriesData,
        data: seriesData.map((data, index) => {
          const itemStyleObj =
            selectedItems &&
            selectedItems.length &&
            selectedItems.some((item) => item === index)
              ? {
                  itemStyle: {
                    normal: {
                      opacity: 1
                    }
                  }
                }
              : {}
          return {
            ...data,
            ...itemStyleObj
          }
        }),
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          normal: {
            opacity: selectedItems && selectedItems.length > 0 ? 0.25 : 1
          }
        },
        ...labelOption
      }

      seriesArr.push(seriesObj)
    })
  } else {
    legendData = []
    seriesObj = {
      type: 'funnel',
      sort: sortMode,
      funnelAlign: alignmentMode,
      gap: gapNumber || 0,
      left: width * 0.15,
      top: height * 0.12,
      width: width - width * 0.15 * 2,
      height: height - height * 0.12 * 2,
      data: metrics.map((metric) => {
        const decodedMetricName = decodeMetricName(metric.name)
        legendData.push(decodedMetricName)

        const itemStyleObj =
          selectedItems &&
          selectedItems.length &&
          selectedItems.some((item) => item === 0)
            ? {
                itemStyle: {
                  normal: {
                    opacity: 1
                  }
                }
              }
            : {}

        return {
          name: decodedMetricName,
          value: data.reduce((sum, record) => sum + record[`${metric.agg}(${decodedMetricName})`], 0),
          ...itemStyleObj
        }
      }),
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        normal: {
          opacity: selectedItems && selectedItems.length > 0 ? 0.25 : 1
        }
      },
      ...labelOption
    }
    seriesArr.push(seriesObj)
  }

  const tooltip: EChartOption.Tooltip = {
    trigger: 'item',
    formatter (params: EChartOption.Tooltip.Format) {
      const { color, name, value, percent, dataIndex } = params
      const tooltipLabels = []
      if (color) {
        tooltipLabels.push(
          `<span class="widget-tooltip-circle" style="background: ${color}"></span>`
        )
      }
      tooltipLabels.push(
        `${name}<br/>${getFormattedValue(
          value as number,
          metrics[metrics.length > 1 ? dataIndex : 0].format
        )}（${percent}%）`
      )
      return tooltipLabels.join('')
    }
  }

  return {
    tooltip,
    legend: getLegendOption(legend, legendData),
    series: seriesArr
  }
}
