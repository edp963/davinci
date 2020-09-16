import React from 'react'
import classnames from 'classnames'
import { DimetionType, IChartStyles } from '../Widget'
import { getPivotCellWidth, getPivotCellHeight, getPivot, getStyleConfig } from '../util'

const styles = require('./Pivot.less')

interface ICornerProps {
  cols: string[]
  rows: string[]
  rowWidths: number[]
  chartStyles: IChartStyles
  dimetionAxis: DimetionType
}

export function Corner (props: ICornerProps) {
  const { cols, rows, rowWidths, chartStyles, dimetionAxis } = props
  const {
    color: fontColor,
    fontSize,
    fontFamily,
    lineColor,
    lineStyle,
    headerBackgroundColor
  } = getStyleConfig(chartStyles).pivot

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
        marginLeft,
        ...(cols.length || rows.length) && {
          ...!dimetionAxis && {backgroundColor: headerBackgroundColor},
          color: fontColor,
          fontSize: Number(fontSize),
          fontFamily,
          borderColor: lineColor,
          borderStyle: lineStyle
          }
      }}
    />
  )
}

export default Corner
