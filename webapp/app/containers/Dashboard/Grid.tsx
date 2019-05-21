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
import widgetReducer from '../Widget/reducer'
import widgetSaga from '../Widget/sagas'
import viewReducer from '../View/reducer'
import viewSaga from '../View/sagas'
import formReducer from './FormReducer'

import { IViewBase, IFormedViews } from '../View/types'

import Container from '../../components/Container'
import DashboardToolbar from './components/DashboardToolbar'
import DashboardItemForm from './components/DashboardItemForm'
import DrillPathSetting from './components/DrillPathSetting'
import DashboardItem from './components/DashboardItem'
import DashboardLinkageConfig from './components/DashboardLinkageConfig'

import { IMapItemControlRequestParams, IMapControlOptions, IDistinctValueReqeustParams, InteractionType } from 'components/Filters'
import GlobalControlPanel from '../../components/Filters/FilterPanel'
import GlobalControlConfig from '../../components/Filters/config/FilterConfig'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'

import { Responsive, WidthProvider } from 'libs/react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
import { Row, Col, Button, Modal, Breadcrumb, Icon, Dropdown, Menu } from 'antd'
import { uuid } from '../../utils/util'
import FullScreenPanel from './components/fullScreenPanel/FullScreenPanel'
import { decodeMetricName } from '../Widget/components/util'
import { hideNavigator } from '../App/actions'
import {
  loadDashboardDetail,
  addDashboardItems,
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
  deleteDrillHistory,
  drillPathsetting,
  selectDashboardItemChart,
  setSelectOptions
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
  makeSelectCurrentDashboardSelectOptions,
  makeSelectCurrentLinkages
} from './selectors'
import { ViewActions, ViewActionType } from '../View/actions'
const { loadViewDataFromVizItem, loadViewsDetail, loadSelectOptions } = ViewActions
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectViews, makeSelectFormedViews } from '../View/selectors'
import { makeSelectCurrentProject } from '../Projects/selectors'

import {
  SQL_NUMBER_TYPES,
  DEFAULT_SPLITER,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ITEM_MARGIN,
  GRID_ROW_HEIGHT,
  KEY_COLUMN
} from '../../globalConstants'
import { InjectedRouter } from 'react-router/lib/Router'
import { IWidgetConfig, RenderType } from '../Widget/components/Widget'
import { IProject } from '../Projects'
import { ICurrentDashboard } from './'
import { ChartTypes } from '../Widget/config/chart/ChartTypes'
const utilStyles = require('../../assets/less/util.less')
const styles = require('./Dashboard.less')

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export type QueryVariable = Array<{name: string, value: string | number}>
export interface IQueryVariableMap {
  [key: string]: string | number
}

export interface IQueryConditions {
  filters: string[]
  tempFilters: string[]
  linkageFilters: string[]
  globalFilters: string[]
  variables: QueryVariable
  linkageVariables: QueryVariable
  globalVariables: QueryVariable
  pagination?: {
    pageNo: number
    pageSize: number
  }
  nativeQuery?: boolean
  drillStatus?: any
  drillHistory?: Array<{filter?: any, type?: string, col?: string[], row?: string[], groups?: string[], name: string}>
  drillpathSetting?: any
  drillpathInstance?: any
}

interface IDashboardItemInfo {
  datasource: {
    pageNo: number
    pageSize: number
    resultList: any[]
    totalCount: number
  }
  loading: boolean
  queryConditions: IQueryConditions
  shareInfo: string
  secretInfo: string
  shareInfoLoading: boolean
  downloadCsvLoading: boolean
  interactId: string
  rendered: boolean
  renderType: RenderType
  controlSelectOptions: IMapControlOptions
  selectedItems?: number[]
}

