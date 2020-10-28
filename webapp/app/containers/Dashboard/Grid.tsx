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

import React, { createRef, RefObject } from 'react'
import { findDOMNode } from 'react-dom'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router-dom'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import viewReducer from 'containers/View/reducer'
import viewSaga from 'containers/View/sagas'
import controlReducer from 'app/containers/ControlPanel/reducer'

import {
  IDashboard,
  IDashboardItem,
  QueryVariable,
  IQueryConditions,
  TShareVizsType
} from './types'
import { RouteComponentWithParams } from 'utils/types'

import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Toolbar from './components/Toolbar'
import DashboardItemForm from './components/DashboardItemForm'
import DashboardItem from './components/DashboardItem'
import DashboardLinkageConfig from './components/DashboardLinkageConfig'

import { IDistinctValueReqeustParams } from 'app/components/Control/types'
import { ControlPanelLayoutTypes, ControlPanelTypes } from 'app/components/Control/constants'
import GlobalControlPanel from '../ControlPanel/Global'
import GlobalControlConfig from 'app/components/Control/Config'
import SharePanel from './SharePanel'
import { getMappingLinkage, processLinkage, removeLinkage } from 'components/Linkages'
import { hasVizEditPermission } from '../Account/components/checkUtilPermission'

import { Responsive, WidthProvider } from 'react-grid-layout'
import AntdFormType from 'antd/lib/form/Form'
import { Row, Col, Button, Modal, Breadcrumb, Menu, message } from 'antd'
import FullScreenPanel from './FullScreenPanel'
import { DashboardActions } from './actions'
const {
  loadDashboardDetail,
  addDashboardItems,
  editDashboardItem,
  editDashboardItems,
  deleteDashboardItem,
  clearCurrentDashboard,
  loadDashboardItemData,
  loadBatchDataWithControlValues,
  initiateDownloadTask,
  renderDashboardItem,
  resizeDashboardItem,
  resizeAllDashboardItem,
  renderChartError,
  openSharePanel,
  drillDashboardItem,
  deleteDrillHistory,
  drillPathsetting,
  selectDashboardItemChart,
  setFullScreenPanelItemId,
  monitoredSyncDataAction,
  monitoredLinkageDataAction,
  monitoredSearchDataAction
} = DashboardActions
import {
  makeSelectCurrentDashboard,
  makeSelectCurrentDashboardLoading,
  makeSelectCurrentItems,
  makeSelectCurrentItemsInfo,
  makeSelectCurrentLinkages
} from './selectors'
import VizActions from 'containers/Viz/actions'
import { makeSelectCurrentPortal, makeSelectCurrentDashboards } from 'containers/Viz/selectors'
import ViewActions from 'containers/View/actions'
import { ControlActions } from 'containers/ControlPanel/actions'

const {
  loadViews,
  loadViewsDetail,
  loadSelectOptions,
  loadColumnDistinctValue
} = ViewActions
const { setSelectOptions } = ControlActions
import { makeSelectWidgets } from 'containers/Widget/selectors'
import { makeSelectViews, makeSelectFormedViews } from 'containers/View/selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import {
  DEFAULT_SPLITER,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ITEM_MARGIN,
  GRID_ROW_HEIGHT
} from 'app/globalConstants'
import { RenderType } from '../Widget/components/Widget'
import { DownloadTypes } from '../App/constants'
import { statistic, IVizData } from 'utils/statistic/statistic.dv'
const utilStyles = require('assets/less/util.less')
const styles = require('./Dashboard.less')
const ResponsiveReactGridLayout = WidthProvider(Responsive)
import { IDrillDetail } from 'components/DataDrill/types'
import { IView } from '../View/types'
type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>

type IGridProps = MappedStates & MappedDispatches

interface IGridStates {
  mounted: boolean
  layoutInitialized: boolean
  dashboardItemFormType: string
  dashboardItemFormVisible: boolean
  dashboardItemFormStep: number
  modalLoading: boolean
  selectedWidgets: number[]
  currentItemId: number | boolean
  polling: boolean
  linkageConfigVisible: boolean
  interactingStatus: { [itemId: number]: boolean }
  globalControlConfigVisible: boolean
  nextMenuTitle: string
}

interface IDashboardItemForm extends AntdFormType {
  onReset: () => void
}

export class Grid extends React.Component<IGridProps & RouteComponentWithParams, IGridStates> {
  constructor (props) {
    super(props)

    this.state = {
      mounted: false,
      layoutInitialized: false,

      dashboardItemFormType: '',
      dashboardItemFormVisible: false,
      dashboardItemFormStep: 0,
      modalLoading: false,
      selectedWidgets: [],
      polling: false,
      currentItemId: false,

      linkageConfigVisible: false,
      interactingStatus: {},
      globalControlConfigVisible: false,

      nextMenuTitle: ''
    }

  }

