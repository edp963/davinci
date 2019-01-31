import React, { Component } from 'react'
import { IWidgetProps } from '../Widget'
import Table from './Table'
import Scorecard from './Scorecard'
import Iframe from './Iframe'
import Chart from './Chart'
import ChartTypes from '../../config/chart/ChartTypes'

export interface IChartProps extends IWidgetProps {
  width: number
  height: number
}

export class CombinedChart extends Component<IChartProps, {}> {
  public shouldComponentUpdate (nextProps: IChartProps) {
    return nextProps.renderType !== 'loading'
  }

  public render () {
    const { selectedChart } = this.props

    switch (selectedChart) {
      case ChartTypes.Table:
        return (
          <Table {...this.props}/>
        )
      case ChartTypes.Scorecard:
        return (
          <Scorecard {...this.props} />
        )
      case ChartTypes.Iframe:
          return (
            <Iframe {...this.props} />
          )
      default:
        return (
          <Chart {...this.props}/>
        )
    }
  }
}

export default CombinedChart
