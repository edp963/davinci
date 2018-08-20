import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IPivotMetric, IMetricAxisConfig } from './Pivot'
import { IChartInfo, IChartLine, IChartUnit } from './Chart'
import { metricAxisLabelFormatter } from '../util'

const styles = require('./Pivot.less')

interface IXaxisProps {
  width: number
  chart: IChartInfo
  metrics: IPivotMetric[]
  data: any[]
  extraMetricCount: number
  metricAxisConfig?: IMetricAxisConfig
}

export class Xaxis extends React.PureComponent<IXaxisProps, {}> {
  private container: HTMLDivElement = null

  public componentDidMount () {
    this.renderAxis()
  }

  public componentDidUpdate () {
    this.renderAxis()
  }

  private renderAxis = () => {
    const { chart, metrics, data, extraMetricCount, metricAxisConfig } = this.props
    const { dimetionAxis } = chart

    const doms = this.container.children as HTMLCollectionOf<HTMLDivElement>
    const metric = metrics[0]
    const extraMetrics = extraMetricCount > 0 ? metrics.slice(-extraMetricCount) : []
    const combinedMetrics = [metric].concat(extraMetrics)

    const grid = []
    const xAxis = []
    const yAxis = []
    let xSum = 0
    let ySum = 0
    let index = 0

    data.forEach((block, i) => {
      let instance = echarts.getInstanceByDom(doms[i])
      if (!instance) {
        instance = echarts.init(doms[i], 'default')
      } else {
        instance.clear()
      }

      block.data.forEach((line: IChartLine) => {
        const { data: lineData } = line

        lineData.forEach((unit: IChartUnit) => {
          const { width, records } = unit

          combinedMetrics.forEach((m, l) => {
            grid.push({
              top: dimetionAxis === 'col' ? xSum : ySum,
              left: dimetionAxis === 'col' ? ySum - 1 : (xSum - 1 + l * width),   // 隐藏yaxisline
              width
            })

            if (dimetionAxis === 'col') {
              xAxis.push({
                gridIndex: index,
                type: 'category',
                data: records.map((r) => r.key),
                axisLabel: {
                  interval: 0,
                  rotate: -45,
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
              yAxis.push({
                gridIndex: index,
                show: false,
                type: 'value'
              })
            } else {
              xAxis.push({
                gridIndex: index,
                type: 'value',
                ...metricAxisConfig[m.name],
                name: m.name,
                nameLocation: 'center',
                nameGap: 28,
                nameTextStyle: {
                  color: '#333'
                },
                axisLabel: {
                  color: '#333',
                  showMinLabel: false,
                  showMaxLabel: false,
                  formatter: metricAxisLabelFormatter
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
              yAxis.push({
                gridIndex: index,
                show: false,
                type: 'category'
              })
            }
            index += 1
          })
          if (dimetionAxis === 'col') {
            ySum += width
          } else {
            xSum += width * (extraMetricCount + 1)
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
    })
  }

  public render () {
    const { width, extraMetricCount, data } = this.props
    const blocks = data.map((block) => (
      <div key={block.key} style={{width: block.length}} />
    ))

    return (
      <div
        className={styles.xAxis}
        style={{width: width * (extraMetricCount + 1)}}
        ref={(f) => this.container = f}
      >
        {blocks}
      </div>
    )
  }
}

export default Xaxis
