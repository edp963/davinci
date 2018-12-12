import * as React from 'react'
import * as classnames from 'classnames'

import widgetlibs from '../../config'
import { IView, IModel } from './index'
import Dropbox, { DropboxType, ViewModelType, DropType, SortType, AggregatorType, IDataParamSource, IDataParamConfig, DragType} from './Dropbox'
import { IWidgetProps, IChartStyles, IChartInfo, DimetionType, WidgetMode } from '../Widget'
import ColorSettingForm from './ColorSettingForm'
import ActOnSettingForm from './ActOnSettingForm'
import FilterSettingForm from './FilterSettingForm'
import VariableConfigForm from '../VariableConfigForm'
import ChartIndicator from './ChartIndicator'
import AxisSection, { IAxisConfig } from './ConfigSections/AxisSection'
import SplitLineSection, { ISplitLineConfig } from './ConfigSections/SplitLineSection'
import PivotSection, { IPivotConfig } from './ConfigSections/PivotSection'
import SpecSection, { ISpecConfig } from './ConfigSections/SpecSection'
import LabelSection, { ILabelConfig } from './ConfigSections/LabelSection'
import LegendSection, { ILegendConfig } from './ConfigSections/LegendSection'
import VisualMapSection, { IVisualMapConfig } from './ConfigSections/VisualMapSection'
import ToolboxSection, { IToolboxConfig } from './ConfigSections/ToolboxSection'
import AreaSelectSection, { IAreaSelectConfig } from './ConfigSections/AreaSelectSection'
import ScorecardSection, { IScorecardConfig } from './ConfigSections/ScorecardSection'
import IframeSection, { IframeConfig } from './ConfigSections/IframeSection'
import { encodeMetricName, decodeMetricName, checkChartEnable, getPivot, getTable } from '../util'
import { PIVOT_DEFAULT_SCATTER_SIZE_TIMES } from '../../../../globalConstants'
import PivotTypes from '../../config/pivot/PivotTypes'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu')
const MenuItem = Menu.Item
const Table = require('antd/lib/table')
const Button = require('antd/lib/button')
const Radio = require('antd/lib/radio/radio')
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const InputNumber = require('antd/lib/input-number')
const Dropdown = require('antd/lib/dropdown')
const Modal = require('antd/lib/modal')
const confirm = Modal.confirm
const styles = require('./Workbench.less')
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const utilStyles = require('../../../../assets/less/util.less')

export interface IDataParamProperty {
  title: string
  type: DropboxType
  value?: {all?: any}
  items: IDataParamSource[]
}

interface IDataParams {
  [key: string]: IDataParamProperty
}

interface IOperatingPanelProps {
  views: IView[]
  currentWidgetConfig: IWidgetProps
  selectedView: IView
  distinctColumnValues: any[]
  columnValueLoading: boolean
  queryParams: any[]
  cache: boolean
  expired: number
  onViewSelect: (selectedView: IView) => void
  onSetQueryParams: (queryParams: any[]) => void
  onCacheChange: (cache: boolean) => void
  onExpiredChange: (expired: number) => void
  onLoadData: (viewId: number, params: object, resolve: (result: any) => void) => void
  onSetWidgetProps: (widgetProps: Partial<IWidgetProps>) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
}

interface IOperatingPanelStates {
  dragged: IDataParamSource
  showColsAndRows: boolean
  selectedTab: 'data' | 'style' | 'variable' | 'cache'
  mode: WidgetMode
  currentWidgetlibs: IChartInfo[]
  chartModeSelectedChart: IChartInfo
  commonParams: IDataParams
  specificParams: IDataParams
  styleParams: IChartStyles
  modalCachedData: IDataParamSource
  modalCallback: (data: boolean | IDataParamConfig) => void
  modalDataFrom: string
  colorModalVisible: boolean
  actOnModalVisible: boolean
  actOnModalList: IDataParamSource[]
  filterModalVisible: boolean
  variableConfigModalVisible: boolean
  variableConfigControl: object
}

