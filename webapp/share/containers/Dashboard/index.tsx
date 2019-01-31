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

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../../app/components/Container'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import FullScreenPanel from '../../../app/containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import { Responsive, WidthProvider } from '../../../libs/react-grid-layout'

import { IMapItemFilterValue } from '../../../app/components/Filters'
import DashboardFilterPanel from 'containers/Dashboard/components/DashboardFilterPanel'

import { RenderType, IWidgetConfig } from '../../../app/containers/Widget/components/Widget'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'

import {
  getDashboard,
  getWidget,
  getResultset,
  setIndividualDashboard,
  loadWidgetCsv,
  loadCascadeSourceFromDashboard,
  resizeAllDashboardItem,
  drillDashboardItem,
  deleteDrillHistory
} from './actions'
import {
  makeSelectDashboard,
  makeSelectTitle,
  makeSelectConfig,
  makeSelectDashboardCascadeSources,
  makeSelectWidgets,
  makeSelectItems,
  makeSelectItemsInfo,
  makeSelectLinkages
} from './selectors'
import { decodeMetricName } from '../../../app/containers/Widget/components/util'
import {
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_MARGIN,
  GRID_BREAKPOINTS
} from '../../../app/globalConstants'

const styles = require('../../../app/containers/Dashboard/Dashboard.less')

import Login from '../../components/Login/index'
import { IQueryConditions, IDataRequestParams, QueryVariable } from '../../../app/containers/Dashboard/Grid'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

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
      loading: boolean
      queryConditions: IQueryConditions
      downloadCsvLoading: boolean
      renderType: RenderType
    }
  },
  widgets: any[],
  dashboardCascadeSources: any,
  linkages: any[]
  onLoadDashboard: (shareInfo: any, error: (err) => void) => void,
  onLoadWidget: (aesStr: string, success?: (widget) => void, error?: (err) => void) => void,
  onLoadResultset: (
    renderType: RenderType,
    dashboardItemId: number,
    dataToken: string,
    requestParams: IDataRequestParams
  ) => void,
  onSetIndividualDashboard: (id, shareInfo) => void,
  onLoadWidgetCsv: (
    itemId: number,
    requestParams: IDataRequestParams,
    dataToken: string
  ) => void,
  onLoadCascadeSourceFromDashboard: (controlId, viewId, dataToken, columns, parents) => void
  onResizeAllDashboardItem: () => void
  onDrillDashboardItem: (itemId: number, drillHistory: any) => void
  onDeleteDrillHistory: (itemId: number, index: number) => void
}

interface IDashboardStates {
  mounted: boolean,
  type: string,
  shareInfo: string,
  modalLoading: boolean,
  interactingStatus: { [itemId: number]: boolean }
  allowFullScreen: boolean,
  currentDataInFullScreen: any,
  showLogin: boolean,
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
      interactingStatus: {},
      allowFullScreen: false,
      currentDataInFullScreen: {},
      showLogin: false,

