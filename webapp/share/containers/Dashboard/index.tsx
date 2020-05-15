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
import { IFilters, IDistinctValueReqeustParams } from 'app/components/Control/types'
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
      onLoadWidget(
        qs.shareInfo,
        (widget) => {
          onSetIndividualDashboard(widget, qs.shareInfo)
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
    const qs = this.querystring(
      window.location.search.substr(1)
    )

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
    for (; i < path.length - 1; i++) {
      if (o[path[i]] === undefined) {
        o[decodeURIComponent(path[i])] = path[i + 1].match(/^\d+$/) ? [] : {}
      }
      o = o[decodeURIComponent(path[i])]
    }
    o[decodeURIComponent(path[i])] = decodeURIComponent(value)
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
        // @FIXME 0.3 maintain `shareInfo` in links for legacy integration
        this.loadShareContent({
          type,
          shareInfo: shareToken
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

  private dataDrill = (e) => {
    const {
      widgets,
      currentItemsInfo,
      onLoadResultset,
      onDrillDashboardItem
    } = this.props
    const { itemId, groups, widgetId, sourceDataFilter, mode, col, row } = e
    const widget = widgets.find((w) => w.id === widgetId)
    const {
      cols,
      rows,
      metrics,
      filters,
      color,
      label,
      size,
      xAxis,
      tip,
      orders,
      cache,
      expired,
      model,
      dimetionAxis,
      selectedChart
    } = widget.config
    const drillHistory = currentItemsInfo[itemId].queryConditions.drillHistory
    let sql = void 0
    let name = void 0
    let filterSource = void 0
    let widgetConfigGroups = cols
      .concat(rows)
      .filter((g) => g.name !== '指标名称')
      .map((g) => g.name)
    let aggregators = metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (color) {
      widgetConfigGroups = widgetConfigGroups.concat(
        color.items.map((c) => c.name)
      )
    }
    if (label) {
      widgetConfigGroups = widgetConfigGroups.concat(
        label.items.filter((l) => l.type === 'category').map((l) => l.name)
      )
      aggregators = aggregators.concat(
        label.items
          .filter((l) => l.type === 'value')
          .map((l) => ({
            column: decodeMetricName(l.name),
            func: l.agg
          }))
      )
    }
    let currentDrillStatus = void 0
    let widgetConfigRows = []
    let widgetConfigCols = []
    const coustomTableSqls = []
    // let sqls = widgetConfig.filters.map((i) => i.config.sql)
    let sqls = []
    filters.forEach((item) => {
      sqls = sqls.concat(item.config.sqlModel)
    })

    if (!drillHistory || drillHistory.length === 0) {
      let currentCol = void 0
      if (widget.config) {
        widgetConfigRows = rows && rows.length ? rows : []
        widgetConfigCols = cols && cols.length ? cols : []
        const mode = widget.config.mode
        if (mode && mode === 'pivot') {
          if (cols && cols.length !== 0) {
            name = cols[cols.length - 1]['name']
          } else {
            name = rows[rows.length - 1]['name']
          }
        } else if (dimetionAxis === 'col') {
          name = cols[cols.length - 1]['name']
        } else if (dimetionAxis === 'row') {
          name = rows[rows.length - 1]['name']
        } else if (mode === 'chart' && selectedChart === ChartTypes.Table) {
          // todo coustomTable
          const coustomTable = sourceDataFilter.reduce((a, b) => {
            a[b['key']] === undefined
              ? (a[b['key']] = [b['value']])
              : a[b['key']].push(b['value'])
            return a
          }, {})
          for (const attr in coustomTable) {
            if (coustomTable[attr] !== undefined && attr) {
              const sqlType =
                model[attr] && model[attr]['sqlType']
                  ? model[attr]['sqlType']
                  : 'VARCHAR'
              const filterJson: IFilters = {
                name: attr,
                operator: 'in',
                type: 'filter',
                value: coustomTable[attr].map((val) =>
                  getValidColumnValue(val, sqlType)
                ),
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
              array.push({ name: groups })
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
        currentCol =
          col && col.length ? widgetConfigCols.concat([{ name: col }]) : void 0
        const sqlType =
          model[name] && model[name]['sqlType']
            ? model[name]['sqlType']
            : 'VARCHAR'
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
        } else if (mode === 'chart' && selectedChart === ChartTypes.Table) {
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
        row:
          row && row.length ? widgetConfigRows.concat([{ name: row }]) : void 0,
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
      if (mode === 'chart' && selectedChart === ChartTypes.Table) {
        const coustomTable = sourceDataFilter.reduce((a, b) => {
          a[b['key']] === undefined
            ? (a[b['key']] = [b['value']])
            : a[b['key']].push(b['value'])
          return a
        }, {})
        for (const attr in coustomTable) {
          if (coustomTable[attr] !== undefined && attr) {
            const sqlType =
              model[attr] && model[attr]['sqlType']
                ? model[attr]['sqlType']
                : 'VARCHAR'
            const filterJson: IFilters = {
              name: attr,
              operator: 'in',
              type: 'filter',
              value: coustomTable[attr].map((val) =>
                getValidColumnValue(val, sqlType)
              ),
              sqlType
            }
            coustomTableSqls.push(filterJson)
            //  coustomTableSqls.push(`${attr} in (${coustomTable[attr].map((key) => `'${key}'`).join(',')})`)
          }
        }
        if (Array.isArray(coustomTableSqls) && coustomTableSqls.length > 0) {
          sqls = sqls.concat(coustomTableSqls)
        }
        if (
          lastDrillHistory &&
          lastDrillHistory.col &&
          lastDrillHistory.col.length
        ) {
          const drillKey = sourceDataFilter[sourceDataFilter.length - 1]['key']
          const cols = lastDrillHistory.col
          const newWidgetPropCols = cols.reduce((array, col) => {
            array.push(col)
            if (col.name === drillKey) {
              array.push({ name: groups })
            }
            return array
          }, [])
          currentCol =
            groups && groups.length ? newWidgetPropCols : lastDrillHistory.col
        }
      } else {
        name = lastDrillHistory.groups[lastDrillHistory.groups.length - 1]
        filterSource = sourceDataFilter.map((source) => source[name])
        const sqlType =
          model[name] && model[name]['sqlType']
            ? model[name]['sqlType']
            : 'VARCHAR'
        // sql = `${name} in (${filterSource.map((key) => `'${key}'`).join(',')})`
        sql = {
          name,
          operator: 'in',
          type: 'filter',
          value: filterSource.map((val) => getValidColumnValue(val, sqlType)),
          sqlType
        }
        sqls = lastDrillHistory.filter.sqls.concat(sql)
        currentCol =
          col && col.length
            ? (lastDrillHistory.col || []).concat({ name: col })
            : lastDrillHistory.col
        currentRow =
          row && row.length
            ? (lastDrillHistory.row || []).concat({ name: row })
            : lastDrillHistory.row
      }
      const isDrillUp = lastDrillHistory.groups.some((cg) => cg === groups)
      let currentDrillGroups = void 0
      if (isDrillUp) {
        currentDrillGroups = lastDrillHistory.groups.filter(
          (cg) => cg !== groups
        )
      } else {
        if (mode === 'pivot') {
          currentDrillGroups = lastDrillHistory.groups.concat([groups])
        } else if (mode === 'chart' && selectedChart === ChartTypes.Table) {
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
      onLoadResultset,
      onLoadBatchDataWithControlValues,
      onResizeDashboardItem,
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
              drillHistory={drillHistory}
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
  shareParams: makeSelectShareParams()
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
const withControlReducer = injectReducer({ key: 'control', reducer: controlReducer })

export default compose(withReducer, withControlReducer, withSaga, withConnect)(Share)
