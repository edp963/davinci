import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import * as classnames from 'classnames'
import { IPivotMetric, IDrawingData, IMetricAxisConfig } from './Pivot'
import { metricAxisLabelFormatter } from '../util'
import { uuid } from '../../../../utils/util'

const styles = require('./Pivot.less')

type DimetionType = 'row' | 'col'

export interface IChartInfo {
  id: number
  name: string
  icon: string
  requireDimetions: number | number[],
  requireMetrics: number | number[],
  dimetionAxis?: DimetionType
}

export interface IChartUnit {
  key?: string
  width: number
  records: any[]
  ended: boolean
}

export interface IChartLine {
  key?: string
  height?: number
  data: IChartUnit[]
}

interface IChartProps {
  dimetionAxisCount: number
  metricAxisCount: number
  chart: IChartInfo
  metrics: IPivotMetric[]
  data: IChartLine[]
  drawingData: IDrawingData
  metricAxisConfig?: IMetricAxisConfig
  pieces: number
}

interface IChartStates {
  width: number
  height: number
}

export class Chart extends React.PureComponent<IChartProps, IChartStates> {
  constructor (props) {
    super(props)
    this.state = {
      width: 0,
      height: 0
    }
  }

  private container: HTMLDivElement = null

  public componentWillMount () {
    this.calcChartSize(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    this.calcChartSize(nextProps)
  }

  public componentDidMount () {
    this.renderChart()
  }

  public componentDidUpdate () {
    this.renderChart()
  }

  private calcChartSize = (props: IChartProps) => {
    const { dimetionAxisCount, metricAxisCount, chart, drawingData } = props
    const { extraMetricCount, elementSize, unitMetricWidth, unitMetricHeight } = drawingData
    const { dimetionAxis } = chart
    let width
    let height
    if (dimetionAxis === 'col') {
      width = dimetionAxisCount * elementSize
      height = metricAxisCount * unitMetricHeight * (extraMetricCount + 1)
    } else {
      width = metricAxisCount * unitMetricWidth * (extraMetricCount + 1)
      height = dimetionAxisCount * elementSize
    }
    this.setState({ width, height })
  }

  private getChartPieceData = (data, pieces) => {
    const dataLength = data.length
    return data.reduce((arr, d, i) => {
      let renderLine
      if (i % (Math.ceil(dataLength / pieces)) === 0) {
        renderLine = []
        arr.push(renderLine)
      } else {
        renderLine = arr[arr.length - 1]
      }
      renderLine.push(d)
      return arr
    }, [])
  }

  private renderChart = () => {
    const { chart, metrics, data, drawingData, metricAxisConfig, pieces } = this.props
    const { elementSize, extraMetricCount } = drawingData
    const { dimetionAxis } = chart

    const chartPieces = this.container.children as HTMLCollectionOf<HTMLDivElement>
    const dataPieces = this.getChartPieceData(data, pieces)
    const metric = metrics[0]
    const extraMetrics = extraMetricCount > 0 ? metrics.slice(-extraMetricCount) : []
    const combinedMetrics = [metric].concat(extraMetrics)

    dataPieces.forEach((dp, i) => {
      const grid = []
      const xAxis = []
      const yAxis = []
      const series = []
      let xSum = 0
      let ySum = 0
      let index = 0

      const chartPiece = chartPieces[i]
      chartPiece.style.height = `${dp.reduce((sum, line) => {
        const lineHeight = line.height * (dimetionAxis === 'col' ? extraMetricCount + 1 : 1)
        return sum + lineHeight
      }, 0)}px`
      let instance = echarts.getInstanceByDom(chartPiece)
      if (!instance) {
        instance = echarts.init(chartPiece, 'default')
      }

      dp.forEach((line: IChartLine) => {
        const { height, data: lineData } = line

        lineData.forEach((unit: IChartUnit) => {
          const { width, records } = unit

          combinedMetrics.forEach((m, l) => {
            grid.push({
              top: dimetionAxis === 'col' ? (xSum + l * height) : ySum,
              left: dimetionAxis === 'col' ? ySum - 1 : (xSum - 1 + l * width),    // 隐藏yaxisline
              width,
              height
            })
            xAxis.push({
              gridIndex: index,
              type: 'category',
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              data: records.map((r) => r.key)
            })
            yAxis.push({
              gridIndex: index,
              type: 'value',
              axisLine: {
                lineStyle: {
                  color: '#d9d9d9'
                }
              },
              axisTick: { show: false },
              axisLabel: { show: false },
              ...metricAxisConfig[m.name]
            })
            series.push({
              xAxisIndex: index,
              yAxisIndex: index,
              type: chart.id === 2 ? 'line' : 'bar',
              data: records.map((d) => d.value ? d.value[`${m.agg}(${m.name})`] : 0),
              barWidth: elementSize * .8,
              color: '#1B98E0'
              // label: {
              //   show: true,
              //   formatter: (params) => {
              //     return metricAxisLabelFormatter(params.value)
              //   }
              // }
            })
            index += 1
          })

          if (dimetionAxis === 'col') {
            ySum += width
          } else {
            xSum += width * (extraMetricCount + 1)
          }
        })

        if (dimetionAxis === 'col') {
          xSum += height * (extraMetricCount + 1)
          ySum = 0
        } else {
          ySum += height
          xSum = 0
        }
      })

      if (chart.id === 4) {
        instance.setOption({
          tooltip: {},
          grid,
          yAxis: xAxis,
          xAxis: yAxis,
          series
        })
      } else {
        instance.setOption({
          tooltip: {
            position (point, params, dom, rect, size) {
              return [point[0], point[1]]
            }
            // formatter (params) {
            //   return `就是： ${params.value}`
            // }
          },
          grid,
          xAxis,
          yAxis,
          series
        })
      }
      instance.resize()
    })
  }

  public render () {
    const { pieces } = this.props
    const { width, height } = this.state

    const chartPieces = Array.from(Array(pieces), (o, i) => (
      <div key={uuid(8, 16)} />
    ))

    return (
      <tr>
        <td className={styles.chartCell} style={{width, height}}>
          <div className={styles.container} ref={(f) => this.container = f}>
            {chartPieces}
          </div>
        </td>
      </tr>
    )
  }
}

export default Chart
