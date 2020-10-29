import React from 'react'
import * as echarts from 'echarts/lib/echarts'
import { IDrawingData, IMetricAxisConfig, ILegend } from './Pivot'
import { IWidgetMetric, DimetionType, RenderType, IChartStyles } from '../Widget'
import chartOptionGenerator from '../../render/pivot'
import { PIVOT_DEFAULT_SCATTER_SIZE } from 'app/globalConstants'
import { decodeMetricName, getTooltipPosition, getPivotTooltipLabel, getSizeValue, getChartLabel, getTriggeringRecord } from '../util'
import { uuid } from 'utils/util'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import PivotTypes from '../../config/pivot/PivotTypes'
const styles = require('./Pivot.less')

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
  metrics: IWidgetMetric[]
  data: IChartChunk[]
  chartStyles: IChartStyles
  drawingData: IDrawingData
  dimetionAxis: DimetionType
  metricAxisConfig?: IMetricAxisConfig
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  tip?: IDataParamProperty
  renderType: RenderType
  legend: ILegend
  onCheckTableInteract?: () => boolean
  onDoInteract?: (triggerData: any) => void
  getDataDrillDetail?: (position: string) => void
  isDrilling?: boolean
  whichDataDrillBrushed?: boolean | object []
  selectedChart: number
  selectedItems?: string[] | number[]
  onSelectChartsItems?: (selectedItems: number[]) => void
  // onHideDrillPanel?: (swtich: boolean) => void
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
    const {
      showVerticalLine = false,
      verticalLineStyle = '',
      verticalLineSize = '',
      verticalLineColor = ''
    } = this.props.chartStyles.splitLine || {}

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
            color: verticalLineColor
          }
        },
        data
      },
      splitLine: {
        show: showVerticalLine,
        interval: 0,
        lineStyle: {
          color: verticalLineColor,
          width: verticalLineSize,
          type: verticalLineStyle
        }
      }
    }
  }

  private getYaxisOption = (index, metricAxisConfig, coordinate, isScatterXAxis?) => {
    const {
      showHorizontalLine = false,
      horizontalLineStyle = '',
      horizontalLineSize = '',
      horizontalLineColor = '',
      showVerticalLine = false,
      verticalLineStyle = '',
      verticalLineSize = '',
      verticalLineColor = ''
    } = this.props.chartStyles.splitLine || {}

    return {
      gridIndex: index,
      type: 'value',
      axisLine: {
        show: showHorizontalLine,
        lineStyle: {
          color: horizontalLineColor,
          width: horizontalLineSize,
          type: horizontalLineStyle
        }
      },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: {
        show: coordinate === 'cartesian' && (isScatterXAxis ? showVerticalLine : showHorizontalLine),
        lineStyle: {
          color: isScatterXAxis ? verticalLineColor : horizontalLineColor,
          width: isScatterXAxis ? verticalLineSize : horizontalLineSize,
          type: isScatterXAxis ? verticalLineStyle : horizontalLineStyle
        }
      },
      ...metricAxisConfig
    }
  }

  private renderChart = () => {
    const {
      cols,
      rows,
      metrics,
      data,
      drawingData,
      metricAxisConfig,
      dimetionAxis,
      color,
      label,
      size,
      xAxis: scatterXAxis,
      tip,
      legend,
      renderType,
      selectedItems
    } = this.props
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

                const currentColorItem = color.items.find((i) => i.config.actOn === m.name) || color.items.find((i) => i.config.actOn === 'all')
                const currentLabelItem = label && (label.items.find((i) => i.config.actOn === m.name) || label.items.find((i) => i.config.actOn === 'all'))
                const currentScatterXAxisItem = scatterXAxis && scatterXAxis.items[0]
                const currentSizeItem = size && (size.items.find((i) => i.config.actOn === m.name) || size.items.find((i) => i.config.actOn === 'all'))
                const currentSizeValue = size && (currentSizeItem ? getSizeValue(size.value[currentSizeItem.name] || size.value['all']) : getSizeValue(size.value['all']))
                const groupingItems = [].concat(currentColorItem)
                  .concat(currentLabelItem && currentLabelItem.type === 'category' && currentLabelItem)
                  .filter((i) => !!i)

                if (!(currentScatterXAxisItem && m.chart.id === PivotTypes.Scatter)) {
                  grid.push({
                    top: dimetionAxis === 'col' ? (xSum + l * height) : ySum,
                    left: dimetionAxis === 'col' ? ySum - 1 : (xSum - 1 + l * width),    // 隐藏yaxisline
                    width,
                    height
                  })
                  xAxis.push(this.getXaxisOption(index, 'category', xAxisData))
                  yAxis.push(this.getYaxisOption(index, metricAxisConfig[m.name].yAxis, m.chart.coordinate))
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

                    if (currentScatterXAxisItem && m.chart.id === PivotTypes.Scatter) {
                      let tempXsum = xSum
                      let tempYsum = ySum
                      xAxisData.forEach((colKey, xdIndex) => {
                        if (dimetionAxis === 'col') {
                          grid.push({
                            top: tempXsum + l * unitMetricHeight,
                            left: tempYsum - 1,    // 隐藏yaxisline
                            width: elementSize,
                            height: unitMetricHeight
                          })
                        } else {
                          grid.push({
                            top: tempYsum,
                            left: tempXsum - 1 + l * unitMetricWidth,    // 隐藏yaxisline
                            width: unitMetricWidth,
                            height: elementSize
                          })
                        }
                        xAxis.push(this.getYaxisOption(index, metricAxisConfig[m.name].scatterXAxis, m.chart.coordinate, true))
                        yAxis.push(this.getYaxisOption(index, metricAxisConfig[m.name].yAxis, m.chart.coordinate))
                        Object.entries((grouped)).sort().forEach(([groupingKey, groupedRecords]: [string, any[]]) => {
                          let data
                          if (groupedRecords[colKey]) {
                            data = groupedRecords[colKey].reduce((sum, record) => {
                              return [
                                sum[0] + (Number(record[`${currentScatterXAxisItem.agg}(${decodeMetricName(currentScatterXAxisItem.name)})`]) || 0),
                                sum[1] + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                currentSizeItem ? sum[2] + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : PIVOT_DEFAULT_SCATTER_SIZE
                              ]
                            }, [0, 0, 0])
                            data = [{
                              value: [data[0], data[1]],
                              symbolSize: currentSizeItem
                                ? getSymbolSize(m.name, data[2]) * currentSizeValue
                                : PIVOT_DEFAULT_SCATTER_SIZE * currentSizeValue
                            }]
                          } else {
                            data = [[0, 0, 0]]
                          }
                          series.push({
                            data,
                            color: currentColorItem
                              ? currentColorItem.config.values[groupingKey.split(',')[0]]
                              : (color.value[m.name] || color.value['all']),
                            ...currentLabelItem && {
                              label: {
                                show: true,
                                position: 'top',
                                formatter: getChartLabel(seriesData, currentLabelItem)
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
                          if (m.chart.id === PivotTypes.Scatter) {
                            const result = groupedRecords[colKey]
                              ? groupedRecords[colKey].reduce(([value, size], record) => [
                                  value + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                  currentSizeItem ? size + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 0
                                ], [0, 0])
                              : [0, 0]
                            data.push({
                              value: result[0],
                              symbolSize: currentSizeItem
                                ? getSymbolSize(m.name, result[1]) * currentSizeValue
                                : PIVOT_DEFAULT_SCATTER_SIZE * currentSizeValue
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
                          ...currentLabelItem && {
                            label: {
                              show: true,
                              position: m.chart.id === PivotTypes.Bar ? 'inside' : 'top',
                              formatter: getChartLabel(seriesData, currentLabelItem)
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
                    if (currentScatterXAxisItem && m.chart.id === PivotTypes.Scatter) {
                      let tempXsum = xSum
                      let tempYsum = ySum
                      records.forEach((recordCollection, rcIndex) => {
                        if (dimetionAxis === 'col') {
                          grid.push({
                            top: tempXsum + l * unitMetricHeight,
                            left: tempYsum - 1,    // 隐藏yaxisline
                            width: elementSize,
                            height: unitMetricHeight
                          })
                        } else {
                          grid.push({
                            top: tempYsum,
                            left: tempXsum - 1 + l * unitMetricWidth,    // 隐藏yaxisline
                            width: unitMetricWidth,
                            height: elementSize
                          })
                        }
                        xAxis.push(this.getYaxisOption(index, metricAxisConfig[m.name].scatterXAxis, m.chart.coordinate, true))
                        yAxis.push(this.getYaxisOption(index, metricAxisConfig[m.name].yAxis, m.chart.coordinate))
                        let data
                        if (recordCollection.value) {
                          data = recordCollection.value.reduce((sum, record) => [
                            sum[0] + (Number(record[`${currentScatterXAxisItem.agg}(${decodeMetricName(currentScatterXAxisItem.name)})`]) || 0),
                            sum[1] + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                            currentSizeItem ? sum[2] + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : PIVOT_DEFAULT_SCATTER_SIZE
                          ], [0, 0, 0])
                          data = [{
                            value: [data[0], data[1]],
                            symbolSize: currentSizeItem
                              ? getSymbolSize(m.name, data[2]) * currentSizeValue
                              : PIVOT_DEFAULT_SCATTER_SIZE * currentSizeValue
                          }]
                        } else {
                          data = [[0, 0, 0]]
                        }
                        series.push({
                          data,
                          color: color.value[m.name] || color.value['all'],
                          ...currentLabelItem && {
                            label: {
                              show: true,
                              position: 'top',
                              formatter: getChartLabel(seriesData, currentLabelItem)
                            }
                          },
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
                        data: records.map((recordCollection, i) => {
                          if (m.chart.id === PivotTypes.Scatter) {
                            const result = recordCollection.value
                              ? recordCollection.value.reduce(([value, size], record) => [
                                  value + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0),
                                  currentSizeItem ? size + (Number(record[`${currentSizeItem.agg}(${decodeMetricName(currentSizeItem.name)})`]) || 0) : 0
                                ], [0, 0])
                              : [0, 0]
                            const itemStyle = selectedItems && selectedItems.length &&
                            selectedItems.some((item) => Number(item.split('&')[0]) === i && Number(item.split('&')[1]) === index)
                            ? {itemStyle: {normal: {opacity: 1, borderWidth: 6}}} : null
                            return {
                              value: result[0],
                              ...itemStyle,
                              symbolSize: currentSizeItem
                                ? getSymbolSize(m.name, result[1]) * currentSizeValue
                                : PIVOT_DEFAULT_SCATTER_SIZE * currentSizeValue
                            }
                          } else {
                            // bar line scatter
                            const itemStyle = selectedItems && selectedItems.length &&
                            selectedItems.some((item) => Number(item.split('&')[0]) === i && Number(item.split('&')[1]) === index)
                             ? {itemStyle: {normal: {opacity: 1, borderWidth: 6}}} : null
                            return recordCollection.value
                              ? {
                                value: recordCollection.value.reduce((sum, record) => sum + (Number(record[`${m.agg}(${decodedMetricName})`]) || 0), 0),
                                ...itemStyle
                              }
                              : {
                                value: 0,
                                ...itemStyle
                              }
                          }
                        }),
                        itemStyle: {
                          normal: {
                            opacity: selectedItems && selectedItems.length > 0 ? 0.25 : 1
                          }
                        },
                        color: color.value[m.name] || color.value['all'],
                        ...currentLabelItem && {
                          label: {
                            show: true,
                            position: 'top',
                            formatter: getChartLabel(seriesData, currentLabelItem)
                          }
                        },
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
                        const legendSelectedItem = currentColorItem && legend[currentColorItem.name]
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
                      ...currentLabelItem
                        ? {
                          label: {
                            show: true,
                            formatter: getChartLabel(seriesData, currentLabelItem)
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
          const { isDrilling, whichDataDrillBrushed, getDataDrillDetail } = this.props
          const brushedOptions = isDrilling === true ? {
            // brush: {
            //   toolbox: ['rect', 'polygon', 'keep', 'clear'],
            // //  toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
            //   throttleType: 'debounce',
            //   throttleDelay: 300,
            //   brushStyle: {
            //     borderWidth: 1,
            //     color: 'rgba(255,255,255,0.2)',
            //     borderColor: 'rgba(120,140,180,0.6)'
            //   }
            // }
          } : null

          instance.setOption({
            tooltip: {
              position: getTooltipPosition,
              formatter: getPivotTooltipLabel(seriesData, cols, rows, metrics, color, label, size, scatterXAxis, tip)
            },
          //  ...brushedOptions,
            grid,
            xAxis,
            yAxis,
            series
          })

          const { onDoInteract, onCheckTableInteract } = this.props
          if (onDoInteract) {
            instance.off('click')
            instance.on('click', (params) => {
              this.collectSelectedItems(params, seriesData)
              const isInteractiveChart = onCheckTableInteract && onCheckTableInteract()
              if (isInteractiveChart) {
                const triggerData = getTriggeringRecord(params, seriesData)
                onDoInteract(triggerData)
              }
            })
          }

          // drill
          // instance.off('click')
          // instance.on('click', (params) => {
          //   this.collectSelectedItems(params, seriesData)
          // })


          // if (isDrilling &&  whichDataDrillBrushed === false) {
          if (whichDataDrillBrushed === false) {
          //  instance.off('brushselected')
          //  instance.on('brushselected', brushselected)
            // setTimeout(function () {
            //   instance.dispatchAction({
            //     type: 'takeGlobalCursor',
            //     key: 'brush',
            //     brushOption: {
            //       brushType: 'rect',
            //       brushMode: 'multiple'
            //     }
            //   })
            // }, 0)
          }

          function brushselected (params) {
            const brushComponent = params.batch[0]
            const brushed = []
            let sourceData = []
            let range: any[] = []
            if (brushComponent.areas && brushComponent.areas.length) {
              brushComponent.areas.forEach((area) => {
                range = range.concat(area.range)
              })
            }
            if (brushComponent.selected && brushComponent.selected.length) {
              for (let i = 0; i < brushComponent.selected.length; i++) {
                const rawIndices = brushComponent.selected[i].dataIndex
                const seriesIndex = brushComponent.selected[i].seriesIndex
                brushed.push({[i]: rawIndices})
                if (rawIndices && rawIndices.length) {
                  rawIndices.forEach((raw) => {
                    const params = {
                      dataIndex: raw,
                      seriesIndex
                    }
                    sourceData = sourceData.concat(getTriggeringRecord(params, seriesData))
                  })
                }
              }
            }
            if (getDataDrillDetail) {
              getDataDrillDetail(JSON.stringify({range, brushed, sourceData}))
            }
          }
          instance.resize()
        })
      })
    })
  }


  public collectSelectedItems = (params, seriesData) => {
    const { data, onSelectChartsItems, selectedChart } = this.props
    // 透视驱动下的 selectedChart 均为1
    let selectedItems = []
    if (this.props.selectedItems && this.props.selectedItems.length) {
      selectedItems = [...this.props.selectedItems]
    }
    const { getDataDrillDetail } = this.props
    const dataIndex = params.dataIndex
    const seriesIndex = params.seriesIndex
    const formatterIndex = `${dataIndex}&${seriesIndex}`
    if (selectedItems.length === 0) {
      selectedItems.push(formatterIndex)
    } else {
      const isb = selectedItems.some((item) => item === formatterIndex)
      if (isb) {
        for (let index = 0, l = selectedItems.length; index < l; index++) {
          if (selectedItems[index] === formatterIndex) {
            selectedItems.splice(index, 1)
            break
          }
        }
      } else {
        selectedItems.push(formatterIndex)
      }
    }

    const resultData = selectedItems.map((item) => {
      return data[item]
    })
    const brushed = [{0: Object.values(resultData)}]
    setTimeout(() => {
      let sourceData = []
      selectedItems.forEach((item) => {
        const [dataIndex, seriesIndex] = item.split('&')
        sourceData = sourceData.concat(getTriggeringRecord({
          dataIndex, seriesIndex
        }, seriesData))
      })
      getDataDrillDetail(JSON.stringify({range: null, brushed, sourceData}))
    }, 500)
    if (onSelectChartsItems) {
      onSelectChartsItems(selectedItems)
    }
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
