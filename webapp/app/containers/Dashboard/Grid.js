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

import React, { Component } from 'react'
import {findDOMNode} from 'react-dom'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'
import * as echarts from 'echarts/lib/echarts'

import Container from '../../components/Container'
import DashboardItemForm from './components/DashboardItemForm'
import Workbench from '../Widget/components/Workbench'
import DashboardItem from './components/DashboardItem'
import DashboardItemFilters from './components/DashboardItemFilters'
import SharePanel from '../../components/SharePanel'
import DashboardLinkagePanel from './components/linkage/LinkagePanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Breadcrumb from 'antd/lib/breadcrumb'
import Popover from 'antd/lib/popover'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'

import widgetlibs from '../../assets/json/widgetlib'
import FullScreenPanel from './components/fullScreenPanel/FullScreenPanel'
import { promiseDispatcher } from '../../utils/reduxPromisation'
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
  makeSelectCurrentItemsShareInfoLoading
} from './selectors'
import { loadWidgets } from '../Widget/actions'
import { loadBizlogics, loadBizdatasFromItem } from '../Bizlogic/actions'
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
  GRID_COLS
} from '../../globalConstants'

import utilStyles from '../../assets/less/util.less'
import widgetStyles from '../Widget/Widget.less'
import styles from './Dashboard.less'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export class Grid extends Component {
  constructor (props) {
    super(props)

    this.charts = {}
    this.interactCallbacks = {}
    this.interactingLinkagers = {}

    this.state = {
      mounted: false,

      localPositions: [],
      allowFullScreen: false,
      currentDataInFullScreen: {},
      modifiedPositions: false,
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

      linkageFormVisible: false,
      linkageTableSource: false,
      linkageCascaderSource: false,
      interactiveItems: {},

      resetSharePanel: false,

      nextMenuTitle: ''
    }
  }

  componentWillMount () {
    const {
      onLoadDashboards,
      onLoadWidgets,
      onLoadBizlogics,
      onLoadDashboardDetail,
      params,
      loginUser
    } = this.props

    if (loginUser.admin) {
      onLoadBizlogics()
    }

    onLoadDashboards()
    onLoadWidgets()
    onLoadDashboardDetail(params.dashboardId)
  }

  componentWillUpdate (nextProps) {
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
    const { onLoadDashboardDetail } = this.props
    const { modifiedPositions, linkageCascaderSource } = this.state

    if (params.dashboardId !== this.props.params.dashboardId) {
      this.state.nextMenuTitle = ''
    }

    if (!currentDashboardLoading) {
      if (currentItems && currentItems !== this.props.currentItems) {
        const localPositions = initializePosition(loginUser, currentDashboard, currentItems)
        if (!modifiedPositions) {
          this.state.modifiedPositions = localPositions.map(item => Object.assign({}, item))
        }
        this.state.localPositions = localPositions

        this.state.interactiveItems = currentItems.reduce((acc, i) => {
          acc[i.id] = {
            isInteractive: false,
            interactIndex: -1
          }
          return acc
        }, {})
      }

      if (params.dashboardId !== this.props.params.dashboardId) {
        this.state.modifiedPositions = false
        this.state.linkageCascaderSource = false
        this.state.linkageTableSource = false
        onLoadDashboardDetail(params.dashboardId)
      }

      if (loginUser.admin) {
        if (currentItems && widgets && !linkageCascaderSource) {
          this.state.linkageCascaderSource = currentItems.map(ci => ({
            label: widgets.find(w => w.id === ci.widget_id).name,
            value: ci.id,
            children: []
          }))
        }

        if (currentItems &&
            widgets &&
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
      // FIXME
      this.state.linkageTableSource = JSON.parse(currentDashboard.linkage_detail || '[]')
    }
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }
  componentWillUnmount () {
    Object.keys(this.charts).forEach(k => {
      this.charts[k].dispose()
    })
    this.props.onClearCurrentDashboard()
  }

  getChartData = (renderType, itemId, widgetId, queryParams) => {
    const {
      widgets,
      currentItemsQueryParams,
      onLoadBizdatasFromItem
    } = this.props
    const widget = widgets.find(w => w.id === widgetId)
    const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
    const chartInstanceId = `widget_${itemId}`

    let widgetConfig = JSON.parse(widget.config)
    let currentChart = this.charts[chartInstanceId]

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      switch (renderType) {
        case 'rerender':
          if (currentChart) {
            currentChart.dispose()
          }

          currentChart = echarts.init(document.getElementById(chartInstanceId), 'default')
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
    let params
    let linkageParams
    let pagination

    if (queryParams) {
      filters = queryParams.filters !== undefined ? queryParams.filters : cachedQueryParams.filters
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      pagination = queryParams.pagination || cachedQueryParams.pagination
    } else {
      filters = cachedQueryParams.filters
      linkageFilters = cachedQueryParams.linkageFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      pagination = cachedQueryParams.pagination
    }

    onLoadBizdatasFromItem(
      itemId,
      widget.flatTable_id,
      {
        adHoc: widget.adhoc_sql,
        filters,
        linkageFilters,
        params,
        linkageParams
      },
      pagination.sorts,
      pagination.offset,
      pagination.limit,
      widgetConfig.useCache,
      widgetConfig.expired
    )
  }

  renderChart = (itemId, widget, dataSource, chartInfo, interactIndex) => {
    const chartInstance = this.charts[`widget_${itemId}`]

    const chartOptions = echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: Object.assign({
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id
      }, JSON.parse(widget.chart_params)),
      interactIndex
    })
    chartInstance.setOption(chartOptions)

    this.registerChartInteractListener(chartInstance, itemId)

    chartInstance.hideLoading()
  }

  registerChartInteractListener = (instance, itemId) => {
    instance.off('click')
    instance.on('click', (params) => {
      const linkagers = this.checkInteract(itemId)

      if (Object.keys(linkagers).length) {
        this.doInteract(itemId, linkagers, params.dataIndex)
      }
    })
  }

  onLayoutChange = (layout, layouts) => {
    // setTimtout 中 setState 会被同步执行
    setTimeout(() => {
      const { currentItems, currentDatasources, widgets } = this.props
      const { localPositions, modifiedPositions } = this.state

      if (modifiedPositions) {
        const newModifiedItems = changePosition(modifiedPositions, layout, (pos) => {
          const dashboardItem = currentItems.find(item => item.id === Number(pos.i))
          const widget = widgets.find(w => w.id === dashboardItem.widget_id)
          const data = currentDatasources[dashboardItem.id]
          const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

          if (chartInfo.renderer === ECHARTS_RENDERER) {
            const chartInstanceId = `widget_${dashboardItem.id}`
            const chartInstance = this.charts[chartInstanceId]
            chartInstance.dispose()
            this.charts[chartInstanceId] = echarts.init(document.getElementById(chartInstanceId), 'default')
            this.renderChart(dashboardItem.id, widget, data ? data.dataSource : [], chartInfo)
          }
        })

        this.setState({
          modifiedPositions: newModifiedItems,
          editPositionSign: diffPosition(localPositions, newModifiedItems)
        })
      }
    }, 50)
  }

  showAddDashboardItemForm = () => {
    this.setState({
      dashboardItemFormType: 'add',
      dashboardItemFormVisible: true
    })
  }

  showEditDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      dashboardItemFormType: 'edit',
      dashboardItemFormVisible: true,
      selectedWidget: dashboardItem.widget_id,
      triggerType: dashboardItem.trigger_type
    }, () => {
      this.dashboardItemForm.setFieldsValue({
        id: dashboardItem.id,
        trigger_type: dashboardItem.trigger_type,
        trigger_params: dashboardItem.trigger_params
      })
    })
  }

  hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false
    })
  }

  afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidget: 0,
      triggerType: 'manual',
      dashboardItemFormStep: 0
    })
  }

  widgetSelect = (id) => () => {
    this.setState({
      selectedWidget: id
    })
  }

  triggerTypeSelect = (val) => {
    this.setState({
      triggerType: val
    })
  }

  changeDashboardItemFormStep = (sign) => () => {
    this.setState({
      dashboardItemFormStep: sign
    })
  }

  saveDashboardItem = () => {
    const { currentDashboard, currentItems, widgets } = this.props
    const { modifiedPositions, selectedWidget, dashboardItemFormType, linkageCascaderSource } = this.state

    const formdata = this.dashboardItemForm.getFieldsValue()

    const predictPosYArr = modifiedPositions.map(wi => wi.y + wi.h)

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

      this.props.onAddDashboardItem(currentDashboard.id, Object.assign({}, newItem, positionInfo))
        .then(dashboardItem => {
          modifiedPositions.push({
            x: dashboardItem.position_x,
            y: dashboardItem.position_y,
            w: dashboardItem.width,
            h: dashboardItem.length,
            i: `${dashboardItem.id}`
          })
          linkageCascaderSource.push({
            label: widgets.find(w => w.id === dashboardItem.widget_id).name,
            value: dashboardItem.id,
            children: []
          })
          this.hideDashboardItemForm()
        })
    } else {
      const dashboardItem = currentItems.find(item => item.id === Number(formdata.id))
      const modifiedDashboardItem = Object.assign({}, dashboardItem, newItem)

      this.props.onEditDashboardItem(modifiedDashboardItem, () => {
        this.getChartData('rerender', modifiedDashboardItem.id, modifiedDashboardItem.widget_id)
        this.hideDashboardItemForm()
      })
    }
  }

  editDashboardItemPositions = () => {
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
        id: item.id,
        widget_id: item.widget_id,
        dashboard_id: currentDashboard.id,
        position_x: modifiedItem.x,
        position_y: modifiedItem.y,
        width: modifiedItem.w,
        length: modifiedItem.h,
        trigger_type: item.trigger_type,
        trigger_params: item.trigger_params
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

  deleteItem = (id) => () => {
    this.props.onDeleteDashboardItem(id)
      .then(() => {
        const { modifiedPositions, linkageCascaderSource } = this.state
        modifiedPositions.splice(modifiedPositions.findIndex(mi => Number(mi.i) === id), 1)
        linkageCascaderSource.splice(linkageCascaderSource.findIndex(lcs => lcs.value === id), 1)
        if (this.charts[`widget_${id}`]) {
          this.charts[`widget_${id}`].dispose()
        }
      })
  }

  showWorkbench = (itemId, widget) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      workbenchDashboardItem: dashboardItem.id,
      workbenchWidget: widget,
      workbenchVisible: true
    })
  }

  hideWorkbench = () => {
    this.setState({
      workbenchDashboardItem: 0,
      workbenchWidget: null,
      workbenchVisible: false
    })
  }

  onWorkbenchClose = () => {
    const dashboardItem = this.props.currentItems.find(item => item.id === this.state.workbenchDashboardItem)
    this.getChartData('rerender', dashboardItem.id, dashboardItem.widget_id)
    this.hideWorkbench()
  }

  showFiltersForm = (itemId, keys, types) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      filtersVisible: true,
      filtersDashboardItem: dashboardItem.id,
      filtersKeys: keys,
      filtersTypes: types
    })
  }

  hideFiltersForm = () => {
    this.setState({
      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: [],
      filtersTypes: []
    })
    this.dashboardItemFilters.resetTree()
  }

  doFilterQuery = (sql) => {
    const itemId = this.state.filtersDashboardItem
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.getChartData('clear', itemId, dashboardItem.widget_id, {
      filters: sql
    })
    this.hideFiltersForm()
  }

  downloadCsv = (itemId) => (token) => {
    const {
      currentItems,
      widgets,
      currentItemsQueryParams,
      onLoadWidgetCsv
    } = this.props

    const dashboardItem = currentItems.find(c => c.id === itemId)
    const widget = widgets.find(w => w.id === dashboardItem.widget_id)

    const cachedQueryParams = currentItemsQueryParams[itemId]

    let filters = cachedQueryParams.filters
    let params = cachedQueryParams.params

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

  navDropdownClick = (e) => {
    this.props.router.push(`/report/dashboard/${e.key}`)
  }

  nextNavDropdownClick = (e) => {
    const {widgets} = this.props
    const widgetId = e.item && e.item.props && e.item.props.widgetId
    let widget = findDOMNode(this.refs[`widgetId_${widgetId}`])
    if (widget) {
      let widgetParent = widget.parentNode
      let scrollCount = widgetParent.style.transform && widgetParent.style.transform.match(/\d+/g)[1]
      let containerBody = widgetParent.parentNode.parentNode
      let scrollHeight = parseInt(scrollCount) - 16
      containerBody.scrollTop = scrollHeight
    }
    let nextMenuTitle = widgets.find(widget => widget.id === widgetId)['name']
    this.setState({
      nextMenuTitle
    })
  }

  showLinkageForm = () => {
    this.setState({
      linkageFormVisible: true
    })
  }

  hideLinkageForm = () => {
    this.setState({
      linkageFormVisible: false
    })
  }

  afterLinkageFormClose = () => {
    this.setState({
      linkageTableSource: JSON.parse(this.props.currentDashboard.linkage_detail || '[]')
    })
  }

  addToLinkageTable = (formValues) => {
    this.setState({
      linkageTableSource: this.state.linkageTableSource.concat(Object.assign({}, formValues, {
        key: uuid(8, 16)
      }))
    })
  }

  saveLinkageConditions = () => {
    // todo
    const {
      currentItems,
      widgets,
      currentDatasources
    } = this.props

    const { interactiveItems } = this.state

    Object.keys(interactiveItems).forEach(itemId => {
      if (interactiveItems[itemId].isInteractive) {
        const triggerItem = currentItems.find(ci => `${ci.id}` === itemId)
        const triggerWidget = widgets.find(w => w.id === triggerItem.widget_id)
        const chartInfo = widgetlibs.find(wl => wl.id === triggerWidget.widgetlib_id)
        const dataSource = currentDatasources[itemId].dataSource

        if (chartInfo.renderer === ECHARTS_RENDERER) {
          this.renderChart(itemId, triggerWidget, dataSource, chartInfo)
        }

        interactiveItems[itemId] = {
          isInteractive: false,
          interactIndex: -1
        }
      }
    })

    Object.keys(this.interactCallbacks).map(triggerId => {
      const triggerCallbacks = this.interactCallbacks[triggerId]

      Object.keys(triggerCallbacks).map(linkagerId => {
        triggerCallbacks[linkagerId]()
      })
    })
    // 由于新的配置和之前可能有很大不同，因此需要遍历 GridItem 来重新注册事件
    currentItems.forEach(ci => {
      const triggerIntance = this.charts[`widget_${ci.id}`]

      if (triggerIntance) {
        this.registerChartInteractListener(triggerIntance, ci.id)
      }
    })
    this.props.onEditCurrentDashboard(
      Object.assign({}, this.props.currentDashboard, {
        linkage_detail: JSON.stringify(this.state.linkageTableSource),
        // FIXME
        active: true
      }),
      () => {
        this.hideLinkageForm()
      }
    )
  }

  deleteLinkageCondition = (key) => () => {
    this.setState({
      linkageTableSource: this.state.linkageTableSource.filter(lt => lt.key !== key)
    })
  }

  refreshLinkageCascaderSource = (props) => {
    const { currentItems, widgets, bizlogics, currentDatasources } = props

    Object.keys(currentDatasources).forEach(k => {
      const dashboardItem = currentItems.find(ci => `${ci.id}` === k)
      const widget = widgets.find(w => w.id === dashboardItem.widget_id)
      const flattable = bizlogics.find(bl => bl.id === widget.flatTable_id)
      const variableArr = flattable.sql_tmpl.match(/query@var\s\$\w+\$/g) || []

      // Cascader value 中带有 itemId、字段类型、参数/变量标识 这些信息，用 DEFAULT_SPLITER 分隔
      const params = currentDatasources[k].keys.map((pk, index) => ({
        label: `${pk}`,
        value: `${pk}${DEFAULT_SPLITER}${currentDatasources[k].types[index]}${DEFAULT_SPLITER}parameter`
      }))

      const variables = variableArr.map(va => {
        const val = va.substring(va.indexOf('$') + 1, va.lastIndexOf('$'))
        return {
          label: `${val}[变量]`,
          value: `${val}${DEFAULT_SPLITER}variable`
        }
      })

      const sourceItem = this.state.linkageCascaderSource.find(ld => `${ld.value}` === k)
      sourceItem.label = widget.name
      sourceItem.children = params.concat(variables)
    })
  }

  checkInteract = (itemId) => {
    const { currentItems, widgets } = this.props
    const { linkageTableSource } = this.state
    const dashboardItem = currentItems.find(ci => ci.id === itemId)
    const widget = widgets.find(w => w.id === dashboardItem.widget_id)
    const widgetlib = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

    let linkagers = {}

    linkageTableSource.forEach(lts => {
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

  doInteract = (itemId, linkagers, interactIndex) => {
    const {
      currentItems,
      widgets,
      currentDatasources
    } = this.props

    const triggerItem = currentItems.find(ci => ci.id === itemId)
    const triggerWidget = widgets.find(w => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find(wl => wl.id === triggerWidget.widgetlib_id)
    const dataSource = currentDatasources[itemId].dataSource
    const triggeringData = dataSource[interactIndex]

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo, interactIndex)
    }

    this.state.interactiveItems = Object.assign({}, this.state.interactiveItems, {
      [itemId]: {
        isInteractive: true,
        interactIndex
      }
    })

    Object.keys(linkagers).forEach(key => {
      const linkager = linkagers[key]

      let linkagerId
      let linkageFilters = []
      let linkageParams = []
      // 合并单个 linkager 所接收的数据
      linkager.forEach(lr => {
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

      const linkagerItem = currentItems.find(ci => ci.id === linkagerId)
      const alreadyInUseFiltersAndParams = this.interactingLinkagers[linkagerId]
      /*
       * 多个 trigger 联动同一个 linkager
       * interactingLinkagers 是个临时数据存储，且不触发render
       */
      if (alreadyInUseFiltersAndParams) {
        const { filters, params } = alreadyInUseFiltersAndParams
        const mergedFilters = linkageFilters.length ? Object.assign(filters, {[itemId]: linkageFilters}) : filters
        const mergedParams = linkageParams.length ? Object.assign(params, {[itemId]: linkageParams}) : params

        this.getChartData('clear', linkagerId, linkagerItem.widget_id, {
          linkageFilters: Object.values(mergedFilters)
            .reduce((arr, val) => arr.concat(...val), [])
            .join(' and '),
          linkageParams: Object.values(mergedParams).reduce((arr, val) => arr.concat(...val), [])
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
              .reduce((arr, val) => arr.concat(...val), [])
              .join(' and '),
            linkageParams: Object.values(params).reduce((arr, val) => arr.concat(...val), [])
          })
        }
      }
    })
  }

  turnOffInteract = (itemId) => () => {
    const {
      currentItems,
      widgets,
      currentDatasources
    } = this.props

    const triggerItem = currentItems.find(ci => ci.id === itemId)
    const triggerWidget = widgets.find(w => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find(wl => wl.id === triggerWidget.widgetlib_id)
    const dataSource = currentDatasources[itemId].dataSource

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo)
    }

    this.state.interactiveItems = Object.assign({}, this.state.interactiveItems, {
      [itemId]: {
        isInteractive: false,
        interactIndex: -1
      }
    })

    Object.keys(this.interactCallbacks[itemId]).map(linkagerId => {
      this.interactCallbacks[itemId][linkagerId]()
      delete this.interactCallbacks[itemId][linkagerId]
    })
  }

  visibleFullScreen = (currentChartData) => {
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
  currentWidgetInFullScreen = (id) => {
    const {currentItems, currentDatasources, currentItemsLoading, widgets} = this.props
    const { modifiedPositions } = this.state
    const item = currentItems.find(ci => ci.id === id)
    const modifiedPosition = modifiedPositions[currentItems.indexOf(item)]
    const widget = widgets.find(w => w.id === item.widget_id)
    const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
    const data = currentDatasources[id]
    const loading = currentItemsLoading[id]
    this.setState({
      currentDataInFullScreen: {
        w: modifiedPosition ? modifiedPosition.w : 0,
        h: modifiedPosition ? modifiedPosition.h : 0,
        itemId: id,
        widgetId: widget.id,
        widget: widget,
        chartInfo: chartInfo,
        data: data,
        loading: loading,
        onGetChartData: this.getChartData
      }
    })
  }
  resetSharePanel = (flag) => {
    this.setState({
      resetSharePanel: flag === 'open'
    })
  }

  getWidgetInfo = (dashboardItemId) => {
    const { currentItems, widgets } = this.props
    const dashboardItem = currentItems.find(ci => ci.id === dashboardItemId)
    const widget = widgets.find(w => w.id === dashboardItem.widget_id)
    const widgetlib = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
    return {
      name: widget.name,
      type: widgetlib.name
    }
  }

  render () {
    const {
      dashboards,
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
      loginUser,
      bizlogics
    } = this.props

    const {
      mounted,
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
      linkageFormVisible,
      linkageCascaderSource,
      linkageTableSource,
      interactiveItems,
      allowFullScreen
    } = this.state

    let {widgets} = this.props

    let navDropdown = (<span />)
    let grids = ''

    if (dashboards) {
      const navDropdownItems = dashboards.map(d => (
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
      let currentWidgets = currentDashboard.widgets
      const navDropdownItems = currentWidgets.map(d => (
        <Menu.Item key={d.id} widgetId={d.widget_id}>
          {d.widget_id ? (widgets.find(widget => widget.id === d.widget_id))['name'] : ''}
        </Menu.Item>
      ))
      nextNavDropdown = (
        <Menu onClick={this.nextNavDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    if (widgets) {
      let layouts = {
        lg: []
      }
      let itemblocks = []

      localPositions.forEach((pos, index) => {
        layouts.lg.push({
          x: pos.x,
          y: pos.y,
          w: pos.w,
          h: pos.h,
          i: pos.i
        })
        const dashboardItem = currentItems[index]
        const itemId = dashboardItem.id
        const modifiedPosition = modifiedPositions[index]
        const widget = widgets.find(w => w.id === dashboardItem.widget_id)
        const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
        const data = currentDatasources[itemId]
        const loading = currentItemsLoading[itemId]
        const shareInfo = currentItemsShareInfo[itemId]
        const secretInfo = currentItemsSecretInfo[itemId]
        const shareInfoLoading = currentItemsShareInfoLoading[itemId]
        const downloadCsvLoading = currentItemsDownloadCsvLoading[itemId]
        const { isInteractive, interactIndex } = interactiveItems[itemId]
        // isReadOnly 非原创用户不能对 widget进行写的操作
        const isReadOnly = (widget['create_by'] === loginUser.id)

        itemblocks.push((
          <div key={pos.i}>
            <DashboardItem
              ref={`widgetId_${widget.id}`}  // todo  feature
              w={modifiedPosition ? modifiedPosition.w : 0}
              h={modifiedPosition ? modifiedPosition.h : 0}
              itemId={itemId}
              widget={widget}
              bizlogics={bizlogics || []}
              chartInfo={chartInfo}
              data={data}
              loading={loading}
              triggerType={dashboardItem.trigger_type}
              triggerParams={dashboardItem.trigger_params}
              isAdmin={loginUser.admin}
              isShared={false}
              shareInfo={shareInfo}
              secretInfo={secretInfo}
              shareInfoLoading={shareInfoLoading}
              downloadCsvLoading={downloadCsvLoading}
              isInteractive={isInteractive}
              interactIndex={interactIndex}
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
              isReadOnly={isReadOnly}
            />
          </div>
        ))
      })
      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-14px'}}
          rowHeight={30}
          margin={[16, 16]}
          breakpoints={loginUser.admin ? ADMIN_GRID_BREAKPOINTS : USER_GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          draggableHandle={`.${styles.title}`}
          useCSSTransforms={mounted}>
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
    }

    const modalButtons = dashboardItemFormStep
      ? [
        <Button
          key="back"
          size="large"
          onClick={this.changeDashboardItemFormStep(0)}>
          上一步
        </Button>,
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={modalLoading}
          disabled={modalLoading}
          onClick={this.saveDashboardItem}>
          保 存
        </Button>
      ]
      : [
        <Button
          key="forward"
          size="large"
          type="primary"
          disabled={!selectedWidget}
          onClick={this.changeDashboardItemFormStep(1)}>
          下一步
        </Button>
      ]

    const linkageModalButtons = [
      <Button
        key="cancel"
        size="large"
        onClick={this.hideLinkageForm}>
        取 消
      </Button>,
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={currentDashboardLoading}
        disabled={currentDashboardLoading}
        onClick={this.saveLinkageConditions}>
        保 存
      </Button>
    ]

    let savePosButton = ''
    let addButton = ''
    let shareButton = ''
    let settingButton = ''

    if (editPositionSign) {
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

    if (loginUser.admin) {
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
                resetSharePanel={this.state.resetSharePanel}
                isResetSharePanel={this.resetSharePanel}
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
                onClick={() => this.resetSharePanel('open')}
              />
            </Tooltip>
          </Popover>
        )
        : ''

      settingButton = currentDashboard
        ? (
          <Tooltip placement="bottom" title="联动关系配置">
            <Button
              size="large"
              type="primary"
              icon="setting"
              style={{marginLeft: '8px'}}
              onClick={this.showLinkageForm}
            />
          </Tooltip>
        )
        : ''
    }

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
                        <Link>
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
                        <Link>
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
              {settingButton}
            </Col>
          </Row>
        </Container.Title>
        <Container.Body grid>
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
            ref={f => { this.dashboardItemForm = f }}
          />
        </Modal>
        <Modal
          title="Widget 详情"
          wrapClassName={`ant-modal-xlarge ${widgetStyles.workbenchWrapper}`}
          visible={workbenchVisible}
          onCancel={this.hideWorkbench}
          footer={false}
          maskClosable={false}
        >
          <Workbench
            type={workbenchVisible ? 'edit' : ''}
            widget={workbenchWidget}
            bizlogics={bizlogics || []}
            widgetlibs={widgetlibs}
            onClose={this.onWorkbenchClose}
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
            wrappedComponentRef={f => { this.dashboardItemFilters = f }}
          />
        </Modal>
        <Modal
          title="联动关系配置"
          wrapClassName="ant-modal-large"
          visible={linkageFormVisible}
          onCancel={this.hideLinkageForm}
          footer={linkageModalButtons}
          afterClose={this.afterLinkageFormClose}
        >
          <DashboardLinkagePanel
            cascaderSource={linkageCascaderSource || []}
            tableSource={linkageTableSource || []}
            onAddToTable={this.addToLinkageTable}
            onDelelteFromTable={this.deleteLinkageCondition}
            onGetWidgetInfo={this.getWidgetInfo}
          />
        </Modal>
        <FullScreenPanel
          widgets={widgets}
          currentDashboard={currentDashboard}
          currentDatasources={currentDatasources}
          visible={allowFullScreen}
          isVisible={this.visibleFullScreen}
          onRenderChart={this.renderChart}
          currentDataInFullScreen={this.state.currentDataInFullScreen}
          onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
        />
      </Container>
    )
  }
}

Grid.propTypes = {
  dashboards: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  currentDashboard: PropTypes.object,
  currentDashboardLoading: PropTypes.bool,
  currentDashboardShareInfo: PropTypes.string,
  currentDashboardSecretInfo: PropTypes.string,
  currentDashboardShareInfoLoading: PropTypes.bool,
  currentItems: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  currentDatasources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsLoading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsQueryParams: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsShareInfo: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsSecretInfo: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsShareInfoLoading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsDownloadCsvLoading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  onLoadDashboards: PropTypes.func,
  onLoadDashboardDetail: PropTypes.func,
  onAddDashboardItem: PropTypes.func,
  onEditCurrentDashboard: PropTypes.func,
  onEditDashboardItem: PropTypes.func,
  onEditDashboardItems: PropTypes.func,
  onDeleteDashboardItem: PropTypes.func,
  widgets: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  bizlogics: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  loginUser: PropTypes.object,
  router: PropTypes.any,
  params: PropTypes.any,
  onLoadWidgets: PropTypes.func,
  onLoadBizlogics: PropTypes.func,
  onLoadBizdatasFromItem: PropTypes.func,
  onClearCurrentDashboard: PropTypes.func,
  onLoadWidgetCsv: PropTypes.func
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
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: () => promiseDispatcher(dispatch, loadDashboards),
    onLoadDashboardDetail: (id) => promiseDispatcher(dispatch, loadDashboardDetail, id),
    onAddDashboardItem: (id, item) => promiseDispatcher(dispatch, addDashboardItem, id, item),
    onEditCurrentDashboard: (dashboard, resolve) => dispatch(editCurrentDashboard(dashboard, resolve)),
    onEditDashboardItem: (item, resolve) => dispatch(editDashboardItem(item, resolve)),
    onEditDashboardItems: (items, resolve) => dispatch(editDashboardItems(items, resolve)),
    onDeleteDashboardItem: (id) => promiseDispatcher(dispatch, deleteDashboardItem, id),
    onLoadWidgets: () => promiseDispatcher(dispatch, loadWidgets),
    onLoadBizlogics: () => promiseDispatcher(dispatch, loadBizlogics),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired)),
    onClearCurrentDashboard: () => promiseDispatcher(dispatch, clearCurrentDashboard),
    onLoadWidgetCsv: (token, sql, sorts, offset, limit) => dispatch(loadWidgetCsv(token, sql, sorts, offset, limit))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Grid)
