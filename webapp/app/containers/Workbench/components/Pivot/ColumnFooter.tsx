import * as React from 'react'
import { IPivotMetric, IDrawingData } from './Pivot'
import { IChartInfo } from '../ChartIndicator'
import { IChartUnit, IChartLine } from './Chart'
import Xaxis from './Xaxis'
import { getAxisData } from '../util'
import { uuid } from '../../../../utils/util'

const styles = require('../../Workbench.less')

interface IColumnFooterProps {
  rowKeys: string[][]
  colKeys: string[][]
  rowTree: object
  colTree: object
  tree: object
  chart: IChartInfo
  metrics: IPivotMetric[]
  metricAxisData: object
  drawingData: IDrawingData
}

export class ColumnFooter extends React.PureComponent<IColumnFooterProps, {}> {
  public render () {
    const { rowKeys, colKeys, rowTree, colTree, tree, chart, metrics, metricAxisData, drawingData } = this.props
    const { dimetionAxis } = chart
    const { extraMetricCount } = drawingData

    let footers: IChartLine[] = []
    let tableWidth = 0

    if (dimetionAxis) {
      const { data, length } = getAxisData('x', rowKeys, colKeys, rowTree, colTree, tree, chart, drawingData)
      footers = data
      tableWidth = length
    }

    return (
      <div className={styles.columnFooter}>
        {dimetionAxis &&
          <Xaxis
            width={tableWidth}
            chart={chart}
            metrics={metrics}
            data={footers}
            extraMetricCount={extraMetricCount}
            metricAxisData={metricAxisData}
          />
        }
      </div>
    )
  }
}

export default ColumnFooter
