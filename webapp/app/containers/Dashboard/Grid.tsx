/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import { findDOMNode } from 'react-dom'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducerWidget from '../Widget/reducer'
import sagaWidget from '../Widget/sagas'
import reducerBizlogic from '../Bizlogic/reducer'
import sagaBizlogic from '../Bizlogic/sagas'

import Container from '../../components/Container'
import DashboardToolbar from './components/DashboardToolbar'
import DashboardItemForm from './components/DashboardItemForm'
import DashboardItem from './components/DashboardItem'
import DashboardLinkageConfig from './components/DashboardLinkageConfig'

import { IFilterChangeParam } from 'components/Filters'
import DashboardFilterPanel from './components/DashboardFilterPanel'
import DashboardFilterConfig from './components/DashboardFilterConfig'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'

import { Responsive, WidthProvider } from 'libs/react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Icon = require('antd/lib/icon')
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import FullScreenPanel from './components/fullScreenPanel/FullScreenPanel'
import { decodeMetricName } from '../Widget/components/util'
import { hideNavigator } from '../App/actions'
import { loadProjectDetail } from '../Projects/actions'
import {
  loadDashboardDetail,
  addDashboardItem,
  editCurrentDashboard,
  editDashboardItem,
  editDashboardItems,
  deleteDashboardItem,
  clearCurrentDashboard,
  loadWidgetCsv,
  renderDashboardItem,
  resizeDashboardItem,
  resizeAllDashboardItem,
  loadDashboardShareLink,
  loadWidgetShareLink,
  drillDashboardItem,
  deleteDrillHistory
} from './actions'
import {
  makeSelectDashboards,
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentItemsInfo,
  makeSelectCurrentDashboardShareInfo,
  makeSelectCurrentDashboardSecretInfo,
  makeSelectCurrentDashboardShareInfoLoading,
  makeSelectCurrentDashboardCascadeSources,
  makeSelectCurrentLinkages
} from './selectors'
import {
  loadDataFromItem,
  loadCascadeSource,
  loadBizdataSchema,
  loadDistinctValue
} from '../Bizlogic/actions'
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { makeSelectCurrentProject } from '../Projects/selectors'

import {
  ECHARTS_RENDERER,
  SQL_NUMBER_TYPES,
  DEFAULT_SPLITER,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ITEM_MARGIN,
  GRID_ROW_HEIGHT,
  KEY_COLUMN
} from '../../globalConstants'
import { InjectedRouter } from 'react-router/lib/Router'
import { IWidgetProps, RenderType } from '../Widget/components/Widget'
import { IProject } from '../Projects'
import { ICurrentDashboard } from './'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Dashboard.less')

const ResponsiveReactGridLayout = WidthProvider(Responsive)

interface IGridProps {
  dashboards: any[]
  widgets: any[]
  bizlogics: any[]
  currentProject: IProject
  router: InjectedRouter
  params: any
  currentDashboard: ICurrentDashboard,
  currentDashboardLoading: boolean
  currentDashboardShareInfo: string
  currentDashboardSecretInfo: string
  currentDashboardShareInfoLoading: boolean
  currentItems: any[]
  currentItemsInfo: {
    [key: string]: {
      datasource: {
        pageNo: number
        pageSize: number
        resultList: any[]
        totalCount: number
      }
      loading: boolean
      queryParams: {
        filters: string
        linkageFilters: string
        globalFilters: string
        params: Array<{name: string, value: string}>
        linkageParams: Array<{name: string, value: string}>
        globalParams: Array<{name: string, value: string}>
        drillHistory?: Array<{filter?: any, type?: string, groups?: string[], name: string}>
      }
      shareInfo: string
      secretInfo: string
      shareInfoLoading: boolean
      downloadCsvLoading: boolean
      interactId: string
      rendered: boolean
      renderType: RenderType
    }
  }
  currentDashboardCascadeSources: {
    [filterKey: string]: {
      [key: string]: Array<number | string>
    }
  }
  currentLinkages: any[]
  onLoadDashboardDetail: (projectId: number, portalId: number, dashboardId: number) => any
  onAddDashboardItem: (portalId: number, item: [IDashboardItem], resolve: (item: IDashboardItem) => void) => any
  onEditCurrentDashboard: (dashboard: object, resolve: () => void) => void
  onEditDashboardItem: (item: IDashboardItem, resolve: () => void) => void
  onEditDashboardItems: (item: IDashboardItem[]) => void
  onDeleteDashboardItem: (id: number, resolve?: () => void) => void
  onLoadDataFromItem: (
    renderType: RenderType,
    dashboardItemId: number,
    viewId: number,
    params: {
      groups: string[]
      aggregators: Array<{column: string, func: string}>
      filters: string[]
      linkageFilters: string[]
      globalFilters: string[]
      params: Array<{name: string, value: string}>
      linkageParams: Array<{name: string, value: string}>
      globalParams: Array<{name: string, value: string}>
      orders: Array<{column: string, direction: string}>
      cache: boolean
      expired: number
    }
  ) => void
  onLoadWidgetCsv: (
    itemId: number,
    widgetId: number,
    params: {
      groups: string[]
      aggregators: Array<{column: string, func: string}>
      filters: string[]
      linkageFilters: string[]
      globalFilters: string[]
      params: Array<{name: string, value: string}>
      linkageParams: Array<{name: string, value: string}>
      globalParams: Array<{name: string, value: string}>
      orders: Array<{column: string, direction: string}>
      cache: boolean
      expired: number
    },
    token: string
  ) => void
  onClearCurrentDashboard: () => any
  onLoadCascadeSource: (controlId: number, viewId: number, column: string, parents: Array<{ column: string, value: string }>) => void
  onLoadBizdataSchema: () => any
  onLoadDistinctValue: (viewId: number, fieldName: string, resolve: (data) => void) => void
  onRenderDashboardItem: (itemId: number) => void
  onResizeDashboardItem: (itemId: number) => void
  onResizeAllDashboardItem: () => void
  onLoadDashboardShareLink: (id: number, authName: string) => void
  onLoadWidgetShareLink: (id: number, itemId: number, authName: string, resolve?: () => void) => void
  onDrillDashboardItem: (itemId: number, drillHistory: any) => void
  onDeleteDrillHistory: (itemId: number, index: number) => void
}

