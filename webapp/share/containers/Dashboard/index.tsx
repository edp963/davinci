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
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as classnames from 'classnames'
import moment from 'moment'
import * as echarts from 'echarts/lib/echarts'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../../app/components/Container'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import GlobalFilters from '../../../app/containers/Dashboard/components/globalFilter/GlobalFilters'
import FullScreenPanel from '../../../app/containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import DashboardItemFilters from '../../../app/containers/Dashboard/components/DashboardItemFilters'
import { Responsive, WidthProvider } from 'react-grid-layout'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Modal = require('antd/lib/modal')

import {
  getDashboard,
  getWidget,
  getResultset,
  setIndividualDashboard,
  loadWidgetCsv,
  loadCascadeSourceFromItem,
  loadCascadeSourceFromDashboard
} from './actions'
import {
  makeSelectTitle,
  makeSelectConfig,
  makeSelectDashboardCascadeSources,
  makeSelectWidgets,
  makeSelectItems,
  makeSelectDataSources,
  makeSelectLoadings,
  makeSelectItemQueryParams,
  makeSelectItemDownloadCsvLoadings,
  makeSelectItemsCascadeSources
} from './selectors'
import { echartsOptionsGenerator } from '../../../app/containers/Widget/components/chartUtil'
import { changePosition } from '../../../app/containers/Dashboard/components/localPositionUtil'
import {
  DEFAULT_PRIMARY_COLOR, DEFAULT_SPLITER, ECHARTS_RENDERER, GRID_COLS, SQL_NUMBER_TYPES,
  USER_GRID_BREAKPOINTS
} from '../../../app/globalConstants'

const styles = require('../../../app/containers/Dashboard/Dashboard.less')
const utilStyles = require('../../../app/assets/less/util.less')

import widgetlibs from '../../../app/assets/json/widgetlib'
import Login from '../../components/Login/index'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

interface IDashboardProps {
  title: string
  config: string
  currentItems: any[],
  widgets: any[],
  dataSources: any,
  loadings: any,
  itemQueryParams: any,
  downloadCsvLoadings: any,
  itemsCascadeSources: any,
  dashboardCascadeSources: any,
  onLoadDashboard: (shareInfo: any, success: (dashboard) => void, error: (err) => void) => void,
  onLoadWidget: (aesStr: string, success?: (widget) => void, error?: (err) => void) => void,
  onLoadResultset: (itemId, aesStr, sql, sorts, offset, limit, useCache, expired) => void,
  onSetIndividualDashboard: (id, shareInfo) => void,
  onLoadWidgetCsv: (itemId, token, sql) => void,
  onLoadCascadeSourceFromItem: (itemId, controlId, token, sql, column, parents) => void,
  onLoadCascadeSourceFromDashboard: (key, flatTableId, shareInfo, cascadeColumn, parents) => void
}

interface IDashboardStates {
  mounted: boolean,
  modifiedPositions: any[],
  type: string,
  shareInfo: string,
  modalLoading: boolean,
  filtersVisible: boolean,
  filtersDashboardItem: number,
  filtersKeys: any,
  filtersTypes: any,
  allowFullScreen: boolean,
  currentDataInFullScreen: any,
  showLogin: boolean,
  linkageTableSource: any[],
  globalFilterTableSource: any[],
  interactiveItems: any,
  phantomRenderSign: boolean
}

export class Share extends React.Component<IDashboardProps, IDashboardStates> {
  private charts
  private interactCallbacks
  private interactingLinkagers
  private interactGlobalFilters
  private resizeSign
  private dashboardItemFilters

  constructor (props) {
    super(props)
    this.state = {
      mounted: false,
      modifiedPositions: [],
      type: '',
      shareInfo: '',

      modalLoading: false,

      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: null,
      filtersTypes: null,
      allowFullScreen: false,
      currentDataInFullScreen: {},
      showLogin: false,
      linkageTableSource: [],
      globalFilterTableSource: [],
      interactiveItems: {},

      phantomRenderSign: false
    }
    this.charts = {}
    this.interactCallbacks = {}
    this.interactingLinkagers = {}
    this.interactGlobalFilters = {}
    this.resizeSign = void 0
  }

