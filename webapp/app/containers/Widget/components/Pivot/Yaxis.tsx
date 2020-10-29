import React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IMetricAxisConfig } from './Pivot'
import { IWidgetMetric, DimetionType, IChartStyles } from '../Widget'
import { IChartLine, IChartUnit } from './Chart'
import { metricAxisLabelFormatter, decodeMetricName } from '../util'
import { PIVOT_DEFAULT_AXIS_LINE_COLOR } from 'app/globalConstants'

const styles = require('./Pivot.less')

interface IYaxisProps {
  height: number
  metrics: IWidgetMetric[]
  data: any[]
  chartStyles: IChartStyles
  dimetionAxis: DimetionType
  metricAxisConfig?: IMetricAxisConfig
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
    const { metrics, data, chartStyles, dimetionAxis, metricAxisConfig } = this.props
    const {
      showLine = false,
      lineStyle = '',
      lineSize = '',
      lineColor = '',
      showLabel = false,
      labelFontFamily = '',
      labelFontSize = '',
      labelColor = '',
      showTitleAndUnit = false,
      titleFontFamily = '',
      titleFontSize = '',
      titleColor = ''
    } = dimetionAxis === 'col' ? (chartStyles.yAxis || {}) : chartStyles.xAxis

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
                  padding: 2,
                  formatter: metricAxisLabelFormatter,
                  showMaxLabel: false,
                  showMinLabel: false,
                  verticalAlign: 'top'
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
              nameLocation: 'middle',
              nameGap: 45,
              nameTextStyle: {
                color: titleColor,
                fontFamily: titleFontFamily,
                fontSize: titleFontSize
              }
            }

            grid.push({
              top: dimetionAxis === 'col' ? (xSum + l * width) : ySum,
              left: dimetionAxis === 'col' ? ySum + 63 : xSum + 63,   // splitLine 对齐
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
                ...axisTitle,
                ...metricAxisStyle,
                ...metricAxisConfig[m.name].yAxis
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
                  show: showLabel,
                  color: labelColor,
                  fontFamily: labelFontFamily,
                  fontSize: labelFontSize
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
            }
            index += 1
          })
          if (dimetionAxis === 'col') {
            xSum += width * metrics.length
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
    })
  }

  public render () {
    const { data } = this.props
    const blocks = data.map((block) => (
      <div key={block.key} style={{height: block.length}} />
    ))
    return (
      <div
        className={styles.yAxis}
        ref={(f) => this.container = f}
      >
        {blocks}
      </div>
    )
  }
}

export default Yaxis