interface IGridStates {
  mounted: boolean
  layoutInitialized: boolean,
  allowFullScreen: boolean
  currentDataInFullScreen: object
  dashboardItemFormType: string
  dashboardItemFormVisible: boolean
  dashboardItemFormStep: number
  modalLoading: boolean
  selectedWidget: any[]
  polling: boolean
  linkageConfigVisible: boolean
  interactingStatus: { [itemId: number]: boolean }
  globalFilterConfigVisible: boolean
  dashboardSharePanelAuthorized: boolean
  nextMenuTitle: string
}

interface IDashboardItemForm extends AntdFormType {
  onReset: () => void
}

interface IDashboardItem {
  id?: number
  x?: number
  y?: number
  width?: number
  height?: number
  widgetId?: number
  dashboardId?: number
  polling?: boolean
  frequency?: number
}

interface IDashboardItemFilters extends AntdFormType {
  resetTree: () => void
}

export class Grid extends React.Component<IGridProps, IGridStates> {
  constructor (props) {
    super(props)

    this.state = {
      mounted: false,
      layoutInitialized: false,

      allowFullScreen: false,
      currentDataInFullScreen: {},

      dashboardItemFormType: '',
      dashboardItemFormVisible: false,
      dashboardItemFormStep: 0,
      modalLoading: false,
      selectedWidget: [],
      polling: false,

      linkageConfigVisible: false,
      interactingStatus: {},
      globalFilterConfigVisible: false,

      dashboardSharePanelAuthorized: false,

      nextMenuTitle: ''
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number
  private dashboardItemForm: IDashboardItemForm = null
  private dashboardItemFilters: IDashboardItemFilters = null
  private refHandles = {
    dashboardItemForm: (f) => { this.dashboardItemForm = f },
    dashboardItemFilters: (f) => { this.dashboardItemFilters = f }
  }

  private containerBody: any = null
  private containerBodyScrollThrottle: boolean = false

  public componentWillMount () {
    const {
      onLoadDashboardDetail,
      params
    } = this.props
    const { pid, portalId, dashboardId } = params
    if (dashboardId && Number(dashboardId) !== -1) {
      onLoadDashboardDetail(pid, portalId, Number(dashboardId))
    }
  }

  public componentWillReceiveProps (nextProps: IGridProps) {
    const {
      currentDashboard,
      currentDashboardLoading,
      currentItems,
      currentItemsInfo,
      params
    } = nextProps
    const { onLoadDashboardDetail, onLoadCascadeSource } = this.props
    const { layoutInitialized } = this.state

    if (params.dashboardId !== this.props.params.dashboardId) {
      this.setState({
        nextMenuTitle: ''
      })

      if (params.dashboardId && Number(params.dashboardId) !== -1) {
        onLoadDashboardDetail(params.pid, params.portalId, params.dashboardId)
      }
    }

    if (!currentDashboardLoading) {
      if (currentItems && !layoutInitialized) {
        this.setState({
          mounted: true
        }, () => {
          this.lazyLoad()
          this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
          this.containerBody.addEventListener('scroll', this.lazyLoad, false)
        })
      }
    }
  }

  public componentDidMount () {
    window.addEventListener('resize', this.onWindowResize, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.onWindowResize, false)
    this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
    this.props.onClearCurrentDashboard()
  }

  private lazyLoad = () => {
    if (!this.containerBodyScrollThrottle) {
      requestAnimationFrame(() => {
        const { currentItems, currentItemsInfo, onRenderDashboardItem } = this.props

        const waitingItems = currentItems.filter((item) => !currentItemsInfo[item.id].rendered)

        if (waitingItems.length) {
          waitingItems.forEach((item) => {
            const itemTop = this.calcItemTop(item.y)
            const { offsetHeight, scrollTop } = this.containerBody

            if (itemTop - scrollTop < offsetHeight) {
              onRenderDashboardItem(item.id)
            }
          })
        } else {
          if (this.containerBody) {
            this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
          }
        }
        this.containerBodyScrollThrottle = false
      })
      this.containerBodyScrollThrottle = true
    }
  }

  private calcItemTop = (y: number) => Math.round((GRID_ROW_HEIGHT + GRID_ITEM_MARGIN) * y)

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => {
    this.getData(
      (renderType, itemId, widget, queryParams) => {
        this.props.onLoadDataFromItem(renderType, itemId, widget.viewId, queryParams)
      },
      renderType,
      itemId,
      widgetId,
      queryParams
    )
  }

  private downloadCsv = (itemId: number, widgetId: number, shareInfo: string) => {
    this.getData(
      (renderType, itemId, widget, queryParams) => {
        this.props.onLoadWidgetCsv(itemId, widget.id, queryParams, shareInfo)
      },
      'rerender',
      itemId,
      widgetId
    )
  }

  private getData = (
    callback: (
      renderType: RenderType,
      itemId: number,
      widget: any,
      queryParams?: any
    ) => void,
    renderType: RenderType,
    itemId: number,
    widgetId: number,
    queryParams?: any
  ) => {
    const {
      currentItemsInfo,
      widgets
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryParams = currentItemsInfo[itemId].queryParams
    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams
    let drillStatus

    if (queryParams) {
      linkageFilters = queryParams.linkageFilters !== void 0 ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== void 0 ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
      drillStatus = queryParams.drillStatus || void 0
    } else {
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
    }

    let groups = cols.concat(rows).filter((g) => g !== '指标名称')
    let aggregators =  metrics.map((m) => ({
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
        .map((s) => ({
          column: decodeMetricName(s.name),
          func: s.agg
        })))
    }
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((x) => ({
          column: decodeMetricName(x.name),
          func: x.agg
        })))
    }
    if (tip) {
      aggregators = aggregators.concat(tip.items
        .map((t) => ({
          column: decodeMetricName(t.name),
          func: t.agg
        })))
    }
    // console.log(!!(drillStatus && drillStatus.groups), groups)
    // console.log(!!(drillStatus && drillStatus.filter), filters.map((i) => i.config.sql))
    callback(
      renderType,
      itemId,
      widget,
      {
        groups: drillStatus && drillStatus.groups ? drillStatus.groups : groups,
        aggregators,
        filters: drillStatus && drillStatus.filter ? drillStatus.filter.sqls : filters.map((i) => i.config.sql),
        linkageFilters,
        globalFilters,
        params,
        linkageParams,
        globalParams,
        orders,
        cache,
        expired
      }
    )
  }

  private onDragStop = (layout) => {
    this.onEditDashboardItemsPosition(layout)
  }

  private onResizeStop = (layout, oldItem) => {
    this.onEditDashboardItemsPosition(layout)
    this.props.onResizeDashboardItem(Number(oldItem.i))
  }

  private onEditDashboardItemsPosition = (layout) => {
    const { currentItems, onEditDashboardItems } = this.props
    const changedItems = currentItems.map((item) => {
      const { x, y, w, h } = layout.find((l) => Number(l.i) === item.id)
      return {
        ...item,
        x,
        y,
        width: w,
        height: h
      }
    })
    onEditDashboardItems(changedItems)
  }

  private onWindowResize = () => {
    if (this.resizeSign) {
      clearTimeout(this.resizeSign)
    }
    this.resizeSign = window.setTimeout(() => {
      this.props.onResizeAllDashboardItem()
      clearTimeout(this.resizeSign)
      this.resizeSign = void 0
    }, 500)
  }

  private showAddDashboardItemForm = () => {
    this.setState({
      dashboardItemFormType: 'add',
      dashboardItemFormVisible: true
    })
  }

  private showEditDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)

    this.setState({
      dashboardItemFormType: 'edit',
      dashboardItemFormVisible: true,
      dashboardItemFormStep: 1,
      selectedWidget: [dashboardItem.widgetId],
      polling: dashboardItem.polling
    }, () => {
      this.dashboardItemForm.props.form.setFieldsValue({
        id: dashboardItem.id,
        polling: dashboardItem.polling ? 'true' : 'false',
        frequency: dashboardItem.frequency
      })
    })
  }

