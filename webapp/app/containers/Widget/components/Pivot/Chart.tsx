import * as React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IPivotMetric, IDrawingData, IMetricAxisConfig, DimetionType, RenderType, ILegend } from './Pivot'
import chartOptionGenerator from '../../charts'
import { PIVOT_DEFAULT_AXIS_LINE_COLOR } from '../../../../globalConstants'
import { decodeMetricName, getScatter, getTooltipPosition, getTooltipLabel, getSizeValue } from '../util'
import { uuid } from '../../../../utils/util'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
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
  cols: string[]
  rows: string[]
  dimetionAxisCount: number
  metricAxisCount: number
  metrics: IPivotMetric[]
  data: IChartChunk[]
  drawingData: IDrawingData
  dimetionAxis: DimetionType
  metricAxisConfig?: IMetricAxisConfig
  scatterXaxisConfig?: IMetricAxisConfig
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  renderType: RenderType
  legend: ILegend
}

interface IChartStates {
  renderSign: string
}

export class Chart extends React.Component<IChartProps, IChartStates> {
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

  private getXaxisOption = (index, type, data?) => {
    return {
      gridIndex: index,
      type,
      axisTick: { show: false },
      axisLabel: { show: false },
      ...type === 'value' && {
        axisLine: { show: false }
      },
      ...type === 'category' && {
        axisLine: {
          lineStyle: {
            color: PIVOT_DEFAULT_AXIS_LINE_COLOR
          }
        },
        data
      }
    }
  }

  private getYaxisOption = (index, metricAxisConfig, metricName) => {
    return {
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
      ...metricAxisConfig[metricName]
    }
  }

