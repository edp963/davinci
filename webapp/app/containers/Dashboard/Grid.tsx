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

import React from 'react'
import { findDOMNode } from 'react-dom'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router-dom'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import widgetReducer from 'containers/Widget/reducer'
import widgetSaga from 'containers/Widget/sagas'
import viewReducer from 'containers/View/reducer'
import viewSaga from 'containers/View/sagas'
import formReducer from './FormReducer'

import {
  IDashboardItem,
  IDashboardItemInfo,
  IDataRequestParams,
  QueryVariable,
  IQueryConditions,
  IDataDownloadParams,
  SharePanelType
} from './types'
import { RouteComponentWithParams } from 'utils/types'
import { IViewBase, IFormedViews } from 'containers/View/types'

import Container from 'components/Container'
import Toolbar from './components/Toolbar'
import DashboardItemForm from './components/DashboardItemForm'
import DrillPathSetting from './components/DrillPathSetting'
import DashboardItem from './components/DashboardItem'
import DashboardLinkageConfig from './components/DashboardLinkageConfig'

import { IMapItemControlRequestParams, IMapControlOptions, IDistinctValueReqeustParams, IFilters, IGridCtrlParams } from 'components/Filters/types'
import {getValidColumnValue} from 'app/components/Filters/util'
import GlobalControlPanel from 'components/Filters/FilterPanel'
import GlobalControlConfig from 'components/Filters/config/FilterConfig'
import SharePanel from './components/SharePanel'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'
import { hasVizEditPermission } from '../Account/components/checkUtilPermission'

import { Responsive, WidthProvider } from 'react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
import { Row, Col, Button, Modal, Breadcrumb, Menu, message } from 'antd'
import { uuid } from 'utils/util'
import FullScreenPanel, { ICurrentDataInFullScreenProps } from './components/fullScreenPanel/FullScreenPanel'
import { decodeMetricName } from 'containers/Widget/components/util'
import { initiateDownloadTask } from 'containers/App/actions'
import {
  loadDashboardDetail,
  addDashboardItems,
  editDashboardItem,
  editDashboardItems,
  deleteDashboardItem,
  clearCurrentDashboard,
  renderDashboardItem,
  resizeDashboardItem,
  resizeAllDashboardItem,
  openSharePanel,
  drillDashboardItem,
  deleteDrillHistory,
  drillPathsetting,
  selectDashboardItemChart,
  setSelectOptions,
  monitoredSyncDataAction,
  monitoredSearchDataAction,
  monitoredLinkageDataAction,
  sendCurrentDashboardControlParams
} from './actions'
import {
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentItemsInfo,
  makeSelectCurrentDashboardSelectOptions,
  makeSelectCurrentLinkages,
  makeSelectCurrentDashboardControlParams
} from './selectors'
import { VizActions } from 'containers/Viz/actions'
import { makeSelectCurrentPortal, makeSelectCurrentDashboards } from 'containers/Viz/selectors'
import { ViewActions, ViewActionType } from 'containers/View/actions'
const { loadViewDataFromVizItem, loadViewsDetail, loadSelectOptions } = ViewActions
import { makeSelectWidgets } from 'containers/Widget/selectors'
import { makeSelectViews, makeSelectFormedViews } from 'containers/View/selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import { IFieldSortDescriptor, FieldSortTypes } from 'containers/Widget/components/Config/Sort'
import { widgetDimensionMigrationRecorder } from 'utils/migrationRecorders'
import {
  SQL_NUMBER_TYPES,
  DEFAULT_SPLITER,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ITEM_MARGIN,
  GRID_ROW_HEIGHT,
  KEY_COLUMN,
  DEFAULT_TABLE_PAGE
} from 'app/globalConstants'
import { IWidgetConfig, RenderType, IWidgetProps } from '../Widget/components/Widget'
import { IProject } from '../Projects/types'
import { ICurrentDashboard } from './'
import { ChartTypes } from '../Widget/config/chart/ChartTypes'
import { DownloadTypes } from '../App/types'
import { statistic, IVizData } from 'utils/statistic/statistic.dv'
const utilStyles = require('assets/less/util.less')
const styles = require('./Dashboard.less')
const ResponsiveReactGridLayout = WidthProvider(Responsive)

