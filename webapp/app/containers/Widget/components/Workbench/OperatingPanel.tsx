import React from 'react'
import classnames from 'classnames'

import widgetlibs from '../../config'
import { IDataRequestParams } from 'app/containers/Dashboard/Grid'
import { IView, IModel } from './index'
import Dropbox, { DropboxType, ViewModelType, DropType, SortType, AggregatorType, IDataParamSource, IDataParamConfig, DragType} from './Dropbox'
import { IWidgetProps, IChartStyles, IChartInfo, IPaginationParams, WidgetMode, RenderType, DimetionType } from '../Widget'
import FieldConfigModal, { IFieldConfig, getDefaultFieldConfig } from './FieldConfig'
import FormatConfigModal, { IFieldFormatConfig, getDefaultFieldFormatConfig } from './FormatConfigModal'
import ColorSettingForm from './ColorSettingForm'
import ActOnSettingForm from './ActOnSettingForm'
import FilterSettingForm from './FilterSettingForm'
import VariableConfigForm from '../VariableConfigForm'
import ComputedConfigForm from '../ComputedConfigForm'
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
import TableSection, { ITableConfig } from './ConfigSections/TableSection'
import { encodeMetricName, decodeMetricName, getPivot, getTable, getPivotModeSelectedCharts, checkChartEnable } from '../util'
import { PIVOT_DEFAULT_SCATTER_SIZE_TIMES } from '../../../../globalConstants'
import PivotTypes from '../../config/pivot/PivotTypes'
import { uuid } from '../../../../utils/util'

import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Icon from 'antd/lib/icon'
import Menu from 'antd/lib/menu'
const MenuItem = Menu.Item
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
import InputNumber from 'antd/lib/input-number'
import Dropdown from 'antd/lib/dropdown'
import Modal from 'antd/lib/modal'
import Popconfirm from 'antd/lib/popconfirm'
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

export interface IDataParams {
  [key: string]: IDataParamProperty
}

interface IOperatingPanelProps {
  views: IView[]
  originalWidgetProps: IWidgetProps
  selectedView: IView
  distinctColumnValues: any[]
  columnValueLoading: boolean
  controls: any[]
  cache: boolean
  expired: number
  computed: any[]
  originalComputed: any[]
  onViewSelect: (selectedView: IView) => void
  onSetControls: (controls: any[]) => void
  onCacheChange: (e: RadioChangeEvent) => void
  onExpiredChange: (expired: number) => void
  onSetComputed: (computesField: any[]) => void
  onDeleteComputed: (computesField: any[]) => void
  onSetWidgetProps: (widgetProps: IWidgetProps) => void
  onLoadData: (viewId: number, requestParams: IDataRequestParams, resolve: (data: any) => void) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
}

interface IOperatingPanelStates {
  dragged: IDataParamSource
  showColsAndRows: boolean
  mode: WidgetMode
  currentWidgetlibs: IChartInfo[]
  chartModeSelectedChart: IChartInfo
  selectedTab: 'data' | 'style' | 'variable' | 'cache'
  dataParams: IDataParams
  styleParams: IChartStyles
  pagination: IPaginationParams
  modalCachedData: IDataParamSource
  modalCallback: (data: boolean | IDataParamConfig) => void
  modalDataFrom: string

  currentEditingCommonParamKey: string
  currentEditingItem: IDataParamSource
  fieldModalVisible: boolean

  formatModalVisible: boolean
  selectedFormatVisualType: string

  colorModalVisible: boolean
  actOnModalVisible: boolean
  actOnModalList: IDataParamSource[]
  filterModalVisible: boolean
  variableConfigModalVisible: boolean
  variableConfigControl: object
  computedConfigModalVisible: boolean
  selectedComputed: object
}

