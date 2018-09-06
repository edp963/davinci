import * as React from 'react'
import { findDOMNode } from 'react-dom'
import {
  naturalSort,
  decodeMetricName,
  getPivotContentTextWidth,
  getTableBodyWidth,
  getTableBodyHeight,
  getChartElementSize,
  shouldTableBodyCollapsed,
  getChartUnitMetricWidth,
  getChartUnitMetricHeight,
  getAxisInterval,
  getTextWidth,
  getBar
} from '../util'
import {
  PIVOT_LINE_HEIGHT,
  PIVOT_CHART_SPLIT_SIZE,
  PIVOT_LEGEND_ITEM_PADDING,
  PIVOT_LEGEND_PADDING
} from '../../../../globalConstants'
import Corner from './Corner'
import RowTitle from './RowTitle'
import RowHeader from './RowHeader'
import RowFooter from './RowFooter'
import ColumnTitle from './ColumnTitle'
import ColumnHeader from './ColumnHeader'
import TableBody from './TableBody'
import ColumnFooter from './ColumnFooter'
import Legend from './Legend'
import { IChartInfo } from './Chart'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { AggregatorType, DragType, IDataParamConfig } from '../Workbench/Dropbox'

const styles = require('./Pivot.less')

export type DimetionType = 'row' | 'col'
export type RenderType = 'rerender' | 'clear' | 'refresh' | 'resize'

export interface IPivotMetric {
  name: string
  agg: AggregatorType
  chart: IChartInfo
}

export interface IPivotFilter {
  name: string
  type: DragType
  config: IDataParamConfig
}

export interface IDrawingData {
  elementSize: number
  unitMetricWidth: number
  unitMetricHeight: number
  tableBodyCollapsed: boolean
  multiCoordinate: boolean
  sizeRate: {[key: string]: number}
}

export interface IMetricAxisConfig {
  min: number
  max: number
  interval: number
}

export interface ILegend {
  [key: string]: string[]
}

export interface IPivotProps {
  data: object[]
  cols: string[]
  rows: string[]
  chart?: any
  metrics: IPivotMetric[]
  filters: IPivotFilter[]
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  dimetionAxis?: DimetionType
  renderType?: RenderType
}

export interface IPivotStates {
  legendSelected: ILegend
  renderType: RenderType
}

export class Pivot extends React.PureComponent<IPivotProps, IPivotStates> {
  constructor (props) {
    super(props)
    this.state = {
      legendSelected: {},
      renderType: 'rerender'
    }
  }

  private width = 0
  private height = 0
  private tableBodyWidth = 0
  private tableBodyHeight = 0
  private rowKeys = []
  private colKeys = []
  private rowTree = {}
  private colTree = {}
  private tree = {}

  private rowHeaderWidths = []
  private drawingData: IDrawingData = {
    elementSize: 0,
    unitMetricWidth: 0,
    unitMetricHeight: 0,
    tableBodyCollapsed: false,
    multiCoordinate: false,
    sizeRate: {}
  }
  private min = []
  private max = []
  private scatterMin = []
  private scatterMax = []
  private sizeMin = []
  private sizeMax = []
  private metricAxisConfig: IMetricAxisConfig = void 0
  private scatterXaxisConfig: IMetricAxisConfig = void 0

  public rowHeader: HTMLElement = null
  public columnHeader: HTMLElement = null
  public tableBody: HTMLElement = null
  public columnFooter: HTMLElement = null
  private container: HTMLElement = null
  private legend: HTMLElement = null

  public componentDidMount () {
    this.getContainerSize()
  }

  public componentWillReceiveProps (nextProps) {
    this.setState({
      renderType: nextProps.renderType
    })
  }