interface IGridProps {
  dashboards: any[]
  widgets: any[]
  views: IViewBase[]
  formedViews: IFormedViews
  currentPortal: any
  currentProject: IProject
  currentDashboardControlParams: IGridCtrlParams
  currentDashboard: ICurrentDashboard
  currentDashboardLoading: boolean
  currentItems: IDashboardItem[]
  currentItemsInfo: {
    [key: string]: IDashboardItemInfo
  }
  currentDashboardSelectOptions: IMapControlOptions
  currentLinkages: any[]
  onLoadDashboardDetail: (projectId: number, portalId: number, dashboardId: number) => any
  onAddDashboardItems: (portalId: number, items: Array<Omit<Omit<IDashboardItem, 'id'>, 'config'>>, resolve: (items: IDashboardItem[]) => void) => any
  onEditCurrentDashboard: (dashboard: object, resolve: () => void) => void
  onEditDashboardItem: (portalId: number, item: IDashboardItem, resolve: () => void) => void
  onEditDashboardItems: (portalid: number, item: IDashboardItem[]) => void
  onDeleteDashboardItem: (id: number, resolve?: () => void) => void
  onLoadDataFromItem: (
    renderType: RenderType,
    dashboardItemId: number,
    viewId: number,
    requestParams: IDataRequestParams,
    statistic: any
  ) => void
  onLoadViewsDetail: (viewIds: number[], resolve: () => void) => void
  onInitiateDownloadTask: (id: number, type: DownloadTypes, downloadParams?: IDataDownloadParams[], itemId?: number) => void
  onClearCurrentDashboard: () => any
  onLoadSelectOptions: (controlKey: string, requestParams: { [viewId: string]: IDistinctValueReqeustParams }, itemId?: number) => void
  onSetSelectOptions: (controlKey: string, options: any[], itemId?: number) => void
  onRenderDashboardItem: (itemId: number) => void
  onResizeDashboardItem: (itemId: number) => void
  onResizeAllDashboardItem: () => void
  onOpenSharePanel: (id: number, type: SharePanelType, title: string, itemId?: number) => void
  onDrillDashboardItem: (itemId: number, drillHistory: any) => void
  onDrillPathSetting: (itemId: number, history: any[]) => void
  onDeleteDrillHistory: (itemId: number, index: number) => void
  onSelectDashboardItemChart: (itemId: number, renderType: string, selectedItems: number[]) => void
  onMonitoredSyncDataAction: () => any
  onMonitoredSearchDataAction: () => any
  onMonitoredLinkageDataAction: () => any
  onSendCurrentDashboardControlParams: (params: object) => any
}

interface IGridStates {
  mounted: boolean
  layoutInitialized: boolean
  allowFullScreen: boolean
  currentDataInFullScreen: ICurrentDataInFullScreenProps
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
  nextMenuTitle: string
  drillPathSettingVisible: boolean
}

interface IDashboardItemForm extends AntdFormType {
  onReset: () => void
}

export class Grid extends React.Component<IGridProps & RouteComponentWithParams, IGridStates> {
  constructor (props) {
    super(props)

    this.state = {
      mounted: false,
      layoutInitialized: false,

      allowFullScreen: false,
      currentDataInFullScreen: {
        itemId: 0,
        widget: null,
        model: null
      },

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
      match
    } = this.props
    const { projectId, portalId, dashboardId } = match.params
    if (dashboardId && Number(dashboardId) !== -1) {
      onLoadDashboardDetail(+projectId, +portalId, Number(dashboardId))
    }
  }

  private getVizDataForStatistic ({
    portalId,
    projectId,
    dashboardId,
    currentPortal,
    currentProject,
    currentDashboard
  }): IVizData {
    return {
      project_id: +projectId,
      project_name: currentProject && currentProject.name,
      org_id: currentProject && currentProject.orgId,
      viz_type: 'dashboard',
      viz_id: +portalId,
      viz_name: currentPortal && currentPortal.name,
      sub_viz_id: +dashboardId,
      sub_viz_name: currentDashboard && currentDashboard['name']
    }
  }

