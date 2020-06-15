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
import controlReducer from 'app/containers/ControlPanel/reducer'
import saga from './sagas'

import Container from 'components/Container'
import {
  getMappingLinkage,
  processLinkage,
  removeLinkage
} from 'components/Linkages'
import DashboardItem from 'containers/Dashboard/components/DashboardItem'
import FullScreenPanel from './FullScreenPanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { ChartTypes } from 'containers/Widget/config/chart/ChartTypes'
import {
  IFilters,
  IDistinctValueReqeustParams
} from 'app/components/Control/types'
import GlobalControlPanel from 'app/containers/ControlPanel/Global'
import DownloadList from 'components/DownloadList'
import { getValidColumnValue } from 'app/components/Control/util'
import HeadlessBrowserIdentifier from 'share/components/HeadlessBrowserIdentifier'
import { Row, Col } from 'antd'

import DashboardActions from './actions'
import ControlActions from 'app/containers/ControlPanel/actions'
const {
  getDashboard,
  getWidget,
  getResultset,
  getBatchDataWithControlValues,
  setIndividualDashboard,
  loadWidgetCsv,
  loadSelectOptions,
  resizeDashboardItem,
  resizeAllDashboardItem,
  renderChartError,
  drillDashboardItem,
  deleteDrillHistory,
  selectDashboardItemChart,
  loadDownloadList,
  downloadFile,
  initiateDownloadTask,
  sendShareParams,
  setFullScreenPanelItemId
} = DashboardActions
const { setSelectOptions } = ControlActions
import {
  makeSelectDashboard,
  makeSelectTitle,
  makeSelectWidgets,
  makeSelectFormedViews,
  makeSelectItems,
  makeSelectItemsInfo,
  makeSelectLinkages,
  makeSelectDownloadList,
  makeSelectShareParams
} from './selectors'
import { makeSelectLoginLoading } from '../App/selectors'
import { decodeMetricName } from 'app/containers/Widget/components/util'
import {
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_MARGIN,
  GRID_BREAKPOINTS,
  DOWNLOAD_LIST_POLLING_FREQUENCY
} from 'app/globalConstants'

import styles from 'app/containers/Dashboard/Dashboard.less'

import Login from 'share/components/Login'
import {
  IQueryConditions,
  IDataRequestParams,
  QueryVariable
} from 'app/containers/Dashboard/types'
import { RenderType } from 'containers/Widget/components/Widget'
import { getShareClientId } from 'share/util'
import { DashboardItemStatus } from './constants'
import { IWidgetFormed } from 'app/containers/Widget/types'
import {
  ControlPanelLayoutTypes,
  ControlPanelTypes
} from 'app/components/Control/constants'
import { IDrillDetail } from 'components/DataDrill/types'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>

type IDashboardProps = MappedStates & MappedDispatches

interface IDashboardStates {
  type: string
  shareToken: string
  modalLoading: boolean
  interactingStatus: { [itemId: number]: boolean }
  showLogin: boolean
  headlessBrowserRenderSign: boolean
}

