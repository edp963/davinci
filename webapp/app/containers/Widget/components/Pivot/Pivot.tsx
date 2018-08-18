import * as React from 'react'
import { findDOMNode } from 'react-dom'
import {
  naturalSort,
  decodeMetricName,
  getPivotContentTextWidth,
  getTableBodyWidth,
  getTableBodyHeight,
  getChartElementSizeAndShouldCollapsed,
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

const styles = require('./Pivot.less')

export interface IPivotMetric {
  name: string
  agg: string
}

export interface IDrawingData {
  extraMetricCount: number
  elementSize: number
  unitMetricWidth: number
  unitMetricHeight: number
  tableBodyCollapsed: boolean
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
  metrics: IPivotMetric[]
  chart: IChartInfo
}

export interface IPivotStates {
  cols: string[]
  rows: string[]
}

export class Pivot extends React.PureComponent<IPivotProps, IPivotStates> {
  constructor (props) {
    super(props)
    this.state = {
      cols: [],
      rows: []
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
    extraMetricCount: 0,
    elementSize: 0,
    unitMetricWidth: 0,
    unitMetricHeight: 0,
    tableBodyCollapsed: false
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

  public componentWillReceiveProps (nextProps: IPivotProps) {
    const { cols, rows } = nextProps
    this.setState({ cols, rows })
  }

  public componentWillUpdate (nextProps: IPivotProps, nextState: IPivotStates) {
    this.rowKeys = []
    this.colKeys = []
    this.rowTree = {}
    this.colTree = {}
    this.tree = {}
    this.drawingData = {
      extraMetricCount: 0,
      elementSize: 0,
      unitMetricWidth: 0,
      unitMetricHeight: 0,
      tableBodyCollapsed: false
    }

    this.min = []
    this.max = []
    this.metricAxisConfig = void 0
    this.getRenderData(nextProps, nextState)
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
      extraMetricCount: 0,
      elementSize: 0,
      unitMetricWidth: 0,
      unitMetricHeight: 0,
      tableBodyCollapsed: false
    }
    this.min = []
    this.max = []
    this.metricAxisConfig = void 0
  }

  private getRenderData = (props, states) => {
    const { metrics, data, chart } = props
    const { cols, rows } = states
    const { dimetionAxis } = chart

    this.rowHeaderWidths = rows.map((r) => getPivotContentTextWidth(r, 'bold'))

    if (!cols.length && !rows.length) {
      this.tree[0] = data.slice()
      this.getMetricsMinAndMaxValue(metrics, this.tree[0][0])
    } else {
      data.forEach((record) => {
        this.getRowKeyAndColKey(props, states, record, !!dimetionAxis)
      })
      this.rowKeys.sort(this.sortingKeys(rows))
      this.colKeys.sort(this.sortingKeys(cols))
      // console.log(this.colKeys.length, this.rowKeys.length)
    }

    if (dimetionAxis) {
      this.tableBodyWidth = getTableBodyWidth(dimetionAxis, this.width, this.rowHeaderWidths)
      this.tableBodyHeight = getTableBodyHeight(dimetionAxis, this.height, cols.length)
      const { requireMetrics } = chart
      const rmNum = Array.isArray(requireMetrics) ? requireMetrics[0] : requireMetrics
      const { elementSize, shouldCollapsed }  = getChartElementSizeAndShouldCollapsed(
        dimetionAxis,
        [this.tableBodyWidth, this.tableBodyHeight],
        [this.colKeys.length, this.rowKeys.length]
      )
      this.drawingData.elementSize = elementSize
      this.drawingData.tableBodyCollapsed = shouldCollapsed
      this.drawingData.extraMetricCount = Math.max(metrics.length - rmNum, 0)
      this.drawingData.unitMetricWidth = getChartUnitMetricWidth(this.tableBodyWidth, this.colKeys.length || 1, this.drawingData.extraMetricCount)
      this.drawingData.unitMetricHeight = getChartUnitMetricHeight(this.tableBodyHeight, this.rowKeys.length || 1, this.drawingData.extraMetricCount)
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

  private getRowKeyAndColKey = (props: IPivotProps, state: IPivotStates, record: object, hasDimetionAxis: boolean) => {
    const { metrics } = props
    const { cols, rows } = state

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
    }
    if (colKey.length) {
      if (!this.colTree[flatColKey]) {
        const width = !hasDimetionAxis && { width: Math.max(...colKey.map((c) => getPivotContentTextWidth(c, 'bold'))) }
        const height = !hasDimetionAxis && { height: PIVOT_LINE_HEIGHT }
        this.colTree[flatColKey] = { ...width, ...height, records: [] }
        this.colKeys.push(colKey)
      }
      this.colTree[flatColKey].records.push(record)
    }
    if (rowKey.length && colKey.length) {
      if (!this.tree[flatRowKey]) {
        this.tree[flatRowKey] = {}
      }
      this.tree[flatRowKey][flatColKey] = record
    }
    if (metrics.length) {
      this.getMetricsMinAndMaxValue(metrics, record)

      if (!hasDimetionAxis) {
        const maxTextWidth = Math.max(...metrics.map((m) => getPivotContentTextWidth(record[`${m.agg}(${decodeMetricName(m.name)})`])))
        const cellHeight = (PIVOT_LINE_HEIGHT + 1) * metrics.length - 1

        if (rowKey.length) {
          // if (this.rowHeaderWidths.length === rows.length) {
          //   this.rowHeaderWidths.push(0)
          // }
          // const additionalColWidth = this.rowHeaderWidths[this.rowHeaderWidths.length - 1]
          // this.rowHeaderWidths[this.rowHeaderWidths.length - 1] = Math.max(additionalColWidth, maxTextWidth)
          this.rowTree[flatRowKey].height = cellHeight
        }

        if (colKey.length) {
          this.colTree[flatColKey].width = Math.max(this.colTree[flatColKey].width, maxTextWidth)
          this.colTree[flatColKey].height = cellHeight
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

  private getMetricsMinAndMaxValue (metrics, record) {
    metrics.forEach((m, i) => {
      const metricName = decodeMetricName(m.name)
      this.min[i] = this.min[i]
        ? Math.min(this.min[i], record[`${m.agg}(${metricName})`])
        : record[`${m.agg}(${metricName})`]
      this.max[i] = this.max[i]
        ? Math.max(this.max[i], record[`${m.agg}(${metricName})`])
        : record[`${m.agg}(${metricName})`]
    })
  }

  public render () {
    const { metrics, chart } = this.props
    const { cols, rows } = this.state

    return (
      <div className={styles.block} ref={(f) => this.container = f}>
        <div className={styles.leftSide}>
          <Corner
            cols={cols}
            rows={rows}
            rowWidths={this.rowHeaderWidths}
            chart={chart}
          />
          <div className={styles.rowHeader}>
            <RowTitle
              rows={rows}
              rowKeys={this.rowKeys}
              chart={chart}
              drawingData={this.drawingData}
            />
            <RowHeader
              cols={cols}
              rows={rows}
              rowKeys={this.rowKeys}
              colKeys={this.colKeys}
              rowWidths={this.rowHeaderWidths}
              rowTree={this.rowTree}
              colTree={this.colTree}
              tree={this.tree}
              chart={chart}
              metrics={metrics}
              drawingData={this.drawingData}
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
            chart={chart}
            drawingData={this.drawingData}
          />
          <ColumnHeader
            cols={cols}
            rows={rows}
            colKeys={this.colKeys}
            rowWidths={this.rowHeaderWidths}
            colTree={this.colTree}
            chart={chart}
            metrics={metrics}
            drawingData={this.drawingData}
            ref={(f) => this.columnHeader = findDOMNode(f)}
          />
          <TableBody
            rowKeys={this.rowKeys}
            colKeys={this.colKeys}
            rowWidths={this.rowHeaderWidths}
            rowTree={this.rowTree}
            colTree={this.colTree}
            tree={this.tree}
            chart={chart}
            metrics={metrics}
            metricAxisConfig={this.metricAxisConfig}
            drawingData={this.drawingData}
            ref={(f) => this.tableBody = findDOMNode(f)}
          />
          <ColumnFooter
            rowKeys={this.rowKeys}
            colKeys={this.colKeys}
            rowTree={this.rowTree}
            colTree={this.colTree}
            tree={this.tree}
            chart={chart}
            metrics={metrics}
            metricAxisConfig={this.metricAxisConfig}
            drawingData={this.drawingData}
            ref={(f) => this.columnFooter = findDOMNode(f)}
          />
        </div>
      </div>
    )
  }
}

export default Pivot
