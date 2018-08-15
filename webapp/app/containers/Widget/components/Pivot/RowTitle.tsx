import * as React from 'react'
import { IDrawingData } from './Pivot'
import { IChartInfo } from './Chart'
import { getPivotContentTextWidth, getPivotCellHeight } from '../util'

const styles = require('./Pivot.less')

interface IRowTitleProps {
  rows: string[]
  rowKeys: string[][]
  chart: IChartInfo
  drawingData: IDrawingData
}

export function RowTitle (props: IRowTitleProps) {
  const { rows, rowKeys, chart, drawingData } = props
  const { dimetionAxis } = chart
  const { elementSize, unitMetricHeight } = drawingData
  let tableHeight = 0

  if (dimetionAxis) {
    tableHeight = dimetionAxis === 'row'
      ? elementSize * rowKeys.length
      : elementSize * unitMetricHeight
  } else {
    tableHeight = rowKeys.length * getPivotCellHeight()
  }

  const content = rows.join(`  /  `)
  const contentLength = getPivotContentTextWidth(content)

  return (
    <div
      className={styles.rowTitle}
      style={{
        width: rowKeys.length && getPivotCellHeight(),
        height: tableHeight
      }}
    >
      <p style={{transform: `translate(12px, ${contentLength / 2}px) rotate(-90deg)`}}>{content}</p>
    </div>
  )
}

export default RowTitle
