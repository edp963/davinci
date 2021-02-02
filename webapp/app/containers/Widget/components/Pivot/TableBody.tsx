import React from 'react'
import classnames from 'classnames'
import { IDrawingData, IMetricAxisConfig, ILegend } from './Pivot'
import { IWidgetMetric, DimetionType, RenderType, IChartStyles } from '../Widget'
import Cell from './Cell'
import Chart, { IChartUnit, IChartLine, IChartBlock } from './Chart'
import { PIVOT_CANVAS_SIZE_LIMIT, PIVOT_CANVAS_POLAR_SIZE_LIMIT } from 'app/globalConstants'
import {
  getPivotContentTextWidth,
  getPivotCellWidth,
  getPivotCellHeight,
  getChartPieces,
  decodeMetricName
} from '../util'
import { uuid } from 'utils/util'
import { IDataParamProperty } from '../Workbench/OperatingPanel'

const styles = require('./Pivot.less')

export interface ITableBodyProps {
  cols: string[]
  rows: string[]
  rowKeys: string[][]
  colKeys: string[][]
  rowWidths: number[]
  selectedChart: number
  selectedItems?: number[]
  rowTree: object
  colTree: object
  tree: object
  interacting?: boolean
  metrics: IWidgetMetric[]
  metricAxisConfig: IMetricAxisConfig
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  tip?: IDataParamProperty
  renderType: RenderType
  legend: ILegend
  onCheckTableInteract?: () => boolean
  onDoInteract?: (triggerData: object) => void
  getDataDrillDetail?: (position: string) => void
  isDrilling?: boolean
  ifSelectedTdToDrill: (obj: any) => any
  whichDataDrillBrushed?: boolean | object []
  // onHideDrillPanel?: (swtich: boolean) => void
  onSelectChartsItems?: (selectedItems: number[]) => void
}

interface ITableBodyState {
  selectedPivotTds: any[]
}

export class TableBody extends React.Component<ITableBodyProps, ITableBodyState> {
  constructor (props) {
    super(props)
    this.state = {
      selectedPivotTds: []
    }
  }
  private gridCutting = (width, height, chartGrid) => {
    // console.log(chartGrid)
    const chunks = this.horizontalCutting(height, chartGrid)
    // console.log(chunks)
    chunks.forEach((chunk) => {
      chunk.data = this.verticalCutting(width, chunk.data)
    })
    return chunks
  }

  private horizontalCutting = (height, chartGrid) => {
    const { metrics, dimetionAxis, drawingData: { multiCoordinate } } = this.props
    const limit = multiCoordinate ? PIVOT_CANVAS_POLAR_SIZE_LIMIT : PIVOT_CANVAS_SIZE_LIMIT
    if (height > limit) {
      const result = []
      let chunk = {
        key: '',
        height: 0,
        data: []
      }
      chartGrid.forEach((cg, index) => {
        const lineHeight = dimetionAxis === 'col'
          ? cg.height * metrics.length
          : cg.height
        if (chunk.height + lineHeight > limit) {
          chunk.key = `${index}${chunk.data.map((d) => d.key).join(',')}`
          result.push(chunk)
          chunk = {
            key: '',
            height: 0,
            data: []
          }
        }
        chunk.height += lineHeight
        chunk.data.push(cg)
        if (index === chartGrid.length - 1) {
          chunk.key = `${index}${chunk.data.map((d) => d.key).join(',')}`
          result.push(chunk)
        }
      })
      return result
    } else {
      return [{
        key: 'chunk',
        height,
        data: chartGrid
      }]
    }
  }

