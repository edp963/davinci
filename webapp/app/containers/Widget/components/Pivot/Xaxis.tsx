import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IMetricAxisConfig } from './Pivot'
import { IWidgetMetric, DimetionType, IChartStyles } from '../Widget'
import { IChartLine, IChartUnit } from './Chart'
import { metricAxisLabelFormatter, getXaxisLabel, decodeMetricName } from '../util'
import { PIVOT_DEFAULT_AXIS_LINE_COLOR, PIVOT_XAXIS_ROTATE_LIMIT } from 'app/globalConstants'

const styles = require('./Pivot.less')

interface IXaxisProps {
  width: number
  metrics: IWidgetMetric[]
  data: any[]
  metricAxisConfig?: IMetricAxisConfig
  dimetionAxis: DimetionType
  chartStyles: IChartStyles
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
    const { metrics, data, metricAxisConfig, dimetionAxis, chartStyles, elementSize } = this.props
    const {
      showLine,
      lineStyle,
      lineSize,
      lineColor,
      showLabel,
      labelFontFamily,
      labelFontSize,
      labelColor,
      showTitleAndUnit,
      titleFontFamily,
      titleFontSize,
      titleColor
    } = dimetionAxis === 'col' ? chartStyles.xAxis : chartStyles.yAxis

    const doms = this.container.children as HTMLCollectionOf<HTMLDivElement>

    data.forEach((block, i) => {
      let instance = echarts.getInstanceByDom(doms[i])
      if (!instance) {
        instance = echarts.init(doms[i], 'default')
      } else {
        instance.clear()
      }

      const grid = []
      const xAxis = []
      const yAxis = []
      let xSum = 0
      let ySum = 0
      let index = 0

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
                  show: showLabel,
                  color: labelColor,
                  fontFamily: labelFontFamily,
                  fontSize: labelFontSize,
                  showMinLabel: false,
                  showMaxLabel: false,
                  formatter: metricAxisLabelFormatter
                },
                axisLine: {
                  show: showLine,
                  lineStyle: {
                    color: lineColor,
                    width: lineSize,
                    type: lineStyle
                  }
                },
                axisTick: {
                  show: showLine,
                  lineStyle: {
                    color: lineColor
                  }
                }
              }

            const axisTitle = showTitleAndUnit && {
              name: decodeMetricName(m.name),
              nameLocation: 'center',
              nameGap: 28,
              nameTextStyle: {
                color: titleColor,
                fontFamily: titleFontFamily,
                fontSize: titleFontSize
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
                  show: showLabel,
                  color: labelColor,
                  fontFamily: labelFontFamily,
                  fontSize: labelFontSize,
                  interval: 0,
                  rotate: elementSize <= PIVOT_XAXIS_ROTATE_LIMIT ? -90 : 0,
                  formatter: getXaxisLabel(elementSize * .8)
                },
                axisLine: {
                  show: showLine,
                  lineStyle: {
                    color: lineColor,
                    width: lineSize,
                    type: lineStyle
                  }
                },
                axisTick: {
                  show: showLine,
                  lineStyle: {
                    color: lineColor
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
                ...axisTitle,
                ...metricAxisStyle,
                ...metricAxisConfig[m.name].yAxis
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
    const { width, data } = this.props

    const blocks = data.map((block) => (
      <div key={block.key} style={{width: block.length}} />
    ))

    return (
      <div
        className={styles.xAxis}
        style={{width}}
        ref={(f) => this.container = f}
      >
        {blocks}
      </div>
    )
  }
}

export default Xaxis