  private hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false,
      selectedWidget: []
    })
  }

  private afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidget: [],
      polling: false,
      dashboardItemFormStep: 0
    })
    this.dashboardItemForm.onReset()
    this.dashboardItemForm.props.form.resetFields()
  }

  private widgetSelect = (selectedRowKeys) => {
    this.setState({
      selectedWidget: selectedRowKeys
    })
  }

  private pollingSelect = (val) => {
    this.setState({
      polling: val === 'true'
    })
  }

  private changeDashboardItemFormStep = (sign) => () => {
    this.setState({
      dashboardItemFormStep: sign
    })
  }

  private saveDashboardItem = () => {
    const { params, currentDashboard, currentItems, widgets } = this.props
    const { selectedWidget, dashboardItemFormType } = this.state
    const formdata: any = this.dashboardItemForm.props.form.getFieldsValue()
    const cols = GRID_COLS.lg

    const yArr = [...currentItems.map((item) => item.y + item.height), 0]
    const maxY = Math.max(...yArr)
    const secondMaxY = maxY === 0 ? 0 : Math.max(...yArr.filter((y) => y !== maxY))

    let maxX = 0
    if (maxY) {
      const maxYItems = currentItems.filter((item) => item.y + item.height === maxY)
      maxX = Math.max(...maxYItems.map((item) => item.x + item.width))

      // if (maxX + 6 > cols) {
        // maxX = 0
      // }
    }

    this.setState({ modalLoading: true })

    const newItem = {
      dashboardId: currentDashboard.id,
      polling: formdata.polling !== 'false',
      frequency: formdata.frequency
    }

    if (dashboardItemFormType === 'add') {
      const positionInfo = {
        width: 6,
        height: 6
      }

      const newItemsArr = selectedWidget.map((key, index) => {
        const xAxisTemp = index % 2 !== 0 ? 6 : 0
        const yAxisTemp = index % 2 === 0
          ? secondMaxY + 6 * Math.floor(index / 2)
          : maxY + 6 * Math.floor(index / 2)
        let xAxis
        let yAxis
        if (maxX > 0 && maxX <= 6) {
          xAxis = index % 2 === 0 ? 6 : 0
          yAxis = yAxisTemp
        } else if (maxX === 0) {
          xAxis = xAxisTemp
          yAxis = yAxisTemp
        } else if (maxX > 6) {
          xAxis = xAxisTemp
          yAxis = maxY + 6 * Math.floor(index / 2)
        }
        const item = {
          widgetId: key,
          x: xAxis,
          y: yAxis,
          ...newItem,
          ...positionInfo
        }
        return item
      })

      this.props.onAddDashboardItem(Number(params.portalId), (newItemsArr as any), (dashboardItem: IDashboardItem) => {
        this.hideDashboardItemForm()
      })
    } else {
      const dashboardItem = currentItems.find((item) => item.id === Number(formdata.id))
      const modifiedDashboardItem = {
        ...dashboardItem,
        ...newItem,
        widgetId: selectedWidget[0]
      }

      this.props.onEditDashboardItem(modifiedDashboardItem, () => {
        this.getChartData('rerender', modifiedDashboardItem.id, modifiedDashboardItem.widgetId)
        this.hideDashboardItemForm()
      })
    }
  }

  private deleteItem = (id) => () => {
    this.props.onDeleteDashboardItem(id)
  }

  private navDropdownClick = (e) => {
    const { params } = this.props
    this.props.router.push(`/project/${params.pid}/dashboard/${e.key}`)
  }

  private nextNavDropdownClick = (e) => {
    const {widgets} = this.props
    const itemId = e.item && e.item.props && e.item.props.id
    const widgetId = e.item && e.item.props && e.item.props.widgetId
    const widgetDOM = findDOMNode(this[`dashboardItem${itemId}`])
    if (widgetDOM) {
      const widgetParentDOM = widgetDOM.parentNode as HTMLElement
      const scrollCount = widgetParentDOM.style.transform && widgetParentDOM.style.transform.match(/\d+/g)[1]
      const containerBody = widgetParentDOM.parentNode.parentNode as HTMLElement
      const scrollHeight = parseInt(scrollCount, 10) - GRID_ITEM_MARGIN
      containerBody.scrollTop = scrollHeight
    }
    this.setState({
      nextMenuTitle: widgets.find((widget) => widget.id === widgetId)['name']
    })
  }

  private toggleLinkageConfig = (visible) => () => {
    this.setState({
      linkageConfigVisible: visible
    })
  }

  private saveLinkageConfig = (linkages: any[]) => {
    // todo
    const { currentDashboard, onEditCurrentDashboard } = this.props
    onEditCurrentDashboard({
      ...currentDashboard,
      config: JSON.stringify({
        ...JSON.parse(currentDashboard.config || '{}'),
        linkages
      })
    }, () => {
      this.toggleLinkageConfig(false)()
      this.clearAllInteracts()
    })
  }

  private checkInteract = (itemId: number) => {
    const { currentLinkages } = this.props
    const isInteractiveItem = currentLinkages.some((lts) => {
      const { trigger, linkager, relation } = lts
      const triggerId = +trigger[0]
      return triggerId === itemId
    })

    return isInteractiveItem
  }

  private doInteract = (itemId: number, triggerData) => {
    const {
      currentItems,
      currentItemsInfo,
      currentLinkages,
      widgets
    } = this.props

    const mappingLinkage = getMappingLinkage(itemId, currentLinkages)
    this.interactingLinkagers = processLinkage(itemId, triggerData, mappingLinkage, this.interactingLinkagers)

    Object.keys(mappingLinkage).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      const { filters, params } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', +linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce((arr: any[], f: any[]) => arr.concat(...f), []),
        linkageParams: Object.values(params).reduce((arr: any[], p: any[]) => arr.concat(...p), [])
      })
    })
    this.setState({
      interactingStatus: {
        ...this.state.interactingStatus,
        [itemId]: true
      }
    })
  }

  private clearAllInteracts = () => {
    const { currentItems } = this.props
    Object.keys(this.interactingLinkagers).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      this.getChartData('rerender', +linkagerItemId, item.widgetId, {
        linkageFilters: [],
        linkageParams: []
      })
    })
    this.interactingLinkagers = {} // FIXME need remove interact effect
    this.setState({ interactingStatus: {} })
  }

  private turnOffInteract = (itemId) => {
    const {
      currentLinkages,
      currentItems
    } = this.props

    const refreshItemIds = removeLinkage(itemId, currentLinkages, this.interactingLinkagers)
    refreshItemIds.forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === linkagerItemId)
      const { filters, params } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce((arr: any[], f: any[]) => arr.concat(...f), []),
        linkageParams: Object.values(params).reduce((arr: any[], p: any[]) => arr.concat(...p), [])
      })
    })
    this.setState({
      interactingStatus: {
        ...this.state.interactingStatus,
        [itemId]: false
      }
    })
  }

  private toggleGlobalFilterConfig = (visible) => () => {
    this.setState({
      globalFilterConfigVisible: visible
    })
  }

  private saveFilters = (filterItems) => {
    const {
      currentDashboard,
      onEditCurrentDashboard
    } = this.props

    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: JSON.stringify({
          ...JSON.parse(currentDashboard.config || '{}'),
          filters: filterItems
        }),
        // FIXME
        active: true
      },
      () => {
        this.toggleGlobalFilterConfig(false)()
      }
    )
  }

  private getOptions = (controlId, viewId, column, parents) => {
    this.props.onLoadCascadeSource(controlId, viewId, column, parents)
  }

  private globalFilterChange = (queryParams: IFilterChangeParam) => {
    const { currentItems } = this.props
    Object.entries(queryParams).forEach(([itemId, queryParam]) => {
      const item = currentItems.find((ci) => ci.id === +itemId)
      const { params: globalParams, filters: globalFilters } = queryParam
      this.getChartData('rerender', +itemId, item.widgetId, { globalParams, globalFilters })
    })
  }

  private visibleFullScreen = (currentChartData) => {
    const {allowFullScreen} = this.state
    if (currentChartData) {
      this.setState({
        currentDataInFullScreen: currentChartData
      })
    }
    this.setState({
      allowFullScreen: !allowFullScreen
    })
  }
  private currentWidgetInFullScreen = (id) => {
    const {currentItems, currentItemsInfo, widgets, bizlogics} = this.props
    const item = currentItems.find((ci) => ci.id === id)
    const widget = widgets.find((w) => w.id === item.widgetId)
    const model = JSON.parse(bizlogics.find((b) => b.id === widget.viewId).model)
    const loading = currentItemsInfo[id].loading
    this.setState({
      currentDataInFullScreen: {
        itemId: id,
        widgetId: widget.id,
        widget,
        model,
        loading,
        onGetChartData: this.getChartData
      }
    })
  }
  private changeDashboardSharePanelAuthorizeState = (state) => () => {
    this.setState({
      dashboardSharePanelAuthorized: state
    })
  }

  private getWidgetInfo = (dashboardItemId) => {
    const { currentItems, widgets } = this.props
    const dashboardItem = currentItems.find((ci) => ci.id === dashboardItemId)
    const widget = widgets.find((w) => w.id === dashboardItem.widgetId)
    return {
      name: widget.name
    }
  }

  private toWorkbench = (itemId, widgetId) => {
    const { params } = this.props
    const { pid, portalId, portalName, dashboardId } = params
    const editSign = [pid, portalId, portalName, dashboardId, itemId].join(DEFAULT_SPLITER)
    sessionStorage.setItem('editWidgetFromDashboard', editSign)
    this.props.router.push(`/project/${pid}/widget/${widgetId}`)
  }

  private dataDrill = (e) => {
    const {
      widgets,
      currentItemsInfo,
      onDrillDashboardItem
    } = this.props
    const { itemId, groups, widgetId, sourceDataFilter } = e
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig
    const drillHistory = currentItemsInfo[itemId]['queryParams']['drillHistory']
    let sql = void 0
    let name = void 0
    let filterSource = void 0
    let widgetConfigGroups = cols.concat(rows).filter((g) => g !== '指标名称')
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (color) {
      widgetConfigGroups = widgetConfigGroups.concat(color.items.map((c) => c.name))
    }
    if (label) {
      widgetConfigGroups = widgetConfigGroups.concat(label.items
        .filter((l) => l.type === 'category')
        .map((l) => l.name))
      aggregators = aggregators.concat(label.items
        .filter((l) => l.type === 'value')
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    let currentDrillStatus = void 0
    if ((!drillHistory) || drillHistory.length === 0) {
      if (widgetConfig) {
        const dimetionAxis = widgetConfig.dimetionAxis
        if (dimetionAxis === 'col') {
          const cols = widgetConfig.cols
          name = cols[cols.length - 1]
        } else {
          const rows = widgetConfig.rows
          name = rows[rows.length - 1]
        }
        filterSource = sourceDataFilter.map((source) => {
          if (source && source[name]) {
            return source[name]
          } else {
            return source
          }
        })
        sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
      }
      const sqls = widgetConfig.filters.map((i) => i.config.sql)
      sqls.push(sql)
      const isDrillUp = widgetConfigGroups.some((cg) => cg === groups)
      currentDrillStatus = {
        filter: {
          filterSource,
          name,
          sql,
          sqls,
          visualType: 'string'
        },
        type: isDrillUp ? 'up' : 'down',
        groups: isDrillUp ? widgetConfigGroups.filter((cg) => cg !== groups) : widgetConfigGroups.concat([groups]),
        name: groups
      }
    } else {
      const lastDrillHistory = drillHistory[drillHistory.length - 1]
      name = lastDrillHistory.groups[lastDrillHistory.groups.length - 1]
      filterSource = sourceDataFilter.map((source) => source[name])
      sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
      const sqls = lastDrillHistory.filter.sqls.concat(sql)
      const isDrillUp = lastDrillHistory.groups.some((cg) => cg === groups)
      currentDrillStatus = {
        filter: {
          filterSource,
          name,
          sql,
          sqls,
          visualType: 'string'
        },
        type: isDrillUp ? 'up' : 'down',
        groups: isDrillUp ? lastDrillHistory.groups.filter((cg) => cg !== groups) : lastDrillHistory.groups.concat([groups]),
        name: groups
      }
    }
    onDrillDashboardItem(itemId, currentDrillStatus)
    this.getChartData('rerender', itemId, widgetId, {
        drillStatus: currentDrillStatus
      })
  }
  private selectDrillHistory = (history, item, itemId, widgetId) => {
    const { currentItemsInfo, onDeleteDrillHistory } = this.props
    if (history) {
      this.getChartData('rerender', itemId, widgetId, {
        drillStatus: history
      })
    } else {
      this.getChartData('rerender', itemId, widgetId)
    }
    onDeleteDrillHistory(itemId, item)
  }
  public render () {
    const {
      dashboards,
      widgets,
      currentDashboard,
      currentDashboardLoading,
      currentDashboardShareInfo,
      currentDashboardSecretInfo,
      currentDashboardShareInfoLoading,
      currentItems,
      currentItemsInfo,
      currentDashboardCascadeSources,
      bizlogics,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink,
      router,
      currentProject,
      currentLinkages
    } = this.props

    const {
      mounted,
      dashboardItemFormType,
      dashboardItemFormVisible,
      modalLoading,
      selectedWidget,
      polling,
      dashboardItemFormStep,
      linkageConfigVisible,
      interactingStatus,
      globalFilterConfigVisible,
      allowFullScreen,
      dashboardSharePanelAuthorized
    } = this.state

    let navDropdown = (<span />)
    let grids = void 0

    if (dashboards) {
      const navDropdownItems = dashboards.map((d) => (
        <Menu.Item key={d.id}>
          {d.name}
        </Menu.Item>
      ))
      navDropdown = (
        <Menu onClick={this.navDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    let nextNavDropdown = (<span />)
    if (currentDashboard && widgets) {
      const navDropdownItems = currentItems.map((d) => {
        const wid = (widgets.find((widget) => widget.id === d.widgetId))
        return (
        <Menu.Item key={d.id} widgetId={d.widgetId}>
          {d.widgetId ?
              wid && wid.name ? wid.name : ''
              : ''}
        </Menu.Item>
      )})
      nextNavDropdown = (
        <Menu onClick={this.nextNavDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    if (currentProject && currentItems) {
      const itemblocks = []
      const layouts = { lg: [] }
      currentItems.forEach((dashboardItem) => {
        const { id, x, y, width, height, widgetId, polling, frequency } = dashboardItem
        const {
          datasource,
          loading,
          shareInfo,
          secretInfo,
          shareInfoLoading,
          downloadCsvLoading,
          interactId,
          rendered,
          renderType
        } = currentItemsInfo[id]

        const widget = widgets.find((w) => w.id === widgetId)
        const view = bizlogics.find((b) => b.id === widget.viewId)
        const interacting = interactingStatus[id] || false
        const drillHistory = currentItemsInfo[id]['queryParams']['drillHistory'] ? currentItemsInfo[id]['queryParams']['drillHistory'] : void 0

        itemblocks.push((
          <div key={id}>
            <DashboardItem
              itemId={id}
              widget={widget}
              datasource={datasource}
              loading={loading}
              polling={polling}
              interacting={interacting}
              frequency={frequency}
              shareInfo={shareInfo}
              secretInfo={secretInfo}
              view={view}
              shareInfoLoading={shareInfoLoading}
              downloadCsvLoading={downloadCsvLoading}
              currentProject={currentProject}
              drillHistory={drillHistory}
              onSelectDrillHistory={this.selectDrillHistory}
              onGetChartData={this.getChartData}
              onShowEdit={this.showEditDashboardItemForm}
              onDeleteDashboardItem={this.deleteItem}
              onLoadWidgetShareLink={onLoadWidgetShareLink}
              onDownloadCsv={this.downloadCsv}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              onEditWidget={this.toWorkbench}
              onDrillData={this.dataDrill}
              rendered={rendered}
              renderType={renderType}
              router={router}
              ref={(f) => this[`dashboardItem${id}`] = f}
            />
          </div>
        ))

        layouts.lg.push({
          x,
          y,
          w: width,
          h: height,
          i: `${id}`
        })
      })
      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-14px'}}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_ITEM_MARGIN, GRID_ITEM_MARGIN]}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          onDragStop={this.onDragStop}
          onResizeStop={this.onResizeStop}
          measureBeforeMount={false}
          draggableHandle={`.${styles.title}`}
          useCSSTransforms={mounted}
        >
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
    }

    const saveDashboardItemButton = (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.saveDashboardItem}
      >
        保 存
      </Button>
    )

    const modalButtons = dashboardItemFormType === 'add'
      ? dashboardItemFormStep
        ? [(
          <Button
            key="back"
            size="large"
            onClick={this.changeDashboardItemFormStep(0)}
          >
            上一步
          </Button>
        ), saveDashboardItemButton]
        : [(
          <Button
            key="forward"
            size="large"
            type="primary"
            disabled={selectedWidget.length === 0}
            onClick={this.changeDashboardItemFormStep(1)}
          >
            下一步
          </Button>
        )]
      : saveDashboardItemButton

    return (
      <Container>
        <Helmet title={currentDashboard && currentDashboard.name} />
        <Container.Title>
          <Row>
            <Col sm={12}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                {
                  currentDashboard && (
                    <Breadcrumb.Item>
                      <Dropdown overlay={navDropdown} trigger={['click']}>
                        <Link to="">
                          {`${currentDashboard.name} `}
                          <Icon type="down" />
                        </Link>
                      </Dropdown>
                    </Breadcrumb.Item>
                  )
                }
                {
                  currentDashboard && (
                    <Breadcrumb.Item>
                      <Dropdown overlay={nextNavDropdown} trigger={['click']}>
                        <Link to="">
                          {
                            currentDashboard.widgets && currentDashboard.widgets.length
                              ? currentDashboard.widgets.length > 1
                                ? <span>{this.state.nextMenuTitle} <Icon type="down" /></span>
                                : ''
                              : ''
                          }
                        </Link>
                      </Dropdown>
                    </Breadcrumb.Item>)
                }
              </Breadcrumb>
            </Col>
            <DashboardToolbar
              currentProject={currentProject}
              currentDashboard={currentDashboard}
              currentDashboardShareInfo={currentDashboardShareInfo}
              currentDashboardSecretInfo={currentDashboardSecretInfo}
              currentDashboardShareInfoLoading={currentDashboardShareInfoLoading}
              dashboardSharePanelAuthorized={dashboardSharePanelAuthorized}
              showAddDashboardItem={this.showAddDashboardItemForm}
              onChangeDashboardAuthorize={this.changeDashboardSharePanelAuthorizeState}
              onLoadDashboardShareLink={onLoadDashboardShareLink}
              onToggleGlobalFilterVisibility={this.toggleGlobalFilterConfig}
              onToggleLinkageVisibility={this.toggleLinkageConfig}
            />
          </Row>
          <DashboardFilterPanel
            currentDashboard={currentDashboard}
            currentItems={currentItems}
            onGetOptions={this.getOptions}
            filterOptions={currentDashboardCascadeSources}
            onChange={this.globalFilterChange}
          />
        </Container.Title>
        <Container.Body grid ref={(f) => this.containerBody = findDOMNode(f)}>
          {grids}
          <div className={styles.gridBottom} />
        </Container.Body>
        <Modal
          title={`${dashboardItemFormType === 'add' ? '新增' : '修改'} Widget`}
          wrapClassName="ant-modal-large"
          visible={dashboardItemFormVisible}
          footer={modalButtons}
          onCancel={this.hideDashboardItemForm}
          afterClose={this.afterDashboardItemFormClose}
        >
          <DashboardItemForm
            type={dashboardItemFormType}
            widgets={widgets || []}
            selectedWidget={selectedWidget}
            polling={polling}
            step={dashboardItemFormStep}
            onWidgetSelect={this.widgetSelect}
            onPollingSelect={this.pollingSelect}
            wrappedComponentRef={this.refHandles.dashboardItemForm}
          />
        </Modal>
        <DashboardLinkageConfig
          currentDashboard={currentDashboard}
          currentItems={currentItems}
          currentItemsInfo={currentItemsInfo}
          views={bizlogics}
          widgets={widgets}
          visible={linkageConfigVisible}
          loading={currentDashboardLoading}
          onGetWidgetInfo={this.getWidgetInfo}
          onSave={this.saveLinkageConfig}
          onCancel={this.toggleLinkageConfig(false)}
          linkages={currentLinkages}
        />
        <DashboardFilterConfig
          currentDashboard={currentDashboard}
          currentItems={currentItems}
          views={bizlogics}
          widgets={widgets}
          visible={globalFilterConfigVisible}
          loading={currentDashboardLoading}
          filterOptions={currentDashboardCascadeSources}
          onCancel={this.toggleGlobalFilterConfig(false)}
          onSave={this.saveFilters}
          onGetOptions={this.getOptions}
        />
        <FullScreenPanel
          widgets={widgets}
          currentItems={currentItems}
          currentDashboard={currentDashboard}
          currentItemsInfo={currentItemsInfo}
          visible={allowFullScreen}
          isVisible={this.visibleFullScreen}
          currentDataInFullScreen={this.state.currentDataInFullScreen}
          onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
        />
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectDashboards(),
  currentDashboard: makeSelectCurrentDashboard(),
  currentDashboardLoading: makeSelectCurrentDashboardLoading(),
  currentDashboardShareInfo: makeSelectCurrentDashboardShareInfo(),
  currentDashboardSecretInfo: makeSelectCurrentDashboardSecretInfo(),
  currentDashboardShareInfoLoading: makeSelectCurrentDashboardShareInfoLoading(),
  currentItems: makeSelectCurrentItems(),
  currentItemsInfo: makeSelectCurrentItemsInfo(),
  currentDashboardCascadeSources: makeSelectCurrentDashboardCascadeSources(),
  currentLinkages: makeSelectCurrentLinkages(),
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardDetail: (projectId, portalId, dashboardId) => dispatch(loadDashboardDetail(projectId, portalId, dashboardId)),
    onAddDashboardItem: (portalId, item, resolve) => dispatch(addDashboardItem(portalId, item, resolve)),
    onEditCurrentDashboard: (dashboard, resolve) => dispatch(editCurrentDashboard(dashboard, resolve)),
    onEditDashboardItem: (item, resolve) => dispatch(editDashboardItem(item, resolve)),
    onEditDashboardItems: (items) => dispatch(editDashboardItems(items)),
    onDeleteDashboardItem: (id, resolve) => dispatch(deleteDashboardItem(id, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, params) =>
                        dispatch(loadDataFromItem(renderType, itemId, viewId, params, 'dashboard')),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onLoadWidgetCsv: (itemId, widgetId, params, token) => dispatch(loadWidgetCsv(itemId, widgetId, params, token)),
    onLoadCascadeSource: (controlId, viewId, column, parents) => dispatch(loadCascadeSource(controlId, viewId, column, parents)),
    onLoadBizdataSchema: (id, resolve) => dispatch(loadBizdataSchema(id, resolve)),
    onLoadDistinctValue: (viewId, fieldName, resolve) => dispatch(loadDistinctValue(viewId, fieldName, [], resolve)),
    onRenderDashboardItem: (itemId) => dispatch(renderDashboardItem(itemId)),
    onResizeDashboardItem: (itemId) => dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onLoadDashboardShareLink: (id, authName) => dispatch(loadDashboardShareLink(id, authName)),
    onLoadWidgetShareLink: (id, itemId, authName, resolve) => dispatch(loadWidgetShareLink(id, itemId, authName, resolve)),
    onDrillDashboardItem: (itemId, drillHistory) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDeleteDrillHistory: (itemId, index) => dispatch(deleteDrillHistory(itemId, index))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: reducerBizlogic })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: sagaBizlogic })

export default compose(
  withReducerWidget,
  withReducerBizlogic,
  withSagaWidget,
  withSagaBizlogic,
  withConnect
)(Grid)