  private containerBody: RefObject<HTMLDivElement> = createRef()
  private containerBodyScrollThrottle: boolean = false
  private interactCallbacks: object = {}
  private interactingLinkagers: object = {}
  private interactGlobalFilters: object = {}
  private resizeSign: number
  private dashboardItemForm: IDashboardItemForm = null
  private refHandles = {
    dashboardItemForm: (f) => { this.dashboardItemForm = f }
  }

  public componentWillMount () {
    const { match, widgets, onLoadDashboardDetail } = this.props
    const { portalId, dashboardId } = match.params
    if (dashboardId && Number(dashboardId) !== -1 && widgets) {
      onLoadDashboardDetail(+portalId, Number(dashboardId))
    }
  }

  private getVizDataForStatistic ({
    portalId,
    projectId,
    dashboardId,
    currentPortal,
    currentProject,
    currentDashboard
  }): IVizData {
    return {
      project_id: +projectId,
      project_name: currentProject && currentProject.name,
      org_id: currentProject && currentProject.orgId,
      viz_type: 'dashboard',
      viz_id: +portalId,
      viz_name: currentPortal && currentPortal.name,
      sub_viz_id: +dashboardId,
      sub_viz_name: currentDashboard && currentDashboard['name']
    }
  }

  public componentWillReceiveProps (nextProps: IGridProps & RouteComponentWithParams) {
    const {
      currentDashboard,
      currentDashboardLoading,
      currentItems,
      currentPortal,
      match: { params: nextParams },
      onLoadDashboardDetail
    } = nextProps
    const { layoutInitialized } = this.state

    const { match, currentProject} = this.props
    const { projectId, portalId, dashboardId } = match.params

    const getVizData = this.getVizDataForStatistic({
      projectId,
      portalId,
      dashboardId: nextParams.dashboardId,
      currentPortal,
      currentProject,
      currentDashboard
    })

    if (nextParams.dashboardId === dashboardId) {
      if (nextProps.currentDashboard !== this.props.currentDashboard) {
        statistic.setOperations({
          ...getVizData,
          create_time:  statistic.getCurrentDateTime()
        }, (data) => {
          const visitRecord = {
            ...data,
            action: 'visit'
          }
          statistic.sendOperation(visitRecord).then((res) => {
            statistic.updateSingleFleld('operation', 'action', 'initial')
          })
        })
      }
    }

    if (nextParams.dashboardId !== dashboardId) {
      this.setState({
        nextMenuTitle: ''
      })

      if (nextParams.dashboardId && Number(nextParams.dashboardId) !== -1) {
        onLoadDashboardDetail(+nextParams.portalId, +nextParams.dashboardId)
      }

      statistic.setDurations({
        ...getVizData,
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.sendDuration([data]).then((res) => {
          statistic.setDurations({
            start_time: statistic.getCurrentDateTime()  // 初始化下一时段
          })
        })
      })
    }

    if (!currentDashboardLoading) {
      if (currentItems && !layoutInitialized) {
        this.setState({
          mounted: true
        }, () => {
          this.lazyLoad()
          this.containerBody.current.removeEventListener('scroll', this.lazyLoad, false)
          this.containerBody.current.addEventListener('scroll', this.lazyLoad, false)
        })
      }
    }

    if (currentDashboard && currentDashboard.name) {
      statistic.setDurations({
        sub_viz_name: currentDashboard.name
      })
    }

    if (currentProject && currentProject.name) {
      statistic.setDurations({
        project_name: currentProject.name,
        org_id: currentProject.orgId
      })
    }

    if (currentPortal && currentPortal.name) {
      statistic.setDurations({
        viz_name:  currentPortal.name
      })
    }

  }
  private statisticTimeFuc = () => {
    statistic.isTimeout()
  }
  public componentDidMount () {
    const {
      match,
      currentProject,
      currentDashboard,
      currentPortal,
      match: { params }
    } = this.props

    const { projectId, portalId } = match.params
    const getVizData = this.getVizDataForStatistic({
      projectId,
      portalId,
      dashboardId: params.dashboardId,
      currentPortal,
      currentProject,
      currentDashboard
    })

    window.addEventListener('resize', this.onWindowResize, false)
    window.addEventListener('beforeunload', function (event) {
      statistic.setDurations({
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.setPrevDurationRecord(data, () => {
          statistic.setDurations({
            start_time: statistic.getCurrentDateTime(),
            end_time: ''
          })
        })
      })
    }, false)
    statistic.setDurations({
      ...getVizData,
      start_time: statistic.getCurrentDateTime()
    })
    statistic.startClock()
    window.addEventListener('mousemove', this.statisticTimeFuc, false)
    window.addEventListener('visibilitychange', this.onVisibilityChanged, false)
    window.addEventListener('keydown', this.statisticTimeFuc, false)
  }

  private onVisibilityChanged (event) {
    const flag = event.target.webkitHidden
    if (flag) {
      statistic.setDurations({
        end_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.sendDuration([data]).then((res) => {
          statistic.resetClock()
        })
      })
    } else {
      statistic.setDurations({
        start_time: statistic.getCurrentDateTime()
      }, (data) => {
        statistic.startClock()
      })
    }
  }

