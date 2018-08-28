import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IPivotMetric, IDrawingData, IMetricAxisConfig, DimetionType, RenderType } from './Pivot'
import chartOptionGenerator from '../../charts'
import { PIVOT_DEFAULT_AXIS_LINE_COLOR } from '../../../../globalConstants'
import { decodeMetricName } from '../util'
import { uuid } from '../../../../utils/util'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const styles = require('./Pivot.less')

export interface IChartInfo {
  id: number
  name: string
  title: string
  icon: string
  coordinate: 'cartesian' | 'polar' | 'other'
  requireDimetions: number | number[],
  requireMetrics: number | number[],
  dimetionAxis?: DimetionType
  data: object,
  style: object
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

export interface IChartBlock {
  key?: string
  width?: number
  data: IChartLine[]
  pieces: number
}

export interface IChartChunk {
  key?: string
  height?: number
  data: IChartBlock[]
}

interface IChartProps {
  width: number
  height: number
  dimetionAxisCount: number
  metricAxisCount: number
  metrics: IPivotMetric[]
  data: IChartChunk[]
  drawingData: IDrawingData
  dimetionAxis: DimetionType
  metricAxisConfig?: IMetricAxisConfig
  color?: IDataParamProperty
  label?: IDataParamProperty
  renderType: RenderType
}

interface IChartStates {
  renderSign: string
}

export class Chart extends React.PureComponent<IChartProps, IChartStates> {
  constructor (props) {
    super(props)
    this.state = {
      renderSign: ''
    }
  }

  private containers: { [key: string]: HTMLDivElement } = {}

  public componentDidMount () {
    this.renderChart()
  }

  public componentDidUpdate () {
    this.renderChart()
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.renderType === 'rerender') {
      this.setState({ renderSign: uuid(8, 16) })
    }
  }

