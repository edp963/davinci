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
import DownLoadCsv, { IDownloadCsvProps } from '../../../components/DownLoadCsv'

import Pivot from '../../Widget/components/Pivot/PivotInViz'
import { IPivotProps, RenderType } from '../../Widget/components/Pivot/Pivot'
import { IconProps } from 'antd/lib/icon'
const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Popover = require('antd/lib/popover')
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import ModulePermission from '../../Account/components/checkModulePermission'
import ShareDownloadPermission from '../../Account/components/checkShareDownloadPermission'
import { InjectedRouter } from 'react-router'
import { IProject } from '../../Projects'
const styles = require('../Dashboard.less')

interface IDashboardItemProps {
  itemId: number
  widget: any
  data: any
  loading: boolean
  polling: string
  frequency: string
  shareInfo: string
  secretInfo?: string
  shareInfoLoading?: boolean
  downloadCsvLoading: boolean
  interactId: string
  rendered: boolean
  renderType: RenderType
  router: InjectedRouter
  currentProject: IProject
  onGetChartData: (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => void
  onShowEdit?: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem?: (itemId: number) => () => void
  onLoadWidgetShareLink: (id: number, itemId: number, authName: string) => void
  onDownloadCsv: (itemId: number, pivotProps: IPivotProps, shareInfo: string) => void
  onTurnOffInteract: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowFullScreen: (chartData: any) => void
  onCheckTableInteract: (itemId: number) => object
  onDoTableInteract: (itemId: number, linkagers: any[], value: any) => void
}

interface IDashboardItemStates {
  controlPanelVisible: boolean
  sharePanelAuthorized: boolean
  pivotProps: IPivotProps
}

export class DashboardItem extends React.PureComponent<IDashboardItemProps, IDashboardItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      sharePanelAuthorized: false,
      pivotProps: null
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private frequent: NodeJS.Timer = void 0
  private container: HTMLDivElement = null

  public componentWillMount () {
    this.setState({
      pivotProps: JSON.parse(this.props.widget.config)
    })
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.widget !== this.props.widget) {
      this.setState({
        pivotProps: JSON.parse(nextProps.widget.config)
      })
    }
  }

  public componentWillUpdate (nextProps: IDashboardItemProps) {
    const {
      itemId,
      widget,
      polling,
      onGetChartData,
      rendered
    } = nextProps

    if (!this.props.rendered && rendered) {
      onGetChartData('clear', itemId, widget.id)
      this.setFrequent(this.props)
    }

    if (polling !== this.props.polling) {
      this.setFrequent(nextProps)
    }
  }

  public componentWillUnmount () {
    clearInterval(this.frequent)
  }

  private setFrequent = (props: IDashboardItemProps) => {
    const {
      polling,
      frequency,
      itemId,
      widget,
      onGetChartData
    } = props

    clearInterval(this.frequent)

    if (polling) {
      this.frequent = setInterval(() => {
        onGetChartData('refresh', itemId, widget.id)
      }, Number(frequency) * 1000)
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
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData('clear', itemId, widget.id, queryParams)
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
      data,
      widget,
      loading,
      onGetChartData
    } = this.props
    const chartsData = {itemId, widget, data, loading, onGetChartData}
    if (onShowFullScreen) {
      onShowFullScreen(chartsData)
    }
  }

  private downloadCsv = () => {
    const { itemId, shareInfo, onDownloadCsv } = this.props
    const { pivotProps } = this.state

    onDownloadCsv(itemId, pivotProps, shareInfo)
  }
  private changeSharePanelAuthorizeState = (state) => () => {
    this.setState({
      sharePanelAuthorized: state
    })
  }

  private toWorkbench = (projectId, itemId, widget) => () => {
    this.props.router.push(`/project/${projectId}/widget/${widget.id}`)
  }

  public render () {
    const {
      itemId,
      widget,
      data,
      loading,
      shareInfo,
      secretInfo,
      shareInfoLoading,
      downloadCsvLoading,
      interactId,
      renderType,
      currentProject,
      onShowEdit,
      onDeleteDashboardItem,
      onLoadWidgetShareLink,
      onTurnOffInteract,
      onCheckTableInteract,
      onDoTableInteract
    } = this.props

    const {
      controlPanelVisible,
      sharePanelAuthorized,
      pivotProps
    } = this.state

    const menu = (
      <Menu>
        <Menu.Item className={styles.menuItem}>
          <span className={styles.menuText} onClick={onShowEdit(itemId)}>基本信息</span>
        </Menu.Item>
        <Menu.Item className={styles.menuItem}>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteDashboardItem(itemId)}
          >
            <span className={styles.menuText}>删除</span>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    )

    const DownloadButton = ShareDownloadPermission<IDownloadCsvProps>(currentProject, 'download')(DownLoadCsv)
    const downloadButton = (
      <Tooltip title="下载数据">
        <DownloadButton
          id={widget.id}
          type="widget"
          itemId={itemId}
          shareInfo={shareInfo}
          shareInfoLoading={shareInfoLoading}
          downloadCsvLoading={downloadCsvLoading}
          onLoadWidgetShareLink={onLoadWidgetShareLink}
          onDownloadCsv={this.downloadCsv}
        />
      </Tooltip>
    )

    const ShareButton = ShareDownloadPermission<IconProps>(currentProject, 'download')(Icon)
    const shareButton = (
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
              authorized={sharePanelAuthorized}
              onLoadWidgetShareLink={onLoadWidgetShareLink}
              afterAuthorization={this.changeSharePanelAuthorizeState(true)}
            />
          }
        >
          <ShareButton type="share-alt" onClick={this.changeSharePanelAuthorizeState(false)} />
        </Popover>
      </Tooltip>
    )

    let widgetButton
    if (currentProject) {
      widgetButton = (
        <Tooltip title="编辑widget">
          <i className="iconfont icon-edit-2" onClick={this.toWorkbench(currentProject.id, itemId, widget)} />
        </Tooltip>
      )
    }

    const dropdownMenu = (
      <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
        <Icon type="ellipsis" />
      </Dropdown>
    )

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
      [styles.interact]: !!interactId
    })

    return (
      <div className={gridItemClass} ref={(f) => this.container = f}>
        <div className={styles.header}>
          <div className={styles.title}>
            {controlPanelHandle}
            <h4>{widget.name}</h4>
            {descPanelHandle}
          </div>
          <div className={styles.tools}>
            <Tooltip title="同步数据">
              <Icon type={loading ? 'loading' : 'reload'} onClick={this.onSyncBizdatas} />
            </Tooltip>
            {widgetButton}
            <Tooltip title="全屏">
              <Icon type="arrows-alt" onClick={this.onFullScreen} className={styles.fullScreen} />
            </Tooltip>
            {shareButton}
            {downloadButton}
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
              onSearch={this.onControlSearch}
              onHide={this.toggleControlPanel}
            />
          </DashboardItemControlPanel>
        </Animate>
        {/* <Chart
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
        /> */}
        <Pivot
          {...pivotProps}
          renderType={renderType}
          data={data || []}
        />
      </div>
    )
  }
}

export default DashboardItem
