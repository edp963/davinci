import React from 'react'
import { IDrawingData } from './Pivot'
import { DimetionType, IChartStyles } from '../Widget'
import { getPivotCellWidth, getPivot, getStyleConfig } from '../util'

const styles = require('./Pivot.less')

interface IColumnTitleProps {
  cols: string[]
  colKeys: string[][]
  colTree: object
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export function ColumnTitle (props: IColumnTitleProps) {
  const { cols, colKeys, colTree, chartStyles, drawingData, dimetionAxis } = props
  const { elementSize, unitMetricWidth } = drawingData
  const { color: fontColor } = getStyleConfig(chartStyles).pivot

  let tableWidth = 0

  if (dimetionAxis) {
    tableWidth = dimetionAxis === 'col'
      ? elementSize * colKeys.length
      : elementSize * unitMetricWidth
  } else {
    tableWidth = Object.values(colTree).reduce((sum, d) => sum + getPivotCellWidth(d.width), 0)
  }

  return (
    <div
      className={styles.columnTitle}
      style={{
        width: tableWidth,
        color: fontColor
      }}
    >
      {cols.join(`  /  `)}
    </div>
  )
}

export default ColumnTitle
