import * as React from 'react'
import * as classnames from 'classnames'
import Yaxis from './Yaxis'
import { IDrawingData, IMetricAxisConfig } from './Pivot'
import { IWidgetMetric, DimetionType, IChartStyles } from '../Widget'
import { spanSize, getPivotCellWidth, getPivotCellHeight, getAxisData, decodeMetricName, getAggregatorLocale, getPivot, getStyleConfig } from '../util'
import { PIVOT_LINE_HEIGHT, DEFAULT_SPLITER } from 'app/globalConstants'

const styles = require('./Pivot.less')

interface IRowHeaderProps {
  rows: string[]
  rowKeys: string[][]
  colKeys: string[][]
  rowWidths: number[]
  rowTree: object
  colTree: object
  tree: object
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
  metrics: IWidgetMetric[]
  metricAxisConfig: IMetricAxisConfig
  hasMetricNameDimetion: boolean
}

export class RowHeader extends React.Component<IRowHeaderProps, {}> {
  public render () {
    const { rows, rowKeys, colKeys, rowWidths, rowTree, colTree, tree, chartStyles, drawingData, dimetionAxis, metrics, metricAxisConfig, hasMetricNameDimetion } = this.props
    const { elementSize, unitMetricHeight } = drawingData
    const {
      color: fontColor,
      fontSize,
      fontFamily,
      lineColor,
      lineStyle,
      headerBackgroundColor
    } = getStyleConfig(chartStyles).pivot

    const headers = []

    if (rows.length) {
      let elementCount = 0
      let x = -1
      let hasAuxiliaryLine = false

      rowKeys.forEach((rk, i) => {
        const flatRowKey = rk.join(String.fromCharCode(0))
        const header = []
        const { height, records } = rowTree[flatRowKey]
        const maxElementCount = tree[flatRowKey]
          ? Math.max(...Object.values(tree[flatRowKey]).map((r: any[]) => r ? r.length : 0))
          : records.length
        let cellHeight = 0

        rk.forEach((txt, j) => {
          if (dimetionAxis === 'row') {
            if (j === rk.length - 1) {
              x = -1
            } else if (j === rk.length - 2) {
              const lastRk = rowKeys[i + 1] || []
              elementCount += 1
              if (rk[j] === lastRk[j]) {
                return
              } else {
                cellHeight = elementCount * elementSize
                x = 1
                elementCount = 0
                hasAuxiliaryLine = true
              }
            } else {
              x = spanSize(rowKeys, i, j)
            }
          } else {
            if (j === rk.length - 1) {
              cellHeight = dimetionAxis === 'col'
                ? unitMetricHeight * metrics.length
                : maxElementCount === 1
                  ? getPivotCellHeight(height)
                  : getPivotCellHeight(maxElementCount * (hasMetricNameDimetion ? 1 : metrics.length) * PIVOT_LINE_HEIGHT)
              hasAuxiliaryLine = dimetionAxis === 'col'
            }
            x = spanSize(rowKeys, i, j)
          }

          const columnClass = classnames({
            [styles.topBorder]: true,
            [styles.bottomBorder]: true
          })

          const contentClass = classnames({
            [styles.hasAuxiliaryLine]: hasAuxiliaryLine
          })

          if (x !== -1) {
            let colContent
            if (txt.includes(DEFAULT_SPLITER)) {
              const [name, id, agg] = txt.split(DEFAULT_SPLITER)
              colContent = `[${getAggregatorLocale(agg)}]${name}`
            } else {
              colContent = txt
            }
            header.push(
              <th
                key={`${txt}${j}`}
                rowSpan={x}
                colSpan={1}
                className={columnClass}
                style={{
                  width: getPivotCellWidth(rowWidths[j]),
                  ...(!!cellHeight && {height: cellHeight}),
                  ...!dimetionAxis && {backgroundColor: headerBackgroundColor},
                  color: fontColor,
                  fontSize: Number(fontSize),
                  fontFamily,
                  borderColor: lineColor,
                  borderStyle: lineStyle
                }}
              >
                <p
                  className={contentClass}
                  {...(!!cellHeight && {style: {height: cellHeight - 1, lineHeight: `${cellHeight - 1}px`}})}
                >
                  {colContent}
                  {hasAuxiliaryLine && (
                    <span
                      className={styles.line}
                      style={{
                        borderColor: lineColor,
                        borderStyle: lineStyle
                      }}
                    />
                  )}
                </p>
              </th>
            )
          }
        })

        headers.push(
          <tr key={flatRowKey}>
            {header}
          </tr>
        )
      })
    }

    let yAxis
    if (dimetionAxis && !(dimetionAxis === 'row' && !colKeys.length && !rowKeys.length)) {
      const { data, length } = getAxisData('y', rowKeys, colKeys, rowTree, colTree, tree, metrics, drawingData, dimetionAxis)
      yAxis = (
        <Yaxis
          height={length}
          metrics={metrics}
          data={data}
          chartStyles={chartStyles}
          dimetionAxis={dimetionAxis}
          metricAxisConfig={metricAxisConfig}
        />
      )
    }

    const containerClass = classnames({
      [styles.rowBody]: true,
      [styles.raw]: !dimetionAxis
    })

    return (
      <div className={containerClass}>
        <table className={styles.pivot}>
          <thead>
            {headers}
          </thead>
        </table>
        {yAxis}
      </div>
    )
  }
}

export default RowHeader
