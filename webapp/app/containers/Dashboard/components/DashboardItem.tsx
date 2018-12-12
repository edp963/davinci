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
import DataDrill from '../../../components/DataDrill/Panel'
import DataDrillHistory from '../../../components/DataDrill/History'
import {IView, IModel} from '../../../containers/Widget/components/Workbench/index'

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
const utilStyles = require('../../../assets/less/util.less')

interface IDashboardItemProps {
  itemId: number
  widget: any
  view?: Partial<IView>
  datasource: any
  loading: boolean
  polling: string
  interacting: boolean
  frequency: string
  shareInfo: string
  secretInfo?: string
  shareInfoLoading?: boolean
  downloadCsvLoading: boolean
  drillHistory?: any
  rendered?: boolean
  renderType: RenderType
  router?: InjectedRouter
  currentProject?: IProject
  container?: string
  onSelectDrillHistory?: (history?: any, item?: number, itemId?: number, widgetId?: number) => void
  onGetChartData: (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => void
  onShowEdit?: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem?: (itemId: number) => () => void
  onLoadWidgetShareLink?: (id: number, itemId: number, authName: string) => void
  onDownloadCsv: (itemId: number, widgetId: number, shareInfo: string) => void
  onTurnOffInteract: (itemId: number) => void
  onShowFullScreen: (chartData: any) => void
  onCheckTableInteract: (itemId: number) => boolean
  onDoTableInteract: (itemId: number, triggerData: object) => void
  onEditWidget?: (itemId: number, widgetId: number) => void
  onDrillData?: (e: object) => void
}

interface IDashboardItemStates {
  controlPanelVisible: boolean
  sharePanelAuthorized: boolean
  widgetProps: IWidgetProps
  model: IModel
  isDrilling: boolean
  dataDrillPanelPosition: boolean | object
  whichDataDrillBrushed: boolean | object []
  sourceDataOfBrushed: boolean | object []
  // isShowDrillPanel: boolean
  cacheWidgetProps: IWidgetProps
}

export class DashboardItem extends React.PureComponent<IDashboardItemProps, IDashboardItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      sharePanelAuthorized: false,
      widgetProps: null,
      model: null,
      isDrilling: false,
      dataDrillPanelPosition: false,
      whichDataDrillBrushed: false,
      sourceDataOfBrushed: false,
      cacheWidgetProps: null
      //   isShowDrillPanel: true
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private frequent: number
  private container: HTMLDivElement = null