  public componentWillUpdate (nextProps: IPivotProps) {
    const { renderType } = nextProps
    if (renderType !== 'refresh') {
      if (renderType === 'resize') {
        this.getContainerSize()
      }
      this.rowKeys = []
      this.colKeys = []
      this.rowTree = {}
      this.colTree = {}
      this.tree = {}
      this.drawingData = {
        elementSize: 0,
        unitMetricWidth: 0,
        unitMetricHeight: 0,
        tableBodyCollapsed: false,
        multiCoordinate: false,
        sizeRate: {}
      }
      this.min = []
      this.max = []
      this.scatterMin = []
      this.scatterMax = []
      this.sizeMin = []
      this.sizeMax = []
      this.metricAxisConfig = void 0
      this.scatterXaxisConfig = void 0
      this.getRenderData(nextProps)
      this.rowHeader.scrollTop = 0
      this.columnHeader.scrollLeft = 0
      this.tableBody.scrollTop = this.tableBody.scrollLeft = 0
    }
  }

  public componentWillUnmount () {
    this.rowKeys = []
    this.colKeys = []
    this.rowHeaderWidths = []
    this.rowTree = {}
    this.colTree = {}
    this.tree = {}
    this.drawingData = {
      elementSize: 0,
      unitMetricWidth: 0,
      unitMetricHeight: 0,
      tableBodyCollapsed: false,
      multiCoordinate: false,
      sizeRate: {}
    }
    this.min = []
    this.max = []
    this.scatterMin = []
    this.scatterMax = []
    this.sizeMin = []
    this.sizeMax = []
    this.metricAxisConfig = void 0
    this.scatterXaxisConfig = void 0
  }

  private getContainerSize = () => {
    const { offsetWidth, offsetHeight } = this.container
    this.width = offsetWidth
    this.height = offsetHeight
  }

  private getRenderData = (props) => {
    const { cols, rows, metrics, data, xAxis, size, dimetionAxis } = props

    this.rowHeaderWidths = rows.map((r) => getPivotContentTextWidth(r, 'bold'))
    if (!cols.length && !rows.length) {
      this.tree[0] = data.slice()
      this.getMetricsMinAndMaxValue(metrics, data)
      if (xAxis) {
        this.getScatterXaxisMinAndMaxValue(xAxis, data)
      }
      if (size) {
        this.getSizeMinAndMaxValue(size, data)
      }
    } else {
      data.forEach((record) => {
        this.getRowKeyAndColKey(props, record, !!dimetionAxis)
      })
      this.rowKeys.sort(this.sortingKeys(rows))
      this.colKeys.sort(this.sortingKeys(cols))
    }

    if (dimetionAxis) {
      this.tableBodyWidth = getTableBodyWidth(dimetionAxis, this.width - this.getLegendWidth(props), this.rowHeaderWidths)
      this.tableBodyHeight = getTableBodyHeight(dimetionAxis, this.height, cols.length)
      this.drawingData.unitMetricWidth = getChartUnitMetricWidth(this.tableBodyWidth, this.colKeys.length || 1, metrics.length)
      this.drawingData.unitMetricHeight = getChartUnitMetricHeight(this.tableBodyHeight, this.rowKeys.length || 1, metrics.length)
      this.drawingData.multiCoordinate = metrics.some((m) => m.chart.coordinate === 'polar') || xAxis && xAxis.items.length
      this.drawingData.elementSize = getChartElementSize(
        dimetionAxis,
        [this.tableBodyWidth, this.tableBodyHeight],
        [this.colKeys.length, this.rowKeys.length],
        this.drawingData.multiCoordinate
      )
      this.drawingData.tableBodyCollapsed = shouldTableBodyCollapsed(
        dimetionAxis,
        this.drawingData.elementSize,
        this.tableBodyHeight,
        this.rowKeys.length
      )
      this.drawingData.sizeRate = this.getSizeRate(size, this.sizeMin, this.sizeMax)
      this.metricAxisConfig = metrics.reduce((obj: IMetricAxisConfig, m, i) => {
        const metricName = decodeMetricName(m.name)
        const min = this.min[i] >= 0 ? 0 : this.min[i]
        const max = this.max[i]
        const splitNumber = dimetionAxis === 'col'
          ? Math.ceil(this.drawingData.unitMetricHeight / PIVOT_CHART_SPLIT_SIZE)
          : Math.ceil(this.drawingData.unitMetricWidth / PIVOT_CHART_SPLIT_SIZE)
        const interval = getAxisInterval(max, splitNumber)
        obj[metricName] = {
          min,
          max: interval * splitNumber,
          interval
        }
        return obj
      }, {})
      this.scatterXaxisConfig = xAxis &&
        xAxis.items.reduce((obj: IMetricAxisConfig, x, i) => {
          const itemName = decodeMetricName(x.name)
          const min = this.scatterMin[i] >= 0 ? 0 : this.scatterMin[i]
          const max = this.scatterMax[i]
          const splitNumber = Math.ceil(this.drawingData.elementSize / PIVOT_CHART_SPLIT_SIZE)
          const interval = getAxisInterval(max, splitNumber)
          obj[itemName] = {
            min,
            max: interval * splitNumber,
            interval
          }
          return obj
        }, {})
    }
  }

