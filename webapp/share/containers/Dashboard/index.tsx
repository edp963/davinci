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

import Container, { ContainerTitle } from 'components/Container'
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
  IFilter,
  IDistinctValueReqeustParams
} from 'app/components/Control/types'
import GlobalControlPanel from 'app/containers/ControlPanel/Global'
import DownloadList from 'components/DownloadList'
import { getValidColumnValue } from 'app/components/Control/util'
import HeadlessBrowserIdentifier from 'share/components/HeadlessBrowserIdentifier'
import { Row, Col } from 'antd'
import { querystring } from '../../util'
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
import { makeSelectLoginLoading, makeSelectVizType } from '../App/selectors'
import {
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_MARGIN,
  GRID_BREAKPOINTS,
  DOWNLOAD_LIST_POLLING_FREQUENCY
} from 'app/globalConstants'

import styles from 'app/containers/Dashboard/Dashboard.less'

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
import { IShareFormedViews } from 'app/containers/View/types'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>

type IDashboardProps = MappedStates & MappedDispatches

interface IDashboardStates {
  shareToken: string
  modalLoading: boolean
  interactingStatus: { [itemId: number]: boolean }
  headlessBrowserRenderSign: boolean
}

export class Share extends React.Component<IDashboardProps, IDashboardStates> {
  constructor(props) {
    super(props)
    this.state = {
      shareToken: '',

      modalLoading: false,
      interactingStatus: {},

      headlessBrowserRenderSign: false
    }
  }

  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number = 0
  private shareClientId: string = getShareClientId()
  private downloadListPollingTimer: number

  private loadShareContent = (shareToken: string) => {
    const {
      vizType,
      onLoadDashboard,
      onLoadWidget,
      onSetIndividualDashboard
    } = this.props

    switch (vizType) {
      case 'dashboard':
        onLoadDashboard(shareToken, () => null)
        break
      case 'widget':
        onLoadWidget(
          shareToken,
          (widget, formedViews) => {
            onSetIndividualDashboard(widget, formedViews, shareToken)
          },
          () => null
        )
        break
    }
  }

  public componentDidMount() {
    // urlparse
    const { shareToken, ...rest } = querystring(
      window.location.search.substr(1)
    )

    this.setState({ shareToken })
    this.loadShareContent(shareToken)
    this.initPolling(shareToken)
    this.props.onSendShareParams(rest)
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
      this.props.onLoadSelectOptions(controlKey, paramsOrOptions, itemId)
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
      interactingStatus,
      headlessBrowserRenderSign
    } = this.state

    let grids = null

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
              formedViews={formedViews}
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

    const headlessBrowserRenderParentNode = document.getElementById('app')

    return (
      <Container>
        <Helmet title={title} />
        <ContainerTitle>
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
            formedViews={formedViews}
            layoutType={ControlPanelLayoutTypes.Dashboard}
            onGetOptions={this.getControlSelectOptions}
            onSearch={onLoadBatchDataWithControlValues}
          />
        </ContainerTitle>
        {grids}
        <div className={styles.gridBottom} />
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
  vizType: makeSelectVizType(),
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
      resolve: (widget: IWidgetFormed, formedViews: IShareFormedViews) => void,
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
    onSetIndividualDashboard: (
      widget: IWidgetFormed,
      formedViews: IShareFormedViews,
      token: string
    ) => dispatch(setIndividualDashboard(widget, formedViews, token)),
    onLoadWidgetCsv: (
      itemId: number,
      requestParams: IDataRequestParams,
      dataToken: string
    ) => dispatch(loadWidgetCsv(itemId, requestParams, dataToken)),
    onLoadSelectOptions: (
      controlKey: string,
      reqeustParams: { [viewId: string]: IDistinctValueReqeustParams },
      itemId: number
    ) => dispatch(loadSelectOptions(controlKey, reqeustParams, itemId)),
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
