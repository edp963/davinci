import * as React from 'react'
import { IChartProps } from './index'
import chartlibs from '../../config/chart'
import * as echarts from 'echarts/lib/echarts'
import { ECharts } from 'echarts'
import chartOptionGenerator from '../../render/chart'
const styles = require('./Chart.less')
interface IChartState {
  selectedItems: number[]
}
export class Chart extends React.PureComponent<IChartProps, IChartState> {
  private container: HTMLDivElement = null
  private instance: ECharts
  constructor (props) {
    super(props)
    this.state = {
      selectedItems: []
    }
  }
  public componentDidMount () {
    this.renderChart(this.props)
  }

  public componentDidUpdate () {
    this.renderChart(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    const nextData = nextProps.data
    const {data} = this.props
    if (data !== nextData) {
      this.setState({
        selectedItems: []
      })
    }
  }

  private renderChart = (props: IChartProps) => {
    const { selectedChart, renderType, getDataDrillDetail, isDrilling } = props
    if (renderType === 'loading') {
      return
    }
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
        props,
        {
          instance: this.instance,
          isDrilling,
          getDataDrillDetail,
          selectedItems: this.state.selectedItems
        }
      )
    )
    this.instance.off('click')
    this.instance.on('click', (params) => {
      this.collectSelectedItems(params)
    })
    this.instance.resize()
  }
  public collectSelectedItems = (params) => {
    const { data } = this.props
    const selectedItems = [...this.state.selectedItems]
    const { getDataDrillDetail } = this.props
    const dataIndex = params.dataIndex
    if (selectedItems.length === 0) {
      selectedItems.push(dataIndex)
    } else {
      const isb = selectedItems.some((item) => item === dataIndex)
      if (isb) {
        for (let index = 0, l = selectedItems.length; index < l; index++) {
          if (selectedItems[index] === dataIndex) {
            selectedItems.splice(index, 1)
            break
          }
        }
      } else {
        selectedItems.push(dataIndex)
      }
    }
    this.setState({
      selectedItems
    }, () => {
      const resultData = this.state.selectedItems.map((item) => {
        return data[item]
      })
      const brushed = [{0: Object.values(resultData)}]
      const sourceData = Object.values(resultData)
      setTimeout(() => {
        getDataDrillDetail(JSON.stringify({range: null, brushed, sourceData}))
      }, 500)
    })
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
