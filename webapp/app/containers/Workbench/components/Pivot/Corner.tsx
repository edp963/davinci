import * as React from 'react'
import * as classnames from 'classnames'
import { IChartInfo } from '../ChartIndicator'
import { getPivotCellWidth, getPivotCellHeight } from '../util'

const styles = require('../../Workbench.less')

interface ICornerProps {
  cols: string[]
  rows: string[]
  rowWidths: number[]
  chart: IChartInfo
}

export function Corner (props: ICornerProps) {
  const { cols, rows, rowWidths, chart } = props
  const { dimetionAxis } = chart

  let width
  let height
  let marginTop = cols.length && 27
  let marginLeft = rows.length && 27

  if (dimetionAxis) {
    if (dimetionAxis === 'col') {
      width = rowWidths.reduce((sum, rw) => sum + getPivotCellWidth(rw), 0) + 64
      height = Math.max(0, cols.length - 1) * getPivotCellHeight()
    } else {
      width = rowWidths.slice(0, rowWidths.length - 1).reduce((sum, rw) => sum + getPivotCellWidth(rw), 0) + 64
      height = cols.length * getPivotCellHeight()
    }
  } else {
    width = rowWidths.reduce((sum, rw) => sum + getPivotCellWidth(rw), 0)
    height = cols.length * getPivotCellHeight()
    marginTop += 1
    marginLeft += 1
  }

  const cornerClass = classnames({
    [styles.corner]: true,
    [styles.raw]: !dimetionAxis && cols.length && rows.length
  })


  return (
    <div
      className={cornerClass}
      style={{
        width,
        height,
        marginTop,
        marginLeft
      }}
    />
  )
}

export default Corner
