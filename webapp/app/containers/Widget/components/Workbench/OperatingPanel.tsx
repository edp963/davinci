import * as React from 'react'
import * as classnames from 'classnames'

import widgetlibs from '../../../../assets/json/widgetlib'
import { IView, IModel } from './index'
import Dropbox, { DropboxType, ViewModelType, DropType, SortType, AggregatorType, IDataParamSource, IDataParamConfig, DragType} from './Dropbox'
import DropboxContent from './DropboxContent'
import ColorSettingForm from './ColorSettingForm'
import { IPivotProps, DimetionType } from '../Pivot/Pivot'
import ChartIndicator from './ChartIndicator'
import { IChartInfo } from '../Pivot/Chart'
import { encodeMetricName, decodeMetricName, checkChartEnable, getPivot } from '../util'

const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu')
const MenuItem = Menu.Item
const Dropdown = require('antd/lib/dropdown')
const Modal = require('antd/lib/modal')
const styles = require('./Workbench.less')
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const utilStyles = require('../../../../assets/less/util.less')

export interface IDataParamProperty {
  title: string
  type: DropboxType
  value?: object
  items: IDataParamSource[]
}

interface IDataParams {
  [key: string]: IDataParamProperty
}

interface IOperatingPanelProps {
  views: IView[]
  currentWidgetConfig: IPivotProps
  selectedView: IView
  distinctColumnValues: any[]
  columnValueLoading: boolean
  onViewSelect: (selectedView: IView) => void
  onLoadData: (viewId: number, params: object, resolve: (data: any[]) => void) => void
  onSetPivotProps: (pivotProps: Partial<IPivotProps>) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
}

interface IOperatingPanelStates {
  dragged: IDataParamSource
  showColsAndRows: boolean
  commonParams: IDataParams
  specificParams: IDataParams
  modalCachedData: IDataParamSource
  modalCallback: (data: boolean | IDataParamConfig) => void
  colorModalVisible: boolean
}

