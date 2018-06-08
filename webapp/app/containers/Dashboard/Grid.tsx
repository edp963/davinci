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
import * as classnames from 'classnames'
import * as moment from 'moment'
import { Link } from 'react-router'
import * as echarts from 'echarts/lib/echarts'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import reducerWidget from '../Widget/reducer'
import sagaWidget from '../Widget/sagas'
import reducerBizlogic from '../Bizlogic/reducer'
import sagaBizlogic from '../Bizlogic/sagas'

import Container from '../../components/Container'
import DashboardItemForm from './components/DashboardItemForm'
import Workbench from '../Widget/components/Workbench'
import DashboardItem from './components/DashboardItem'
import DashboardItemFilters from './components/DashboardItemFilters'
import SharePanel from '../../components/SharePanel'
import DashboardLinkagePanel from './components/linkage/LinkagePanel'
import GlobalFilterConfigPanel from './components/globalFilter/GlobalFilterConfigPanel'
import GlobalFilters from './components/globalFilter/GlobalFilters'
import { Responsive, WidthProvider } from 'react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Popover = require('antd/lib/popover')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import widgetlibs from '../../assets/json/widgetlib'
import FullScreenPanel from './components/fullScreenPanel/FullScreenPanel'
import { uuid } from '../../utils/util'
import {
  loadDashboards,
  loadDashboardDetail,
  addDashboardItem,
  editCurrentDashboard,
  editDashboardItem,
  editDashboardItems,
  deleteDashboardItem,
  clearCurrentDashboard,
  loadWidgetCsv
} from './actions'
import {
  makeSelectDashboards,
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentDatasources,
  makeSelectCurrentItemsLoading,
  makeSelectCurrentItemsQueryParams,
  makeSelectCurrentItemsDownloadCsvLoading,
  makeSelectCurrentDashboardShareInfo,
  makeSelectCurrentDashboardSecretInfo,
  makeSelectCurrentDashboardShareInfoLoading,
  makeSelectCurrentItemsShareInfo,
  makeSelectCurrentItemsSecretInfo,
  makeSelectCurrentItemsShareInfoLoading,
  makeSelectCurrentItemsCascadeSources,
  makeSelectCurrentDashboardCascadeSources
} from './selectors'
import { loadWidgets } from '../Widget/actions'
import { loadBizlogics, loadBizdatasFromItem, loadCascadeSourceFromItem, loadCascadeSourceFromDashboard, loadBizdataSchema } from '../Bizlogic/actions'
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { makeSelectLoginUser } from '../App/selectors'
import { echartsOptionsGenerator } from '../Widget/components/chartUtil'
import { initializePosition, changePosition, diffPosition } from './components/localPositionUtil'
import {
  DEFAULT_PRIMARY_COLOR,
  ECHARTS_RENDERER,
  SQL_NUMBER_TYPES,
  DEFAULT_SPLITER,
  ADMIN_GRID_BREAKPOINTS,
  USER_GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ITEM_MARGIN,
  GRID_ROW_HEIGHT,
  KEY_COLUMN
} from '../../globalConstants'

const utilStyles = require('../../assets/less/util.less')
const widgetStyles = require('../Widget/Widget.less')
const styles = require('./Dashboard.less')

const ResponsiveReactGridLayout = WidthProvider(Responsive)

interface IGridProps {
  dashboards: any[]
  widgets: any[]
  bizlogics: any[]
  loginUser: { id: number, admin: boolean }
  router: any
  params: any
  currentDashboard: ICurrentDashboard,
  currentDashboardLoading: boolean
  currentDashboardShareInfo: string
  currentDashboardSecretInfo: string
  currentDashboardShareInfoLoading: boolean
  currentItems: any[]
  currentDatasources: object
  currentItemsLoading: object
  currentItemsQueryParams: object
  currentItemsShareInfo: object
  currentItemsSecretInfo: object
  currentItemsShareInfoLoading: object
  currentItemsDownloadCsvLoading: object
  currentItemsCascadeSources: object
  currentDashboardCascadeSources: object
  onLoadDashboards: () => any
  onLoadDashboardDetail: (dashboardId: number) => any
  onAddDashboardItem: (item: IDashboardItem, resolve: (item: IDashboardItem) => void) => any
  onEditCurrentDashboard: (dashboard: object, resolve: () => void) => void
  onEditDashboardItem: (item: IDashboardItem, resolve: () => void) => void
  onEditDashboardItems: (item: IDashboardItem[], resolve: () => void) => void
  onDeleteDashboardItem: (id: number, resolve: () => void) => void
  onLoadWidgets: () => any
  onLoadBizlogics: () => any
  onLoadBizdatasFromItem: (
    dashboardItemId: number,
    flatTableId: number,
    sql: {
      adHoc: string
      filters: string
      linkageFilters: string
      globalFilters: string
      params: IBizdataIncomeParamObject[]
      linkageParams: IBizdataIncomeParamObject[]
      globalParams: IBizdataIncomeParamObject[]
    },
    sorts: string,
    offset: number,
    limit: number,
    useCache: string,
    expired: number
  ) => void
  onClearCurrentDashboard: () => any
  onLoadWidgetCsv: (
    itemId: number,
    token: string,
    sql: object,
    sorts?: string,
    offset?: number,
    limit?: number
  ) => void
  onLoadCascadeSourceFromItem: (
    itemId: number,
    controlId: string,
    flatTableId: number,
    sql: object,
    column: string,
    parents: object[]
  ) => any
  onLoadCascadeSourceFromDashboard: (controlId: number, id: number, column: string, parents?: object[]) => void
  onLoadBizdataSchema: () => any
}

interface IGridStates {
  mounted: boolean
  layouts: any
  localPositions: any[]
  allowFullScreen: boolean
  currentDataInFullScreen: object
  modifiedPositions: any[]
  editPositionSign: boolean
  dashboardItemFormType: string
  dashboardItemFormVisible: boolean
  dashboardItemFormStep: number
  modalLoading: boolean
  selectedWidget: number
  triggerType: string
  workbenchDashboardItem: number
  workbenchWidget: object
  workbenchVisible: boolean
  filtersVisible: boolean
  filtersDashboardItem: number
  filtersKeys: object
  filtersTypes: object
  linkagePanelVisible: boolean
  linkageTableSource: any[]
  linkageCascaderSource: any[]
  interactiveItems: object
  globalFilterConfigPanelVisible: boolean
  globalFilterTableSource: any[]
  dashboardSharePanelAuthorized: boolean
  nextMenuTitle: string
  currentItemsRendered: object
}

interface IBizdataIncomeParamObject {
  k: string
  v: string
}

interface IDashboardItemForm extends AntdFormType {
  onReset: () => void
}

interface IDashboardItem {
  id?: number
  position_x?: number
  position_y?: number
  width?: number
  length?: number
  widget_id?: number
  dashboard_id?: number
  trigger_type?: string
  trigger_params?: string
}

interface IDashboard {
  id?: number
  desc: string
  name: string
  pic: string
  config: string
  linkage_detail: string
  publish: boolean
  create_by: number,
}

