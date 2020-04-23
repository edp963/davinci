import React from 'react'
import classnames from 'classnames'
import set from 'lodash/set'

import widgetlibs from '../../config'
import { IDataRequestParams } from 'app/containers/Dashboard/types'
import { IViewBase, IFormedView } from 'containers/View/types'
import { ViewModelVisualTypes, ViewModelTypes } from 'containers/View/constants'
import Dropbox, { DropboxType, DropType, AggregatorType, IDataParamSource, IDataParamConfig, DragType, IDragItem} from './Dropbox'
import { IWidgetProps, IChartStyles, IChartInfo, IPaginationParams, WidgetMode, RenderType, DimetionType } from '../Widget'
import { IFieldConfig, getDefaultFieldConfig, FieldConfigModal } from '../Config/Field'
import { IFieldFormatConfig, getDefaultFieldFormatConfig, FormatConfigModal } from '../Config/Format'
import { IFieldSortConfig, FieldSortTypes, SortConfigModal } from '../Config/Sort'
import ColorSettingForm from './ColorSettingForm'
import ActOnSettingForm from './ActOnSettingForm'
import FilterSettingForm from './FilterSettingForm'
import VariableConfigForm from '../VariableConfigForm'
import ControlConfig from './ControlConfig'
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
import DoubleYAxisSection, { IDoubleYAxisConfig } from './ConfigSections/DoubleYAxisSection'
import AreaSelectSection, { IAreaSelectConfig } from './ConfigSections/AreaSelectSection'
import ScorecardSection, { IScorecardConfig } from './ConfigSections/ScorecardSection'
import IframeSection, { IframeConfig } from './ConfigSections/IframeSection'
import TableSection from './ConfigSections/TableSection'
import GaugeSection from './ConfigSections/GaugeSection'
import { ITableConfig } from '../Config/Table'
import BarSection from './ConfigSections/BarSection'
import RadarSection from './ConfigSections/RadarSection'
import { encodeMetricName, decodeMetricName, getPivot, getTable, getPivotModeSelectedCharts, checkChartEnable } from '../util'
import { PIVOT_DEFAULT_SCATTER_SIZE_TIMES } from 'app/globalConstants'
import PivotTypes from '../../config/pivot/PivotTypes'
import { uuid } from 'utils/util'

import { RadioChangeEvent } from 'antd/lib/radio'
import { Row, Col, Icon, Menu, Radio, InputNumber, Dropdown, Modal, Popconfirm, Checkbox, notification, Tooltip, Select } from 'antd'
import { IDistinctValueReqeustParams } from 'app/components/Filters/types'
import { WorkbenchQueryMode } from './types'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { SelectProps } from 'antd/lib/select'
const MenuItem = Menu.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const confirm = Modal.confirm
const Option = Select.Option
const styles = require('./Workbench.less')
const defaultTheme = require('assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const utilStyles = require('assets/less/util.less')

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
  views: IViewBase[]
  originalWidgetProps: IWidgetProps
  selectedView: IFormedView
  distinctColumnValues: any[]
  columnValueLoading: boolean
  controls: any[]
  cache: boolean
  autoLoadData: boolean
  expired: number
  queryMode: WorkbenchQueryMode
  multiDrag: boolean
  computed: any[]
  originalComputed: any[]
  onViewSelect: (viewId: number) => void
  onSetControls: (controls: any[]) => void
  onCacheChange: (e: RadioChangeEvent) => void
  onChangeAutoLoadData: (e: RadioChangeEvent) => void
  onExpiredChange: (expired: number) => void
  onSetComputed: (computesField: any[]) => void
  onDeleteComputed: (computesField: any[]) => void
  onSetWidgetProps: (widgetProps: IWidgetProps) => void
  onLoadData: (
    viewId: number,
    requestParams: IDataRequestParams,
    resolve: (data) => void,
    reject: (error) => void
  ) => void
  onLoadDistinctValue: (viewId: number, params: Partial<IDistinctValueReqeustParams>) => void
}

interface IOperatingPanelStates {
  dragged: IDataParamSource
  showColsAndRows: boolean
  mode: WidgetMode
  currentWidgetlibs: IChartInfo[]
  chartModeSelectedChart: IChartInfo
  // selectedTab: 'data' | 'style' | 'variable' | 'cache'
  selectedTab: 'data' | 'style' | 'setting'
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
  sortModalVisible: boolean

