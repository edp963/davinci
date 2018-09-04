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

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../../app/components/Container'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import GlobalFilters from '../../../app/containers/Dashboard/components/globalFilter/GlobalFilters'
import FullScreenPanel from '../../../app/containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { RenderType, IPivotProps } from '../../../app/containers/Widget/components/Pivot/Pivot'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')

import {
  getDashboard,
  getWidget,
  getResultset,
  setIndividualDashboard,
  loadWidgetCsv,
  loadCascadeSourceFromDashboard,
  resizeAllDashboardItem
} from './actions'
import {
  makeSelectTitle,
  makeSelectConfig,
  makeSelectDashboardCascadeSources,
  makeSelectWidgets,
  makeSelectItems,
  makeSelectItemsInfo
} from './selectors'
import { decodeMetricName } from '../../../app/containers/Widget/components/util'
import {
  DEFAULT_SPLITER,
  ECHARTS_RENDERER,
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_MARGIN,
  SQL_NUMBER_TYPES,
  GRID_BREAKPOINTS
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
      downloadCsvLoading: boolean
      interactId: string
      renderType: RenderType
    }
  },
  widgets: any[],
  dashboardCascadeSources: any,
  onLoadDashboard: (shareInfo: any, success: (dashboard) => void, error: (err) => void) => void,
  onLoadWidget: (aesStr: string, success?: (widget) => void, error?: (err) => void) => void,
  onLoadResultset: (
    renderType: RenderType,
    dashboardItemId: number,
    dataToken: string,
    params: {
      groups: string[]
      aggregators: Array<{column: string, func: string}>
      filters: string[]
      linkageFilters: string[]
      globalFilters: string[]
      params: Array<{name: string, value: string}>
      linkageParams: Array<{name: string, value: string}>
      globalParams: Array<{name: string, value: string}>
      cache: boolean
      expired: number
    }
  ) => void,
  onSetIndividualDashboard: (id, shareInfo) => void,
  onLoadWidgetCsv: (itemId: number, pivotProps: IPivotProps, dataToken: string) => void,
  onLoadCascadeSourceFromItem: (itemId, controlId, token, sql, column, parents) => void,
  onLoadCascadeSourceFromDashboard: (key, flatTableId, shareInfo, cascadeColumn, parents?) => void
  onResizeAllDashboardItem: () => void
}

interface IDashboardStates {
  mounted: boolean,
  type: string,
  shareInfo: string,
  modalLoading: boolean,
  allowFullScreen: boolean,
  currentDataInFullScreen: any,
  showLogin: boolean,
  linkageTableSource: any[],
  globalFilterTableSource: any[],
  phantomRenderSign: boolean
}

