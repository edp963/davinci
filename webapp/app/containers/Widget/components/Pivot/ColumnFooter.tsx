import React from 'react'
import { IDrawingData, IMetricAxisConfig } from './Pivot'
import { IWidgetMetric , DimetionType, IChartStyles } from '../Widget'
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
  metrics: IWidgetMetric[]
  metricAxisConfig: IMetricAxisConfig
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
}

export class ColumnFooter extends React.Component<IColumnFooterProps, {}> {
  public render () {
    const { rowKeys, colKeys, rowTree, colTree, tree, metrics, metricAxisConfig, chartStyles, drawingData, dimetionAxis } = this.props
    const { elementSize } = drawingData

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
            chartStyles={chartStyles}
            dimetionAxis={dimetionAxis}
            elementSize={elementSize}
          />
        }
      </div>
    )
  }
}

export default ColumnFooter
