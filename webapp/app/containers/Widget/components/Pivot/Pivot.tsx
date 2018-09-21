import * as React from 'react'
import * as classnames from 'classnames'
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
  getBar,
  getSizeRate,
  getAggregatorLocale
} from '../util'
import {
  PIVOT_LINE_HEIGHT,
  PIVOT_CHART_SPLIT_SIZE,
  PIVOT_LEGEND_ITEM_PADDING,
  PIVOT_LEGEND_PADDING,
  PIVOT_DEFAULT_SCATTER_SIZE,
  DEFAULT_SPLITER
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
import { IAxisConfig } from 'containers/Widget/components/Workbench/ConfigSections/AxisSection'
import { ISplitLineConfig } from 'containers/Widget/components/Workbench/ConfigSections/SplitLineSection'
import { IPivotConfig } from 'containers/Widget/components/Workbench/ConfigSections/PivotSection'
const Icon = require('antd/lib/icon')

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
  [key: string]: {
    [key: string]: {
      min: number
      max: number
      interval: number
    }
  }
}

export interface ILegend {
  [key: string]: string[]
}

export interface IChartStyles {
  pivot?: IPivotConfig
  spec?: object
  xAxis?: IAxisConfig
  yAxis?: IAxisConfig
  splitLine?: ISplitLineConfig
}

export interface IPivotProps {
  data: object[]
  cols: string[]
  rows: string[]
  metrics: IPivotMetric[]
  filters: IPivotFilter[]
  chartStyles: IChartStyles
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  tip?: IDataParamProperty
  dimetionAxis?: DimetionType
  renderType?: RenderType
  orders: Array<{column: string, direction: string}>
  queryParams: any[]
  cache: boolean
  expired: number
  loading?: boolean
  onCheckTableInteract?: () => boolean
  onDoInteract?: (triggerData: object) => void
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
  private rowTree: {
    [key: string]: {
      width?: number
      height?: number
      records: any[]
    }
  } = {}
  private colTree: {
    [key: string]: {
      width?: number
      height?: number
      records: any[]
    }
  } = {}
  private tree: {
    [key: string]: {
      [key: string]: any[]
    }
  } = {}

  private rowHeaderWidths = []
  private drawingData: IDrawingData = {
    elementSize: 0,
    unitMetricWidth: 0,
    unitMetricHeight: 0,
    tableBodyCollapsed: false,
    multiCoordinate: false,
    sizeRate: {}
  }
  private groupedData: {
    [key: string]: {
      yAxisMin: number,
      yAxisMax: number,
      scatterXAxisMin: number,
      scatterXAxisMax: number,
      sizeMin: number,
      sizeMax: number
    }
  } = {}
  private metricAxisConfig: IMetricAxisConfig = void 0

  public rowHeader: HTMLElement = null
  public columnHeader: HTMLElement = null
  public tableBody: HTMLElement = null
  public columnFooter: HTMLElement = null
  private container: HTMLElement = null

  public componentDidMount () {
    this.getContainerSize()
  }