export class Share extends React.Component<IDashboardProps, IDashboardStates> {
  constructor (props) {
    super(props)
    this.state = {
      mounted: false,
      type: '',
      shareInfo: '',

      modalLoading: false,

      allowFullScreen: false,
      currentDataInFullScreen: {},
      showLogin: false,
      linkageTableSource: [],
      globalFilterTableSource: [],

      phantomRenderSign: false
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: NodeJS.Timer

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
        // this.setState({
        //   linkageTableSource: this.adjustLinkageTableSource(dashboard, dashboard.widgets),
        //   globalFilterTableSource: this.adjustGlobalFilterTableSource(dashboard, dashboard.widgets)
        // }, () => {
        //   this.state.globalFilterTableSource.forEach((gft) => {
        //     if (gft.type === 'cascadeSelect' && !gft.parentColumn) {
        //       onLoadCascadeSourceFromDashboard(gft.key, gft.flatTableId, qs.shareInfo, gft.cascadeColumn)
        //     }
        //   })
        // })
      }, (err) => {
        if (err.response.status === 403) {
          this.setState({
            showLogin: true
          })
        }
      })
    } else {
      onLoadWidget(qs.shareInfo, (w) => {
        onSetIndividualDashboard(w.id, qs.shareInfo)
        // this.setState({
        //   linkageTableSource: [],
        //   globalFilterTableSource: []
        // })
      }, (err) => {
        if (err.response.status === 403) {
          this.setState({
            showLogin: true
          })
        }
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
    window.addEventListener('resize', this.onWindowResize, false)
    this.setState({ mounted: true })
  }

  public componentWillReceiveProps (nextProps: IDashboardProps) {
    const { currentItems, currentItemsInfo } = nextProps
    if (currentItemsInfo) {
      if (Object.values(currentItemsInfo).filter((info) => !!info.datasource.length).length === currentItems.length) {
        this.setState({
          phantomRenderSign: true
        })
      }
    }
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.onWindowResize, false)
  }

  private getQs = (qs) => {
    const qsArr = qs.split('&')
    return qsArr.reduce((acc, str) => {
      const arr = str.split('=')
      acc[arr[0]] = arr[1]
      return acc
    }, {})
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      currentItemsInfo,
      widgets,
      onLoadResultset
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IPivotProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis } = widgetConfig

    const cachedQueryParams = currentItemsInfo[itemId].queryParams

    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams

    if (queryParams) {
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== undefined ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params ? queryParams.params : cachedQueryParams.params
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
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }

    onLoadResultset(
      renderType,
      itemId,
      widget.dataToken,
      {
        groups,
        aggregators,
        filters: filters.map((i) => i.config.sql),
        linkageFilters,
        globalFilters,
        params,
        linkageParams,
        globalParams,
        cache: false,
        expired: 0
      }
    )
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

  private onWindowResize = () => {
    if (this.resizeSign) {
      clearTimeout(this.resizeSign)
    }
    this.resizeSign = setTimeout(() => {
      this.props.onResizeAllDashboardItem()
      clearTimeout(this.resizeSign)
      this.resizeSign = void 0
    }, 500)
  }

  private downloadCsv = (itemId: number, pivotProps: IPivotProps, shareInfo: string) => {
    const {
      currentItemsInfo,
      onLoadWidgetCsv
    } = this.props

    const { filters, params } = currentItemsInfo[itemId].queryParams

    onLoadWidgetCsv(itemId, pivotProps, shareInfo)
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
            .reduce((arr, val) => (arr as any).concat(...(val as any)), [])
            .join(' and '),
          linkageParams: Object.values(mergedParams).reduce((arr, val) => (arr as any).concat(...(val as any)), [])
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
              .reduce((arr, val) => (arr as any).concat(...(val as any)), [])
              .join(' and '),
            linkageParams: Object.values(params).reduce((arr, val) => (arr as any).concat(...(val as any)), [])
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
              currentFilter = `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD'),
              columnAndType[1])} and ${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD'), columnAndType[1])}`
            }
            break
          case 'datetimeRange':
            if (formValue.length) {
              currentFilter = `${columnAndType[0]} >= ${getValidValue(moment(formValue[0]).format('YYYY-MM-DD HH:mm:ss'),
              columnAndType[1])} and ${columnAndType[0]} <= ${getValidValue(moment(formValue[1]).format('YYYY-MM-DD HH:mm:ss'), columnAndType[1])}`
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
          ? Object.values(this.interactGlobalFilters[itemId].params).reduce((arr, val) => (arr as any).concat(val), [])
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
      currentItemsInfo,
      widgets,
      dashboardCascadeSources
    } = this.props

    const {
      mounted,
      shareInfo,
      showLogin,
      allowFullScreen,
      globalFilterTableSource,
      phantomRenderSign
    } = this.state

    let grids = null
    // let fullScreenComponent = null
    let loginPanel = null

    if (currentItems) {
      const itemblocks = []
      const layouts = {lg: []}

      currentItems.forEach((dashboardItem) => {
        const { id, x, y, width, height, widgetId, polling, frequency } = dashboardItem
        const {
          datasource,
          loading,
          downloadCsvLoading,
          interactId,
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
              shareInfo={widget.dataToken}
              downloadCsvLoading={downloadCsvLoading}
              interactId={interactId}
              onGetChartData={this.getChartData}
              onDownloadCsv={this.downloadCsv}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              renderType={renderType}
              container="share"
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
        console.log(layouts)
      })

      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-16px'}}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_ITEM_MARGIN, GRID_ITEM_MARGIN]}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          isDraggable={false}
          isResizable={false}
        >
          {itemblocks}
        </ResponsiveReactGridLayout>
      )

      // fullScreenComponent = (
      //   <FullScreenPanel
      //     widgets={widgets}
      //     widgetlibs={widgetlibs}
      //     currentDashboard={{ widgets: currentItems }}
      //     currentDatasources={dataSources}
      //     visible={allowFullScreen}
      //     isVisible={this.visibleFullScreen}
      //     onRenderChart={this.renderChart}
      //     currentDataInFullScreen={this.state.currentDataInFullScreen}
      //     onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
      //   />
      // )
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )

      // fullScreenComponent = ''
    }

    loginPanel = showLogin ? <Login shareInfo={this.state.shareInfo} legitimateUser={this.handleLegitimateUser} /> : ''

    const globalFilterContainerClass = classnames({
      [utilStyles.hide]: !globalFilterTableSource || !globalFilterTableSource.length
    })

    const phantomDOM = phantomRenderSign && (<div id="phantomRenderSign" />)

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
        {/* {fullScreenComponent} */}
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
  currentItemsInfo: makeSelectItemsInfo(),
  dashboardCascadeSources: makeSelectDashboardCascadeSources()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token, resolve, reject) => dispatch(getDashboard(token, resolve, reject)),
    onLoadWidget: (token, resolve, reject) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (renderType, itemid, dataToken, params) => dispatch(getResultset(renderType, itemid, dataToken, params)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, pivotProps, dataToken) => dispatch(loadWidgetCsv(itemId, pivotProps, dataToken)),
    onLoadCascadeSourceFromItem: (itemId, controlId, token, sql, column, parents) => dispatch(loadCascadeSourceFromItem(itemId, controlId, token, sql, column, parents)),
    onLoadCascadeSourceFromDashboard: (controlId, flatTableId, token, column, parents) => dispatch(loadCascadeSourceFromDashboard(controlId, flatTableId, token, column, parents)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem())
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