  public componentWillUnmount () {
    statistic.setDurations({
      end_time: statistic.getCurrentDateTime()
    }, (data) => {
      statistic.sendDuration([data])
    })
    window.removeEventListener('resize', this.onWindowResize, false)
    window.removeEventListener('mousemove', this.statisticTimeFuc, false)
    window.removeEventListener('visibilitychange', this.onVisibilityChanged, false)
    window.removeEventListener('keydown', this.statisticTimeFuc, false)
    this.containerBody.current.removeEventListener('scroll', this.lazyLoad, false)
    this.props.onClearCurrentDashboard()
    statistic.resetClock()
  }

  private lazyLoad = () => {
    if (!this.containerBodyScrollThrottle) {
      requestAnimationFrame(() => {
        const { currentItems, currentItemsInfo, onRenderDashboardItem } = this.props

        const waitingItems = currentItems.filter((item) => !currentItemsInfo[item.id].rendered)

        if (waitingItems.length) {
          const { offsetHeight, scrollTop } = this.containerBody.current
          waitingItems.forEach((item) => {
            const itemTop = this.calcItemTop(item.y)

            if (itemTop - scrollTop < offsetHeight) {
              onRenderDashboardItem(item.id)
            }
          })
        } else {
          if (this.containerBody.current) {
            this.containerBody.current.removeEventListener('scroll', this.lazyLoad, false)
          }
        }
        this.containerBodyScrollThrottle = false
      })
      this.containerBodyScrollThrottle = true
    }
  }

  private calcItemTop = (y: number) => Math.round((GRID_ROW_HEIGHT + GRID_ITEM_MARGIN) * y)

  private loadViews = () => {
    const { match, onLoadViews } = this.props
    const { projectId } = match.params
    onLoadViews(Number(projectId))
  }

  private initiateWidgetDownloadTask = (itemId: number) => {
    this.props.onInitiateDownloadTask(DownloadTypes.Widget, void 0, itemId)
  }

  private initiateDashboardDownloadTask = () => {
    const { currentDashboard, onInitiateDownloadTask } = this.props
    onInitiateDownloadTask(DownloadTypes.Dashboard, currentDashboard.id)
  }

  private onDragStop = (layout) => {
    this.onEditDashboardItemsPosition(layout)
  }

  private onResizeStop = (layout, oldItem) => {
    this.onEditDashboardItemsPosition(layout)
    this.props.onResizeDashboardItem(Number(oldItem.i))
  }

  private onEditDashboardItemsPosition = (layout) => {
    const { currentItems, onEditDashboardItems, match } = this.props
    const portalId = +match.params.portalId
    const changedItems = currentItems.map((item) => {
      const { x, y, w, h } = layout.find((l) => Number(l.i) === item.id)
      return {
        ...item,
        x,
        y,
        width: w,
        height: h
      }
    })
    onEditDashboardItems(portalId, changedItems)
  }

