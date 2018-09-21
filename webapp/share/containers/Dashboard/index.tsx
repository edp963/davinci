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

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../../app/components/Container'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import FullScreenPanel from '../../../app/containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import { Responsive, WidthProvider } from 'react-grid-layout'

import { IFilterChangeParam } from '../../../app/components/Filters'
import DashboardFilterPanel from 'containers/Dashboard/components/DashboardFilterPanel'

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
  dashboard: any
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
  linkages: any[]
  onLoadDashboard: (shareInfo: any, error: (err) => void) => void,
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
      orders: Array<{column: string, direction: string}>
      cache: boolean
      expired: number
    }
  ) => void,
  onSetIndividualDashboard: (id, shareInfo) => void,
  onLoadWidgetCsv: (itemId: number, pivotProps: IPivotProps, dataToken: string) => void,
  onLoadCascadeSourceFromDashboard: (controlId, viewId, dataToken, column, parents) => void
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

      phantomRenderSign: false
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number

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
        orders,
        cache,
        expired
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
      this.resizeSign = void 0
    }, 500)
  }

  private downloadCsv = (itemId: number, pivotProps: IPivotProps, shareInfo: string) => {
    const {
      currentItemsInfo,
      onLoadWidgetCsv
    } = this.props

  //  const { filters, params } = currentItemsInfo[itemId].queryParams

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
      const { filters, params } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', +linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce((arr: any[], f: any[]) => arr.concat(...f), []),
        linkageParams: Object.values(params).reduce((arr: any[], p: any[]) => arr.concat(...p), [])
      })
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
      const { filters, params } = this.interactingLinkagers[linkagerItemId]
      this.getChartData('rerender', linkagerItemId, item.widgetId, {
        linkageFilters: Object.values(filters).reduce((arr: any[], f: any[]) => arr.concat(...f), []),
        linkageParams: Object.values(params).reduce((arr: any[], p: any[]) => arr.concat(...p), [])
      })
    })
  }

  private getOptions = (controlId, viewId, column, parents) => {
    this.props.onLoadCascadeSourceFromDashboard(controlId, viewId, this.state.shareInfo, column, parents)
  }

  private globalFilterChange = (queryParams: IFilterChangeParam) => {
    const { currentItems } = this.props
    Object.entries(queryParams).forEach(([itemId, queryParam]) => {
      const item = currentItems.find((ci) => ci.id === +itemId)
      const { params: globalParams, filters: globalFilters } = queryParam
      this.getChartData('rerender', +itemId, item.widgetId, { globalParams, globalFilters })
    })
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
      allowFullScreen,
      phantomRenderSign
    } = this.state

    let grids = null
    let fullScreenComponent = null
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

      fullScreenComponent = (
        <FullScreenPanel
          widgets={widgets}
          currentDashboard={{ widgets: currentItems }}
          currentDatasources={currentItemsInfo}
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
            filterOptions={dashboardCascadeSources}
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
    onLoadResultset: (renderType, itemid, dataToken, params) => dispatch(getResultset(renderType, itemid, dataToken, params)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, pivotProps, dataToken) => dispatch(loadWidgetCsv(itemId, pivotProps, dataToken)),
    onLoadCascadeSourceFromDashboard: (controlId, viewId, dataToken, column, parents) => dispatch(loadCascadeSourceFromDashboard(controlId, viewId, dataToken, column, parents)),
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
