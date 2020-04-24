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
import { DrillCharts, WidgetDimension, DrillType, IDrillDetail } from 'components/DataDrill/types'
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
import { IFormedView, IViewModel } from 'containers/View/types'

import Widget, { IWidgetConfig, IPaginationParams, RenderType } from 'containers/Widget/components/Widget'
import { ChartTypes } from 'containers/Widget/config/chart/ChartTypes'
import { DrillableChart } from 'containers/Widget/config/chart/DrillableChart'
import { IconProps } from 'antd/lib/icon'
import { Icon, Tooltip, Popconfirm, Popover, Dropdown, Menu } from 'antd'

import ModulePermission from 'containers/Account/components/checkModulePermission'
import ShareDownloadPermission from 'containers/Account/components/checkShareDownloadPermission'
import { IProject } from 'containers/Projects/types'
import { IQueryConditions, IQueryVariableMap, SharePanelType, ILoadData } from '../types'
import { IWidgetFormed, IWidgetBase } from 'app/containers/Widget/types'
import { ControlPanelLayoutTypes, ControlPanelTypes } from 'app/components/Filters/constants'
import { OnGetControlOptions } from 'app/components/Filters/types'
import styles from '../Dashboard.less'
import utilStyles from 'app/assets/less/util.less'

interface IDashboardItemProps {
  itemId: number
  widget: IWidgetFormed
  widgets: IWidgetFormed[]
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
  drillHistory?: IDrillDetail[]
  drillpathSetting?: any
  drillpathInstance?: any
  rendered?: boolean
  renderType: RenderType
  selectedItems: number[]
  currentProject?: IProject
  queryConditions: IQueryConditions
  container?: string
  errorMessage: string
  onSelectDrillHistory?: (history?: any, item?: number, itemId?: number) => void
  onLoadData: ILoadData
  onShowEdit?: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onShowDrillEdit?: (itemId: number) => (e: React.MouseEvent<HTMLSpanElement>) => void
  onDeleteDashboardItem?: (itemId: number) => () => void
  onResizeDashboardItem: (itemId: number) => void
  onOpenSharePanel?: (id: number, type: SharePanelType, title: string, itemId?: number) => void
  onDownloadCsv: (itemId: number) => void
  onTurnOffInteract: (itemId: number) => void
  onShowFullScreen: (itemId: number) => void
  onCheckTableInteract: (itemId: number) => boolean
  onDoTableInteract: (itemId: number, triggerData: object) => void
  onEditWidget?: (itemId: number, widgetId: number) => void
  onDrillData?: (e: object) => void
  onDrillPathData?: (e: object) => void
  onSelectChartsItems?: (itemId: number, renderType: string, selectedItems: number[]) => void
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
  whichDataDrillBrushed: boolean | object []
  sourceDataOfBrushed: boolean | object []
  sourceDataGroup: boolean | string[]
  // isShowDrillPanel: boolean
  cacheWidgetProps: IWidgetConfig
  cacheWidgetId: boolean | number
}

