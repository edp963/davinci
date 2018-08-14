import * as React from 'react'
import * as classnames from 'classnames'
import Dropbox, { DragType, DropboxType, ViewModelType, DropboxSize, DropType, SortType, AggregatorType, IDataParamSource} from './components/Dropbox'
import ChartIndicator, { IChartInfo } from './components/ChartIndicator'
import { IPivotProps } from './components/Pivot/Pivot'
import ScrollablePivot from './components/Pivot'
import { encodeMetricName, decodeMetricName, checkChartEnable } from './components/util'

const Icon = require('antd/lib/icon')
const styles = require('./Workbench.less')
const utilStyles = require('../../assets/less/util.less')

import request from '../../utils/request'

interface IDataParamProperty {
  title: string
  size: DropboxSize
  type: DropboxType
  items: IDataParamSource[]
}

interface IDataParams {
  cols: IDataParamProperty
  rows: IDataParamProperty
  metrics: IDataParamProperty
  filters: IDataParamProperty
  color?: IDataParamProperty
  size?: IDataParamProperty
}

interface IWorkbenchStates {
  dragged: IDataParamSource
  selectedChart: number
  showColsAndRows: boolean
  categories: IDataParamSource[]
  values: IDataParamSource[]
  dataParams: IDataParams
  charts: IChartInfo[]
  pivotProps: IPivotProps
}

export class Workbench extends React.Component<{}, IWorkbenchStates> {
  constructor (props) {
    super(props)
    this.state = {
      dragged: null,
      selectedChart: 1,
      showColsAndRows: false,
      categories: [
        { name: 'id', type: 'category', icon: 'category' },
        { name: 'name', type: 'category', icon: 'category' },
        { name: 'sex', type: 'category', icon: 'category' },
        { name: 'birthday', type: 'category', icon: 'date' },
        { name: 'nation', type: 'category', icon: 'category' },
        { name: 'city', type: 'category', icon: 'category' },
        { name: 'education', type: 'category', icon: 'category' },
        { name: 'married', type: 'category', icon: 'category' }
      ],
      values: [
        { name: 'age', type: 'value', icon: 'value' },
        { name: 'salary', type: 'value', icon: 'value' }
      ],
      dataParams: {
        cols: {
          title: '列',
          size: 'large',
          type: 'category',
          items: []
        },
        rows: {
          title: '行',
          size: 'large',
          type: 'category',
          items: []
        },
        metrics: {
          title: '度量',
          size: 'large',
          type: 'value',
          items: []
        },
        filters: {
          title: '筛选',
          size: 'large',
          type: 'all',
          items: []
        },
        color: {
          title: '颜色',
          size: 'normal',
          type: 'all',
          items: []
        },
        size: {
          title: '尺寸',
          size: 'normal',
          type: 'value',
          items: []
        }
      },
      charts: [{
        id: 1,
        name: '透视表',
        icon: 'icon-table',
        requireDimetions: [0, 9999, 9999],
        requireMetrics: [0, 9999]
      }, {
        id: 2,
        name: '折线图',
        icon: 'icon-chart-line',
        requireDimetions: [1, 1, 9999],
        requireMetrics: [1, 9999],
        dimetionAxis: 'col'
      }, {
        id: 3,
        name: '柱状图',
        icon: 'icon-chart-bar',
        requireDimetions: [0, 1, 9999],
        requireMetrics: [1, 9999],
        dimetionAxis: 'col'
      }, {
        id: 4,
        name: '水平柱状图',
        icon: 'icon-hbar',
        requireDimetions: [0, 1, 9999],
        requireMetrics: [1, 9999],
        dimetionAxis: 'row'
      }, {
        id: 5,
        name: '散点图',
        icon: 'icon-scatter-chart',
        requireDimetions: [0, 0, 9999],
        requireMetrics: 2
      }],
      pivotProps: {
        data: [],
        cols: [],
        rows: [],
        metrics: [],
        chart: {
          id: 1,
          name: '透视表',
          icon: 'icon-table',
          requireDimetions: [0, 9999, 9999],
          requireMetrics: [0, 9999]
        }
      }
    }
  }

  private lastRequestParamString = null

  public componentWillMount () {
    request({
      method: 'post',
      url: '/api/v3/login',
      data: {
        username: 'xiangxu6',
        password: '123456'
      }
    })
  }

  private getDragItemIconClass = (type: ViewModelType) => {
    switch (type) {
      case 'category': return 'icon-categories'
      case 'date': return `icon-calendar ${styles.iconDate}`
      case 'value': return 'icon-values'
    }
  }

