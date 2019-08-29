import * as React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from 'containers/Widget/reducer'
import saga from './sagas'
import sagaWidget from 'containers/Widget/sagas'
import reducerView from 'containers/View/reducer'
import sagaView from 'containers/View/sagas'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'

import { makeSelectWidgets } from 'containers/Widget/selectors'
import { makeSelectViews, makeSelectFormedViews } from 'containers/View/selectors'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectDisplays,
  makeSelectCurrentLayers,
  makeSelectCurrentLayersInfo,
  makeSelectCurrentProject
} from './selectors'

import { FieldSortTypes } from 'containers/Widget/components/Config/Sort'
import { widgetDimensionMigrationRecorder } from 'utils/migrationRecorders'

import { hideNavigator } from 'containers/App/actions'
import { ViewActions } from 'containers/View/actions'
const { loadViewDataFromVizItem } = ViewActions // @TODO global filter in Display Preview
import DisplayActions from './actions'
import LayerItem from './components/LayerItem'

const styles = require('./Display.less')
import { IWidgetConfig, RenderType } from 'containers/Widget/components/Widget'
import { decodeMetricName } from 'containers/Widget/components/util'
import { IQueryConditions, IDataRequestParams } from 'containers/Dashboard/Grid'
import { IFormedViews } from 'containers/View/types'
import { statistic } from 'utils/statistic/statistic.dv'
import {IProject} from 'containers/Projects'
interface IPreviewProps {
  params: any
  widgets: any[]
  views: any[]
  formedViews: IFormedViews
  currentDisplay: any
  currentSlide: any
  currentLayers: any[]
  currentLayersInfo: {
    [key: string]: {
      datasource: {
        pageNo: number
        pageSize: number
        resultList: any[]
        totalCount: number
      }
      loading: boolean
      queryConditions: IQueryConditions
      interactId: string
      rendered: boolean
      renderType: RenderType
    }
  }
  onHideNavigator: () => void
  onLoadDisplayDetail: (projectId: number, displayId: number) => void
  onLoadViewDataFromVizItem: (
    renderType: RenderType,
    layerItemId: number,
    viewId: number,
    requestParams: IDataRequestParams
  ) => void
  onMonitoredSyncDataAction: () => any
  onMonitoredSearchDataAction: () => any
  onMonitoredLinkageDataAction: () => any
  currentProject: IProject
  onloadProjectDetail: (pid) => any
}

interface IPreviewStates {
  scale: [number, number]
}

export class Preview extends React.Component<IPreviewProps, IPreviewStates> {

  private charts: object = {}

  public constructor (props) {
    super(props)
    this.state = {
      scale: [1, 1]
    }
  }

  public componentWillMount () {
    const {
      params,
      onLoadDisplayDetail,
      onloadProjectDetail
    } = this.props
    const projectId = +params.pid
    const displayId = +params.displayId
    onLoadDisplayDetail(projectId, displayId)
    onloadProjectDetail(projectId)
  }

  public componentDidMount () {
    this.props.onHideNavigator()
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
    this.statisticFirstVisit = this.__once__(statistic.setOperations)
    statistic.setDurations({
      start_time: statistic.getCurrentDateTime()
    })
    statistic.startClock()
    window.addEventListener('mousemove', this.statisticTimeFuc, false)
    window.addEventListener('visibilitychange', this.onVisibilityChanged, false)
    window.addEventListener('keydown', this.statisticTimeFuc, false)
  }

  private statisticTimeFuc = () => {
    statistic.isTimeout()
  }

  public componentWillReceiveProps (nextProps: IPreviewProps) {
    const { currentSlide } = nextProps
    const { scale } = this.state
    const [scaleWidth, scaleHeight] = scale
    const { params: {pid, displayId}, currentDisplay, currentProject} = this.props
    if (this.props.currentSlide) {
      this.statisticFirstVisit({
        org_id: currentProject.orgId,
        project_name: currentProject.name,
        project_id: pid,
        viz_type: 'display',
        viz_id: displayId,
        viz_name: currentDisplay['name'],
        create_time:  statistic.getCurrentDateTime()
      }, (data) => {
        const visitRecord = {
          ...data,
          action: 'visit'
        }
        statistic.sendOperation(visitRecord)
      })
    }

    if (currentSlide && this.props.currentSlide !== currentSlide) {
      const { slideParams } = JSON.parse(currentSlide.config)
      const { scaleMode, width, height } = slideParams
      const { clientHeight, clientWidth } = document.body
      let nextScaleHeight = 1
      let nextScaleWidth = 1
      switch (scaleMode) {
        case 'scaleHeight':
          nextScaleWidth = nextScaleHeight = clientHeight / height
          break
        case 'scaleWidth':
          nextScaleHeight = nextScaleWidth = clientWidth / width
          break
        case 'scaleFull':
          nextScaleHeight = clientHeight / height
          nextScaleWidth = clientWidth / width
      }
      if (scaleHeight !== nextScaleHeight || scaleWidth !== nextScaleWidth) {
        this.setState({
          scale: [nextScaleWidth, nextScaleHeight]
        })
      }

    }
  }