  public componentWillUnmount () {
    // dispose chart instances
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
    const { metrics, data, drawingData, metricAxisConfig, dimetionAxis, color, label } = this.props
    const { elementSize } = drawingData

    data.forEach((chunk: IChartChunk) => {
      chunk.data.forEach((block: IChartBlock) => {
        const chartPieces = this.containers[`${chunk.key}${block.key}`].children as HTMLCollectionOf<HTMLDivElement>
        const dataPieces = this.getChartPieceData(block.data, block.pieces)
        const containerWidth = block.width

        dataPieces.forEach((dp, i) => {
          const chartPiece = chartPieces[i]
          chartPiece.style.height = `${dp.reduce((sum, line) => {
            const lineHeight = line.height * (dimetionAxis === 'col' ? metrics.length : 1)
            return sum + lineHeight
          }, 0)}px`
          let instance = echarts.getInstanceByDom(chartPiece)
          if (!instance) {
            instance = echarts.init(chartPiece, 'default')
          } else {
            instance.clear()
          }

          const grid = []
          const xAxis = []
          const yAxis = []
          const series = []
          const s2 = []
          let xSum = 0
          let ySum = 0
          let index = 0

          const verticalRecordCountOfRow = dp.reduce((s1, line) => s1 + line.data[0].records.length, 0)

          dp.forEach((line: IChartLine, j) => {
            const { height, data: lineData } = line
            const horizontalRecordCountOfCol = lineData.reduce((sum, unit) => sum + unit.records.length, 0)
            const containerHeight = height
            let lineRecordSum = 0

            lineData.forEach((unit: IChartUnit, k) => {
              const { width, records } = unit

              metrics.forEach((m, l) => {
                const decodedMetricName = decodeMetricName(m.name)
                const xAxisData = records.map((r) => r.key)
                const {
                  chartOption,
                  stackOption,
                  calcPieCenterAndRadius
                } = chartOptionGenerator(m.chart.name, elementSize)

                grid.push({
                  top: dimetionAxis === 'col' ? (xSum + l * height) : ySum,
                  left: dimetionAxis === 'col' ? ySum - 1 : (xSum - 1 + l * width),    // 隐藏yaxisline
                  width,
                  height
                })
                xAxis.push({
                  gridIndex: index,
                  type: 'category',
                  axisLine: {
                    lineStyle: {
                      color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                    }
                  },
                  axisTick: { show: false },
                  axisLabel: { show: false },
                  data: xAxisData
                })
                yAxis.push({
                  gridIndex: index,
                  type: 'value',
                  axisLine: {
                    lineStyle: {
                      color: PIVOT_DEFAULT_AXIS_LINE_COLOR
                    }
                  },
                  axisTick: { show: false },
                  axisLabel: { show: false },
                  splitLine: {
                    lineStyle: {
                      type: 'dotted'
                    }
                  },
                  ...metricAxisConfig[decodedMetricName]
                })

                const commonSeriesData = {
                  xAxisIndex: index,
                  yAxisIndex: index,
                  ...chartOption
                }

                // 单次循环records做手动分类，判断条件color和label，tip只能是指标
                const currentColorItem = color.items.find((i) => i.config.actOn === m.name) || color.items.find((i) => i.config.actOn === 'all')
                const categroyLabelItems = label ? label.items.filter((i) => i.type === 'category') : []
                // const currentLabelItem = categroyLabelItems.filter((i) => i.config.actOn === m.name || i.config.actOn === 'all')
                const currentLabelItem = categroyLabelItems
                const groupingItems = [].concat(currentColorItem).concat(currentLabelItem).filter((i) => !!i)

                if (m.chart.coordinate === 'cartesian') {
                  if (groupingItems.length) {
                    const grouped = {}
                    records.forEach((recordCollection) => {
                      const { key: colKey, value: valueCollection } = recordCollection
                      if (valueCollection) {
                        valueCollection.forEach((record) => {
                          const groupingKey = groupingItems.map((item) => record[item.name]).join(',')
                          if (!grouped[groupingKey]) {
                            grouped[groupingKey] = {}
                          }
                          if (!grouped[groupingKey][colKey]) {
                            grouped[groupingKey][colKey] = []
                          }
                          grouped[groupingKey][colKey].push(record)
                        })
                      }
                    })
                    Object.entries((grouped)).sort().forEach(([groupingKey, groupedRecords]: [string, any[]]) => {
                      series.push({
                        ...stackOption && {stack: `${unit.key}${m.name}`},
                        data: xAxisData.map((colKey) => {
                          return groupedRecords[colKey]
                            ? groupedRecords[colKey].reduce((sum, record) => sum + record[`${m.agg}(${decodedMetricName})`], 0)
                            : 0
                        }),
                        // data: groupedRecords.map((gr) => gr[`${m.agg}(${decodedMetricName})`]),
                        color: currentColorItem
                          ? currentColorItem.config.values[groupingKey.split(',')[0]]
                          : (color.value[m.name] || defaultThemeColors[0]),
                        ...currentLabelItem.length && {
                          label: {
                            show: true,
                            formatter: (params) => {
                              return params.value
                            }
                          }
                        },
                        ...commonSeriesData
                      })
                      s2.push(groupedRecords)
                    })
                    // console.log(s2)
                  } else {
                    series.push({
                      data: records.map((recordCollection) => {
                        return recordCollection.value
                          ? recordCollection.value.reduce((sum, record) => sum + record[`${m.agg}(${decodedMetricName})`], 0)
                          : 0
                      }),
                      color: color.value[m.name] || defaultThemeColors[0],
                      ...commonSeriesData
                    })
                    s2.push(records)
                  }
                } else {
                  records.forEach((recordCollection, r) => {
                    const centerAndRadius = calcPieCenterAndRadius(
                      dimetionAxis,
                      containerWidth,
                      containerHeight,
                      horizontalRecordCountOfCol,
                      verticalRecordCountOfRow,
                      lineRecordSum,
                      dp.length,
                      lineData.length,
                      metrics.length,
                      records.length,
                      j,
                      k,
                      l,
                      r
                    )
                    series.push({
                      data: groupingItems.length
                        ? recordCollection.value
                          ? recordCollection.value.map((record) => ({
                              name: recordCollection.key,
                              value: record[`${m.agg}(${decodedMetricName})`],
                              itemStyle: {
                                color: currentColorItem
                                  ? currentColorItem.config.values[record[currentColorItem.name]]
                                  : (color.value[m.name] || defaultThemeColors[0])
                              }
                            }))
                          : []
                        : [{
                          name: recordCollection.key,
                          value: recordCollection.value
                            ? recordCollection.value.reduce((sum, record) => sum + record[`${m.agg}(${decodedMetricName})`], 0)
                            : 0,
                          itemStyle: {
                            color: color.value[m.name] || defaultThemeColors[0]
                          }
                        }],
                      ...centerAndRadius,
                      ...commonSeriesData
                    })
                    s2.push(recordCollection)
                  })
                  s2.push(records)
                }
                index += 1
              })

              lineRecordSum += records.length

              if (dimetionAxis === 'col') {
                ySum += width
              } else {
                xSum += width * metrics.length
              }
            })

            if (dimetionAxis === 'col') {
              xSum += height * metrics.length
              ySum = 0
            } else {
              ySum += height
              xSum = 0
            }
          })
          console.log(grid)
          console.log(series)

          instance.setOption({
            tooltip: {
              position (point, params, dom, rect, size) {
                return [point[0], point[1]]
              }
              // formatter (params) {
              //   const { seriesIndex, dataIndex } = params
              //   console.log(s2[seriesIndex][dataIndex])
              //   return `就是： ${params.value}`
              // }
            },
            grid,
            xAxis,
            yAxis,
            series
          })
          instance.resize()
        })
      })
    })
  }

  public render () {
    const { width, height, data } = this.props

    const { renderSign } = this.state
    const chunks = data.map((chunk, i) => {
      const blocks = chunk.data.map((block, j) => {
        const pieces = Array.from(Array(block.pieces), (u, k) => (
          <div key={`${renderSign}${i}${j}${k}`} />
        ))
        return (
          <div
            key={block.key}
            className={styles.chartColumn}
            style={{width: block.width}}
            ref={(f) => this.containers[`${chunk.key}${block.key}`] = f}
          >
            {pieces}
          </div>
        )
      })
      return (
        <div
          key={chunk.key}
          className={styles.chartRow}
          style={{height: chunk.height}}
        >
          {blocks}
        </div>
      )
    })

    return (
      <div className={styles.chartContainer} style={{width, height}}>
        {chunks}
      </div>
    )
  }
}

export default Chart
