import React from 'react'
import { DimetionType, IChartStyles } from '../Widget'
import { IDrawingData } from './Pivot'
import { getPivotContentTextWidth, getPivotCellHeight, getPivot, getStyleConfig } from '../util'

const styles = require('./Pivot.less')

interface IRowProps {
  name: string,
  alias: string
}

interface IRowTitleProps {
  rows: IRowProps[]
  rowKeys: string[][]
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export function RowTitle (props: IRowTitleProps) {
  const { rows, rowKeys, chartStyles, dimetionAxis, drawingData } = props
  const { elementSize, unitMetricHeight } = drawingData
  const { color: fontColor } = getStyleConfig(chartStyles).pivot
  let tableHeight = 0

  if (dimetionAxis) {
    tableHeight = dimetionAxis === 'row'
      ? elementSize * rowKeys.length
      : elementSize * unitMetricHeight
  } else {
    tableHeight = rowKeys.length * getPivotCellHeight()
  }

  const content = rows
  .map(row => {
    if (row.alias) {
      return row.alias
    } else {
      return row.name
    }
  })
  .join(`  /  `)
  const contentLength = getPivotContentTextWidth(content)

  return (
    <div
      className={styles.rowTitle}
      style={{
        width: rowKeys.length && getPivotCellHeight(),
        height: tableHeight,
        color: fontColor
      }}
    >
      <p style={{transform: `translate(12px, ${contentLength / 2}px) rotate(-90deg)`}}>{content}</p>
    </div>
  )
}

export default RowTitle
