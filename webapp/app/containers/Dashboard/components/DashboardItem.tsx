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
import DownloadCsv, { IDownloadCsvProps } from '../../../components/DownloadCsv'

import Widget from '../../Widget/components/Widget/WidgetInViz'
import { IWidgetProps, RenderType } from '../../Widget/components/Widget'
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
import { DEFAULT_SPLITER } from '../../../globalConstants'
const styles = require('../Dashboard.less')

interface IDashboardItemProps {
  itemId: number
  widget: any
  data: any
  loading: boolean
  polling: string
  interacting: boolean
  frequency: string
  shareInfo: string
  secretInfo?: string
  shareInfoLoading?: boolean
  downloadCsvLoading: boolean
  rendered?: boolean
  renderType: RenderType
  router?: InjectedRouter
  currentProject?: IProject
  container?: string
  onGetChartData: (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => void
  onShowEdit?: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem?: (itemId: number) => () => void
  onLoadWidgetShareLink?: (id: number, itemId: number, authName: string) => void
  onDownloadCsv: (itemId: number, widgetProps: IWidgetProps, shareInfo: string) => void
  onTurnOffInteract: (itemId: number) => void
  onShowFullScreen: (chartData: any) => void
  onCheckTableInteract: (itemId: number) => boolean
  onDoTableInteract: (itemId: number, triggerData: object) => void
  onEditWidget?: (itemId: number, widgetId: number) => void
}

interface IDashboardItemStates {
  controlPanelVisible: boolean
  sharePanelAuthorized: boolean
  widgetProps: IWidgetProps
}

export class DashboardItem extends React.PureComponent<IDashboardItemProps, IDashboardItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      sharePanelAuthorized: false,
      widgetProps: null
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private frequent: number
  private container: HTMLDivElement = null

  public componentWillMount () {
    const { itemId, widget, onGetChartData, container } = this.props
    if (container === 'share') {
      onGetChartData('clear', itemId, widget.id)
      this.setFrequent(this.props)
    }
    this.setState({
      widgetProps: JSON.parse(widget.config)
    })
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.widget !== this.props.widget) {
      this.setState({
        widgetProps: JSON.parse(nextProps.widget.config)
      })
    }
  }

  public componentWillUpdate (nextProps: IDashboardItemProps) {
    const {
      itemId,
      widget,
      polling,
      onGetChartData,
      rendered,
      container
    } = nextProps

    if (!container) {
      if (!this.props.rendered && rendered) {
        onGetChartData('clear', itemId, widget.id)
        this.setFrequent(this.props)
      }
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
      this.frequent = window.setInterval(() => {
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
      renderType,
      onGetChartData
    } = this.props
    const chartsData = {itemId, widget, data, loading, renderType, onGetChartData}
    if (onShowFullScreen) {
      onShowFullScreen(chartsData)
    }
  }

  private downloadCsv = () => {
    const { widget, itemId, shareInfo, onDownloadCsv } = this.props
    const { widgetProps } = this.state

    onDownloadCsv(widget.id, widgetProps, shareInfo)
  }
  private changeSharePanelAuthorizeState = (state) => () => {
    this.setState({
      sharePanelAuthorized: state
    })
  }

  private checkTableInteract = () => {
    const { itemId, onCheckTableInteract } = this.props
    return onCheckTableInteract(itemId)
  }

  private doInteract = (triggerData) => {
    const { itemId, onDoTableInteract } = this.props
    onDoTableInteract(itemId, triggerData)
  }

  private turnOffInteract = () => {
    const { onTurnOffInteract, itemId } = this.props
    onTurnOffInteract(itemId)
  }

  private toWorkbench = () => {
    const { itemId, widget } = this.props
    this.props.onEditWidget(itemId, widget.id)
  }

  public render () {
    const {
      itemId,
      widget,
      data,
      loading,
      interacting,
      shareInfo,
      secretInfo,
      shareInfoLoading,
      downloadCsvLoading,
      renderType,
      currentProject,
      onShowEdit,
      onDeleteDashboardItem,
      onLoadWidgetShareLink,
      container
    } = this.props

    const {
      controlPanelVisible,
      sharePanelAuthorized,
      widgetProps
    } = this.state

    let downloadButton
    let shareButton
    let widgetButton
    let dropdownMenu

    if (currentProject) {
      const DownloadButton = ShareDownloadPermission<IDownloadCsvProps>(currentProject, 'download')(DownloadCsv)
      downloadButton = (
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
      shareButton = (
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

      widgetButton = (
        <Tooltip title="编辑widget">
          <i className="iconfont icon-edit-2" onClick={this.toWorkbench} />
        </Tooltip>
      )
    }

    if (container === 'share') {
      downloadButton = (
        <Tooltip title="下载数据">
          <DownloadCsv
            id={widget.id}
            type="widget"
            itemId={itemId}
            shareInfo={shareInfo}
            downloadCsvLoading={downloadCsvLoading}
            onLoadWidgetShareLink={onLoadWidgetShareLink}
            onDownloadCsv={this.downloadCsv}
          />
        </Tooltip>
      )
    } else {
      const InfoButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(currentProject, 'viz', false)(Span)
      const DeleteButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(currentProject, 'viz', true)(Span)
      const menu = (
        <Menu>
          <Menu.Item className={styles.menuItem}>
            <InfoButton className={styles.menuText} onClick={onShowEdit(itemId)}>基本信息</InfoButton>
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

    const controls = widgetProps.queryParams.filter((c) => c.type)
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
      [styles.interact]: interacting
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
          onClick={this.turnOffInteract}
        >
          <i className="iconfont icon-unlink" />
          <h3>点击取消联动</h3>
        </div>
        <Animate
          showProp="show"
          transitionName={controlPanelTransitionName}
        >
          <DashboardItemControlPanel
            show={controlPanelVisible}
            onClose={this.toggleControlPanel}
          >
            <DashboardItemControlForm
              controls={controls}
              onSearch={this.onControlSearch}
              onHide={this.toggleControlPanel}
            />
          </DashboardItemControlPanel>
        </Animate>
        <div className={styles.block}>
          <Widget
            {...widgetProps}
            renderType={loading ? 'refresh' : renderType}
            data={data}
            loading={loading}
            onCheckTableInteract={this.checkTableInteract}
            onDoInteract={this.doInteract}
          />
        </div>
      </div>
    )
  }
}

function Span (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) {
  return (
    <span {...props} >{props.children}</span>
  )
}

export default DashboardItem