export interface IDataRequestParams {
  groups: string[]
  aggregators: Array<{column: string, func: string}>
  filters: string[]
  tempFilters?: string[]
  linkageFilters?: string[]
  globalFilters?: string[]
  variables?: QueryVariable
  linkageVariables?: QueryVariable
  globalVariables?: QueryVariable
  orders: Array<{column: string, direction: string}>
  cache: boolean
  expired: number
  pagination?: {
    pageNo: number
    pageSize: number
  }
  nativeQuery?: boolean
}

interface IGridProps {
  dashboards: any[]
  widgets: any[]
  views: IViewBase[]
  formedViews: IFormedViews
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
    [key: string]: IDashboardItemInfo
  }
  currentDashboardSelectOptions: IMapControlOptions
  currentLinkages: any[]
  onLoadDashboardDetail: (projectId: number, portalId: number, dashboardId: number) => any
  onAddDashboardItems: (portalId: number, items: IDashboardItem[], resolve: (items: IDashboardItem[]) => void) => any
  onEditCurrentDashboard: (dashboard: object, resolve: () => void) => void
  onEditDashboardItem: (portalId: number, item: IDashboardItem, resolve: () => void) => void
  onEditDashboardItems: (portalid: number, item: IDashboardItem[]) => void
  onDeleteDashboardItem: (id: number, resolve?: () => void) => void
  onLoadDataFromItem: (
    renderType: RenderType,
    dashboardItemId: number,
    viewId: number,
    requestParams: IDataRequestParams
  ) => void
  onLoadViewsDetail: (viewIds: number[], resolve: () => void) => void
  onLoadWidgetCsv: (
    itemId: number,
    widgetId: number,
    requestParams: IDataRequestParams
  ) => void
  onClearCurrentDashboard: () => any
  onLoadSelectOptions: (controlKey: string, requestParams: { [viewId: string]: IDistinctValueReqeustParams }, itemId?: number) => void
  onSetSelectOptions: (controlKey: string, options: any[], itemId?: number) => void
  onRenderDashboardItem: (itemId: number) => void
  onResizeDashboardItem: (itemId: number) => void
  onResizeAllDashboardItem: () => void
  onLoadDashboardShareLink: (id: number, authName: string) => void
  onLoadWidgetShareLink: (id: number, itemId: number, authName: string, resolve?: () => void) => void
  onDrillDashboardItem: (itemId: number, drillHistory: any) => void
  onDrillPathSetting: (itemId: number, history: any[]) => void
  onDeleteDrillHistory: (itemId: number, index: number) => void
  onSelectDashboardItemChart: (itemId: number, renderType: string, selectedItems: number[]) => void
}

interface IGridStates {
  mounted: boolean
  layoutInitialized: boolean
  allowFullScreen: boolean
  currentDataInFullScreen: object
  dashboardItemFormType: string
  dashboardItemFormVisible: boolean
  dashboardItemFormStep: number
  modalLoading: boolean
  selectedWidgets: number[]
  currentItemId: number | boolean
  polling: boolean
  linkageConfigVisible: boolean
  interactingStatus: { [itemId: number]: boolean }
  globalFilterConfigVisible: boolean
  dashboardSharePanelAuthorized: boolean
  nextMenuTitle: string
  drillPathSettingVisible: boolean
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
      drillPathSettingVisible: false,
      dashboardItemFormStep: 0,
      modalLoading: false,
      selectedWidgets: [],
      polling: false,
      currentItemId: false,

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
  private refHandles = {
    dashboardItemForm: (f) => { this.dashboardItemForm = f }
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
    const { onLoadDashboardDetail } = this.props
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

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: Partial<IQueryConditions>) => {
    this.getData(
      (renderType, itemId, widget, requestParams) => {
        this.props.onLoadDataFromItem(renderType, itemId, widget.viewId, requestParams)
      },
      renderType,
      itemId,
      widgetId,
      queryConditions
    )
  }

