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
import classnames from 'classnames'
import LocalControlPanel from 'containers/ControlPanel/Local'
import DashboardItemMask from './DashboardItemMask'
import DownloadCsv, { IDownloadCsvProps } from 'components/DownloadCsv'
import {
  DrillCharts,
  WidgetDimension,
  DrillType,
  IDrillDetail
} from 'components/DataDrill/types'
import DataDrill from 'components/DataDrill/Panel'
import DataDrillHistory from 'components/DataDrill/History'
import { operationWidgetProps } from 'components/DataDrill/abstract/widgetOperating'
import {
  strategiesOfDrillUpHasDrillHistory,
  strategiesOfDrillUpNullDrillHistory,
  strategiesOfDrillDownHasDrillHistory,
  strategiesOfDrillDownNullDrillHistory
} from 'components/DataDrill/strategies'
import { getLastItemValueOfArray } from 'components/DataDrill/util'
import {
  IFormedView,
  IFormedViews,
  IShareFormedViews,
  IViewModel
} from 'containers/View/types'

import Widget, {
  IWidgetConfig,
  IPaginationParams,
  RenderType
} from 'containers/Widget/components/Widget'
import { ChartTypes } from 'containers/Widget/config/chart/ChartTypes'
import { DrillableChart } from 'containers/Widget/config/chart/DrillableChart'
import { IconProps } from 'antd/lib/icon'
import { Icon, Tooltip, Popconfirm, Popover, Dropdown, Menu } from 'antd'

import ModulePermission from 'containers/Account/components/checkModulePermission'
import ShareDownloadPermission from 'containers/Account/components/checkShareDownloadPermission'
import { IProject } from 'containers/Projects/types'
import {
  IQueryConditions,
  IQueryVariableMap,
  TShareVizsType,
  ILoadData
} from '../types'
import { IWidgetFormed, IWidgetBase } from 'app/containers/Widget/types'
import {
  ControlPanelLayoutTypes,
  ControlPanelTypes
} from 'app/components/Control/constants'
import { OnGetControlOptions } from 'app/components/Control/types'
import styles from '../Dashboard.less'
import utilStyles from 'app/assets/less/util.less'
import EnhancerPanel from 'components/DataDrill/EnhancerPanel'

interface IDashboardItemProps {
  itemId: number
  alias?: string
  widget: IWidgetFormed
  widgets: IWidgetFormed[]
  formedViews: IFormedViews | IShareFormedViews
  view?: Partial<IFormedView>
  isTrigger?: boolean
  datasource: any
  loading: boolean
  polling: boolean
  interacting: boolean
  frequency: number
  shareToken: string
  shareLoading?: boolean
  downloadCsvLoading: boolean
  rendered?: boolean
  renderType: RenderType
  selectedItems: number[]
  currentProject?: IProject
  queryConditions: IQueryConditions
  container?: string
  errorMessage: string
  onSelectDrillHistory?: (history?: any, item?: number, itemId?: number) => void
  onLoadData: ILoadData
  onShowEdit?: (
    itemId: number
  ) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowDrillEdit?: (
    itemId: number
  ) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem?: (itemId: number) => () => void
  onResizeDashboardItem: (itemId: number) => void
  onRenderChartError: (itemId: number, error: Error) => void
  onOpenSharePanel?: (
    id: number,
    type: TShareVizsType,
    title: string,
    itemId?: number
  ) => void
  onDownloadCsv: (itemId: number) => void
  onTurnOffInteract: (itemId: number) => void
  onShowFullScreen: (itemId: number) => void
  onCheckTableInteract: (itemId: number) => boolean
  onDoTableInteract: (itemId: number, triggerData: object) => void
  onEditWidget?: (itemId: number, widgetId: number) => void
  onDrillData?: (e: object) => void
  onSelectChartsItems?: (
    itemId: number,
    renderType: string,
    selectedItems: number[]
  ) => void
  onGetControlOptions: OnGetControlOptions
  onControlSearch: (
    type: ControlPanelTypes,
    relatedItems: number[],
    formValues?: object,
    itemId?: number
  ) => void
  onMonitoredSyncDataAction?: () => void
  onMonitoredSearchDataAction?: () => void
}

