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

import { IAxisConfig } from '../../components/Workbench/ConfigSections/AxisSection'
import { ILabelConfig } from '../../components/Workbench/ConfigSections/LabelSection'
import { ILegendConfig } from '../../components/Workbench/ConfigSections/LegendSection'
import { metricAxisLabelFormatter, decodeMetricName, getTextWidth } from '../../components/util'
import { getFormattedValue } from '../../components/Config/Format'
import { CHART_LEGEND_POSITIONS } from 'app/globalConstants'
import { EChartOption } from 'echarts'

interface ISplitLineConfig {
  showLine: boolean
  lineStyle: 'solid' | 'dashed' | 'dotted'
  lineSize: string
  lineColor: string
}

export function getDimetionAxisOption (
  dimetionAxisConfig: IAxisConfig,
  splitLineConfig: ISplitLineConfig,
  data: string[]
): EChartOption.XAxis {
  const {
    inverse,
    showLine: showLineX,
    lineStyle: lineStyleX,
    lineSize: lineSizeX,
    lineColor: lineColorX,
    showLabel: showLabelX,
    labelFontFamily: labelFontFamilyX,
    labelFontSize: labelFontSizeX,
    labelColor: labelColorX,
    nameLocation,
    nameGap,
    nameRotate,
    showInterval,
    xAxisInterval,
    xAxisRotate
  } = dimetionAxisConfig

  const {
    showLine,
    lineStyle,
    lineSize,
    lineColor
  } = splitLineConfig

  const intervalOption = showInterval
    ? { interval: xAxisInterval }
    : null

  return {
    data,
    inverse,
    axisLabel: {
      show: showLabelX,
      color: labelColorX,
      fontFamily: labelFontFamilyX,
      fontSize: Number(labelFontSizeX),
      rotate: xAxisRotate,
      ...intervalOption
    },
    axisLine: {
      show: showLineX,
      lineStyle: {
        color: lineColorX,
        width: Number(lineSizeX),
        type: lineStyleX
      }
    },
    axisTick: {
      show: showLabelX,
      lineStyle: {
        color: lineColorX
      }
    },
    splitLine: {
      show: showLine,
      lineStyle: {
        color: lineColor,
        width: Number(lineSize),
        type: lineStyle
      }
    },
    nameLocation,
    nameRotate,
    nameGap
  }
}

export function getMetricAxisOption (
  metricAxisConfig: IAxisConfig,
  splitLineConfig: ISplitLineConfig,
  title: string,
  axis: 'x' | 'y' = 'y',
  percentage?: boolean
): EChartOption.YAxis {
  const {
    inverse,
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
    titleColor,
    nameLocation,
    nameRotate,
    nameGap,
    min,
    max
  } = metricAxisConfig

  const {
    showLine,
    lineStyle,
    lineSize,
    lineColor
  } = splitLineConfig

  return {
    type: 'value',
    inverse,
    min: percentage ? 0 : min,
    max: percentage ? 100 : max,
    axisLabel: {
      show: showLabelY,
      color: labelColorY,
      fontFamily: labelFontFamilyY,
      fontSize: Number(labelFontSizeY),
      formatter: percentage ? '{value}%' : metricAxisLabelFormatter
    },
    axisLine: {
      show: showLineY,
      lineStyle: {
        color: lineColorY,
        width: Number(lineSizeY),
        type: lineStyleY
      }
    },
    axisTick: {
      show: showLabelY,
      lineStyle: {
        color: lineColorY
      }
    },
    name: showTitleAndUnit ? title : '',
    nameLocation,
    nameGap,
    nameRotate,
    nameTextStyle: {
      color: titleColor,
      fontFamily: titleFontFamily,
      fontSize: Number(titleFontSize)
    },
    splitLine: {
      show: showLine,
      lineStyle: {
        color: lineColor,
        width: Number(lineSize),
        type: lineStyle
      }
    }
  }
}

