import * as React from 'react'
import { IChartProps } from './index'
import chartlibs from '../../config/chart'
import * as echarts from 'echarts/lib/echarts'
import { ECharts } from 'echarts'
import chartOptionGenerator from '../../render/chart'
const styles = require('./Chart.less')

export class Chart extends React.PureComponent<IChartProps, {}> {
  private container: HTMLDivElement = null
  private instance: ECharts

  public componentDidMount () {
    this.renderChart(this.props)
  }

  public componentDidUpdate () {
    this.renderChart(this.props)
  }

  private renderChart = (props: IChartProps) => {
    const { selectedChart, renderType } = props
    if (!this.instance) {
      this.instance = echarts.init(this.container, 'default')
    } else {
      if (renderType === 'rerender') {
        this.instance.dispose()
        this.instance = echarts.init(this.container, 'default')
      }
      if (renderType === 'clear') {
        this.instance.clear()
      }
    }
    this.instance.setOption(
      chartOptionGenerator(
        chartlibs.find((cl) => cl.id === selectedChart).name,
        props
      )
    )
    this.instance.resize()
  }

  public render () {
    return (
      <div
        className={styles.chartContainer}
        ref={(f) => this.container = f}
      />
    )
  }
}

export default Chart