  private verticalCutting = (width, chartLines: IChartLine[]) => {
    const { metrics, dimetionAxis, drawingData: { multiCoordinate }  } = this.props
    const limit = multiCoordinate ? PIVOT_CANVAS_POLAR_SIZE_LIMIT : PIVOT_CANVAS_SIZE_LIMIT
    if (width > limit) {
      const result = {}
      chartLines.forEach((line: IChartLine) => {
        let blockLine: IChartLine = this.initBlockLine(line)
        let block: IChartBlock = this.initBlock(blockLine)
        line.data.forEach((cu: IChartUnit, index) => {
          const unitWidth = dimetionAxis === 'row'
            ? cu.width * metrics.length
            : cu.width
          if (block.width + unitWidth > limit) {
            if (result[index - 1]) {
              const currentBlock = result[index - 1]
              // currentBlock.width += block.width
              currentBlock.data = currentBlock.data.concat(block.data)
            } else {
              result[index - 1] = {
                ...block,
                key: `${index - 1}${block.data.map((d) => d.key).join(',')}`
              }
            }
            blockLine = this.initBlockLine(line)
            block = this.initBlock(blockLine)
          }
          block.width += unitWidth
          blockLine.data.push(cu)
          if (index === line.data.length - 1) {
            if (result[index]) {
              const currentBlock = result[index]
              // currentBlock.width += block.width
              currentBlock.data = currentBlock.data.concat(block.data)
            } else {
              result[index] = {
                ...block,
                key: `${index}${block.data.map((d) => d.key).join(',')}`
              }
            }
          }
        })
      })
      return Object.values(result).map((block: IChartBlock) => ({
        ...block,
        pieces: getChartPieces(
          block.data.reduce((lsum, line: IChartLine) =>
            lsum + line.data.reduce((usum, unit: IChartUnit) =>
              usum + (dimetionAxis === 'col' ? unit.records.length * metrics.length : unit.records.length)
            , 0)
          , 0),
          block.data.length
        )
      }))
    } else {
      return [{
        key: 'block',
        width,
        data: chartLines,
        pieces: getChartPieces(
          chartLines.reduce((lsum, line: IChartLine) =>
            lsum + line.data.reduce((usum, unit: IChartUnit) =>
              usum + (dimetionAxis === 'col' ? unit.records.length * metrics.length : unit.records.length)
            , 0)
          , 0),
          chartLines.length
        )
      }]
    }
  }

  private initBlock = (blockLine) => ({
    key: '',
    width: 0,
    data: [blockLine],
    pieces: 0
  })

  private initBlockLine = (line) => ({
    ...line,
    key: `${uuid(8, 16)}${line.key}`,
    data: []
  })