  private dragStart = (name: string, from: string, type: DragType, icon: ViewModelType, agg?: AggregatorType, sort?: SortType) =>
    (e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => {
      // hack firefox trigger dragEnd
      e.dataTransfer.setData('text/plain', '')
      this.setState({
        dragged: { name, from, type, icon, agg, sort }
      })
    }

  private dragEnd = () => {
    if (this.state.dragged) {
      this.setState({
        dragged: null
      })
    }
  }

  private insideDragStart = (from: string) =>
    (name: string, type: DragType, icon: ViewModelType, agg: AggregatorType, sort: SortType, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => {
      this.dragStart(name, from, type, icon, agg, sort)(e)
    }

  private insideDragEnd = (dropType: DropType) => {
    if (!dropType) {
      const { dragged: { name, from }, dataParams } = this.state
      const prop = dataParams[from]
      prop.items = prop.items.filter((i) => i.name !== name)
      this.getVisualData(dataParams)
    }

    this.setState({
      dragged: null
    })
  }

  private drop = (name: string, dropIndex: number, dropType: DropType, changedItems: IDataParamSource[]) => {
    const { dragged, dataParams } = this.state
    const destination = dataParams[name]
    const from = dragged.from && dragged.from !== name && dataParams[dragged.from]

    const { size, items } = destination

    destination.items = size === 'large'
      ? dropType === 'outside'
        ? [...items.slice(0, dropIndex), dragged, ...items.slice(dropIndex)]
        : [...changedItems]
      : [dragged]

    if (from) {
      from.items = from.items.filter((i) => i.name !== dragged.name)
    }
    this.setState({
      dragged: null
    })
    this.getVisualData(dataParams)
  }

  private toggleRowsAndCols = () => {
    const { dataParams } = this.state
    const { cols, rows } = dataParams

    if (this.state.showColsAndRows && rows.items.length) {
      cols.items = cols.items.concat(rows.items)
      rows.items = []
      this.getVisualData(dataParams)
    }

    this.setState({
      showColsAndRows: !this.state.showColsAndRows
    })
  }

  private switchRowsAndCols = () => {
    const { dataParams } = this.state
    const { cols, rows } = dataParams

    let temp = cols.items.slice()
    cols.items = rows.items.slice()
    rows.items = temp
    // dataParams.cols = {...cols, items: rows.items.slice()}
    // dataParams.rows = {...rows, items: temp}
    temp = null

    this.setState({
      dataParams
    })
    this.getVisualData(dataParams)
  }

  private removeDropboxItem = (from: string) => (name: string) => (e) => {
    e.stopPropagation()
    const { dataParams } = this.state
    const prop = dataParams[from]
    prop.items = prop.items.filter((i) => i.name !== name)
    this.getVisualData(dataParams)
  }

  private getDropboxItemSortDirection = (from: string) => (item: IDataParamSource) => (sort: SortType) => {
    const { dataParams } = this.state
    item.sort = ['asc', 'desc'].indexOf(sort) >= 0 ? sort : void 0
    dataParams[from].items = [...dataParams[from].items]
    this.getVisualData(dataParams)
  }

  private getDropboxItemAggregator = (from: string) => (item: IDataParamSource) => (agg: AggregatorType) => {
    const { dataParams } = this.state
    item.agg = agg
    dataParams[from].items = [...dataParams[from].items]
    this.getVisualData(dataParams)
  }

  private getDiemtionsAndMetricsCount = () => {
    const { dataParams } = this.state
    const { cols, rows, metrics } = dataParams
    const dcount = cols.items.length + rows.items.length
    const mcount = metrics.items.length
    return [dcount, mcount]
  }

  private getVisualData = (dataParams) => {
    const { cols, rows, metrics, filters } = dataParams
    const { selectedChart, charts } = this.state
    let selectedChartInfo = charts.find(((c) => c.id === selectedChart))
    const groups = cols.items.map((c) => c.name).concat(rows.items.map((r) => r.name)).sort()

    const requestParams = {
      groups,
      aggregators: metrics.items.map((m) => ({
        column: decodeMetricName(m.name),
        func: m.agg
      })).sort(),
      filters: [],
      cache: false,
      expired: 0
    }

    const requestParamString = JSON.stringify(requestParams)

    if (requestParamString !== this.lastRequestParamString) {
      const { requireDimetions, requireMetrics } = selectedChartInfo
      if (!checkChartEnable(groups.length, metrics.items.length, requireDimetions, requireMetrics)) {
        const backupChart = charts[0]
        selectedChartInfo = backupChart
        this.setState({
          selectedChart: backupChart.id
        })
      }
      this.lastRequestParamString = requestParamString

      request({
        method: 'post',
        url: '/api/v3/views/103/getdata',
        data: requestParams
      }).then((res) => {
        this.setState({
          dataParams: {...dataParams},
          pivotProps: {
            cols: dataParams.cols.items.map((i) => i.name),
            rows: dataParams.rows.items.map((i) => i.name),
            metrics: dataParams.metrics.items.map((i) => ({
              name: decodeMetricName(i.name),
              agg: i.agg
            })),
            data: res['payload'],
            chart: selectedChartInfo
          }
        })
      })
    } else {
      this.setState({
        dataParams: {...dataParams},
        pivotProps: {
          cols: dataParams.cols.items.map((i) => i.name),
          rows: dataParams.rows.items.map((i) => i.name),
          metrics: dataParams.metrics.items.map((i) => ({
            name: decodeMetricName(i.name),
            agg: i.agg
          })),
          data: this.state.pivotProps.data,
          chart: selectedChartInfo
        }
      })
    }
  }

  private selectChart = (selectedChart: number) => {
    if (selectedChart !== this.state.selectedChart) {
      this.setState({
        selectedChart
      }, () => {
        this.getVisualData(this.state.dataParams)
      })
    }
  }

  public render () {
    const { dragged, selectedChart, showColsAndRows, categories, values, dataParams, charts, pivotProps } = this.state

    const [dimetionsCount, metricsCount] = this.getDiemtionsAndMetricsCount()

    const dropboxes = Object.entries(dataParams).map(([k, v]) => {
      if (k === 'rows' && !showColsAndRows) {
        return
      }
      if (k === 'cols') {
        v.title = showColsAndRows ? '列' : '维度'
      }

      let typeInPlaceholder

      switch (v.type) {
        case 'category':
          typeInPlaceholder = '分类型'
          break
        case 'value':
          typeInPlaceholder = '数值型'
          break
        default:
          typeInPlaceholder = '任意'
          break
      }

      return (
        <Dropbox
          key={k}
          name={k}
          title={v.title}
          placeholder={<span>拖拽<b>{typeInPlaceholder}</b>字段设置{v.title}</span>}
          size={v.size}
          type={v.type}
          items={v.items}
          dragged={dragged}
          onItemDragStart={this.insideDragStart(k)}
          onItemDragEnd={this.insideDragEnd}
          onItemRemove={this.removeDropboxItem(k)}
          onItemSort={this.getDropboxItemSortDirection(k)}
          onItemChangeAgg={this.getDropboxItemAggregator(k)}
          onDrop={this.drop}
        />
      )
    })

    const rowsColsSwitchClass = classnames({
      [styles.switchRowsAndCols]: true,
      [utilStyles.hide]: !showColsAndRows
    })

    return (
      <div className={styles.workbench}>
        <div className={styles.header} />
        <div className={styles.body}>
          <div className={styles.model}>
            <div className={styles.source}>
              <a>选择一个View</a>
            </div>
            <div className={styles.columnContainer}>
              <h4>分类型</h4>
              <ul className={`${styles.columnList} ${styles.categories}`}>
                {categories.map((cat) => (
                  <li
                    key={cat.name}
                    onDragStart={this.dragStart(cat.name, '', cat.type, cat.icon)}
                    onDragEnd={this.dragEnd}
                    draggable
                  >
                    <i className={`iconfont ${this.getDragItemIconClass(cat.icon)}`} />
                    <p>{cat.name}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.columnContainer}>
              <h4>数值型</h4>
              <ul className={`${styles.columnList} ${styles.values}`}>
                {values.map((v) => (
                  <li
                    key={v.name}
                    onDragStart={this.dragStart(encodeMetricName(v.name), '', v.type, v.icon, 'sum')}
                    onDragEnd={this.dragEnd}
                    draggable
                  >
                    <i className={`iconfont ${this.getDragItemIconClass(v.icon)}`} />
                    <p>{v.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.config}>
            <div className={styles.charts}>
              {charts.map((c) => (
                <ChartIndicator
                  key={c.id}
                  dimetionsCount={dimetionsCount}
                  metricsCount={metricsCount}
                  selected={selectedChart}
                  onSelect={this.selectChart}
                  {...c}
                />
              ))}
              <i className="iconfont icon-chartpie" />
              <i className="iconfont icon-area-chart" />
              <i className="iconfont icon-kongjiansangjitu" />
              <i className="iconfont icon-iconloudoutu" />
              <i className="iconfont icon-chart-treemap" />
              <i className="iconfont icon-chartwordcloud" />
              <i className="iconfont icon-calendar1" />
              <i className="iconfont icon-text" />
              <i className="iconfont icon-china" />
              <i className="iconfont icon-duplex" />
              <i className="iconfont icon-508tongji_xiangxiantu" />
              <i className="iconfont icon-510tongji_guanxitu" />
              <i className="iconfont icon-waterfall" />
              <i className="iconfont icon-gauge" />
              <i className="iconfont icon-radarchart" />
              <i className="iconfont icon-parallel" />
              <i className="iconfont icon-confidence-band" />
            </div>
            <div className={styles.props}>
              <ul className={styles.propsTitle}>
                <li>数据</li>
                <li>样式</li>
              </ul>
              <div className={styles.propsBody}>
                <div className={styles.toggleRowsAndCols} onClick={this.toggleRowsAndCols}>
                  <Icon type="swap" />
                  {showColsAndRows ? ' 使用维度' : ' 使用行列'}
                </div>
                <div className={rowsColsSwitchClass} onClick={this.switchRowsAndCols}>
                  <Icon type="retweet" /> 行列切换
                </div>
                {dropboxes}
              </div>
            </div>
          </div>
          <div className={styles.table}>
            <ScrollablePivot {...pivotProps} />
          </div>
        </div>
      </div>
    )
  }
}

export default Workbench