export class OperatingPanel extends React.Component<IOperatingPanelProps, IOperatingPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      dragged: null,
      showColsAndRows: false,
      selectedTab: 'data',
      mode: 'pivot',
      currentWidgetlibs: widgetlibs['pivot'],
      chartModeSelectedChart: getTable(),
      commonParams: {
        cols: { title: '列', type: 'category', items: [] },
        rows: { title: '行', type: 'category', items: [] },
        metrics: { title: '指标', type: 'value', items: [] },
        filters: { title: '筛选', type: 'all', items: [] }
      },
      specificParams: {},
      styleParams: {},
      modalCachedData: null,
      modalCallback: null,
      modalDataFrom: void 0,
      colorModalVisible: false,
      actOnModalVisible: false,
      actOnModalList: null,
      filterModalVisible: false,
      variableConfigModalVisible: false,
      variableConfigControl: {}
    }
  }

  private tabKeys = [
    { key: 'data', title: '数据' },
    { key: 'style', title: '样式' },
    { key: 'variable', title: '变量' },
    { key: 'cache', title: '缓存' }
  ]
  private lastRequestParamString = null
  private colorSettingForm = null
  private actOnSettingForm = null
  private filterSettingForm = null

  private variableConfigForm = null
  private refHandlers = {
    variableConfigForm: (ref) => this.variableConfigForm = ref
  }

  public componentWillMount () {
    this.setState({
      ...this.getChartDataConfig(this.getPivotModeSelectedCharts([]))
    })
  }

  public componentWillReceiveProps (nextProps: IOperatingPanelProps) {
    const { selectedView, currentWidgetConfig } = nextProps
    if (currentWidgetConfig && currentWidgetConfig !== this.props.currentWidgetConfig) {
      const { cols, rows, metrics, filters, color, label, size, xAxis, tip, chartStyles, mode, selectedChart } = currentWidgetConfig
      const { commonParams } = this.state
      const currentWidgetlibs = widgetlibs[mode || 'pivot'] // FIXME 兼容 0.3.0-beta.1 之前版本
      const model = JSON.parse(selectedView.model)
      commonParams.cols.items = cols.map((c) => ({
        name: c,
        from: 'cols',
        type: 'category' as DragType,
        visualType: c === '指标名称' ? 'string' : model[c].visualType
      }))
      commonParams.rows.items = rows.map((r) => ({
        name: r,
        from: 'rows',
        type: 'category' as DragType,
        visualType: r === '指标名称' ? 'string' :  model[r].visualType
      }))
      commonParams.metrics.items = metrics.map((m) => ({
        ...m,
        type: 'value' as DragType,
        visualType: model[decodeMetricName(m.name)].visualType,
        chart: currentWidgetlibs.find((wl) => wl.id === m.chart.id) // FIXME 兼容 0.3.0-beta.1 之前版本，widgetlib requireDimetions requireMetrics 有发生变更
      }))
      commonParams.filters.items = filters.map((f) => ({
        ...f,
        visualType: model[f.name]
      }))
      const currentSpecificParams = {
        ...color && {color},
        ...label && {label},
        ...size && {size},
        ...xAxis && {xAxis},
        ...tip && {tip}
      }
      this.setState({
        commonParams,
        specificParams: currentSpecificParams,
        styleParams: chartStyles,
        showColsAndRows: !!rows.length,
        mode: mode || 'pivot', // FIXME 兼容 0.3.0-beta.1 之前版本
        currentWidgetlibs,
        ...selectedChart && {chartModeSelectedChart: widgetlibs['chart'].find((wl) => wl.id === selectedChart)}
      }, () => {
        this.getVisualData(commonParams, currentSpecificParams, chartStyles)
      })
    }
  }

  private getChartDataConfig = (selectedCharts: IChartInfo[]) => {
    const { mode, commonParams, specificParams, styleParams } = this.state
    const { metrics } = commonParams
    const dataConfig = {}
    const styleConfig = {}
    let specSign = false
    selectedCharts.forEach((chartInfo) => {
      Object.entries(chartInfo.data).forEach(([key, prop]: [string, IDataParamProperty]) => {
        if (!dataConfig[key]) {
          let value = null
          switch (key) {
            case 'color':
              value = specificParams[key]
                ? {
                  all: specificParams[key].value.all,
                  ...metrics.items.reduce((props, item, i) => {
                    props[item.name] = mode === 'pivot'
                      ? specificParams[key].value[item.name] || specificParams[key].value['all']
                      : specificParams[key].value[item.name] || defaultThemeColors[i]
                    return props
                  }, {})
                }
                : { all: defaultThemeColors[0] }
              break
            case 'size':
              value = specificParams[key] ? specificParams[key].value : { all: PIVOT_DEFAULT_SCATTER_SIZE_TIMES }
              break
          }
          dataConfig[key] = {
            ...prop,
            value,
            items: specificParams[key] ? specificParams[key].items : []
          }
        }
      })
      Object.entries(chartInfo.style).forEach(([key, prop]: [string, object]) => {
        if (key !== 'spec') {
          styleConfig[key] = {
            ...prop,
            ...styleParams[key]
          }
        } else {
          specSign = true
        }
      })
    })
    if (specSign) {
      styleConfig['spec'] = selectedCharts.reduce((spec, chartInfo) => {
        const specConfig = chartInfo.style['spec'] || {}
        return {
          ...spec,
          ...Object.entries(specConfig).reduce((obj, [key, value]) => {
            const settledValue = styleParams.spec && styleParams.spec[key]
            obj[key] = settledValue !== void 0 ? settledValue : value
            return obj
          }, {})
        }
      }, {})
    }
    return {
      specificParams: dataConfig,
      styleParams: styleConfig
    }
  }

  private getPivotModeSelectedCharts = (items: IDataParamSource[]): IChartInfo[] =>
    items.length ? items.map((i) => i.chart) : [getPivot()]

  private getDragItemIconClass = (type: ViewModelType) => {
    switch (type) {
      case 'number': return 'icon-values'
      case 'date': return `icon-calendar ${styles.iconDate}`
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity': return 'icon-map'
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
      const { dragged: { name, from }, commonParams, specificParams, styleParams } = this.state
      const prop = commonParams[from] || specificParams[from]
      prop.items = prop.items.filter((i) => i.name !== name)
      this.getVisualData(commonParams, specificParams, styleParams)
    }

    this.setState({
      dragged: null
    })
  }

  private beforeDrop = (name, cachedItem, resolve) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { mode, commonParams } = this.state
    const { metrics } = commonParams

    switch (name) {
      case 'filters':
        if (cachedItem.visualType !== 'number' && cachedItem.visualType !== 'date') {
          onLoadDistinctValue(selectedView.id, cachedItem.name)
        }
        this.setState({
          modalCachedData: cachedItem,
          modalCallback: resolve,
          modalDataFrom: 'filters',
          filterModalVisible: true
        })
        break
      case 'color':
        onLoadDistinctValue(selectedView.id, cachedItem.name)
        this.setState({
          modalCachedData: cachedItem,
          modalCallback: resolve,
          modalDataFrom: 'color',
          colorModalVisible: true
        })
        break
      case 'label':
        this.setState({
          modalCachedData: cachedItem,
          modalCallback: resolve,
          modalDataFrom: 'label',
          actOnModalVisible: true,
          actOnModalList: metrics.items.slice()
        })
        break
      case 'size':
        if (mode === 'pivot') {
          this.setState({
            modalCachedData: cachedItem,
            modalCallback: resolve,
            modalDataFrom: 'size',
            actOnModalVisible: true,
            actOnModalList: metrics.items.filter((m) => m.chart.id === PivotTypes.Scatter)
          })
        } else {
          resolve(true)
        }
        break
      default:
        resolve(true)
        break
    }
  }

  private drop = (name: string, dropIndex: number, dropType: DropType, changedItems: IDataParamSource[], config?: IDataParamConfig) => {
    const { dragged: stateDragged, commonParams, specificParams, styleParams, modalCachedData } = this.state
    const dragged = stateDragged || modalCachedData
    const from = dragged.from && dragged.from !== name && (commonParams[dragged.from] || specificParams[dragged.from])
    const destination = commonParams[name] || specificParams[name]
    const { items } = destination

    if (config) {
      dragged.config = config
      if (['color', 'label', 'size'].includes(name)) {
        const actingOnItemIndex = items.findIndex((i) => i.config.actOn === config.actOn)
        if (actingOnItemIndex >= 0) {
          items.splice(actingOnItemIndex, 1)
          dropIndex = dropIndex <= actingOnItemIndex ? dropIndex : dropIndex - 1
        }
      }
      if (name === 'xAxis') {
        items.splice(0, 1)
        dropIndex = 0
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
    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private toggleRowsAndCols = () => {
    const { commonParams, specificParams, styleParams } = this.state
    const { cols, rows } = commonParams

    if (this.state.showColsAndRows && rows.items.length) {
      cols.items = cols.items.concat(rows.items)
      rows.items = []
      this.getVisualData(commonParams, specificParams, styleParams)
    }

    this.setState({
      showColsAndRows: !this.state.showColsAndRows
    })
  }

  private switchRowsAndCols = () => {
    const { commonParams, specificParams, styleParams } = this.state
    const { cols, rows } = commonParams

    let temp = cols.items.slice()
    cols.items = rows.items.slice()
    rows.items = temp
    temp = null

    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private removeDropboxItem = (from: string) => (name: string) => () => {
    const { commonParams, specificParams, styleParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    prop.items = prop.items.filter((i) => i.name !== name)
    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private getDropboxItemSortDirection = (from: string) => (item: IDataParamSource, sort: SortType) => {
    const { commonParams, specificParams, styleParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    item.sort = ['asc', 'desc'].indexOf(sort) >= 0 ? sort : void 0
    prop.items = [...prop.items]
    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private getDropboxItemAggregator = (from: string) => (item: IDataParamSource, agg: AggregatorType) => {
    const { commonParams, specificParams, styleParams } = this.state
    const prop = commonParams[from] || specificParams[from]
    item.agg = agg
    prop.items = [...prop.items]
    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private dropboxItemChangeColorConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { commonParams, specificParams, styleParams } = this.state
    onLoadDistinctValue(selectedView.id, item.name)
    this.setState({
      modalCachedData: item,
      modalDataFrom: 'color',
      modalCallback: (config) => {
        if (config) {
          const colorItems = specificParams.color.items
          const actingOnItemIndex = colorItems.findIndex((i) => i.config.actOn === config['actOn'] && i.name !== item.name)
          if (actingOnItemIndex >= 0) {
            specificParams.color.items = [
              ...colorItems.slice(0, actingOnItemIndex),
              ...colorItems.slice(actingOnItemIndex + 1)
            ]
          }
          item.config = config as IDataParamConfig
          this.getVisualData(commonParams, specificParams, styleParams)
          this.setState({
            modalCachedData: null
          })
        }
      },
      colorModalVisible: true
    })
  }

  private dropboxItemChangeFilterConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { commonParams, specificParams, styleParams } = this.state
    if (item.type === 'category') {
      onLoadDistinctValue(selectedView.id, item.name)
    }
    this.setState({
      modalCachedData: item,
      modalDataFrom: 'filters',
      modalCallback: (config) => {
        if (config) {
          item.config = config as IDataParamConfig
          this.getVisualData(commonParams, specificParams, styleParams)
          this.setState({
            modalCachedData: null
          })
        }
      },
      filterModalVisible: true
    })
  }

  private getDropboxItemChart = (item: IDataParamSource) => (chart: IChartInfo) => {
    const { commonParams } = this.state
    item.chart = chart
    commonParams.metrics.items = [...commonParams.metrics.items]
    const { specificParams, styleParams } = this.getChartDataConfig(this.getPivotModeSelectedCharts(commonParams.metrics.items))
    this.getVisualData(commonParams, specificParams, styleParams)
  }

  private getDiemtionsAndMetricsCount = () => {
    const { commonParams } = this.state
    const { cols, rows, metrics } = commonParams
    const dcount = cols.items.length + rows.items.length
    const mcount = metrics.items.length
    return [dcount, mcount]
  }

  private getVisualData = (commonParams, specificParams, styleParams, renderType?) => {
    const { cols, rows, metrics, filters } = commonParams
    const { color, label, size, xAxis, tip, yAxis } = specificParams
    const { selectedView, onLoadData, onSetWidgetProps } = this.props
    const { mode, chartModeSelectedChart } = this.state
    let groups = cols.items.map((c) => c.name)
      .concat(rows.items.map((r) => r.name))
      .filter((g) => g !== '指标名称')
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
    if (size) {
      aggregators = aggregators.concat(size.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (tip) {
      aggregators = aggregators.concat(tip.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (yAxis) {
      aggregators = aggregators.concat(yAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }

    const orders = []
    Object.values(commonParams).concat(Object.values(specificParams))
      .reduce<IDataParamSource[]>((items, param: IDataParamProperty) => items.concat(param.items), [])
      .forEach((item) => {
        if (item.sort) {
          orders.push({
            column: item.type === 'category' ? item.name : `${item.agg}(${decodeMetricName(item.name)})`,
            direction: item.sort
          })
        }
      })

    const requestParams = {
      groups,
      aggregators,
      filters: filters.items.map((i) => i.config.sql),
      orders,
      cache: false,
      expired: 0
    }

    let selectedCharts
    let dimetionsCount
    if (mode === 'pivot') {
      selectedCharts = this.getPivotModeSelectedCharts(metrics.items)
      dimetionsCount = groups.length
    } else {
      selectedCharts = [chartModeSelectedChart]
      dimetionsCount = cols.items.length
    }
    if (!checkChartEnable(dimetionsCount, metrics.items.length, selectedCharts)) {
      selectedCharts = mode === 'pivot'
        ? this.getPivotModeSelectedCharts([])
        : [getTable()]
    }

    const requestParamString = JSON.stringify(requestParams)
    if (selectedView && requestParamString !== this.lastRequestParamString) {
      this.lastRequestParamString = requestParamString
      onLoadData(selectedView.id, requestParams, (result) => {
        const { resultList: data } = result
        if (data.length) {
          onSetWidgetProps({
            cols: cols.items.map((i) => i.name),
            rows: rows.items.map((i) => i.name),
            metrics: metrics.items.map((item) => ({...item})),
            filters: filters.items,
            ...color && {color},
            ...label && {label},
            ...size && {size},
            ...xAxis && {xAxis},
            ...tip && {tip},
            ...yAxis && {yAxis},
            chartStyles: styleParams,
            selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
            data,
            dimetionAxis: this.getDimetionAxis(selectedCharts),
            renderType: renderType || 'rerender',
            orders,
            mode,
            model: JSON.parse(selectedView.model)
          })
        } else {
          onSetWidgetProps({
            cols: [],
            rows: [],
            metrics: [],
            filters: [],
            data: [],
            chartStyles: styleParams,
            selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
            dimetionAxis: this.getDimetionAxis([getPivot()]),
            renderType: 'rerender',
            orders,
            mode,
            model: JSON.parse(selectedView.model)
          })
        }
        this.setState({
          commonParams,
          ...this.getChartDataConfig(selectedCharts),
          chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0]
        })
      })
    } else {
      onSetWidgetProps({
        cols: cols.items.map((i) => i.name),
        rows: rows.items.map((i) => i.name),
        metrics: metrics.items.map((item) => ({...item})),
        filters: filters.items,
        ...color && {color},
        ...label && {label},
        ...size && {size},
        ...xAxis && {xAxis},
        ...tip && {tip},
        ...yAxis && {yAxis},
        chartStyles: styleParams,
        selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
        dimetionAxis: this.getDimetionAxis(selectedCharts),
        renderType: renderType || 'clear',
        orders,
        mode,
        model: selectedView ? JSON.parse(selectedView.model) : {}
      })
      this.setState({
        commonParams,
        ...this.getChartDataConfig(selectedCharts),
        chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0]
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
    const { mode, commonParams } = this.state
    const { cols, rows, metrics } = commonParams
    if (mode === 'pivot') {
      if (!(metrics.items.length === 1 && metrics.items[0].chart.id === chart.id)) {
        metrics.items.forEach((i) => {
          i.chart = chart
        })
        if (chart.id !== PivotTypes.PivotTable) {
          cols.items = cols.items.filter((c) => c.name !== '指标名称')
          rows.items = rows.items.filter((r) => r.name !== '指标名称')
        }
        const { specificParams, styleParams } = this.getChartDataConfig(this.getPivotModeSelectedCharts(metrics.items))
        this.getVisualData(commonParams, specificParams, styleParams)
      }
    } else {
      this.setState({
        chartModeSelectedChart: chart
      }, () => {
        const { specificParams, styleParams } = this.getChartDataConfig([chart])
        this.getVisualData(commonParams, specificParams, styleParams)
      })
    }
  }

  private viewSelect = ({key}) => {
    const { commonParams, specificParams } = this.state
    const hasItems = Object.values(commonParams)
      .concat(Object.values(specificParams))
      .filter((param) => !!param.items.length)
    if (hasItems.length) {
      confirm({
        title: '切换 View 会清空所有配置项，是否继续？',
        onOk: () => {
          this.resetWorkbench()
          this.props.onViewSelect(this.props.views.find((v) => v.id === Number(key)))
        }
      })
    } else {
      this.props.onViewSelect(this.props.views.find((v) => v.id === Number(key)))
    }
  }

  private changeMode = (e) => {
    const mode = e.target.value
    const { commonParams, specificParams } = this.state
    const hasItems = Object.values(commonParams)
      .concat(Object.values(specificParams))
      .filter((param) => !!param.items.length)
    if (hasItems.length) {
      confirm({
        title: '切换图表模式会清空所有配置项，是否继续？',
        onOk: () => {
          this.setState({
            mode,
            currentWidgetlibs: widgetlibs[mode]
          }, () => {
            this.resetWorkbench()
          })
        }
      })
    } else {
      this.setState({
        mode,
        currentWidgetlibs: widgetlibs[mode]
      }, () => {
        this.resetWorkbench()
      })
    }
  }

  private resetWorkbench = () => {
    const { commonParams, specificParams, mode } = this.state
    Object.values(commonParams).forEach((param) => {
      param.items = []
      if (param.value) {
        param.value = {}
      }
    })
    Object.values(specificParams).forEach((param) => {
      param.items = []
      if (param.value) {
        param.value = {}
      }
    })
    this.setState({
      showColsAndRows: false,
      chartModeSelectedChart: getTable()
    })
    const resetedParams = this.getChartDataConfig(this.getPivotModeSelectedCharts([]))
    this.getVisualData(commonParams, resetedParams.specificParams, resetedParams.styleParams)
  }

  private dropboxValueChange = (name) => (key: string, value: string | number) => {
    const { mode, commonParams, specificParams, styleParams } = this.state
    const { color, size } = specificParams
    switch (name) {
      case 'color':
        if (key === 'all' && mode === 'pivot') {
          Object.keys(color.value).forEach((k) => {
            color.value[k] = value
          })
        } else {
          color.value[key] = value
        }
        break
      case 'size':
        if (key === 'all') {
          Object.keys(size.value).forEach((k) => {
            size.value[k] = value
          })
        } else {
          size.value[key] = value
        }
    }
    this.getVisualData(commonParams, specificParams, styleParams, 'refresh')
  }

  private styleChange = (name) => (prop, value) => {
    const { commonParams, specificParams, styleParams, chartModeSelectedChart } = this.state
    styleParams[name][prop] = value
    let renderType = 'clear'
    switch (prop) {
      case 'layerType':
        renderType = 'rerender'
        break
      case 'smooth':
        renderType = 'clear'
        break
    }
    this.getVisualData(commonParams, specificParams, styleParams, renderType)
    const { layerType } = styleParams.spec
    // chartModeSelectedChart.style.spec.layerType = layerType
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

  private confirmActOnModal = (config) => {
    this.state.modalCallback(config)
    this.closeActOnModal()
  }

  private cancelActOnModal = () => {
    this.state.modalCallback(false)
    this.closeActOnModal()
  }

  private closeActOnModal = () => {
    this.setState({
      actOnModalVisible: false,
      actOnModalList: null
    })
  }

  private confirmFilterModal = (config) => {
    this.state.modalCallback(config)
    this.closeFilterModal()
  }

  private cancelFilterModal = () => {
    this.state.modalCallback(false)
    this.closeFilterModal()
  }

  private closeFilterModal = () => {
    this.setState({
      filterModalVisible: false
    })
  }

  private afterColorModalClose = () => {
    this.colorSettingForm.reset()
  }

  private afterActOnModalClose = () => {
    this.actOnSettingForm.reset()
  }

  private afterFilterModalClose = () => {
    this.filterSettingForm.reset()
  }

  private tabSelect = (key) => () => {
    this.setState({
      selectedTab: key
    })
  }

  private showVariableConfigTable = (id?: string) => () => {
    this.setState({
      variableConfigModalVisible: true,
      variableConfigControl: id
        ? this.props.queryParams.find((q) => q.id === id)
        : {}
    })
  }

  private hideVariableConfigTable = () => {
    this.setState({
      variableConfigModalVisible: false,
      variableConfigControl: {}
    })
  }

  private resetVariableConfigForm = () => {
    this.variableConfigForm.resetForm()
  }

  private saveControl = (control) => {
    const { queryParams, onSetQueryParams } = this.props
    const { commonParams, specificParams, styleParams } = this.state
    const itemIndex = queryParams.findIndex((q) => q.id === control.id)

    if (itemIndex >= 0) {
      queryParams.splice(itemIndex, 1, control)
      onSetQueryParams([...queryParams.slice(0, itemIndex), control, ...queryParams.slice(itemIndex + 1)])
    } else {
      onSetQueryParams(queryParams.concat(control))
    }
  }

  private deleteControl = (id) => () => {
    const { queryParams, onSetQueryParams } = this.props
    onSetQueryParams(queryParams.filter((q) => q.id !== id))
  }

  public render () {
    const {
      views,
      selectedView,
      distinctColumnValues,
      columnValueLoading,
      queryParams,
      cache,
      expired,
      onCacheChange,
      onExpiredChange,
      currentWidgetConfig
    } = this.props
    const {
      dragged,
      showColsAndRows,
      selectedTab,
      mode,
      currentWidgetlibs,
      chartModeSelectedChart,
      commonParams,
      specificParams,
      styleParams,
      modalCachedData,
      modalDataFrom,
      colorModalVisible,
      actOnModalVisible,
      actOnModalList,
      filterModalVisible,
      variableConfigModalVisible,
      variableConfigControl
    } = this.state

    const { metrics } = commonParams
    const [dimetionsCount, metricsCount] = this.getDiemtionsAndMetricsCount()
    const { spec, xAxis, yAxis, axis, splitLine, pivot: pivotConfig, label, legend, visualMap, toolbox, areaSelect, scorecard, iframe } = styleParams

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
      const pivot = getPivot()
      Object.entries(model).forEach(([key, m]) => {
        if (m.modelType === 'category') {
          categories.push({
            name: key,
            type: 'category',
            visualType: m.visualType
          })
        } else {
          values.push({
            name: key,
            type: 'value',
            visualType: m.visualType
          })
        }
      })
      if (mode === 'pivot'
          && values.length
          && metrics.items.every((item) => item.chart.id === pivot.id)) {
        categories.push({
          name: '指标名称',
          type: 'category',
          visualType: 'string'
        })
      }
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
        let panelList = []
        if (k === 'color') {
          panelList = metrics.items
        }
        if (k === 'size') {
          panelList = v.items
        }
        return (
          <Dropbox
            key={k}
            name={k}
            title={v.title}
            type={v.type}
            value={v.value}
            items={v.items}
            mode={mode}
            dragged={dragged}
            panelList={panelList}
            dimetionsCount={dimetionsCount}
            metricsCount={metricsCount}
            onValueChange={this.dropboxValueChange(k)}
            onItemDragStart={this.insideDragStart(k)}
            onItemDragEnd={this.insideDragEnd}
            onItemRemove={this.removeDropboxItem(k)}
            onItemSort={this.getDropboxItemSortDirection(k)}
            onItemChangeAgg={this.getDropboxItemAggregator(k)}
            onItemChangeColorConfig={this.dropboxItemChangeColorConfig}
            onItemChangeFilterConfig={this.dropboxItemChangeFilterConfig}
            onItemChangeChart={this.getDropboxItemChart}
            beforeDrop={this.beforeDrop}
            onDrop={this.drop}
          />
        )
      })

    const rowsColsToggleClass = classnames({
      [styles.toggleRowsAndCols]: true,
      [utilStyles.hide]: mode === 'chart'
    })
    const rowsColsSwitchClass = classnames({
      [styles.switchRowsAndCols]: true,
      [utilStyles.hide]: !showColsAndRows
    })

    const tabs = this.tabKeys.map(({key, title}) => {
      const tabClass = classnames({
        [styles.selected]: key === selectedTab
      })
      return (
        <li
          key={key}
          className={tabClass}
          onClick={this.tabSelect(key)}
        >
          {title}
        </li>
      )
    })

    const queryConfigColumns = [{
      title: '变量',
      dataIndex: 'variables',
      key: 'variables',
      render: (text, record) => record.variables.join(',')
    }, {
      title: '操作',
      key: 'action',
      width: 100,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Button
            size="small"
            shape="circle"
            icon="edit"
            onClick={this.showVariableConfigTable(record.id)}
          />
          <Button
            size="small"
            shape="circle"
            icon="delete"
            onClick={this.deleteControl(record.id)}
          />
        </span>
      )
    }]

    let queryInfo = []
    if (selectedView) {
      queryInfo = (selectedView.sql.match(/query@var\s+\$\w+\$/g) || [])
        .map((q) => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$')))
    }

    let mapLegendLayerType
    let mapLabelLayerType
    if (spec) {
      const { layerType } = spec
      mapLabelLayerType = !(layerType && layerType === 'heatmap')
      mapLegendLayerType = !(layerType && (layerType === 'heatmap' || layerType === 'map' || layerType === 'scatter'))
    }

    let tabPane
    switch (selectedTab) {
      case 'data':
        tabPane = (
          <div className={`${styles.paramsPane} ${styles.dropPane}`}>
            <div className={rowsColsToggleClass} onClick={this.toggleRowsAndCols}>
              <Icon type="swap" />
              {showColsAndRows ? ' 使用维度' : ' 使用行列'}
            </div>
            <div className={rowsColsSwitchClass} onClick={this.switchRowsAndCols}>
              <Icon type="retweet" /> 行列切换
            </div>
            {dropboxes}
          </div>
        )
        break
      case 'style':
        tabPane = (
          <div className={styles.paramsPane}>
            {spec && <SpecSection
              name={chartModeSelectedChart.name}
              title={chartModeSelectedChart.title}
              config={spec as ISpecConfig}
              onChange={this.styleChange('spec')}
              isLegendSection={mapLegendLayerType}
            />}
            { mapLabelLayerType
                ? label && <LabelSection
                  title="标签"
                  config={label as ILabelConfig}
                  onChange={this.styleChange('label')}
                  name={chartModeSelectedChart.name}
                />
                : null
            }
            { mapLegendLayerType
                ? legend && <LegendSection
                  title="图例"
                  config={legend as ILegendConfig}
                  onChange={this.styleChange('legend')}
                />
                : null
            }
            { mapLegendLayerType
                ? null
                : visualMap && <VisualMapSection
                  title="视觉映射"
                  config={visualMap as IVisualMapConfig}
                  onChange={this.styleChange('visualMap')}
                />
            }
            {toolbox && <ToolboxSection
              title="工具"
              config={toolbox as IToolboxConfig}
              onChange={this.styleChange('toolbox')}
            />}
            {xAxis && <AxisSection
              title="X轴"
              config={xAxis as IAxisConfig}
              onChange={this.styleChange('xAxis')}
            />}
            {yAxis && <AxisSection
              title="Y轴"
              config={yAxis as IAxisConfig}
              onChange={this.styleChange('yAxis')}
            />}
            {axis && <AxisSection
              title="轴"
              config={axis as IAxisConfig}
              onChange={this.styleChange('axis')}
            />}
            {splitLine && <SplitLineSection
              title="分隔线"
              config={splitLine as ISplitLineConfig}
              onChange={this.styleChange('splitLine')}
            />}
            {areaSelect && <AreaSelectSection
              title="坐标轴框选"
              config={areaSelect as IAreaSelectConfig}
              onChange={this.styleChange('areaSelect')}
            />}
            {scorecard && <ScorecardSection
              title="翻牌器"
              config={scorecard as IScorecardConfig}
              onChange={this.styleChange('scorecard')}
            />}
            {iframe && <IframeSection
              title="内嵌网页"
              config={iframe as IframeConfig}
              onChange={this.styleChange('iframe')}
            />}
            {pivotConfig && <PivotSection
              title="透视表"
              config={pivotConfig as IPivotConfig}
              onChange={this.styleChange('pivot')}
            />}
          </div>
        )
        break
      case 'variable':
        if (queryInfo.length) {
          tabPane = (
            <div className={styles.paramsPane}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col
                  span={24}
                  className={styles.addVariable}
                  onClick={this.showVariableConfigTable()}
                >
                  <Icon type="plus" /> 点击添加
                </Col>
              </Row>
              <Table
                dataSource={queryParams}
                columns={queryConfigColumns}
                rowKey="id"
                pagination={false}
              />
            </div>
          )
        } else {
          tabPane = (
            <div className={styles.paramsPane}>
              <div className={styles.paneBlock}>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                  <Col span={24}>
                    <h4>没有变量可以设置</h4>
                  </Col>
                </Row>
              </div>
            </div>
          )
        }
        break
      case 'cache':
        tabPane = (
          <div className={styles.paramsPane}>
            <div className={styles.paneBlock}>
              <h4>开启缓存</h4>
              <div className={styles.blockBody}>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                  <Col span={24}>
                    <RadioGroup size="small" value={cache} onChange={onCacheChange}>
                      <RadioButton value={false}>关闭</RadioButton>
                      <RadioButton value={true}>开启</RadioButton>
                    </RadioGroup>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={styles.paneBlock}>
              <h4>缓存有效期（秒）</h4>
              <div className={styles.blockBody}>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                  <Col span={24}>
                    <InputNumber value={expired} disabled={!cache} onChange={onExpiredChange} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )
        break
    }

    let colorSettingConfig
    let actOnSettingConfig
    let filterSettingConfig
    if (modalCachedData) {
      const selectedItem = modalDataFrom === 'filters'
        ? commonParams[modalDataFrom].items.find((i) => i.name === modalCachedData.name)
        : specificParams[modalDataFrom].items.find((i) => i.name === modalCachedData.name)
      switch (modalDataFrom) {
        case 'color':
          colorSettingConfig = selectedItem ? selectedItem.config : {}
          break
        case 'filters':
          filterSettingConfig = selectedItem ? selectedItem.config : {}
          break
        default:
          actOnSettingConfig = selectedItem ? selectedItem.config : {}
          break
      }
    }

    const selectedCharts = mode === 'pivot'
      ? this.getPivotModeSelectedCharts(metrics.items)
      : [chartModeSelectedChart]

    return (
      <div className={styles.operatingPanel}>
        <div className={styles.model}>
          <div className={styles.viewSelect}>
            <Dropdown overlay={viewSelectMenu} trigger={['click']} placement="bottomLeft">
              <a>{selectedView ? selectedView.name : '选择一个View'}</a>
            </Dropdown>
          </div>
          <div className={styles.columnContainer}>
            <h4>分类型</h4>
            <ul className={`${styles.columnList} ${styles.categories}`}>
              {categories.map((cat) => (
                <li
                  key={cat.name}
                  onDragStart={this.dragStart(cat)}
                  onDragEnd={this.dragEnd}
                  draggable
                >
                  <i className={`iconfont ${this.getDragItemIconClass(cat.visualType)}`} />
                  <p>{cat.name}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.columnContainer}>
            <h4>数值型</h4>
            <ul className={`${styles.columnList} ${styles.values}`}>
              {values.map((v) => (
                <li
                  key={v.name}
                  onDragStart={this.dragStart({...v, name: encodeMetricName(v.name), agg: 'sum'})}
                  onDragEnd={this.dragEnd}
                  draggable
                >
                  <i className={`iconfont ${this.getDragItemIconClass(v.visualType)}`} />
                  <p>{v.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.config}>
          <div className={styles.mode}>
            <RadioGroup size="small" value={mode} onChange={this.changeMode}>
              <RadioButton
                className={classnames({
                  [styles.button]: mode !== 'pivot'
                })}
                value="pivot"
              >
                透视驱动
              </RadioButton>
              <RadioButton
                className={classnames({
                  [styles.button]: mode !== 'chart'
                })}
                value="chart"
              >
                图表驱动
              </RadioButton>
            </RadioGroup>
          </div>
          <div className={styles.charts}>
            {currentWidgetlibs.map((c) => (
              <ChartIndicator
                key={c.id}
                chartInfo={c}
                dimetionsCount={dimetionsCount}
                metricsCount={metricsCount}
                selectedCharts={selectedCharts}
                onSelect={this.chartSelect}
              />
            ))}
          </div>
          <div className={styles.params}>
            <ul className={styles.paramsTab}>{tabs}</ul>
            {tabPane}
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
            mode={mode}
            list={distinctColumnValues}
            loading={columnValueLoading}
            metrics={metrics.items}
            config={colorSettingConfig}
            onSave={this.confirmColorModal}
            onCancel={this.cancelColorModal}
            ref={(f) => this.colorSettingForm = f}
          />
        </Modal>
        <Modal
          title="作用于"
          wrapClassName="ant-modal-small"
          visible={actOnModalVisible}
          onCancel={this.cancelActOnModal}
          afterClose={this.afterActOnModalClose}
          footer={null}
        >
          <ActOnSettingForm
            list={actOnModalList}
            config={actOnSettingConfig}
            onSave={this.confirmActOnModal}
            onCancel={this.cancelActOnModal}
            ref={(f) => this.actOnSettingForm = f}
          />
        </Modal>
        <Modal
          title="筛选配置"
          visible={filterModalVisible}
          onCancel={this.cancelFilterModal}
          afterClose={this.afterFilterModalClose}
          footer={null}
        >
          <FilterSettingForm
            item={modalCachedData}
            list={distinctColumnValues}
            config={filterSettingConfig}
            onSave={this.confirmFilterModal}
            onCancel={this.cancelFilterModal}
            ref={(f) => this.filterSettingForm = f}
          />
        </Modal>
        <Modal
          title="QUERY变量配置"
          wrapClassName="ant-modal-large"
          visible={variableConfigModalVisible}
          onCancel={this.hideVariableConfigTable}
          afterClose={this.resetVariableConfigForm}
          footer={false}
          maskClosable={false}
        >
          <VariableConfigForm
            queryInfo={queryInfo}
            control={variableConfigControl}
            onSave={this.saveControl}
            onClose={this.hideVariableConfigTable}
            wrappedComponentRef={this.refHandlers.variableConfigForm}
          />
        </Modal>
      </div>
    )
  }
}

export default OperatingPanel