interface ICurrentDashboard extends IDashboard {
  widgets: any[]
}

interface IDashboardItemFilters extends AntdFormType {
  resetTree: () => void
}

export class Grid extends React.Component<IGridProps, IGridStates> {
  constructor (props) {
    super(props)

    this.state = {
      mounted: false,
      layouts: { lg: [] },

      localPositions: [],
      allowFullScreen: false,
      currentDataInFullScreen: {},
      modifiedPositions: null,
      editPositionSign: false,

      dashboardItemFormType: '',
      dashboardItemFormVisible: false,
      dashboardItemFormStep: 0,
      modalLoading: false,
      selectedWidget: 0,
      triggerType: 'manual',

      workbenchDashboardItem: 0,
      workbenchWidget: null,
      workbenchVisible: false,

      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: null,
      filtersTypes: null,

      linkagePanelVisible: false,
      linkageTableSource: null,
      linkageCascaderSource: null,
      interactiveItems: {},

      globalFilterConfigPanelVisible: false,
      globalFilterTableSource: [],

      dashboardSharePanelAuthorized: false,

      nextMenuTitle: '',

      currentItemsRendered: null
    }
  }

  private charts: object = {}
  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: NodeJS.Timer
  private dashboardItemForm: IDashboardItemForm = null
  private dashboardItemFilters: IDashboardItemFilters = null
  private refHandles = {
    dashboardItemForm: (f) => { this.dashboardItemForm = f },
    dashboardItemFilters: (f) => { this.dashboardItemFilters = f }
  }

  private workbenchWrapper: any = null
  private containerBody: any = null
  private containerBodyScrollThrottle: boolean = false

  public componentWillMount () {
    const {
      onLoadDashboards,
      onLoadBizlogics,
      onLoadDashboardDetail,
      params,
      loginUser
    } = this.props

    if (loginUser.admin) {
      onLoadBizlogics()
    }

    onLoadDashboards()
    onLoadDashboardDetail(params.dashboardId)
  }

  public componentWillReceiveProps (nextProps) {
    const {
      loginUser,
      currentDashboard,
      currentDashboardLoading,
      currentItems,
      currentDatasources,
      params,
      widgets,
      bizlogics
    } = nextProps
    const { onLoadDashboardDetail, onLoadCascadeSourceFromDashboard } = this.props
    const { modifiedPositions, linkageCascaderSource, globalFilterTableSource } = this.state

    if (params.dashboardId !== this.props.params.dashboardId) {
      this.setState({
        nextMenuTitle: '',
        modifiedPositions: null,
        linkageCascaderSource: null
      })
      onLoadDashboardDetail(params.dashboardId)
    }

    if (!currentDashboardLoading) {
      // dashboard 加载完成或修改完成
      if (this.props.currentDashboardLoading) {
        this.setState({
          linkageTableSource: this.adjustLinkageTableSource(currentDashboard, currentItems),
          globalFilterTableSource: this.adjustGlobalFilterTableSource(currentDashboard, currentItems)
        })
        globalFilterTableSource.forEach((gft) => {
          if (gft.type === 'cascadeSelect' && !gft.parentColumn) {
            onLoadCascadeSourceFromDashboard(gft.key, gft.flatTableId, gft.cascadeColumn)
          }
        })
      }

      if (currentItems && currentItems !== this.props.currentItems) {
        const localPositions = initializePosition(loginUser, currentDashboard, currentItems)
        if (!modifiedPositions) {
          this.setState({
            modifiedPositions: localPositions.map((item) => ({...item}))
          })
        }
        this.setState({
          mounted: true,
          localPositions,
          layouts: {
            lg: localPositions.map((pos) => ({
              x: pos.x,
              y: pos.y,
              w: pos.w,
              h: pos.h,
              i: pos.i
            }))
          },
          interactiveItems: currentItems.reduce((acc, i) => {
            acc[i.id] = {
              isInteractive: false,
              interactId: null
            }
            return acc
          }, {}),
          currentItemsRendered: currentItems.reduce((acc, i) => {
            acc[i.id] = false
            return acc
          }, {})
        }, () => {
          this.lazyLoad()
          this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
          this.containerBody.addEventListener('scroll', this.lazyLoad, false)
        })
      }

      if (loginUser.admin) {
        if (currentItems && widgets && !linkageCascaderSource) {
          this.setState({
            linkageCascaderSource: currentItems.map((ci) => ({
              label: widgets.find((w) => w.id === ci.widget_id).name,
              value: ci.id,
              children: []
            }))
          })
        }

        if (currentItems &&
            bizlogics &&
            currentDatasources &&
            linkageCascaderSource) {
          const itemKeys = Object.keys(currentDatasources)

          if (itemKeys.join('') !== Object.keys(this.props.currentDatasources).join('')) {
            // 当 datasources key 不同时刷新 linkageCascaderSource
            this.refreshLinkageCascaderSource(nextProps)
          } else {
            // key 相同，引用有不同时也刷新 linkageCascaderSource
            let changeSign = false

            for (let i = 0, il = itemKeys.length; i < il; i += 1) {
              if (currentDatasources[itemKeys[i]] !== this.props.currentDatasources[itemKeys[i]]) {
                changeSign = true
                break
              }
            }

            if (changeSign) {
              this.refreshLinkageCascaderSource(nextProps)
            }
          }
        }
      }
    }
  }

  public componentDidMount () {
    window.addEventListener('resize', this.onResize, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.onResize, false)

    this.containerBody.removeEventListener('scroll', this.lazyLoad, false)

    Object.keys(this.charts).forEach((k) => {
      this.charts[k].dispose()
    })
    this.props.onClearCurrentDashboard()
  }

  private lazyLoad = () => {
    if (!this.containerBodyScrollThrottle) {
      requestAnimationFrame(() => {
        const { currentItemsRendered, modifiedPositions } = this.state

        const waitingItems = Object.entries(currentItemsRendered).filter(([id, rendered]) => !rendered)

        if (waitingItems.length) {
          waitingItems.forEach(([id]) => {
            const itemTop = this.calcItemTop(modifiedPositions.find((mp) => mp.i === id).y)
            const { offsetHeight, scrollTop } = this.containerBody

            if (itemTop - scrollTop < offsetHeight) {
              currentItemsRendered[id] = true
            }
          })

          this.setState({
            currentItemsRendered
          })
        } else {
          this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
        }
        this.containerBodyScrollThrottle = false
      })
      this.containerBodyScrollThrottle = true
    }
  }

  private calcItemTop = (y: number) => Math.round((GRID_ROW_HEIGHT + GRID_ITEM_MARGIN) * y)

  private getChartData = (renderType: string, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      widgets,
      currentItemsQueryParams,
      onLoadBizdatasFromItem
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
    const chartInstanceId = `widget_${itemId}`

    let widgetConfig = JSON.parse(widget.config)
    let currentChart = this.charts[chartInstanceId]

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      switch (renderType) {
        case 'rerender':
          if (currentChart) {
            currentChart.dispose()
          }

          currentChart = echarts.init(document.getElementById(chartInstanceId) as HTMLDivElement, 'default')
          this.charts[chartInstanceId] = currentChart       // todo  赋值 {domId: chartsInstance}
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          break
        case 'clear':
          currentChart.clear()
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          break
        case 'refresh':
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          widgetConfig = { // 点击"同步数据"按钮时强制不使用缓存
            useCache: 'false',
            expired: 0
          }
          break
        default:
          break
      }
    }

