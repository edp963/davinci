import * as React from 'react'
import * as classnames from 'classnames'
import { IPivotMetric, IDrawingData } from './Pivot'
import { IChartInfo } from './Chart'
import { spanSize, getPivotCellWidth } from '../util'

const styles = require('./Pivot.less')

interface IColumnHeaderProps {
  cols: string[]
  rows: string[]
  rowWidths: number[]
  colKeys: string[][]
  colTree: object
  chart: IChartInfo
  metrics: IPivotMetric[]
  drawingData: IDrawingData
}

export class ColumnHeader extends React.PureComponent<IColumnHeaderProps, {}> {
  public tableContainer: HTMLDivElement = null
  public render () {
    const { cols, rows, rowWidths, colKeys, colTree, chart, metrics, drawingData } = this.props
    const { extraMetricCount, elementSize, unitMetricWidth } = drawingData
    const { dimetionAxis } = chart

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
              cellWidth = dimetionAxis === 'row' ? unitMetricWidth * (extraMetricCount + 1) : getPivotCellWidth(width)
              tableWidth += cellWidth
            }
            x = spanSize(colKeys, j, i)
          }

          const columnClass = classnames({
            [styles.leftBorder]: true,
            [styles.rightBorder]: true
          })

          if (x !== -1) {
            header.push(
              <th
                key={flatColKey}
                colSpan={x}
                className={columnClass}
                {...(!!cellWidth && {style: {width: cellWidth}})}
              >
                <p
                  className={styles.colContent}
                  {...(!!cellWidth && {style: {width: cellWidth - 2}})}
                >
                  {ck[i]}
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