  private downloadCsv = (itemId: number, widgetId: number) => {
    this.getData(
      (renderType, itemId, widget, requestParams) => {
        this.props.onLoadWidgetCsv(itemId, widget.id, requestParams)
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
      requestParams?: IDataRequestParams
    ) => void,
    renderType: RenderType,
    itemId: number,
    widgetId: number,
    queryConditions?: Partial<IQueryConditions>
  ) => {
    const {
      currentItemsInfo,
      widgets
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryConditions = currentItemsInfo[itemId].queryConditions

    let tempFilters
    let linkageFilters
    let globalFilters
    let variables
    let linkageVariables
    let globalVariables
    let drillStatus
    let pagination
    let nativeQuery

    if (queryConditions) {
      tempFilters = queryConditions.tempFilters !== void 0 ? queryConditions.tempFilters : cachedQueryConditions.tempFilters
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
      drillStatus = queryConditions.drillStatus || void 0
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery || cachedQueryConditions.nativeQuery
    } else {
      tempFilters = cachedQueryConditions.tempFilters
      linkageFilters = cachedQueryConditions.linkageFilters
      globalFilters = cachedQueryConditions.globalFilters
      variables = cachedQueryConditions.variables
      linkageVariables = cachedQueryConditions.linkageVariables
      globalVariables = cachedQueryConditions.globalVariables
      pagination = cachedQueryConditions.pagination
      nativeQuery = cachedQueryConditions.nativeQuery
    }

    let groups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (secondaryMetrics && secondaryMetrics.length) {
      aggregators = aggregators.concat(secondaryMetrics.map((second) => ({
        column: decodeMetricName(second.name),
        func: second.agg
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

    const requestParams = {
      groups: drillStatus && drillStatus.groups ? drillStatus.groups : groups,
      aggregators,
      filters: drillStatus && drillStatus.filter ? drillStatus.filter.sqls : filters.map((i) => i.config.sql),
      tempFilters,
      linkageFilters,
      globalFilters,
      variables,
      linkageVariables,
      globalVariables,
      orders,
      cache,
      expired,
      pagination,
      nativeQuery
    }

    callback(
      renderType,
      itemId,
      widget,
      requestParams
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
    const { currentItems, onEditDashboardItems, params } = this.props
    const portalId = +params.portalId
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
    onEditDashboardItems(portalId, changedItems)
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
      selectedWidgets: [dashboardItem.widgetId],
      polling: dashboardItem.polling
    }, () => {
      setTimeout(() => {
        this.dashboardItemForm.props.form.setFieldsValue({
          id: dashboardItem.id,
          polling: dashboardItem.polling ? 'true' : 'false',
          frequency: dashboardItem.frequency
        })
      }, 0)
    })
  }
  private showDrillDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)
    this.setState({
      drillPathSettingVisible: true,
      selectedWidgets: [dashboardItem.widgetId],
      currentItemId: itemId
    })
  }
  private hideDrillPathSettingModal = () => {
    this.setState({
      drillPathSettingVisible: false
    })
  }
  private hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false,
      selectedWidgets: []
    })
  }

  private afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidgets: [],
      polling: false,
      dashboardItemFormStep: 0
    })
    this.dashboardItemForm.onReset()
    this.dashboardItemForm.props.form.resetFields()
  }

  private widgetSelect = (selectedRowKeys) => {
    this.setState({
      selectedWidgets: selectedRowKeys
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
    const { params, currentDashboard, currentItems, widgets, formedViews } = this.props
    const portalId = +params.portalId
    const { selectedWidgets, dashboardItemFormType } = this.state
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

      const newItems = selectedWidgets.map((key, index) => {
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
      const selectedWidgetsViewIds = widgets.filter((w) => selectedWidgets.includes(w.id)).map((w) => w.viewId)
      const viewIds = selectedWidgetsViewIds
        .filter((viewId, idx) => selectedWidgetsViewIds.indexOf(viewId) === idx)
        .filter((viewId) => !formedViews[viewId])

      if (viewIds.length) {
        this.props.onLoadViewsDetail(viewIds, () => {
          this.props.onAddDashboardItems(portalId, newItems, () => {
            this.hideDashboardItemForm()
          })
        })
      } else {
        this.props.onAddDashboardItems(portalId, newItems, () => {
          this.hideDashboardItemForm()
        })
      }
    } else {
      const dashboardItem = currentItems.find((item) => item.id === Number(formdata.id))
      const modifiedDashboardItem = {
        ...dashboardItem,
        ...newItem,
        widgetId: selectedWidgets[0]
      }

      this.props.onEditDashboardItem(portalId, modifiedDashboardItem, () => {
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
    const isInteractiveItem = currentLinkages.some((c) => {
      const { trigger } = c
      const triggerId = +trigger[0]
      return triggerId === itemId
    })

    return isInteractiveItem
  }

  private doInteract = (itemId: number, triggerData) => {
    console.log('doInteract')
    const {
      currentItems,
      currentLinkages
    } = this.props

    const mappingLinkage = getMappingLinkage(itemId, currentLinkages)
    this.interactingLinkagers = processLinkage(itemId, triggerData, mappingLinkage, this.interactingLinkagers)

    Object.keys(mappingLinkage).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('clear', +linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce<string[]>((arr, f: string[]) => arr.concat(...f), []),
        linkageVariables: Object.values(variables).reduce<QueryVariable>((arr, p: QueryVariable) => arr.concat(...p), [])
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
    console.log('clearAllInteracts')
    const { currentItems } = this.props
    Object.keys(this.interactingLinkagers).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      this.getChartData('clear', +linkagerItemId, item.widgetId, {
        linkageFilters: [],
        linkageVariables: []
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
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce<string[]>((arr, f: string[]) => arr.concat(...f), []),
        linkageVariables: Object.values(variables).reduce<QueryVariable>((arr, p: QueryVariable) => arr.concat(...p), [])
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

  private getOptions = (controlKey: string, useOptions: boolean, paramsOrOptions, itemId?: number) => {
    if (useOptions) {
      this.props.onSetSelectOptions(controlKey, paramsOrOptions, itemId)
    } else {
      this.props.onLoadSelectOptions(controlKey, paramsOrOptions, itemId)
    }
  }

  private globalFilterChange = (queryConditions: IMapItemControlRequestParams) => {
    const { currentItems, currentItemsInfo } = this.props
    Object.entries(queryConditions).forEach(([itemId, condition]) => {
      const item = currentItems.find((ci) => ci.id === +itemId)
      if (item) {
        let pageNo = 0
        const { pagination } = currentItemsInfo[itemId].queryConditions
        if (pagination.pageNo) { pageNo = 1 }
        const { variables: globalVariables, filters: globalFilters } = condition
        this.getChartData('rerender', +itemId, item.widgetId, {
          globalVariables,
          globalFilters,
          pagination: { ...pagination, pageNo }
        })
      }
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
  private currentWidgetInFullScreen = (id: number) => {
    const { currentItems, currentItemsInfo, widgets, formedViews, onRenderDashboardItem } = this.props
    const item = currentItems.find((ci) => ci.id === id)
    const widget = widgets.find((w) => w.id === item.widgetId)
    const model = formedViews[widget.viewId].model
    const { rendered } = currentItemsInfo[id]
    if (!rendered) {
      onRenderDashboardItem(id)
    }
    this.setState({
      currentDataInFullScreen: {
        itemId: id,
        widgetId: widget.id,
        widget,
        model,
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
    const { pid, portalId, portalName, dashboardId } = this.props.params
    const editSign = [pid, portalId, portalName, dashboardId, itemId].join(DEFAULT_SPLITER)
    sessionStorage.setItem('editWidgetFromDashboard', editSign)
    this.props.router.push(`/project/${pid}/widget/${widgetId}`)
  }

  private onDrillPathData = (e) => {
    const {
      widgets,
      currentItemsInfo,
      onDrillDashboardItem
    } = this.props
    const { widgetProps, out, enter, value, itemId, widget, sourceDataFilter, currentDrillStatus } = e
    const drillHistory = currentItemsInfo[itemId].queryConditions.drillHistory
    onDrillDashboardItem(itemId, currentDrillStatus)
  }

  private dataDrill = (e) => {
    const {
      widgets,
      currentItemsInfo,
      onDrillDashboardItem
    } = this.props
    const { itemId, groups, widgetId, sourceDataFilter, mode, col, row } = e
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig
    const drillHistory = currentItemsInfo[itemId].queryConditions.drillHistory
    let sql = void 0
    let name = void 0
    let filterSource = void 0
    let widgetConfigGroups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)
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
    let widgetConfigRows = []
    let widgetConfigCols = []
    const coustomTableSqls = []
    let sqls = widgetConfig.filters.map((i) => i.config.sql)
    if ((!drillHistory) || drillHistory.length === 0) {
      let currentCol = void 0
      if (widgetConfig) {
        const dimetionAxis = widgetConfig.dimetionAxis
        widgetConfigRows = widgetConfig.rows && widgetConfig.rows.length ? widgetConfig.rows : []
        widgetConfigCols = widgetConfig.cols && widgetConfig.cols.length ? widgetConfig.cols : []
        const mode = widgetConfig.mode
        if (mode && mode === 'pivot') {
          if (cols && cols.length !== 0) {
            const cols = widgetConfig.cols
            name = cols[cols.length - 1]['name']
          } else {
            const rows = widgetConfig.rows
            name = rows[rows.length - 1]['name']
          }
        } else if (dimetionAxis === 'col') {
          const cols = widgetConfig.cols
          name = cols[cols.length - 1]['name']
        } else if (dimetionAxis === 'row') {
          const rows = widgetConfig.rows
          name = rows[rows.length - 1]['name']
        } else if (mode === 'chart'  && widgetConfig.selectedChart === ChartTypes.Table) {
          // todo coustomTable
          const coustomTable = sourceDataFilter.reduce((a, b) => {
            a[b['key']] === undefined ? a[b['key']] = [b['value']] : a[b['key']].push(b['value'])
            return a
          }, {})
          for (const attr in coustomTable) {
            if (coustomTable[attr] !== undefined && attr) {
              coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
            }
          }
          const drillKey = sourceDataFilter[sourceDataFilter.length - 1]['key']
          const newWidgetPropCols = widgetConfigCols.reduce((array, col) => {
            array.push(col)
            if (col.name === drillKey) {
              array.push({name: groups})
            }
            return array
          }, [])
          currentCol = groups && groups.length ? newWidgetPropCols : void 0
        }
      }
      filterSource = sourceDataFilter.map((source) => {
        if (source && source[name]) {
          return source[name]
        }
      })
      if (name && name.length) {
        currentCol = col && col.length ? widgetConfigCols.concat([{name: col}]) : void 0
        sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
        sqls.push(sql)
      }
      if (Array.isArray(coustomTableSqls) && coustomTableSqls.length > 0) {
        sqls = sqls.concat(coustomTableSqls)
      }
      const isDrillUp = widgetConfigGroups.some((cg) => cg === groups)
      let currentDrillGroups = void 0
      if (isDrillUp) {
        currentDrillGroups = widgetConfigGroups.filter((cg) => cg !== groups)
      } else {
        if (mode === 'pivot') {
          currentDrillGroups = widgetConfigGroups.concat([groups])
        } else if (mode === 'chart' && widgetConfig.selectedChart === ChartTypes.Table) {
          currentDrillGroups = widgetConfigGroups.concat([groups])
        } else {
          currentDrillGroups = [groups]
        }
      }
      currentDrillStatus = {
        filter: {
          filterSource,
          name,
          sql,
          sqls,
          visualType: 'string'
        },
        type: isDrillUp ? 'up' : 'down',
        col: currentCol,
        row: row && row.length ? widgetConfigRows.concat([{name: row}]) : void 0,
        groups: currentDrillGroups,
        // groups: isDrillUp
        //         ? widgetConfigGroups.filter((cg) => cg !== groups)
        //         : mode === 'pivot' ? widgetConfigGroups.concat([groups])
        //                           : [groups],
        name: groups
      }
    } else {
      const lastDrillHistory = drillHistory[drillHistory.length - 1]
      let currentCol = void 0
      let currentRow = void 0
     // todo
      if (mode === 'chart' && widgetConfig.selectedChart === ChartTypes.Table) {
        const coustomTable = sourceDataFilter.reduce((a, b) => {
          a[b['key']] === undefined ? a[b['key']] = [b['value']] : a[b['key']].push(b['value'])
          return a
        }, {})
        for (const attr in coustomTable) {
          if (coustomTable[attr] !== undefined && attr) {
            coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
          }
        }
        if (Array.isArray(coustomTableSqls) && coustomTableSqls.length > 0) {
          sqls = sqls.concat(coustomTableSqls)
        }
        if (lastDrillHistory && lastDrillHistory.col && lastDrillHistory.col.length) {
          const drillKey = sourceDataFilter[sourceDataFilter.length - 1]['key']
          const cols = lastDrillHistory.col
          const newWidgetPropCols = cols.reduce((array, col) => {
            array.push(col)
            if (col.name === drillKey) {
              array.push({name: groups})
            }
            return array
          }, [])
          currentCol = groups && groups.length ? newWidgetPropCols : lastDrillHistory.col
        }
      } else {
        name = lastDrillHistory.groups[lastDrillHistory.groups.length - 1]
        filterSource = sourceDataFilter.map((source) => source[name])
        sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
        sqls = lastDrillHistory.filter.sqls.concat(sql)
        currentCol = col && col.length ? (lastDrillHistory.col || []).concat({name: col}) : lastDrillHistory.col
        currentRow = row && row.length ? (lastDrillHistory.row || []).concat({name: row}) : lastDrillHistory.row
      }
      const isDrillUp = lastDrillHistory.groups.some((cg) => cg === groups)
      let currentDrillGroups = void 0
      if (isDrillUp) {
        currentDrillGroups = lastDrillHistory.groups.filter((cg) => cg !== groups)
      } else {
        if (mode === 'pivot') {
          currentDrillGroups = lastDrillHistory.groups.concat([groups])
        } else if (mode === 'chart' && widgetConfig.selectedChart === ChartTypes.Table) {
          currentDrillGroups = lastDrillHistory.groups.concat([groups])
        } else {
          currentDrillGroups = [groups]
        }
      }
      currentDrillStatus = {
        filter: {
          filterSource,
          name,
          sql,
          sqls,
          visualType: 'string'
        },
        col: currentCol,
        row: currentRow,
        type: isDrillUp ? 'up' : 'down',
        groups: currentDrillGroups,
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

  private saveDrillPathSetting = (flag) => {
    // const { onDrillPathSetting } = this.props
    // onDrillPathSetting(currentItemId as number, flag)

    const {currentItems, params, onLoadDashboardDetail} = this.props
    const portalId = +params.portalId
    const { currentItemId } = this.state
    const dashboardItem = currentItems.find((item) => item.id === Number(currentItemId))
    const config = dashboardItem.config
    let configObj = null
    try {
       configObj = config && config.length > 0 ? JSON.parse(config) : {}
    } catch (err) {
      throw new Error(err)
    }

    if (!configObj) {
      configObj = {
        drillpathSetting: flag
      }
    }
    configObj['drillpathSetting'] = flag

    const modifiedDashboardItem = {
      ...dashboardItem,
      config: JSON.stringify(configObj)
    }

    this.props.onEditDashboardItem(portalId, modifiedDashboardItem, () => {
      if (params.dashboardId && Number(params.dashboardId) !== -1) {
        onLoadDashboardDetail(params.pid, params.portalId, params.dashboardId)
      }
      this.hideDrillPathSettingModal()
    })
  }

  private selectChartsItems = (itemId, renderType, selectedItems) => {
    const { onSelectDashboardItemChart } = this.props
    onSelectDashboardItemChart(itemId, renderType, selectedItems)
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
      currentDashboardSelectOptions,
      views,
      formedViews,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink,
      currentProject,
      currentLinkages
    } = this.props
    const {
      mounted,
      dashboardItemFormType,
      dashboardItemFormVisible,
      modalLoading,
      selectedWidgets,
      polling,
      currentItemId,
      dashboardItemFormStep,
      linkageConfigVisible,
      interactingStatus,
      globalFilterConfigVisible,
      allowFullScreen,
      dashboardSharePanelAuthorized,
      drillPathSettingVisible
    } = this.state
    let navDropdown = (<span />)
    let grids = void 0
    //   const drillPanels = []
    let drillpathSetting = void 0
    if (currentItemsInfo && currentItemId && currentItemsInfo[Number(currentItemId)]) {
      drillpathSetting = currentItemsInfo[Number(currentItemId)].queryConditions.drillpathSetting
    }
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
        <Menu.Item key={d.id}>
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
          renderType,
          queryConditions,
          selectedItems,
          controlSelectOptions
        } = currentItemsInfo[id]
        const widget = widgets.find((w) => w.id === widgetId)
        const interacting = interactingStatus[id] || false
        const drillHistory = queryConditions.drillHistory
        const drillpathSetting = queryConditions.drillpathSetting
        const drillpathInstance = queryConditions.drillpathInstance
        const view = formedViews[widget.viewId]

        itemblocks.push((
          <div key={id}>
            <DashboardItem
              itemId={id}
              widgets={widgets}
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
              rendered={rendered}
              renderType={renderType}
              controlSelectOptions={controlSelectOptions}
              queryConditions={queryConditions}
              drillHistory={drillHistory}
              drillpathSetting={drillpathSetting}
              drillpathInstance={drillpathInstance}
              onSelectDrillHistory={this.selectDrillHistory}
              onGetChartData={this.getChartData}
              onShowEdit={this.showEditDashboardItemForm}
              onShowDrillEdit={this.showDrillDashboardItemForm}
              onDeleteDashboardItem={this.deleteItem}
              onLoadWidgetShareLink={onLoadWidgetShareLink}
              onDownloadCsv={this.downloadCsv}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              onEditWidget={this.toWorkbench}
              onDrillData={this.dataDrill}
              onDrillPathData={this.onDrillPathData}
              onSelectChartsItems={this.selectChartsItems}
              onGetControlOptions={this.getOptions}
              selectedItems={selectedItems || []}
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
            disabled={selectedWidgets.length === 0}
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
          <GlobalControlPanel
            currentDashboard={currentDashboard}
            currentItems={currentItems}
            onGetOptions={this.getOptions}
            mapOptions={currentDashboardSelectOptions}
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
            selectedWidgets={selectedWidgets}
            polling={polling}
            step={dashboardItemFormStep}
            onWidgetSelect={this.widgetSelect}
            onPollingSelect={this.pollingSelect}
            wrappedComponentRef={this.refHandles.dashboardItemForm}
          />
        </Modal>
        <Modal
          key={`dfd${uuid(8, 16)}`}
          title="钻取设置"
          wrapClassName="ant-modal-large"
          visible={drillPathSettingVisible}
          footer={null}
          onCancel={this.hideDrillPathSettingModal}
        >
          {/* 临时下架功能，勿删 */}
          {/* <DrillPathSetting
             itemId={currentItemId}
             drillpathSetting={drillpathSetting}
             selectedWidget={this.state.selectedWidgets}
             widgets={widgets || []}
             views={views || []}
             saveDrillPathSetting={this.saveDrillPathSetting}
             cancel={this.hideDrillPathSettingModal}
          /> */}
        </Modal>
        <DashboardLinkageConfig
          currentDashboard={currentDashboard}
          currentItems={currentItems}
          currentItemsInfo={currentItemsInfo}
          views={formedViews}
          widgets={widgets}
          visible={linkageConfigVisible}
          loading={currentDashboardLoading}
          onGetWidgetInfo={this.getWidgetInfo}
          onSave={this.saveLinkageConfig}
          onCancel={this.toggleLinkageConfig(false)}
          linkages={currentLinkages}
        />
        <GlobalControlConfig
          currentDashboard={currentDashboard}
          currentItems={currentItems}
          views={formedViews}
          widgets={widgets}
          visible={globalFilterConfigVisible}
          loading={currentDashboardLoading}
          mapOptions={currentDashboardSelectOptions}
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
  currentDashboardSelectOptions: makeSelectCurrentDashboardSelectOptions(),
  currentLinkages: makeSelectCurrentLinkages(),
  widgets: makeSelectWidgets(),
  views: makeSelectViews(),
  formedViews: makeSelectFormedViews(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardDetail: (projectId, portalId, dashboardId) => dispatch(loadDashboardDetail(projectId, portalId, dashboardId)),
    onAddDashboardItems: (portalId, items, resolve) => dispatch(addDashboardItems(portalId, items, resolve)),
    onEditCurrentDashboard: (dashboard, resolve) => dispatch(editCurrentDashboard(dashboard, resolve)),
    onEditDashboardItem: (portalId, item, resolve) => dispatch(editDashboardItem(portalId, item, resolve)),
    onEditDashboardItems: (portalId, items) => dispatch(editDashboardItems(portalId, items)),
    onDeleteDashboardItem: (id, resolve) => dispatch(deleteDashboardItem(id, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, requestParams) =>
                        dispatch(loadViewDataFromVizItem(renderType, itemId, viewId, requestParams, 'dashboard')),
    onLoadViewsDetail: (viewIds, resolve) => dispatch(loadViewsDetail(viewIds, resolve)),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onLoadWidgetCsv: (itemId, widgetId, requestParams) => dispatch(loadWidgetCsv(itemId, widgetId, requestParams)),
    onLoadSelectOptions: (controlKey, requestParams, itemId) => dispatch(loadSelectOptions(controlKey, requestParams, itemId)),
    onSetSelectOptions: (controlKey, options, itemId) => dispatch(setSelectOptions(controlKey, options, itemId)),
    onRenderDashboardItem: (itemId) => dispatch(renderDashboardItem(itemId)),
    onResizeDashboardItem: (itemId) => dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onLoadDashboardShareLink: (id, authName) => dispatch(loadDashboardShareLink(id, authName)),
    onLoadWidgetShareLink: (id, itemId, authName, resolve) => dispatch(loadWidgetShareLink(id, itemId, authName, resolve)),
    onDrillDashboardItem: (itemId, drillHistory) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDrillPathSetting: (itemId, history) => dispatch(drillPathsetting(itemId, history)),
    onDeleteDrillHistory: (itemId, index) => dispatch(deleteDrillHistory(itemId, index)),
    onSelectDashboardItemChart: (itemId, renderType, selectedItems) => dispatch(selectDashboardItemChart(itemId, renderType, selectedItems))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withWidgetReducer = injectReducer({ key: 'widget', reducer: widgetReducer })
const withWidgetSaga = injectSaga({ key: 'widget', saga: widgetSaga })

const withViewReducer = injectReducer({ key: 'view', reducer: viewReducer })
const withViewSaga = injectSaga({ key: 'view', saga: viewSaga })

const withFormReducer = injectReducer({ key: 'form', reducer: formReducer })

export default compose(
  withWidgetReducer,
  withViewReducer,
  withFormReducer,
  withWidgetSaga,
  withViewSaga,
  withConnect
)(Grid)