interface IDashboardItemStates {
  controlPanelVisible: boolean
  queryVariables: IQueryVariableMap
  model: IViewModel
  isDrilling: boolean
  dataDrillPanelPosition: boolean | object
  whichDataDrillBrushed: boolean | object[]
  sourceDataOfBrushed: object[]
  sourceDataGroup: string[]
  // isShowDrillPanel: boolean
  widgetProps: IWidgetConfig
  cacheWidgetProps: IWidgetConfig
  cacheWidgetId: boolean | number
}

export class DashboardItem extends React.PureComponent<
  IDashboardItemProps,
  IDashboardItemStates
> {
  constructor(props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      queryVariables: {},
      model: null,
      isDrilling: true,
      dataDrillPanelPosition: false,
      whichDataDrillBrushed: false,
      sourceDataOfBrushed: [],
      cacheWidgetProps: null,
      widgetProps: null,
      cacheWidgetId: false,
      sourceDataGroup: []
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onShowDrillEdit: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private pollingTimer: number
  private container: HTMLDivElement = null

  public componentWillMount() {
    const { itemId, widget, view, onLoadData, container } = this.props
    const { cacheWidgetProps, cacheWidgetId } = this.state
    if (container === 'share') {
      if (widget.config.autoLoadData) {
        onLoadData('clear', itemId)
      }
      this.initPolling(this.props)
    }
    this.setState({
      model: view.model
    })
    if (!cacheWidgetProps) {
      this.setState({
        widgetProps: { ...widget.config },
        cacheWidgetProps: { ...widget.config },
        cacheWidgetId: widget.id
      })
    }
  }

  public componentWillReceiveProps(nextProps: IDashboardItemProps) {
    const { widget, queryConditions } = this.props
    let { model } = this.state

    if (nextProps.widget !== widget) {
      model = nextProps.view.model
      this.setState({
        model
      })
    }

    if (nextProps.queryConditions !== queryConditions) {
      const {
        variables,
        linkageVariables,
        globalVariables
      } = nextProps.queryConditions
      this.setState({
        queryVariables: [
          ...variables,
          ...linkageVariables,
          ...globalVariables
        ].reduce((obj, { name, value }) => {
          obj[`$${name}$`] = value
          return obj
        }, {})
      })
    }
  }

  public componentWillUpdate(
    nextProps: IDashboardItemProps,
    nextState: IDashboardItemStates
  ) {
    const {
      itemId,
      widget,
      polling,
      frequency,
      rendered,
      container,
      onLoadData
    } = nextProps
    if (!container) {
      if (!this.props.rendered && rendered) {
        // clear
        if (widget.config.autoLoadData) {
          onLoadData('clear', itemId)
        }
        this.initPolling(this.props)
      }
    }

    if (polling !== this.props.polling || frequency !== this.props.frequency) {
      this.initPolling(nextProps)
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (prevState.controlPanelVisible !== this.state.controlPanelVisible) {
      const { itemId, onResizeDashboardItem } = this.props
      onResizeDashboardItem(itemId)
    }
  }

  public componentWillUnmount() {
    clearInterval(this.pollingTimer)
  }

  private initPolling = (props: IDashboardItemProps) => {
    const { polling, frequency, itemId, onLoadData } = props

    clearInterval(this.pollingTimer)

    if (polling) {
      this.pollingTimer = window.setInterval(() => {
        onLoadData('refresh', itemId)
      }, Number(frequency) * 1000)
    }
  }

  private syncData = () => {
    const { itemId, onLoadData, onMonitoredSyncDataAction } = this.props
    onLoadData('flush', itemId)
    if (onMonitoredSyncDataAction) {
      onMonitoredSyncDataAction()
    }
  }

  private toggleControlPanel = () => {
    this.setState({
      controlPanelVisible: !this.state.controlPanelVisible
    })
  }

  private onFullScreen = () => {
    const { itemId, onShowFullScreen } = this.props
    onShowFullScreen(itemId)
  }

  private downloadCsv = () => {
    const { itemId, onDownloadCsv } = this.props
    onDownloadCsv(itemId)
  }

  private openSharePanel = () => {
    const { itemId, widget, onOpenSharePanel } = this.props
    const { id, name } = widget
    onOpenSharePanel(id, 'widget', name, itemId)
  }

  private checkTableInteract = () => {
    const { itemId, onCheckTableInteract } = this.props
    return onCheckTableInteract(itemId)
  }

  private doInteract = (triggerData) => {
    const { itemId, onDoTableInteract } = this.props
    onDoTableInteract(itemId, triggerData)
  }

  private paginationChange = (pageNo: number, pageSize: number, orders) => {
    const { itemId, queryConditions, onLoadData } = this.props
    const { drillHistory } = queryConditions
    const pagination = {
      ...queryConditions.pagination,
      pageNo,
      pageSize
    }
    if (drillHistory && drillHistory.length) {
      const drillStatus = drillHistory[drillHistory.length - 1]
      onLoadData('clear', itemId, { pagination, orders, drillStatus })
    } else {
      onLoadData('clear', itemId, { pagination, orders })
    }
  }

  private turnOffInteract = () => {
    const { onTurnOffInteract, itemId } = this.props
    onTurnOffInteract(itemId)
  }

  private toWorkbench = () => {
    const { itemId, widget } = this.props
    this.props.onEditWidget(itemId, widget.id)
  }

  private getDataDrillDetail = (position) => {
    if (position && position.length) {
      try {
        const ps = JSON.parse(position)
        const { range, brushed, sourceData, sourceGroup } = ps
        const dataDrillPanelPosition = void 0
        const sourceDataOfBrushed =
          sourceData && sourceData.length ? sourceData : []
        const whichDataDrillBrushed = brushed && brushed.length ? brushed : []
        const sourceDataGroup =
          sourceGroup && sourceGroup.length ? sourceGroup : []

        this.setState({
          dataDrillPanelPosition,
          whichDataDrillBrushed,
          sourceDataOfBrushed,
          sourceDataGroup
        })
      } catch (error) {
        throw error
      }
    }
  }

  private drillDataHistory = (history, item: number, itemId) => {
    const { onSelectDrillHistory, queryConditions } = this.props
    const { widgetProps, cacheWidgetProps } = this.state
    const { drillHistory } = queryConditions
    if (onSelectDrillHistory) {
      if (item === -1 && !history) {
        this.setState({ widgetProps: cacheWidgetProps })
      } else {
        const { cols, rows } = drillHistory[item]
        this.setState({ widgetProps: { ...widgetProps, cols, rows } })
      }
      onSelectDrillHistory(history, item, itemId)
    }
  }

  private receiveWidgetId() {
    const { widget } = this.props
    operationWidgetProps.receive(widget.id)
  }

  private isHasDrillHistory(): boolean {
    const { queryConditions } = this.props
    const { drillHistory } = queryConditions
    return !!(drillHistory && drillHistory.length !== 0)
  }

  private getLastDrillHistory() {
    const { queryConditions } = this.props
    const { drillHistory } = queryConditions
    return [...drillHistory].pop()
  }

  private sendDrillDetail(e) {
    const { itemId, widget, onDrillData } = this.props
    if (onDrillData) {
      onDrillData({
        ...e,
        itemId,
        widgetId: widget.id
      })
    }
  }

  private drillUp = (name: string) => {
    this.receiveWidgetId()
    const { sourceDataOfBrushed } = this.state
    const isHasDrillHistory = this.isHasDrillHistory()
    let set

    if (isHasDrillHistory) {
      const getLastDrillHistory = this.getLastDrillHistory()
      set = strategiesOfDrillUpHasDrillHistory(
        getLastDrillHistory,
        this.state.widgetProps
      )({ name }, sourceDataOfBrushed)
    } else {
      set = strategiesOfDrillUpNullDrillHistory(
        operationWidgetProps,
        this.state.widgetProps
      )({ name }, sourceDataOfBrushed)
    }

    const { pivot, coustomTable } = set

    if (operationWidgetProps.isPivot()) {
      const {
        cols,
        rows,
        type,
        groups,
        filters,
        widgetProps,
        currentGroup
      } = pivot()
      this.setState({ widgetProps })
      this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup })
      return
    }

    if (this.isCoustomTable()) {
      const {
        cols,
        rows,
        type,
        groups,
        filters,
        widgetProps,
        currentGroup
      } = coustomTable()
      this.setState({ widgetProps })
      this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup })
      return
    }
  }

  private isCoustomTable() {
    return operationWidgetProps.isCoustomTable()
  }

  private drillDown = (name: string, dimensions?: WidgetDimension) => {
    const { sourceDataOfBrushed, sourceDataGroup } = this.state
    this.receiveWidgetId()
    const isHasDrillHistory = this.isHasDrillHistory()
    const dimetionAxis = operationWidgetProps.getDimetionAxis()
    let set
    let strategiteStream

    if (isHasDrillHistory) {
      const getLastDrillHistory = this.getLastDrillHistory()
      set = strategiesOfDrillDownHasDrillHistory(
        getLastDrillHistory,
        this.state.widgetProps
      )({ name }, sourceDataOfBrushed, sourceDataGroup)
    } else {
      set = strategiesOfDrillDownNullDrillHistory(
        operationWidgetProps,
        this.state.widgetProps
      )({ name }, sourceDataOfBrushed, sourceDataGroup)
    }

    const {
      dimetionAxisCol,
      dimetionAxisRow,
      pivotCol,
      pivotRow,
      coustomTable,
      defaultScenes
    } = set

    if (dimensions && dimensions.length) {
      if (dimensions === WidgetDimension.COL) {
        strategiteStream = pivotCol()
      } else if (dimensions === WidgetDimension.ROW) {
        strategiteStream = pivotRow()
      }
    } else if (operationWidgetProps.isCoustomTable()) {
      strategiteStream = coustomTable()
    } else if (dimetionAxis && dimetionAxis.length) {
      if (dimetionAxis === WidgetDimension.ROW) {
        strategiteStream = dimetionAxisRow()
      } else if (dimetionAxis === WidgetDimension.COL) {
        strategiteStream = dimetionAxisCol()
      }
    } else {
      strategiteStream = defaultScenes()
    }

    const {
      cols,
      rows,
      type,
      groups,
      filters,
      widgetProps,
      currentGroup
    } = strategiteStream
    this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup })
    this.setState({ widgetProps })
  }

  private selectChartsItems = (selectedItems) => {
    const { onSelectChartsItems, itemId } = this.props
    if (onSelectChartsItems) {
      onSelectChartsItems(itemId, 'select', selectedItems)
    }
  }

  private renderChartError = (error: Error) => {
    const { itemId, onRenderChartError } = this.props
    onRenderChartError(itemId, error)
  }

  public render() {
    const {
      alias,
      itemId,
      widget,
      formedViews,
      datasource,
      loading,
      interacting,
      shareToken,
      shareLoading,
      downloadCsvLoading,
      renderType,
      currentProject,
      queryConditions,
      onLoadData,
      onShowEdit,
      onShowDrillEdit,
      onSelectDrillHistory,
      onGetControlOptions,
      onControlSearch,
      onDeleteDashboardItem,
      onMonitoredSearchDataAction,
      container,
      errorMessage
    } = this.props
    const { drillHistory } = queryConditions
    const data = datasource.resultList

    const {
      controlPanelVisible,
      queryVariables,
      widgetProps,
      isDrilling,
      model,
      sourceDataGroup,
      sourceDataOfBrushed
    } = this.state

    let downloadButton
    let shareButton
    let widgetButton
    let dropdownMenu

    if (currentProject) {
      const DownloadButton = ShareDownloadPermission<IDownloadCsvProps>(
        currentProject,
        'download'
      )(DownloadCsv)
      downloadButton = (
        <Tooltip title="下载数据">
          <DownloadButton
            shareLoading={shareLoading}
            downloadCsvLoading={downloadCsvLoading}
            onDownloadCsv={this.downloadCsv}
          />
        </Tooltip>
      )

      const ShareButton = ShareDownloadPermission<IconProps>(
        currentProject,
        'share'
      )(Icon)
      shareButton = (
        <Tooltip title="分享">
          <ShareButton type="share-alt" onClick={this.openSharePanel} />
        </Tooltip>
      )

      const EditButton = ModulePermission<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLSpanElement>,
          HTMLSpanElement
        >
      >(
        currentProject,
        'viz',
        false
      )(Span)
      widgetButton = (
        <Tooltip title="编辑widget">
          {/* <i className="iconfont icon-edit-2" onClick={this.toWorkbench} /> */}
          <i>
            <EditButton
              className="iconfont icon-edit-2"
              onClick={this.toWorkbench}
            />
          </i>
        </Tooltip>
      )
    }

    if (container === 'share') {
      downloadButton = (
        <Tooltip title="下载数据">
          <DownloadCsv
            shareLoading={shareLoading}
            downloadCsvLoading={downloadCsvLoading}
            onDownloadCsv={this.downloadCsv}
          />
        </Tooltip>
      )
    } else {
      const InfoButton = ModulePermission<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLSpanElement>,
          HTMLSpanElement
        >
      >(
        currentProject,
        'viz',
        false
      )(Span)
      const DeleteButton = ModulePermission<
        React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLSpanElement>,
          HTMLSpanElement
        >
      >(
        currentProject,
        'viz',
        true
      )(Span)
      const menu = (
        <Menu>
          <Menu.Item className={styles.menuItem}>
            <InfoButton
              className={styles.menuText}
              onClick={onShowEdit(itemId)}
            >
              基本信息
            </InfoButton>
          </Menu.Item>
          <Menu.Item className={styles.menuItem}>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={onDeleteDashboardItem(itemId)}
            >
              <DeleteButton className={styles.menuText}>删除</DeleteButton>
            </Popconfirm>
          </Menu.Item>
        </Menu>
      )
      dropdownMenu = (
        <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
          <Icon type="ellipsis" />
        </Dropdown>
      )
    }

    const controlToggle = !!widget.config.controls.length && (
      <Tooltip title="控制器面板">
        <Icon
          type="control"
          className={classnames({
            [styles.activated]: controlPanelVisible
          })}
          onClick={this.toggleControlPanel}
        />
      </Tooltip>
    )

    const loadingIcon = loading && <Icon type="loading" />

    const descIcon = widget.description && (
      <Popover
        title="备注"
        content={widget.description}
        placement="bottom"
        overlayClassName={styles.widgetInfoContent}
      >
        <Icon type="info-circle" />
      </Popover>
    )

    const errorIcon = errorMessage && (
      <Tooltip
        title={
          <>
            <p>错误信息：</p>
            <p>{errorMessage}</p>
          </>
        }
        placement="bottomLeft"
        overlayClassName={styles.widgetInfoContent}
      >
        <Icon className={styles.error} type="warning" />
      </Tooltip>
    )

    const gridItemClass = classnames({
      [styles.gridItem]: true,
      [styles.interact]: interacting
    })
    const isDrillableChart = DrillableChart.some(
      (drillable) => drillable === widget.config.selectedChart
    )
    const drillInteractIcon =
      this.props.isTrigger === false ? (
        isDrillableChart ? (
          <Tooltip title="可钻取">
            <i className="iconfont icon-xiazuan" />
          </Tooltip>
        ) : (
          void 0
        )
      ) : (
        <Tooltip title="可联动">
          <i className="iconfont icon-liandong1" />
        </Tooltip>
      )

    const dataDrillPanel = (
      <EnhancerPanel
        currentData={data}
        widgetConfig={widget.config}
        onDataDrillDown={this.drillDown}
        onDataDrillUp={this.drillUp}
        drillHistory={drillHistory}
        isSelectedfilter={sourceDataOfBrushed}
        isSelectedGroup={sourceDataGroup}
        chartStyle={widget.config.selectedChart}
      />
    )
    const dataDrillHistoryClass = classnames({
      [styles.dataDrillHistory]: true,
      [utilStyles.hide]: !(drillHistory && drillHistory.length > 0)
    })
    const dataDrillHistory = (
      <div className={dataDrillHistoryClass}>
        <DataDrillHistory
          itemId={itemId}
          widgetId={widget.id}
          drillHistory={drillHistory}
          onSelectDrillHistory={this.drillDataHistory}
        />
      </div>
    )

    const { selectedChart, cols, rows, metrics } = widget.config
    const hasDataConfig = !!(cols.length || rows.length || metrics.length)
    const empty = (
      <DashboardItemMask.Empty
        loading={loading}
        chartType={selectedChart}
        empty={!data.length}
        hasDataConfig={hasDataConfig}
      />
    )
    const widgetName = alias || widget.name

    return (
      <div className={gridItemClass} ref={(f) => (this.container = f)}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h4>{widgetName}</h4>
            {descIcon}
            {errorIcon}
            {controlToggle}
            {loadingIcon}
            {}
          </div>
          <div className={styles.tools}>
            <Tooltip title="同步数据">
              {!loading && <Icon type="reload" onClick={this.syncData} />}
            </Tooltip>
            {widgetButton}
            <Tooltip title="全屏">
              <Icon
                type="fullscreen"
                onClick={this.onFullScreen}
                className={styles.fullScreen}
              />
            </Tooltip>
            {shareButton}
            {downloadButton}
            {dropdownMenu}
          </div>
        </div>

        <div className={styles.trigger}>{drillInteractIcon}</div>
        <div className={styles.offInteract} onClick={this.turnOffInteract}>
          <i className="iconfont icon-unlink" />
          <h3>点击取消联动</h3>
        </div>
        <div
          className={classnames({ [utilStyles.hide]: !controlPanelVisible })}
        >
          <LocalControlPanel
            formedViews={formedViews}
            itemId={itemId}
            widget={widget}
            layoutType={ControlPanelLayoutTypes.DashboardItem}
            onGetOptions={onGetControlOptions}
            onSearch={onControlSearch}
            onMonitoredSearchDataAction={onMonitoredSearchDataAction}
          />
        </div>
        <Dropdown
          overlay={dataDrillPanel}
          placement="topCenter"
          trigger={['contextMenu']}
        >
          <div className={styles.block}>
            <Widget
              {...widgetProps}
              renderType={loading ? 'loading' : renderType}
              data={data}
              interacting={this.props.interacting}
              queryVariables={queryVariables}
              pagination={queryConditions.pagination}
              empty={empty}
              model={model}
              onCheckTableInteract={this.checkTableInteract}
              onDoInteract={this.doInteract}
              onPaginationChange={this.paginationChange}
              getDataDrillDetail={this.getDataDrillDetail}
              isDrilling={this.state.isDrilling}
              whichDataDrillBrushed={this.state.whichDataDrillBrushed}
              onSelectChartsItems={this.selectChartsItems}
              selectedItems={this.props.selectedItems}
              // onHideDrillPanel={this.onHideDrillPanel}
              onError={this.renderChartError}
            />
            {dataDrillHistory}
          </div>
        </Dropdown>
      </div>
    )
  }
}

function Span(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >
) {
  return <span {...props}>{props.children}</span>
}

export default DashboardItem
