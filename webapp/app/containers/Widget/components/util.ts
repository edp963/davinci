import moment from 'moment'
import Message from 'antd/lib/message'
import {
  DEFAULT_SPLITER,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_FONT_FAMILY,
  PIVOT_CELL_PADDING,
  PIVOT_CELL_BORDER,
  PIVOT_LINE_HEIGHT,
  PIVOT_MAX_CONTENT_WIDTH,
  PIVOT_CHART_ELEMENT_MIN_WIDTH,
  PIVOT_CHART_ELEMENT_MAX_WIDTH,
  PIVOT_CHART_METRIC_AXIS_MIN_SIZE,
  PIVOT_CHART_POINT_LIMIT,
  PIVOT_BORDER,
  PIVOT_XAXIS_SIZE,
  PIVOT_YAXIS_SIZE,
  PIVOT_TITLE_SIZE,
  PIVOT_XAXIS_ROTATE_LIMIT,
  PIVOT_XAXIS_TICK_SIZE,
  PIVOT_CANVAS_AXIS_SIZE_LIMIT,
  PIVOT_DEFAULT_SCATTER_SIZE_TIMES
} from '../../../globalConstants'
import { IQueryVariableMap } from '../../Dashboard/Grid'
import { DimetionType, IChartStyles, IChartInfo } from './Widget'
import { IChartLine, IChartUnit } from './Pivot/Chart'
import { IDataParamSource } from './Workbench/Dropbox'
import { IFieldConfig } from './Workbench/FieldConfig'
import { IFieldFormatConfig } from './Workbench/FormatConfigModal'
import widgetlibs from '../config'
import PivotTypes from '../config/pivot/PivotTypes'
import ChartTypes from '../config/chart/ChartTypes'
const pivotlibs = widgetlibs['pivot']
const chartlibs = widgetlibs['chart']
import { uuid } from '../../../utils/util'

export function getAggregatorLocale (agg) {
  switch (agg) {
    case 'sum': return '总计'
    case 'avg': return '平均数'
    case 'count': return '计数'
    case 'COUNTDISTINCT': return '去重计数'
    case 'max': return '最大值'
    case 'min': return '最小值'
    case 'median': return '中位数'
    case 'percentile': return '百分位'
    case 'stddev': return '标准偏差'
    case 'var': return '方差'
  }
}

export function encodeMetricName (name) {
  return `${name}${DEFAULT_SPLITER}${uuid(8, 16)}`
}

export function decodeMetricName (encodedName) {
  return encodedName.split(DEFAULT_SPLITER)[0]
}

export function spanSize (arr, i, j) {
  if (i !== 0) {
    let noDraw = true
    for (let x = 0; x <= j; x += 1) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false
      }
    }
    if (noDraw) {
      return -1
    }
  }

  let len = 0
  while (i + len < arr.length) {
    let stop = false
    for (let x = 0; x <= j; x += 1) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true
      }
    }
    if (stop) {
      break
    }
    len++
  }
  return len
}

export function naturalSort (a, b): number {
  const rx = /(\d+)|(\D+)/g
  const rd = /\d/
  const rz = /^0/

  if ((b != null) && (a == null)) {
    return -1
  }
  if ((a != null) && (b == null)) {
    return 1
  }
  if (typeof a === 'number' && isNaN(a)) {
    return -1
  }
  if (typeof b === 'number' && isNaN(b)) {
    return 1
  }
  const na = +a
  const nb = +b
  if (na < nb) {
    return -1
  }
  if (na > nb) {
    return 1
  }
  if (typeof a === 'number' && typeof b !== 'number') {
    return -1
  }
  if (typeof b === 'number' && typeof a !== 'number') {
    return 1
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return 0
  }
  if (isNaN(nb) && !isNaN(na)) {
    return -1
  }
  if (isNaN(na) && !isNaN(nb)) {
    return 1
  }
  const sa = String(a)
  const sb = String(b)
  if (sa === sb) {
    return 0
  }
  if (!(rd.test(sa) && rd.test(sb))) {
    return (sa > sb
      ? 1
      : -1)
  }
  const ra = sa.match(rx)
  const rb = sb.match(rx)
  while (ra.length && rb.length) {
    const a1 = ra.shift()
    const b1 = rb.shift()
    if (a1 !== b1) {
      if (rd.test(a1) && rd.test(b1)) {
        return Number(a1.replace(rz, '.0')) - Number(b1.replace(rz, '.0'))
      } else {
        return (a1 > b1
          ? 1
          : -1)
      }
    }
  }
  return ra.length - rb.length
}