export class DashboardItem extends React.PureComponent<IDashboardItemProps, IDashboardItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false,
      queryVariables: {},
      model: null,
      isDrilling: true,
      dataDrillPanelPosition: false,
      whichDataDrillBrushed: false,
      sourceDataOfBrushed: false,
      cacheWidgetProps: null,
      cacheWidgetId: false,
      sourceDataGroup: false
      //   isShowDrillPanel: true
    }
  }

  public static defaultProps = {
    onShowEdit: () => void 0,
    onShowDrillEdit: () => void 0,
    onDeleteDashboardItem: () => void 0
  }
  private pollingTimer: number
  private container: HTMLDivElement = null

  public componentWillMount () {
    const { itemId, widget, view, onLoadData, container } = this.props
    const { cacheWidgetProps, cacheWidgetId } = this.state
    const { autoLoadData } = widget.config
    if (container === 'share') {
      if (autoLoadData === true || autoLoadData === undefined) {
        onLoadData('clear', itemId)
      }
      this.initPolling(this.props)
    }
    this.setState({
      model: view.model
    })
    if (!cacheWidgetProps) {
      this.setState({
        cacheWidgetProps: {...widget.config},
        cacheWidgetId: widget.id
      })
    }
  }

  public componentWillReceiveProps (nextProps: IDashboardItemProps) {
    const { widget, queryConditions } = this.props
    let { model } = this.state

    if (nextProps.widget !== widget) {
      model = nextProps.view.model
      this.setState({
        model
      })
    }

    if (nextProps.queryConditions !== queryConditions) {
      const { variables, linkageVariables, globalVariables } = nextProps.queryConditions
      this.setState({
        queryVariables: [...variables, ...linkageVariables, ...globalVariables]
          .reduce((obj, { name, value }) => {
            obj[`$${name}$`] = value
            return obj
          }, {})
      })
    }
  }

  public componentWillUpdate (nextProps: IDashboardItemProps, nextState: IDashboardItemStates) {
    const {
      itemId,
      widget,
      polling,
      frequency,
      rendered,
      container,
      onLoadData
    } = nextProps
    const { autoLoadData } = widget.config
    if (!container) {
      if (!this.props.rendered && rendered) {
        // clear
        if (autoLoadData === true || autoLoadData === undefined) {
          onLoadData('clear', itemId)
        }
        this.initPolling(this.props)
      }
    }

    if (polling !== this.props.polling || frequency !== this.props.frequency) {
      this.initPolling(nextProps)
    }
  }

  public componentDidUpdate (prevProps, prevState) {
    if (prevState.controlPanelVisible !== this.state.controlPanelVisible) {
      const { itemId, onResizeDashboardItem } = this.props
      onResizeDashboardItem(itemId)
    }
  }

  public componentWillUnmount () {
    clearInterval(this.pollingTimer)
  }

  private initPolling = (props: IDashboardItemProps) => {
    const {
      polling,
      frequency,
      itemId,
      onLoadData
    } = props

    clearInterval(this.pollingTimer)

    if (polling) {
      this.pollingTimer = window.setInterval(() => {
        onLoadData('refresh', itemId)
      }, Number(frequency) * 1000)
    }
  }

  private onSyncBizdatas = () => {
    const {
      itemId,
      onLoadData,
      onMonitoredSyncDataAction
    } = this.props
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
    const { itemId, queryConditions, drillHistory, onLoadData } = this.props
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

  private doDrill = () => {
    const {cacheWidgetProps} = this.state
    this.setState({isDrilling: !this.state.isDrilling}, () => {
      const { onSelectDrillHistory, itemId, widget, onLoadData } = this.props
      onSelectDrillHistory(false, -1, itemId)
      onLoadData('rerender', itemId)
      if (!this.state.isDrilling) {
        this.setState({whichDataDrillBrushed: false})
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
        const {range, brushed, sourceData, sourceGroup} = ps
        const dataDrillPanelPosition = void 0
        const sourceDataOfBrushed = sourceData && sourceData.length ? sourceData : void 0
        const whichDataDrillBrushed = brushed && brushed.length ? brushed : void 0
        const sourceDataGroup = sourceGroup && sourceGroup.length ? sourceGroup : void 0
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

  private drillDataHistory = (history, item: number, itemId, widgetId) => {
    const { onSelectDrillHistory, drillHistory } = this.props
    const { widgetProps, cacheWidgetProps, cacheWidgetId } = this.state
    if (onSelectDrillHistory) {
      const wid = !history && item > -1 ? widgetId : cacheWidgetId
      if (item === -1 && !history) {
        this.setState({widgetProps: cacheWidgetProps})
      } else {
        const { cols, rows } = drillHistory[item]
        this.setState({ widgetProps: {...widgetProps, cols, rows}})
      }
      onSelectDrillHistory(history, item, itemId, wid)
    }
  }

  private drillDataHistory1 = (history, item, itemId, widgetId) => {
    console.log('drillHistory')
    const {onSelectDrillHistory, drillHistory, widget, onGetChartData} = this.props
    const { widgetProps, cacheWidgetProps } = this.state
    const wid = !history && item > -1 ? widgetId : this.state.cacheWidgetId
    if (onSelectDrillHistory) {
      const historyGroups = history ? drillHistory[item]['groups'] : []
      const historyCols = history && drillHistory[item]['col'] ? drillHistory[item]['col'] : cacheWidgetProps.cols
      const historyRows = history && drillHistory[item]['row'] ? drillHistory[item]['row'] : cacheWidgetProps.rows
      if (drillHistory && drillHistory[item] && drillHistory[item]['widgetConfig']) {
        const dw = drillHistory[item].widgetConfig
        this.setState({
          widgetProps: dw
        })
        onSelectDrillHistory(history, item, itemId, wid)
        return
      }
      if (widgetProps.dimetionAxis) {
        if (widgetProps.dimetionAxis === 'col') {
          this.setState({
            widgetProps: {
              ...widgetProps,
              ...{
                cols: historyGroups && historyGroups.length ? historyGroups.map((history) => ({name: history})) : cacheWidgetProps.cols
              }
            }
          })
        } else if (widgetProps.dimetionAxis === 'row') {
          this.setState({
            widgetProps: {
              ...widgetProps,
              ...{
                rows: historyGroups && historyGroups.length ? historyGroups.map((history) => ({name: history})) : cacheWidgetProps.rows
              }
            }
          })
        } else {
          this.setState({
            widgetProps: {
              ...widgetProps,
              ...{
                cols: historyCols,
                rows: historyRows
              }
            }
          })
        }
      } else {
        this.setState({
          widgetProps: {
            ...widgetProps,
            ...{
              cols: historyCols,
              rows: historyRows
            }
          }
        })
      }
      if (item === -1 && !history) {
        this.setState({widgetProps: {...this.state.cacheWidgetProps}})
      }
      onSelectDrillHistory(history, item, itemId, wid)
    }
  }
  private drillpathData = () => {
    // todo
    // 由于前端拿不到全量数据，所以在model中选取的没有数值的纬度列，可能会导致filter不合法的情况。
    const { whichDataDrillBrushed, sourceDataOfBrushed } = this.state
    const { drillpathInstance, drillpathSetting, drillHistory, itemId, widgets, onDrillPathData, onGetChartData } = this.props
    let out = void 0
    let enter = void 0
    let widget = void 0
    let prevDrillHistory = void 0
    if (!drillHistory || (drillHistory && drillHistory.length === 0)) {
      out = drillpathSetting[0]['out']
      enter = drillpathSetting[1]['enter']
      widget = drillpathSetting[1]['widget']
    } else if (drillpathSetting && drillpathSetting.length > 2) {
      prevDrillHistory = drillHistory[drillHistory.length - 1]
      const currentItem = drillHistory.length + 1
      out = drillpathSetting[currentItem - 1]['out']
      widget = drillpathSetting[currentItem]['widget']
      enter = drillpathSetting[currentItem]['enter']
    }
    const value = (sourceDataOfBrushed as object[]).map((source) => {
      return source[out]
    })
    const nextWidget = widgets.find((w) => w.id === Number(widget))
    const widgetProps = JSON.parse(nextWidget.config)
    // todo  filter 重构
    const sql = `${enter} in (${value.map((key) => `'${key}'`).join(',')})`
    let sqls = widgetProps.filters.map((i) => i.config.sql)
    sqls.push(sql)
    if (prevDrillHistory && prevDrillHistory.filter.sqls) {
      const prevSqls = prevDrillHistory.filter.sqls
      sqls = sqls.concat(prevSqls)
    }
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetProps
    let widgetConfigGroups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)

    if (color) {
      widgetConfigGroups = widgetConfigGroups.concat(color.items.map((c) => c.name))
    }
    if (label) {
      widgetConfigGroups = widgetConfigGroups.concat(label.items
        .filter((l) => l.type === 'category')
        .map((l) => l.name))
    }
    const currentDrillStatus = {
      filter: {
        out,
        enter,
        value,
        sql,
        sqls
      },
      groups: widgetConfigGroups,
      name: nextWidget.name,
      widgetConfig: widgetProps
    }
    this.setState({
      widgetProps
    })
    onGetChartData('rerender', itemId, Number(widget), {
      drillStatus: currentDrillStatus
    })
    onDrillPathData({
       sourceDataFilter: sourceDataOfBrushed,
       widget,
       itemId,
       widgetProps,
       out,
       enter,
       value,
       currentDrillStatus
    })
  }

  private receiveWidgetId () {
    const { widget } = this.props
    operationWidgetProps.receive(widget.id)
  }

  private isHasDrillHistory (): boolean {
    const { drillHistory } = this.props
    return !!(drillHistory && (drillHistory.length !== 0))
  }

  private getLastDrillHistory () {
    const { drillHistory } = this.props
    return [...drillHistory].pop()
  }

  private sendDrillDetail (e) {
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
      set = strategiesOfDrillUpHasDrillHistory(getLastDrillHistory, this.state.widgetProps)({name}, sourceDataOfBrushed)
    } else {
      set = strategiesOfDrillUpNullDrillHistory(operationWidgetProps, this.state.widgetProps)({name}, sourceDataOfBrushed)
    }

    const { pivot, coustomTable } = set

    if (operationWidgetProps.isPivot()) {
      const {
        cols, rows, type, groups, filters, widgetProps, currentGroup
      } = pivot()
      this.setState({widgetProps})
      this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup})
      return
    }

    if (this.isCoustomTable()) {
      const {
        cols, rows, type, groups, filters, widgetProps, currentGroup
      } = coustomTable()
      this.setState({widgetProps})
      this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup})
      return
    }
  }

  private isCoustomTable () {
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
      set = strategiesOfDrillDownHasDrillHistory(getLastDrillHistory, this.state.widgetProps)({name}, sourceDataOfBrushed, sourceDataGroup)
    } else {
      set = strategiesOfDrillDownNullDrillHistory(operationWidgetProps, this.state.widgetProps)({name}, sourceDataOfBrushed, sourceDataGroup)
    }

    const { dimetionAxisCol, dimetionAxisRow, pivotCol, pivotRow, coustomTable, defaultScenes } = set

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

    const { cols, rows, type, groups, filters, widgetProps, currentGroup } = strategiteStream
    this.sendDrillDetail({ cols, rows, type, groups, filters, currentGroup})
    this.setState({widgetProps})
  }

  private drillData = (name, dimensions?) => {
    const { onDrillData, widget, itemId } = this.props
    const { widgetProps, cacheWidgetProps, sourceDataGroup } = this.state

    let mode = void 0
    if (widget && widget.config) {
      const cf = JSON.parse(widget.config)
      mode = cf.mode
    }

    if (onDrillData) {
      onDrillData({
        row: dimensions === 'row' ? name : [],
        col: dimensions === 'col' ? name : [],
        mode, // mode 外层widgetProps 可以获取，不需要重复传递
        itemId,  // 保留
        widgetId: widget.id, // 保留
        groups: name, // 保留 ，改为 drillGroup
        filters: this.state.whichDataDrillBrushed,
        sourceDataFilter: this.state.sourceDataOfBrushed || [],
        sourceDataGroup // selectdGroups   coustom table 独享
      })
    }
    this.setState({whichDataDrillBrushed: false})
    const isDrillUp = widgetProps.cols.some((col) => col.name === name) || widgetProps.rows.some((row) => row.name === name)
    if (isDrillUp) {
      const newCols = widgetProps.cols.filter((col) => col.name !== name)
      const newRows = widgetProps.rows.filter((row) => row.name !== name)
      this.setState({
        widgetProps: {
          ...widgetProps,
          ...{
            cols: newCols,
            rows: newRows
          }
        }
      })
    } else {
      if (dimensions && dimensions.length) { // pivot table
        switch (dimensions) {
          case 'row':
            this.setState({
              widgetProps: {
                ...widgetProps,
                ...{
                  rows: name && name.length
                  ? widgetProps.rows.concat({name})
                  : cacheWidgetProps.rows
                }
              }
            })
            break
          case 'col':
            this.setState({
              widgetProps: {
                ...widgetProps,
                cols: name && name.length
                ? widgetProps.cols.concat({name})
                : cacheWidgetProps.cols
              }
            })
            break
          default:
            return
        }
      } else if (widgetProps && widgetProps.dimetionAxis) {
        switch (widgetProps.dimetionAxis) {
          case 'col':
            this.setState({
                widgetProps: {
                  ...widgetProps,
                  ...{
                    cols: name && name.length
                    ? mode === 'pivot' ? widgetProps.cols.concat({name}) : [{name}]
                    : cacheWidgetProps.cols
                  }
                }
            })
            break
          case 'row':
            this.setState({
              widgetProps: {
                ...widgetProps,
                ...{
                  rows: name && name.length
                  ? mode === 'pivot' ? widgetProps.rows.concat({name}) : [{name}]
                  : cacheWidgetProps.rows
                }
              }
            })
            break
          default:
            break
        }
      } else if (widgetProps.selectedChart === ChartTypes.Table) {
        const cols = widgetProps.cols
        const { whichDataDrillBrushed, sourceDataOfBrushed } = this.state
        const sourceDataGroup = Array.isArray(this.state.sourceDataGroup) ? [...(this.state.sourceDataGroup as Array<string>)] : []
        const drillData = whichDataDrillBrushed[0][0]
        const drillKey = drillData && drillData.length ? drillData[drillData.length - 1]['key'] : sourceDataGroup && sourceDataGroup.length ? sourceDataGroup.pop() : ''

        const newWidgetPropCols = cols.reduce((array, col) => {
          array.push(col)
          if (col.name === drillKey) { // name 插入的位置标识
            array.push({name})
          }
          return array
        }, [])

        this.setState({
          widgetProps: {
            ...widgetProps,
            ...{
              cols: name && name.length
              ? newWidgetPropCols
              : cacheWidgetProps.cols
            }
          }
        })
      } else {
        this.setState({
          widgetProps: {
            ...widgetProps,
            ...{
              cols: name && name.length
              ? mode === 'pivot' ? widgetProps.cols.concat({name}) : [{name}]
              : cacheWidgetProps.cols
            }
          }
        })
      }
    }
  }

  private selectChartsItems = (selectedItems) => {
    const {onSelectChartsItems, itemId} = this.props
    if (onSelectChartsItems) {
      onSelectChartsItems(itemId, 'select', selectedItems)
    }
  }

  public render () {
    const {
      itemId,
      widget,
      datasource,
      loading,
      interacting,
      shareToken,
      drillHistory,
      drillpathSetting,
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
    const data = datasource.resultList

    const {
      controlPanelVisible,
      queryVariables,
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
            shareLoading={shareLoading}
            downloadCsvLoading={downloadCsvLoading}
            onDownloadCsv={this.downloadCsv}
          />
        </Tooltip>
      )

      const ShareButton = ShareDownloadPermission<IconProps>(currentProject, 'share')(Icon)
      shareButton = (
        <Tooltip title="分享">
          <ShareButton type="share-alt" onClick={this.openSharePanel} />
        </Tooltip>
      )

      const EditButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(currentProject, 'viz', false)(Span)
      widgetButton = (
        <Tooltip title="编辑widget">
          {/* <i className="iconfont icon-edit-2" onClick={this.toWorkbench} /> */}
          <i>
            <EditButton className="iconfont icon-edit-2" onClick={this.toWorkbench} />
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
      const InfoButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(currentProject, 'viz', false)(Span)
      const DeleteButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(currentProject, 'viz', true)(Span)
      const menu = (
        <Menu>
          <Menu.Item className={styles.menuItem}>
            <InfoButton className={styles.menuText} onClick={onShowEdit(itemId)}>基本信息</InfoButton>
          </Menu.Item>
          {/* <Menu.Item className={styles.menuItem}>
            <InfoButton className={styles.menuText} onClick={onShowDrillEdit(itemId)}>钻取设置</InfoButton>
          </Menu.Item> */}
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
        title={(
          <>
            <p>错误信息：</p>
            <p>{errorMessage}</p>
          </>
        )}
        placement="bottomLeft"
        overlayClassName={styles.widgetInfoContent}
      >
        <Icon
          className={styles.error}
          type="warning"
        />
      </Tooltip>
    )

    const drillButton = (
    <Tooltip title="钻取">
      <span style={{marginLeft: '8px', cursor: 'pointer', fontSize: '18px'}}  onClick={this.doDrill} className={`iconfont ${isDrilling ? 'icon-cube1' : 'icon-cube2'}`}/>
    </Tooltip>)

    const gridItemClass = classnames({
      [styles.gridItem]: true,
      [styles.interact]: interacting
    })
    const isDrillableChart = DrillableChart.some((drillable) => drillable === widget.config.selectedChart)
    const drillInteractIcon = this.props.isTrigger === false ? isDrillableChart
                                                                ? (<Tooltip title="可钻取"><i className="iconfont icon-xiazuan"/></Tooltip>)
                                                                : void 0
                                                              : (<Tooltip title="可联动"><i className="iconfont icon-liandong1"/></Tooltip>)
    const triggerClass = classnames({
      [styles.trigger]: true,
      [utilStyles.hide]: this.props.isTrigger === false
    })

    let isSelectedData = false
    if (this.state.whichDataDrillBrushed) {
      (this.state.whichDataDrillBrushed as object[]).forEach((brushed, index) => {
        if (brushed[index] && (brushed[index] as any[]).length > 0) {
          isSelectedData = true
        }
      })
    }

    const dataDrillPanelClass = classnames({
      [styles.dataDrillPanel]: true,
     // [utilStyles.hide]: !isSelectedData
    })
    let positionStyle = {}
    if (this.state.dataDrillPanelPosition) {
      positionStyle = this.state.dataDrillPanelPosition
    }
    let mode = void 0
    if (widget && widget.config) {
      mode = widget.config.mode
    }
    const dataDrillPanel =
    (
      <div className={dataDrillPanelClass}>
        <DataDrill
          widgetConfig={widget.config}
          onDataDrillPath={this.drillpathData}
          onDataDrillDown={this.drillDown}
          onDataDrillUp={this.drillUp}
          drillHistory={drillHistory}
          drillpathSetting={drillpathSetting}
          widgetMode={mode}
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


    return (
      <div className={gridItemClass} ref={(f) => this.container = f}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h4>{widget.name}</h4>
            {descIcon}
            {errorIcon}
            {controlToggle}
            {loadingIcon}
            {}
          </div>
          <div className={styles.tools}>
            <Tooltip title="同步数据">
              {!loading && <Icon type="reload" onClick={this.onSyncBizdatas} />}
            </Tooltip>
            {widgetButton}
            <Tooltip title="全屏">
              <Icon type="fullscreen" onClick={this.onFullScreen} className={styles.fullScreen} />
            </Tooltip>
            {shareButton}
            {downloadButton}
            {dropdownMenu}
          </div>
        </div>

        {/* <div className={triggerClass}>
          <i className="iconfont icon-icon_linkage"/>
        </div> */}

        <div className={styles.trigger}>
          {drillInteractIcon}
        </div>
        <div
          className={styles.offInteract}
          onClick={this.turnOffInteract}
        >
          <i className="iconfont icon-unlink" />
          <h3>点击取消联动</h3>
        </div>
        <div className={classnames({[utilStyles.hide]: !controlPanelVisible})}>
          <LocalControlPanel
            itemId={itemId}
            widget={widget}
            layoutType={ControlPanelLayoutTypes.DashboardItem}
            onGetOptions={onGetControlOptions}
            onSearch={onControlSearch}
            onMonitoredSearchDataAction={onMonitoredSearchDataAction}
          />
        </div>
        <Dropdown overlay={dataDrillPanel} placement="topCenter" trigger={['contextMenu']}>
          <div className={styles.block}>
            <Widget
              {...widget.config}
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
            //  onHideDrillPanel={this.onHideDrillPanel}
            />
            {dataDrillHistory}
          </div>
        </Dropdown>
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