  /**
   * object
   * {
   *  type: this.state.type,
   *  shareInfo: this.state.shareInfo
   * }
   * @param qs
   */
  private loadShareContent = (qs) => {
    const {
      onLoadDashboard,
      onLoadWidget,
      onSetIndividualDashboard,
      onLoadCascadeSourceFromDashboard
    } = this.props
    if (qs.type === 'dashboard') {
      onLoadDashboard(qs.shareInfo, (dashboard) => {
        dashboard.widgets.forEach((w) => {
          onLoadWidget(w.aesStr)
        })
        this.setState({
          linkageTableSource: this.adjustLinkageTableSource(dashboard, dashboard.widgets),
          globalFilterTableSource: this.adjustGlobalFilterTableSource(dashboard, dashboard.widgets)
        }, () => {
          this.state.globalFilterTableSource.forEach((gft) => {
            if (gft.type === 'cascadeSelect' && !gft.parentColumn) {
              onLoadCascadeSourceFromDashboard(gft.key, gft.flatTableId, qs.shareInfo, gft.cascadeColumn)
            }
          })
        })
      }, (err) => {
        console.log(err)
        this.setState({
          showLogin: true
        })
      })
    } else {
      onLoadWidget(qs.shareInfo, (w) => {
        onSetIndividualDashboard(w.id, qs.shareInfo)
        this.setState({
          linkageTableSource: [],
          globalFilterTableSource: []
        })
      }, (err) => {
        console.log(err)
        this.setState({
          showLogin: true
        })
      })
    }
  }
  public componentWillMount () {
    const qs = this.getQs(location.href.substr(location.href.indexOf('?') + 1))
    this.setState({
      type: qs.type,
      shareInfo: qs.shareInfo
    })
    this.loadShareContent(qs)
  }

  public componentDidMount () {
    window.addEventListener('resize', this.onResize, false)
    this.setState({ mounted: true })
  }