export function getLabelOption (type: string, labelConfig: ILabelConfig, metrics, emphasis?: boolean, options?: object) {
  const {
    showLabel,
    labelPosition,
    labelFontFamily,
    labelFontSize,
    labelColor,
    pieLabelPosition,
    funnelLabelPosition
  } = labelConfig

  let position
  switch (type) {
    case 'pie':
      position = pieLabelPosition
      break
    case 'funnel':
      position = funnelLabelPosition
      break
    default:
      position = labelPosition
      break
  }

  let formatter

  switch (type) {
    case 'line':
      formatter = (params) => {
        const { value, seriesName } = params
        const m = metrics.find((m) => decodeMetricName(m.name) === seriesName)
        const formattedValue = getFormattedValue(value, m.format)
        return formattedValue
      }
      break
    case 'waterfall':
      formatter = (params) => {
        const { value } = params
        const formattedValue = getFormattedValue(value, metrics[0].format)
        return formattedValue
      }
      break
    case 'scatter':
      formatter = (params) => {
        const { value } = params
        const formattedValue = getFormattedValue(value[0], metrics[0].format)
        return formattedValue
      }
      break
    case 'pie':
    case 'funnel':
      formatter = (params) => {
        const { name, value, percent, dataIndex } = params
        const formattedValue = getFormattedValue(value, metrics[metrics.length > 1 ? dataIndex : 0].format)
        const { labelParts } = labelConfig
        if (!labelParts) {
          return `${name}\n${formattedValue}（${percent}%）`
        }
        const labels: string[] = []
        if (labelParts.includes('dimensionValue')) {
          labels.push(name)
        }
        if (labelParts.includes('indicatorValue')) {
          labels.push(formattedValue)
        }
        if (labelParts.includes('percentage')) {
          labels.push(labels.length ? `（${percent}%）` : `${percent}%`)
        }
        if (labels.length > 1 && labelParts.includes('dimensionValue')) {
          labels.splice(1, 0, '\n')
        }
        return labels.join('')
      }
      break
    case 'radar':
      formatter = (params) => {
        const { name, value, dataIndex } = params
        const formattedValue = getFormattedValue(value, metrics[dataIndex].format)
        const { labelParts } = labelConfig
        if (!labelParts) {
          return `${name}\n${formattedValue}`
        }
        const labels: string[] = []
        if (labelParts.includes('indicatorName')) {
          labels.push(name)
        }
        if (labelParts.includes('indicatorValue')) {
          labels.push(formattedValue)
        }
        if (labels.length > 1) {
          labels.splice(1, 0, '\n')
        }
        return labels.join('')
      }
      break
    case 'lines':
      formatter = (param) => {
        const { name, data } = param
        return `${name}(${data.value[2]})`
      }
      break
  }

  const labelOption = {
    normal: {
      show: type === 'pie' && pieLabelPosition === 'center' ? false : showLabel,
      position,
      distance: 15,
      color: labelColor,
      fontFamily: labelFontFamily,
      fontSize: labelFontSize,
      formatter,
      ...options
    },
    ...emphasis && {
      emphasis: {
        show: showLabel,
        position,
        distance: 15,
        color: labelColor,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize,
        formatter,
        ...options
      }
    }
  }

  return labelOption
}

export function getLegendOption (legendConfig: ILegendConfig, seriesNames: string[]) {
  const {
    showLegend,
    legendPosition,
    selectAll,
    fontFamily,
    fontSize,
    color
  } = legendConfig

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
      positions = { left: 8, top: 16, bottom: 24, width: 96 }
      break
    default:
      orient = { orient: 'vertical' }
      positions = { right: 8, top: 16, bottom: 24, width: 96 }
      break
  }

  const selected = {
    selected: seriesNames.reduce((obj, name) => ({
      ...obj,
      [name]: selectAll
    }), {})
  }

  return {
    show: showLegend && seriesNames.length > 1,
    data: seriesNames,
    type: 'scroll',
    textStyle: {
      fontFamily,
      fontSize,
      color
    },
    ...orient,
    ...positions,
    ...selected
  }
}