  private getRowKeyAndColKey = (props: IPivotProps, record: object, hasDimetionAxis: boolean) => {
    const { cols, rows, metrics, size, xAxis } = props

    const rowKey = []

    rows.forEach((r, i) => {
      const value = record[r]
      const textWidth = getPivotContentTextWidth(value, 'bold')
      this.rowHeaderWidths[i] = Math.max(textWidth, this.rowHeaderWidths[i] || 0)
      rowKey.push(value)
    })

    const colKey = cols.map((c) => record[c])

    const flatRowKey = rowKey.join(String.fromCharCode(0))
    const flatColKey = colKey.join(String.fromCharCode(0))

    if (rowKey.length) {
      if (!this.rowTree[flatRowKey]) {
        const height = !hasDimetionAxis && { height: PIVOT_LINE_HEIGHT }
        this.rowTree[flatRowKey] = { ...height, records: [] }
        this.rowKeys.push(rowKey)
      }
      this.rowTree[flatRowKey].records.push(record)

      if (metrics.length) {
        if (!colKey.length) {
          this.getMetricsMinAndMaxValue(metrics, this.rowTree[flatRowKey].records)
          if (xAxis) {
            this.getScatterXaxisMinAndMaxValue(xAxis, this.rowTree[flatRowKey].records)
          }
          if (size) {
            this.getSizeMinAndMaxValue(size, this.rowTree[flatRowKey].records)
          }
        }

        if (!hasDimetionAxis) {
          const cellHeight = (PIVOT_LINE_HEIGHT + 1) * metrics.length - 1
          this.rowTree[flatRowKey].height = cellHeight
        }
      }
    }
    if (colKey.length) {
      if (!this.colTree[flatColKey]) {
        const width = !hasDimetionAxis && { width: Math.max(...colKey.map((c) => getPivotContentTextWidth(c, 'bold'))) }
        const height = !hasDimetionAxis && { height: PIVOT_LINE_HEIGHT }
        this.colTree[flatColKey] = { ...width, ...height, records: [] }
        this.colKeys.push(colKey)
      }
      this.colTree[flatColKey].records.push(record)

      if (metrics.length) {
        if (!rowKey.length) {
          this.getMetricsMinAndMaxValue(metrics, this.colTree[flatColKey].records)
          if (xAxis) {
            this.getScatterXaxisMinAndMaxValue(xAxis, this.colTree[flatColKey].records)
          }
          if (size) {
            this.getSizeMinAndMaxValue(size, this.colTree[flatColKey].records)
          }
        }

        if (!hasDimetionAxis) {
          const maxTextWidth = Math.max(...metrics.map((m) => getPivotContentTextWidth(record[`${m.agg}(${decodeMetricName(m.name)})`])))
          const cellHeight = (PIVOT_LINE_HEIGHT + 1) * metrics.length - 1
          this.colTree[flatColKey].width = Math.max(this.colTree[flatColKey].width, maxTextWidth)
          this.colTree[flatColKey].height = cellHeight
        }
      }
    }
    if (rowKey.length && colKey.length) {
      if (!this.tree[flatRowKey]) {
        this.tree[flatRowKey] = {}
      }
      if (!this.tree[flatRowKey][flatColKey]) {
        this.tree[flatRowKey][flatColKey] = []
      }
      this.tree[flatRowKey][flatColKey].push(record)

      if (metrics.length) {
        this.getMetricsMinAndMaxValue(metrics, this.tree[flatRowKey][flatColKey])
        if (xAxis) {
          this.getScatterXaxisMinAndMaxValue(xAxis, this.tree[flatRowKey][flatColKey])
        }
        if (size) {
          this.getSizeMinAndMaxValue(size, this.tree[flatRowKey][flatColKey])
        }
      }
    }
  }