  public render () {
    const {
      rows,
      cols,
      rowKeys,
      colKeys,
      rowTree,
      rowWidths,
      colTree,
      tree,
      metrics,
      metricAxisConfig,
      chartStyles,
      drawingData,
      dimetionAxis,
      color,
      label,
      size,
      xAxis,
      tip,
      renderType,
      legend,
      onCheckTableInteract,
      onDoInteract,
      getDataDrillDetail,
      isDrilling,
      ifSelectedTdToDrill
      // onHideDrillPanel
    } = this.props
    const { elementSize, unitMetricWidth, unitMetricHeight, tableBodyCollapsed } = drawingData
    let tableBody = null
    const chartGrid: IChartLine[] = []
    const cells = []
    let tableWidth = 0

    if (dimetionAxis) {
      let metricAxisCount = 0
      if (colKeys.length && rowKeys.length) {
        let chartRowLineRecorder: IChartUnit[][] = []

        rowKeys.forEach((rk, i) => {
          const flatRowKey = rk.join(String.fromCharCode(0))
          let chartLine: IChartUnit[] = []
          // tableWidth = 0

          colKeys.forEach((ck, j) => {
            const flatColKey = ck.join(String.fromCharCode(0))
            const records = tree[flatRowKey][flatColKey]

            if (dimetionAxis === 'col') {
              const nextCk = colKeys[j + 1] || []
              let lastUnit = chartLine[chartLine.length - 1]
              if (!lastUnit || lastUnit.ended) {
                lastUnit = {
                  key: `${flatRowKey}${flatColKey}`,
                  width: 0,
                  records: [],
                  ended: false
                }
                chartLine.push(lastUnit)
              }
              lastUnit.records.push({
                key: ck[ck.length - 1],
                value: records
              })
              if (ck.length === 1 && j === colKeys.length - 1 ||
                  ck[ck.length - 2] !== nextCk[nextCk.length - 2]) {
                const unitWidth = lastUnit.records.length * elementSize
                // tableWidth += unitWidth
                lastUnit.width = unitWidth
                lastUnit.ended = true

                if (!nextCk.length) {
                  chartGrid.push({
                    key: flatRowKey,
                    height: unitMetricHeight,
                    data: chartLine.slice()
                  })
                  // tableHeight += unitMetricHeight * (extraMetricCount + 1)
                  metricAxisCount += 1
                  chartLine = []
                }
              }
            } else {
              const nextRk = rowKeys[i + 1] || []
              if (!chartRowLineRecorder[j]) {
                chartRowLineRecorder[j] = []
              }
              const rowLine: IChartUnit[] = chartRowLineRecorder[j]
              let lastUnit = rowLine[rowLine.length - 1]
              if (!lastUnit || lastUnit.ended) {
                lastUnit = {
                  key: `${flatColKey}${flatRowKey}`,
                  width: 0,
                  records: [],
                  ended: false
                }
                rowLine.push(lastUnit)
              }
              lastUnit.records.push({
                key: rk[rk.length - 1],
                value: records
              })
              if (rk.length === 1 && i === rowKeys.length - 1 ||
                  rk[rk.length - 2] !== nextRk[nextRk.length - 2]) {
                // tableWidth += unitMetricWidth * (extraMetricCount + 1)
                lastUnit.width = unitMetricWidth
                lastUnit.ended = true
                if (j === colKeys.length - 1) {
                  const height = lastUnit.records.length * elementSize
                  chartGrid.push({
                    key: flatRowKey,
                    height,
                    data: chartRowLineRecorder.reduce((arr, r) => arr.concat(r), [])
                  })
                  // tableHeight += height
                  chartRowLineRecorder = []
                }
                if (i === rowKeys.length - 1) {
                  metricAxisCount += 1
                }
              }
            }
          })
        })
      } else if (colKeys.length) {
        const chartLine: IChartUnit[] = []
        // tableWidth = 0

        colKeys.forEach((ck, j) => {
          const flatColKey = ck.join(String.fromCharCode(0))
          const { records } = colTree[flatColKey]

          if (dimetionAxis === 'col') {
            const nextCk = colKeys[j + 1] || []
            let lastUnit = chartLine[chartLine.length - 1]
            if (!lastUnit || lastUnit.ended) {
              lastUnit = {
                key: flatColKey,
                width: 0,
                records: [],
                ended: false
              }
              chartLine.push(lastUnit)
            }
            lastUnit.records.push({
              key: ck[ck.length - 1],
              value: records
            })
            if (ck.length === 1 && j === colKeys.length - 1 ||
                ck[ck.length - 2] !== nextCk[nextCk.length - 2]) {
              const unitWidth = lastUnit.records.length * elementSize
              // tableWidth += unitWidth
              lastUnit.width = unitWidth
              lastUnit.ended = true

              if (!nextCk.length) {
                chartGrid.push({
                  key: flatColKey,
                  height: unitMetricHeight,
                  data: chartLine.slice()
                })
                metricAxisCount += 1
                // tableHeight += unitMetricHeight * (extraMetricCount + 1)
              }
            }
          } else {
            // tableWidth += unitMetricWidth * (extraMetricCount + 1)
            chartLine.push({
              key: flatColKey,
              width: unitMetricWidth,
              records: [{
                key: ck[ck.length - 1],
                value: records
              }],
              ended: true
            })
            metricAxisCount += 1
            if (j === colKeys.length - 1) {
              chartGrid.push({
                key: flatColKey,
                height: elementSize,
                data: chartLine.slice()
              })
              // tableHeight = elementSize
            }
          }
        })
      } else if (rowKeys.length) {
        let chartLine: IChartUnit[] = []
        rowKeys.forEach((rk, i) => {
          const flatRowKey = rk.join(String.fromCharCode(0))
          const { records } = rowTree[flatRowKey]
          // tableWidth = 0

          if (dimetionAxis === 'row') {
            const nextRk = rowKeys[i + 1] || []
            let lastUnit = chartLine[chartLine.length - 1]
            if (!lastUnit || lastUnit.ended) {
              lastUnit = {
                key: flatRowKey,
                width: 0,
                records: [],
                ended: false
              }
              chartLine.push(lastUnit)
            }
            lastUnit.records.push({
              key: rk[rk.length - 1],
              value: records
            })
            if (rk.length === 1 && i === rowKeys.length - 1 ||
                rk[rk.length - 2] !== nextRk[nextRk.length - 2]) {
              // tableWidth += unitMetricWidth * (extraMetricCount + 1)
              lastUnit.width = unitMetricWidth
              lastUnit.ended = true

              const height = lastUnit.records.length * elementSize
              chartGrid.push({
                key: flatRowKey,
                height,
                data: chartLine.slice()
              })
              // tableHeight += height
              chartLine = []
              if (i === rowKeys.length - 1) {
                metricAxisCount += 1
              }
            }
          } else {
            // tableWidth += elementSize
            chartGrid.push({
              key: flatRowKey,
              height: unitMetricHeight,
              data: [{
                key: flatRowKey,
                width: elementSize,
                records: [{
                  key: rk[rk.length - 1],
                  value: records
                }],
                ended: false
              }]
            })
            metricAxisCount += 1
            // tableHeight += unitMetricHeight * (extraMetricCount + 1)
          }
        })
      } else {
        const records = tree[0]
        const width = dimetionAxis === 'col' ? elementSize : unitMetricWidth
        const height = dimetionAxis === 'row' ? elementSize : unitMetricHeight
        // tableWidth = width * (dimetionAxis === 'row' ? extraMetricCount + 1 : 1)
        // tableHeight = height * (dimetionAxis === 'col' ? extraMetricCount + 1 : 1)
        const chartUnit = {
          width,
          // records: records.map((r) => ({
          //   key: '',
          //   value: [r]
          // })),
          records: [{
            key: 'data',
            value: records
          }],
          ended: true
        }
        chartGrid.push({ height, data: [chartUnit] })
      }

      const colKeyLength = colKeys.length || 1
      const rowKeyLength = rowKeys.length || 1
      metricAxisCount = metricAxisCount || 1
      let tableHeight = 0

      if (dimetionAxis === 'col') {
        tableWidth = colKeyLength * elementSize
        tableHeight = metricAxisCount * unitMetricHeight * metrics.length
      } else {
        tableWidth = metricAxisCount * unitMetricWidth * metrics.length
        tableHeight = rowKeyLength * elementSize
      }
      tableBody = (
        <Chart
          width={tableWidth}
          height={tableHeight}
          cols={cols}
          rows={rows}
          dimetionAxisCount={dimetionAxis === 'col' ? colKeyLength : rowKeyLength}
          metricAxisCount={metricAxisCount}
          metrics={metrics}
          data={this.gridCutting(tableWidth, tableHeight, chartGrid)}
          chartStyles={chartStyles}
          drawingData={drawingData}
          dimetionAxis={dimetionAxis}
          metricAxisConfig={metricAxisConfig}
          color={color}
          label={label}
          size={size}
          xAxis={xAxis}
          tip={tip}
          renderType={renderType}
          legend={legend}
          onCheckTableInteract={onCheckTableInteract}
          onDoInteract={onDoInteract}
          getDataDrillDetail={getDataDrillDetail}
          isDrilling={isDrilling}
          selectedChart={this.props.selectedChart}
          whichDataDrillBrushed={this.props.whichDataDrillBrushed}
          selectedItems={this.props.selectedItems}
          onSelectChartsItems={this.props.onSelectChartsItems}
        />
      )
    } else {
      if (colKeys.length && rowKeys.length) {
        rowKeys.forEach((rk) => {
          const flatRowKey = rk.join(String.fromCharCode(0))
          const line = []
          tableWidth = 0

          colKeys.forEach((ck) => {
            const flatColKey = ck.join(String.fromCharCode(0))
            const records = tree[flatRowKey][flatColKey]

            const { width, height } = colTree[flatColKey]
            const cellWidth = getPivotCellWidth(width)
            tableWidth += cellWidth
            line.push(
              <Cell
                key={`${flatRowKey}${flatColKey}`}
                colKey={flatColKey}
                rowKey={flatRowKey}
                width={cellWidth}
                interacting={this.props.interacting}
                height={getPivotCellHeight(height)}
                metrics={metrics}
                data={records}
                chartStyles={chartStyles}
                color={color}
                legend={legend}
                ifSelectedTdToDrill={ifSelectedTdToDrill}
                isDrilling={isDrilling}
              />
            )
          })

          cells.push(
            <tr key={flatRowKey}>
              {line}
            </tr>
          )
        })
      } else if (colKeys.length) {
        const line = []
        tableWidth = 0
        colKeys.forEach((ck) => {
          const flatColKey = ck.join(String.fromCharCode(0))
          const { width, height, records } = colTree[flatColKey]
          const cellWidth = getPivotCellWidth(width)
          tableWidth += cellWidth
          line.push(
            <Cell
              key={flatColKey}
              colKey={flatColKey}
              width={cellWidth}
              interacting={this.props.interacting}
              height={getPivotCellHeight(height)}
              metrics={metrics}
              data={records}
              chartStyles={chartStyles}
              color={color}
              legend={legend}
              ifSelectedTdToDrill={ifSelectedTdToDrill}
              isDrilling={isDrilling}
            />
          )
        })

        cells.push(
          // <tr key={uuid(8, 16)}>
          <tr key="colKeyLength">
            {line}
          </tr>
        )
      } else if (rowKeys.length) {
        rowKeys.forEach((rk) => {
          const flatRowKey = rk.join(String.fromCharCode(0))
          const { height, records } = rowTree[flatRowKey]
          const line = []
          tableWidth = 0

          const cellWidth = getPivotCellWidth(rowWidths[rowWidths.length - 1])
          tableWidth += cellWidth
          line.push(
            <Cell
              key={flatRowKey}
              rowKey={flatRowKey}
              width={cellWidth}
              height={getPivotCellHeight(height)}
              metrics={metrics}
              data={records}
              interacting={this.props.interacting}
              chartStyles={chartStyles}
              color={color}
              legend={legend}
              ifSelectedTdToDrill={ifSelectedTdToDrill}
              isDrilling={isDrilling}
            />
          )

          if (line.length) {
            cells.push(
              <tr key={flatRowKey}>
                {line}
              </tr>
            )
          }
        })
      } else {
        const records = tree[0]
        if (records && metrics.length) {
          let width = 0
          metrics.forEach((m) => {
            const text = records[`${m.agg}(${m.name})`]
            width = Math.max(width, getPivotContentTextWidth(text))
          })
          const height = getPivotCellHeight()
          cells.push(
            <tr key="metricLength">
              <Cell
                key="metricsLength"
                width={width}
                height={height}
                metrics={metrics}
                data={records}
                interacting={this.props.interacting}
                chartStyles={chartStyles}
                color={color}
                legend={legend}
                ifSelectedTdToDrill={ifSelectedTdToDrill}
                isDrilling={isDrilling}
              />
            </tr>
          )
        }
      }
      tableBody = (
        <table className={styles.pivot} style={{width: tableWidth}}>
          <tbody>
            {cells}
          </tbody>
        </table>
      )
    }

    const containerClass = classnames({
      [styles.columnBody]: true,
      [styles.bodyCollapsed]: tableBodyCollapsed,
      [styles.raw]: !dimetionAxis
    })
    return (
      <div className={containerClass}>
        {tableBody}
      </div>
    )
  }
}

export default TableBody
