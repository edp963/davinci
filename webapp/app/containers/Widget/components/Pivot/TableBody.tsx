import * as React from 'react'
import * as classnames from 'classnames'
import { IPivotMetric, IDrawingData, IMetricAxisConfig } from './Pivot'
import Cell from './Cell'
import Chart, { IChartInfo, IChartUnit, IChartLine } from './Chart'
import {
  getPivotContentTextWidth,
  getPivotCellWidth,
  getPivotCellHeight,
  getChartPieces
} from '../util'
import { uuid } from '../../../../utils/util'

const styles = require('./Pivot.less')

export interface ITableBodyProps {
  rowKeys: string[][]
  colKeys: string[][]
  rowWidths: number[]
  rowTree: object
  colTree: object
  tree: object
  chart: IChartInfo
  metrics: IPivotMetric[]
  metricAxisConfig: IMetricAxisConfig
  drawingData: IDrawingData
}

export class TableBody extends React.PureComponent<ITableBodyProps, {}> {
  public render () {
    const { rowKeys, colKeys, rowTree, rowWidths, colTree, tree, chart, metrics, metricAxisConfig, drawingData } = this.props
    const { extraMetricCount, elementSize, unitMetricWidth, unitMetricHeight, tableBodyCollapsed } = drawingData
    const { dimetionAxis } = chart

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
            const record = tree[flatRowKey][flatColKey]

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
                value: record
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
                value: record
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
                width: 0,
                records: [],
                ended: false
              }
              chartLine.push(lastUnit)
            }
            lastUnit.records.push({
              key: ck[ck.length - 1],
              value: records[0]
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
              width: unitMetricWidth,
              records: [{
                key: ck[ck.length - 1],
                value: records[0]
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
              value: records[0]
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
                  value: records[0]
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
          records: records.map((r) => ({
            key: '',
            value: r
          })),
          ended: true
        }
        chartGrid.push({ height, data: [chartUnit] })
      }

      const colKeyLength = colKeys.length || 1
      const rowKeyLength = rowKeys.length || 1
      metricAxisCount = metricAxisCount || 1

      tableWidth = dimetionAxis === 'col'
        ? colKeyLength * elementSize
        : metricAxisCount * unitMetricWidth * (extraMetricCount + 1)

      tableBody = (
        <Chart
          dimetionAxisCount={dimetionAxis === 'col' ? colKeyLength : rowKeyLength}
          metricAxisCount={metricAxisCount}
          chart={chart}
          metrics={metrics}
          data={chartGrid}
          drawingData={drawingData}
          metricAxisConfig={metricAxisConfig}
          pieces={getChartPieces(colKeys.length * rowKeys.length, chartGrid.length)}
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
            const record = tree[flatRowKey][flatColKey]

            const { width, height } = colTree[flatColKey]
            const cellWidth = getPivotCellWidth(width)
            tableWidth += cellWidth
            line.push(
              <Cell
                key={`${flatRowKey}${flatColKey}`}
                width={cellWidth}
                height={getPivotCellHeight(height)}
                metrics={metrics}
                data={[record]}
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
              width={cellWidth}
              height={getPivotCellHeight(height)}
              metrics={metrics}
              data={records}
            />
          )
        })

        cells.push(
          <tr key={uuid(8, 16)}>
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
              width={cellWidth}
              height={getPivotCellHeight(height)}
              metrics={metrics}
              data={records}
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
        if (metrics.length) {
          const records = tree[0]
          let width = 0
          metrics.forEach((m) => {
            const text = records[m.name]
            width = Math.max(width, getPivotContentTextWidth(text))
          })
          const height = getPivotCellHeight()
          cells.push(
            <tr key={uuid(8, 16)}>
              <Cell
                key={uuid(8, 16)}
                width={width}
                height={height}
                metrics={metrics}
                data={records}
              />
            </tr>
          )
        }
      }
      tableBody = cells
    }

    const containerClass = classnames({
      [styles.columnBody]: true,
      [styles.bodyCollapsed]: tableBodyCollapsed,
      [styles.raw]: !dimetionAxis
    })

    return (
      <div className={containerClass}>
        <table className={styles.pivot} style={{width: tableWidth}}>
          <tbody>
            {tableBody}
          </tbody>
        </table>
      </div>
    )
  }
}

export default TableBody
