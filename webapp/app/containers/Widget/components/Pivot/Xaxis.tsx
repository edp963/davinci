import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IPivotMetric, IMetricAxisConfig, DimetionType } from './Pivot'
import { IChartLine, IChartUnit } from './Chart'
import { metricAxisLabelFormatter, getXaxisLabel } from '../util'
import { PIVOT_DEFAULT_AXIS_LINE_COLOR, PIVOT_XAXIS_ROTATE_LIMIT } from '../../../../globalConstants'

const styles = require('./Pivot.less')

interface IXaxisProps {
  width: number
  metrics: IPivotMetric[]
  data: any[]
  metricAxisConfig?: IMetricAxisConfig
  dimetionAxis: DimetionType
  elementSize: number
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
    const { metrics, data, metricAxisConfig, dimetionAxis, elementSize } = this.props

    const doms = this.container.children as HTMLCollectionOf<HTMLDivElement>

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

          metrics.forEach((m, l) => {
            const metricAxisStyle = m.chart.coordinate === 'polar'
              ? {
                axisLabel: {
                  show: false
                },
                axisLine: {
                  lineStyle: {
                    color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                  }
                },
                axisTick: {
                  show: false
                }
              }
              : {
                axisLabel: {
                  color: '#333',
                  showMinLabel: false,
                  showMaxLabel: false,
                  formatter: metricAxisLabelFormatter
                },
                axisLine: {
                  lineStyle: {
                    color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                  }
                },
                axisTick: {
                  lineStyle: {
                    color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                  }
                }
              }

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
                interval: 0,
                axisLabel: {
                  interval: 0,
                  rotate: elementSize <= PIVOT_XAXIS_ROTATE_LIMIT ? -90 : 0,
                  color: '#333',
                  formatter: getXaxisLabel(elementSize * .8)
                },
                axisLine: {
                  lineStyle: {
                    color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                  }
                },
                axisTick: {
                  lineStyle: {
                    color: PIVOT_DEFAULT_AXIS_LINE_COLOR
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
                name: m.name,
                nameLocation: 'center',
                nameGap: 28,
                nameTextStyle: {
                  color: '#333'
                },
                ...metricAxisStyle,
                ...metricAxisConfig[m.name]
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
            xSum += width * metrics.length
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
    const { width, metrics, data } = this.props
    const blocks = data.map((block) => (
      <div key={block.key} style={{width: block.length * metrics.length}} />
    ))

    return (
      <div
        className={styles.xAxis}
        style={{width: width * metrics.length}}
        ref={(f) => this.container = f}
      >
        {blocks}
      </div>
    )
  }
}

export default Xaxis
