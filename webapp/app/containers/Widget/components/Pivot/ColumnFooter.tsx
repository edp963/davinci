import * as React from 'react'
import { IPivotMetric, IDrawingData, IMetricAxisConfig } from './Pivot'
import { IChartInfo, IChartUnit, IChartLine } from './Chart'
import Xaxis from './Xaxis'
import { getAxisData } from '../util'
import { uuid } from '../../../../utils/util'

const styles = require('./Pivot.less')

interface IColumnFooterProps {
  rowKeys: string[][]
  colKeys: string[][]
  rowTree: object
  colTree: object
  tree: object
  chart: IChartInfo
  metrics: IPivotMetric[]
  metricAxisConfig: IMetricAxisConfig
  drawingData: IDrawingData
}

export class ColumnFooter extends React.PureComponent<IColumnFooterProps, {}> {
  public render () {
    const { rowKeys, colKeys, rowTree, colTree, tree, chart, metrics, metricAxisConfig, drawingData } = this.props
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
            metricAxisConfig={metricAxisConfig}
          />
        }
      </div>
    )
  }
}

export default ColumnFooter