  public componentWillReceiveProps (nextProps: IGridProps & RouteComponentWithParams) {
    const {
      currentDashboard,
      currentDashboardLoading,
      currentItems,
      currentPortal,
      match: { params: nextParams }
    } = nextProps
    const { onLoadDashboardDetail } = this.props
    const { layoutInitialized } = this.state

    const { match, currentProject} = this.props
    const { projectId, portalId, dashboardId } = match.params

    const getVizData = this.getVizDataForStatistic({
      projectId,
      portalId,
      dashboardId: nextParams.dashboardId,
      currentPortal,
      currentProject,
      currentDashboard
    })

    if (nextParams.dashboardId === dashboardId) {
      if (nextProps.currentDashboard !== this.props.currentDashboard) {
        statistic.setOperations({
          ...getVizData,
          create_time:  statistic.getCurrentDateTime()
        }, (data) => {
          const visitRecord = {
            ...data,
            action: 'visit'
          }
          statistic.sendOperation(visitRecord).then((res) => {
            statistic.updateSingleFleld('operation', 'action', 'initial')
          })
        })
      }
    }

    if (nextParams.dashboardId !== dashboardId) {
      this.setState({
        nextMenuTitle: ''
      })

      if (nextParams.dashboardId && Number(nextParams.dashboardId) !== -1) {
        onLoadDashboardDetail(+nextParams.projectId, +nextParams.portalId, +nextParams.dashboardId)
      }

      statistic.setDurations({
        ...getVizData,
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.sendDuration([data]).then((res) => {
          statistic.setDurations({
            start_time: statistic.getCurrentDateTime()  // 初始化下一时段
          })
        })
      })
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

    if (currentDashboard && currentDashboard.name) {
      statistic.setDurations({
        sub_viz_name: currentDashboard.name
      })
    }

    if (currentProject && currentProject.name) {
      statistic.setDurations({
        project_name: currentProject.name,
        org_id: currentProject.orgId
      })
    }

    if (currentPortal && currentPortal.name) {
      statistic.setDurations({
        viz_name:  currentPortal.name
      })
    }

  }
  private statisticTimeFuc = () => {
    statistic.isTimeout()
  }
  public componentDidMount () {
    const {
      match,
      currentProject,
      currentDashboard,
      currentPortal,
      match: { params }
    } = this.props

    const { projectId, portalId } = match.params
    const getVizData = this.getVizDataForStatistic({
      projectId,
      portalId,
      dashboardId: params.dashboardId,
      currentPortal,
      currentProject,
      currentDashboard
    })

    window.addEventListener('resize', this.onWindowResize, false)
    window.addEventListener('beforeunload', function (event) {
      statistic.setDurations({
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.setPrevDurationRecord(data, () => {
          statistic.setDurations({
            start_time: statistic.getCurrentDateTime(),
            end_time: ''
          })
        })
      })
    }, false)
    statistic.setDurations({
      ...getVizData,
      start_time: statistic.getCurrentDateTime()
    })
    statistic.startClock()
    window.addEventListener('mousemove', this.statisticTimeFuc, false)
    window.addEventListener('visibilitychange', this.onVisibilityChanged, false)
    window.addEventListener('keydown', this.statisticTimeFuc, false)
  }

  private onVisibilityChanged (event) {
    const flag = event.target.webkitHidden
    if (flag) {
      statistic.setDurations({
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.sendDuration([data]).then((res) => {
          statistic.resetClock()
        })
      })
    } else {
      statistic.setDurations({
        start_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.startClock()
      })
    }
  }

  public componentWillUnmount () {
    statistic.setDurations({
      end_time: statistic.getCurrentDateTime()
    }, (data) => {
      statistic.sendDuration([data])
    })
    window.removeEventListener('resize', this.onWindowResize, false)
    window.removeEventListener('mousemove', this.statisticTimeFuc, false)
    window.removeEventListener('visibilitychange', this.onVisibilityChanged, false)
    window.removeEventListener('keydown', this.statisticTimeFuc, false)
    this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
    this.props.onClearCurrentDashboard()
    statistic.resetClock()
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

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: IQueryConditions) => {
    this.getData(
      (renderType, itemId, widget, requestParams) => {
        this.props.onLoadDataFromItem(renderType, itemId, widget.viewId, requestParams, {...requestParams, widget})
      },
      renderType,
      itemId,
      widgetId,
      queryConditions
    )
  }

  private initiateWidgetDownloadTask = (itemId: number, widgetId: number) => {
    const { widgets } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const queryConditions: IQueryConditions = {
      nativeQuery: false
    }
    try {
      const widgetProps: IWidgetProps = JSON.parse(widget.config)
      const { mode, selectedChart, chartStyles } = widgetProps
      if (mode === 'chart' && selectedChart === ChartTypes.Table) {
        queryConditions.nativeQuery = chartStyles.table.withNoAggregators
      }
    } catch (error) {
      message.error(error)
    }
    this.getData(
      (renderType, itemId, widget, requestParams) => {
        const downloadParams = [{
          ...requestParams,
          id: widgetId,
          itemId,
          widget
        }]
        this.props.onInitiateDownloadTask(widgetId, DownloadTypes.Widget, downloadParams, itemId)
      },
      'rerender',
      itemId,
      widgetId,
      queryConditions
    )
  }

  private initiateDashboardDownloadTask = () => {
    const { currentItems, currentDashboard, widgets } = this.props
    const downloadParams = []
    currentItems.forEach((item) => {
      const { id, widgetId } = item
      const widget = widgets.find((w) => w.id === widgetId)
      const queryConditions: IQueryConditions = {
        nativeQuery: false
      }
      try {
        const widgetProps: IWidgetProps = JSON.parse(widget.config)
        const { mode, selectedChart, chartStyles } = widgetProps
        if (mode === 'chart' && selectedChart === ChartTypes.Table) {
          queryConditions.nativeQuery = chartStyles.table.withNoAggregators
        }
      } catch (error) {
        message.error(error)
      }
      this.getData(
        (renderType, itemId, widget, requestParams) => {
          downloadParams.push({
            ...requestParams,
            id,
            itemId: id,
            widget
          })
        },
        'rerender',
        id,
        widgetId,
        queryConditions
      )
    })
    this.props.onInitiateDownloadTask(currentDashboard.id, DownloadTypes.Dashboard, downloadParams)
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
    queryConditions?: IQueryConditions
  ) => {
    const {
      currentItemsInfo,
      widgets
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig
    const updatedCols = cols.map((col) => widgetDimensionMigrationRecorder(col))
    const updatedRows = rows.map((row) => widgetDimensionMigrationRecorder(row))
    const customOrders = updatedCols.concat(updatedRows)
      .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
      .map(({ name, sort }) => ({ name, list: sort[FieldSortTypes.Custom].sortList }))

    const cachedQueryConditions = currentItemsInfo[itemId].queryConditions

    let tempFilters
    let linkageFilters
    let globalFilters
    let tempOrders
    let variables
    let linkageVariables
    let globalVariables
    let drillStatus
    let pagination
    let nativeQuery
    const prevDrillHistory = cachedQueryConditions.drillHistory
                            ? cachedQueryConditions.drillHistory[cachedQueryConditions.drillHistory.length - 1]
                            : {}

    if (queryConditions) {
      tempFilters = queryConditions.tempFilters !== void 0 ? queryConditions.tempFilters : cachedQueryConditions.tempFilters
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      tempOrders = queryConditions.orders !== void 0 ? queryConditions.orders : cachedQueryConditions.orders
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
      drillStatus = queryConditions.drillStatus || prevDrillHistory
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery !== void 0 ? queryConditions.nativeQuery : cachedQueryConditions.nativeQuery
    } else {
      tempFilters = cachedQueryConditions.tempFilters
      linkageFilters = cachedQueryConditions.linkageFilters
      globalFilters = cachedQueryConditions.globalFilters
      tempOrders = cachedQueryConditions.orders
      variables = cachedQueryConditions.variables
      linkageVariables = cachedQueryConditions.linkageVariables
      globalVariables = cachedQueryConditions.globalVariables
      pagination = cachedQueryConditions.pagination
      nativeQuery = cachedQueryConditions.nativeQuery
      drillStatus = prevDrillHistory
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

    const requestParamsFilters = filters.reduce((a, b) => {
      return a.concat(b.config.sqlModel)
    }, [])
    const requestParams = {
      groups,
      aggregators,
      filters: requestParamsFilters,
      tempFilters,
      linkageFilters,
      globalFilters,
      variables,
      linkageVariables,
      globalVariables,
      orders,
      cache,
      expired,
      flush: renderType === 'flush',
      pagination,
      nativeQuery,
      customOrders,
      drillStatus
    }

    if (tempOrders) {
      requestParams.orders = requestParams.orders.concat(tempOrders)
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
    const { currentItems, onEditDashboardItems, match } = this.props
    const portalId = +match.params.portalId
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

  private onBreakpointChange = () => {
    this.props.onResizeAllDashboardItem()
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
    const { match, currentDashboard, currentItems, widgets, formedViews } = this.props
    const portalId = +match.params.portalId
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
    const { match } = this.props
    const { projectId, portalId } = match.params
    this.props.history.push(`/project/${projectId}/portal/${portalId}/dashboard/${e.key}`)
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
    const {
      currentItems,
      currentLinkages,
      onMonitoredLinkageDataAction
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
    if (onMonitoredLinkageDataAction) {
      onMonitoredLinkageDataAction()
    }
  }

  private clearAllInteracts = () => {
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
      currentItems,
      onMonitoredLinkageDataAction
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
    }, () => {
      const item = currentItems.find((ci) => ci.id === itemId)
      this.getChartData('clear', itemId, item.widgetId)
    })
    if (onMonitoredLinkageDataAction) {
      onMonitoredLinkageDataAction()
    }
  }

  private toggleGlobalFilterConfig = (visible) => () => {
    this.setState({
      globalFilterConfigVisible: visible
    })
  }

  private saveFilters = (filterItems, queryMode) => {
    const {
      currentDashboard,
      onEditCurrentDashboard
    } = this.props

    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: JSON.stringify({
          ...JSON.parse(currentDashboard.config || '{}'),
          filters: filterItems,
          queryMode
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

  private globalControlSearch = (requestParamsByItem: IMapItemControlRequestParams, formValues?: object) => {
    const { currentItems, widgets, currentItemsInfo, onMonitoredSearchDataAction, onSendCurrentDashboardControlParams } = this.props
    Object.entries(requestParamsByItem).forEach(([itemId, requestParams]) => {
      const item = currentItems.find((ci) => ci.id === Number(itemId))

      if (item) {
        const widget = widgets.find((w) => w.id === item.widgetId)
        let pagination = currentItemsInfo[itemId].queryConditions.pagination
        let noAggregators = false

        try {
          const widgetProps: IWidgetProps = JSON.parse(widget.config)
          const { mode, selectedChart, chartStyles } = widgetProps
          if (mode === 'chart' && selectedChart === ChartTypes.Table) {
            if (chartStyles.table.withPaging) {
              pagination = {
                pageSize: Number(chartStyles.table.pageSize),
                ...pagination,
                pageNo: DEFAULT_TABLE_PAGE
              }
            }
            noAggregators = chartStyles.table.withNoAggregators
          }
        } catch (error) {
          message.error(error)
        }

        const { filters: globalFilters, variables: globalVariables } = requestParams
        const queryConditions = {
          ...globalFilters && { globalFilters },
          ...globalVariables && { globalVariables }
        }

        this.getChartData('rerender', Number(itemId), item.widgetId, {
          pagination,
          nativeQuery: noAggregators,
          ...queryConditions
        })
      }
    })
    if (onMonitoredSearchDataAction) {
      onMonitoredSearchDataAction()
    }
    if (onSendCurrentDashboardControlParams && formValues) {
      onSendCurrentDashboardControlParams(formValues)
    }
  }

  private visibleFullScreen = (currentChartData: ICurrentDataInFullScreenProps) => {
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
        widget,
        model
      }
    })
  }

  private openDashboardSharePanel = () => {
    const { currentDashboard, onOpenSharePanel } = this.props
    const { id, name } = currentDashboard
    onOpenSharePanel(id, 'dashboard', name)
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
    const { projectId, portalId, dashboardId } = this.props.match.params
    const editSign = [projectId, portalId, dashboardId, itemId].join(DEFAULT_SPLITER)
    sessionStorage.setItem('editWidgetFromDashboard', editSign)
    this.props.history.push(`/project/${projectId}/widget/${widgetId}`)
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
    const { itemId, groups, widgetId, sourceDataFilter, mode, col, row} = e
    const sourceDataGroup = Array.isArray(e.sourceDataGroup) ? [...(e.sourceDataGroup as Array<string>)] : []
    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired, model } = widgetConfig
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
   // let sqls = widgetConfig.filters.map((i) => i.config.sqlModel)
    let sqls = []
    widgetConfig.filters.forEach((item) => {
      sqls = sqls.concat(item.config.sqlModel)
    })
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
              const sqlType = model[attr] && model[attr]['sqlType'] ? model[attr]['sqlType'] : 'VARCHAR'
              const filterJson: IFilters = {
                name: attr,
                operator: 'in',
                type: 'filter',
                value: coustomTable[attr].map((val) => getValidColumnValue(val, sqlType)),
                sqlType
              }
              coustomTableSqls.push(filterJson)
             // coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
            }
          }
         // const drillKey = sourceDataFilter&&sourceDataFilter.length ? sourceDataFilter[sourceDataFilter.length - 1]['key'] : ''
          const drillKey = sourceDataFilter&&sourceDataFilter.length ? sourceDataFilter[sourceDataFilter.length - 1]['key'] : sourceDataGroup && sourceDataGroup.length ? sourceDataGroup.pop() : ''
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
        // todo filter
        currentCol = col && col.length ? widgetConfigCols.concat([{name: col}]) : void 0
        const sqlType = model[name] && model[name]['sqlType'] ? model[name]['sqlType'] : 'VARCHAR'
        sql = {
          name,
          operator: 'in',
          type: 'filter',
          value: filterSource.map((val) => getValidColumnValue(val, sqlType)),
          sqlType
        }
        // sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
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
            // todo filter
            const sqlType = model[attr] && model[attr]['sqlType'] ? model[attr]['sqlType'] : 'VARCHAR'
            const filterJson: IFilters = {
              name: attr,
              operator: 'in',
              type: 'filter',
              value: coustomTable[attr].map((val) => getValidColumnValue(val, sqlType)),
              sqlType
            }
            coustomTableSqls.push(filterJson)
           // coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
          }
        }
        if (Array.isArray(coustomTableSqls) && coustomTableSqls.length > 0) {
          sqls = sqls.concat(coustomTableSqls)
        }
        if (lastDrillHistory && lastDrillHistory.col && lastDrillHistory.col.length) {
          const drillKey = sourceDataFilter&&sourceDataFilter.length ? sourceDataFilter[sourceDataFilter.length - 1]['key'] : sourceDataGroup && sourceDataGroup.length ? sourceDataGroup.pop() : ''
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
        sqls = sqls.concat(lastDrillHistory.filter.sqls)
      
      } else {
        name = lastDrillHistory.groups[lastDrillHistory.groups.length - 1]
        filterSource = sourceDataFilter.map((source) => source[name])
       // sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
        const sqlType = model[name] && model[name]['sqlType'] ? model[name]['sqlType'] : 'VARCHAR'
        sql = {
          name,
          operator: 'in',
          type: 'filter',
          value: filterSource.map((val) => getValidColumnValue(val, sqlType)),
          sqlType
        }

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
    const { onDeleteDrillHistory } = this.props
    setTimeout(() => {
      if (history) {
        this.getChartData('rerender', itemId, widgetId, {
          drillStatus: history
        })
      } else {
        this.getChartData('rerender', itemId, widgetId)
      }
    }, 50)
    onDeleteDrillHistory(itemId, item)
  }