export function getGridPositions (
  legendConfig: Partial<ILegendConfig>,
  seriesNames,
  chartName?: string,
  isHorizontalBar?: boolean,
  yAxisConfig?: IAxisConfig,
  dimetionAxisConfig?: IAxisConfig,
  xAxisData?: string[]
) {
  const { showLegend, legendPosition, fontSize } = legendConfig
  return CHART_LEGEND_POSITIONS.reduce((grid, pos) => {
    const val = pos.value
    grid[val] = getGridBase(val, chartName, dimetionAxisConfig, xAxisData, isHorizontalBar, yAxisConfig)
    if (showLegend && seriesNames.length > 1) {
      grid[val] += legendPosition === val
        ? ['top', 'bottom'].includes(val)
          ? 64
          : 64 + Math.max(...seriesNames.map((s) => getTextWidth(s, '', `${fontSize}px`)))
        : 0
    }
    return grid
  }, {})
}

function getGridBase (pos, chartName, dimetionAxisConfig?: IAxisConfig, xAxisData?: string[], isHorizontalBar?: boolean, yAxisConfig?: IAxisConfig) {
  const labelFontSize = dimetionAxisConfig ? dimetionAxisConfig.labelFontSize : 12
  const xAxisRotate = dimetionAxisConfig ? dimetionAxisConfig.xAxisRotate : 0
  const maxWidth = xAxisData && xAxisData.length
    ? Math.max(...xAxisData.map((s) => getTextWidth(s, '', `${labelFontSize}px`)))
    : 0

  const bottomDistance = dimetionAxisConfig && dimetionAxisConfig.showLabel
    ? isHorizontalBar
      ? 50
      : xAxisRotate
        ? 50 + Math.sin(xAxisRotate * Math.PI / 180) * maxWidth
        : 50
    : 50

  const yAxisConfigLeft = yAxisConfig && !yAxisConfig.showLabel && !yAxisConfig.showTitleAndUnit ? 24 : 64
  const leftDistance = dimetionAxisConfig && dimetionAxisConfig.showLabel
    ? isHorizontalBar
      ? xAxisRotate === void 0
        ? 64
        : 24 + Math.cos(xAxisRotate * Math.PI / 180) * maxWidth
      : yAxisConfigLeft
    : isHorizontalBar ? 24 : yAxisConfigLeft

  switch (pos) {
    case 'top': return 24
    case 'left': return leftDistance
    case 'right': return chartName === 'doubleYAxis' ? 64 : 24
    case 'bottom': return bottomDistance
  }
}

export function makeGrouped (data, groupColumns, xAxisColumn, metrics, xAxisData) {
  const grouped = {}
  const colKeySet = new Set()

  data.forEach((d) => {
    const groupingKey = groupColumns.map((col) => d[col]).join(' ')
    const colKey = d[xAxisColumn] || 'default'
    colKeySet.add(colKey)
    if (!grouped[groupingKey]) {
      grouped[groupingKey] = {}
    }
    if (!grouped[groupingKey][colKey]) {
      grouped[groupingKey][colKey] = []
    }
    grouped[groupingKey][colKey].push(d)
  })

  const colKeys = Array.from(colKeySet)
  Object.keys(grouped).map((groupingKey) => {
    const currentGroupValues = grouped[groupingKey]

    grouped[groupingKey] = xAxisData.length
      ? xAxisData.map((xd) => {
        if (currentGroupValues[xd]) {
          return currentGroupValues[xd][0]
        } else {
          return metrics.reduce((obj, m) => ({ ...obj, [`${m.agg}(${decodeMetricName(m.name)})`]: 0 }), {
            [xAxisColumn]: xd,
            // []: groupingKey
          })
        }
      })
      : [currentGroupValues['default'][0]]
  })

  return grouped
}

export function distinctXaxis (data, xAxisColumn) {
  return xAxisColumn
    ? Object.keys(data.reduce((distinct, ds) => {
      if (!distinct[ds[xAxisColumn]]) {
        distinct[ds[xAxisColumn]] = true
      }
      return distinct
    }, {}))
    : []
}

export function getSymbolSize (sizeRate, size) {
  return sizeRate ? Math.ceil(size / sizeRate) : size
}