  public componentWillMount () {
    const { itemId, widget, view, onGetChartData, container } = this.props
    if (container === 'share') {
      onGetChartData('clear', itemId, widget.id)
      this.setFrequent(this.props)
    }
    const widgetProps = JSON.parse(widget.config)
    this.setState({
      widgetProps,
      model: JSON.parse(view.model),
      cacheWidgetProps: {...widgetProps}
    })
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.widget !== this.props.widget) {
      this.setState({
        widgetProps: JSON.parse(nextProps.widget.config),
        model: JSON.parse(nextProps.view.model)
      })
    }
  }

  public componentWillUpdate (nextProps: IDashboardItemProps) {
    const {
      itemId,
      widget,
      polling,
      frequency,
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

    if (polling !== this.props.polling || frequency !== this.props.frequency) {
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
      widget,
      loading,
      renderType,
      onGetChartData
    } = this.props

    if (onShowFullScreen) {
      onShowFullScreen({
        itemId,
        widget,
        model: this.state.model,
        loading,
        renderType,
        onGetChartData
      })
    }
  }

  private downloadCsv = () => {
    const { widget, itemId, shareInfo, onDownloadCsv } = this.props
    onDownloadCsv(itemId, widget.id, shareInfo)
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

  private doDrill = () => {
    const {isDrilling, cacheWidgetProps} = this.state
    this.setState({isDrilling: !isDrilling}, () => {
      const { onSelectDrillHistory, itemId, widget, onGetChartData } = this.props
      if (isDrilling) {
        onSelectDrillHistory(false, -1, itemId, widget.id)
        this.setState({widgetProps: cacheWidgetProps}, () => onGetChartData('rerender', itemId, widget.id))
      }
    })
  }

  private toWorkbench = () => {
    const { itemId, widget } = this.props
    this.props.onEditWidget(itemId, widget.id)
  }

  private getDataDrillDetail = (position) => {
    if (position && position.length) {
      try {
        const ps = JSON.parse(position)
        const range = ps.range
        const brushed = ps.brushed
        const sourceData = ps.sourceData
        let dataDrillPanelPosition = void 0
        let whichDataDrillBrushed = void 0
        let sourceDataOfBrushed = void 0
        if (range && range.length > 0) {
          dataDrillPanelPosition = {top: `${range[range.length - 1][1] + 120}px`, left: `${range[range.length - 2][1] - 40}px`}
        }
        if (brushed && brushed.length) {
          whichDataDrillBrushed = brushed
        }
        if (sourceData && sourceData.length) {
          sourceDataOfBrushed = sourceData
        }
        this.setState({
          dataDrillPanelPosition,
          whichDataDrillBrushed,
          sourceDataOfBrushed
        })
      } catch (error) {
        throw error
      }
    }
  }

  private drillDataHistory = (history, item, itemId, widgetId) => {
    const {onSelectDrillHistory, drillHistory} = this.props
    const { widgetProps, cacheWidgetProps } = this.state
    if (onSelectDrillHistory) {
      let historyGroups = void 0
      historyGroups = history ? drillHistory[item]['groups'] : []
      if (widgetProps.dimetionAxis === 'col') {
        this.setState({
          widgetProps: {
            ...widgetProps,
            ...{
              cols: historyGroups && historyGroups.length ? historyGroups : cacheWidgetProps.cols
            }
          }
        })
      } else {
        this.setState({
          widgetProps: {
            ...widgetProps,
            ...{
              rows: historyGroups && historyGroups.length ? historyGroups : cacheWidgetProps.rows
            }
          }
        })
      }
      onSelectDrillHistory(history, item, itemId, widgetId)
    }
  }
  private drillData = (e) => {
    const { onDrillData, widget, itemId, drillHistory } = this.props
    const { widgetProps, cacheWidgetProps } = this.state
    if (onDrillData) {
      onDrillData({
        itemId,
        widgetId: widget.id,
        groups: e,
        filters: this.state.whichDataDrillBrushed,
        sourceDataFilter: this.state.sourceDataOfBrushed
      })
    }
    if (widgetProps.dimetionAxis === 'col') {
      const isDrillUp = widgetProps.cols.some((col) => col === e)
      this.setState({
        widgetProps: {
          ...widgetProps,
          ...{
            cols: e && e.length
            ? isDrillUp ? widgetProps.cols.filter((col) => col !== e) : widgetProps.cols.concat(e)
            : cacheWidgetProps.cols
          }
        }
      })
    } else {
      const isDrillUp = widgetProps.rows.some((row) => row === e)
      this.setState({
        widgetProps: {
          ...widgetProps,
          ...{
            rows: e && e.length
            ? isDrillUp ? widgetProps.rows.filter((col) => col !== e) : widgetProps.rows.concat(e)
            : cacheWidgetProps.rows
          }
        }
      })
    }
  }

  public render () {
    const {
      itemId,
      widget,
      datasource,
      loading,
      interacting,
      shareInfo,
      secretInfo,
      drillHistory,
      shareInfoLoading,
      downloadCsvLoading,
      renderType,
      currentProject,
      onShowEdit,
      onSelectDrillHistory,
      onDeleteDashboardItem,
      onLoadWidgetShareLink,
      container
    } = this.props
    const data = datasource.resultList
    const {
      controlPanelVisible,
      sharePanelAuthorized,
      widgetProps,
      isDrilling,
      model
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

    const drillButton = (
    <Tooltip title="钻取">
      <span style={{marginLeft: '8px', cursor: 'pointer', fontSize: '18px'}}  onClick={this.doDrill} className={`iconfont ${isDrilling ? 'icon-cube1' : 'icon-cube2'}`}/>
    </Tooltip>)

    const gridItemClass = classnames({
      [styles.gridItem]: true,
      [styles.interact]: interacting
    })
    let isSelectedData = false
    if (this.state.whichDataDrillBrushed) {
      (this.state.whichDataDrillBrushed as object[]).forEach((brushed, index) => {
        if (brushed[index] && (brushed[index] as any[]).length > 0) {
          isSelectedData = true
        }
      })
    }
    const categoriesCol = []
    Object.entries(model).forEach(([key, m]) => {
      if (m.modelType === 'category') {
        categoriesCol.push({
          name: key,
          type: 'category',
          visualType: m.visualType
        })
      }
    })

    const dataDrillPanelClass = classnames({
      [styles.dataDrillPanel]: true,
      [utilStyles.hide]: !isSelectedData
    })
    let positionStyle = {}
    if (this.state.dataDrillPanelPosition) {
      positionStyle = this.state.dataDrillPanelPosition
    }
    const dataDrillPanel =
    (
      <div className={dataDrillPanelClass} style={positionStyle}>
        <DataDrill
          categoriesCol={categoriesCol}
          onDataDrill={this.drillData}
          currentData={data}
        />
      </div>
    )
    const dataDrillHistoryClass = classnames({
      [styles.dataDrillHistory]: true,
      [utilStyles.hide]: !(drillHistory && drillHistory.length > 0)
    })
    const dataDrillHistory =
    (
      <div className={dataDrillHistoryClass}>
        <DataDrillHistory
          itemId={itemId}
          widgetId={widget.id}
          drillHistory={drillHistory}
          onSelectDrillHistory={this.drillDataHistory}
        />
      </div>
    )
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
            {drillButton}
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
            model={model}
            onCheckTableInteract={this.checkTableInteract}
            onDoInteract={this.doInteract}
            getDataDrillDetail={this.getDataDrillDetail}
            isDrilling={this.state.isDrilling}
          //  onHideDrillPanel={this.onHideDrillPanel}
          />
          {dataDrillPanel}
          {dataDrillHistory}
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
