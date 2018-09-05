import * as React from 'react'
import { IDrawingData, DimetionType } from './Pivot'
import { IChartInfo } from './Chart'
import { getPivotCellWidth } from '../util'

const styles = require('./Pivot.less')

interface IColumnTitleProps {
  cols: string[]
  colKeys: string[][]
  colTree: object
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export function ColumnTitle (props: IColumnTitleProps) {
  const { cols, colKeys, colTree, drawingData, dimetionAxis } = props
  const { elementSize, unitMetricWidth, unitMetricHeight } = drawingData
  let tableWidth = 0

  if (dimetionAxis) {
    tableWidth = dimetionAxis === 'col'
      ? elementSize * colKeys.length
      : elementSize * unitMetricWidth
  } else {
    tableWidth = Object.values(colTree).reduce((sum, d) => sum + getPivotCellWidth(d.width), 0)
  }

  return (
    <div className={styles.columnTitle} style={{width: tableWidth}}>
      {cols.join(`  /  `)}
    </div>
  )
}

export default ColumnTitle
