import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IPivotMetric } from './Pivot'
import { IChartInfo } from '../ChartIndicator'
import { IChartLine, IChartUnit } from './Chart'
import { metricAxisLabelFormatter } from '../util'

const styles = require('../../Workbench.less')

interface IYaxisProps {
  height: number
  rowKeys: string[][]
  chart: IChartInfo
  metrics: IPivotMetric[]
  data: any[]
  extraMetricCount: number
  metricAxisData?: object
}

export class Yaxis extends React.PureComponent<IYaxisProps, {}> {
  private container: HTMLDivElement = null

  public componentDidMount () {
    this.renderAxis()
  }

  public componentDidUpdate () {
    this.renderAxis()
  }

  private renderAxis = () => {
    const { rowKeys, chart, metrics, data, extraMetricCount, metricAxisData } = this.props
    const { dimetionAxis } = chart

    const canvas = this.container.children[0] as HTMLDivElement
    const metric = metrics[0]
    const extraMetrics = extraMetricCount > 0 ? metrics.slice(-extraMetricCount) : []
    const combinedMetrics = [metric].concat(extraMetrics)

    const grid = []
    const xAxis = []
    const yAxis = []
    let xSum = 0
    let ySum = 0
    let index = 0

    let instance = echarts.getInstanceByDom(canvas)
    if (!instance) {
      instance = echarts.init(canvas, 'default')
    } else {
      instance.clear()
    }

    data.forEach((line: IChartLine) => {
      const { data: lineData } = line

      lineData.forEach((unit: IChartUnit) => {
        const { width, records } = unit

        combinedMetrics.forEach((m, l) => {
          grid.push({
            top: dimetionAxis === 'col' ? (xSum + l * width) : ySum,
            left: dimetionAxis === 'col' ? ySum + 63 : xSum + 63,   // splitLine 对齐
            width: 64,
            height: width
          })

          if (dimetionAxis === 'col') {
            xAxis.push({
              gridIndex: index,
              type: 'category',
              show: false
            })
            yAxis.push({
              gridIndex: index,
              type: 'value',
              name: m.name,
              nameLocation: 'middle',
              nameGap: 45,
              nameTextStyle: {
                color: '#333'
              },
              axisLabel: {
                color: '#333',
                padding: 2,
                formatter: metricAxisLabelFormatter,
                showMaxLabel: false,
                showMinLabel: false,
                verticalAlign: 'top'
              },
              axisLine: {
                lineStyle: {
                  color: '#d9d9d9'
                }
              },
              axisTick: {
                lineStyle: {
                  color: '#d9d9d9'
                }
              },
              ...metricAxisData[m.name]
            })
          } else {
            xAxis.push({
              gridIndex: index,
              type: 'value',
              show: false
            })
            yAxis.push({
              gridIndex: index,
              type: 'category',
              data: records.map((r) => r.key),
              axisLabel: {
                interval: 0,
                color: '#333'
              },
              axisLine: {
                lineStyle: {
                  color: '#d9d9d9'
                }
              },
              axisTick: {
                lineStyle: {
                  color: '#d9d9d9'
                }
              }
            })
          }
          index += 1
        })
        if (dimetionAxis === 'col') {
          xSum += width * (extraMetricCount + 1)
        } else {
          ySum += width
        }
      })

      if (dimetionAxis === 'col') {
        ySum = 0
      } else {
        xSum = 0
      }
    })

    instance.setOption({
      grid,
      xAxis,
      yAxis
    })
    instance.resize()
  }

  public render () {
    const { height, extraMetricCount } = this.props
    return (
      <div
        className={styles.yAxis}
        ref={(f) => this.container = f}
      >
        <div style={{height: height * (extraMetricCount + 1)}} />
      </div>
    )
  }
}

export default Yaxis