    const cachedQueryParams = currentItemsQueryParams[itemId]

    let filters
    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams
    let pagination

    if (queryParams) {
      filters = queryParams.filters !== undefined ? queryParams.filters : cachedQueryParams.filters
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== undefined ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
      pagination = queryParams.pagination || cachedQueryParams.pagination
    } else {
      filters = cachedQueryParams.filters
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
      pagination = cachedQueryParams.pagination
    }

    onLoadBizdatasFromItem(
      itemId,
      widget.flatTable_id,
      {
        adHoc: widget.adhoc_sql,
        filters,
        linkageFilters,
        globalFilters,
        params,
        linkageParams,
        globalParams
      },
      pagination.sorts,
      pagination.offset,
      pagination.limit,
      widgetConfig.useCache,
      widgetConfig.expired
    )
  }

  private renderChart = (itemId, widget, dataSource, chartInfo, interactIndex?): void => {
    const chartInstance = this.charts[`widget_${itemId}`]

    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id,
        ...JSON.parse(widget.chart_params)
      },
      interactIndex
    })
      .then((chartOptions) => {
        chartInstance.setOption(chartOptions)
        this.registerChartInteractListener(chartInstance, itemId)
        chartInstance.hideLoading()
      })
  }

  private registerChartInteractListener = (instance, itemId) => {
    instance.off('click')
    instance.on('click', (params) => {
      const linkagers = this.checkInteract(itemId)

      if (Object.keys(linkagers).length) {
        this.doInteract(itemId, linkagers, params.dataIndex)
      }
    })
  }

  private onLayoutChange = (layout) => {
    // setTimtout 中 setState 会被同步执行
    setTimeout(() => {
      const { currentItems } = this.props
      const { localPositions, modifiedPositions } = this.state

      if (modifiedPositions) {
        const newModifiedItems = changePosition(modifiedPositions, layout, (pos) => {
          const dashboardItem = currentItems.find((item) => item.id === Number(pos.i))
          const chartInstanceId = `widget_${dashboardItem.id}`
          const chartInstance = this.charts[chartInstanceId]

          if (chartInstance) {
            chartInstance.resize()
          }
        })

        this.setState({
          modifiedPositions: newModifiedItems,
          editPositionSign: diffPosition(localPositions, newModifiedItems)
        })
      }
    }, 50)
  }

  private onResize = () => {
    if (this.resizeSign === void 0) {
      clearTimeout(this.resizeSign)
    }
    this.resizeSign = setTimeout(() => {
      this.props.currentItems.forEach((ci) => {
        const chartInstance = this.charts[`widget_${ci.id}`]
        if (chartInstance) {
          chartInstance.resize()
        }
      })
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
      selectedWidget: dashboardItem.widget_id,
      triggerType: dashboardItem.trigger_type
    }, () => {
      this.dashboardItemForm.props.form.setFieldsValue({
        id: dashboardItem.id,
        trigger_type: dashboardItem.trigger_type,
        trigger_params: dashboardItem.trigger_params
      })
    })
  }

  private hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false
    })
  }

  private afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidget: 0,
      triggerType: 'manual',
      dashboardItemFormStep: 0
    })
    this.dashboardItemForm.onReset()
    this.dashboardItemForm.props.form.resetFields()
  }

  private widgetSelect = (id) => () => {
    this.setState({
      selectedWidget: id
    })
  }

  private triggerTypeSelect = (val) => {
    this.setState({
      triggerType: val
    })
  }

  private changeDashboardItemFormStep = (sign) => () => {
    this.setState({
      dashboardItemFormStep: sign
    })
  }

  private saveDashboardItem = () => {
    const { currentDashboard, currentItems, widgets } = this.props
    const { modifiedPositions, selectedWidget, dashboardItemFormType, linkageCascaderSource } = this.state

    const formdata: IDashboardItem = this.dashboardItemForm.props.form.getFieldsValue()

    const predictPosYArr = modifiedPositions.map((wi) => wi.y + wi.h)

    const newItem = {
      widget_id: selectedWidget,
      dashboard_id: currentDashboard.id,
      trigger_type: formdata.trigger_type,
      trigger_params: `${formdata.trigger_params}`
    }

    this.setState({ modalLoading: true })

    if (dashboardItemFormType === 'add') {
      const positionInfo = {
        position_x: 0,
        position_y: predictPosYArr.length ? Math.max(...predictPosYArr) : 0,
        width: 4,
        length: 4
      }

      this.props.onAddDashboardItem({...newItem, ...positionInfo}, (dashboardItem) => {
        modifiedPositions.push({
          x: dashboardItem.position_x,
          y: dashboardItem.position_y,
          w: dashboardItem.width,
          h: dashboardItem.length,
          i: `${dashboardItem.id}`
        })
        linkageCascaderSource.push({
          label: widgets.find((w) => w.id === dashboardItem.widget_id).name,
          value: dashboardItem.id,
          children: []
        })
        this.hideDashboardItemForm()
      })
    } else {
      const dashboardItem = currentItems.find((item) => item.id === Number(formdata.id))
      const modifiedDashboardItem = {...dashboardItem, ...newItem}

      this.props.onEditDashboardItem(modifiedDashboardItem, () => {
        this.getChartData('rerender', modifiedDashboardItem.id, modifiedDashboardItem.widget_id)
        this.hideDashboardItemForm()
      })
    }
  }

  private editDashboardItemPositions = () => {
    const {
      loginUser,
      currentDashboard,
      currentItems,
      onEditDashboardItems
    } = this.props
    const { modifiedPositions } = this.state

    const changedItems = currentItems.map((item, index) => {
      const modifiedItem = modifiedPositions[index]
      return {
        ...item,
        dashboard_id: currentDashboard.id,
        position_x: modifiedItem.x,
        position_y: modifiedItem.y,
        width: modifiedItem.w,
        length: modifiedItem.h
      }
    })

    if (loginUser.admin) {
      onEditDashboardItems(changedItems, () => {
        this.setState({ editPositionSign: false })
      })
    } else {
      localStorage.setItem(`${loginUser.id}_${currentDashboard.id}_position`, JSON.stringify(modifiedPositions))
      this.setState({ editPositionSign: false })
    }
  }

  private deleteItem = (id) => () => {
    this.props.onDeleteDashboardItem(id, () => {
      const { modifiedPositions, linkageCascaderSource, linkageTableSource, globalFilterTableSource } = this.state
      this.setState({
        modifiedPositions: modifiedPositions.filter((mi) => Number(mi.i) !== id),
        linkageCascaderSource: linkageCascaderSource.filter((lcs) => lcs.value !== id),
        linkageTableSource: linkageTableSource.filter((lts) => lts.linkager[0] !== id && lts.trigger[0] !== id),
        globalFilterTableSource: globalFilterTableSource.map((gfts) => {
          delete gfts.relatedItems[id]
          return gfts
        })
      })
      if (this.charts[`widget_${id}`]) {
        this.charts[`widget_${id}`].dispose()
      }
    })
  }

  private showWorkbench = (itemId, widget) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)

    this.setState({
      workbenchDashboardItem: dashboardItem.id,
      workbenchWidget: widget,
      workbenchVisible: true
    })
  }

  private hideWorkbench = () => {
    this.setState({
      workbenchDashboardItem: 0,
      workbenchWidget: null,
      workbenchVisible: false
    })
  }

  private afterWorkbenchModalClose = () => {
    this.workbenchWrapper.getWrappedInstance().resetWorkbench()
  }

  private onWorkbenchClose = () => {
    const dashboardItem = this.props.currentItems.find((item) => item.id === this.state.workbenchDashboardItem)
    this.getChartData('rerender', dashboardItem.id, dashboardItem.widget_id)
    this.hideWorkbench()
  }

  private showFiltersForm = (itemId, keys, types) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)

    this.setState({
      filtersVisible: true,
      filtersDashboardItem: dashboardItem.id,
      filtersKeys: keys,
      filtersTypes: types
    })
  }

  private hideFiltersForm = () => {
    this.setState({
      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: [],
      filtersTypes: []
    })
    this.dashboardItemFilters.resetTree()
  }

  private doFilterQuery = (sql) => {
    const itemId = this.state.filtersDashboardItem
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)

    this.getChartData('clear', itemId, dashboardItem.widget_id, {
      filters: sql
    })
    this.hideFiltersForm()
  }

  private downloadCsv = (itemId) => (token) => {
    const {
      currentItems,
      widgets,
      currentItemsQueryParams,
      onLoadWidgetCsv
    } = this.props

    const dashboardItem = currentItems.find((c) => c.id === itemId)
    const widget = widgets.find((w) => w.id === dashboardItem.widget_id)

    const { filters, params } = currentItemsQueryParams[itemId]

    onLoadWidgetCsv(
      itemId,
      token,
      {
        adHoc: widget.adhoc_sql,
        manualFilters: filters,
        params
      }
    )
  }

  private navDropdownClick = (e) => {
    this.props.router.push(`/report/dashboard/${e.key}`)
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

  private showLinkagePanel = () => {
    this.setState({
      linkagePanelVisible: true
    })
  }

  private hideLinkagePanel = () => {
    this.setState({
      linkagePanelVisible: false
    })
  }

  private afterLinkagePanelClose = () => {
    const { currentDashboard, currentItems } = this.props
    this.setState({
      linkageTableSource: this.adjustLinkageTableSource(currentDashboard, currentItems)
    })
  }

  private addToLinkageTable = (formValues) => {
    this.setState({
      linkageTableSource: this.state.linkageTableSource.concat({
        ...formValues,
        key: uuid(8, 16)
      })
    })
  }

  private saveLinkageConditions = () => {
    // todo
    const {
      currentDashboard,
      currentItems,
      widgets,
      currentDatasources,
      onEditCurrentDashboard
    } = this.props

    const { interactiveItems, linkageTableSource } = this.state

    Object.keys(interactiveItems).forEach((itemId) => {
      if (interactiveItems[itemId].isInteractive) {
        const triggerItem = currentItems.find((ci) => `${ci.id}` === itemId)
        const triggerWidget = widgets.find((w) => w.id === triggerItem.widget_id)
        const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
        const dataSource = currentDatasources[itemId].dataSource

        if (chartInfo.renderer === ECHARTS_RENDERER) {
          this.renderChart(itemId, triggerWidget, dataSource, chartInfo)
        }

        interactiveItems[itemId] = {
          isInteractive: false,
          interactId: null
        }
      }
    })

    Object.keys(this.interactCallbacks).map((triggerId) => {
      const triggerCallbacks = this.interactCallbacks[triggerId]

      Object.keys(triggerCallbacks).map((linkagerId) => {
        triggerCallbacks[linkagerId]()
      })
    })
    // 由于新的配置和之前可能有很大不同，因此需要遍历 GridItem 来重新注册事件
    currentItems.forEach((ci) => {
      const triggerIntance = this.charts[`widget_${ci.id}`]

      if (triggerIntance) {
        this.registerChartInteractListener(triggerIntance, ci.id)
      }
    })
    onEditCurrentDashboard(
      {
        ...currentDashboard,
        linkage_detail: JSON.stringify(linkageTableSource),
        // FIXME
        active: true
      },
      () => {
        this.hideLinkagePanel()
      }
    )
  }

  private deleteLinkageCondition = (key) => () => {
    this.setState({
      linkageTableSource: this.state.linkageTableSource.filter((lt) => lt.key !== key)
    })
  }

  private refreshLinkageCascaderSource = (props) => {
    const { currentItems, widgets, bizlogics, currentDatasources } = props

    Object.keys(currentDatasources).forEach((k) => {
      const dashboardItem = currentItems.find((ci) => `${ci.id}` === k)
      const widget = widgets.find((w) => w.id === dashboardItem.widget_id)
      const flattable = bizlogics.find((bl) => bl.id === widget.flatTable_id)
      const variableArr = flattable.sql_tmpl.match(/query@var\s\$\w+\$/g) || []

      // Cascader value 中带有 itemId、字段类型、参数/变量标识 这些信息，用 DEFAULT_SPLITER 分隔
      const params = currentDatasources[k].keys.map((pk, index) => ({
        label: `${pk}`,
        value: `${pk}${DEFAULT_SPLITER}${currentDatasources[k].types[index]}${DEFAULT_SPLITER}parameter`
      }))

      const variables = variableArr.map((va) => {
        const val = va.substring(va.indexOf('$') + 1, va.lastIndexOf('$'))
        return {
          label: `${val}[变量]`,
          value: `${val}${DEFAULT_SPLITER}variable`
        }
      })

      const sourceItem = this.state.linkageCascaderSource.find((ld) => `${ld.value}` === k)
      sourceItem.label = widget.name
      sourceItem.children = params.concat(variables)
    })
  }

  private checkInteract = (itemId) => {
    const { currentItems, widgets } = this.props
    const { linkageTableSource } = this.state
    const dashboardItem = currentItems.find((ci) => ci.id === itemId)
    const widget = widgets.find((w) => w.id === dashboardItem.widget_id)
    const widgetlib = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)

    const linkagers = {}

    linkageTableSource.forEach((lts) => {
      const { trigger, linkager, relation } = lts

      const triggerId = trigger[0]
      const linkagerId = linkager[0]

      if (itemId === triggerId) {
        if (widgetlib.renderer === ECHARTS_RENDERER && !this.charts[`widget_${triggerId}`]) {
          return false
        }

        const triggerValueInfo = trigger[1].split(DEFAULT_SPLITER)
        const linkagerValueInfo = linkager[1].split(DEFAULT_SPLITER)

        if (!linkagers[linkagerId]) {
          linkagers[linkagerId] = []
        }

        linkagers[linkagerId].push({
          triggerValue: triggerValueInfo[0],
          triggerValueType: triggerValueInfo[1],
          linkagerValue: linkagerValueInfo[0],
          linkagerType: linkagerValueInfo[2],
          linkagerId,
          relation
        })
      }
    })

    return linkagers
  }

  private doInteract = (itemId, linkagers, interactIndexOrId) => {
    const {
      currentItems,
      widgets,
      currentDatasources
    } = this.props

    const triggerItem = currentItems.find((ci) => ci.id === itemId)
    const triggerWidget = widgets.find((w) => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
    const dataSource = currentDatasources[itemId].dataSource
    let triggeringData

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      triggeringData = dataSource[interactIndexOrId]
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo, interactIndexOrId)
    } else {
      triggeringData = dataSource.find((ds) => ds[KEY_COLUMN] === interactIndexOrId)
    }

    this.setState({
      interactiveItems: {
        ...this.state.interactiveItems,
        [itemId]: {
          isInteractive: true,
          interactId: `${interactIndexOrId}`
        }
      }
    })

    Object.keys(linkagers).forEach((key) => {
      const linkager = linkagers[key]

      const linkageFilters = []
      const linkageParams = []
      let linkagerId
      // 合并单个 linkager 所接收的数据
      linkager.forEach((lr) => {
        linkagerId = lr.linkagerId

        const {
          triggerValue,
          triggerValueType,
          linkagerValue,
          linkagerType,
          relation
        } = lr

        const interactValue = SQL_NUMBER_TYPES.indexOf(triggerValueType) >= 0
          ? triggeringData[triggerValue]
          : `'${triggeringData[triggerValue]}'`

        if (linkagerType === 'parameter') {
          linkageFilters.push(`${linkagerValue} ${relation} ${interactValue}`)
        } else {
          linkageParams.push({
            k: linkagerValue,
            v: interactValue
          })
        }
      })

      const linkagerItem = currentItems.find((ci) => ci.id === linkagerId)
      const alreadyInUseFiltersAndParams = this.interactingLinkagers[linkagerId]
      /*
       * 多个 trigger 联动同一个 linkager
       * interactingLinkagers 是个临时数据存储，且不触发render
       */
      if (alreadyInUseFiltersAndParams) {
        const { filters, params } = alreadyInUseFiltersAndParams
        const mergedFilters = linkageFilters.length ? { ...filters, [itemId]: linkageFilters } : filters
        const mergedParams = linkageParams.length ? { ...params, [itemId]: linkageParams } : params

        this.getChartData('clear', linkagerId, linkagerItem.widget_id, {
          linkageFilters: Object.values(mergedFilters)
            .reduce((arr: any[], val: any[]): any => arr.concat(...val), [])
            .join(' and '),
          linkageParams: Object.values(mergedParams).reduce((arr: any[], val: any[]) => arr.concat(...val), [])
        })

        this.interactingLinkagers[linkagerId] = {
          filters: mergedFilters,
          params: mergedParams
        }
      } else {
        this.getChartData('clear', linkagerId, linkagerItem.widget_id, {
          linkageFilters: linkageFilters.join(' and '),
          linkageParams
        })

        this.interactingLinkagers[linkagerId] = {
          filters: linkageFilters.length ? {[itemId]: linkageFilters} : {},
          params: linkageParams.length ? {[itemId]: linkageParams} : {}
        }
      }

      if (!this.interactCallbacks[itemId]) {
        this.interactCallbacks[itemId] = {}
      }

      if (!this.interactCallbacks[itemId][linkagerId]) {
        this.interactCallbacks[itemId][linkagerId] = () => {
          const { filters, params } = this.interactingLinkagers[linkagerId]

          delete filters[itemId]
          delete params[itemId]

          this.getChartData('clear', linkagerId, linkagerItem.widget_id, {
            linkageFilters: Object.values(filters)
              .reduce((arr: any[], val: any[]): any => arr.concat(...val), [])
              .join(' and '),
            linkageParams: Object.values(params).reduce((arr: any[], val: any[]) => arr.concat(...val), [])
          })
        }
      }
    })
  }

  private turnOffInteract = (itemId) => () => {
    const {
      currentItems,
      widgets,
      currentDatasources
    } = this.props

    const triggerItem = currentItems.find((ci) => ci.id === itemId)
    const triggerWidget = widgets.find((w) => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
    const dataSource = currentDatasources[itemId].dataSource

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo)
    }

    this.setState({
      interactiveItems: {
        ...this.state.interactiveItems,
        [itemId]: {
          isInteractive: false,
          interactId: ''
        }
      }
    })

    Object.keys(this.interactCallbacks[itemId]).map((linkagerId) => {
      this.interactCallbacks[itemId][linkagerId]()
      delete this.interactCallbacks[itemId][linkagerId]
    })
  }

  private showGlobalFilterConfigPanel = () => {
    this.setState({
      globalFilterConfigPanelVisible: true
    })
  }

  private hideGlobalFilterConfigPanel = () => {
    this.setState({
      globalFilterConfigPanelVisible: false
    })
  }

  private afterGlobalFilterConfigPanelClose = () => {
    const { currentDashboard, currentItems } = this.props
    this.setState({
      globalFilterTableSource: this.adjustGlobalFilterTableSource(currentDashboard, currentItems)
    })
  }

  private saveToGlobalFilterTable = (formValues) => {
    const { globalFilterTableSource } = this.state

    if (formValues.key) {
      globalFilterTableSource.splice(globalFilterTableSource.findIndex((gfts) => gfts.key === formValues.key), 1, formValues)
    } else {
      globalFilterTableSource.push({
        ...formValues,
        key: uuid(8, 16)
      })
    }

    this.setState({
      globalFilterTableSource: globalFilterTableSource.slice()
    })
  }

  private deleteFromGlobalFilterTable = (key) => () => {
    this.setState({
      globalFilterTableSource: this.state.globalFilterTableSource.filter((gfts) => gfts.key !== key)
    })
  }

  private saveGlobalFilters = () => {
    const {
      currentDashboard,
      onEditCurrentDashboard
    } = this.props

    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: JSON.stringify({
          ...JSON.parse(currentDashboard.config),
          globalFilters: this.state.globalFilterTableSource
        }),
        // FIXME
        active: true
      },
      () => {
        this.hideGlobalFilterConfigPanel()
      }
    )
  }

  private globalFilterChange = (filter) => (formValue) => {
    const { currentItems } = this.props
    const { key, type, relatedItems } = filter

    Object.keys(relatedItems).forEach((itemId) => {
      const columnAndType = relatedItems[itemId].split(DEFAULT_SPLITER)
      const isParam = !columnAndType[1]  // 变量type为空
      const item = currentItems.find((ci) => ci.id === Number(itemId))

      if (!this.interactGlobalFilters[itemId]) {
        this.interactGlobalFilters[itemId] = {}
      }

      if (isParam) {
        const paramsOnThisItem = this.interactGlobalFilters[itemId].params || {}

        let currentParam

        switch (type) {
          case 'numberRange':
            if (formValue[0] || formValue[1]) {
              currentParam = formValue.map((fv) => ({
                k: columnAndType[0],
                v: fv
              }))
            }
            break
          case 'select':
          case 'cascadeSelect':
            if (formValue) {
              currentParam = [{
                k: columnAndType[0],
                v: `${formValue}`
              }]
            }
            break
          case 'multiSelect':
            if (formValue.length) {
              currentParam = formValue.map((fv) => ({
                k: columnAndType[0],
                v: `${fv}`
              }))
            }
            break
          case 'date':
            if (formValue) {
              currentParam = {
                k: columnAndType[0],
                v: `'${moment(formValue).format('YYYY-MM-DD')}'`
              }
            }
            break
          case 'datetime':
            if (formValue) {
              currentParam = {
                k: columnAndType[0],
                v: `'${moment(formValue).format('YYYY-MM-DD HH:mm:ss')}'`
              }
            }
            break
          case 'multiDate':
            if (formValue) {
              currentParam = formValue.split(',').map((fv) => ({
                k: columnAndType[0],
                v: `'${fv}'`
              }))
            }
            break
          case 'dateRange':
            if (formValue.length) {
              currentParam = formValue.map((fv) => ({
                k: columnAndType[0],
                v: `'${moment(fv).format('YYYY-MM-DD')}'`
              }))
            }
            break
          case 'datetimeRange':
            if (formValue.length) {
              currentParam = formValue.map((fv) => ({
                k: columnAndType[0],
                v: `'${moment(fv).format('YYYY-MM-DD HH:mm:ss')}'`
              }))
            }
            break
          default:
            const val = formValue.target.value.trim()
            if (val) {
              currentParam = {
                k: columnAndType[0],
                v: `${val}`
              }
            }
            break
        }

        if (currentParam) {
          paramsOnThisItem[key] = currentParam
          this.interactGlobalFilters[itemId].params = paramsOnThisItem
        } else {
          delete paramsOnThisItem[key]
        }
      } else {
        const filtersOnThisItem = this.interactGlobalFilters[itemId].filters || {}

        let currentFilter

        switch (type) {
          case 'numberRange':
            const numberFilters = []
            if (formValue[0]) {
              numberFilters.push(`${columnAndType[0]} >= ${getValidValue(formValue[0], columnAndType[1])}`)
            }
            if (formValue[1]) {
              numberFilters.push(`${columnAndType[0]} <= ${getValidValue(formValue[1], columnAndType[1])}`)
            }
            if (numberFilters.length) {
              currentFilter = numberFilters.join(` and `)
            }
            break
          case 'select':
            if (formValue) {
              currentFilter = `${columnAndType[0]} = ${formValue}`
            }
            break
          case 'cascadeSelect':
            if (formValue) {
              currentFilter = `${columnAndType[0]} = ${getValidValue(formValue, columnAndType[1])}`
            }
            break
          case 'multiSelect':
            if (formValue.length) {
              currentFilter = formValue.map((val) => `${columnAndType[0]} = ${val}`).join(` and `)
            }
            break
          case 'date':
            if (formValue) {
              currentFilter = `${columnAndType[0]} = ${getValidValue(moment(formValue).format('YYYY-MM-DD'), columnAndType[1])}`
            }
            break
          case 'datetime':
            if (formValue) {
              currentFilter = `${columnAndType[0]} = ${getValidValue(moment(formValue).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])}`
            }
            break
          case 'multiDate':
            if (formValue) {
              currentFilter = formValue.split(',').map((val) => `${columnAndType[0]} = ${getValidValue(val, columnAndType[1])}`).join(` and `)
            }
            break
          case 'dateRange':
            if (formValue.length) {
              const clauses = [
                `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD'), columnAndType[1])}`,
                `${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD'), columnAndType[1])}`
              ]
              currentFilter = clauses.join(' and ')
            }
            break
          case 'datetimeRange':
            if (formValue.length) {
              const clauses = [
                `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])}`,
                `${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])}`
              ]
              currentFilter = clauses.join(' and ')
            }
            break
          default:
            const inputValue = formValue.target.value.trim()
            if (inputValue) {
              currentFilter = `${columnAndType[0]} = ${getValidValue(inputValue, columnAndType[1])}`
            }
            break
        }

        if (currentFilter) {
          filtersOnThisItem[key] = currentFilter
          this.interactGlobalFilters[itemId].filters = filtersOnThisItem
        } else {
          delete filtersOnThisItem[key]
        }
      }

      this.getChartData('rerender', Number(itemId), item.widget_id, {
        globalFilters: this.interactGlobalFilters[itemId].filters
          ? Object.values(this.interactGlobalFilters[itemId].filters).join(` and `)
          : '',
        globalParams: this.interactGlobalFilters[itemId].params
          ? Object.values(this.interactGlobalFilters[itemId].params).reduce((arr: any[], val) => arr.concat(val), [])
          : []
      })
    })

    function getValidValue (val, type) {
      return SQL_NUMBER_TYPES.indexOf(type) >= 0 ? val : `'${val}'`
    }
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
    const {currentItems, currentDatasources, currentItemsLoading, widgets} = this.props
    const { modifiedPositions } = this.state
    const item = currentItems.find((ci) => ci.id === id)
    const modifiedPosition = modifiedPositions[currentItems.indexOf(item)]
    const widget = widgets.find((w) => w.id === item.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
    const data = currentDatasources[id]
    const loading = currentItemsLoading[id]
    this.setState({
      currentDataInFullScreen: {
        w: modifiedPosition ? modifiedPosition.w : 0,
        h: modifiedPosition ? modifiedPosition.h : 0,
        itemId: id,
        widgetId: widget.id,
        widget,
        chartInfo,
        data,
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
    const widget = widgets.find((w) => w.id === dashboardItem.widget_id)
    const widgetlib = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
    return {
      name: widget.name,
      type: widgetlib.name
    }
  }

  private getCascadeSource = (sql) => (itemId, controlId, flatTableId, column, parents) => {
    this.props.onLoadCascadeSourceFromItem(itemId, controlId, flatTableId, sql, column, parents)
  }

  private adjustLinkageTableSource = (currentDashboard, currentItems) => {
    const { linkage_detail } = currentDashboard
    const linkageTableSource = JSON.parse(linkage_detail)

    return linkageTableSource.filter((lts) => {
      let linkagerSign = false
      let triggerSign = false

      for (let i = 0, cl = currentItems.length; i < cl; i += 1) {
        if (currentItems[i].id === lts.linkager[0]) {
          linkagerSign = true
        }
        if (currentItems[i].id === lts.trigger[0]) {
          triggerSign = true
        }
      }

      return linkagerSign && triggerSign
    })
  }

  private adjustGlobalFilterTableSource = (currentDashboard, currentItems) => {
    const { config } = currentDashboard
    const globalFilterTableSource = JSON.parse(config).globalFilters || []

    return globalFilterTableSource.map((gfts) => {
      const deprecatedItems = Object.keys(gfts.relatedItems).filter((key) => !currentItems.find((ci) => ci.id === Number(key)))
      deprecatedItems.forEach((di) => {
        delete gfts.relatedItems[di]
      })
      return gfts
    })
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
      currentDatasources,
      currentItemsLoading,
      currentItemsShareInfo,
      currentItemsSecretInfo,
      currentItemsShareInfoLoading,
      currentItemsDownloadCsvLoading,
      currentItemsQueryParams,
      currentItemsCascadeSources,
      currentDashboardCascadeSources,
      loginUser,
      bizlogics,
      onLoadBizdataSchema,
      onLoadCascadeSourceFromDashboard
    } = this.props

    const {
      mounted,
      layouts,
      localPositions,
      modifiedPositions,
      dashboardItemFormType,
      dashboardItemFormVisible,
      modalLoading,
      selectedWidget,
      triggerType,
      dashboardItemFormStep,
      editPositionSign,
      workbenchWidget,
      workbenchVisible,
      filtersVisible,
      filtersDashboardItem,
      filtersKeys,
      filtersTypes,
      linkagePanelVisible,
      linkageCascaderSource,
      linkageTableSource,
      globalFilterConfigPanelVisible,
      globalFilterTableSource,
      interactiveItems,
      allowFullScreen,
      dashboardSharePanelAuthorized,
      currentItemsRendered
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
      const currentWidgets = currentDashboard.widgets
      const navDropdownItems = currentWidgets.map((d) => (
        <Menu.Item key={d.id} widgetId={d.widget_id}>
          {d.widget_id ? (widgets.find((widget) => widget.id === d.widget_id))['name'] : ''}
        </Menu.Item>
      ))
      nextNavDropdown = (
        <Menu onClick={this.nextNavDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    if (widgets) {
      const itemblocks = []

      localPositions.forEach((pos, index) => {
        const dashboardItem = currentItems[index]
        const itemId = dashboardItem.id
        const modifiedPosition = modifiedPositions[index]
        const widget = widgets.find((w) => w.id === dashboardItem.widget_id)
        const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
        const data = currentDatasources[itemId]
        const loading = currentItemsLoading[itemId]
        const shareInfo = currentItemsShareInfo[itemId]
        const secretInfo = currentItemsSecretInfo[itemId]
        const shareInfoLoading = currentItemsShareInfoLoading[itemId]
        const downloadCsvLoading = currentItemsDownloadCsvLoading[itemId]
        const sql = currentItemsQueryParams[itemId]
        const cascadeSources = currentItemsCascadeSources[itemId]
        const { isInteractive, interactId } = interactiveItems[itemId]
        const rendered = currentItemsRendered[itemId]
        // isReadOnly 非原创用户不能对 widget进行写的操作
        const isReadOnly = (widget['create_by'] === loginUser.id)
        const permission = dashboardItem['permission']
        const isShare = permission.indexOf('share') > -1
        const isDownload = permission.indexOf('download') > -1
        itemblocks.push((
          <div key={pos.i}>
            <DashboardItem
              ref={(f) => this[`dashboardItem${itemId}`] = f}
              w={modifiedPosition ? modifiedPosition.w : 0}
              h={modifiedPosition ? modifiedPosition.h : 0}
              itemId={itemId}
              widget={widget}
              chartInfo={chartInfo}
              data={data}
              loading={loading}
              triggerType={dashboardItem.trigger_type}
              triggerParams={dashboardItem.trigger_params}
              isAdmin={loginUser.admin}
              isShared={false}
              isShare={isShare}
              isDownload={isDownload}
              shareInfo={shareInfo}
              secretInfo={secretInfo}
              shareInfoLoading={shareInfoLoading}
              downloadCsvLoading={downloadCsvLoading}
              isInteractive={isInteractive}
              interactId={interactId}
              cascadeSources={cascadeSources}
              onGetChartData={this.getChartData}
              onRenderChart={this.renderChart}
              onShowEdit={this.showEditDashboardItemForm}
              onShowWorkbench={this.showWorkbench}
              onShowFiltersForm={this.showFiltersForm}
              onDeleteDashboardItem={this.deleteItem}
              onDownloadCsv={this.downloadCsv}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              onGetCascadeSource={this.getCascadeSource({...sql, adHoc: widget.adhoc_sql})}
              isReadOnly={isReadOnly}
              rendered={rendered}
            />
          </div>
        ))
      })
      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-14px'}}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_ITEM_MARGIN, GRID_ITEM_MARGIN]}
          breakpoints={loginUser.admin ? ADMIN_GRID_BREAKPOINTS : USER_GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          draggableHandle={`.${styles.title}`}
          useCSSTransforms={mounted}
        >
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
    }

    const modalButtons = dashboardItemFormStep
      ? [(
        <Button
          key="back"
          size="large"
          onClick={this.changeDashboardItemFormStep(0)}
        >
          上一步
        </Button>
      ), (
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
      )]
      : [(
        <Button
          key="forward"
          size="large"
          type="primary"
          disabled={!selectedWidget}
          onClick={this.changeDashboardItemFormStep(1)}
        >
          下一步
        </Button>
      )]

    const linkageModalButtons = [(
      <Button
        key="cancel"
        size="large"
        onClick={this.hideLinkagePanel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={currentDashboardLoading}
        disabled={currentDashboardLoading}
        onClick={this.saveLinkageConditions}
      >
        保 存
      </Button>
    )]

    const globalFilterConfigModalButtons = [(
      <Button
        key="cancel"
        size="large"
        onClick={this.hideGlobalFilterConfigPanel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={currentDashboardLoading}
        disabled={currentDashboardLoading}
        onClick={this.saveGlobalFilters}
      >
        保 存
      </Button>
    )]

    let savePosButton = void 0
    let addButton = void 0
    let shareButton = void 0
    let linkageButton = void 0
    let globalFilterButton = void 0
    const isOwner = currentDashboard && loginUser.id === currentDashboard.create_by

    if (isOwner && editPositionSign) {
      savePosButton = (
        <Tooltip placement="bottom" title="保存位置修改">
          <Button
            size="large"
            icon="save"
            onClick={this.editDashboardItemPositions}
          />
        </Tooltip>
      )
    }

    if (isOwner && loginUser.admin) {
      addButton = (
        <Tooltip placement="bottom" title="新增">
          <Button
            size="large"
            type="primary"
            icon="plus"
            style={{marginLeft: '8px'}}
            onClick={this.showAddDashboardItemForm}
          />
        </Tooltip>
      )

      shareButton = currentDashboard
        ? (
          <Popover
            placement="bottomRight"
            content={
              <SharePanel
                id={currentDashboard.id}
                shareInfo={currentDashboardShareInfo}
                secretInfo={currentDashboardSecretInfo}
                shareInfoLoading={currentDashboardShareInfoLoading}
                authorized={dashboardSharePanelAuthorized}
                afterAuthorization={this.changeDashboardSharePanelAuthorizeState(true)}
                type="dashboard"
              />
            }
            trigger="click"
          >
            <Tooltip placement="bottom" title="分享">
              <Button
                size="large"
                type="primary"
                icon="share-alt"
                style={{marginLeft: '8px'}}
                onClick={this.changeDashboardSharePanelAuthorizeState(false)}
              />
            </Tooltip>
          </Popover>
        )
        : ''

      linkageButton = currentDashboard
        ? (
          <Tooltip placement="bottom" title="联动关系配置">
            <Button
              size="large"
              type="primary"
              icon="link"
              style={{marginLeft: '8px'}}
              onClick={this.showLinkagePanel}
            />
          </Tooltip>
        )
        : ''

      globalFilterButton = currentDashboard
        ? (
          <Tooltip placement="bottomRight" title="全局筛选器配置">
            <Button
              size="large"
              type="primary"
              icon="filter"
              style={{marginLeft: '8px'}}
              onClick={this.showGlobalFilterConfigPanel}
            />
          </Tooltip>
        )
        : ''
    }

    const globalFilterContainerClass = classnames({
      [utilStyles.hide]: !globalFilterTableSource.length
    })

    return (
      <Container>
        <Helmet title={currentDashboard && currentDashboard.name} />
        <Container.Title>
          <Row>
            <Col sm={12}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="/report/dashboards">
                    Dashboard
                  </Link>
                </Breadcrumb.Item>
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
            <Col sm={12} className={utilStyles.textAlignRight}>
              {savePosButton}
              {addButton}
              {shareButton}
              {linkageButton}
              {globalFilterButton}
            </Col>
          </Row>
          <Row className={globalFilterContainerClass}>
            <Col span={24}>
              <GlobalFilters
                filters={globalFilterTableSource}
                cascadeSources={currentDashboardCascadeSources || {}}
                onChange={this.globalFilterChange}
                onCascadeSelectChange={onLoadCascadeSourceFromDashboard}
              />
            </Col>
          </Row>
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
            loginUser={loginUser}
            widgets={widgets || []}
            selectedWidget={selectedWidget}
            triggerType={triggerType}
            step={dashboardItemFormStep}
            onWidgetSelect={this.widgetSelect}
            onTriggerTypeSelect={this.triggerTypeSelect}
            wrappedComponentRef={this.refHandles.dashboardItemForm}
          />
        </Modal>
        <Modal
          title="Widget 详情"
          wrapClassName={`ant-modal-xlarge ${widgetStyles.workbenchWrapper}`}
          visible={workbenchVisible}
          onCancel={this.hideWorkbench}
          afterClose={this.afterWorkbenchModalClose}
          footer={false}
          maskClosable={false}
        >
          <Workbench
            type={workbenchVisible ? 'edit' : ''}
            widget={workbenchWidget}
            bizlogics={bizlogics || []}
            widgetlibs={widgetlibs}
            onAfterSave={this.onWorkbenchClose}
            ref={(f) => { this.workbenchWrapper = f }}
          />
        </Modal>
        <Modal
          title="条件查询"
          wrapClassName="ant-modal-xlarge"
          visible={filtersVisible}
          onCancel={this.hideFiltersForm}
          footer={false}
        >
          <DashboardItemFilters
            loginUser={loginUser}
            itemId={filtersDashboardItem}
            keys={filtersKeys}
            types={filtersTypes}
            onQuery={this.doFilterQuery}
            wrappedComponentRef={this.refHandles.dashboardItemFilters}
          />
        </Modal>
        <Modal
          title="联动关系配置"
          wrapClassName="ant-modal-large"
          visible={linkagePanelVisible}
          onCancel={this.hideLinkagePanel}
          footer={linkageModalButtons}
          afterClose={this.afterLinkagePanelClose}
        >
          <DashboardLinkagePanel
            cascaderSource={linkageCascaderSource || []}
            tableSource={linkageTableSource || []}
            onAddToTable={this.addToLinkageTable}
            onDeleteFromTable={this.deleteLinkageCondition}
            onGetWidgetInfo={this.getWidgetInfo}
          />
        </Modal>
        <Modal
          title="全局筛选配置"
          visible={globalFilterConfigPanelVisible}
          onCancel={this.hideGlobalFilterConfigPanel}
          footer={globalFilterConfigModalButtons}
          afterClose={this.afterGlobalFilterConfigPanelClose}
        >
          <GlobalFilterConfigPanel
            items={currentItems || []}
            widgets={widgets || []}
            bizlogics={bizlogics || []}
            dataSources={currentDatasources || {}}
            tableSource={globalFilterTableSource}
            onSaveToTable={this.saveToGlobalFilterTable}
            onDeleteFromTable={this.deleteFromGlobalFilterTable}
            onLoadBizdataSchema={onLoadBizdataSchema}
          />
        </Modal>
        <FullScreenPanel
          widgets={widgets}
          widgetlibs={widgetlibs}
          currentDashboard={currentDashboard}
          currentDatasources={currentDatasources}
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
  currentDatasources: makeSelectCurrentDatasources(),
  currentItemsLoading: makeSelectCurrentItemsLoading(),
  currentItemsQueryParams: makeSelectCurrentItemsQueryParams(),
  currentItemsShareInfo: makeSelectCurrentItemsShareInfo(),
  currentItemsSecretInfo: makeSelectCurrentItemsSecretInfo(),
  currentItemsShareInfoLoading: makeSelectCurrentItemsShareInfoLoading(),
  currentItemsDownloadCsvLoading: makeSelectCurrentItemsDownloadCsvLoading(),
  currentItemsCascadeSources: makeSelectCurrentItemsCascadeSources(),
  currentDashboardCascadeSources: makeSelectCurrentDashboardCascadeSources(),
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: () => dispatch(loadDashboards()),
    onLoadDashboardDetail: (id) => dispatch(loadDashboardDetail(id)),
    onAddDashboardItem: (item, resolve) => dispatch(addDashboardItem(item, resolve)),
    onEditCurrentDashboard: (dashboard, resolve) => dispatch(editCurrentDashboard(dashboard, resolve)),
    onEditDashboardItem: (item, resolve) => dispatch(editDashboardItem(item, resolve)),
    onEditDashboardItems: (items, resolve) => dispatch(editDashboardItems(items, resolve)),
    onDeleteDashboardItem: (id, resolve) => dispatch(deleteDashboardItem(id, resolve)),
    onLoadWidgets: () => dispatch(loadWidgets()),
    onLoadBizlogics: () => dispatch(loadBizlogics()),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired)),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onLoadWidgetCsv: (itemId, token, sql, sorts, offset, limit) => dispatch(loadWidgetCsv(itemId, token, sql, sorts, offset, limit)),
    onLoadCascadeSourceFromItem: (itemId, controlId, id, sql, column, parents) => dispatch(loadCascadeSourceFromItem(itemId, controlId, id, sql, column, parents)),
    onLoadCascadeSourceFromDashboard: (controlId, id, column, parents) => dispatch(loadCascadeSourceFromDashboard(controlId, id, column, parents)),
    onLoadBizdataSchema: (id, resolve) => dispatch(loadBizdataSchema(id, resolve))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerDashboard = injectReducer({ key: 'dashboard', reducer })
const withSagaDashboard = injectSaga({ key: 'dashboard', saga })

const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: reducerBizlogic })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: sagaBizlogic })

export default compose(
  withReducerDashboard,
  withReducerWidget,
  withReducerBizlogic,
  withSagaDashboard,
  withSagaWidget,
  withSagaBizlogic,
  withConnect
)(Grid)
