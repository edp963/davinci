import React from 'react'
import classnames from 'classnames'
import { IDrawingData } from './Pivot'
import { IWidgetMetric, DimetionType, IChartStyles } from '../Widget'
import { spanSize, getPivotCellWidth, getAggregatorLocale, getPivot, getStyleConfig } from '../util'
import { DEFAULT_SPLITER } from 'app/globalConstants'

const styles = require('./Pivot.less')

interface IColumnHeaderProps {
  cols: string[]
  colKeys: string[][]
  colTree: object
  metrics: IWidgetMetric[]
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export class ColumnHeader extends React.Component<IColumnHeaderProps, {}> {
  public render () {
    const { cols, colKeys, colTree, metrics, chartStyles, drawingData, dimetionAxis } = this.props
    const { elementSize, unitMetricWidth } = drawingData
    const {
      color: fontColor,
      fontSize,
      fontFamily,
      lineColor,
      lineStyle,
      headerBackgroundColor
    } = getStyleConfig(chartStyles).pivot

    let tableWidth = 0
    let headers

    if (cols.length) {
      if (dimetionAxis === 'col' && cols.length === 1) {
        tableWidth = colKeys.length * elementSize
      }

      headers = cols.map((c, i) => {
        const header = []
        let elementCount = 0
        let cellWidth = 0
        let x = -1

        colKeys.forEach((ck, j) => {
          const flatColKey = ck.join(String.fromCharCode(0))
          const { width } = colTree[flatColKey]

          if (dimetionAxis === 'col') {
            if (i === cols.length - 1) {
              return
            }
            if (i === cols.length - 2) {
              const nextCk = colKeys[j + 1] || []
              elementCount += 1
              if (ck[i] === nextCk[i]) {
                return
              } else {
                cellWidth = elementCount * elementSize
                x = elementCount
                tableWidth += cellWidth
                elementCount = 0
              }
            } else {
              x = spanSize(colKeys, j, i)
            }
          } else {
            if (i === cols.length - 1) {
              cellWidth = dimetionAxis === 'row' ? unitMetricWidth * metrics.length : getPivotCellWidth(width)
              tableWidth += cellWidth
            }
            x = spanSize(colKeys, j, i)
          }

          const columnClass = classnames({
            [styles.leftBorder]: true,
            [styles.rightBorder]: true
          })

          if (x !== -1) {
            let colContent
            if (ck[i].includes(DEFAULT_SPLITER)) {
              const [name, id, agg] = ck[i].split(DEFAULT_SPLITER)
              colContent = `[${getAggregatorLocale(agg)}]${name}`
            } else {
              colContent = ck[i]
            }
            header.push(
              <th
                key={flatColKey}
                colSpan={x}
                className={columnClass}
                style={{
                  ...(!!cellWidth && {width: cellWidth}),
                  ...!dimetionAxis && {backgroundColor: headerBackgroundColor},
                  color: fontColor,
                  fontSize: Number(fontSize),
                  fontFamily,
                  borderColor: lineColor,
                  borderStyle: lineStyle
                }}
              >
                <p
                  className={styles.colContent}
                  {...(!!cellWidth && {style: {width: cellWidth - 2}})}
                >
                  {colContent}
                </p>
              </th>
            )
          }
        })
        return (
          <tr key={c}>
            {header}
          </tr>
        )
      })
    }

    const containerClass = classnames({
      [styles.columnHeader]: true,
      [styles.raw]: !dimetionAxis
    })

    return (
      <div className={containerClass}>
        <table className={styles.pivot} style={{width: tableWidth}}>
          <thead>
            {headers}
          </thead>
        </table>
      </div>
    )
  }
}

export default ColumnHeader