let utilCanvas = null

export const getTextWidth = (
  text: string,
  fontWeight: string = DEFAULT_FONT_WEIGHT,
  fontSize: string = DEFAULT_FONT_SIZE,
  fontFamily: string = DEFAULT_FONT_FAMILY
): number => {
  const canvas = utilCanvas || (utilCanvas = document.createElement('canvas'))
  const context = canvas.getContext('2d')
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`
  const metrics = context.measureText(text)
  return Math.ceil(metrics.width)
}

export const getPivotContentTextWidth = (
  text: string,
  fontWeight: string = DEFAULT_FONT_WEIGHT,
  fontSize: string = DEFAULT_FONT_SIZE,
  fontFamily: string = DEFAULT_FONT_FAMILY
): number => {
  return Math.min(getTextWidth(text, fontWeight, fontSize, fontFamily), PIVOT_MAX_CONTENT_WIDTH)
}

export function getPivotCellWidth (width: number): number {
  return width + PIVOT_CELL_PADDING * 2 + PIVOT_CELL_BORDER * 2
}

export function getPivotCellHeight (height?: number): number {
  return (height || PIVOT_LINE_HEIGHT) + PIVOT_CELL_PADDING * 2 + PIVOT_CELL_BORDER
}

export const getTableBodyWidth = (direction: DimetionType, containerWidth, rowHeaderWidths) => {
  const title = rowHeaderWidths.length && PIVOT_TITLE_SIZE
  const rowHeaderWidthSum = direction === 'row'
    ? rowHeaderWidths.slice(0, rowHeaderWidths.length - 1).reduce((sum, r) => sum + getPivotCellWidth(r), 0)
    : rowHeaderWidths.reduce((sum, r) => sum + getPivotCellWidth(r), 0)
  return containerWidth - PIVOT_BORDER * 2 - rowHeaderWidthSum - PIVOT_YAXIS_SIZE - title
}

export const getTableBodyHeight = (direction: DimetionType, containerHeight, columnHeaderCount) => {
  const title = columnHeaderCount && PIVOT_TITLE_SIZE
  const realColumnHeaderCount = direction === 'col' ? Math.max(columnHeaderCount - 1, 0) : columnHeaderCount
  return containerHeight - PIVOT_BORDER * 2 - realColumnHeaderCount * getPivotCellHeight() - PIVOT_XAXIS_SIZE - title
}

export function getChartElementSize (
  direction: DimetionType,
  tableBodySideLength: number[],
  chartElementCountArr: number[],
  multiCoordinate: boolean
): number {
  let chartElementCount
  let side

  if (direction === 'col') {
    chartElementCount = Math.max(1, chartElementCountArr[0])
    side = tableBodySideLength[0]
  } else {
    chartElementCount = Math.max(1, chartElementCountArr[1])
    side = tableBodySideLength[1]
  }

  const sizePerElement = side / chartElementCount
  const limit = multiCoordinate ? PIVOT_CHART_METRIC_AXIS_MIN_SIZE : PIVOT_CHART_ELEMENT_MIN_WIDTH

  return Math.max(Math.floor(sizePerElement), limit)
}

export function shouldTableBodyCollapsed (
  direction: DimetionType,
  elementSize: number,
  tableBodyHeight: number,
  rowKeyLength: number
): boolean {
  return direction === 'row' && tableBodyHeight > rowKeyLength * elementSize
}

export function getChartUnitMetricWidth (tableBodyWidth, colKeyCount: number, metricCount: number): number {
  const realContainerWidth = Math.max(tableBodyWidth, colKeyCount * metricCount * PIVOT_CHART_METRIC_AXIS_MIN_SIZE)
  return realContainerWidth / colKeyCount / metricCount
}

export function getChartUnitMetricHeight (tableBodyHeight, rowKeyCount: number, metricCount: number): number {
  const realContainerHeight = Math.max(tableBodyHeight, rowKeyCount * metricCount * PIVOT_CHART_METRIC_AXIS_MIN_SIZE)
  return realContainerHeight / rowKeyCount / metricCount
}

export function checkChartEnable (dimetionsCount: number, metricsCount: number, charts: IChartInfo | IChartInfo[]): boolean {
  const chartArr = Array.isArray(charts) ? charts : [charts]
  for (const chart of chartArr) {
    const { requireDimetions, requireMetrics } = chart
    if (Array.isArray(requireDimetions)) {
      if (dimetionsCount < requireDimetions[0] || dimetionsCount > requireDimetions[1]) {
        return false
      }
    } else {
      if (dimetionsCount !== requireDimetions) {
        return false
      }
    }
    if (Array.isArray(requireMetrics)) {
      if (metricsCount < requireMetrics[0] || metricsCount > requireMetrics[1]) {
        return false
      }
    } else {
      if (metricsCount !== requireMetrics) {
        return false
      }
    }
  }
  return true
}

export function getAxisInterval (max, splitNumber) {
  const roughInterval = Math.floor(max / splitNumber)
  const divisor = Math.pow(10, (`${roughInterval}`.length - 1))
  return (Math.floor(roughInterval / divisor) + 1) * divisor
}

export function getChartPieces (total, lines) {
  if (lines === 1) {
    return lines
  }
  const eachLine = total / lines
  const pct = Math.abs(eachLine - PIVOT_CHART_POINT_LIMIT) / PIVOT_CHART_POINT_LIMIT
  return pct < 0.2
    ? lines
    : eachLine > PIVOT_CHART_POINT_LIMIT
      ? lines
      : getChartPieces(total, Math.round(lines / 2))

}

export function metricAxisLabelFormatter (value) {
  if (value >= Math.pow(10, 9) && value < Math.pow(10, 12)) {
    return `${precision(value / Math.pow(10, 9))}B`
  } else if (value >= Math.pow(10, 6) && value < Math.pow(10, 9)) {
    return `${precision(value / Math.pow(10, 6))}M`
  } else if (value >= Math.pow(10, 3) && value < Math.pow(10, 6)) {
    return `${precision(value / Math.pow(10, 3))}K`
  } else {
    return value
  }

  function precision (num) {
    return num >= 10 ? Math.floor(num) : num.toFixed(1)
  }
}

export function getPivot (): IChartInfo {
  return pivotlibs.find((p) => p.id === PivotTypes.PivotTable)
}

export function getTable (): IChartInfo {
  return chartlibs.find((c) => c.id === ChartTypes.Table)
}

export function getPivotModeSelectedCharts (items: IDataParamSource[]): IChartInfo[] {
  return items.length ? items.map((i) => i.chart) : [getPivot()]
}

export function getStyleConfig (chartStyles: IChartStyles): IChartStyles {
  return {
    ...chartStyles,
    pivot: chartStyles.pivot || {...getPivot().style['pivot']}  // FIXME 兼容0.3.0-beta 数据库
  }
}

export function getChartViewMetrics (metrics, requireMetrics) {
  const auxiliaryMetrics = Math.max((Array.isArray(requireMetrics) ? requireMetrics[0] : requireMetrics) - 1, 0)
  metrics.slice().splice(1, auxiliaryMetrics)
  return metrics
}

export function getAxisData (type: 'x' | 'y', rowKeys, colKeys, rowTree, colTree, tree, metrics, drawingData, dimetionAxis) {
  const { elementSize, unitMetricWidth, unitMetricHeight } = drawingData
  const data: IChartLine[] = []
  const chartLine: IChartUnit[] = []
  let axisLength = 0

  let renderKeys
  let renderTree
  let sndKeys
  let sndTree
  let renderDimetionAxis
  let unitMetricSide

  if (type === 'x') {
    renderKeys = colKeys
    renderTree = colTree
    sndKeys = rowKeys
    sndTree = rowTree
    renderDimetionAxis = 'col'
    unitMetricSide = unitMetricWidth
  } else {
    renderKeys = rowKeys
    renderTree = rowTree
    sndKeys = colKeys
    sndTree = colTree
    renderDimetionAxis = 'row'
    unitMetricSide = unitMetricHeight
  }

  if (renderKeys.length) {
    renderKeys.forEach((keys, i) => {
      const flatKey = keys.join(String.fromCharCode(0))
      const { records } = renderTree[flatKey]

      if (dimetionAxis === renderDimetionAxis) {
        const nextKeys = renderKeys[i + 1] || []
        let lastUnit = chartLine[chartLine.length - 1]
        if (!lastUnit || lastUnit.ended) {
          lastUnit = {
            width: 0,
            records: [],
            ended: false
          }
          chartLine.push(lastUnit)
        }
        lastUnit.records.push({
          key: keys[keys.length - 1],
          value: records[0]
        })
        if (keys.length === 1 && i === renderKeys.length - 1 ||
            keys[keys.length - 2] !== nextKeys[nextKeys.length - 2]) {
          const unitLength = lastUnit.records.length * elementSize
          axisLength += unitLength
          lastUnit.width = unitLength
          lastUnit.ended = true
        }
        if (!nextKeys.length) {
          data.push({
            key: flatKey,
            data: chartLine.slice()
          })
        }
      } else {
        axisLength += unitMetricSide
        chartLine.push({
          width: unitMetricSide,
          records: [{
            key: keys[keys.length - 1],
            value: records[0]
          }],
          ended: true
        })
        if (i === renderKeys.length - 1) {
          data.push({
            key: flatKey,
            data: chartLine.slice()
          })
        }
      }
    })
  } else {
    if (dimetionAxis !== renderDimetionAxis) {
      data.push({
        key: uuid(8, 16),
        data: [{
          width: unitMetricSide,
          records: [{
            key: '',
            value: sndKeys.length ? Object.values(sndTree)[0] : tree[0] ? tree[0][0] : []
          }],
          ended: true
        }]
      })
      axisLength = unitMetricSide
    }
  }

  axisLength = dimetionAxis === renderDimetionAxis ? axisLength : axisLength * metrics.length

  return {
    data: axisDataCutting(type, dimetionAxis, metrics, axisLength, data),
    length: axisLength
  }
}

export function axisDataCutting (type: 'x' | 'y', dimetionAxis, metrics, axisLength, data) {
  if (axisLength > PIVOT_CANVAS_AXIS_SIZE_LIMIT) {
    const result = []
    data.forEach((line) => {
      let blockLine = {
        key: `${uuid(8, 16)}${line.key}`,
        data: []
      }
      let block = {
        key: '',
        length: 0,
        data: [blockLine]
      }
      line.data.forEach((unit, index) => {
        const unitWidth = type === 'x' && dimetionAxis === 'row' || type === 'y' && dimetionAxis === 'col'
          ? unit.width * metrics.length
          : unit.width
        if (block.length + unitWidth > PIVOT_CANVAS_AXIS_SIZE_LIMIT) {
          block.key = `${index}${block.data.map((d) => d.key).join(',')}`
          result.push(block)
          blockLine = {
            key: `${uuid(8, 16)}${line.key}`,
            data: []
          }
          block = {
            key: '',
            length: 0,
            data: [blockLine]
          }
        }
        block.length += unitWidth
        blockLine.data.push(unit)
        if (index === line.data.length - 1) {
          block.key = `${index}${block.data.map((d) => d.key).join(',')}`
          result.push(block)
        }
      })
    })
    return result
  } else {
    return [{
      key: 'block',
      data,
      length: axisLength
    }]
  }
}

export function getXaxisLabel (elementSize) {
  return function (label) {
    const originLabel = label
    const ellipsis = '…'
    const limit = elementSize > PIVOT_XAXIS_ROTATE_LIMIT ? elementSize : PIVOT_XAXIS_SIZE - PIVOT_XAXIS_TICK_SIZE
    while (getTextWidth(label) > limit) {
      label = label.substring(0, label.length - 1)
    }
    return label === originLabel
      ? label
      : `${label.substring(0, label.length - 1)}${ellipsis}`
  }
}

export function getTooltipPosition (point, params, dom, rect, size) {
  const [x, y] = point
  const { contentSize, viewSize } = size
  const [cx, cy] = contentSize
  const [vx, vy] = viewSize

  const distanceXToMouse = 10
  return [
    x + cx + distanceXToMouse > vx ? x - distanceXToMouse - cx : x + distanceXToMouse,
    // Math.min(x, vx - cx),
    Math.min(y, vy - cy)
  ]
}

export function getPivotTooltipLabel (seriesData, cols, rows, metrics, color, label, size, scatterXAxis, tip) {
  let dimetionColumns = cols.concat(rows)
  let metricColumns = [...metrics]
  if (color) {
    dimetionColumns = dimetionColumns.concat(color.items.map((i) => i.name))
  }
  if (label) {
    dimetionColumns = dimetionColumns.concat(
      label.items.filter((i) => i.type === 'category').map((i) => i.name)
    )
    metricColumns = metricColumns.concat(
      label.items.filter((i) => i.type === 'value')
    )
  }
  if (size) {
    metricColumns = metricColumns.concat(size.items)
  }
  if (scatterXAxis) {
    metricColumns = metricColumns.concat(scatterXAxis.items)
  }
  if (tip) {
    metricColumns = metricColumns.concat(tip.items)
  }

  dimetionColumns = dimetionColumns.reduce((arr, dc) => {
    if (!arr.includes(dc)) {
      arr.push(dc)
    }
    return arr
  }, [])
  metricColumns = metricColumns.reduce((arr, mc) => {
    const decodedName = decodeMetricName(mc.name)
    if (!arr.find((m) => m.name.includes(decodedName) && m.agg === mc.agg)) {
      arr.push(mc)
    }
    return arr
  }, [])

  return function (params) {
    const record = getTriggeringRecord(params, seriesData)
    return metricColumns
      .map((mc) => {
        const decodedName = decodeMetricName(mc.name)
        const value = record
          ? Array.isArray(record)
            ? record.reduce((sum, r) => sum + r[`${mc.agg}(${decodedName})`], 0)
            : record[`${mc.agg}(${decodedName})`]
          : 0
        return `${decodedName}: ${value}`
      })
      .concat(dimetionColumns.map((dc) => {
        const value = record
          ? Array.isArray(record)
            ? record[0][dc]
            : record[dc]
          : ''
        return `${dc}: ${value}`
      }))
      .join('<br/>')
  }
}

export function getChartTooltipLabel (type, seriesData, options) {
  const { cols, metrics, color, size, scatterXAxis, tip } = options
  let dimetionColumns = cols.map((c) => c.name)
  let metricColumns = [...metrics]
  if (color) {
    dimetionColumns = dimetionColumns.concat(color.items.map((i) => i.name))
  }
  if (size) {
    metricColumns = metricColumns.concat(size.items)
  }
  if (scatterXAxis) {
    metricColumns = metricColumns.concat(scatterXAxis.items)
  }
  if (tip) {
    metricColumns = metricColumns.concat(tip.items)
  }

  dimetionColumns = dimetionColumns.reduce((arr, dc) => {
    if (!arr.includes(dc)) {
      arr.push(dc)
    }
    return arr
  }, [])
  metricColumns = metricColumns.reduce((arr, mc) => {
    const decodedName = decodeMetricName(mc.name)
    if (!arr.find((m) => m.name.includes(decodedName) && m.agg === mc.agg)) {
      arr.push(mc)
    }
    return arr
  }, [])

  return function (params) {
    const { seriesIndex, dataIndex } = params
    const record = (type === 'funnel' || type === 'map')
      ? seriesData[dataIndex]
      : seriesData[seriesIndex][dataIndex]
    return dimetionColumns
      .map((dc) => {
        const value = record
          ? Array.isArray(record)
            ? record[0][dc]
            : record[dc]
          : ''
        return `${dc}: ${value}`
      })
      .concat(metricColumns.map((mc) => {
        const decodedName = decodeMetricName(mc.name)
        const value = record
          ? Array.isArray(record)
            ? record.reduce((sum, r) => sum + r[`${mc.agg}(${decodedName})`], 0)
            : record[`${mc.agg}(${decodedName})`]
          : 0
        return `${decodedName}: ${value}`
      }))
      .join('<br/>')
  }
}

export function getChartLabel (seriesData, labelItem) {
  return function (params) {
    const record = getTriggeringRecord(params, seriesData) || {}
    return labelItem.type === 'category'
      ? Array.isArray(record)
        ? record[0][labelItem.name]
        : (record[labelItem.name] || '')
      : Array.isArray(record)
        ? record.reduce((sum, r) => sum + r[`${labelItem.agg}(${decodeMetricName(labelItem.name)})`], 0)
        : (record[`${labelItem.agg}(${decodeMetricName(labelItem.name)})`] || 0)
  }
}

export function getTriggeringRecord (params, seriesData) {
  const { seriesIndex, dataIndex } = params
  const { type, grouped, records } = seriesData[seriesIndex]
  let record
  if (type === 'cartesian') {
    record = grouped
      ? records[dataIndex]
      : records[dataIndex].value
  } else if (type === 'polar') {
    record = records[dataIndex]
  } else {
    record = records ? records[0] : {}
  }
  return record
}

export function getSizeRate (min, max) {
  return Math.max(min / 10, max / 100)
}

export function getSizeValue (value) {
  return value >= PIVOT_DEFAULT_SCATTER_SIZE_TIMES
    ? value - PIVOT_DEFAULT_SCATTER_SIZE_TIMES + 1
    : 1 / Math.pow(2, PIVOT_DEFAULT_SCATTER_SIZE_TIMES - value)
}

export enum NumericUnit {
  None = '无',
  TenThousand = '万',
  OneHundredMillion = '亿',
  Thousand = 'k',
  Million = 'M',
  Giga = 'G'
}

export enum FieldFormatTypes {
  Default = 'default',
  Numeric = 'numeric',
  Currency = 'currency',
  Percentage = 'percentage',
  ScientificNotation = 'scientificNotation',
  Date = 'date',
  Custom = 'custom'
}

export const AvailableFieldFormatTypes = {
  [FieldFormatTypes.Default]: '默认',
  [FieldFormatTypes.Numeric]: '数值',
  [FieldFormatTypes.Currency]: '货币',
  [FieldFormatTypes.Percentage]: '百分比',
  [FieldFormatTypes.ScientificNotation]: '科学型',
  [FieldFormatTypes.Date]: '日期',
  [FieldFormatTypes.Custom]: '自定义'
}

export function getFormattedValue (value: number | string, format: IFieldFormatConfig) {
  if (!format) { return value }

  const { formatType } = format
  const config = format[formatType]
  let formattedValue

  switch (formatType) {
    case FieldFormatTypes.Numeric:
    case FieldFormatTypes.Currency:
      const {
        decimalPlaces,
        unit,
        useThousandSeparator } = config as IFieldFormatConfig['numeric'] | IFieldFormatConfig['currency']
      formattedValue = formatByUnit(value, unit)
      formattedValue = formartByDecimalPlaces(formattedValue, decimalPlaces)
      formattedValue = formatByThousandSeperator(formattedValue, useThousandSeparator)
      if (unit !== NumericUnit.None) {
        formattedValue = `${formattedValue}${unit}`
      }
      if (formatType === FieldFormatTypes.Currency) {
        const { prefix, suffix } = config as IFieldFormatConfig['currency']
        formattedValue = [prefix, formattedValue, suffix].join('')
      }
      break
    case FieldFormatTypes.Percentage:
      formattedValue = (+value) * 100
      formattedValue = isNaN(formattedValue) ? value
        : `${formartByDecimalPlaces(formattedValue, (config as IFieldFormatConfig['percentage']).decimalPlaces)}%`
      break
    case FieldFormatTypes.ScientificNotation:
      formattedValue = (+value).toExponential((config as IFieldFormatConfig['scientificNotation']).decimalPlaces)
      formattedValue = isNaN(formattedValue) ? value : formattedValue
      break
    case FieldFormatTypes.Date:
      const { format } = config as IFieldFormatConfig['date']
      formattedValue = moment(value).format(format)
      break
    case FieldFormatTypes.Custom:
      // @TODO
      break
    default:
      formattedValue = value
      break
  }

  return formattedValue
}

function formartByDecimalPlaces (value, decimalPlaces: number) {
  if (isNaN(value)) { return value }
  if (decimalPlaces < 0 || decimalPlaces > 100) { return value }

  return (+value).toFixed(decimalPlaces)
}

function formatByThousandSeperator (value, useThousandSeparator: boolean) {
  if (isNaN(+value) || !useThousandSeparator) { return value }

  const parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = parts.join('.')
  return formatted
}

function formatByUnit (value, unit: NumericUnit) {
  const numericValue = +value
  if (isNaN(numericValue)) { return value }

  let exponent = 0
  switch (unit) {
    case NumericUnit.TenThousand:
      exponent = 4
      break
    case NumericUnit.OneHundredMillion:
      exponent = 8
      break
    case NumericUnit.Thousand:
      exponent = 3
      break
    case NumericUnit.Million:
      exponent = 6
      break
    case NumericUnit.Giga:
      exponent = 9
      break
  }
  return numericValue / Math.pow(10, exponent)
}

export function extractQueryVariableNames (expression: string, withBoundaryToken: boolean = false) {
  const names = []
  if (!expression) { return names }
  const varReg = /\$(\w+)\$/g
  expression.replace(varReg, (match: string, p: string) => {
    const name = withBoundaryToken ? match : p
    if (!names.includes(name)) {
      names.push(name)
    }
    return name
  })
  return names
}

export function getFieldAlias (fieldConfig: IFieldConfig, queryVariableMap: IQueryVariableMap) {
  if (!fieldConfig) { return '' }

  const { alias, useExpression } = fieldConfig
  if (!useExpression) { return alias }

  const queryKeys = extractQueryVariableNames(alias, true)
  const keys = []
  const vals = []
  queryKeys.forEach((queryKey) => {
    keys.push(queryKey)
    const queryValue = queryVariableMap[queryKey]
    if (queryValue === undefined) {
      vals.push('')
    } else {
      vals.push(queryValue)
    }
  })

  const Moment = moment
  let funcBody = alias
  if (!alias.includes('return')) {
    funcBody = 'return ' + funcBody
  }
  const paramNames = ['Moment', ...keys, funcBody]
  try {
    const func = Function.apply(null, paramNames)
    const params = [Moment, ...vals]
    const dynamicAlias: string = func(...params)
    return dynamicAlias
  } catch (e) {
    Message.error(`字段别名转换错误：${e.message}`)
  }
}

export const iconMapping = {
  line: 'icon-chart-line',
  bar: 'icon-chart-bar',
  scatter: 'icon-scatter-chart',
  pie: 'icon-chartpie',
  area: 'icon-area-chart',
  sankey: 'icon-kongjiansangjitu',
  funnel: 'icon-iconloudoutu',
  treemap: 'icon-chart-treemap',
  wordCloud: 'icon-chartwordcloud',
  table: 'icon-table',
  scorecard: 'icon-calendar1',
  text: 'icon-text',
  map: 'icon-china',
  doubleYAxis: 'icon-duplex',
  boxplot: 'icon-508tongji_xiangxiantu',
  markBoxplot: 'icon-508tongji_xiangxiantu',
  graph: 'icon-510tongji_guanxitu',
  waterfall: 'icon-waterfall',
  gauge: 'icon-gauge',
  radar: 'icon-radarchart',
  parallel: 'icon-parallel',
  confidenceBand: 'icon-confidence-band'
}