export class OperatingPanel extends React.Component<IOperatingPanelProps, IOperatingPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      dragged: null,
      showColsAndRows: false,
      commonParams: {
        cols: { title: '列', type: 'category', items: [] },
        rows: { title: '行', type: 'category', items: [] },
        metrics: { title: '度量', type: 'value', items: [] },
        filters: { title: '筛选', type: 'all', items: [] }
      },
      specificParams: {},
      modalCachedData: null,
      modalCallback: null,
      colorModalVisible: false
    }
  }

  private lastRequestParamString = null
  private colorSettingForm = null

  public componentWillMount () {
    this.setState({
      specificParams: this.getChartDataConfig(this.getSelectedCharts([]))
    })
    if (this.props.currentWidgetConfig) {
      this.abc(this.props.currentWidgetConfig)
    }
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.currentWidgetConfig && nextProps.currentWidgetConfig !== this.props.currentWidgetConfig) {
      this.abc(nextProps.currentWidgetConfig)
    }
  }

  private abc = (currentWidgetConfig: IPivotProps) => {
    const { cols, rows, metrics, filters, color, label, size } = currentWidgetConfig
    const { commonParams } = this.state
    commonParams.cols.items = cols.map((c) => ({
      name: c,
      from: 'cols',
      type: 'category' as DragType
    }))
    commonParams.rows.items = rows.map((r) => ({
      name: r,
      from: 'rows',
      type: 'category' as DragType
    }))
    commonParams.metrics.items = metrics.map((m) => ({
      ...m,
      type: 'value' as DragType
    }))
    commonParams.filters.items = filters
    const currentSpecificParams = {
      ...color && {color},
      ...label && {label},
      ...size && {size}
    }
    this.setState({
      commonParams,
      specificParams: currentSpecificParams,
      showColsAndRows: !!rows.length
    }, () => {
      this.getVisualData(commonParams, currentSpecificParams)
    })
  }

  private getChartDataConfig = (selectedCharts: IChartInfo[]) => {
    const { commonParams, specificParams } = this.state
    const { metrics } = commonParams
    const config = {}
    selectedCharts.forEach((chartInfo) => {
      Object.entries(chartInfo.data).forEach(([key, prop]: [string, IDataParamProperty]) => {
        if (!config[key]) {
          config[key] = {
            ...prop,
            value: specificParams[key]
              ? {
                all: specificParams[key].value.all,
                ...metrics.items.reduce((props, i) => {
                  props[i.name] = specificParams[key].value[i.name] || defaultThemeColors[0]
                  return props
                }, {})
              }
              : { all: defaultThemeColors[0] },
            items: specificParams[key] ? specificParams[key].items : []
          }
        }
      })
    })
    return config
  }

  private getSelectedCharts = (items: IDataParamSource[]): IChartInfo[] =>
    items.length ? items.map((i) => i.chart) : [getPivot()]

  private getDragItemIconClass = (type: ViewModelType) => {
    switch (type) {
      case 'number': return 'icon-values'
      case 'date': return `icon-calendar ${styles.iconDate}`
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity': return 'icon-china'
      default: return 'icon-categories'
    }
  }

  private dragStart = (item) =>
    (e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => {
      // hack firefox trigger dragEnd
      e.dataTransfer.setData('text/plain', '')
      this.setState({
        dragged: {...item}
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
    (item: IDataParamSource, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => {
      this.dragStart({ ...item, from })(e)
    }

  private insideDragEnd = (dropType: DropType) => {
    if (!dropType) {
      const { dragged: { name, from }, commonParams, specificParams } = this.state
      const prop = commonParams[from] || specificParams[from]
      prop.items = prop.items.filter((i) => i.name !== name)
      this.getVisualData(commonParams, specificParams)
    }

    this.setState({
      dragged: null
    })
  }

  private beforeDrop = (name, cachedItem, resolve) => {
    const { selectedView, onLoadDistinctValue } = this.props
    switch (name) {
      case 'color':
        onLoadDistinctValue(selectedView.id, cachedItem.name)
        this.setState({
          modalCachedData: cachedItem,
          modalCallback: resolve,
          colorModalVisible: true
        })
        break
      default:
        resolve(true)
        break
    }
  }

  private drop = (name: string, dropIndex: number, dropType: DropType, changedItems: IDataParamSource[], config?: IDataParamConfig) => {
    const { dragged: stateDragged, commonParams, specificParams, modalCachedData } = this.state
    const dragged = stateDragged || modalCachedData
    const from = dragged.from && dragged.from !== name && (commonParams[dragged.from] || specificParams[dragged.from])
    const destination = commonParams[name] || specificParams[name]
    const { items } = destination

    if (config) {
      dragged.config = config
      if (name === 'color') {
        const actingOnItemIndex = items.findIndex((i) => i.config.actOn === config.actOn)
        if (actingOnItemIndex >= 0) {
          items.splice(actingOnItemIndex, 1)
          dropIndex = dropIndex <= actingOnItemIndex ? dropIndex : dropIndex - 1
        }
      }
    }

    if (dropType === 'outside') {
      let combinedItem = dragged
      if (name === 'metrics') {
        combinedItem = {...dragged, chart: commonParams.metrics.items.length ? commonParams.metrics.items[0].chart : getPivot()}
      }
      destination.items = [...items.slice(0, dropIndex), combinedItem, ...items.slice(dropIndex)]
    } else {
      destination.items = [...changedItems]
    }

    if (from) {
      from.items = from.items.filter((i) => i.name !== dragged.name)
    }
    this.setState({
      dragged: null,
      modalCachedData: null
    })
    this.getVisualData(commonParams, specificParams)
  }

  private toggleRowsAndCols = () => {
    const { commonParams, specificParams } = this.state
    const { cols, rows } = commonParams

    if (this.state.showColsAndRows && rows.items.length) {
      cols.items = cols.items.concat(rows.items)
      rows.items = []
      this.getVisualData(commonParams, specificParams)
    }

    this.setState({
      showColsAndRows: !this.state.showColsAndRows
    })
  }

  private switchRowsAndCols = () => {
    const { commonParams, specificParams } = this.state
    const { cols, rows } = commonParams

    let temp = cols.items.slice()
    cols.items = rows.items.slice()
    rows.items = temp
    temp = null

    this.getVisualData(commonParams, specificParams)
  }

  private removeDropboxItem = (from: string) => (name: string) => () => {
    const { commonParams, specificParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    prop.items = prop.items.filter((i) => i.name !== name)
    this.getVisualData(commonParams, specificParams)
  }

  private getDropboxItemSortDirection = (from: string) => (item: IDataParamSource, sort: SortType) => {
    const { commonParams, specificParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    item.sort = ['asc', 'desc'].indexOf(sort) >= 0 ? sort : void 0
    prop.items = [...prop.items]
    this.getVisualData(commonParams, specificParams)
  }

  private getDropboxItemAggregator = (from: string) => (item: IDataParamSource, agg: AggregatorType) => {
    const { commonParams, specificParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    item.agg = agg
    prop.items = [...prop.items]
    this.getVisualData(commonParams, specificParams)
  }

  private dropboxItemChangeColorConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { commonParams, specificParams } = this.state
    onLoadDistinctValue(selectedView.id, item.name)
    this.setState({
      modalCachedData: item,
      modalCallback: (config) => {
        if (config) {
          item.config = config as IDataParamConfig
          this.getVisualData(commonParams, specificParams)
          this.setState({
            modalCachedData: null
          })
        }
      },
      colorModalVisible: true
    })
  }

  private getDropboxItemChart = (item: IDataParamSource) => (chart: IChartInfo) => {
    const { commonParams, specificParams } = this.state
    item.chart = chart
    commonParams.metrics.items = [...commonParams.metrics.items]
    this.getVisualData(commonParams, specificParams)
  }

  private getDiemtionsAndMetricsCount = () => {
    const { commonParams } = this.state
    const { cols, rows, metrics } = commonParams
    const dcount = cols.items.length + rows.items.length
    const mcount = metrics.items.length
    return [dcount, mcount]
  }

  private getVisualData = (commonParams, specificParams) => {
    const { cols, rows, metrics, filters } = commonParams
    const { color, label } = specificParams
    const { selectedView, onLoadData, onSetPivotProps } = this.props
    let selectedCharts = this.getSelectedCharts(metrics.items)
    let groups = cols.items.map((c) => c.name).concat(rows.items.map((r) => r.name))
    let aggregators = metrics.items.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))
    if (color) {
      groups = groups.concat(color.items.map((c) => c.name))
    }
    if (label) {
      groups = groups.concat(label.items
        .filter((l) => l.type === 'category')
        .map((l) => l.name))
      aggregators = aggregators.concat(label.items
        .filter((l) => l.type === 'value')
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    groups.sort()
    aggregators.sort()

    const requestParams = {
      groups,
      aggregators,
      filters: [],
      cache: false,
      expired: 0
    }

    const requestParamString = JSON.stringify(requestParams)
    if (requestParamString !== this.lastRequestParamString) {
      if (!checkChartEnable(groups.length, metrics.items.length, selectedCharts)) {
        selectedCharts = this.getSelectedCharts([])
      }
      this.lastRequestParamString = requestParamString
      onLoadData(selectedView.id, requestParams, (data) => {
        onSetPivotProps({
          cols: cols.items.map((i) => i.name),
          rows: rows.items.map((i) => i.name),
          metrics: metrics.items,
          filters: filters.items,
          ...color && {color},
          ...label && {label},
          data,
          dimetionAxis: this.getDimetionAxis(selectedCharts),
          renderType: 'rerender'
        })
        this.setState({
          commonParams,
          specificParams: this.getChartDataConfig(selectedCharts)
        })
      })
    } else {
      onSetPivotProps({
        cols: cols.items.map((i) => i.name),
        rows: rows.items.map((i) => i.name),
        metrics: metrics.items,
        filters: filters.items,
        ...color && {color},
        ...label && {label},
        dimetionAxis: this.getDimetionAxis(selectedCharts),
        renderType: 'refresh'
      })
      this.setState({
        commonParams,
        specificParams: this.getChartDataConfig(selectedCharts)
      })
    }
  }

  private getDimetionAxis = (selectedCharts): DimetionType => {
    const pivotChart = getPivot()
    const onlyPivot = !selectedCharts.filter((sc) => sc.id !== pivotChart.id).length
    if (!onlyPivot) {
      return 'col'
    }
  }

  private chartSelect = (chart: IChartInfo) => {
    const { commonParams, specificParams } = this.state
    const { metrics } = commonParams
    if (!(metrics.items.length === 1 && metrics.items[0].chart === chart)) {
      metrics.items.forEach((i) => {
        i.chart = chart
      })
      this.getVisualData(commonParams, specificParams)
    }
  }

  private viewSelect = ({key}) => {
    this.props.onViewSelect(this.props.views.find((v) => `${v.id}` === key))
  }

  private dropboxContentClick = (boxRole: string) => () => {
    switch (boxRole) {
      default:
        break
    }
  }

  private dropboxContentColorValueChange = (key: string, hex: string) => {
    const { commonParams, specificParams } = this.state
    const { color } = specificParams
    if (key === 'all') {
      Object.keys(color.value).forEach((k) => {
        color.value[k] = hex
      })
    } else {
      color.value[key] = hex
    }
    this.getVisualData(commonParams, specificParams)
  }

  private confirmColorModal = (config) => {
    this.state.modalCallback(config)
    this.closeColorModal()
  }

  private cancelColorModal = () => {
    this.state.modalCallback(false)
    this.closeColorModal()
  }

  private closeColorModal = () => {
    this.setState({
      colorModalVisible: false,
      modalCallback: null
    })
  }

  private afterColorModalClose = () => {
    this.colorSettingForm.reset()
  }

  public render () {
    const {
      views,
      selectedView,
      distinctColumnValues,
      columnValueLoading
    } = this.props
    const {
      dragged,
      showColsAndRows,
      commonParams,
      specificParams,
      modalCachedData,
      colorModalVisible
    } = this.state
    const { metrics } = commonParams

    const [dimetionsCount, metricsCount] = this.getDiemtionsAndMetricsCount()
    const viewSelectMenu = (
      <Menu onClick={this.viewSelect}>
        {(views || []).map((v) => (
          <MenuItem key={v.id}>{v.name}</MenuItem>
        ))}
      </Menu>
    )

    const categories = []
    const values = []

    if (selectedView) {
      const model: IModel = JSON.parse(selectedView.model)
      Object.entries(model).forEach(([key, m]) => {
        if (m.modelType === 'category') {
          categories.push({
            name: key,
            type: 'category',
            icon: m.visualType
          })
        } else {
          values.push({
            name: key,
            type: 'value',
            icon: m.visualType
          })
        }
      })
    }

    const dropboxes = Object.entries(commonParams)
      .concat(Object.entries(specificParams))
      .map(([k, v]) => {
        if (k === 'rows' && !showColsAndRows) {
          return
        }
        if (k === 'cols') {
          v.title = showColsAndRows ? '列' : '维度'
        }
        return (
          <Dropbox
            key={k}
            name={k}
            title={v.title}
            type={v.type}
            items={v.items}
            dragged={dragged}
            dimetionsCount={dimetionsCount}
            metricsCount={metricsCount}
            onItemDragStart={this.insideDragStart(k)}
            onItemDragEnd={this.insideDragEnd}
            onItemRemove={this.removeDropboxItem(k)}
            onItemSort={this.getDropboxItemSortDirection(k)}
            onItemChangeAgg={this.getDropboxItemAggregator(k)}
            onItemChangeColorConfig={this.dropboxItemChangeColorConfig}
            onItemChangeChart={this.getDropboxItemChart}
            beforeDrop={this.beforeDrop}
            onDrop={this.drop}
          >
            <DropboxContent
              title={v.title}
              role={k}
              type={v.type}
              value={v.value}
              panelList={metrics.items}
              onClick={this.dropboxContentClick(k)}
              {...k === 'color' ? {onColorValueChange: this.dropboxContentColorValueChange} : void 0}
            />
          </Dropbox>
        )
      })

    const rowsColsSwitchClass = classnames({
      [styles.switchRowsAndCols]: true,
      [utilStyles.hide]: !showColsAndRows
    })

    let colorSettingConfig
    if (modalCachedData) {
      const selectedItem = specificParams.color.items.find((i) => i.name === modalCachedData.name)
      colorSettingConfig = selectedItem ? selectedItem.config : {}
    }

    return (
      <div className={styles.operatingPanel}>
        <div className={styles.model}>
          <div className={styles.source}>
            <Dropdown overlay={viewSelectMenu} trigger={['click']} placement="bottomLeft">
              <a>{selectedView ? selectedView.name : '选择一个View'}</a>
            </Dropdown>
          </div>
          <div className={styles.columnContainer}>
            <h4>分类型</h4>
            <ul className={`${styles.columnList} ${styles.categories}`}>
              {categories.map((cat) => (
                <li
                  key={cat.name}
                  onDragStart={this.dragStart(cat)}
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
                  onDragStart={this.dragStart({...v, name: encodeMetricName(v.name), agg: 'sum'})}
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
            {widgetlibs.map((c) => (
              <ChartIndicator
                key={c.id}
                chartInfo={c}
                dimetionsCount={dimetionsCount}
                metricsCount={metricsCount}
                selectedCharts={this.getSelectedCharts(metrics.items)}
                onSelect={this.chartSelect}
              />
            ))}
            {/* <i className="iconfont icon-area-chart" />
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
            <i className="iconfont icon-confidence-band" /> */}
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
        <Modal
          wrapClassName="ant-modal-small"
          visible={colorModalVisible}
          onCancel={this.cancelColorModal}
          afterClose={this.afterColorModalClose}
          footer={null}
        >
          <ColorSettingForm
            list={distinctColumnValues}
            loading={columnValueLoading}
            metrics={metrics.items}
            config={colorSettingConfig}
            onSave={this.confirmColorModal}
            onCancel={this.cancelColorModal}
            ref={(f) => this.colorSettingForm = f}
          />
        </Modal>
      </div>
    )
  }
}

export default OperatingPanel
