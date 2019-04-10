import * as React from 'react'
import * as classnames from 'classnames'
import Helmet from 'react-helmet'
import * as echarts from 'echarts/lib/echarts'
import { Link, InjectedRouter } from 'react-router'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from '../Widget/reducer'
import saga from './sagas'
import sagaWidget from '../Widget/sagas'
import reducerBizlogic from '../Bizlogic/reducer'
import sagaBizlogic from '../Bizlogic/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import { GraphTypes, SecondaryGraphTypes } from './components/util'

import Container from '../../components/Container'
import { WrappedFormUtils } from 'antd/lib/form/Form'

import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectDisplays,
  makeSelectCurrentLayers,
  makeSelectCurrentLayersInfo } from './selectors'

import { hideNavigator } from '../App/actions'
import {
  loadDataFromItem,
  loadCascadeSource // TODO global filter in Display Preview
} from '../Bizlogic/actions'
import {
  editCurrentDisplay,
  loadDisplayDetail,
  selectLayer,
  addDisplayLayers,
  deleteDisplayLayers,
  editDisplayLayers } from './actions'
import { DEFAULT_PRIMARY_COLOR } from '../../globalConstants'
import LayerItem from './components/LayerItem'

const styles = require('./Display.less')
const stylesDashboard = require('../Dashboard/Dashboard.less')

import { IWidgetConfig, RenderType } from '../Widget/components/Widget'
import { decodeMetricName } from '../Widget/components/util'
import { IQueryConditions, IDataRequestParams } from '../Dashboard/Grid'

interface IBizdataIncomeParamObject {
  k: string
  v: string
}

interface IPreviewProps {
  params: any
  widgets: any[]
  bizlogics: any[]
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
  onLoadDataFromItem: (
    renderType: RenderType,
    layerItemId: number,
    viewId: number,
    requestParams: IDataRequestParams
  ) => void
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
      onLoadDisplayDetail
    } = this.props
    const projectId = +params.pid
    const displayId = +params.displayId
    onLoadDisplayDetail(projectId, displayId)
  }

  public componentDidMount () {
    this.props.onHideNavigator()
  }

  public componentWillReceiveProps (nextProps: IPreviewProps) {
    const { currentSlide } = nextProps
    const { scale } = this.state
    const [scaleWidth, scaleHeight] = scale
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
        if (nextScaleHeight === nextScaleWidth) {
          this.scaleViewport(nextScaleHeight)
          this.setState({ scale: [1, 1] })
        } else {
          this.setState({ scale: [nextScaleWidth, nextScaleHeight] })
        }
      }
    }
  }

  private scaleViewport = (scale: number) => {
    const viewport = document.querySelector('meta[name=viewport]')
    viewport.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0`)
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: Partial<IQueryConditions>) => {
    const {
      currentLayersInfo,
      widgets,
      onLoadDataFromItem
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryConditions = currentLayersInfo[itemId].queryConditions
    let linkageFilters
    let globalFilters
    let variables
    let linkageVariables
    let globalVariables

    if (queryConditions) {
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
    } else {
      linkageFilters = cachedQueryConditions.linkageFilters
      globalFilters = cachedQueryConditions.globalFilters
      variables = cachedQueryConditions.variables
      linkageVariables = cachedQueryConditions.linkageVariables
      globalVariables = cachedQueryConditions.globalVariables
    }

    let groups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

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

    onLoadDataFromItem(
      renderType,
      itemId,
      widget.viewId,
      {
        groups,
        aggregators,
        filters: filters.map((i) => i.config.sql),
        linkageFilters,
        globalFilters,
        variables,
        linkageVariables,
        globalVariables,
        orders,
        cache,
        expired
      }
    )
  }

  private getSlideStyle = (slideParams) => {
    const { scale } = this.state

    const {
      width,
      height,
      backgroundColor,
      backgroundImage
    } = slideParams

    let slideStyle: React.CSSProperties
    slideStyle  = {
      overflow: 'visible',
      width: `${width * scale[0]}px`,
      height: `${height * scale[1]}px`,
      backgroundSize: 'cover'
    }

    if (backgroundColor) {
      const rgb = backgroundColor.join()
      slideStyle.backgroundColor = `rgba(${rgb})`
    }
    if (backgroundImage) {
      slideStyle.backgroundImage = `url("${backgroundImage}")`
    }
    return slideStyle
  }

  public render () {
    const {
      widgets,
      bizlogics,
      currentDisplay,
      currentSlide,
      currentLayers,
      currentLayersInfo } = this.props
    if (!currentDisplay) { return null }

    const { scale } = this.state
    const slideStyle = this.getSlideStyle(JSON.parse(currentSlide.config).slideParams)
    const layerItems =  Array.isArray(widgets) ? currentLayers.map((layer) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const view = widget && bizlogics.find((b) => b.id === widget.viewId)
      const layerId = layer.id

      const { polling, frequency } = JSON.parse(layer.params)
      const { datasource, loading, interactId, rendered, renderType } = currentLayersInfo[layerId]

      return (
        <LayerItem
          key={layer.id}
          ref={(f) => this[`layerId_${layer.id}`]}
          pure={true}
          scale={scale}
          layer={layer}
          itemId={layerId}
          widget={widget}
          view={view}
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
      <div className={styles.preview}>
        <div className={styles.board} style={slideStyle}>
          {layerItems}
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  currentDisplay: makeSelectCurrentDisplay(),
  currentSlide: makeSelectCurrentSlide(),
  displays: makeSelectDisplays(),
  currentLayers: makeSelectCurrentLayers(),
  currentLayersInfo: makeSelectCurrentLayersInfo()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadDisplayDetail: (projectId, displayId) => dispatch(loadDisplayDetail(projectId, displayId)),
    onLoadDataFromItem: (renderType, itemId, viewId, requestParams) => dispatch(loadDataFromItem(renderType, itemId, viewId, requestParams, 'display'))
  }
}

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: reducerBizlogic })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: sagaBizlogic })

const withConnect = connect<{}, {}, IPreviewProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withReducerWidget,
  withReducerBizlogic,
  withSaga,
  withSagaWidget,
  withSagaBizlogic,
  withConnect)(Preview)