  colorModalVisible: boolean
  actOnModalVisible: boolean
  actOnModalList: IDataParamSource[]
  filterModalVisible: boolean
  controlConfigVisible: boolean

  categoryDragItems: IDragItem[],
  valueDragItems: IDragItem[],

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
      sortModalVisible: false,
      colorModalVisible: false,
      actOnModalVisible: false,
      actOnModalList: null,
      filterModalVisible: false,
      controlConfigVisible: false,
      categoryDragItems: [],
      valueDragItems: [],
      computedConfigModalVisible: false,
      selectedComputed: null
    }
  }

  private lastRequestParamString: string = ''

  private tabKeys = [
    { key: 'data', title: '数据' },
    { key: 'style', title: '样式' },
    { key: 'setting', title: '配置' }
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
    if (selectedView && selectedView !== this.props.selectedView) {
      const model = selectedView.model
      const categoryDragItems = []
      const valueDragItems = []

      Object.entries(model).forEach(([key, m]) => {
        if (m.modelType === 'category') {
          categoryDragItems.push({
            name: key,
            type: 'category',
            visualType: m.visualType,
            checked: false
          })
        } else {
          valueDragItems.push({
            name: key,
            type: 'value',
            visualType: m.visualType,
            checked: false
          })
        }
      })

      this.setState({
        categoryDragItems,
        valueDragItems
      })
    }

    if ((originalWidgetProps && selectedView) &&
      (originalWidgetProps !== this.props.originalWidgetProps || selectedView !== this.props.selectedView)) {
      const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, chartStyles, mode, selectedChart } = originalWidgetProps
      const { dataParams } = this.state
      const model = selectedView.model
      const currentWidgetlibs = widgetlibs[mode || 'pivot'] // FIXME 兼容 0.3.0-beta.1 之前版本
      if (mode === 'pivot') {
        model['指标名称']   = ({sqlType: 'VARCHAR', visualType: ViewModelVisualTypes.String, modelType: ViewModelTypes.Category})
      }
      cols.forEach((c) => {
        const modelColumn = model[c.name]
        if (modelColumn) {
          dataParams.cols.items = dataParams.cols.items.concat({
            ...c,
            from: 'cols',
            type: 'category' as DragType,
            visualType: c.name === '指标名称' ? ViewModelVisualTypes.String : modelColumn.visualType
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
            visualType: r.name === '指标名称' ? ViewModelVisualTypes.String :  modelColumn.visualType
          })
        }
      })

      if (secondaryMetrics) {
        dataParams.metrics = {
          title: '左轴指标',
          type: 'value',
          items: []
        }
      }
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

      if (secondaryMetrics) {
        dataParams.secondaryMetrics = {
          title: '右轴指标',
          type: 'value',
          items: []
        }
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

  public componentWillUnmount () {
    notification.destroy()
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

  private getDragItemIconClass = (type: ViewModelVisualTypes) => {
    switch (type) {
      case ViewModelVisualTypes.Number: return 'icon-values'
      case ViewModelVisualTypes.Date: return `icon-calendar ${styles.iconDate}`
      case ViewModelVisualTypes.GeoCountry:
      case ViewModelVisualTypes.GeoProvince:
      case ViewModelVisualTypes.GeoCity: return 'icon-map'
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

    if (mode === 'pivot'
        && cachedItem.name === '指标名称'
        && !['cols', 'rows'].includes(name)) {
      resolve(false)
      this.setState({ dragged: null })
      return
    }

    switch (name) {
      case 'filters':
        if (cachedItem.visualType !== 'number' && cachedItem.visualType !== 'date') {
          onLoadDistinctValue(selectedView.id, { columns: [cachedItem.name] })
        }
        this.setState({
          modalCachedData: cachedItem,
          modalCallback: resolve,
          modalDataFrom: 'filters',
          filterModalVisible: true
        })
        break
      case 'color':
        onLoadDistinctValue(selectedView.id, { columns: [cachedItem.name] })
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
    const { multiDrag } = this.props
    const {
      dragged: stateDragged,
      dataParams,
      styleParams,
      modalCachedData,
      categoryDragItems,
      valueDragItems
    } = this.state

    const dragged = stateDragged || modalCachedData
    const from = dragged.from && dragged.from !== name && dataParams[dragged.from]
    const destination = dataParams[name]
    const { items } = destination

    const multiDragCategoryDropboxNames = ['cols', 'rows']
    const multiDragValueDropboxNames = ['metrics', 'secondaryMetrics']

    if (multiDrag
        && dropType === 'outside'
        && multiDragCategoryDropboxNames.concat(multiDragValueDropboxNames).includes(name)) {
      let selectedItems = []
      if (multiDragCategoryDropboxNames.includes(name)) {
        selectedItems = selectedItems.concat(
          categoryDragItems
            .filter((item) => item.checked && item.name !== dragged.name && !items.find((i) => i.name === item.name))
            .map(({ checked, ...rest }) => ({...rest}))
            .concat(dragged)
        )
        this.setState({
          categoryDragItems: categoryDragItems.map((item) => ({ ...item, checked: false }))
        })
      } else if (multiDragValueDropboxNames.includes(name)) {
        selectedItems = selectedItems.concat(
          valueDragItems
            .filter((item) => item.checked && item.name !== decodeMetricName(dragged.name))
            .map(({ checked, ...rest }): IDataParamSource => ({...rest, name: encodeMetricName(rest.name), agg: 'sum', chart: getPivot()}))
            .concat({...dragged, chart: getPivot()})
          )
        this.setState({
          valueDragItems: valueDragItems.map((item) => ({ ...item, checked: false }))
        })
      }
      destination.items = [...items.slice(0, dropIndex), ...selectedItems, ...items.slice(dropIndex)]
    } else {
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
        if (name === 'secondaryMetrics') {
          combinedItem = {...dragged, chart: dataParams.secondaryMetrics.items.length ? dataParams.secondaryMetrics.items[0].chart : getPivot()}
        }
        destination.items = [...items.slice(0, dropIndex), combinedItem, ...items.slice(dropIndex)]
      } else {
        destination.items = [...changedItems]
      }
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

  private getDropboxItemSortDirection = (from: string) => (item: IDataParamSource, sortType: FieldSortTypes) => {
    const { dataParams, styleParams } = this.state
    const prop = dataParams[from]
    if (sortType !== FieldSortTypes.Custom) {
      item.sort = { sortType }
      prop.items = [...prop.items]
      this.setWidgetProps(dataParams, styleParams)
    } else {
      const { selectedView, onLoadDistinctValue } = this.props
      onLoadDistinctValue(selectedView.id, { columns: [item.name] })
      this.setState({
        currentEditingCommonParamKey: from,
        currentEditingItem: item,
        sortModalVisible: true
      })
    }
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

  private saveSortConfig = (sortConfig: IFieldSortConfig) => {
    const {
      currentEditingCommonParamKey,
      currentEditingItem,
      dataParams,
      styleParams
    } = this.state
    const item = dataParams[currentEditingCommonParamKey].items.find((i) => i.name === currentEditingItem.name)
    item.sort = sortConfig
    this.setWidgetProps(dataParams, styleParams)
    this.setState({
      sortModalVisible: false
    })
  }

  private cancelSortConfig = () => {
    this.setState({ sortModalVisible: false })
  }

  private dropboxItemChangeColorConfig = (item: IDataParamSource) => {
    const { selectedView, onLoadDistinctValue } = this.props
    const { dataParams, styleParams } = this.state
    onLoadDistinctValue(selectedView.id, { columns: [item.name] })
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
      onLoadDistinctValue(selectedView.id, { columns: [item.name] })
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
    const { cols, rows, metrics, secondaryMetrics } = dataParams
    const dcount = cols.items.length + rows.items.length
    const mcount = secondaryMetrics ? secondaryMetrics.items.length + metrics.items.length : metrics.items.length
    return [dcount, mcount]
  }

  public flipPage = (pageNo: number, pageSize: number, orders) => {
    const { dataParams, styleParams, pagination } = this.state
    this.setWidgetProps(dataParams, styleParams, {
      renderType: 'rerender',
      updatedPagination: {
        ...pagination,
        pageNo,
        pageSize
      },
      queryMode: WorkbenchQueryMode.Immediately,
      orders
    })
  }

  private forceSetWidgetProps = () => {
    const { dataParams, styleParams, pagination } = this.state
    this.setWidgetProps(dataParams, styleParams, {
      renderType: 'rerender',
      updatedPagination: pagination,
      queryMode: WorkbenchQueryMode.Immediately
    })
  }

  private setWidgetProps = (
    dataParams: IDataParams,
    styleParams: IChartStyles,
    options?: {
      renderType?: RenderType,
      updatedPagination?: IPaginationParams,
      queryMode?: WorkbenchQueryMode,
      orders?
    }
  ) => {
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, yAxis } = dataParams
    const { selectedView, onLoadData, onSetWidgetProps } = this.props
    const { mode, chartModeSelectedChart, pagination } = this.state
    let renderType
    let updatedPagination
    let queryMode = this.props.queryMode

    if (options) {
      renderType = options.renderType
      updatedPagination = options.updatedPagination
      queryMode = WorkbenchQueryMode[options.queryMode] ? options.queryMode : queryMode
    }

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
        let column = item.name
        if (item.type === 'value') {
          column = decodeMetricName(item.name)
          if (!styleParams.table || !styleParams.table.withNoAggregators) {
            column = `${item.agg}(${column})`
          }
        }
        if (item.sort && [FieldSortTypes.Asc, FieldSortTypes.Desc].includes(item.sort.sortType)) {
          orders.push({
            column,
            direction: item.sort.sortType
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

    const metricsLength = secondaryMetrics
      ? metrics.items.length + secondaryMetrics.items.length
      : metrics.items.length
    if (!checkChartEnable(dimetionsCount, metricsLength, selectedCharts)) {
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

    const requestParamsFilters = filters.items.reduce((a, b) => {
      return a.concat(b.config.sqlModel)
    }, [])

    const requestParams = {
      groups,
      aggregators,
     // filters: filters.items.map((i) => [].concat(i.config.sql)),
      filters: requestParamsFilters,
      orders,
      pageNo: updatedPagination.pageNo,
      pageSize: updatedPagination.pageSize,
      nativeQuery: noAggregators,
      cache: false,
      expired: 0,
      flush: false
    }

    if (options) {
      if (options.orders) {
        requestParams.orders = requestParams.orders.concat(options.orders)
      }
    }

    const requestParamString = JSON.stringify(requestParams)
    const needRequest = (groups.length > 0 || aggregators.length > 0)
                       && selectedView
                       && requestParamString !== this.lastRequestParamString
                       && queryMode === WorkbenchQueryMode.Immediately

    if (needRequest) {
      this.lastRequestParamString = requestParamString
      onLoadData(selectedView.id, requestParams, (result) => {
        const { resultList: data, pageNo, pageSize, totalCount } = result
        updatedPagination = !updatedPagination.withPaging ? updatedPagination : {
          ...updatedPagination,
          pageNo,
          pageSize,
          totalCount
        }
        onSetWidgetProps({
          cols: cols.items.map((item) => ({
            ...item,
            field: item.field || getDefaultFieldConfig(),
            format: item.format || getDefaultFieldFormatConfig(),
            sort: item.sort
          })),
          rows: rows.items.map((item) => ({
            ...item,
            field: item.field || getDefaultFieldConfig(),
            format: item.format || getDefaultFieldFormatConfig(),
            sort: item.sort
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
          model: selectedView.model
        })
        this.setState({
          chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
          pagination: updatedPagination,
          dataParams: mergedDataParams,
          styleParams: mergedStyleParams
        })
      }, (error) => {
        notification.destroy()
        notification.error({
          message: '执行失败',
          description: (
            <Tooltip
              placement="bottom"
              trigger="click"
              title={error.msg}
              overlayClassName={styles.errorMessage}
            >
              <a>点击查看错误信息</a>
            </Tooltip>
          ),
          duration: null
        })
      })
    } else {
      onSetWidgetProps({
        data: null,
        cols: cols.items.map((item) => ({
          ...item,
          field: item.field || getDefaultFieldConfig(),
          format: item.format || getDefaultFieldFormatConfig(),
          sort: item.sort
        })),
        rows: rows.items.map((item) => ({
          ...item,
          field: item.field || getDefaultFieldConfig(),
          format: item.format || getDefaultFieldFormatConfig(),
          sort: item.sort
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
        model: selectedView ? selectedView.model : {}
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

  private viewSelect = (viewId: number) => {
    const { mode, dataParams } = this.state
    const hasItems = Object.values(dataParams)
      .filter((param) => !!param.items.length)
    if (hasItems.length) {
      confirm({
        title: '切换 View 会清空所有配置项，是否继续？',
        onOk: () => {
          this.resetWorkbench(mode)
          this.props.onViewSelect(viewId)
        }
      })
    } else {
      this.props.onViewSelect(viewId)
    }
  }

  private filterView: SelectProps['filterOption'] = (input, option) =>
    (option.props.children as string).toLowerCase().includes(input.toLowerCase())

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
    console.log('dropboxValueChange')
    this.setWidgetProps(dataParams, styleParams, { renderType: 'refresh' })
  }

  private styleChange = (name) => (prop, value, propPath?: string[]) => {
    const { dataParams, styleParams } = this.state
    if (!propPath || !propPath.length) {
      styleParams[name][prop] = value
    } else {
      propPath.reduce((subStyle, currentPathName, idx) => {
        const childStyle = subStyle[currentPathName]
        if (idx === propPath.length - 1) {
          childStyle[prop] = value
        }
        return childStyle
      }, styleParams[name])
    }
    let renderType: RenderType = 'clear'
    switch (prop) {
      case 'layerType':
        renderType = 'rerender'
        break
      case 'smooth':
        renderType = 'clear'
        break
    }
    this.setWidgetProps(dataParams, styleParams, { renderType })
    // const { layerType } = styleParams.spec
    // chartModeSelectedChart.style.spec.layerType = layerType
  }

  // @FIXME refactor function styleChange2
  private styleChange2 = (value: string | number, propPath: string[]) => {
    const { dataParams, styleParams } = this.state
    set(styleParams, propPath, value)
    let renderType: RenderType = 'clear'
    if (propPath.includes('layerType')) {
      renderType = 'rerender'
    } else if (propPath.includes('smooth')) {
      renderType = 'clear'
    }
    this.setWidgetProps(dataParams, styleParams, { renderType })
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

  private showControlConfig = () => {
    this.setState({
      controlConfigVisible: true
    })
  }

  private closeControlConfig = () => {
    this.setState({
      controlConfigVisible: false
    })
  }

  private saveControls = (controls) => {
    this.props.onSetControls(controls)
    this.closeControlConfig()
  }

  private checkAllDragItem = (type: DragType) => (e: CheckboxChangeEvent) => {
    const { categoryDragItems, valueDragItems } = this.state
    const checked = e.target.checked
    if (type === 'category') {
      this.setState({
        categoryDragItems: categoryDragItems.map((item) => ({ ...item, checked }))
      })
    } else {
      this.setState({
        valueDragItems: valueDragItems.map((item) => ({ ...item, checked }))
      })
    }
  }

  private checkDragItem = (type: DragType, name: string) => (e: CheckboxChangeEvent) => {
    const { categoryDragItems, valueDragItems } = this.state
    const checked = e.target.checked
    if (type === 'category') {
      this.setState({
        categoryDragItems: categoryDragItems.map((item) => {
          if (item.name === name) {
            return { ...item, checked }
          } else {
            return item
          }
        })
      })
    } else {
      this.setState({
        valueDragItems: valueDragItems.map((item) => {
          if (item.name === name) {
            return { ...item, checked }
          } else {
            return item
          }
        })
      })
    }
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
    const {onSetComputed} = this.props
    if (config) {
      onSetComputed(config)
    }
  }

  private onShowEditComputed = (tag) => () => {
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
      autoLoadData,
      expired,
      queryMode,
      multiDrag,
      computed,
      onCacheChange,
      onChangeAutoLoadData,
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
      sortModalVisible,
      currentEditingItem,
      colorModalVisible,
      actOnModalVisible,
      actOnModalList,
      filterModalVisible,
      controlConfigVisible,
      valueDragItems,
      computedConfigModalVisible,
      selectedComputed
    } = this.state

    const widgetPropsModel = selectedView && selectedView.model ? selectedView.model : {}

    const { metrics } = dataParams
    const [dimetionsCount, metricsCount] = this.getDimetionsAndMetricsCount()
    const {
      spec, xAxis, yAxis, axis, splitLine, pivot: pivotConfig, label, legend,
      visualMap, toolbox, areaSelect, scorecard, gauge, iframe, table, bar, radar, doubleYAxis } = styleParams

    let categoryDragItems = this.state.categoryDragItems
    if (mode === 'pivot'
      && valueDragItems.length
      && dataParams.metrics.items.every((item) => item.chart.id === getPivot().id)) {
      categoryDragItems = categoryDragItems.concat({
        name: '指标名称',
        type: 'category',
        visualType: ViewModelVisualTypes.String,
        checked: false
      })
    }

    const coustomFieldSelectMenu = (
      <Menu onClick={this.coustomFieldSelect}>
        <MenuItem key="computed">计算字段</MenuItem>
      </Menu>
    )

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

    let queryInfo: string[] = []
    if (selectedView) {
      queryInfo = selectedView.variable.map((v) => v.name)
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
              config={spec}
              onChange={this.styleChange2}
              isLegendSection={mapLegendLayerType}
            />}
            {bar && <BarSection
              onChange={this.styleChange('bar')}
              config={bar}
              dataParams={dataParams}
            />}
            {radar && <RadarSection config={radar} onChange={this.styleChange2} />}
            { mapLabelLayerType
                ? label && <LabelSection
                  title="标签"
                  config={label}
                  onChange={this.styleChange('label')}
                  name={chartModeSelectedChart.name}
                />
                : null
            }
            { mapLegendLayerType
                ? legend && <LegendSection
                  title="图例"
                  config={legend}
                  onChange={this.styleChange('legend')}
                />
                : null
            }
            { mapLegendLayerType
                ? null
                : visualMap && <VisualMapSection
                  title="视觉映射"
                  config={visualMap}
                  onChange={this.styleChange('visualMap')}
                />
            }
            {toolbox && <ToolboxSection
              title="工具"
              config={toolbox}
              onChange={this.styleChange('toolbox')}
            />}
            {doubleYAxis && <DoubleYAxisSection
              title="双Y轴"
              config={doubleYAxis}
              onChange={this.styleChange('doubleYAxis')}
            />}
            {xAxis && <AxisSection
              title="X轴"
              config={xAxis}
              onChange={this.styleChange('xAxis')}
            />}
            {yAxis && <AxisSection
              title="Y轴"
              config={yAxis}
              onChange={this.styleChange('yAxis')}
            />}
            {axis && <AxisSection
              title="轴"
              config={axis}
              onChange={this.styleChange('axis')}
            />}
            {splitLine && <SplitLineSection
              title="分隔线"
              config={splitLine}
              onChange={this.styleChange('splitLine')}
            />}
            {areaSelect && <AreaSelectSection
              title="坐标轴框选"
              config={areaSelect}
              onChange={this.styleChange('areaSelect')}
            />}
            {scorecard && <ScorecardSection
              title="翻牌器"
              config={scorecard}
              onChange={this.styleChange('scorecard')}
            />}
            {gauge && <GaugeSection
              title="仪表盘"
              config={gauge}
              onChange={this.styleChange('gauge')}
            />}
            {iframe && <IframeSection
              title="内嵌网页"
              config={iframe}
              onChange={this.styleChange('iframe')}
            />}
            {table && <TableSection
              dataParams={dataParams}
              config={table}
              onChange={this.styleChange('table')}
            />}
            {pivotConfig && <PivotSection
              title="透视表"
              config={pivotConfig}
              onChange={this.styleChange('pivot')}
            />}
          </div>
        )
        break
      case 'setting':
        tabPane = (
          <div className={styles.paramsPane}>
            <div className={styles.paneBlock}>
              <h4>
                <span>控制器</span>
                <span
                  className={styles.addVariable}
                  onClick={this.showControlConfig}
                >
                  <Icon type="edit" /> 点击配置
                </span>
              </h4>
            </div>
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
            <div className={styles.paneBlock}>
              <h4>自动加载数据</h4>
              <div className={styles.blockBody}>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                  <Col span={24}>
                    <RadioGroup size="small" value={autoLoadData} onChange={onChangeAutoLoadData}>
                      <RadioButton value={true}>是</RadioButton>
                      <RadioButton value={false}>否</RadioButton>
                    </RadioGroup>
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

    // combineComputedFields.forEach((compute) => {
    //   if (compute.visualType === 'number') {
    //     values.push(compute)
    //   } else if (compute.visualType === 'string') {
    //     categories.push(compute)
    //   }
    // })

    return (
      <div className={styles.operatingPanel}>
        <div className={styles.model}>
          <div className={styles.viewSelect}>
            <Select
              size="small"
              placeholder="选择一个View"
              showSearch
              dropdownMatchSelectWidth={false}
              value={selectedView && selectedView.id}
              onChange={this.viewSelect}
              filterOption={this.filterView}
            >
              {(views || []).map(({ id, name }) => <Option key={id} value={id}>{name}</Option>)}
            </Select>
            {/* <Dropdown overlay={coustomFieldSelectMenu} trigger={['click']} placement="bottomRight">
              <Icon type="plus" />
            </Dropdown> */}
          </div>
          <div className={styles.columnContainer}>
            <div className={styles.title}>
              <h4>分类型</h4>
              {
                multiDrag && (
                  <Checkbox
                    checked={categoryDragItems.length && categoryDragItems.every((item) => item.checked)}
                    onChange={this.checkAllDragItem('category')}
                  />
                )
              }
            </div>
            <ul className={`${styles.columnList} ${styles.categories}`}>
              {categoryDragItems.map((item) => {
                const { name, title, visualType, checked, ...rest } = item
                const data = { name, title, visualType, ...rest }
                return (
                  <li
                    className={`${title === 'computedField' ? styles.computed : ''}`}
                    key={name}
                    onDragStart={this.dragStart(data)}
                    onDragEnd={this.dragEnd}
                    draggable
                  >
                    <i className={`iconfont ${this.getDragItemIconClass(visualType)}`} />
                    <p>{name}</p>
                    {title === 'computedField' ? this.bootstrapMorePanel(data) : null}
                    {
                      multiDrag && (
                        <Checkbox
                          checked={checked}
                          onChange={this.checkDragItem('category', name)}
                        />
                      )
                    }
                  </li>
                )
              })}
            </ul>
          </div>
          <div className={styles.columnContainer}>
            <div className={styles.title}>
              <h4>数值型</h4>
              {
                multiDrag && (
                  <Checkbox
                    checked={valueDragItems.length && valueDragItems.every((item) => item.checked)}
                    onChange={this.checkAllDragItem('value')}
                  />
                )
              }
            </div>
            <ul className={`${styles.columnList} ${styles.values}`}>
              {valueDragItems.map((item) => {
                const { name, title, visualType, checked, ...rest } = item
                const data = { name, title, visualType, ...rest }
                return (
                  <li
                    className={`${title === 'computedField' ? styles.computed : ''}`}
                    key={name}
                    onDragStart={this.dragStart({...data, name: encodeMetricName(name), agg: 'sum'})}
                    onDragEnd={this.dragEnd}
                    draggable
                  >
                    <i className={`iconfont ${this.getDragItemIconClass(visualType)}`} />
                    <p>{name}</p>
                    {title === 'computedField' ? this.bootstrapMorePanel(data) : null}
                    {
                      multiDrag && (
                        <Checkbox
                          checked={checked}
                          onChange={this.checkDragItem('value', name)}
                        />
                      )
                    }
                  </li>
                )
              })}
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
          {
            queryMode === WorkbenchQueryMode.Manually && (
              <div className={styles.manualQuery} onClick={this.forceSetWidgetProps}>
                <Icon type="caret-right" />查询
              </div>
            )
          }
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
            model={widgetPropsModel}
            list={distinctColumnValues}
            config={filterSettingConfig}
            onSave={this.confirmFilterModal}
            onCancel={this.cancelFilterModal}
            ref={(f) => this.filterSettingForm = f}
          />
        </Modal>
        <ControlConfig
          currentControls={controls}
          view={selectedView}
          visible={controlConfigVisible}
          onSave={this.saveControls}
          onCancel={this.closeControlConfig}
        />
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
            visualType={currentEditingItem.visualType}
            formatConfig={currentEditingItem.format}
            onSave={this.saveFormatConfig}
            onCancel={this.cancelFormatConfig}
          />
        ), (
          <SortConfigModal
            key="sortConfigModal"
            visible={sortModalVisible}
            config={currentEditingItem.sort}
            list={distinctColumnValues}
            onSave={this.saveSortConfig}
            onCancel={this.cancelSortConfig}
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
            categories={categoryDragItems}
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
