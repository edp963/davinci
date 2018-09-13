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

import { Responsive, WidthProvider } from 'react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Icon = require('antd/lib/icon')
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import widgetlibs from '../../assets/json/widgetlib'
import FullScreenPanel from './components/fullScreenPanel/FullScreenPanel'
import { decodeMetricName, getAggregatorLocale } from '../Widget/components/util'
import { uuid } from '../../utils/util'
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
  loadWidgetShareLink
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
  makeSelectCurrentDashboardCascadeSources
} from './selectors'
import {
  loadBizlogics,
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
import { IPivotProps, RenderType } from '../Widget/components/Pivot/Pivot'
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
      datasource: any[]
      loading: boolean
      queryParams: {
        filters: string
        linkageFilters: string
        globalFilters: string
        params: Array<{name: string, value: string}>
        linkageParams: Array<{name: string, value: string}>
        globalParams: Array<{name: string, value: string}>
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
  onLoadDashboardDetail: (projectId: number, portalId: number, dashboardId: number) => any
  onAddDashboardItem: (portalId: number, item: [IDashboardItem], resolve: (item: IDashboardItem) => void) => any
  onEditCurrentDashboard: (dashboard: object, resolve: () => void) => void
  onEditDashboardItem: (item: IDashboardItem, resolve: () => void) => void
  onEditDashboardItems: (item: IDashboardItem[]) => void
  onDeleteDashboardItem: (id: number, resolve: () => void) => void
  onLoadBizlogics: (projectId: number, resolve?: any) => any
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
    params: {
      groups: string[]
      aggregators: Array<{column: string, func: string}>
      filters: string[]
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
  linkageTableSource: any[]
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
      linkageTableSource: [],

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
      onLoadBizlogics,
      onLoadDashboardDetail,
      params
    } = this.props
    const { pid, portalId, dashboardId } = params
    onLoadBizlogics(pid)
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

      if (currentDashboard !== this.props.currentDashboard || currentItemsInfo !== this.props.currentItemsInfo) {
        const linkageTableSource = this.getLinkageTableSource(currentDashboard, currentItemsInfo)
        this.setState({ linkageTableSource })
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
          this.containerBody.removeEventListener('scroll', this.lazyLoad, false)
        }
        this.containerBodyScrollThrottle = false
      })
      this.containerBodyScrollThrottle = true
    }
  }

  private calcItemTop = (y: number) => Math.round((GRID_ROW_HEIGHT + GRID_ITEM_MARGIN) * y)

  private getLinkageTableSource = (currentDashboard: ICurrentDashboard, currentItemsInfo: any) => {
    const config = JSON.parse(currentDashboard.config || '{}')
    const linkageTableSource = config.linkages || []
    const validLinkageTableSource = linkageTableSource.filter((lts) => {
      const { linkager, trigger } = lts
      return currentItemsInfo[linkager[0]] && currentItemsInfo[trigger[0]]
    })
    return validLinkageTableSource
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      currentItemsInfo,
      widgets,
      onLoadDataFromItem
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IPivotProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryParams = currentItemsInfo[itemId].queryParams

    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams

    if (queryParams) {
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== undefined ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
    } else {
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
    }

    let groups = cols.concat(rows)
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

    onLoadDataFromItem(
      renderType,
      itemId,
      widget.viewId,
      {
        groups,
        aggregators,
        filters: filters.map((i) => i.config.sql),
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

  private downloadCsv = (itemId: number, pivotProps: IPivotProps, shareInfo: string) => {
    const {
      currentItemsInfo,
      onLoadWidgetCsv
    } = this.props

    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = pivotProps

    let groups = cols.concat(rows)
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

    onLoadWidgetCsv(
      itemId,
      {
        groups,
        aggregators,
        filters: filters.map((f) => f.config.sql),
        orders,
        cache,
        expired
      },
      shareInfo
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
    this.props.onDeleteDashboardItem(id, void 0)
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
    const {
      currentDashboard,
      currentItems,
      currentItemsInfo,
      widgets,
      onEditCurrentDashboard
    } = this.props

    // Object.keys(interactiveItems).forEach((itemId) => {
    //   if (interactiveItems[itemId].interactId) {
    //     const triggerItem = currentItems.find((ci) => `${ci.id}` === itemId)
    //     const triggerWidget = widgets.find((w) => w.id === triggerItem.widgetId)

    //     interactiveItems[itemId] = {
    //       interactId: ''
    //     }
    //   }
    // })

    // Object.keys(this.interactCallbacks).map((triggerId) => {
    //   const triggerCallbacks = this.interactCallbacks[triggerId]

    //   Object.keys(triggerCallbacks).map((linkagerId) => {
    //     triggerCallbacks[linkagerId]()
    //   })
    // })
    // // 由于新的配置和之前可能有很大不同，因此需要遍历 GridItem 来重新注册事件
    // currentItems.forEach((ci) => {
    //   const triggerIntance = this.charts[`widget_${ci.id}`]

    //   if (triggerIntance) {
    //     this.registerChartInteractListener(triggerIntance, ci.id)
    //   }
    // })
    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: JSON.stringify({
          ...JSON.parse(currentDashboard.config || '{}'),
          linkages
        })
      },
      () => {
        this.setState({
          linkageTableSource: linkages
        })
        this.toggleLinkageConfig(false)()
      }
    )
  }

  private checkInteract = (itemId: number) => {
    const { linkageTableSource } = this.state
    const isInteractiveItem = linkageTableSource.some((lts) => {
      const { trigger, linkager, relation } = lts
      const triggerId = +trigger[0]
      return triggerId === itemId
    })

    return isInteractiveItem
  }

  private doInteract = (itemId, triggerData) => {
    const {
      currentItems,
      currentItemsInfo,
      widgets
    } = this.props
    const { linkageTableSource } = this.state

    console.log(itemId, triggerData)

    // Object.keys(linkagers).forEach((key) => {
    //   const linkager = linkagers[key]

    //   const linkageFilters = []
    //   const linkageParams = []
    //   let linkagerId
    //   // 合并单个 linkager 所接收的数据
    //   linkager.forEach((lr) => {
    //     linkagerId = lr.linkagerId

    //     const {
    //       triggerValue,
    //       triggerValueType,
    //       linkagerValue,
    //       linkagerType,
    //       relation
    //     } = lr

    //     const interactValue = SQL_NUMBER_TYPES.indexOf(triggerValueType) >= 0
    //       ? triggeringData[triggerValue]
    //       : `'${triggeringData[triggerValue]}'`

    //     if (linkagerType === 'parameter') {
    //       linkageFilters.push(`${linkagerValue} ${relation} ${interactValue}`)
    //     } else {
    //       linkageParams.push({
    //         k: linkagerValue,
    //         v: interactValue
    //       })
    //     }
    //   })

    //   const linkagerItem = currentItems.find((ci) => ci.id === linkagerId)
    //   const alreadyInUseFiltersAndParams = this.interactingLinkagers[linkagerId]
    //   /*
    //    * 多个 trigger 联动同一个 linkager
    //    * interactingLinkagers 是个临时数据存储，且不触发render
    //    */
    //   if (alreadyInUseFiltersAndParams) {
    //     const { filters, params } = alreadyInUseFiltersAndParams
    //     const mergedFilters = linkageFilters.length ? { ...filters, [itemId]: linkageFilters } : filters
    //     const mergedParams = linkageParams.length ? { ...params, [itemId]: linkageParams } : params

    //     this.getChartData('clear', linkagerId, linkagerItem.widgetId, {
    //       linkageFilters: Object.values(mergedFilters)
    //         .reduce((arr: any[], val: any[]): any => arr.concat(...val), [])
    //         .join(' and '),
    //       linkageParams: Object.values(mergedParams).reduce((arr: any[], val: any[]) => arr.concat(...val), [])
    //     })

    //     this.interactingLinkagers[linkagerId] = {
    //       filters: mergedFilters,
    //       params: mergedParams
    //     }
    //   } else {
    //     this.getChartData('clear', linkagerId, linkagerItem.widgetId, {
    //       linkageFilters: linkageFilters.join(' and '),
    //       linkageParams
    //     })

    //     this.interactingLinkagers[linkagerId] = {
    //       filters: linkageFilters.length ? {[itemId]: linkageFilters} : {},
    //       params: linkageParams.length ? {[itemId]: linkageParams} : {}
    //     }
    //   }

    //   if (!this.interactCallbacks[itemId]) {
    //     this.interactCallbacks[itemId] = {}
    //   }

    //   if (!this.interactCallbacks[itemId][linkagerId]) {
    //     this.interactCallbacks[itemId][linkagerId] = () => {
    //       const { filters, params } = this.interactingLinkagers[linkagerId]

    //       delete filters[itemId]
    //       delete params[itemId]

    //       this.getChartData('clear', linkagerId, linkagerItem.widgetId, {
    //         linkageFilters: Object.values(filters)
    //           .reduce((arr: any[], val: any[]): any => arr.concat(...val), [])
    //           .join(' and '),
    //         linkageParams: Object.values(params).reduce((arr: any[], val: any[]) => arr.concat(...val), [])
    //       })
    //     }
    //   }
    // })
  }

  private turnOffInteract = (itemId) => () => {
    const {
      currentItems,
      currentItemsInfo,
      widgets
    } = this.props

    const triggerItem = currentItems.find((ci) => ci.id === itemId)
    const triggerWidget = widgets.find((w) => w.id === triggerItem.widgetId)
    const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
    const dataSource = currentItemsInfo[itemId].datasource

    // this.setState({
    //   interactiveItems: {
    //     ...this.state.interactiveItems,
    //     [itemId]: {
    //       interactId: ''
    //     }
    //   }
    // })

    Object.keys(this.interactCallbacks[itemId]).map((linkagerId) => {
      this.interactCallbacks[itemId][linkagerId]()
      delete this.interactCallbacks[itemId][linkagerId]
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
    const {currentItems, currentItemsInfo, widgets} = this.props
    const item = currentItems.find((ci) => ci.id === id)
    const widget = widgets.find((w) => w.id === item.widgetId)
    const data = currentItemsInfo[id]
    const loading = currentItemsInfo['loading']
    this.setState({
      currentDataInFullScreen: {
            itemId: id,
            widgetId: widget.id,
            widget,
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
    const widget = widgets.find((w) => w.id === dashboardItem.widgetId)
    const widgetlib = widgetlibs.find((wl) => wl.id === widget.type)
    return {
      name: widget.name,
      type: widgetlib.name
    }
  }

  private toWorkbench = (itemId, widgetId) => {
    const { params } = this.props
    const { pid, portalId, portalName, dashboardId } = params
    const editSign = [pid, portalId, portalName, dashboardId, itemId].join(DEFAULT_SPLITER)
    localStorage.setItem('editWidgetFromDashboard', editSign)
    this.props.router.push(`/project/${pid}/widget/${widgetId}`)
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
      currentProject
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
      linkageTableSource,
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

        itemblocks.push((
          <div key={id}>
            <DashboardItem
              itemId={id}
              widget={widget}
              data={datasource}
              loading={loading}
              polling={polling}
              frequency={frequency}
              shareInfo={shareInfo}
              secretInfo={secretInfo}
              shareInfoLoading={shareInfoLoading}
              downloadCsvLoading={downloadCsvLoading}
              interactId={interactId}
              currentProject={currentProject}
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
          currentDatasources={currentItemsInfo}
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
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, params) =>
                        dispatch(loadDataFromItem(renderType, itemId, viewId, params, 'dashboard')),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onLoadWidgetCsv: (itemId, params, token) => dispatch(loadWidgetCsv(itemId, params, token)),
    onLoadCascadeSource: (controlId, viewId, column, parents) => dispatch(loadCascadeSource(controlId, viewId, column, parents)),
    onLoadBizdataSchema: (id, resolve) => dispatch(loadBizdataSchema(id, resolve)),
    onLoadDistinctValue: (viewId, fieldName, resolve) => dispatch(loadDistinctValue(viewId, fieldName, [], resolve)),
    onRenderDashboardItem: (itemId) => dispatch(renderDashboardItem(itemId)),
    onResizeDashboardItem: (itemId) => dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onLoadDashboardShareLink: (id, authName) => dispatch(loadDashboardShareLink(id, authName)),
    onLoadWidgetShareLink: (id, itemId, authName, resolve) => dispatch(loadWidgetShareLink(id, itemId, authName, resolve))
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
