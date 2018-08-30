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
  getAxisInterval
} from '../util'
import { PIVOT_LINE_HEIGHT, PIVOT_CHART_SPLIT_SIZE } from '../../../../globalConstants'
import Corner from './Corner'
import RowTitle from './RowTitle'
import RowHeader from './RowHeader'
import RowFooter from './RowFooter'
import ColumnTitle from './ColumnTitle'
import ColumnHeader from './ColumnHeader'
import TableBody from './TableBody'
import ColumnFooter from './ColumnFooter'
import { IChartInfo } from './Chart'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { AggregatorType, DragType, IDataParamConfig } from '../Workbench/Dropbox'

const styles = require('./Pivot.less')

export type DimetionType = 'row' | 'col'
export type RenderType = 'rerender' | 'refresh'

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
}

export interface IMetricAxisConfig {
  min: number
  max: number
  interval: number
}

export interface IPivotProps {
  data: object[]
  cols: string[]
  rows: string[]
  chart: any
  metrics: IPivotMetric[]
  filters: IPivotFilter[]
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  dimetionAxis?: DimetionType
  renderType?: RenderType
}

export class Pivot extends React.PureComponent<IPivotProps, {}> {
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
    multiCoordinate: false
  }
  private min = []
  private max = []
  private metricAxisConfig: IMetricAxisConfig = void 0

  public rowHeader: HTMLElement = null
  public columnHeader: HTMLElement = null
  public tableBody: HTMLElement = null
  public columnFooter: HTMLElement = null
  private container: HTMLElement = null

  public componentDidMount () {
    const { offsetWidth, offsetHeight } = this.container
    this.width = offsetWidth
    this.height = offsetHeight
  }

  public componentWillUpdate (nextProps: IPivotProps) {
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
      multiCoordinate: false
    }

    this.min = []
    this.max = []
    this.metricAxisConfig = void 0
    this.getRenderData(nextProps)
    this.rowHeader.scrollTop = 0
    this.columnHeader.scrollLeft = 0
    this.tableBody.scrollTop = this.tableBody.scrollLeft = 0
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
      multiCoordinate: false
    }
    this.min = []
    this.max = []
    this.metricAxisConfig = void 0
  }

  private getRenderData = (props) => {
    const { cols, rows, metrics, data, xAxis, dimetionAxis } = props

    this.rowHeaderWidths = rows.map((r) => getPivotContentTextWidth(r, 'bold'))
    if (!cols.length && !rows.length) {
      this.tree[0] = data.slice()
      this.getMetricsMinAndMaxValue(metrics, data)
    } else {
      data.forEach((record) => {
        this.getRowKeyAndColKey(props, record, !!dimetionAxis)
      })
      this.rowKeys.sort(this.sortingKeys(rows))
      this.colKeys.sort(this.sortingKeys(cols))
      // console.log(this.colKeys.length, this.rowKeys.length)
    }

    if (dimetionAxis) {
      this.tableBodyWidth = getTableBodyWidth(dimetionAxis, this.width, this.rowHeaderWidths)
      this.tableBodyHeight = getTableBodyHeight(dimetionAxis, this.height, cols.length)
      this.drawingData.elementSize = getChartElementSize(
        dimetionAxis,
        [this.tableBodyWidth, this.tableBodyHeight],
        [this.colKeys.length, this.rowKeys.length]
      )
      this.drawingData.unitMetricWidth = getChartUnitMetricWidth(this.tableBodyWidth, this.colKeys.length || 1, metrics.length)
      this.drawingData.unitMetricHeight = getChartUnitMetricHeight(this.tableBodyHeight, this.rowKeys.length || 1, metrics.length)
      this.drawingData.multiCoordinate = metrics.some((m) => m.chart.coordinate === 'polar') || xAxis && xAxis.items.length
      this.drawingData.tableBodyCollapsed = shouldTableBodyCollapsed(
        dimetionAxis,
        this.drawingData.multiCoordinate,
        this.tableBodyHeight,
        this.rowKeys.length,
        [this.drawingData.elementSize, this.drawingData.unitMetricWidth]
      )
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
      }, { min: 0, max: 0, interval: 0 })
    }
  }

  private getRowKeyAndColKey = (props: IPivotProps, record: object, hasDimetionAxis: boolean) => {
    const { cols, rows, metrics } = props

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
      const metricColumnValue = records.reduce((sum, r) => sum + r[`${m.agg}(${metricName})`], 0)
      this.min[i] = this.min[i] ? Math.min(this.min[i], metricColumnValue) : metricColumnValue
      this.max[i] = this.max[i] ? Math.max(this.max[i], metricColumnValue) : metricColumnValue
    })
  }

  public render () {
    const { cols, rows, metrics, color, label, dimetionAxis, renderType } = this.props
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
            rowKeys={this.rowKeys}
            colKeys={this.colKeys}
            rowWidths={this.rowHeaderWidths}
            rowTree={this.rowTree}
            colTree={this.colTree}
            tree={this.tree}
            metrics={metrics}
            metricAxisConfig={this.metricAxisConfig}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            color={color}
            label={label}
            renderType={renderType}
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
      </div>
    )
  }
}

export default Pivot