  private renderChart = () => {
    const { cols, rows, metrics, data, drawingData, metricAxisConfig, scatterXaxisConfig, dimetionAxis, color, label, size, xAxis: scatterXaxis, legend, renderType } = this.props
    const { elementSize, unitMetricWidth, unitMetricHeight } = drawingData

    data.forEach((chunk: IChartChunk) => {
      chunk.data.forEach((block: IChartBlock) => {
        const chartPieces = this.containers[`${chunk.key}${block.key}`].children as HTMLCollectionOf<HTMLDivElement>
        const dataPieces = this.getChartPieceData(block.data, block.pieces)
        const containerWidth = block.width

        dataPieces.forEach((dp, i) => {
          const chartPiece = chartPieces[i]
          const containerHeight = dp.reduce((sum, line) => {
            const lineHeight = line.height * (dimetionAxis === 'col' ? metrics.length : 1)
            return sum + lineHeight
          }, 0)
          chartPiece.style.height = `${containerHeight}px`
          let instance = echarts.getInstanceByDom(chartPiece)
          if (!instance) {
            instance = echarts.init(chartPiece, 'default')
          } else {
            if (renderType === 'clear') {
              instance.clear()
            }
          }

          const grid = []
          const xAxis = []
          const yAxis = []
          const series = []
          const seriesData = []
          let xSum = 0
          let ySum = 0
          let index = 0

          const verticalRecordCountOfRow = dp.reduce((sum, line) => sum + line.data[0] ? line.data[0].records.length : 0, 0)

          dp.forEach((line: IChartLine, j) => {
            const { height, data: lineData } = line
            const horizontalRecordCountOfCol = lineData.reduce((sum, unit) => sum + unit.records.length, 0)
            let lineRecordSum = 0

            lineData.forEach((unit: IChartUnit, k) => {
              const { width, records } = unit

              metrics.forEach((m, l) => {
                const decodedMetricName = decodeMetricName(m.name)
                const xAxisData = records.map((r) => r.key)
                const {
                  chartOption,
                  stackOption,
                  calcPieCenterAndRadius,
                  getSymbolSize
                } = chartOptionGenerator(m.chart.name, drawingData)

                // 单次循环records做手动分类，判断条件color和label，tip只能是指标
                const currentColorItem = color.items.find((i) => i.config.actOn === m.name) || color.items.find((i) => i.config.actOn === 'all')
                const categroyLabelItems = label ? label.items.filter((i) => i.type === 'category') : []
                const currentLabelItem = categroyLabelItems.filter((i) => i.config.actOn === m.name || i.config.actOn === 'all')
                // const currentScatterXaxisItem = scatterXaxis &&
                //   (scatterXaxis.items.find((i) => i.config.actOn === m.name) || scatterXaxis.items.find((i) => i.config.actOn === 'all'))
                const currentScatterXaxisItem = scatterXaxis && scatterXaxis.items[0]
                const currentSizeItem = size && size.items[0]
                const currentSizeValue = size && (currentSizeItem ? getSizeValue(size.value[currentSizeItem.name] || size.value['all']) : getSizeValue(size.value['all']))
                const groupingItems = [].concat(currentColorItem).concat(currentLabelItem).filter((i) => !!i)

                if (!(currentScatterXaxisItem && m.chart.id === getScatter().id)) {
                  grid.push({
                    top: dimetionAxis === 'col' ? (xSum + l * height) : ySum,
                    left: dimetionAxis === 'col' ? ySum - 1 : (xSum - 1 + l * width),    // 隐藏yaxisline
                    width,
                    height
                  })
                  xAxis.push(this.getXaxisOption(index, 'category', xAxisData))
                  yAxis.push(this.getYaxisOption(index, metricAxisConfig, decodedMetricName))
                }

                if (m.chart.coordinate === 'cartesian') {
                  if (groupingItems.length) {
                    const grouped = {}
                    records.forEach((recordCollection) => {
                      const { key: colKey, value: valueCollection } = recordCollection
                      if (valueCollection) {
                        valueCollection.forEach((record) => {
                          const groupingKey = groupingItems.map((item) => record[item.name]).join(',')

                          if (currentColorItem) {
                            const legendSelectedItem = legend[currentColorItem.name]
                            if (legendSelectedItem && legendSelectedItem.includes(record[currentColorItem.name])) {
                              return false
                            }
                          }

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

                    if (currentScatterXaxisItem && m.chart.id === getScatter().id) {
                      let tempXsum = xSum
                      let tempYsum = ySum
                      xAxisData.forEach((colKey, xdIndex) => {
                        if (dimetionAxis === 'col') {
                          grid.push({
                            top: tempXsum + l * unitMetricHeight,
                            left: tempYsum - 1,    // 隐藏yaxisline
                            width: elementSize,
                            height: unitMetricHeight
                          })
                        } else {
                          grid.push({
                            top: tempYsum,
                            left: tempXsum - 1 + l * unitMetricWidth,    // 隐藏yaxisline
                            width: unitMetricWidth,
                            height: elementSize
                          })
                        }
                        xAxis.push(this.getYaxisOption(index, scatterXaxisConfig, decodeMetricName(currentScatterXaxisItem.name)))
                        yAxis.push(this.getYaxisOption(index, metricAxisConfig, decodedMetricName))
                        Object.entries((grouped)).sort().forEach(([groupingKey, groupedRecords]: [string, any[]]) => {
                          let data
                          if (groupedRecords[colKey]) {
                            data = groupedRecords[colKey].reduce((sum, record) => {
                              return [
                                sum[0] + (Number(record[`${currentScatterXaxisItem.agg}(${decodeMetricName(currentScatterXaxisItem.name)})`]) || 0),
                                sum[1] + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                currentSizeItem ? sum[2] + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 10
                              ]
                            }, [0, 0, 0])
                            data = [{
                              value: [data[0], data[1]],
                              symbolSize: currentSizeItem
                                ? getSymbolSize(currentSizeItem.name, data[2]) * currentSizeValue
                                : 10 * currentSizeValue
                            }]
                          } else {
                            data = [[0, 0, 0]]
                          }
                          series.push({
                            data,
                            color: currentColorItem
                              ? currentColorItem.config.values[groupingKey.split(',')[0]]
                              : (color.value[m.name] || color.value['all']),
                            ...currentLabelItem.length && {
                              label: {
                                show: true,
                                formatter: (params) => {
                                  return params.value
                                }
                              }
                            },
                            xAxisIndex: index,
                            yAxisIndex: index,
                            ...chartOption
                          })
                          seriesData.push({
                            type: 'scatter',
                            grouped: true,
                            records: groupedRecords[colKey]
                          })
                        })
                        if (dimetionAxis === 'col') {
                          tempYsum += elementSize
                        } else {
                          tempXsum += elementSize * metrics.length
                        }
                        if (xdIndex !== xAxisData.length - 1) {
                          index += 1
                        }
                      })
                    } else {
                      Object.entries((grouped)).sort().forEach(([groupingKey, groupedRecords]: [string, any[]]) => {
                        const data = []
                        const backupData = []
                        xAxisData.forEach((colKey) => {
                          if (m.chart.id === getScatter().id) {
                            const result = groupedRecords[colKey]
                              ? groupedRecords[colKey].reduce(([value, size], record) => [
                                  value + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                  currentSizeItem ? size + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 0
                                ], [0, 0])
                              : [0, 0]
                            console.log(currentSizeValue)
                            data.push({
                              value: result[0],
                              symbolSize: currentSizeItem
                                ? getSymbolSize(currentSizeItem.name, result[1]) * currentSizeValue
                                : 10 * currentSizeValue
                            })
                          } else {
                            if (groupedRecords[colKey]) {
                              data.push(groupedRecords[colKey].reduce((sum, record) => sum + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0), 0))
                            } else {
                              data.push(0)
                            }
                          }
                          backupData.push(groupedRecords[colKey])
                        })
                        series.push({
                          ...stackOption && {stack: `${unit.key}${m.name}`},
                          data,
                          color: currentColorItem
                            ? currentColorItem.config.values[groupingKey.split(',')[0]]
                            : (color.value[m.name] || color.value['all']),
                          ...currentLabelItem.length && {
                            label: {
                              show: true,
                              formatter: (params) => {
                                return params.value
                              }
                            }
                          },
                          xAxisIndex: index,
                          yAxisIndex: index,
                          ...chartOption
                        })
                        seriesData.push({
                          type: 'cartesian',
                          grouped: true,
                          records: backupData
                        })
                      })
                    }
                  } else {
                    if (currentScatterXaxisItem && m.chart.id === getScatter().id) {
                      let tempXsum = xSum
                      let tempYsum = ySum
                      records.forEach((recordCollection, rcIndex) => {
                        if (dimetionAxis === 'col') {
                          grid.push({
                            top: tempXsum + l * unitMetricHeight,
                            left: tempYsum - 1,    // 隐藏yaxisline
                            width: elementSize,
                            height: unitMetricHeight
                          })
                        } else {
                          grid.push({
                            top: tempYsum,
                            left: tempXsum - 1 + l * unitMetricWidth,    // 隐藏yaxisline
                            width: unitMetricWidth,
                            height: elementSize
                          })
                        }
                        xAxis.push(this.getYaxisOption(index, scatterXaxisConfig, decodeMetricName(currentScatterXaxisItem.name)))
                        yAxis.push(this.getYaxisOption(index, metricAxisConfig, decodedMetricName))
                        let data
                        if (recordCollection.value) {
                          data = recordCollection.value.reduce((sum, record) => [
                            sum[0] + (Number(record[`${currentScatterXaxisItem.agg}(${decodeMetricName(currentScatterXaxisItem.name)})`]) || 0),
                            sum[1] + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                            currentSizeItem ? sum[2] + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 10
                          ], [0, 0, 0])
                          data = [{
                            value: [data[0], data[1]],
                            symbolSize: currentSizeItem
                              ? getSymbolSize(currentSizeItem.name, data[2]) * currentSizeValue
                              : 10 * currentSizeValue
                          }]
                        } else {
                          data = [[0, 0, 0]]
                        }
                        series.push({
                          data,
                          color: color.value[m.name] || color.value['all'],
                          xAxisIndex: index,
                          yAxisIndex: index,
                          ...chartOption
                        })
                        seriesData.push({
                          type: 'scatter',
                          grouped: false,
                          records: recordCollection.value
                        })
                        if (dimetionAxis === 'col') {
                          tempYsum += elementSize
                        } else {
                          tempXsum += elementSize * metrics.length
                        }
                        if (rcIndex !== records.length - 1) {
                          index += 1
                        }
                      })
                    } else {
                      series.push({
                        data: records.map((recordCollection) => {
                          if (m.chart.id === getScatter().id) {
                            const result = recordCollection.value
                              ? recordCollection.value.reduce(([value, size], record) => [
                                  value + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                  currentSizeItem ? size + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 0
                                ], [0, 0])
                              : [0, 0]
                            return {
                              value: result[0],
                              symbolSize: currentSizeItem
                                ? getSymbolSize(currentSizeItem.name, result[1]) * currentSizeValue
                                : 10 * currentSizeValue
                            }
                          } else {
                            return recordCollection.value
                              ? recordCollection.value.reduce((sum, record) => sum + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0), 0)
                              : 0
                          }
                        }),
                        color: color.value[m.name] || color.value['all'],
                        xAxisIndex: index,
                        yAxisIndex: index,
                        ...chartOption
                      })
                      seriesData.push({
                        type: 'cartesian',
                        grouped: false,
                        records
                      })
                    }
                  }
                } else {
                  records.forEach((recordCollection, r) => {
                    const centerAndRadius = calcPieCenterAndRadius(
                      dimetionAxis,
                      containerWidth,
                      containerHeight,
                      elementSize,
                      [unitMetricHeight, unitMetricWidth],
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

                    let data = []
                    if (groupingItems.length) {
                      if (recordCollection.value) {
                        const legendSelectedItem = legend[currentColorItem.name]
                        recordCollection.value.forEach((record) => {
                          if (legendSelectedItem && legendSelectedItem.includes(record[currentColorItem.name])) {
                            return false
                          }
                          data.push({
                            name: recordCollection.key,
                            value: record[`${m.agg}(${decodedMetricName})`],
                            itemStyle: {
                              color: currentColorItem
                                ? currentColorItem.config.values[record[currentColorItem.name]]
                                : (color.value[m.name] || color.value['all'])
                            }
                          })
                        })
                      }
                    } else {
                      data = [{
                        name: recordCollection.key,
                        value: recordCollection.value
                          ? recordCollection.value.reduce((sum, record) => sum + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0), 0)
                          : 0,
                        itemStyle: {
                          color: color.value[m.name] || color.value['all']
                        }
                      }]
                    }
                    series.push({
                      data,
                      ...currentLabelItem.length
                        ? {
                          label: {
                            show: true,
                            formatter: (params) => {
                              return params.value
                            }
                          }
                        }
                        : {
                          label: {
                            show: false
                          }
                        },
                      ...centerAndRadius,
                      ...chartOption
                    })
                    seriesData.push({
                      type: 'polar',
                      grouped: !!groupingItems.length,
                      records: recordCollection.value
                    })
                  })
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
          // console.log(grid)
          // console.log(xAxis)
          // console.log(yAxis)
          console.log(series)
          console.log(seriesData)

          instance.setOption({
            tooltip: {
              position: getTooltipPosition,
              formatter: getTooltipLabel(seriesData, cols, rows, metrics, color, label, size, scatterXaxis)
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
