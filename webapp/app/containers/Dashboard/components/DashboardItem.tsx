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
import * as Animate from 'rc-animate'
import * as classnames from 'classnames'

import DashboardItemControlPanel from './DashboardItemControlPanel'
import DashboardItemControlForm from './DashboardItemControlForm'
import SharePanel from '../../../components/SharePanel'
import DownLoadCsv from '../../../components/DownLoadCsv'

import Chart from './Chart'
const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Popover = require('antd/lib/popover')
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import { ECHARTS_RENDERER } from '../../../globalConstants'
const styles = require('../Dashboard.less')

interface IDashboardItemProps {
  w: number
  h: number
  itemId: number
  widget: any
  chartInfo: any
  data: any
  loading: boolean
  isReadOnly: boolean
  triggerType: string
  triggerParams: string
  isAdmin: boolean
  isShared: boolean
  isShare: boolean
  isDownload: boolean
  shareInfo: string
  secretInfo: string
  shareInfoLoading: boolean
  downloadCsvLoading: boolean
  isInteractive: boolean
  interactId: string
  cascadeSources: any
  onGetChartData: (renderType: string, itemId: number, widgetId: number, queryParams?: any) => void
  onRenderChart: (itemId: number, widget: any, dataSource: any[], chartInfo: any, interactIndex?: number) => void
  onShowEdit: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowWorkbench: (itemId: number, widget: any) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowFiltersForm: (itemId: number, keys: any[], types: any[]) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem: (itemId: number) => () => void
  onDownloadCsv: (itemId: number) => (shareInfo: string) => void
  onTurnOffInteract: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowFullScreen: (chartData: any) => void
  onCheckTableInteract: (itemId: number) => object
  onDoTableInteract: (itemId: number, linkagers: any[], value: any) => void
  onGetCascadeSource: (itemId: number, controlId: number, flatTableId: number, column: string, parents?: any[]) => void
}

interface IDashboardItemStates {
  controlPanelVisible: boolean
  sharePanelAuthorized: boolean
}