  private sortingKeys = (keys) => (a, b) => {
    for (let i = 0; i < keys.length; i += 1) {
      const comparison = naturalSort(a[i], b[i])
      if (comparison) {
        return comparison
      }
    }
    return 0
  }

  private getMetricsMinAndMaxValue (metrics, records) {
    metrics.forEach((m, i) => {
      const metricName = decodeMetricName(m.name)
      if (m.chart.id === getBar().id) {
        const metricColumnValue = records.reduce((sum, r) => sum + (Number(r[`${m.agg}(${metricName})`]) || 0), 0)
        this.min[i] = this.min[i] ? Math.min(this.min[i], metricColumnValue) : metricColumnValue
        this.max[i] = this.max[i] ? Math.max(this.max[i], metricColumnValue) : metricColumnValue
      } else {
        const metricColumnValue = records.reduce(([min, max], r) => [
          Math.min(min, (Number(r[`${m.agg}(${metricName})`]) || 0)),
          Math.max(max, (Number(r[`${m.agg}(${metricName})`]) || 0))
        ], [0, 0])
        this.min[i] = this.min[i] ? Math.min(this.min[i], metricColumnValue[0]) : metricColumnValue[0]
        this.max[i] = this.max[i] ? Math.max(this.max[i], metricColumnValue[1]) : metricColumnValue[1]
      }
    })
  }

  private getScatterXaxisMinAndMaxValue (xAxis, records) {
    xAxis.items.forEach((x, i) => {
      const itemName = decodeMetricName(x.name)
      const columnValue = records.reduce(([min, max], r) => [
        Math.min(min, (Number(r[`${x.agg}(${itemName})`]) || 0)),
        Math.max(max, (Number(r[`${x.agg}(${itemName})`]) || 0))
      ], [0, 0])
      this.scatterMin[i] = this.scatterMin[i] ? Math.min(this.scatterMin[i], columnValue[0]) : columnValue[0]
      this.scatterMax[i] = this.scatterMax[i] ? Math.max(this.scatterMax[i], columnValue[1]) : columnValue[1]
    })
  }

  private getSizeMinAndMaxValue (size, records) {
    size.items.forEach((s, i) => {
      const itemName = decodeMetricName(s.name)
      const columnValue = records.reduce(([min, max], r) => [
        Math.min(min, (Number(r[`${s.agg}(${itemName})`]) || 0)),
        Math.max(max, (Number(r[`${s.agg}(${itemName})`]) || 0))
      ], [0, 0])
      this.sizeMin[i] = this.sizeMin[i] ? Math.min(this.sizeMin[i], columnValue[0]) : columnValue[0]
      this.sizeMax[i] = this.sizeMax[i] ? Math.max(this.sizeMax[i], columnValue[1]) : columnValue[1]
      // const columnValue = records.reduce((sum, r) => sum + (Number(r[`${s.agg}(${itemName})`]) || 0), 0)
      // this.sizeMin[i] = this.sizeMin[i] ? Math.min(this.sizeMin[i], columnValue) : columnValue
      // this.sizeMax[i] = this.sizeMax[i] ? Math.max(this.sizeMax[i], columnValue) : columnValue
    })
  }