  public componentWillReceiveProps (nextProps) {
    const { renderType, color } = nextProps
    const { legendSelected } = this.state
    this.setState({
      renderType,
      legendSelected: (color && !color.items.length && Object.keys(legendSelected).length)
        ? {}
        : legendSelected
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
      this.groupedData = {}
      this.metricAxisConfig = void 0
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
    this.groupedData = {}
    this.metricAxisConfig = void 0
  }

  private getContainerSize = () => {
    const { offsetWidth, offsetHeight } = this.container
    this.width = offsetWidth
    this.height = offsetHeight
  }

  private getRenderData = (props) => {
    const { cols, rows, metrics, data, xAxis, dimetionAxis } = props

    this.rowHeaderWidths = rows.map((r) => getPivotContentTextWidth(r, 'bold'))
    if (!cols.length && !rows.length) {
      this.tree[0] = data.slice()
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

      const treeData = this.getTreeData()
      this.recordGrouping(props, treeData)
      this.metricAxisConfig = metrics.reduce((obj: IMetricAxisConfig, m) => {
        const { yAxisMin, yAxisMax, scatterXAxisMin, scatterXAxisMax, sizeMin, sizeMax } = this.groupedData[m.name]
        const yAxisSplitNumber = dimetionAxis === 'col'
          ? Math.ceil(this.drawingData.unitMetricHeight / PIVOT_CHART_SPLIT_SIZE)
          : Math.ceil(this.drawingData.unitMetricWidth / PIVOT_CHART_SPLIT_SIZE)
        const scatterXAxisSplitNumber = Math.ceil(this.drawingData.elementSize / PIVOT_CHART_SPLIT_SIZE)
        const yAxisInterval = getAxisInterval(yAxisMax, yAxisSplitNumber)
        const scatterXAxisInterval = getAxisInterval(scatterXAxisMax, scatterXAxisSplitNumber)

        this.drawingData.sizeRate[m.name] = getSizeRate(sizeMin, sizeMax)

        obj[m.name] = {
          yAxis: {
            min: yAxisMin,
            max: yAxisInterval * yAxisSplitNumber,
            interval: yAxisInterval
          },
          scatterXAxis: {
            min: scatterXAxisMin,
            max: scatterXAxisInterval * scatterXAxisSplitNumber,
            interval: scatterXAxisInterval
          }
        }
        return obj
      }, {})
    }
  }

  private getTreeData = (): any[][] => {
    if (this.colKeys.length && this.rowKeys.length) {
      return Object.values(this.tree).reduce((data: any[], row) =>
        data.concat(Object.values(row))
      , [])
    } else if (this.colKeys.length) {
      return Object.values(this.colTree).map((col: any) => col.records)
    } else if (this.rowKeys.length) {
      return Object.values(this.rowTree).map((row: any) => row.records)
    } else {
      return [this.tree[0] as any]
    }
  }

  private getRowKeyAndColKey = (props: IPivotProps, record: object, hasDimetionAxis: boolean) => {
    const { cols, rows, metrics } = props

    const rowKey = []
    const colKey = []
    let flatRowKeys
    let flatColKeys

    const metricNames = metrics.map((m) => `${m.name}${DEFAULT_SPLITER}${m.agg}`)
    if (!metricNames.length) {
      metricNames.push('无指标值')
    }

    if (rows.includes('指标名称')) {
      metricNames.forEach((mn) => {
        const keyArr = []
        const [name, id, agg] = mn.split(DEFAULT_SPLITER)
        const metricTextWidth = getPivotContentTextWidth(
          `[${getAggregatorLocale(agg)}]${name}`,
          'bold'
        )
        rows.forEach((r, i) => {
          const value = r === '指标名称' ? mn : record[r]
          const textWidth = r === '指标名称'
            ? metricTextWidth
            : getPivotContentTextWidth(value, 'bold')
          this.rowHeaderWidths[i] = Math.max(textWidth, this.rowHeaderWidths[i] || 0)
          keyArr.push(value)
        })
        rowKey.push(keyArr)
      })
      flatRowKeys = rowKey.reduce((arr, keys) => arr.concat(keys.join(String.fromCharCode(0))), [])
    } else {
      rows.forEach((r, i) => {
        const value = record[r]
        const textWidth = getPivotContentTextWidth(value, 'bold')
        this.rowHeaderWidths[i] = Math.max(textWidth, this.rowHeaderWidths[i] || 0)
        rowKey.push(value)
      })
      flatRowKeys = [rowKey.join(String.fromCharCode(0))]
    }

    if (cols.includes('指标名称')) {
      metricNames.forEach((mn) => {
        const keyArr = []
        cols.forEach((c) => {
          const value = c === '指标名称' ? mn : record[c]
          keyArr.push(value)
        })
        colKey.push(keyArr)
      })
      flatColKeys = colKey.reduce((arr, keys) => arr.concat(keys.join(String.fromCharCode(0))), [])
    } else {
      cols.forEach((c) => {
        colKey.push(record[c])
      })
      flatColKeys = [colKey.join(String.fromCharCode(0))]
    }

    flatRowKeys.forEach((flatRowKey) => {
      flatColKeys.forEach((flatColKey) => {
        if (rowKey.length) {
          if (!this.rowTree[flatRowKey]) {
            const height = !hasDimetionAxis && { height: PIVOT_LINE_HEIGHT }
            this.rowTree[flatRowKey] = { ...height, records: [] }
            this.rowKeys.push(flatRowKey.split(String.fromCharCode(0)))
          }
          this.rowTree[flatRowKey].records.push(record)

          if (metrics.length) {
            if (!hasDimetionAxis) {
              const cellHeight = (rows.includes('指标名称') || cols.includes('指标名称'))
                ? PIVOT_LINE_HEIGHT
                : (PIVOT_LINE_HEIGHT + 1) * metrics.length - 1
              this.rowTree[flatRowKey].height = cellHeight
            }
          }
        }
        if (colKey.length) {
          if (!this.colTree[flatColKey]) {
            const width = !hasDimetionAxis && {
              width: Math.max(
                ...flatColKey.split(String.fromCharCode(0))
                  .map((c) => {
                    if (c.includes(DEFAULT_SPLITER)) {
                      const [name, id, agg] = c.split(DEFAULT_SPLITER)
                      return getPivotContentTextWidth(`[${getAggregatorLocale(agg)}]${name}`, 'bold')
                    } else {
                      return getPivotContentTextWidth(c, 'bold')
                    }
                  })
              )
            }
            const height = !hasDimetionAxis && { height: PIVOT_LINE_HEIGHT }
            this.colTree[flatColKey] = { ...width, ...height, records: [] }
            this.colKeys.push(flatColKey.split(String.fromCharCode(0)))
          }
          this.colTree[flatColKey].records.push(record)

          if (metrics.length) {
            if (!hasDimetionAxis) {
              const maxTextWidth = Math.max(...metrics.map((m) => getPivotContentTextWidth(record[`${m.agg}(${decodeMetricName(m.name)})`])))
              const cellHeight = (rows.includes('指标名称') || cols.includes('指标名称'))
                ? PIVOT_LINE_HEIGHT
                : (PIVOT_LINE_HEIGHT + 1) * metrics.length - 1
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
        }
      })
    })
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

  private recordGrouping = (props: IPivotProps, records: any[][]) => {
    const { cols, rows, metrics, xAxis, size, color, label } = props
    const colAndRows = [...cols, ...rows]

    metrics.forEach((metric) => {
      if (!this.groupedData[metric.name]) {
        this.groupedData[metric.name] = {
          yAxisMin: 0,
          yAxisMax: 0,
          scatterXAxisMin: 0,
          scatterXAxisMax: 0,
          sizeMin: PIVOT_DEFAULT_SCATTER_SIZE,
          sizeMax: PIVOT_DEFAULT_SCATTER_SIZE
        }
      }
      const colorConditions = color &&
        (color.items.find((item) => item.config.actOn === metric.name) ||
         color.items.find((item) => item.config.actOn === 'all'))
      const labelConditions = label && label.items
        .filter((i) => i.type === 'category' && !colAndRows.includes(i.name))
        .filter((i) => i.config.actOn === metric.name || i.config.actOn === 'all')
      const actingConditions = [].concat(colorConditions).concat(labelConditions).filter((i) => !!i)

      const scatterXAxisItem = xAxis && xAxis.items[0]
      const sizeItem = size && (size.items.find((i) => i.config.actOn === metric.name) || size.items.find((i) => i.config.actOn === 'all'))
      const decodedMetricName = decodeMetricName(metric.name)
      const decodedScatterXAxisItemName = scatterXAxisItem && decodeMetricName(scatterXAxisItem.name)
      const decodedSizeItemName = sizeItem && decodeMetricName(sizeItem.name)

      if (actingConditions.length && metric.chart.id !== getBar().id) {
        this.groupedData[metric.name] = records
          .reduce(({yAxisMin, yAxisMax, scatterXAxisMin, scatterXAxisMax, sizeMin, sizeMax}, recordCollection) => {
            const groupedRecordCollection = {}
            recordCollection.forEach((record) => {
              const groupKey = actingConditions.map((con) => record[con.name]).join(',')
              if (!groupedRecordCollection[groupKey]) {
                groupedRecordCollection[groupKey] = []
              }
              groupedRecordCollection[groupKey].push(record)
            })
            const groupedSum = Object.values(groupedRecordCollection).map((collection: any[]) =>
              collection.reduce((sum, record) => {
                return {
                  yAxis: sum.yAxis + (Number(record[`${metric.agg}(${decodedMetricName})`]) || 0),
                  scatterXAxis: scatterXAxisItem ? sum.scatterXAxis + (Number(record[`${scatterXAxisItem.agg}(${decodedScatterXAxisItemName})`]) || 0) : 0,
                  size: sizeItem ? sum.size + (Number(record[`${sizeItem.agg}(${decodedSizeItemName})`]) || 0) : 0
                }
              }, { yAxis: 0, scatterXAxis: 0, size: 0 }))
            const groupedYAxis = groupedSum.map((gs) => gs.yAxis)
            const groupedScatterXAxis = groupedSum.map((gs) => gs.scatterXAxis)
            const groupedSize = groupedSum.map((gs) => gs.size)
            return {
              yAxisMin: Math.min(yAxisMin, ...groupedYAxis, 0),
              yAxisMax: Math.max(yAxisMax, ...groupedYAxis),
              scatterXAxisMin: Math.min(scatterXAxisMin, ...groupedScatterXAxis, 0),
              scatterXAxisMax: Math.max(scatterXAxisMax, ...groupedScatterXAxis),
              sizeMin: Math.min(sizeMin, ...groupedSize),
              sizeMax: Math.max(sizeMax, ...groupedSize)
            }
          }, {
            yAxisMin: 0,
            yAxisMax: 0,
            scatterXAxisMin: 0,
            scatterXAxisMax: 0,
            sizeMin: PIVOT_DEFAULT_SCATTER_SIZE,
            sizeMax: PIVOT_DEFAULT_SCATTER_SIZE
          })
      } else {
        this.groupedData[metric.name] = records
          .reduce(({yAxisMin, yAxisMax, scatterXAxisMin, scatterXAxisMax, sizeMin, sizeMax}, recordCollection) => {
            const sum = recordCollection.reduce((s, record) => {
              return {
                yAxis: s.yAxis + (Number(record[`${metric.agg}(${decodedMetricName})`]) || 0),
                scatterXAxis: scatterXAxisItem ? s.scatterXAxis + (Number(record[`${scatterXAxisItem.agg}(${decodedScatterXAxisItemName})`]) || 0) : 0,
                size: sizeItem ? s.size + (Number(record[`${sizeItem.agg}(${decodedSizeItemName})`]) || 0) : 0
              }
            }, { yAxis: 0, scatterXAxis: 0, size: 0 })
            return {
              yAxisMin: Math.min(yAxisMin, sum.yAxis, 0),
              yAxisMax: Math.max(yAxisMax, sum.yAxis),
              scatterXAxisMin: Math.min(scatterXAxisMin, sum.scatterXAxis, 0),
              scatterXAxisMax: Math.max(scatterXAxisMax, sum.scatterXAxis),
              sizeMin: Math.min(sizeMin, sum.size),
              sizeMax: Math.max(sizeMax, sum.size)
            }
          }, {
            yAxisMin: 0,
            yAxisMax: 0,
            scatterXAxisMin: 0,
            scatterXAxisMax: 0,
            sizeMin: PIVOT_DEFAULT_SCATTER_SIZE,
            sizeMax: PIVOT_DEFAULT_SCATTER_SIZE
          })
      }
    })
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
    const { cols, rows, metrics, chartStyles, color, label, size, xAxis, tip, dimetionAxis, onCheckTableInteract, onDoInteract, loading } = this.props
    const { legendSelected, renderType } = this.state

    return (
      <div className={styles.block} ref={(f) => this.container = f}>
        <div className={styles.leftSide}>
          <Corner
            cols={cols}
            rows={rows}
            rowWidths={this.rowHeaderWidths}
            chartStyles={chartStyles}
            dimetionAxis={dimetionAxis}
          />
          <div className={styles.rowHeader}>
            <RowTitle
              rows={rows}
              rowKeys={this.rowKeys}
              chartStyles={chartStyles}
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
              chartStyles={chartStyles}
              drawingData={this.drawingData}
              dimetionAxis={dimetionAxis}
              metricAxisConfig={this.metricAxisConfig}
              hasMetricNameDimetion={cols.includes('指标名称') || rows.includes('指标名称')}
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
            chartStyles={chartStyles}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
          />
          <ColumnHeader
            cols={cols}
            colKeys={this.colKeys}
            colTree={this.colTree}
            metrics={metrics}
            chartStyles={chartStyles}
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
            chartStyles={chartStyles}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            color={color}
            label={label}
            size={size}
            xAxis={xAxis}
            tip={tip}
            renderType={renderType}
            legend={legendSelected}
            onCheckTableInteract={onCheckTableInteract}
            onDoInteract={onDoInteract}
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
            chartStyles={chartStyles}
            drawingData={this.drawingData}
            dimetionAxis={dimetionAxis}
            ref={(f) => this.columnFooter = findDOMNode(f)}
          />
        </div>
        <Legend
          color={color}
          chartStyles={chartStyles}
          onLegendSelect={this.legendSelect}
        />
        <div
          className={classnames({
            [styles.mask]: true,
            [styles.loading]: loading
          })}
        >
          <Icon type="loading" />
          <p>加载中…</p>
        </div>
      </div>
    )
  }
}

export default Pivot