export class DashboardItem extends React.PureComponent<IDashboardItemProps, IDashboardItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      sharePanelAuthorized: false
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onShowWorkbench: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private frequent: NodeJS.Timer = void 0

  public componentWillMount () {
    this.initControlCascadeSource(this.props)
  }

  public componentDidMount () {
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData('rerender', itemId, widget.id)

    this.setFrequent(this.props)
  }

  public componentWillUpdate (nextProps) {
    const {
      itemId,
      widget,
      data,
      chartInfo,
      triggerType,
      onRenderChart
    } = nextProps
    if (data && data !== this.props.data && chartInfo.renderer === ECHARTS_RENDERER) {
      onRenderChart(itemId, widget, data.dataSource, chartInfo)
    }

    if (triggerType !== this.props.triggerType) {
      this.setFrequent(nextProps)
    }

    if (nextProps.widget !== this.props.widget) {
      this.initControlCascadeSource(nextProps)
    }
  }

  public componentWillUnmount () {
    clearInterval(this.frequent)
  }

  private setFrequent = (props) => {
    const {
      triggerType,
      triggerParams,
      itemId,
      widget,
      onGetChartData
    } = props

    if (triggerType === 'frequent') {
      this.frequent = setInterval(() => {
        onGetChartData('dynamic', itemId, widget.id)
      }, Number(triggerParams) * 1000)
    } else {
      clearInterval(this.frequent)
    }
  }

  private onSyncBizdatas = () => {
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData('refresh', itemId, widget.id)
  }

  private onControlSearch = (queryParams) => {
    this.onSearch('rerender', queryParams)
  }

  private onSearch = (renderType, queryParams) => {
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData(renderType, itemId, widget.id, queryParams)
  }

  private toggleControlPanel = () => {
    this.setState({
      controlPanelVisible: !this.state.controlPanelVisible
    })
  }

  private onFullScreen = () => {
    const {
      onShowFullScreen,
      itemId,
      w,
      h,
      data,
      widget,
      loading,
      chartInfo,
      onGetChartData
    } = this.props
    const chartsData = {itemId, w, h, widget, data, loading, chartInfo, onGetChartData}
    if (onShowFullScreen) {
      onShowFullScreen(chartsData)
    }
  }

  private sharePanelDownloadCsv = () => {
    const {
      itemId,
      shareInfo,
      onDownloadCsv
    } = this.props

    onDownloadCsv(itemId)(shareInfo)
  }
  private changeSharePanelAuthorizeState = (state) => () => {
    this.setState({
      sharePanelAuthorized: state
    })
  }

  private initControlCascadeSource = (props) => {
    const { itemId, widget, onGetCascadeSource } = props
    const { query_params } = widget

    JSON.parse(query_params).forEach((c) => {
      if (c.type === 'cascadeSelect' && !c.parentColumn) {
        onGetCascadeSource(itemId, c.id, widget.flatTable_id, c.cascadeColumn)
      }
    })
  }

  private onCascadeSelectChange = (controlId, column, parents) => {
    const { itemId, widget, onGetCascadeSource } = this.props
    onGetCascadeSource(itemId, controlId, widget.flatTable_id, column, parents)
  }

  public render () {
    const {
      w,
      h,
      itemId,
      widget,
      chartInfo,
      data,
      loading,
      isAdmin,
      isShared,
      isShare,
      isDownload,
      shareInfo,
      secretInfo,
      shareInfoLoading,
      downloadCsvLoading,
      isInteractive,
      interactId,
      cascadeSources,
      onShowEdit,
      isReadOnly,
      onShowWorkbench,
      onShowFiltersForm,
      onDeleteDashboardItem,
      onDownloadCsv,
      onTurnOffInteract,
      onCheckTableInteract,
      onDoTableInteract
    } = this.props

    const {
      controlPanelVisible,
      sharePanelAuthorized
    } = this.state

    let updateParams
    let updateConfig
    let currentBizlogicId

    if (widget.config) {
      const config = JSON.parse(widget.config)
      currentBizlogicId = widget.flatTable_id
      // FIXME 前期误将 update_params 和 update_fields 字段 stringify 后存入数据库，此处暂时做判断避免问题，保存时不再 stringify，下个大版本后删除判断语句
      updateParams = typeof config['update_params'] === 'string'
        ? JSON.parse(config['update_params'])
        : config['update_params']
      updateConfig = typeof config['update_fields'] === 'string'
        ? JSON.parse(config['update_fields'])
        : config['update_fields']
    }

    const menu = (
      <Menu>
        {isReadOnly ? <Menu.Item className={styles.menuItem}>
            <span className={styles.menuText} onClick={onShowEdit(itemId)}>基本信息</span>
          </Menu.Item> : ''}
        <Menu.Item className={styles.menuItem}>
          <span className={styles.menuText} onClick={onShowFiltersForm(itemId, data && data.keys ? data.keys : [], data && data.types ? data.types : [])}>条件查询</span>
        </Menu.Item>
        {isReadOnly ? <Menu.Item className={styles.menuItem}>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={onDeleteDashboardItem(itemId)}
            >
              <span className={styles.menuText}>删除</span>
            </Popconfirm>
          </Menu.Item> : ''}
      </Menu>
    )

    const userDownloadButton = isDownload
      ? (
        <Tooltip title="下载数据">
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <DownLoadCsv
                id={widget.id}
                type="widget"
                itemId={itemId}
                shareInfo={shareInfo}
                shareInfoLoading={shareInfoLoading}
                downloadCsvLoading={downloadCsvLoading}
                onDownloadCsv={this.sharePanelDownloadCsv}
              />
            }
          >
            <Icon type="download" />
          </Popover>
        </Tooltip>
      ) : void 0

    const shareButton = isShare
      ? (
        <Tooltip title="分享">
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <SharePanel
                id={widget.id}
                type="widget"
                itemId={itemId}
                shareInfo={shareInfo}
                secretInfo={secretInfo}
                shareInfoLoading={shareInfoLoading}
                downloadCsvLoading={downloadCsvLoading}
                onDownloadCsv={onDownloadCsv(itemId)}
                authorized={sharePanelAuthorized}
                afterAuthorization={this.changeSharePanelAuthorizeState(true)}
              />
            }
          >
            <Icon type="share-alt" onClick={this.changeSharePanelAuthorizeState(false)} />
          </Popover>
        </Tooltip>
      ) : void 0

    const widgetButton = isAdmin && isReadOnly
      ? (
        <Tooltip title="编辑widget">
          <i className="iconfont icon-edit-2" onClick={onShowWorkbench(itemId, widget)} />
        </Tooltip>
      ) : void 0

    const filterButton = !isAdmin || isShared
      ? (
        <Tooltip title="条件查询">
          <Icon type="search" onClick={onShowFiltersForm(itemId, data && data.keys ? data.keys : [], data && data.types ? data.types : [])} />
        </Tooltip>
      ) : void 0

    const dropdownMenu = isAdmin
      ? (
        <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
          <Icon type="ellipsis" />
        </Dropdown>
      ) : void 0

    const controls = widget.query_params
      ? JSON.parse(widget.query_params).filter((c) => c.type)
      : []
    const controlPanelHandle = controls.length
      ? (
        <Tooltip title="选择参数">
          <Icon
            className={styles.control}
            type={controlPanelVisible ? 'up-square-o' : 'down-square-o'}
            onClick={this.toggleControlPanel}
          />
        </Tooltip>
      ) : ''

    const descPanelHandle = widget.desc
      ? (
        <Popover placement="bottom" content={<p className={styles.descPanel}>{widget.desc}</p>}>
          <Icon className={styles.desc} type="question-circle-o" />
        </Popover>
      ) : ''

    const controlPanelTransitionName = {
      enter: styles.controlPanelEnter,
      enterActive: styles.controlPanelEnterActive,
      leave: styles.controlPanelLeave,
      leaveActive: styles.controlPanelLeaveActive
    }

    const chartClass = {
      chart: styles.chartBlock,
      table: styles.tableBlock,
      container: styles.block
    }

    const gridItemClass = classnames({
      [styles.gridItem]: true,
      [styles.interact]: isInteractive
    })

    return (
      <div className={gridItemClass}>
        <div className={styles.header}>
          {
            chartInfo.name !== 'text'
              ? (
                <div className={styles.title}>
                  {controlPanelHandle}
                  <h4>{widget.name}</h4>
                  {descPanelHandle}
                </div>
            )
              : (
                <div className={styles.title} />
            )
          }
          <div className={styles.tools}>
            <Tooltip title="同步数据">
              <Icon type="reload" onClick={this.onSyncBizdatas} />
            </Tooltip>
            {widgetButton}
            <Tooltip title="全屏">
              <Icon type="arrows-alt" onClick={this.onFullScreen} className={styles.fullScreen} />
            </Tooltip>
            {shareButton}
            {filterButton}
            {userDownloadButton}
            {dropdownMenu}
          </div>
        </div>

        <div
          className={styles.offInteract}
          onClick={onTurnOffInteract(itemId)}
        >
          <i className="iconfont icon-unlink" />
          <h3>点击取消联动</h3>
        </div>
        <Animate
          showProp="show"
          transitionName={controlPanelTransitionName}
        >
          <DashboardItemControlPanel show={controlPanelVisible}>
            <DashboardItemControlForm
              controls={controls}
              cascadeSources={cascadeSources}
              onSearch={this.onControlSearch}
              onHide={this.toggleControlPanel}
              onCascadeSelectChange={this.onCascadeSelectChange}
            />
          </DashboardItemControlPanel>
        </Animate>
        <Chart
          id={`${itemId}`}
          w={w}
          h={h}
          data={data || {}}
          loading={loading}
          chartInfo={chartInfo}
          updateConfig={updateConfig}
          chartParams={JSON.parse(widget.chart_params)}
          updateParams={updateParams}
          currentBizlogicId={currentBizlogicId}
          classNames={chartClass}
          interactId={interactId}
          onCheckTableInteract={onCheckTableInteract}
          onDoTableInteract={onDoTableInteract}
        />
      </div>
    )
  }
}

export default DashboardItem