  public componentWillUpdate (nextProps) {
    const { currentItems, dataSources } = nextProps
    if (currentItems) {
      if (this.state.modifiedPositions.length === 0) {
        this.setState({
          modifiedPositions: currentItems.map((ci) => ({
            x: ci.position_x,
            y: ci.position_y,
            w: ci.width,
            h: ci.length,
            i: `${ci.id}`
          }))
        })
      }

      if (!Object.keys(this.state.interactiveItems).length) {
        this.setState({
          interactiveItems: currentItems.reduce((acc, i) => {
            acc[i.id] = {
              isInteractive: false,
              interactId: null
            }
            return acc
          }, {})
        })
      }

      if (currentItems.map((ci) => ci.id).join(',') === Object.keys(dataSources).join(',')) {
        this.setState({
          phantomRenderSign: true
        })
      }
    }
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.onResize, false)
    Object.keys(this.charts).forEach((k) => {
      this.charts[k].dispose()
    })
  }

  private getQs = (qs) => {
    const qsArr = qs.split('&')
    return qsArr.reduce((acc, str) => {
      const arr = str.split('=')
      acc[arr[0]] = arr[1]
      return acc
    }, {})
  }

  private getChartData = (renderType, itemId, widgetId, queryParams) => {
    const {
      currentItems,
      widgets,
      itemQueryParams,
      onLoadResultset
    } = this.props

    const dashboardItem = currentItems.find((c) => c.id === Number(itemId))
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
          this.charts[chartInstanceId] = currentChart
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

    const cachedQueryParams = itemQueryParams[itemId]

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
      params = queryParams.params ? queryParams.params : cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
      pagination = queryParams.pagination ? queryParams.pagination : cachedQueryParams.pagination
    } else {
      filters = cachedQueryParams.filters
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
      pagination = cachedQueryParams.pagination
    }

    onLoadResultset(
      itemId,
      dashboardItem.aesStr,
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

  private renderChart = (itemId, widget, dataSource, chartInfo, interactIndex?) => {
    const chartInstance = this.charts[`widget_${itemId}`]
    const { id, name, desc, flatTable_id, widgetlib_id } = widget
    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        id,
        name,
        desc,
        flatTable_id,
        widgetlib_id,
        ...JSON.parse(widget)
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
    setTimeout(() => {
      const { currentItems } = this.props
      const { modifiedPositions } = this.state

      const newModifiedItems = changePosition(modifiedPositions, layout, (pos) => {
        const dashboardItem = currentItems.find((item) => item.id === Number(pos.i))
        const chartInstanceId = `widget_${dashboardItem.id}`
        const chartInstance = this.charts[chartInstanceId]
        if (chartInstance) { chartInstance.resize() }
      })

      this.setState({
        modifiedPositions: newModifiedItems
      })
    })
  }

  private onResize = () => {
    if (this.resizeSign === void 0) { clearTimeout(this.resizeSign) }
    this.resizeSign = setTimeout(() => {
      this.props.currentItems.forEach((ci) => {
        const chartInstance = this.charts[`widget_${ci.id}`]
        if (chartInstance) { chartInstance.resize() }
      })
      clearTimeout(this.resizeSign)
      this.resizeSign = void 0
    }, 500)
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
      itemQueryParams,
      onLoadWidgetCsv
    } = this.props

    const dashboardItem = currentItems.find((c) => c.id === itemId)
    const widget = widgets.find((w) => w.id === dashboardItem.widget_id)

    const cachedQueryParams = itemQueryParams[itemId]

    const filters = cachedQueryParams.filters
    const params = cachedQueryParams.params

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
    const {currentItems, dataSources, loadings, widgets} = this.props
    const { modifiedPositions } = this.state
    const item = currentItems.find((ci) => ci.id === id)
    const modifiedPosition = modifiedPositions[currentItems.indexOf(item)]
    const widget = widgets.find((w) => w.id === item.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
    const data = dataSources[id]
    const loading = loadings[id]
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
  private handleLegitimateUser = () => {
    const {type, shareInfo} = this.state
    this.setState({
      showLogin: false
    }, () => {
      this.loadShareContent({type, shareInfo})
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
      dataSources
    } = this.props

    const triggerItem = currentItems.find((ci) => ci.id === itemId)
    const triggerWidget = widgets.find((w) => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
    const dataSource = dataSources[itemId].dataSource
    let triggeringData

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      triggeringData = dataSource[interactIndexOrId]
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo, interactIndexOrId)
    } else {
      triggeringData = dataSource.find((ds) => ds.antDesignTableId === interactIndexOrId)
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

      let linkagerId
      const linkageFilters = []
      const linkageParams = []
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

  private turnOffInteract = (itemId) => () => {
    const {
      currentItems,
      widgets,
      dataSources
    } = this.props

    const triggerItem = currentItems.find((ci) => ci.id === itemId)
    const triggerWidget = widgets.find((w) => w.id === triggerItem.widget_id)
    const chartInfo = widgetlibs.find((wl) => wl.id === triggerWidget.widgetlib_id)
    const dataSource = dataSources[itemId].dataSource

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      this.renderChart(itemId, triggerWidget, dataSource, chartInfo)
    }

    this.setState({
      interactiveItems: {
        ...this.state.interactiveItems,
        [itemId]: {
          isInteractive: false,
          interactId: null
        }
      }
    })

    Object.keys(this.interactCallbacks[itemId]).map((linkagerId) => {
      this.interactCallbacks[itemId][linkagerId]()
      delete this.interactCallbacks[itemId][linkagerId]
    })
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
          case 'datetime':
            if (formValue) {
              currentParam = {
                k: columnAndType[0],
                v: `'${formValue}'`
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
          case 'datetimeRange':
            if (formValue.length) {
              currentParam = formValue.map((fv) => ({
                k: columnAndType[0],
                v: `'${fv}'`
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
              currentFilter = `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD'), columnAndType[1])} and ${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD'), columnAndType[1])}`
            }
            break
          case 'datetimeRange':
            if (formValue.length) {
              currentFilter = `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])} and ${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])}`
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

      this.getChartData('rerender', itemId, item.widget_id, {
        globalFilters: this.interactGlobalFilters[itemId].filters
          ? Object.values(this.interactGlobalFilters[itemId].filters).join(` and `)
          : '',
        globalParams: this.interactGlobalFilters[itemId].params
          ? Object.values(this.interactGlobalFilters[itemId].params).reduce((arr, val) => arr.concat(val), [])
          : []
      })
    })

    function getValidValue (val, type) {
      return SQL_NUMBER_TYPES.indexOf(type) >= 0 ? val : `'${val}'`
    }
  }

  private getCascadeSource = (token, sql) => (itemId, controlId, flatTableId, column, parents) => {
    this.props.onLoadCascadeSourceFromItem(itemId, controlId, token, sql, column, parents)
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

  private loadCascadeSourceInsideGlobalFilters = (token) => (key, flatTableId, column, parents) => {
    this.props.onLoadCascadeSourceFromDashboard(key, flatTableId, token, column, parents)
  }

  public render () {
    const {
      title,
      currentItems,
      dataSources,
      loadings,
      widgets,
      itemQueryParams,
      downloadCsvLoadings,
      dashboardCascadeSources,
      itemsCascadeSources
    } = this.props

    const {
      mounted,
      shareInfo,
      modifiedPositions,
      filtersVisible,
      filtersDashboardItem,
      filtersKeys,
      showLogin,
      filtersTypes,
      allowFullScreen,
      interactiveItems,
      globalFilterTableSource,
      phantomRenderSign
    } = this.state

    let grids = null
    let fullScreenComponent = null
    let loginPanel = null

    const layouts = {
      lg: []
    }
    const itemblocks = []

    if (currentItems && widgets) {
      if (widgets.length === currentItems.length) {
        currentItems.forEach((item, index) => {
          layouts.lg.push({
            x: item.position_x,
            y: item.position_y,
            w: item.width,
            h: item.length,
            i: `${item.id}`
          })

          const widget = widgets.find((w) => w.id === item.widget_id)
          const data = dataSources[item.id]
          const loading = loadings[item.id]
          const modifiedPosition = modifiedPositions[index]
          const downloadCsvLoading = downloadCsvLoadings[item.id]
          const sql = itemQueryParams[item.id]
          const cascadeSources = itemsCascadeSources[item.id]
          const { isInteractive, interactId } = interactiveItems[item.id]

          if (widget) {
            const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
            const permission = widget['permission']
            const isDownload = permission ? permission.indexOf('download') > -1 : false

            itemblocks.push((
              <div key={item.id}>
                <DashboardItem
                  w={modifiedPosition ? modifiedPosition.w : 0}
                  h={modifiedPosition ? modifiedPosition.h : 0}
                  itemId={item.id}
                  widget={widget}
                  chartInfo={chartInfo}
                  data={data}
                  loading={loading}
                  triggerType={item.trigger_type}
                  triggerParams={item.trigger_params}
                  isAdmin={false}
                  isShared
                  isDownload={isDownload}
                  shareInfo={item.aesStr}
                  downloadCsvLoading={downloadCsvLoading}
                  isInteractive={isInteractive}
                  interactId={interactId}
                  cascadeSources={cascadeSources}
                  onGetChartData={this.getChartData}
                  onRenderChart={this.renderChart}
                  onShowFiltersForm={this.showFiltersForm}
                  onDownloadCsv={this.downloadCsv}
                  onTurnOffInteract={this.turnOffInteract}
                  onCheckTableInteract={this.checkInteract}
                  onDoTableInteract={this.doInteract}
                  onShowFullScreen={this.visibleFullScreen}
                  onGetCascadeSource={this.getCascadeSource(item.aesStr, {...sql, adHoc: widget.adhoc_sql})}
                />
              </div>
            ))
          }
        })

        grids = (
          <ResponsiveReactGridLayout
            className="layout"
            style={{marginTop: '-16px'}}
            rowHeight={30}
            margin={[20, 20]}
            breakpoints={USER_GRID_BREAKPOINTS}
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

        fullScreenComponent = (
          <FullScreenPanel
            widgets={widgets}
            widgetlibs={widgetlibs}
            currentDashboard={{ widgets: currentItems }}
            currentDatasources={dataSources}
            visible={allowFullScreen}
            isVisible={this.visibleFullScreen}
            onRenderChart={this.renderChart}
            currentDataInFullScreen={this.state.currentDataInFullScreen}
            onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
          />
        )
      }
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )

      fullScreenComponent = ''
    }

    loginPanel = showLogin ? <Login shareInfo={this.state.shareInfo} legitimateUser={this.handleLegitimateUser} /> : ''

    const globalFilterContainerClass = classnames({
      [utilStyles.hide]: !globalFilterTableSource || !globalFilterTableSource.length
    })

    const phantomDOM = phantomRenderSign && (<div id="phantomRenderSign"></div>)

    return (
      <Container>
        <Helmet title={title} />
        <Container.Title>
          <Row>
            <Col span={24}>
              <h2 className={styles.shareTitle}>{title}</h2>
            </Col>
          </Row>
          <Row className={globalFilterContainerClass}>
            <Col span={24}>
              <GlobalFilters
                filters={globalFilterTableSource || []}
                cascadeSources={dashboardCascadeSources || {}}
                onChange={this.globalFilterChange}
                onCascadeSelectChange={this.loadCascadeSourceInsideGlobalFilters(shareInfo)}
              />
            </Col>
          </Row>
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        <Modal
          title="条件查询"
          wrapClassName="ant-modal-xlarge"
          visible={filtersVisible}
          onCancel={this.hideFiltersForm}
          footer={false}
        >
          <DashboardItemFilters
            loginUser={null}
            itemId={filtersDashboardItem}
            keys={filtersKeys}
            types={filtersTypes}
            onQuery={this.doFilterQuery}
            wrappedComponentRef={f => { this.dashboardItemFilters = f }}
          />
        </Modal>
        {fullScreenComponent}
        {loginPanel}
        {phantomDOM}
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  title: makeSelectTitle(),
  config: makeSelectConfig(),
  widgets: makeSelectWidgets(),
  currentItems: makeSelectItems(),
  dataSources: makeSelectDataSources(),
  loadings: makeSelectLoadings(),
  itemQueryParams: makeSelectItemQueryParams(),
  downloadCsvLoadings: makeSelectItemDownloadCsvLoadings(),
  itemsCascadeSources: makeSelectItemsCascadeSources(),
  dashboardCascadeSources: makeSelectDashboardCascadeSources()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token, resolve, reject) => dispatch(getDashboard(token, resolve, reject)),
    onLoadWidget: (token, resolve, reject) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (itemId, token, sql, sorts, offset, limit, useCache, expired) => dispatch(getResultset(itemId, token, sql, sorts, offset, limit, useCache, expired)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, token, sql, sorts, offset, limit) => dispatch(loadWidgetCsv(itemId, token, sql, sorts, offset, limit)),
    onLoadCascadeSourceFromItem: (itemId, controlId, token, sql, column, parents) => dispatch(loadCascadeSourceFromItem(itemId, controlId, token, sql, column, parents)),
    onLoadCascadeSourceFromDashboard: (controlId, flatTableId, token, column, parents) => dispatch(loadCascadeSourceFromDashboard(controlId, flatTableId, token, column, parents))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'shareDashboard', reducer })
const withSaga = injectSaga({ key: 'shareDashboard', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Share)
