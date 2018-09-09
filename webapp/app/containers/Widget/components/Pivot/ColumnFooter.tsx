import * as React from 'react'
import { IPivotMetric, IDrawingData, IMetricAxisConfig, DimetionType } from './Pivot'
import { IChartLine } from './Chart'
import Xaxis from './Xaxis'
import { getAxisData, decodeMetricName } from '../util'

const styles = require('./Pivot.less')

interface IColumnFooterProps {
  rowKeys: string[][]
  colKeys: string[][]
  rowTree: object
  colTree: object
  tree: object
  metrics: IPivotMetric[]
  metricAxisConfig: IMetricAxisConfig
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export class ColumnFooter extends React.Component<IColumnFooterProps, {}> {
  public render () {
    const { rowKeys, colKeys, rowTree, colTree, tree, metrics, metricAxisConfig, drawingData, dimetionAxis } = this.props
    const { elementSize, unitMetricHeight } = drawingData

    let footers: IChartLine[] = []
    let tableWidth = 0

    if (dimetionAxis) {
      const { data, length } = getAxisData('x', rowKeys, colKeys, rowTree, colTree, tree, metrics, drawingData, dimetionAxis)
      footers = data
      tableWidth = length
    }

    return (
      <div className={styles.columnFooter}>
        {dimetionAxis &&
          <Xaxis
            width={tableWidth}
            metrics={metrics}
            data={footers}
            metricAxisConfig={metricAxisConfig}
            dimetionAxis={dimetionAxis}
            elementSize={elementSize}
          />
        }
      </div>
    )
  }
}

export default ColumnFooter