      phantomRenderSign: false
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number = 0

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
      onSetIndividualDashboard
    } = this.props

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
      if (Object.values(currentItemsInfo).filter((info) => !!info.datasource.resultList.length).length === currentItems.length) {
        // FIXME
        setTimeout(() => {
          this.setState({
            phantomRenderSign: true
          })
        }, 5000)
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

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: Partial<IQueryConditions>) => {
    this.getData(this.props.onLoadResultset, renderType, itemId, widgetId, queryConditions)
  }

  private downloadCsv = (itemId: number, widgetId: number, shareInfo: string) => {
    this.getData(
      (renderType, itemId, dataToken, queryConditions) => {
        this.props.onLoadWidgetCsv(itemId, queryConditions, dataToken)
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
      dataToken: string,
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
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryConditions = currentItemsInfo[itemId].queryConditions

    let linkageFilters
    let globalFilters
    let variables
    let linkageVariables
    let globalVariables
    let drillStatus
    let pagination
    let nativeQuery

    if (queryConditions) {
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
      drillStatus = queryConditions.drillStatus || void 0
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery || cachedQueryConditions.nativeQuery
    } else {
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

    callback(
      renderType,
      itemId,
      widget.dataToken,
      {
        groups: drillStatus && drillStatus.groups ? drillStatus.groups : groups,
        aggregators,
        filters: drillStatus && drillStatus.filter ? drillStatus.filter.sqls : filters.map((i) => i.config.sql),
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
    )
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
    const {type, shareInfo} = this.state
    this.setState({
      showLogin: false
    }, () => {
      this.loadShareContent({type, shareInfo})
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
    })
  }

  private getOptions = (controlId, viewId, columns, parents) => {
    this.props.onLoadCascadeSourceFromDashboard(controlId, viewId, this.state.shareInfo, columns, parents)
  }

  private globalFilterChange = (queryConditions: IMapItemFilterValue) => {
    const { currentItems, currentItemsInfo } = this.props
    Object.entries(queryConditions).forEach(([itemId, condition]) => {
      const item = currentItems.find((ci) => ci.id === +itemId)
      let pageNo = 0
      const { pagination } = currentItemsInfo[itemId].queryConditions
      if (pagination.pageNo) { pageNo = 1 }
      const { variables: globalVariables, filters: globalFilters } = condition
      this.getChartData('rerender', +itemId, item.widgetId, {
        globalVariables,
        globalFilters,
        pagination: { ...pagination, pageNo }
      })
    })
  }

  private dataDrill = (e) => {
    const {
      widgets,
      currentItemsInfo,
      onDrillDashboardItem
    } = this.props
    const { itemId, groups, widgetId, sourceDataFilter } = e
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
      console.log('callback')
      this.getChartData('rerender', itemId, widgetId)
    }
    onDeleteDrillHistory(itemId, item)
  }

  public render () {
    const {
      dashboard,
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
      interactingStatus,
      allowFullScreen,
      phantomRenderSign
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
          queryConditions
        } = currentItemsInfo[id]

        const widget = widgets.find((w) => w.id === widgetId)
        const view = { model: widget.model }
        const interacting = interactingStatus[id] || false
        const drillHistory = queryConditions.drillHistory

        itemblocks.push((
          <div key={id}>
            <DashboardItem
              itemId={id}
              widget={widget}
              widgets={widgets}
              view={view}
              datasource={datasource}
              loading={loading}
              polling={polling}
              onDrillData={this.dataDrill}
              onSelectDrillHistory={this.selectDrillHistory}
              interacting={interacting}
              drillHistory={drillHistory}
              frequency={frequency}
              shareInfo={widget.dataToken}
              downloadCsvLoading={downloadCsvLoading}
              onGetChartData={this.getChartData}
              onDownloadCsv={this.downloadCsv}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={this.visibleFullScreen}
              renderType={renderType}
              queryConditions={queryConditions}
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

      fullScreenComponent = (
        <FullScreenPanel
          widgets={widgets}
          currentDashboard={{ widgets: currentItems }}
          currentItemsInfo={currentItemsInfo}
          visible={allowFullScreen}
          isVisible={this.visibleFullScreen}
          currentDataInFullScreen={this.state.currentDataInFullScreen}
          onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
        />
      )
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )

      fullScreenComponent = ''
    }

    loginPanel = showLogin ? <Login shareInfo={this.state.shareInfo} legitimateUser={this.handleLegitimateUser} /> : ''

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
          <DashboardFilterPanel
            currentDashboard={dashboard}
            currentItems={currentItems}
            onGetOptions={this.getOptions}
            mapOptions={dashboardCascadeSources}
            onChange={this.globalFilterChange}
          />
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        {fullScreenComponent}
        {loginPanel}
        {phantomDOM}
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
  dashboardCascadeSources: makeSelectDashboardCascadeSources(),
  linkages: makeSelectLinkages()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token, reject) => dispatch(getDashboard(token, reject)),
    onLoadWidget: (token, resolve, reject) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (renderType, itemid, dataToken, requestParams) => dispatch(getResultset(renderType, itemid, dataToken, requestParams)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, requestParams, dataToken) => dispatch(loadWidgetCsv(itemId, requestParams, dataToken)),
    onLoadCascadeSourceFromDashboard: (controlId, viewId, dataToken, columns, parents) => dispatch(loadCascadeSourceFromDashboard(controlId, viewId, dataToken, columns, parents)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onDrillDashboardItem: (itemId, drillHistory) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDeleteDrillHistory: (itemId, index) => dispatch(deleteDrillHistory(itemId, index))
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