  private getSizeRate (size, min, max) {
    return size
      ? size.items.reduce((obj, item, index) => {
        console.log(min[index], max[index])
        obj[item.name] = Math.min(10 / min[index], 100 / max[index])
        return obj
      }, {})
      : {}
  }

  private legendSelect = (name, key) => {
    const { legendSelected } = this.state
    if (!legendSelected[name]) {
      legendSelected[name] = []
    }
    legendSelected[name] = legendSelected[name].includes(key)
      ? legendSelected[name].filter((ls) => ls !== key)
      : legendSelected[name].concat(key)
    this.setState({
      legendSelected: {...legendSelected},
      renderType: 'clear'
    })
  }

  private getLegendWidth = (props) => {
    const { color } = props
    if (color) {
      return color.items.reduce((max, item) =>
        Math.max(
          max,
          getTextWidth(item.name),
          Object.keys(item.config.values).reduce((keyMax, key) =>
            Math.max(keyMax, getTextWidth(key))
          , 0) + PIVOT_LEGEND_ITEM_PADDING
        )
      , 0) + PIVOT_LEGEND_PADDING
    }
    return 0
  }

  public render () {
    const { cols, rows, metrics, color, label, size, xAxis, dimetionAxis } = this.props
    const { legendSelected, renderType } = this.state

    return (
      <div className={styles.block} ref={(f) => this.container = f}>
        <div className={styles.leftSide}>
          <Corner
            cols={cols}
            rows={rows}
            rowWidths={this.rowHeaderWidths}
            dimetionAxis={dimetionAxis}
          />
          <div className={styles.rowHeader}>
            <RowTitle
              rows={rows}
              rowKeys={this.rowKeys}
              drawingData={this.drawingData}
              dimetionAxis={dimetionAxis}
            />
            <RowHeader
              rows={rows}
              rowKeys={this.rowKeys}
              colKeys={this.colKeys}
              rowWidths={this.rowHeaderWidths}
              rowTree={this.rowTree}
              colTree={this.colTree}
              tree={this.tree}
              metrics={metrics}
              drawingData={this.drawingData}
              dimetionAxis={dimetionAxis}
              metricAxisConfig={this.metricAxisConfig}
              ref={(f) => this.rowHeader = findDOMNode(f)}
            />
          </div>
          <RowFooter />
        </div>
        <div className={styles.rightSide}>
          <ColumnTitle
            cols={cols}
            colKeys={this.colKeys}
            colTree={this.colTree}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
          />
          <ColumnHeader
            cols={cols}
            colKeys={this.colKeys}
            colTree={this.colTree}
            metrics={metrics}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            ref={(f) => this.columnHeader = findDOMNode(f)}
          />
          <TableBody
            cols={cols}
            rows={rows}
            rowKeys={this.rowKeys}
            colKeys={this.colKeys}
            rowWidths={this.rowHeaderWidths}
            rowTree={this.rowTree}
            colTree={this.colTree}
            tree={this.tree}
            metrics={metrics}
            metricAxisConfig={this.metricAxisConfig}
            scatterXaxisConfig={this.scatterXaxisConfig}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            color={color}
            label={label}
            size={size}
            xAxis={xAxis}
            renderType={renderType}
            legend={legendSelected}
            ref={(f) => this.tableBody = findDOMNode(f)}
          />
          <ColumnFooter
            rowKeys={this.rowKeys}
            colKeys={this.colKeys}
            rowTree={this.rowTree}
            colTree={this.colTree}
            tree={this.tree}
            metrics={metrics}
            metricAxisConfig={this.metricAxisConfig}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            ref={(f) => this.columnFooter = findDOMNode(f)}
          />
        </div>
        <Legend
          color={color}
          onLegendSelect={this.legendSelect}
        />
      </div>
    )
  }
}

export default Pivot