  private __once__ (fn) {
    let tag = true
    return (...args) => {
      if (tag) {
        tag = !tag
        return fn.apply(this, args)
      } else {
        return void 0
      }
    }
  }

  private statisticFirstVisit: any

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: Partial<IQueryConditions>) => {
    const {
      currentLayersInfo,
      widgets,
      onLoadViewDataFromVizItem
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig
    const updatedCols = cols.map((col) => widgetDimensionMigrationRecorder(col))
    const updatedRows = rows.map((row) => widgetDimensionMigrationRecorder(row))
    const customOrders = updatedCols.concat(updatedRows)
      .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
      .map(({ name, sort }) => ({ name, list: sort[FieldSortTypes.Custom].sortList }))

    const cachedQueryConditions = currentLayersInfo[itemId].queryConditions

    let tempFilters
    let linkageFilters
    let globalFilters
    let tempOrders
    let variables
    let linkageVariables
    let globalVariables
    let pagination
    let nativeQuery

    if (queryConditions) {
      tempFilters = queryConditions.tempFilters !== void 0 ? queryConditions.tempFilters : cachedQueryConditions.tempFilters
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      tempOrders = queryConditions.orders !== void 0 ? queryConditions.orders : cachedQueryConditions.orders
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery || cachedQueryConditions.nativeQuery
    } else {
      tempFilters = cachedQueryConditions.tempFilters
      linkageFilters = cachedQueryConditions.linkageFilters
      globalFilters = cachedQueryConditions.globalFilters
      tempOrders = cachedQueryConditions.orders
      variables = cachedQueryConditions.variables
      linkageVariables = cachedQueryConditions.linkageVariables
      globalVariables = cachedQueryConditions.globalVariables
      pagination = cachedQueryConditions.pagination
      nativeQuery = cachedQueryConditions.nativeQuery
    }

    let groups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (secondaryMetrics && secondaryMetrics.length) {
      aggregators = aggregators.concat(secondaryMetrics.map((second) => ({
        column: decodeMetricName(second.name),
        func: second.agg
      })))
    }

    if (color) {
      groups = groups.concat(color.items.map((c) => c.name))
    }
    if (label) {
      groups = groups.concat(label.items
        .filter((l) => l.type === 'category')
        .map((l) => l.name))
      aggregators = aggregators.concat(label.items
        .filter((l) => l.type === 'value')
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (size) {
      aggregators = aggregators.concat(size.items
        .map((s) => ({
          column: decodeMetricName(s.name),
          func: s.agg
        })))
    }
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (tip) {
      aggregators = aggregators.concat(tip.items
        .map((t) => ({
          column: decodeMetricName(t.name),
          func: t.agg
        })))
    }

    const requestParams = {
      groups,
      aggregators,
      filters: filters.map((i) => i.config.sql),
      tempFilters,
      linkageFilters,
      globalFilters,
      variables,
      linkageVariables,
      globalVariables,
      orders,
      cache,
      expired,
      flush: renderType === 'refresh',
      pagination,
      nativeQuery,
      customOrders
    }

    if (tempOrders) {
      requestParams.orders = requestParams.orders.concat(tempOrders)
    }

    onLoadViewDataFromVizItem(
      renderType,
      itemId,
      widget.viewId,
      requestParams
    )
  }

  private getPreviewStyle = (slideParams) => {
    const { scaleMode } = slideParams
    const previewStyle: React.CSSProperties = {}
    switch (scaleMode) {
      case 'scaleWidth':
        previewStyle.overflowY = 'auto'
        break
      case 'scaleHeight':
        previewStyle.overflowX = 'auto'
        break
      case 'noScale':
        previewStyle.overflow = 'auto'
        break
      case 'scaleFull':
      default:
        break
    }
    return previewStyle
  }

  private getSlideStyle = (slideParams, scale: [number, number]) => {
    const {
      width,
      height,
      scaleMode,
      backgroundColor,
      backgroundImage
    } = slideParams

    let slideStyle: React.CSSProperties

    const { clientWidth, clientHeight } = document.body
    const [scaleX, scaleY] = scale

    let translateX = (scaleX - 1) / 2
    let translateY = (scaleY - 1) / 2
    translateX += Math.max(0, (clientWidth - scaleX * width) / (2 * width))
    translateY += Math.max(0, (clientHeight - scaleY * height) / (2 * height))

    const translate = `translate(${translateX * 100}%, ${translateY * 100}%)`

    slideStyle  = {
      overflow: 'visible',
      width,
      height,
      transform: `${translate} scale(${scaleX}, ${scaleY})`
    }

    let backgroundStyle: React.CSSProperties | CSSStyleDeclaration = slideStyle
    if (scaleMode === 'scaleWidth' && screen.width <= 1024) {
      backgroundStyle = document.body.style
    }
    backgroundStyle.backgroundSize = 'cover'

    if (backgroundColor) {
      const rgb = backgroundColor.join()
      backgroundStyle.backgroundColor = `rgba(${rgb})`
    }
    if (backgroundImage) {
      backgroundStyle.backgroundImage = `url("${backgroundImage}")`
    }
    return slideStyle
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
    window.removeEventListener('mousemove', this.statisticTimeFuc, false)
    window.removeEventListener('keydown', this.statisticTimeFuc, false)
    window.removeEventListener('visibilitychange', this.onVisibilityChanged, false)
    statistic.resetClock()
  }

  public render () {
    const {
      widgets,
      views,
      formedViews,
      currentDisplay,
      currentSlide,
      currentLayers,
      currentLayersInfo } = this.props
    if (!currentDisplay) { return null }

    const { scale } = this.state
    const slideParams = JSON.parse(currentSlide.config).slideParams
    const previewStyle = this.getPreviewStyle(slideParams)
    const slideStyle = this.getSlideStyle(slideParams, scale)
    const layerItems =  Array.isArray(widgets) ? currentLayers.map((layer) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const model = widget && formedViews[widget.viewId].model
      const layerId = layer.id

      const { polling, frequency } = JSON.parse(layer.params)
      const { datasource, loading, interactId, rendered, renderType } = currentLayersInfo[layerId]

      return (
        <LayerItem
          key={layer.id}
          ref={(f) => this[`layerId_${layer.id}`]}
          pure={true}
          layer={layer}
          itemId={layerId}
          widget={widget}
          model={model}
          datasource={datasource}
          loading={loading}
          polling={polling}
          frequency={frequency}
          interactId={interactId}
          rendered={rendered}
          renderType={renderType}
          onGetChartData={this.getChartData}
        />
      )
    }) : null
    return (
      <div className={styles.preview} style={previewStyle}>
        <div className={styles.board} style={slideStyle}>
          {layerItems}
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  views: makeSelectViews(),
  formedViews: makeSelectFormedViews(),
  currentDisplay: makeSelectCurrentDisplay(),
  currentSlide: makeSelectCurrentSlide(),
  displays: makeSelectDisplays(),
  currentLayers: makeSelectCurrentLayers(),
  currentLayersInfo: makeSelectCurrentLayersInfo(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadDisplayDetail: (projectId, displayId) => dispatch(DisplayActions.loadDisplayDetail(projectId, displayId)),
    onLoadViewDataFromVizItem: (renderType, itemId, viewId, requestParams) => dispatch(loadViewDataFromVizItem(renderType, itemId, viewId, requestParams, 'display')),
    onMonitoredSyncDataAction: () => dispatch(DisplayActions.monitoredSyncDataAction()),
    onMonitoredSearchDataAction: () => dispatch(DisplayActions.monitoredSearchDataAction()),
    onMonitoredLinkageDataAction: () => dispatch(DisplayActions.monitoredLinkageDataAction()),
    onloadProjectDetail: (pid) => dispatch(DisplayActions.loadProjectDetail(pid))
  }
}

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerView = injectReducer({ key: 'view', reducer: reducerView })
const withSagaView = injectSaga({ key: 'view', saga: sagaView })


const withConnect = connect<{}, {}, IPreviewProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withReducerWidget,
  withReducerView,
  withSaga,
  withSagaWidget,
  withSagaView,
  withConnect)(Preview)
