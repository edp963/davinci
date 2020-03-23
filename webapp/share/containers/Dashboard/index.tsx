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
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

// import html2canvas from 'html2canvas'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { FieldSortTypes } from 'containers/Widget/components/Config/Sort'
import { widgetDimensionMigrationRecorder } from 'utils/migrationRecorders'

import Container from 'components/Container'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'
import DashboardItem from 'containers/Dashboard/components/DashboardItem'
import FullScreenPanel from 'containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { ChartTypes } from 'containers/Widget/config/chart/ChartTypes'
import { IMapItemControlRequestParams, IMapControlOptions, IFilters } from 'components/Filters/types'
import GlobalControlPanel from 'components/Filters/FilterPanel'
import DownloadList from 'components/DownloadList'
import { getValidColumnValue } from 'components/Filters/util'
import HeadlessBrowserIdentifier from 'share/components/HeadlessBrowserIdentifier'

import { RenderType, IWidgetConfig, IWidgetProps } from 'containers/Widget/components/Widget'
import { Row, Col, message } from 'antd'

import {
  getDashboard,
  getWidget,
  getResultset,
  setIndividualDashboard,
  loadWidgetCsv,
  loadSelectOptions,
  resizeAllDashboardItem,
  drillDashboardItem,
  deleteDrillHistory,
  setSelectOptions,
  selectDashboardItemChart,
  loadDownloadList,
  downloadFile,
  initiateDownloadTask,
  sendShareParams
} from './actions'
import {
  makeSelectDashboard,
  makeSelectTitle,
  makeSelectConfig,
  makeSelectDashboardSelectOptions,
  makeSelectWidgets,
  makeSelectItems,
  makeSelectItemsInfo,
  makeSelectLinkages,
  makeSelectDownloadList,
  makeSelectShareParams
} from './selectors'
import { decodeMetricName, getTable } from 'app/containers/Widget/components/util'
import {
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_MARGIN,
  GRID_BREAKPOINTS,
  DEFAULT_TABLE_PAGE,
  DOWNLOAD_LIST_POLLING_FREQUENCY
} from 'app/globalConstants'

import styles from 'app/containers/Dashboard/Dashboard.less'

import Login from 'share/components/Login'
import { IQueryConditions, IDataRequestParams, QueryVariable, IDataDownloadParams } from 'app/containers/Dashboard/types'
import { getShareClientId } from 'share/util'
import { IDownloadRecord, DownloadTypes } from 'app/containers/App/types'
import { IFormedView } from 'app/containers/View/types'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export enum DashboardItemStatus {
  Initial,
  Fulfilled,
  Error
}

interface IDashboardProps {
  dashboard: any
  title: string
  config: string
  currentItems: any[],
  currentItemsInfo: {
    [key: string]: {
      datasource: {
        pageNo: number
        pageSize: number
        resultList: any[]
        totalCount: number
      }
      status: DashboardItemStatus,
      selectedItems?: number[]
      loading: boolean
      queryConditions: IQueryConditions
      downloadCsvLoading: boolean
      renderType: RenderType,
      controlSelectOptions: IMapControlOptions
      errorMessage: string
    }
  },
  widgets: any[],
  dashboardSelectOptions: any,
  linkages: any[]
  shareParams: object
  downloadList: IDownloadRecord[]
  onLoadDashboard: (shareToken: any, error: (err) => void) => void,
  onLoadWidget: (aesStr: string, success?: (widget) => void, error?: (err) => void) => void,
  onLoadResultset: (
    renderType: RenderType,
    dashboardItemId: number,
    dataToken: string,
    requestParams: IDataRequestParams
  ) => void,
  onSetIndividualDashboard: (id, shareToken) => void,
  onLoadWidgetCsv: (
    itemId: number,
    requestParams: IDataRequestParams,
    dataToken: string
  ) => void,
  onLoadSelectOptions: (controlKey, dataToken, paramsOrOptions, itemId?: number) => void
  onSetSelectOptions: (controlKey: string, options: any[], itemId?: number) => void
  onResizeAllDashboardItem: () => void
  onDrillDashboardItem: (itemId: number, drillHistory: any) => void
  onDeleteDrillHistory: (itemId: number, index: number) => void
  onSelectDashboardItemChart: (itemId: number, renderType: string, selectedItems: number[]) => void
  onInitiateDownloadTask: (shareClientId: string, dataToken: string, type: DownloadTypes, downloadParams?: IDataDownloadParams[], itemId?: number) => void
  onLoadDownloadList: (shareClientId: string, token: string) => void
  onDownloadFile: (id: number, shareClientId: string, token: string) => void
  onSendShareParams: (params: object) => void
}