  private saveDrillPathSetting = (flag) => {
    // const { onDrillPathSetting } = this.props
    // onDrillPathSetting(currentItemId as number, flag)

    const {currentItems, match, onLoadDashboardDetail} = this.props
    const { params } = match
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
        onLoadDashboardDetail(+params.projectId, +params.portalId, +params.dashboardId)
      }
      this.hideDrillPathSettingModal()
    })
  }

  private selectChartsItems = (itemId, renderType, selectedItems) => {
    const { onSelectDashboardItemChart } = this.props
    onSelectDashboardItemChart(itemId, renderType, selectedItems)
  }

  private getCurrentDashboardCtrlParams = () => {
    const {currentDashboardControlParams, currentDashboard} = this.props
    const cid = currentDashboard && currentDashboard.id
    const cpid = currentDashboardControlParams && currentDashboardControlParams.currentDashboardId
    return cid === cpid ? currentDashboardControlParams : null
  }

  public render () {
    const {
      dashboards,
      widgets,
      currentDashboard,
      currentDashboardLoading,
      onOpenSharePanel,
      currentItems,
      currentItemsInfo,
      currentDashboardSelectOptions,
      views,
      formedViews,
      currentProject,
      currentLinkages,
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
      drillPathSettingVisible
    } = this.state
    let dashboardType: number
    if (currentDashboard) {
      dashboardType = currentDashboard.type
    }
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
      const gridEditable = hasVizEditPermission(currentProject.permission)

      currentItems.forEach((dashboardItem) => {
        const { id, x, y, width, height, widgetId, polling, frequency } = dashboardItem
        const {
          datasource,
          loading,
          shareToken,
          shareLoading,
          downloadCsvLoading,
          interactId,
          rendered,
          renderType,
          queryConditions,
          selectedItems,
          controlSelectOptions,
          errorMessage
        } = currentItemsInfo[id]
        const widget = widgets.find((w) => w.id === widgetId)
        const interacting = interactingStatus[id] || false
        const drillHistory = queryConditions.drillHistory
        const drillpathSetting = queryConditions.drillpathSetting
        const drillpathInstance = queryConditions.drillpathInstance
        const view = formedViews[widget.viewId]
        const isTrigger = currentLinkages && currentLinkages.length ? currentLinkages.map((linkage) => linkage.trigger[0]
        ).some((tr) => tr === String(id)) : false

        itemblocks.push((
          <div key={id} className={styles.authSizeTag}>
            <DashboardItem
              itemId={id}
              widgets={widgets}
              widget={widget}
              isTrigger={isTrigger}
              datasource={datasource}
              loading={loading}
              polling={polling}
              interacting={interacting}
              frequency={frequency}
              shareToken={shareToken}
              view={view}
              shareLoading={shareLoading}
              downloadCsvLoading={downloadCsvLoading}
              currentProject={currentProject}
              rendered={rendered}
              renderType={renderType}
              controlSelectOptions={controlSelectOptions}
              queryConditions={queryConditions}
              errorMessage={errorMessage}
              drillHistory={drillHistory}
              drillpathSetting={drillpathSetting}
              drillpathInstance={drillpathInstance}
              onSelectDrillHistory={this.selectDrillHistory}
              onGetChartData={this.getChartData}
              onShowEdit={this.showEditDashboardItemForm}
              onShowDrillEdit={this.showDrillDashboardItemForm}
              onDeleteDashboardItem={this.deleteItem}
              onOpenSharePanel={onOpenSharePanel}
              onDownloadCsv={this.initiateWidgetDownloadTask}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              onEditWidget={this.toWorkbench}
              onDrillData={this.dataDrill}
              onDrillPathData={this.onDrillPathData}
              onSelectChartsItems={this.selectChartsItems}
              onGetControlOptions={this.getOptions}
              selectedItems={selectedItems}
              monitoredSyncDataAction={this.props.onMonitoredSyncDataAction}
              monitoredSearchDataAction={this.props.onMonitoredSearchDataAction}
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
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={false}
          draggableHandle={`.${styles.title}`}
          useCSSTransforms={mounted}
          isDraggable={gridEditable}
          isResizable={gridEditable}
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
    
    const currentDashboardCtrlParams = this.getCurrentDashboardCtrlParams()
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
                      <Link to="">
                        {`${currentDashboard.name} `}
                      </Link>
                    </Breadcrumb.Item>
                  )
                }
              </Breadcrumb>
            </Col>
            <Toolbar
              currentProject={currentProject}
              currentDashboard={currentDashboard}
              showAddDashboardItem={this.showAddDashboardItemForm}
              onOpenSharePanel={this.openDashboardSharePanel}
              onToggleGlobalFilterVisibility={this.toggleGlobalFilterConfig}
              onToggleLinkageVisibility={this.toggleLinkageConfig}
              onDownloadDashboard={this.initiateDashboardDownloadTask}
            />
          </Row>
          <GlobalControlPanel
            currentDashboard={currentDashboard}
            currentItems={currentItems}
            onGetOptions={this.getOptions}
            mapOptions={currentDashboardSelectOptions}
            onSearch={this.globalControlSearch}
            gridCtrlParams={currentDashboardCtrlParams}
          />
        </Container.Title>
        {
          dashboardType === 1 ? (
            <Container.Body grid ref={(f) => this.containerBody = findDOMNode(f)}>
              {grids}
              <div className={styles.gridBottom} />
            </Container.Body>
          ) : (
            <Container.Body report ref={(f) => this.containerBody = findDOMNode(f)}>
              {grids}
            </Container.Body>
          )
        }
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
            currentDashboard={this.props.currentDashboard}
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
        {
          allowFullScreen
            ? <FullScreenPanel
              widgets={widgets}
              currentItems={currentItems}
              currentItemsInfo={currentItemsInfo}
              currentDashboard={currentDashboard}
              mapOptions={currentDashboardSelectOptions}
              onSearch={this.globalControlSearch}
              onGetControlOptions={this.getOptions}
              gridCtrlParams={currentDashboardCtrlParams}
              visible={allowFullScreen}
              onGetChartData={this.getChartData}
              isVisible={this.visibleFullScreen}
              chartDetail={this.state.currentDataInFullScreen}
              onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
              monitoredSearchDataAction={this.props.onMonitoredSearchDataAction}
            />
          : <div/>
        }
        <SharePanel />
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectCurrentDashboards(),
  currentDashboard: makeSelectCurrentDashboard(),
  currentDashboardLoading: makeSelectCurrentDashboardLoading(),
  currentItems: makeSelectCurrentItems(),
  currentItemsInfo: makeSelectCurrentItemsInfo(),
  currentDashboardSelectOptions: makeSelectCurrentDashboardSelectOptions(),
  currentLinkages: makeSelectCurrentLinkages(),
  currentPortal: makeSelectCurrentPortal(),
  widgets: makeSelectWidgets(),
  views: makeSelectViews(),
  formedViews: makeSelectFormedViews(),
  currentProject: makeSelectCurrentProject(),
  currentDashboardControlParams: makeSelectCurrentDashboardControlParams()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardDetail: (projectId, portalId, dashboardId) => dispatch(loadDashboardDetail(projectId, portalId, dashboardId)),
    onAddDashboardItems: (portalId, items, resolve) => dispatch(addDashboardItems(portalId, items, resolve)),
    onEditCurrentDashboard: (dashboard, resolve) => dispatch(VizActions.editCurrentDashboard(dashboard, resolve)),
    onEditDashboardItem: (portalId, item, resolve) => dispatch(editDashboardItem(portalId, item, resolve)),
    onEditDashboardItems: (portalId, items) => dispatch(editDashboardItems(portalId, items)),
    onDeleteDashboardItem: (id, resolve) => dispatch(deleteDashboardItem(id, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, requestParams, statistic) =>
                        dispatch(loadViewDataFromVizItem(renderType, itemId, viewId, requestParams, 'dashboard', statistic)),
    onLoadViewsDetail: (viewIds, resolve) => dispatch(loadViewsDetail(viewIds, resolve)),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onInitiateDownloadTask: (id, type, downloadParams?, itemId?) => dispatch(initiateDownloadTask(id, type, downloadParams, itemId)),
    onLoadSelectOptions: (controlKey, requestParams, itemId) => dispatch(loadSelectOptions(controlKey, requestParams, itemId)),
    onSetSelectOptions: (controlKey, options, itemId) => dispatch(setSelectOptions(controlKey, options, itemId)),
    onRenderDashboardItem: (itemId) => dispatch(renderDashboardItem(itemId)),
    onResizeDashboardItem: (itemId) => dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onOpenSharePanel: (id, type, title, itemId) => dispatch(openSharePanel(id, type, title, itemId)),
    onDrillDashboardItem: (itemId, drillHistory) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDrillPathSetting: (itemId, history) => dispatch(drillPathsetting(itemId, history)),
    onDeleteDrillHistory: (itemId, index) => dispatch(deleteDrillHistory(itemId, index)),
    onSelectDashboardItemChart: (itemId, renderType, selectedItems) => dispatch(selectDashboardItemChart(itemId, renderType, selectedItems)),
    onMonitoredSyncDataAction: () => dispatch(monitoredSyncDataAction()),
    onMonitoredSearchDataAction: () => dispatch(monitoredSearchDataAction()),
    onMonitoredLinkageDataAction: () => dispatch(monitoredLinkageDataAction()),
    onSendCurrentDashboardControlParams: (params: object) => dispatch(sendCurrentDashboardControlParams(params))
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