export class OperatingPanel extends React.Component<IOperatingPanelProps, IOperatingPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      dragged: null,
      showColsAndRows: false,
      mode: 'pivot',
      currentWidgetlibs: widgetlibs['pivot'],
      chartModeSelectedChart: getTable(),
      selectedTab: 'data',
      dataParams: Object.entries(getPivot().data)
        .reduce((params: IDataParams, [key, value]) => {
          params[key] = { ...value, items: []}
          return params
        }, {}),
      styleParams: {},
      pagination: { pageNo: 0, pageSize: 0, withPaging: false, totalCount: 0 },
      modalCachedData: null,
      modalCallback: null,
      modalDataFrom: '',
      currentEditingCommonParamKey: '',
      currentEditingItem: null,
      fieldModalVisible: false,
      formatModalVisible: false,
      selectedFormatVisualType: '',
      colorModalVisible: false,
      actOnModalVisible: false,
      actOnModalList: null,
      filterModalVisible: false,
      variableConfigModalVisible: false,
      variableConfigControl: {},
      computedConfigModalVisible: false,
      selectedComputed: null
    }
  }

  private lastRequestParamString: string = ''

  private tabKeys = [
    { key: 'data', title: '数据' },
    { key: 'style', title: '样式' },
    { key: 'variable', title: '变量' },
    { key: 'cache', title: '缓存' }
  ]

  private colorSettingForm = null
  private actOnSettingForm = null
  private filterSettingForm = null

  private variableConfigForm = null
  private computedConfigForm = null
  private refHandlers = {
    variableConfigForm: (ref) => this.variableConfigForm = ref,
    computedConfigForm: (ref) => this.computedConfigForm = ref
  }

  public componentWillMount () {
    this.setState({
      ...this.getChartDataConfig(getPivotModeSelectedCharts([]))
    })
  }

  public componentWillReceiveProps (nextProps: IOperatingPanelProps) {
    const { selectedView, originalWidgetProps } = nextProps
    if (originalWidgetProps && originalWidgetProps !== this.props.originalWidgetProps) {
      const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, chartStyles, mode, selectedChart } = originalWidgetProps
      const { dataParams } = this.state
      const model = JSON.parse(selectedView.model)
      const currentWidgetlibs = widgetlibs[mode || 'pivot'] // FIXME 兼容 0.3.0-beta.1 之前版本

      cols.forEach((c) => {
        const modelColumn = model[c.name]
        if (modelColumn) {
          dataParams.cols.items = dataParams.cols.items.concat({
            ...c,
            from: 'cols',
            type: 'category' as DragType,
            visualType: c.name === '指标名称' ? 'string' : modelColumn.visualType
          })
        }
      })
      rows.forEach((r) => {
        const modelColumn = model[r.name]
        if (modelColumn) {
          dataParams.rows.items = dataParams.rows.items.concat({
            ...r,
            from: 'rows',
            type: 'category' as DragType,
            visualType: r.name === '指标名称' ? 'string' :  modelColumn.visualType
          })
        }
      })
      metrics.forEach((m) => {
        const modelColumn = model[decodeMetricName(m.name)]
        if (modelColumn) {
          dataParams.metrics.items = dataParams.metrics.items.concat({
            ...m,
            from: 'metrics',
            type: 'value' as DragType,
            visualType: modelColumn.visualType,
            chart: currentWidgetlibs.find((wl) => wl.id === m.chart.id) // FIXME 兼容 0.3.0-beta.1 之前版本，widgetlib requireDimetions requireMetrics 有发生变更
          })
        }
      })
      if (dataParams.secondaryMetrics && secondaryMetrics) {
        secondaryMetrics.forEach((m) => {
          const modelColumn = model[decodeMetricName(m.name)]
          if (modelColumn) {
            dataParams.secondaryMetrics.items = dataParams.secondaryMetrics.items.concat({
              ...m,
              from: 'secondaryMetrics',
              type: 'value' as DragType,
              visualType: modelColumn.visualType
            })
          }
        })
      }
      filters.forEach((f) => {
        const modelColumn = model[f.name]
        if (modelColumn) {
          dataParams.filters.items = dataParams.filters.items.concat({
            ...f,
            visualType: modelColumn.visualType
          })
        }
      })

      const mergedDataParams = {
        ...dataParams,
        ...color && {color},
        ...label && {label},
        ...size && {size},
        ...xAxis && {xAxis},
        ...tip && {tip}
      }
      this.setState({
        mode: mode || 'pivot', // FIXME 兼容 0.3.0-beta.1 之前版本
        currentWidgetlibs,
        ...selectedChart && {chartModeSelectedChart: widgetlibs['chart'].find((wl) => wl.id === selectedChart)},
        dataParams: mergedDataParams,
        styleParams: chartStyles,
        showColsAndRows: !!rows.length
      }, () => {
        this.setWidgetProps(mergedDataParams, chartStyles)
      })
    }
  }

  private getChartDataConfig = (selectedCharts: IChartInfo[]) => {
    const { mode } = this.state
    const { dataParams, styleParams } = this.state
    const { metrics, color, size } = dataParams
    const dataConfig = {}
    const styleConfig = {}
    let specSign = false
    selectedCharts.forEach((chartInfo) => {
      Object.entries(chartInfo.data).forEach(([key, prop]: [string, IDataParamProperty]) => {
        if (!dataConfig[key]) {
          let value = null
          switch (key) {
            case 'color':
              value = color && color.value
                ? {
                  all: color.value.all,
                  ...metrics.items.reduce((props, item, i) => {
                    props[item.name] = mode === 'pivot'
                      ? color.value[item.name] || color.value['all']
                      : color.value[item.name] || defaultThemeColors[i]
                    return props
                  }, {})
                }
                : { all: defaultThemeColors[0] }
              break
            case 'size':
              value = size && size.value ? size.value : { all: PIVOT_DEFAULT_SCATTER_SIZE_TIMES }
              break
          }
          dataConfig[key] = {
            ...prop,
            ...value && {value},
            items: dataParams[key] ? dataParams[key].items : []
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
      dataParams: dataConfig,
      styleParams: styleConfig
    }
  }

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
      const { dragged: { name, from }, dataParams, styleParams } = this.state
      const prop = dataParams[from]
      prop.items = prop.items.filter((i) => i.name !== name)
      this.setWidgetProps(dataParams, styleParams)
    }

    this.setState({
      dragged: null
    })
  }

  private beforeDrop = (name, cachedItem, resolve) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { mode, dataParams } = this.state
    const { metrics } = dataParams

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
    const { dragged: stateDragged, dataParams, styleParams, modalCachedData } = this.state
    const dragged = stateDragged || modalCachedData
    const from = dragged.from && dragged.from !== name && dataParams[dragged.from]
    const destination = dataParams[name]
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
        combinedItem = {...dragged, chart: dataParams.metrics.items.length ? dataParams.metrics.items[0].chart : getPivot()}
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
    this.setWidgetProps(dataParams, styleParams)
  }

  private toggleRowsAndCols = () => {
    const { dataParams, styleParams } = this.state
    const { cols, rows } = dataParams

    if (this.state.showColsAndRows && rows.items.length) {
      cols.items = cols.items.concat(rows.items)
      rows.items = []
      this.setWidgetProps(dataParams, styleParams)
    }

    this.setState({
      showColsAndRows: !this.state.showColsAndRows
    })
  }

  private switchRowsAndCols = () => {
    const { dataParams, styleParams } = this.state
    const { cols, rows } = dataParams

    let temp = cols.items.slice()
    cols.items = rows.items.slice()
    rows.items = temp
    temp = null

    this.setWidgetProps(dataParams, styleParams)
  }

  private removeDropboxItem = (from: string) => (name: string) => () => {
    const { dataParams, styleParams } = this.state
    const prop = dataParams[from]
    prop.items = prop.items.filter((i) => i.name !== name)
    this.setWidgetProps(dataParams, styleParams)
  }

  private getDropboxItemSortDirection = (from: string) => (item: IDataParamSource, sort: SortType) => {
    const { dataParams, styleParams } = this.state
    const prop = dataParams[from]
    item.sort = ['asc', 'desc'].indexOf(sort) >= 0 ? sort : void 0
    prop.items = [...prop.items]
    this.setWidgetProps(dataParams, styleParams)
  }

  private getDropboxItemAggregator = (from: string) => (item: IDataParamSource, agg: AggregatorType) => {
    const { dataParams, styleParams } = this.state
    const prop = dataParams[from]
    item.agg = agg
    prop.items = [...prop.items]
    this.setWidgetProps(dataParams, styleParams)
  }

  private dropboxItemChangeFieldConfig = (from: string) => (item: IDataParamSource) => {
    this.setState({
      currentEditingCommonParamKey: from,
      currentEditingItem: item,
      fieldModalVisible: true
    })
  }

  private saveFieldConfig = (fieldConfig: IFieldConfig) => {
    const {
      currentEditingCommonParamKey,
      currentEditingItem,
      dataParams,
      styleParams
    } = this.state
    const item = dataParams[currentEditingCommonParamKey].items.find((i) => i.name === currentEditingItem.name)
    item.field = fieldConfig
    this.setWidgetProps(dataParams, styleParams)
    this.setState({
      fieldModalVisible: false
    })
  }

  private cancelFieldConfig = () => {
    this.setState({
      fieldModalVisible: false
    })
  }


  private dropboxItemChangeFormatConfig = (from: string) => (item: IDataParamSource) => {
    this.setState({
      currentEditingCommonParamKey: from,
      currentEditingItem: item,
      formatModalVisible: true
    })
  }

  private saveFormatConfig = (formatConfig: IFieldFormatConfig) => {
    const {
      currentEditingCommonParamKey,
      currentEditingItem,
      dataParams,
      styleParams
    } = this.state
    const item = dataParams[currentEditingCommonParamKey].items.find((i) => i.name === currentEditingItem.name)
    item.format = formatConfig
    this.setWidgetProps(dataParams, styleParams)
    this.setState({
      formatModalVisible: false
    })
  }

  private cancelFormatConfig = () => {
    this.setState({
      formatModalVisible: false
    })
  }

  private dropboxItemChangeColorConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { dataParams, styleParams } = this.state
    onLoadDistinctValue(selectedView.id, item.name)
    this.setState({
      modalCachedData: item,
      modalDataFrom: 'color',
      modalCallback: (config) => {
        if (config) {
          const colorItems = dataParams.color.items
          const actingOnItemIndex = colorItems.findIndex((i) => i.config.actOn === config['actOn'] && i.name !== item.name)
          if (actingOnItemIndex >= 0) {
            dataParams.color.items = [
              ...colorItems.slice(0, actingOnItemIndex),
              ...colorItems.slice(actingOnItemIndex + 1)
            ]
          }
          item.config = config as IDataParamConfig
          this.setWidgetProps(dataParams, styleParams)
        }
      },
      colorModalVisible: true
    })
  }

  private dropboxItemChangeFilterConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { dataParams, styleParams } = this.state
    if (item.type === 'category') {
      onLoadDistinctValue(selectedView.id, item.name)
    }
    this.setState({
      modalCachedData: item,
      modalDataFrom: 'filters',
      modalCallback: (config) => {
        if (config) {
          item.config = config as IDataParamConfig
          this.setWidgetProps(dataParams, styleParams)
        }
      },
      filterModalVisible: true
    })
  }

  private getDropboxItemChart = (item: IDataParamSource) => (chart: IChartInfo) => {
    const { dataParams } = this.state
    item.chart = chart
    dataParams.metrics.items = [...dataParams.metrics.items]
    const selectedParams = this.getChartDataConfig(getPivotModeSelectedCharts(dataParams.metrics.items))
    this.setWidgetProps(selectedParams.dataParams, selectedParams.styleParams)
  }

  private getDimetionsAndMetricsCount = () => {
    const { dataParams } = this.state
    const { cols, rows, metrics } = dataParams
    const dcount = cols.items.length + rows.items.length
    const mcount = metrics.items.length
    return [dcount, mcount]
  }

  public triggerWidgetRefresh = (pageNo: number, pageSize: number) => {
    const { dataParams, styleParams, pagination } = this.state
    this.setWidgetProps(dataParams, styleParams, 'rerender', {
      ...pagination,
      pageNo,
      pageSize
    })
  }

  private setWidgetProps = (dataParams: IDataParams, styleParams: IChartStyles, renderType?: RenderType, updatedPagination?: IPaginationParams) => {
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, yAxis } = dataParams
    const { selectedView, onLoadData, onSetWidgetProps } = this.props
    const { mode, chartModeSelectedChart, pagination } = this.state
    const fromPagination = !!updatedPagination
    updatedPagination = { ...pagination, ...updatedPagination }
    let groups = cols.items.map((c) => c.name)
      .concat(rows.items.map((r) => r.name))
      .filter((g) => g !== '指标名称')
    let aggregators = metrics.items.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))
    if (secondaryMetrics) {
      aggregators = aggregators.concat(secondaryMetrics.items
        .map((m) => ({
          column: decodeMetricName(m.name),
          func: m.agg
        })))
    }
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
    Object.values(dataParams)
      .reduce<IDataParamSource[]>((items, param: IDataParamProperty) => items.concat(param.items), [])
      .forEach((item) => {
        const column = item.type === 'category' ? item.name : `${item.agg}(${decodeMetricName(item.name)})`
        if (item.sort) {
          orders.push({
            column,
            direction: item.sort
          })
        }
      })

    let selectedCharts
    let dimetionsCount

    if (mode === 'pivot') {
      selectedCharts = getPivotModeSelectedCharts(metrics.items)
      dimetionsCount = groups.length
    } else {
      selectedCharts = [chartModeSelectedChart]
      dimetionsCount = cols.items.length
    }

    if (!checkChartEnable(dimetionsCount, metrics.items.length, selectedCharts)) {
      selectedCharts = mode === 'pivot'
        ? getPivotModeSelectedCharts([])
        : [getTable()]
    }
    const mergedParams = this.getChartDataConfig(selectedCharts)
    const mergedDataParams = mergedParams.dataParams
    const mergedStyleParams = mergedParams.styleParams

    let noAggregators = false
    if (styleParams.table) { // @FIXME pagination in table style config
      const { withPaging, pageSize, withNoAggregators } = styleParams.table
      noAggregators = withNoAggregators
      if (!fromPagination) {
        if (withPaging) {
          updatedPagination.pageNo = 1
          updatedPagination.pageSize = +pageSize
        } else {
          updatedPagination.pageNo = 0
          updatedPagination.pageSize = 0
        }
      }
      updatedPagination.withPaging = withPaging
    }

    const requestParams = {
      groups,
      aggregators,
      filters: filters.items.map((i) => i.config.sql),
      orders,
      pageNo: updatedPagination.pageNo,
      pageSize: updatedPagination.pageSize,
      nativeQuery: noAggregators,
      cache: false,
      expired: 0
    }

    const requestParamString = JSON.stringify(requestParams)
    if (selectedView && requestParamString !== this.lastRequestParamString) {
      this.lastRequestParamString = requestParamString
      onLoadData(selectedView.id, requestParams, (result) => {
        const { resultList: data, pageNo, pageSize, totalCount } = result
        updatedPagination = !updatedPagination.withPaging ? updatedPagination : {
          ...updatedPagination,
          pageNo,
          pageSize,
          totalCount
        }
        if (data.length) {
          onSetWidgetProps({
            cols: cols.items.map((item) => ({
              ...item,
              field: item.field || getDefaultFieldConfig(),
              format: item.format || getDefaultFieldFormatConfig()
            })),
            rows: rows.items.map((item) => ({
              ...item,
              field: item.field || getDefaultFieldConfig(),
              format: item.format || getDefaultFieldFormatConfig()
            })),
            metrics: metrics.items.map((item) => ({
              ...item,
              agg: item.agg || 'sum',
              chart: item.chart || getPivot(),
              field: item.field || getDefaultFieldConfig(),
              format: item.format || getDefaultFieldFormatConfig()
            })),
            ...secondaryMetrics && {
              secondaryMetrics: secondaryMetrics.items.map((item) => ({
                ...item,
                agg: item.agg || 'sum',
                chart: item.chart || getPivot(),
                field: item.field || getDefaultFieldConfig(),
                format: item.format || getDefaultFieldFormatConfig()
              }))
            },
            filters: filters.items.map(({name, type, config}) => ({ name, type, config })),
            ...color && {color},
            ...label && {label},
            ...size && {size},
            ...xAxis && {xAxis},
            ...tip && {tip},
            ...yAxis && {yAxis},
            chartStyles: mergedStyleParams,
            selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
            data,
            pagination: updatedPagination,
            dimetionAxis: this.getDimetionAxis(selectedCharts),
            renderType: renderType || 'rerender',
            orders,
            mode,
            model: JSON.parse(selectedView.model)
          })
          this.setState({
            chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
            pagination: updatedPagination
          })
        } else {
          onSetWidgetProps({
            cols: [],
            rows: [],
            metrics: [],
            filters: [],
            data: [],
            pagination: updatedPagination,
            chartStyles: mergedStyleParams,
            selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
            dimetionAxis: this.getDimetionAxis([getPivot()]),
            renderType: 'rerender',
            orders,
            mode,
            model: JSON.parse(selectedView.model)
          })
          this.setState({
            chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
            pagination: updatedPagination
          })
        }
        this.setState({
          dataParams: mergedDataParams,
          styleParams: mergedStyleParams
        })
      })
    } else {
      onSetWidgetProps({
        data: null,
        cols: cols.items.map((item) => ({
          ...item,
          field: item.field || getDefaultFieldConfig(),
          format: item.format || getDefaultFieldFormatConfig()
        })),
        rows: rows.items.map((item) => ({
          ...item,
          field: item.field || getDefaultFieldConfig(),
          format: item.format || getDefaultFieldFormatConfig()
        })),
        metrics: metrics.items.map((item) => ({
          ...item,
          agg: item.agg || 'sum',
          chart: item.chart || getPivot(),
          field: item.field || getDefaultFieldConfig(),
          format: item.format || getDefaultFieldFormatConfig()
        })),
        ...secondaryMetrics && {
          secondaryMetrics: secondaryMetrics.items.map((item) => ({
            ...item,
            agg: item.agg || 'sum',
            chart: item.chart || getPivot(),
            field: item.field || getDefaultFieldConfig(),
            format: item.format || getDefaultFieldFormatConfig()
          }))
        },
        filters: filters.items.map(({name, type, config}) => ({ name, type, config })),
        ...color && {color},
        ...label && {label},
        ...size && {size},
        ...xAxis && {xAxis},
        ...tip && {tip},
        ...yAxis && {yAxis},
        chartStyles: mergedStyleParams,
        selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
        pagination: updatedPagination,
        dimetionAxis: this.getDimetionAxis(selectedCharts),
        renderType: renderType || 'clear',
        orders,
        mode,
        model: selectedView ? JSON.parse(selectedView.model) : {}
      })
      this.setState({
        chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
        pagination: updatedPagination,
        dataParams: mergedDataParams,
        styleParams: mergedStyleParams
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
    const { mode, dataParams } = this.state
    const { cols, rows, metrics } = dataParams
    if (mode === 'pivot') {
      if (!(metrics.items.length === 1 && metrics.items[0].chart.id === chart.id)) {
        metrics.items.forEach((i) => {
          i.chart = chart
        })
        if (chart.id !== PivotTypes.PivotTable) {
          cols.items = cols.items.filter((c) => c.name !== '指标名称')
          rows.items = rows.items.filter((r) => r.name !== '指标名称')
        }
        const selectedParams = this.getChartDataConfig(getPivotModeSelectedCharts(metrics.items))
        this.setWidgetProps(selectedParams.dataParams, selectedParams.styleParams)
      }
    } else {
      this.setState({
        chartModeSelectedChart: chart,
        pagination: { pageNo: 0, pageSize: 0, withPaging: false, totalCount: 0 }
      }, () => {
        const selectedParams = this.getChartDataConfig([chart])
        this.setWidgetProps(selectedParams.dataParams, selectedParams.styleParams)
      })
    }
  }

  private viewSelect = ({key}) => {
    const { mode, dataParams } = this.state
    const hasItems = Object.values(dataParams)
      .filter((param) => !!param.items.length)
    if (hasItems.length) {
      confirm({
        title: '切换 View 会清空所有配置项，是否继续？',
        onOk: () => {
          this.resetWorkbench(mode)
          this.props.onViewSelect(this.props.views.find((v) => v.id === Number(key)))
        }
      })
    } else {
      this.props.onViewSelect(this.props.views.find((v) => v.id === Number(key)))
    }
  }

  private changeMode = (e) => {
    const mode = e.target.value
    const { dataParams } = this.state
    const hasItems = Object.values(dataParams)
      .filter((param) => !!param.items.length)
    if (hasItems.length) {
      confirm({
        title: '切换图表模式会清空所有配置项，是否继续？',
        onOk: () => {
          this.setState({
            mode,
            currentWidgetlibs: widgetlibs[mode]
          }, () => {
            this.resetWorkbench(mode)
          })
        }
      })
    } else {
      this.setState({
        mode,
        currentWidgetlibs: widgetlibs[mode]
      }, () => {
        this.resetWorkbench(mode)
      })
    }
  }

  private resetWorkbench = (mode) => {
    const { dataParams } = this.state
    Object.values(dataParams).forEach((param) => {
      param.items = []
      if (param.value) {
        param.value = {}
      }
    })
    this.setState({
      showColsAndRows: false,
      chartModeSelectedChart: getTable()
    })
    const selectedCharts = mode === 'pivot'
      ? getPivotModeSelectedCharts([])
      : [getTable()]
    const resetedParams = this.getChartDataConfig(selectedCharts)
    this.setWidgetProps(resetedParams.dataParams, resetedParams.styleParams)
  }

  private dropboxValueChange = (name) => (key: string, value: string | number) => {
    const { mode, dataParams, styleParams } = this.state
    const { color, size } = dataParams
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
    this.setWidgetProps(dataParams, styleParams, 'refresh')
  }

  private styleChange = (name) => (prop, value) => {
    const { dataParams, styleParams } = this.state
    styleParams[name][prop] = value
    let renderType: RenderType = 'clear'
    switch (prop) {
      case 'layerType':
        renderType = 'rerender'
        break
      case 'smooth':
        renderType = 'clear'
        break
    }
    this.setWidgetProps(dataParams, styleParams, renderType)
    // const { layerType } = styleParams.spec
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
      modalCachedData: null,
      modalCallback: null,
      modalDataFrom: ''
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
      actOnModalList: null,
      modalCachedData: null,
      modalCallback: null,
      modalDataFrom: ''
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
      filterModalVisible: false,
      modalCachedData: null,
      modalCallback: null,
      modalDataFrom: ''
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
        ? this.props.controls.find((q) => q.id === id)
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
    const { controls, onSetControls } = this.props
    const { dataParams, styleParams } = this.state
    const itemIndex = controls.findIndex((q) => q.id === control.id)

    if (itemIndex >= 0) {
      controls.splice(itemIndex, 1, control)
      onSetControls([...controls.slice(0, itemIndex), control, ...controls.slice(itemIndex + 1)])
    } else {
      onSetControls(controls.concat(control))
    }
  }

  private deleteControl = (id) => () => {
    const { controls, onSetControls } = this.props
    onSetControls(controls.filter((q) => q.id !== id))
  }

  private coustomFieldSelect = (event) => {
    const {key} = event
    switch (key) {
      case 'computed':
        this.setState({
          computedConfigModalVisible: true
        })
        break
      default:
        break
    }
  }

  private hideComputedConfigModal = () => {
    this.setState({computedConfigModalVisible: false, selectedComputed: null})
  }

  private saveComputedConfig = (config) => {
    console.log({config})
    const {onSetComputed} = this.props
    if (config) {
      onSetComputed(config)
    }
  }

  private onShowEditComputed = (tag) => () => {
    console.log({tag})
    this.setState({
      computedConfigModalVisible: true,
      selectedComputed: tag
    }, () => {
      const {id, name, visualType, sqlExpression} = tag
      this.forceUpdate(() => {
        this.computedConfigForm.props.form.setFieldsValue({id, name, visualType})
      })
    })
  }

  private onDeleteComputed = (tag) => () => {
    const { onDeleteComputed } = this.props
    if (onDeleteComputed) {
      onDeleteComputed(tag)
    }
  }

  private bootstrapMorePanel = (tag) => {
    const columnMenu = (
      <Menu>
        <Menu.Item className={styles.menuItem}>
          <span
            className={styles.menuText}
            onClick={this.onShowEditComputed(tag)}
          >
          字段信息
          </span>
        </Menu.Item>
        <Menu.Item className={styles.menuItem}>
          <Popconfirm
            title={`确定删除 ${tag.name}?`}
            placement="bottom"
            onConfirm={this.onDeleteComputed(tag)}
          >
            <span className={styles.menuText}>删除</span>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    )

    return (
      <span className={styles.more}>
        <Dropdown overlay={columnMenu} placement="bottomRight" trigger={['click']}>
          <Icon type="ellipsis" />
        </Dropdown>
      </span>
    )
  }
  public render () {
    const {
      views,
      selectedView,
      distinctColumnValues,
      columnValueLoading,
      controls,
      cache,
      expired,
      computed,
      onCacheChange,
      onExpiredChange,
      originalWidgetProps,
      originalComputed
    } = this.props
    const {
      dragged,
      showColsAndRows,
      mode,
      currentWidgetlibs,
      chartModeSelectedChart,
      selectedTab,
      dataParams,
      styleParams,
      modalCachedData,
      modalDataFrom,
      fieldModalVisible,
      formatModalVisible,
      selectedFormatVisualType,
      currentEditingItem,
      colorModalVisible,
      actOnModalVisible,
      actOnModalList,
      filterModalVisible,
      variableConfigModalVisible,
      variableConfigControl,
      computedConfigModalVisible,
      selectedComputed
    } = this.state

    const { metrics } = dataParams
    const [dimetionsCount, metricsCount] = this.getDimetionsAndMetricsCount()
    const {
      spec, xAxis, yAxis, axis, splitLine, pivot: pivotConfig, label, legend,
      visualMap, toolbox, areaSelect, scorecard, iframe, table } = styleParams

    const viewSelectMenu = (
      <Menu onClick={this.viewSelect}>
        {(views || []).map((v) => (
          <MenuItem key={v.id}>{v.name}</MenuItem>
        ))}
      </Menu>
    )

    const coustomFieldSelectMenu = (
      <Menu onClick={this.coustomFieldSelect}>
        <MenuItem key="computed">计算字段</MenuItem>
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

    const dropboxes = Object.entries(dataParams)
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
            selectedChartId={chartModeSelectedChart.id}
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
            onItemChangeFieldConfig={this.dropboxItemChangeFieldConfig(k)}
            onItemChangeFormatConfig={this.dropboxItemChangeFormatConfig(k)}
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

    let queryInfo: string[] = []
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
            {table && <TableSection
              dataParams={dataParams}
              config={table as ITableConfig}
              onChange={this.styleChange('table')}
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
                dataSource={controls}
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
      const selectedItem = dataParams[modalDataFrom]
        .items.find((i) => i.name === modalCachedData.name)
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
      ? getPivotModeSelectedCharts(metrics.items)
      : [chartModeSelectedChart]
    const computedAddFrom = computed.map((c) => ({...c, from: 'computed'}))
    const originalWidgetPropsAddFrom = originalComputed ? originalComputed.map((c) => ({...c, from: 'originalComputed'})) : []
    const combineComputedFields = originalComputed
    ? [...computedAddFrom, ...originalWidgetPropsAddFrom]
    : [...computedAddFrom]

    combineComputedFields.forEach((compute) => {
      if (compute.visualType === 'number') {
        values.push(compute)
      } else if (compute.visualType === 'string') {
        categories.push(compute)
      }
    })
    console.log({categories})
    console.log({values})

    return (
      <div className={styles.operatingPanel}>
        <div className={styles.model}>
          <div className={styles.viewSelect}>
            <Dropdown overlay={viewSelectMenu} trigger={['click']} placement="bottomLeft">
              <a>{selectedView ? selectedView.name : '选择一个View'}</a>
            </Dropdown>
            {/* <Dropdown overlay={coustomFieldSelectMenu} trigger={['click']} placement="bottomRight">
              <Icon type="plus" />
            </Dropdown> */}
          </div>
          <div className={styles.columnContainer}>
            <h4>分类型</h4>
            <ul className={`${styles.columnList} ${styles.categories}`}>
              {categories.map((cat) => (
                <li
                  className={`${cat.title === 'computedField' ? styles.computed : ''}`}
                  key={cat.name}
                  onDragStart={this.dragStart(cat)}
                  onDragEnd={this.dragEnd}
                  draggable
                >
                  <i className={`iconfont ${this.getDragItemIconClass(cat.visualType)}`} />
                  <p>{cat.name}</p>
                  {cat.title === 'computedField' ? this.bootstrapMorePanel(cat) : null}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.columnContainer}>
            <h4>数值型</h4>
            <ul className={`${styles.columnList} ${styles.values}`}>
              {values.map((v) => (
                <li
                  className={`${v.title === 'computedField' ? styles.computed : ''}`}
                  key={v.name}
                  onDragStart={this.dragStart({...v, name: encodeMetricName(v.name), agg: 'sum'})}
                  onDragEnd={this.dragEnd}
                  draggable
                >
                  <i className={`iconfont ${this.getDragItemIconClass(v.visualType)}`} />
                  <p>{v.name}</p>
                  {v.title === 'computedField' ? this.bootstrapMorePanel(v) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.config}>
          <div className={styles.mode}>
            <RadioGroup
              size="small"
              className={styles.radio}
              value={mode}
              onChange={this.changeMode}
            >
              <RadioButton
                className={classnames({
                  [styles.selected]: mode !== 'pivot'
                })}
                value="pivot"
              >
                透视驱动
              </RadioButton>
              <RadioButton
                className={classnames({
                  [styles.selected]: mode !== 'chart'
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
        {!currentEditingItem ? null : [(
          <FieldConfigModal
            key="fieldConfigModal"
            queryInfo={queryInfo}
            visible={fieldModalVisible}
            fieldConfig={currentEditingItem.field}
            onSave={this.saveFieldConfig}
            onCancel={this.cancelFieldConfig}
          />
        ), (
          <FormatConfigModal
            key="formatConfigModal"
            visible={formatModalVisible}
            visualType={selectedFormatVisualType}
            formatConfig={currentEditingItem.format}
            onSave={this.saveFormatConfig}
            onCancel={this.cancelFormatConfig}
          />
        )
        ]}
        <Modal
          title="计算字段配置"
          wrapClassName="ant-modal-large"
          visible={computedConfigModalVisible}
          onCancel={this.hideComputedConfigModal}
          closable={false}
          footer={false}
          maskClosable={false}
        >
          <ComputedConfigForm
            queryInfo={queryInfo}
            categories={categories}
            onSave={this.saveComputedConfig}
            onClose={this.hideComputedConfigModal}
            selectedComputed={selectedComputed}
            wrappedComponentRef={this.refHandlers.computedConfigForm}
          />
        </Modal>
      </div>
    )
  }
}

export default OperatingPanel