  private onBreakpointChange = () => {
    this.props.onResizeAllDashboardItem()
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

  private showAddDashboardItemForm = () => {
    this.setState({
      dashboardItemFormType: 'add',
      dashboardItemFormVisible: true
    })
  }

  private showEditDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)
    this.setState({
      dashboardItemFormType: 'edit',
      dashboardItemFormVisible: true,
      dashboardItemFormStep: 1,
      selectedWidgets: [dashboardItem.widgetId],
      polling: dashboardItem.polling
    }, () => {
      setTimeout(() => {
        this.dashboardItemForm.props.form.setFieldsValue({
          id: dashboardItem.id,
          polling: dashboardItem.polling ? 'true' : 'false',
          frequency: dashboardItem.frequency,
          alias: dashboardItem.alias
        })
      }, 0)
    })
  }
  private showDrillDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find((c) => c.id === itemId)
    this.setState({
      selectedWidgets: [dashboardItem.widgetId],
      currentItemId: itemId
    })
  }

  private hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false,
      selectedWidgets: []
    })
  }

  private afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidgets: [],
      polling: false,
      dashboardItemFormStep: 0
    })
    this.dashboardItemForm.onReset()
    this.dashboardItemForm.props.form.resetFields()
  }

  private widgetSelect = (selectedRowKeys) => {
    this.setState({
      selectedWidgets: selectedRowKeys
    })
  }

  private pollingSelect = (val) => {
    this.setState({
      polling: val === 'true'
    })
  }

  private changeDashboardItemFormStep = (sign) => () => {
    this.setState({
      dashboardItemFormStep: sign
    })
  }

  private saveDashboardItem = () => {
    const { match, currentDashboard, currentItems, widgets, formedViews, onLoadDashboardItemData } = this.props
    const portalId = +match.params.portalId
    const { selectedWidgets, dashboardItemFormType } = this.state
    const formdata: any = this.dashboardItemForm.props.form.getFieldsValue()
    const cols = GRID_COLS.lg

    const yArr = [...currentItems.map((item) => item.y + item.height), 0]
    const maxY = Math.max(...yArr)
    const secondMaxY = maxY === 0 ? 0 : Math.max(...yArr.filter((y) => y !== maxY))

    let maxX = 0
    if (maxY) {
      const maxYItems = currentItems.filter((item) => item.y + item.height === maxY)
      maxX = Math.max(...maxYItems.map((item) => item.x + item.width))

      // if (maxX + 6 > cols) {
        // maxX = 0
      // }
    }

    this.setState({ modalLoading: true })

    const newItem = {
      dashboardId: currentDashboard.id,
      polling: formdata.polling !== 'false',
      frequency: formdata.frequency
    }

    if (dashboardItemFormType === 'add') {
      const positionInfo = {
        width: 6,
        height: 6
      }

      const newItems = selectedWidgets.map((key, index) => {
        const xAxisTemp = index % 2 !== 0 ? 6 : 0
        const yAxisTemp = index % 2 === 0
          ? secondMaxY + 6 * Math.floor(index / 2)
          : maxY + 6 * Math.floor(index / 2)
        let xAxis
        let yAxis
        if (maxX > 0 && maxX <= 6) {
          xAxis = index % 2 === 0 ? 6 : 0
          yAxis = yAxisTemp
        } else if (maxX === 0) {
          xAxis = xAxisTemp
          yAxis = yAxisTemp
        } else if (maxX > 6) {
          xAxis = xAxisTemp
          yAxis = maxY + 6 * Math.floor(index / 2)
        }
        const item = {
          widgetId: key,
          x: xAxis,
          y: yAxis,
          ...newItem,
          ...positionInfo
        }
        return item
      })
      const selectedWidgetsViewIds = widgets.filter((w) => selectedWidgets.includes(w.id)).map((w) => w.viewId)
      const viewIds = selectedWidgetsViewIds
        .filter((viewId, idx) => selectedWidgetsViewIds.indexOf(viewId) === idx)
        .filter((viewId) => !formedViews[viewId])

      if (viewIds.length) {
        this.props.onLoadViewsDetail(viewIds, () => {
          this.props.onAddDashboardItems(portalId, newItems, () => {
            this.hideDashboardItemForm()
          })
        })
      } else {
        this.props.onAddDashboardItems(portalId, newItems, () => {
          this.hideDashboardItemForm()
        })
      }
    } else {
      const dashboardItem = currentItems.find((item) => item.id === Number(formdata.id))
      const modifiedDashboardItem = {
        ...dashboardItem,
        ...newItem,
        widgetId: selectedWidgets[0],
        alias: formdata['alias']
      }

      this.props.onEditDashboardItem(portalId, modifiedDashboardItem, () => {
        onLoadDashboardItemData('rerender', modifiedDashboardItem.id)
        this.hideDashboardItemForm()
      })
    }
  }

  private deleteItem = (id) => () => {
    this.props.onDeleteDashboardItem(id)
  }

  private navDropdownClick = (e) => {
    const { match } = this.props
    const { projectId, portalId } = match.params
    this.props.history.push(`/project/${projectId}/portal/${portalId}/dashboard/${e.key}`)
  }

  private nextNavDropdownClick = (e) => {
    const {widgets} = this.props
    const itemId = e.item && e.item.props && e.item.props.id
    const widgetId = e.item && e.item.props && e.item.props.widgetId
    const widgetDOM = findDOMNode(this[`dashboardItem${itemId}`])
    if (widgetDOM) {
      const widgetParentDOM = widgetDOM.parentNode as HTMLElement
      const scrollCount = widgetParentDOM.style.transform && widgetParentDOM.style.transform.match(/\d+/g)[1]
      const containerBody = widgetParentDOM.parentNode.parentNode as HTMLElement
      const scrollHeight = parseInt(scrollCount, 10) - GRID_ITEM_MARGIN
      containerBody.scrollTop = scrollHeight
    }
    this.setState({
      nextMenuTitle: widgets.find((widget) => widget.id === widgetId)['name']
    })
  }

  private openLinkageConfig = () => {
    this.setState({
      linkageConfigVisible: true
    })
  }

  private closeLinkageConfig = () => {
    this.setState({
      linkageConfigVisible: false
    })
  }

  private saveLinkageConfig = (linkages: any[]) => {
    const { currentDashboard, onEditCurrentDashboard } = this.props

    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: {
          ...currentDashboard.config,
          linkages
        }
      },
      'linkage',
      () => {
        this.closeLinkageConfig()
        this.clearAllInteracts()
      }
    )
  }

  private checkInteract = (itemId: number) => {
    const { currentLinkages } = this.props
    const isInteractiveItem = currentLinkages.some((c) => {
      const { trigger } = c
      const triggerId = +trigger[0]
      return triggerId === itemId
    })
    return isInteractiveItem
  }

  private doInteract = (itemId: number, triggerData) => {
    const {
      currentLinkages,
      onLoadDashboardItemData,
      onMonitoredLinkageDataAction
    } = this.props

    const mappingLinkage = getMappingLinkage(itemId, currentLinkages)
    this.interactingLinkagers = processLinkage(itemId, triggerData, mappingLinkage, this.interactingLinkagers)

    Object.keys(mappingLinkage).forEach((linkagerItemId) => {
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      onLoadDashboardItemData('clear', +linkagerItemId, {
        linkageFilters: Object.values(filters).reduce<string[]>((arr, f: string[]) => arr.concat(...f), []),
        linkageVariables: Object.values(variables).reduce<QueryVariable>((arr, p: QueryVariable) => arr.concat(...p), [])
      })
    })
    this.setState({
      interactingStatus: {
        ...this.state.interactingStatus,
        [itemId]: true
      }
    })
    if (onMonitoredLinkageDataAction) {
      onMonitoredLinkageDataAction()
    }
  }

  private clearAllInteracts = () => {
    const { onLoadDashboardItemData } = this.props
    Object.keys(this.interactingLinkagers).forEach((linkagerItemId) => {
      onLoadDashboardItemData('clear', +linkagerItemId, {
        linkageFilters: [],
        linkageVariables: []
      })
    })
    this.interactingLinkagers = {} // FIXME need remove interact effect
    this.setState({ interactingStatus: {} })
  }

  private turnOffInteract = (itemId) => {
    const {
      currentLinkages,
      onLoadDashboardItemData,
      onMonitoredLinkageDataAction
    } = this.props

    const refreshItemIds = removeLinkage(itemId, currentLinkages, this.interactingLinkagers)
    refreshItemIds.forEach((linkagerItemId) => {
      const { filters, variables } = this.interactingLinkagers[linkagerItemId]
      onLoadDashboardItemData('rerender', linkagerItemId, {
        linkageFilters: Object.values(filters).reduce<string[]>((arr, f: string[]) => arr.concat(...f), []),
        linkageVariables: Object.values(variables).reduce<QueryVariable>((arr, p: QueryVariable) => arr.concat(...p), [])
      })
    })
    this.setState({
      interactingStatus: {
        ...this.state.interactingStatus,
        [itemId]: false
      }
    }, () => {
      onLoadDashboardItemData('clear', itemId)
    })
    if (onMonitoredLinkageDataAction) {
      onMonitoredLinkageDataAction()
    }
  }

  private openGlobalControlConfig = () => {
    this.setState({
      globalControlConfigVisible: true
    })
  }

  private closeGlobalControlConfig = () => {
    this.setState({
      globalControlConfigVisible: false
    })
  }

  private saveControls = (controls, queryMode) => {
    const {
      currentDashboard,
      onEditCurrentDashboard
    } = this.props

    onEditCurrentDashboard(
      {
        ...currentDashboard,
        config: {
          ...currentDashboard.config,
          filters: controls,
          queryMode
        }
      },
      'control',
      () => {
        this.closeGlobalControlConfig()
      }
    )
  }

  private getControlSelectOptions = (controlKey: string, useOptions: boolean, paramsOrOptions, itemId?: number) => {
    if (useOptions) {
      this.props.onSetSelectOptions(controlKey, paramsOrOptions, itemId)
    } else {
      this.props.onLoadSelectOptions(controlKey, paramsOrOptions, itemId)
    }
  }

  private openDashboardSharePanel = () => {
    const { currentDashboard, onOpenSharePanel } = this.props
    const { id, name } = currentDashboard
    onOpenSharePanel(id, 'dashboard', name)
  }

  private getWidgetInfo = (dashboardItemId) => {
    const { currentItems, widgets } = this.props
    const dashboardItem = currentItems.find((ci) => ci.id === dashboardItemId)
    const widget = widgets.find((w) => w.id === dashboardItem.widgetId)
    return {
      name: widget.name
    }
  }

  private toWorkbench = (itemId, widgetId) => {
    const { projectId, portalId, dashboardId } = this.props.match.params
    const editSign = [projectId, portalId, dashboardId, itemId].join(DEFAULT_SPLITER)
    sessionStorage.setItem('editWidgetFromDashboard', editSign)
    this.props.history.push(`/project/${projectId}/widget/${widgetId}`)
  }

  private dataDrill = (drillDetail) => {
    const { onDrillDashboardItem, onLoadDashboardItemData } = this.props
    const { itemId, widgetId, cols, rows, type, groups, filters, currentGroup } = drillDetail
    const currentDrillStatus: IDrillDetail = { cols, rows, type, groups, filters, currentGroup }

    onDrillDashboardItem(itemId, currentDrillStatus)
    onLoadDashboardItemData('rerender', itemId, {
        drillStatus: currentDrillStatus
    })
  }

  private selectDrillHistory = (history, item, itemId) => {
    const { onLoadDashboardItemData, onDeleteDrillHistory } = this.props
    setTimeout(() => {
      if (history) {
        onLoadDashboardItemData('rerender', itemId, {
          drillStatus: history
        })
      } else {
        onLoadDashboardItemData('rerender', itemId)
      }
    }, 50)
    onDeleteDrillHistory(itemId, item)
  }

  private selectChartsItems = (itemId, renderType, selectedItems) => {
    const { onSelectDashboardItemChart } = this.props
    onSelectDashboardItemChart(itemId, renderType, selectedItems)
  }

  public render () {
    const {
      dashboards,
      widgets,
      currentDashboard,
      currentDashboardLoading,
      currentItems,
      currentItemsInfo,
      views,
      formedViews,
      currentProject,
      currentLinkages,
      onLoadViewsDetail,
      onOpenSharePanel,
      onLoadDashboardItemData,
      onLoadBatchDataWithControlValues,
      onLoadColumnDistinctValue,
      onResizeDashboardItem,
      onRenderChartError,
      onSetFullScreenPanelItemId,
      onMonitoredSyncDataAction,
      onMonitoredSearchDataAction
    } = this.props

    const {
      mounted,
      dashboardItemFormType,
      dashboardItemFormVisible,
      modalLoading,
      selectedWidgets,
      polling,
      currentItemId,
      dashboardItemFormStep,
      linkageConfigVisible,
      interactingStatus,
      globalControlConfigVisible
    } = this.state

    let navDropdown = (<span />)
    let grids = void 0

    if (dashboards) {
      const navDropdownItems = dashboards.map((d) => (
        <Menu.Item key={d.id}>
          {d.name}
        </Menu.Item>
      ))
      navDropdown = (
        <Menu onClick={this.navDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    let nextNavDropdown = (<span />)
    if (currentDashboard && widgets) {
      const navDropdownItems = currentItems.map((d) => {
        const wid = (widgets.find((widget) => widget.id === d.widgetId))
        return (
        <Menu.Item key={d.id}>
          {d.widgetId ?
              wid && wid.name ? wid.name : ''
              : ''}
        </Menu.Item>
      )})
      nextNavDropdown = (
        <Menu onClick={this.nextNavDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    let gridEditable = false

    if (currentProject && currentItems && widgets) {
      const itemblocks = []
      const layouts = { lg: [] }
      gridEditable = hasVizEditPermission(currentProject.permission)

      currentItems.forEach((dashboardItem) => {
        const { id, x, y, width, height, widgetId, polling, frequency, alias } = dashboardItem
        const {
          datasource,
          loading,
          shareToken,
          shareLoading,
          downloadCsvLoading,
          interactId,
          rendered,
          renderType,
          queryConditions,
          selectedItems,
          errorMessage
        } = currentItemsInfo[id]
        const widget = widgets.find((w) => w.id === widgetId)
        const interacting = interactingStatus[id] || false
        const view = formedViews[widget.viewId]
        const isTrigger = currentLinkages && currentLinkages.length ? currentLinkages.map((linkage) => linkage.trigger[0]
        ).some((tr) => tr === String(id)) : false

        itemblocks.push((
          <div key={id} className={styles.authSizeTag}>
            <DashboardItem
              itemId={id}
              alias={alias}
              widgets={widgets}
              formedViews={formedViews}
              widget={widget}
              isTrigger={isTrigger}
              datasource={datasource}
              loading={loading}
              polling={polling}
              interacting={interacting}
              frequency={frequency}
              shareToken={shareToken}
              view={view}
              shareLoading={shareLoading}
              downloadCsvLoading={downloadCsvLoading}
              currentProject={currentProject}
              rendered={rendered}
              renderType={renderType}
              queryConditions={queryConditions}
              errorMessage={errorMessage}
              onSelectDrillHistory={this.selectDrillHistory}
              onLoadData={onLoadDashboardItemData}
              onShowEdit={this.showEditDashboardItemForm}
              onShowDrillEdit={this.showDrillDashboardItemForm}
              onDeleteDashboardItem={this.deleteItem}
              onResizeDashboardItem={onResizeDashboardItem}
              onRenderChartError={onRenderChartError}
              onOpenSharePanel={onOpenSharePanel}
              onDownloadCsv={this.initiateWidgetDownloadTask}
              onTurnOffInteract={this.turnOffInteract}
              onCheckTableInteract={this.checkInteract}
              onDoTableInteract={this.doInteract}
              onShowFullScreen={onSetFullScreenPanelItemId}
              onEditWidget={this.toWorkbench}
              onDrillData={this.dataDrill}
              onSelectChartsItems={this.selectChartsItems}
              onGetControlOptions={this.getControlSelectOptions}
              onControlSearch={onLoadBatchDataWithControlValues}
              selectedItems={selectedItems}
              onMonitoredSyncDataAction={onMonitoredSyncDataAction}
              onMonitoredSearchDataAction={onMonitoredSearchDataAction}
              ref={(f) => this[`dashboardItem${id}`] = f}
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

      })
      grids = (
        <ResponsiveReactGridLayout
          className={styles.grid}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_ITEM_MARGIN, GRID_ITEM_MARGIN]}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layouts}
          onDragStop={this.onDragStop}
          onResizeStop={this.onResizeStop}
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={false}
          draggableHandle={`.${styles.title}`}
          useCSSTransforms={mounted}
          isDraggable={gridEditable}
          isResizable={gridEditable}
        >
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
    }

    const saveDashboardItemButton = (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.saveDashboardItem}
      >
        保 存
      </Button>
    )

    const modalButtons = dashboardItemFormType === 'add'
      ? dashboardItemFormStep
        ? [(
          <Button
            key="back"
            size="large"
            onClick={this.changeDashboardItemFormStep(0)}
          >
            上一步
          </Button>
        ), saveDashboardItemButton]
        : [(
          <Button
            key="forward"
            size="large"
            type="primary"
            disabled={selectedWidgets.length === 0}
            onClick={this.changeDashboardItemFormStep(1)}
          >
            下一步
          </Button>
        )]
      : saveDashboardItemButton

    return (
      <Container>
        <Helmet title={currentDashboard && currentDashboard.name} />
        <ContainerTitle>
          <Row>
            <Col sm={12}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                {
                  currentDashboard && (
                    <Breadcrumb.Item>
                      <Link to="">
                        {`${currentDashboard.name} `}
                      </Link>
                    </Breadcrumb.Item>
                  )
                }
              </Breadcrumb>
            </Col>
            <Toolbar
              currentProject={currentProject}
              currentDashboard={currentDashboard}
              showAddDashboardItem={this.showAddDashboardItemForm}
              onOpenSharePanel={this.openDashboardSharePanel}
              onOpenGlobalControlConfig={this.openGlobalControlConfig}
              onOpenLinkageConfig={this.openLinkageConfig}
              onDownloadDashboard={this.initiateDashboardDownloadTask}
            />
          </Row>
          <GlobalControlPanel
            currentDashboard={currentDashboard}
            currentItems={currentItems}
            formedViews={formedViews}
            layoutType={ControlPanelLayoutTypes.Dashboard}
            onGetOptions={this.getControlSelectOptions}
            onSearch={onLoadBatchDataWithControlValues}
            onMonitoredSearchDataAction={onMonitoredSearchDataAction}
          />
        </ContainerTitle>
        <ContainerBody grid ref={this.containerBody}>
          {grids}
          <div className={styles.gridBottom} />
        </ContainerBody>
        <FullScreenPanel
          currentDashboard={currentDashboard}
          widgets={widgets}
          formedViews={formedViews}
          currentItems={currentItems}
          currentItemsInfo={currentItemsInfo}
          onLoadData={onLoadDashboardItemData}
          onGetOptions={this.getControlSelectOptions}
          onSearch={onLoadBatchDataWithControlValues}
          onMonitoredSearchDataAction={onMonitoredSearchDataAction}
        />
        <SharePanel />
        {gridEditable && (
          <>
            <Modal
              title={`${dashboardItemFormType === 'add' ? '新增' : '修改'} Widget`}
              wrapClassName="ant-modal-large"
              visible={dashboardItemFormVisible}
              footer={modalButtons}
              onCancel={this.hideDashboardItemForm}
              afterClose={this.afterDashboardItemFormClose}
            >
              <DashboardItemForm
                type={dashboardItemFormType}
                widgets={widgets || []}
                selectedWidgets={selectedWidgets}
                currentDashboard={this.props.currentDashboard}
                polling={polling}
                step={dashboardItemFormStep}
                onWidgetSelect={this.widgetSelect}
                onPollingSelect={this.pollingSelect}
                wrappedComponentRef={this.refHandles.dashboardItemForm}
              />
            </Modal>
            <DashboardLinkageConfig
              currentDashboard={currentDashboard}
              currentItems={currentItems}
              currentItemsInfo={currentItemsInfo}
              views={formedViews}
              widgets={widgets}
              visible={linkageConfigVisible}
              loading={currentDashboardLoading}
              onGetWidgetInfo={this.getWidgetInfo}
              onSave={this.saveLinkageConfig}
              onCancel={this.closeLinkageConfig}
              linkages={currentLinkages}
            />
            <GlobalControlConfig
              type={ControlPanelTypes.Global}
              originalControls={currentDashboard.config.filters}
              currentItems={currentItems}
              views={views}
              formedViews={formedViews}
              widgets={widgets}
              visible={globalControlConfigVisible}
              loading={currentDashboardLoading}
              queryMode={currentDashboard.config.queryMode}
              onCancel={this.closeGlobalControlConfig}
              onSave={this.saveControls}
              onLoadViews={this.loadViews}
              onLoadViewDetail={onLoadViewsDetail}
              onGetOptions={onLoadColumnDistinctValue}
            />
          </>
        )}
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  currentProject: makeSelectCurrentProject(),
  dashboards: makeSelectCurrentDashboards(),
  widgets: makeSelectWidgets(),
  views: makeSelectViews(),
  formedViews: makeSelectFormedViews(),
  currentPortal: makeSelectCurrentPortal(),
  currentDashboard: makeSelectCurrentDashboard(),
  currentDashboardLoading: makeSelectCurrentDashboardLoading(),
  currentItems: makeSelectCurrentItems(),
  currentItemsInfo: makeSelectCurrentItemsInfo(),
  currentLinkages: makeSelectCurrentLinkages()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardDetail: (
      portalId: number,
      dashboardId: number
    ) => dispatch(loadDashboardDetail(portalId, dashboardId)),
    onAddDashboardItems: (
      portalId: number,
      items: Array<Omit<IDashboardItem, 'id' | 'config'>>,
      resolve: (items: IDashboardItem[]) => void
    ) => dispatch(addDashboardItems(portalId, items, resolve)),
    onEditCurrentDashboard: (
      dashboard: IDashboard,
      type: 'linkage' | 'control',
      resolve: () => void
    ) => dispatch(VizActions.editCurrentDashboard(dashboard, type, resolve)),
    onEditDashboardItem: (
      portalId: number,
      item: IDashboardItem,
      resolve: () => void
    ) => dispatch(editDashboardItem(portalId, item, resolve)),
    onEditDashboardItems: (
      portalId: number,
      items: IDashboardItem[]
    ) => dispatch(editDashboardItems(portalId, items)),
    onDeleteDashboardItem: (
      id: number,
      resolve?: () => void
    ) => dispatch(deleteDashboardItem(id, resolve)),
    onLoadDashboardItemData: (
      renderType: RenderType,
      itemId: number,
      queryConditions?: Partial<IQueryConditions>
    ) => dispatch(loadDashboardItemData(renderType, itemId, queryConditions)),
    onLoadBatchDataWithControlValues: (
      type: ControlPanelTypes,
      relatedItems: number[],
      formValues?: object,
      itemId?: number
    ) => dispatch(loadBatchDataWithControlValues(type, relatedItems, formValues, itemId)),
    onLoadColumnDistinctValue: (
      paramsByViewId: {
        [viewId: string]: Omit<IDistinctValueReqeustParams, 'cache' | 'expired'>
      },
      callback: (options?: object[]) => void
    ) => dispatch(loadColumnDistinctValue(paramsByViewId, callback)),
    onLoadViews: (projectId: number) => dispatch(loadViews(projectId)),
    onLoadViewsDetail: (
      viewIds: number[],
      resolve: (views: IView[]) => void
    ) => dispatch(loadViewsDetail(viewIds, resolve)),
    onClearCurrentDashboard: () => dispatch(clearCurrentDashboard()),
    onInitiateDownloadTask: (
      type: DownloadTypes,
      id?: number,
      itemId?: number
    ) => dispatch(initiateDownloadTask(type, id, itemId)),
    onLoadSelectOptions: (
      controlKey: string,
      requestParams: { [viewId: string]: IDistinctValueReqeustParams },
      itemId?: number
    ) => dispatch(loadSelectOptions(controlKey, requestParams, itemId)),
    onSetSelectOptions: (
      controlKey: string,
      options: any[],
      itemId?: number
    ) => dispatch(setSelectOptions(controlKey, options, itemId)),
    onRenderDashboardItem: (itemId: number) => dispatch(renderDashboardItem(itemId)),
    onResizeDashboardItem: (itemId: number) => dispatch(resizeDashboardItem(itemId)),
    onResizeAllDashboardItem: () => dispatch(resizeAllDashboardItem()),
    onRenderChartError: (itemId: number, error: Error) =>
      dispatch(renderChartError(itemId, error)),
    onOpenSharePanel: (
      id: number,
      type: TShareVizsType,
      title: string,
      itemId?: number
    ) => dispatch(openSharePanel(id, type, title, itemId)),
    onDrillDashboardItem: (
      itemId: number,
      drillHistory: any
    ) => dispatch(drillDashboardItem(itemId, drillHistory)),
    onDrillPathSetting: (
      itemId: number,
      history: any[]
    ) => dispatch(drillPathsetting(itemId, history)),
    onDeleteDrillHistory: (
      itemId: number,
      index: number
    ) => dispatch(deleteDrillHistory(itemId, index)),
    onSelectDashboardItemChart: (
      itemId: number,
      renderType: RenderType,
      selectedItems: number[]
    ) => dispatch(selectDashboardItemChart(itemId, renderType, selectedItems)),
    onSetFullScreenPanelItemId: (itemId: number) => dispatch(setFullScreenPanelItemId(itemId)),
    onMonitoredSyncDataAction: () => dispatch(monitoredSyncDataAction()),
    onMonitoredLinkageDataAction: () => dispatch(monitoredLinkageDataAction()),
    onMonitoredSearchDataAction: () => dispatch(monitoredSearchDataAction())
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withViewReducer = injectReducer({ key: 'view', reducer: viewReducer })
const withViewSaga = injectSaga({ key: 'view', saga: viewSaga })

const withControlReducer = injectReducer({ key: 'control', reducer: controlReducer })

export default compose(
  withViewReducer,
  withControlReducer,
  withViewSaga,
  withConnect
)(Grid)