export class Share extends React.Component<IDashboardProps, IDashboardStates> {
  constructor(props) {
    super(props)
    this.state = {
      type: '',
      shareToken: '',

      modalLoading: false,
      interactingStatus: {},
      showLogin: false,

      headlessBrowserRenderSign: false
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

    if (qs.type === 'dashboard') {
      onLoadDashboard(qs.shareToken, (err) => {
        if (err.response.status === 403) {
          this.setState({
            showLogin: true
          })
        }
      })
    } else {
      onLoadWidget(
        qs.shareToken,
        (widget) => {
          onSetIndividualDashboard(widget, qs.shareToken)
        },
        (err) => {
          if (err.response.status === 403) {
            this.setState({
              showLogin: true
            })
          }
        }
      )
    }
  }

  public componentDidMount() {
    // urlparse
    const qs = this.querystring(window.location.search.substr(1))

    this.setState({
      type: qs.type,
      shareToken: qs.shareToken
    })
    this.loadShareContent(qs)
    this.initPolling(qs.shareToken)
    delete qs.type
    delete qs.shareToken
    this.props.onSendShareParams(qs)
    window.addEventListener('resize', this.onWindowResize, false)
  }

  public componentWillReceiveProps(nextProps: IDashboardProps) {
    const { currentItems, currentItemsInfo } = nextProps
    if (currentItemsInfo) {
      const initialedItems = Object.values(currentItemsInfo).filter((info) =>
        [DashboardItemStatus.Fulfilled, DashboardItemStatus.Error].includes(
          info.status
        )
      )
      if (initialedItems.length === currentItems.length) {
        // FIXME
        setTimeout(() => {
          this.setState({
            headlessBrowserRenderSign: true
          })
        }, 5000)
      }
    }
  }

  public componentWillUnmount() {
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
      this.deep_set(
        o,
        key.split(/[\[\]]/g).filter((x) => x),
        value
      )
      return o
    }, {})
  }

  private deep_set(o, path, value) {
    let i = 0
    const val = decodeURIComponent(value)
    for (; i < path.length - 1; i++) {
        if (o[path[i]] === undefined) {
            o[decodeURIComponent(path[i])] = path[i + 1].match(/^\d+$/) ? [] : {}
        }
        o = o[decodeURIComponent(path[i])]
    }
    if (o[decodeURIComponent(path[i])] && o[decodeURIComponent(path[i])].length) {
        const isInclude =
            Array.isArray(o[decodeURIComponent(path[i])]) &&
            o[decodeURIComponent(path[i])].includes(val)

        const isEqual = o[decodeURIComponent(path[i])] === val
        if (!(isInclude || isEqual)) {
            o[decodeURIComponent(path[i])] = [val].concat(o[decodeURIComponent(path[i])])
        }
    } else {
        o[decodeURIComponent(path[i])] = val
    }
  }

  private initPolling = (token) => {
    this.props.onLoadDownloadList(this.shareClientId, token)
    this.downloadListPollingTimer = window.setInterval(() => {
      this.props.onLoadDownloadList(this.shareClientId, token)
    }, DOWNLOAD_LIST_POLLING_FREQUENCY)
  }

  private initiateWidgetDownloadTask = (itemId: number) => {
    this.props.onInitiateDownloadTask(this.shareClientId, itemId)
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

  private handleLegitimateUser = () => {
    const { type, shareToken } = this.state
    this.setState(
      {
        showLogin: false
      },
      () => {
        this.loadShareContent({
          type,
          shareToken
        })
      }
    )
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
    const { currentItems, onLoadResultset, linkages } = this.props

    const mappingLinkage = getMappingLinkage(itemId, linkages)
    this.interactingLinkagers = processLinkage(
      itemId,
      triggerData,
      mappingLinkage,
      this.interactingLinkagers
    )

    Object.keys(mappingLinkage).forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === +linkagerItemId)
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      onLoadResultset('rerender', +linkagerItemId, {
        linkageFilters: Object.values(filters).reduce<string[]>(
          (arr, f: string[]) => arr.concat(...f),
          []
        ),
        linkageVariables: Object.values(variables).reduce<QueryVariable>(
          (arr, p: QueryVariable) => arr.concat(...p),
          []
        )
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
    const { linkages, currentItems, onLoadResultset } = this.props

    const refreshItemIds = removeLinkage(
      itemId,
      linkages,
      this.interactingLinkagers
    )
    refreshItemIds.forEach((linkagerItemId) => {
      const item = currentItems.find((ci) => ci.id === linkagerItemId)
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      onLoadResultset('rerender', linkagerItemId, {
        linkageFilters: Object.values(filters).reduce<string[]>(
          (arr, f: string[]) => arr.concat(...f),
          []
        ),
        linkageVariables: Object.values(variables).reduce<QueryVariable>(
          (arr, p: QueryVariable) => arr.concat(...p),
          []
        )
      })
    })
    this.setState(
      {
        interactingStatus: {
          ...this.state.interactingStatus,
          [itemId]: false
        }
      },
      () => {
        const item = currentItems.find((ci) => ci.id === itemId)
        onLoadResultset('clear', itemId)
      }
    )
  }

  private getControlSelectOptions = (
    controlKey: string,
    useOptions: boolean,
    paramsOrOptions,
    itemId?: number
  ) => {
    if (useOptions) {
      this.props.onSetSelectOptions(controlKey, paramsOrOptions, itemId)
    } else {
      this.props.onLoadSelectOptions(
        controlKey,
        this.state.shareToken,
        paramsOrOptions,
        itemId
      )
    }
  }

  private dataDrill = (drillDetail) => {
    const { onDrillDashboardItem, onLoadResultset } = this.props
    const {
      itemId,
      cols,
      rows,
      type,
      groups,
      filters,
      currentGroup
    } = drillDetail
    const currentDrillStatus: IDrillDetail = {
      cols,
      rows,
      type,
      groups,
      filters,
      currentGroup
    }

    onDrillDashboardItem(itemId, currentDrillStatus)
    onLoadResultset('rerender', itemId, {
      drillStatus: currentDrillStatus
    })
  }

  private selectDrillHistory = (history, item, itemId) => {
    const { onLoadResultset, onDeleteDrillHistory } = this.props
    setTimeout(() => {
      if (history) {
        onLoadResultset('rerender', itemId, {
          drillStatus: history
        })
      } else {
        onLoadResultset('rerender', itemId)
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

  public render() {
    const {
      dashboard,
      title,
      currentItems,
      currentItemsInfo,
      widgets,
      formedViews,
      linkages,
      downloadList,
      loginLoading,
      onLoadResultset,
      onLoadBatchDataWithControlValues,
      onResizeDashboardItem,
      onRenderChartError,
      onSetFullScreenPanelItemId
    } = this.props

    const {
      shareToken,
      showLogin,
      interactingStatus,
      headlessBrowserRenderSign
    } = this.state

    let grids = null
    let loginPanel = null

    if (currentItems) {
      const itemblocks: React.ReactNode[] = []
      const layouts = { lg: [] }

      currentItems.forEach((dashboardItem) => {
        const {
          id,
          x,
          y,
          width,
          height,
          widgetId,
          polling,
          frequency
        } = dashboardItem
        const {
          datasource,
          loading,
          downloadCsvLoading,
          renderType,
          queryConditions,
          selectedItems,
          errorMessage
        } = currentItemsInfo[id]

        const widget = widgets.find((w) => w.id === widgetId)
        const view = formedViews[widget.viewId]
        const interacting = interactingStatus[id] || false
        const drillHistory = queryConditions.drillHistory
        const isTrigger =
          linkages && linkages.length
            ? linkages
                .map((linkage) => linkage.trigger[0])
                .some((tr) => tr === String(id))
            : false

        itemblocks.push(
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
              frequency={frequency}
              shareToken={widget.dataToken}
              downloadCsvLoading={downloadCsvLoading}
              renderType={renderType}
              queryConditions={queryConditions}
              errorMessage={errorMessage}
              selectedItems={selectedItems || []}
              container="share"
              onLoadData={onLoadResultset}
              onResizeDashboardItem={onResizeDashboardItem}
              onRenderChartError={onRenderChartError}
              onDownloadCsv={this.initiateWidgetDownloadTask}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={onSetFullScreenPanelItemId}
              onSelectChartsItems={this.selectChartsItems}
              onGetControlOptions={this.getControlSelectOptions}
              onControlSearch={onLoadBatchDataWithControlValues}
            />
          </div>
        )

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
          style={{ marginTop: '-16px' }}
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
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )
    }

    loginPanel = showLogin ? (
      <Login
        loading={loginLoading}
        shareToken={shareToken}
        legitimateUser={this.handleLegitimateUser}
      />
    ) : (
      ''
    )

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
            layoutType={ControlPanelLayoutTypes.Dashboard}
            onGetOptions={this.getControlSelectOptions}
            onSearch={onLoadBatchDataWithControlValues}
          />
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        {loginPanel}
        <FullScreenPanel
          currentDashboard={dashboard}
          widgets={widgets}
          formedViews={formedViews}
          currentItems={currentItems}
          currentItemsInfo={currentItemsInfo}
          onLoadData={onLoadResultset}
          onGetOptions={this.getControlSelectOptions}
          onSearch={onLoadBatchDataWithControlValues}
        />
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
  widgets: makeSelectWidgets(),
  formedViews: makeSelectFormedViews(),
  currentItems: makeSelectItems(),
  currentItemsInfo: makeSelectItemsInfo(),
  linkages: makeSelectLinkages(),
  downloadList: makeSelectDownloadList(),
  shareParams: makeSelectShareParams(),
  loginLoading: makeSelectLoginLoading()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadDashboard: (token: string, reject: (err) => void) =>
      dispatch(getDashboard(token, reject)),
    onLoadWidget: (
      token: string,
      resolve: (widget: IWidgetFormed) => void,
      reject: (err) => void
    ) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (
      renderType: RenderType,
      itemId: number,
      queryConditions?: Partial<IQueryConditions>
    ) => dispatch(getResultset(renderType, itemId, queryConditions)),
    onLoadBatchDataWithControlValues: (
      type: ControlPanelTypes,
      relatedItems: number[],
      formValues?: object,
      itemId?: number
    ) =>
      dispatch(
        getBatchDataWithControlValues(type, relatedItems, formValues, itemId)
      ),
    onSetIndividualDashboard: (widget: IWidgetFormed, token: string) =>
      dispatch(setIndividualDashboard(widget, token)),
    onLoadWidgetCsv: (
      itemId: number,
      requestParams: IDataRequestParams,
      dataToken: string
    ) => dispatch(loadWidgetCsv(itemId, requestParams, dataToken)),
    onLoadSelectOptions: (
      controlKey: string,
      dataToken: string,
      reqeustParams: { [viewId: string]: IDistinctValueReqeustParams },
      itemId: number
    ) =>
      dispatch(loadSelectOptions(controlKey, dataToken, reqeustParams, itemId)),
    onSetSelectOptions: (controlKey: string, options: any[], itemId?: number) =>
      dispatch(setSelectOptions(controlKey, options, itemId)),
    onResizeDashboardItem: (itemId: number) =>
      dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onRenderChartError: (itemId: number, error: Error) =>
      dispatch(renderChartError(itemId, error)),
    onDrillDashboardItem: (itemId: number, drillHistory) =>
      dispatch(drillDashboardItem(itemId, drillHistory)),
    onDeleteDrillHistory: (itemId: number, index: number) =>
      dispatch(deleteDrillHistory(itemId, index)),
    onSelectDashboardItemChart: (
      itemId: number,
      renderType: RenderType,
      selectedItems: number[]
    ) => dispatch(selectDashboardItemChart(itemId, renderType, selectedItems)),
    onInitiateDownloadTask: (shareClientId: string, itemId?: number) =>
      dispatch(initiateDownloadTask(shareClientId, itemId)),
    onLoadDownloadList: (shareClinetId: string, token: string) =>
      dispatch(loadDownloadList(shareClinetId, token)),
    onDownloadFile: (id: number, shareClientId: string, token: string) =>
      dispatch(downloadFile(id, shareClientId, token)),
    onSendShareParams: (params: object) => dispatch(sendShareParams(params)),
    onSetFullScreenPanelItemId: (itemId: number) =>
      dispatch(setFullScreenPanelItemId(itemId))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'shareDashboard', reducer })
const withSaga = injectSaga({ key: 'shareDashboard', saga })
const withControlReducer = injectReducer({
  key: 'control',
  reducer: controlReducer
})

export default compose(
  withReducer,
  withControlReducer,
  withSaga,
  withConnect
)(Share)