interface IDashboardStates {
  type: string,
  shareToken: string
  views: {
    [key: string]: Partial<IFormedView>
  }
  modalLoading: boolean,
  interactingStatus: { [itemId: number]: boolean }
  allowFullScreen: boolean,
  currentDataInFullScreen: any,
  showLogin: boolean,
  headlessBrowserRenderSign: boolean
  controlTokenMapping: {
    [key: string]: string
  }
}

export class Share extends React.Component<IDashboardProps, IDashboardStates> {
  constructor (props) {
    super(props)
    this.state = {
      type: '',
      shareToken: '',
      views: {},

      modalLoading: false,
      interactingStatus: {},
      allowFullScreen: false,
      currentDataInFullScreen: {},
      showLogin: false,

      headlessBrowserRenderSign: false,

      controlTokenMapping: {}
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number = 0
  private shareClientId: string = getShareClientId()
  private downloadListPollingTimer: number

  /**
   * object
   * {
   *  type: this.state.type,
   *  shareToken: this.state.shareToken
   * }
   * @param qs
   */
  private loadShareContent = (qs) => {
    const {
      onLoadDashboard,
      onLoadWidget,
      onSetIndividualDashboard
    } = this.props

    // @FIXME 0.3 maintain `shareInfo` in links for legacy integration
    if (qs.type === 'dashboard') {
      onLoadDashboard(qs.shareInfo, (err) => {
        if (err.response.status === 403) {
          this.setState({
            showLogin: true
          })
        }
      })
    } else {
      onLoadWidget(qs.shareInfo, (w) => {
        onSetIndividualDashboard(w.id, qs.shareInfo)
      }, (err) => {
        if (err.response.status === 403) {
          this.setState({
            showLogin: true
          })
        }
      })
    }
  }

  public componentDidMount () {
    // urlparse
    const qs = this.querystring(location.href.substr(location.href.indexOf('?') + 1))
    // @FIXME 0.3 maintain `shareInfo` in links for legacy integration
    this.setState({
      type: qs.type,
      shareToken: qs.shareInfo
    })
    this.loadShareContent(qs)
    this.initPolling(qs.shareInfo)
    delete qs.type
    delete qs.shareInfo
    this.props.onSendShareParams(qs)
    window.addEventListener('resize', this.onWindowResize, false)
  }

  public componentWillReceiveProps (nextProps: IDashboardProps) {
    const { currentItems, currentItemsInfo, dashboard, widgets } = nextProps
    if (widgets && widgets !== this.props.widgets) {
      try {
        this.setState({
          views: widgets.reduce((obj, widget) => {
            return {
              ...obj,
              [widget.id]: { model: JSON.parse(widget.model) }
            }
          }, {})
        })
      } catch (error) {
        message.error(error)
      }
    }
    if (currentItemsInfo) {
      const initialedItems = Object.values(currentItemsInfo)
        .filter((info) => [DashboardItemStatus.Fulfilled, DashboardItemStatus.Error].includes(info.status))
      if (initialedItems.length === currentItems.length) {
        // FIXME
        setTimeout(() => {
          this.setState({
            headlessBrowserRenderSign: true
          })
        }, 5000)
      }
    }
    // if (dashboard && !this.props.dashboard) {
    //   const config = JSON.parse(dashboard.config || '{}')
    //   const globalControls = config.filters || []
    //   const controlTokenMapping = globalControls.map((control) => {
    //   })
    // }
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.onWindowResize, false)
    if (this.downloadListPollingTimer) {
      clearInterval(this.downloadListPollingTimer)
    }
  }


  private querystring = (str) => {
    return str.split('&').reduce((o, kv) => {
      const [key, value] = kv.split('=')
      if (!value) {
          return o
      }
      this.deep_set(o, key.split(/[\[\]]/g).filter((x) => x), value)
      return o
    }, {})
  }

  private deep_set (o, path, value) {
    let i = 0
    for (; i < path.length - 1; i++) {
        if (o[path[i]] === undefined) {
          o[decodeURIComponent(path[i])] = path[i + 1].match(/^\d+$/) ? [] : {}
        }
        o = o[decodeURIComponent(path[i])]
    }
    o[decodeURIComponent(path[i])] = decodeURIComponent(value)
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: IQueryConditions) => {
    this.getData(this.props.onLoadResultset, renderType, itemId, widgetId, queryConditions)
  }

  private initPolling = (token) => {
    this.props.onLoadDownloadList(this.shareClientId, token)
    this.downloadListPollingTimer = window.setInterval(() => {
      this.props.onLoadDownloadList(this.shareClientId, token)
    }, DOWNLOAD_LIST_POLLING_FREQUENCY)
  }

  // private downloadCsv = (itemId: number, widgetId: number, shareToken: string) => {
  //   this.getData(
  //     (renderType, itemId, dataToken, queryConditions) => {
  //       this.props.onLoadWidgetCsv(itemId, queryConditions, dataToken)
  //     },
  //     'rerender',
  //     itemId,
  //     widgetId
  //   )
  // }

  private initiateWidgetDownloadTask = (itemId: number, widgetId: number) => {
    const { widgets } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const queryConditions: IQueryConditions = {
      nativeQuery: false
    }
    try {
      const widgetProps: IWidgetProps = JSON.parse(widget.config)
      const { mode, selectedChart, chartStyles } = widgetProps
      if (mode === 'chart' && selectedChart === getTable().id) {
        queryConditions.nativeQuery = chartStyles.table.withNoAggregators
      }
    } catch (error) {
      message.error(error)
    }
    this.getData(
      (renderType, itemId, dataToken, requestParams) => {
        const downloadParams = [{
          ...requestParams,
          id: widgetId
        }]
        this.props.onInitiateDownloadTask(this.shareClientId, dataToken, DownloadTypes.Widget, downloadParams, itemId)
      },
      'rerender',
      itemId,
      widgetId,
      queryConditions
    )
  }

  private getData = (
    callback: (
      renderType: RenderType,
      itemId: number,
      dataToken: string,
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
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery || cachedQueryConditions.nativeQuery
      drillStatus = queryConditions.drillStatus || prevDrillHistory
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
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
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
      widget.dataToken,
      requestParams
    )
  }

  private onBreakpointChange = () => {
    this.onWindowResize()
  }

  private onWindowResize = () => {
    if (this.resizeSign) {
      clearTimeout(this.resizeSign)
    }
    this.resizeSign = window.setTimeout(() => {
      this.props.onResizeAllDashboardItem()
      clearTimeout(this.resizeSign)
      this.resizeSign = 0
    }, 500)
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

  private handleLegitimateUser = () => {
    const {type, shareToken} = this.state
    this.setState({
      showLogin: false
    }, () => {
      // @FIXME 0.3 maintain `shareInfo` in links for legacy integration
      this.loadShareContent({
        type,
        shareInfo: shareToken
      })
    })
  }

  private checkInteract = (itemId: number) => {
    const { linkages } = this.props
    const isInteractiveItem = linkages.some((lts) => {
      const { trigger } = lts
      const triggerId = +trigger[0]
      return triggerId === itemId
    })

    return isInteractiveItem
  }

  private doInteract = (itemId: number, triggerData) => {
    const {
      currentItems,
      linkages
    } = this.props

    const mappingLinkage = getMappingLinkage(itemId, linkages)
    this.interactingLinkagers = processLinkage(itemId, triggerData, mappingLinkage, this.interactingLinkagers)

    Object.keys(mappingLinkage).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', +linkagerItemId, item.widgetId, {
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

  private turnOffInteract = (itemId) => {
    const {
      linkages,
      currentItems
    } = this.props

    const refreshItemIds = removeLinkage(itemId, linkages, this.interactingLinkagers)
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
  }

  private getOptions = (controlKey: string, useOptions: boolean, paramsOrOptions, itemId?: number) => {
    if (useOptions) {
      this.props.onSetSelectOptions(controlKey, paramsOrOptions, itemId)
    } else {
      this.props.onLoadSelectOptions(controlKey, this.state.shareToken, paramsOrOptions, itemId)
    }
  }

  private globalControlSearch = (requestParamsByItem: IMapItemControlRequestParams) => {
    const { currentItems, widgets, currentItemsInfo } = this.props

    Object.entries(requestParamsByItem).forEach(([itemId, requestParams]) => {
      const item = currentItems.find((ci) => ci.id === Number(itemId))

      if (item) {
        const widget = widgets.find((w) => w.id === item.widgetId)
        let pagination = currentItemsInfo[itemId].queryConditions.pagination
        let noAggregators = false

        try {
          const widgetProps: IWidgetProps = JSON.parse(widget.config)
          const { mode, selectedChart, chartStyles } = widgetProps
          if (mode === 'chart'
              && selectedChart === getTable().id
              && chartStyles.table.withPaging) {
            pagination = {
              pageSize: Number(chartStyles.table.pageSize),
              ...pagination,
              pageNo: DEFAULT_TABLE_PAGE
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
    // let sqls = widgetConfig.filters.map((i) => i.config.sql)
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
            const sqlType = model[attr] && model[attr]['sqlType'] ? model[attr]['sqlType'] : 'VARCHAR'
            const filterJson: IFilters = {
              name: attr,
              operator: 'in',
              type: 'filter',
              value: coustomTable[attr].map((val) => getValidColumnValue(val, sqlType)),
              sqlType
            }
            coustomTableSqls.push(filterJson)
          //  coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
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
        const sqlType = model[name] && model[name]['sqlType'] ? model[name]['sqlType'] : 'VARCHAR'
       // sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
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

  private selectChartsItems = (itemId, renderType, selectedItems) => {
    const { onSelectDashboardItemChart } = this.props
    onSelectDashboardItemChart(itemId, renderType, selectedItems)
  }

  private loadDownloadList = () => {
    this.props.onLoadDownloadList(this.shareClientId, this.state.shareToken)
  }

  private downloadFile = (id) => {
    this.props.onDownloadFile(id, this.shareClientId, this.state.shareToken)
  }

  public render () {
    const {
      dashboard,
      title,
      currentItems,
      currentItemsInfo,
      widgets,
      linkages,
      dashboardSelectOptions,
      downloadList
    } = this.props

    const {
      shareToken,
      showLogin,
      views,
      interactingStatus,
      allowFullScreen,
      headlessBrowserRenderSign
    } = this.state

    let grids = null
    let fullScreenComponent = null
    let loginPanel = null

    if (currentItems) {
      const itemblocks: React.ReactNode[] = []
      const layouts = {lg: []}

      currentItems.forEach((dashboardItem) => {
        const { id, x, y, width, height, widgetId, polling, frequency } = dashboardItem
        const {
          datasource,
          loading,
          downloadCsvLoading,
          renderType,
          queryConditions,
          controlSelectOptions,
          selectedItems,
          errorMessage
        } = currentItemsInfo[id]

        const widget = widgets.find((w) => w.id === widgetId)
        const view = views[widgetId]
        const interacting = interactingStatus[id] || false
        const drillHistory = queryConditions.drillHistory
        const isTrigger = linkages && linkages.length ? linkages.map((linkage) => linkage.trigger[0]
        ).some((tr) => tr === String(id)) : false

        itemblocks.push((
          <div key={id}>
            <DashboardItem
              itemId={id}
              widget={widget}
              widgets={widgets}
              view={view}
              isTrigger={isTrigger}
              datasource={datasource}
              loading={loading}
              polling={polling}
              onDrillData={this.dataDrill}
              onSelectDrillHistory={this.selectDrillHistory}
              interacting={interacting}
              drillHistory={drillHistory}
              frequency={frequency}
              shareToken={widget.dataToken}
              downloadCsvLoading={downloadCsvLoading}
              renderType={renderType}
              controlSelectOptions={controlSelectOptions}
              queryConditions={queryConditions}
              errorMessage={errorMessage}
              onGetChartData={this.getChartData}
              onDownloadCsv={this.initiateWidgetDownloadTask}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              onGetControlOptions={this.getOptions}
              container="share"
              selectedItems={selectedItems || []}
              onSelectChartsItems={this.selectChartsItems}
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
          style={{marginTop: '-16px'}}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_ITEM_MARGIN, GRID_ITEM_MARGIN]}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={false}
          useCSSTransforms={false}
          isDraggable={false}
          isResizable={false}
        >
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
      fullScreenComponent = allowFullScreen
        ? (
          <FullScreenPanel
            widgets={widgets}
            currentItems={currentItems}
            currentDashboard={dashboard}
            currentItemsInfo={currentItemsInfo}
            visible={allowFullScreen}
            isVisible={this.visibleFullScreen}
            mapOptions={dashboardSelectOptions}
            onSearch={this.globalControlSearch}
            onGetControlOptions={this.getOptions}
            onGetChartData={this.getChartData}
            onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
            chartDetail={this.state.currentDataInFullScreen}
          />
        )
        : <div/>
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )

      fullScreenComponent = ''
    }

    loginPanel = showLogin ? <Login shareToken={shareToken} legitimateUser={this.handleLegitimateUser} /> : ''

    const headlessBrowserRenderParentNode = document.getElementById('app')

    return (
      <Container>
        <Helmet title={title} />
        <Container.Title>
          <Row>
            <Col span={24}>
              <h2 className={styles.shareTitle}>{title}</h2>
              <div className={styles.shareDownloadListToggle}>
                <DownloadList
                  downloadList={downloadList}
                  onLoadDownloadList={this.loadDownloadList}
                  onDownloadFile={this.downloadFile}
                />
              </div>
            </Col>
          </Row>

          <GlobalControlPanel
            currentDashboard={dashboard}
            currentItems={currentItems}
            onGetOptions={this.getOptions}
            mapOptions={dashboardSelectOptions}
            onSearch={this.globalControlSearch}
          />
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        {fullScreenComponent}
        {loginPanel}
        <HeadlessBrowserIdentifier
          renderSign={headlessBrowserRenderSign}
          parentNode={headlessBrowserRenderParentNode}
        />
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboard: makeSelectDashboard(),
  title: makeSelectTitle(),
  config: makeSelectConfig(),
  widgets: makeSelectWidgets(),
  currentItems: makeSelectItems(),
  currentItemsInfo: makeSelectItemsInfo(),
  dashboardSelectOptions: makeSelectDashboardSelectOptions(),
  linkages: makeSelectLinkages(),
  downloadList: makeSelectDownloadList(),
  shareParams: makeSelectShareParams()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token, reject) => dispatch(getDashboard(token, reject)),
    onLoadWidget: (token, resolve, reject) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (renderType, itemid, dataToken, requestParams) => dispatch(getResultset(renderType, itemid, dataToken, requestParams)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, requestParams, dataToken) => dispatch(loadWidgetCsv(itemId, requestParams, dataToken)),
    onLoadSelectOptions: (controlKey, dataToken, paramsOrOptions, itemId) => dispatch(loadSelectOptions(controlKey, dataToken, paramsOrOptions, itemId)),
    onSetSelectOptions: (controlKey, options, itemId) => dispatch(setSelectOptions(controlKey, options, itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onDrillDashboardItem: (itemId, drillHistory) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDeleteDrillHistory: (itemId, index) => dispatch(deleteDrillHistory(itemId, index)),
    onSelectDashboardItemChart: (itemId, renderType, selectedItems) => dispatch(selectDashboardItemChart(itemId, renderType, selectedItems)),
    onInitiateDownloadTask: (shareClientId, id, type, downloadParams?) => dispatch(initiateDownloadTask(shareClientId, id, type, downloadParams)),
    onLoadDownloadList: (shareClinetId, token) => dispatch(loadDownloadList(shareClinetId, token)),
    onDownloadFile: (id, shareClientId, token) => dispatch(downloadFile(id, shareClientId, token)),
    onSendShareParams: (params) => dispatch(sendShareParams(params))
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
