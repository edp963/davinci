import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import widgetlibs from '../../config'
import injectReducer from '../../../../utils/injectReducer'
import injectSaga from '../../../../utils/injectSaga'
import reducer from '../../reducer'
import bizlogicReducer from '../../../Bizlogic/reducer'
import saga from '../../sagas'
import bizlogicSaga from '../../../Bizlogic/sagas'
import { hideNavigator } from '../../../App/actions'
import { loadBizlogics, loadData, loadDistinctValue } from '../../../Bizlogic/actions'
import { addWidget, editWidget, loadWidgetDetail, clearCurrentWidget } from '../../actions'
import { makeSelectCurrentWidget, makeSelectLoading, makeSelectDataLoading, makeSelectDistinctColumnValues, makeSelectColumnValueLoading } from '../../selectors'
import { makeSelectBizlogics } from '../../../Bizlogic/selectors'

import OperatingPanel, { IDataParamProperty } from './OperatingPanel'
import Widget, { IWidgetProps, WidgetMode, IChartInfo, IPaginationParams, DimetionType } from '../Widget'
import { IDataParamSource } from './Dropbox'
import EditorHeader from '../../../../components/EditorHeader'
import { DEFAULT_SPLITER } from '../../../../globalConstants'
import { getStyleConfig, getTable, decodeMetricName, getPivotModeSelectedCharts, checkChartEnable, getPivot } from 'containers/Widget/components/util'
import ChartTypes from '../../config/chart/ChartTypes'
import message from 'antd/lib/message'
const styles = require('./Workbench.less')

export interface IView {
  id?: number
  name: string
  description: string
  projectId: number
  source: { id: number, name: string }
  sourceId: number
  sql: string
  model: string
  config: string
}

export interface IModel {
  [key: string]: {
    visualType: string
    modelType: string
  }
}

interface IWidget {
  id?: number
  name: string
  description: string
  type: number
  viewId: number
  projectId: number
  config: string
  publish: boolean
}

interface IWorkbenchProps {
  views: IView[]
  currentWidget: IWidget
  loading: boolean
  dataLoading: boolean
  distinctColumnValues: any[]
  columnValueLoading: boolean
  router: any
  params: { pid: string, wid: string }
  onHideNavigator: () => void
  onLoadBizlogics: (projectId: number, resolve?: any) => void
  onLoadWidgetDetail: (id: number) => void
  onLoadData: (viewId: number, params: object, resolve: (data: any) => void) => void
  onAddWidget: (widget: IWidget, resolve: () => void) => void
  onEditWidget: (widget: IWidget, resolve: () => void) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
  onClearCurrentWidget: () => void
}

interface IWorkbenchStates {
  id: number
  name: string
  description: string
  selectedView: IView
  mode: WidgetMode
  currentWidgetlibs: IChartInfo[]
  chartModeSelectedChart: IChartInfo
  pagination: IPaginationParams
  queryParams: any[]
  cache: boolean
  expired: number
  originalWidgetProps: IWidgetProps
  widgetProps: IWidgetProps
}

export class Workbench extends React.Component<IWorkbenchProps, IWorkbenchStates> {
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      name: '',
      description: '',
      selectedView: null,
      mode: 'pivot',
      currentWidgetlibs: widgetlibs['pivot'],
      chartModeSelectedChart: getTable(),
      pagination: { pageNo: 0, pageSize: 0, withPaging: false, totalCount: 0 },
      queryParams: [],
      cache: false,
      expired: 300,
      originalWidgetProps: null,
      widgetProps: {
        data: [],
        pagination: {
          pageNo: 0,
          pageSize: 0,
          totalCount: 0,
          withPaging: false
        },
        cols: [],
        rows: [],
        metrics: [],
        filters: [],
        chartStyles: getStyleConfig({}),
        selectedChart: ChartTypes.Table,
        orders: [],
        mode: 'pivot',
        model: {},
        onPaginationChange: this.paginationChange
      }
    }
  }

  private lastRequestParamString = null

  private placeholder = {
    name: '请输入Widget名称',
    description: '请输入描述…'
  }

  public componentWillMount () {
    const { params, onLoadBizlogics, onLoadWidgetDetail } = this.props
    onLoadBizlogics(Number(params.pid), () => {
      if (params.wid !== 'add' && !Number.isNaN(Number(params.wid))) {
        onLoadWidgetDetail(Number(params.wid))
      }
    })
  }

  public componentDidMount () {
    this.props.onHideNavigator()
  }

  public componentWillReceiveProps (nextProps) {
    const { views, currentWidget } = nextProps
    if (currentWidget && currentWidget !== this.props.currentWidget) {
      const { mode, selectedChart, queryParams, cache, expired, ...rest } = JSON.parse(currentWidget.config)
      const currentWidgetlibs = widgetlibs[mode || 'pivot'] // FIXME 兼容 0.3.0-beta.1 之前版本
      this.setState({
        id: currentWidget.id,
        name: currentWidget.name,
        description: currentWidget.description,
        selectedView: views.find((v) => v.id === currentWidget.viewId),
        mode: mode || 'pivot', // FIXME 兼容 0.3.0-beta.1 之前版本
        currentWidgetlibs,
        ...selectedChart && {chartModeSelectedChart: widgetlibs['chart'].find((wl) => wl.id === selectedChart)},
        queryParams,
        cache,
        expired,
        originalWidgetProps: {...rest}
      })
    }
  }

  public componentWillUnmount () {
    this.props.onClearCurrentWidget()
  }

  private changeName = (e) => {
    this.setState({
      name: e.currentTarget.value
    })
  }

  private changeDesc = (e) => {
    this.setState({
      description: e.currentTarget.value
    })
  }

  private viewSelect = (selectedView: IView) => {
    this.setState({
      selectedView,
      queryParams: [],
      cache: false,
      expired: 300
    })
  }

  private setQueryParams = (queryParams: any[]) => {
    this.setState({
      queryParams
    })
  }

  private cacheChange = (e) => {
    this.setState({
      cache: e.target.value
    })
  }

  private expiredChange = (value) => {
    this.setState({
      expired: value
    })
  }

  private getDimetionAxis = (selectedCharts): DimetionType => {
    const pivotChart = getPivot()
    const onlyPivot = !selectedCharts.filter((sc) => sc.id !== pivotChart.id).length
    if (!onlyPivot) {
      return 'col'
    }
  }

  private setWidgetProps = (callback, dataParams, styleParams, renderType?) => {
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, yAxis } = dataParams
    const { onLoadData } = this.props
    const { selectedView, mode, chartModeSelectedChart, pagination } = this.state
    let groups = cols.items.map((c) => c.name)
      .concat(rows.items.map((r) => r.name))
      .filter((g) => g !== '指标名称')
    let aggregators = metrics.items.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))
    if (secondaryMetrics) {
      aggregators = aggregators.concat(secondaryMetrics.items
        .map((m) => ({
          column: decodeMetricName(m.name),
          func: m.agg
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
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
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
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (yAxis) {
      aggregators = aggregators.concat(yAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }

    const orders = []
    Object.values(dataParams)
      .reduce<IDataParamSource[]>((items, param: IDataParamProperty) => items.concat(param.items), [])
      .forEach((item) => {
        const column = item.type === 'category' ? item.name : `${item.agg}(${decodeMetricName(item.name)})`
        if (item.sort) {
          orders.push({
            column,
            direction: item.sort
          })
        }
      })

    let noAggregators = false
    if (styleParams.table) { // @FIXME pagination in table style config
      const { withPaging, pageSize, withNoAggregators } = styleParams.table
      noAggregators = withNoAggregators
      if (withPaging) {
        pagination.pageNo = 1
        pagination.pageSize = +pageSize
      } else {
        pagination.pageNo = 0
        pagination.pageSize = 0
      }
      pagination.withPaging = withPaging
    }

    const requestParams = {
      groups,
      aggregators,
      filters: filters.items.map((i) => i.config.sql),
      orders,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      nativeQuery: noAggregators,
      cache: false,
      expired: 0
    }

    let selectedCharts
    let dimetionsCount
    if (mode === 'pivot') {
      selectedCharts = getPivotModeSelectedCharts(metrics.items)
      dimetionsCount = groups.length
    } else {
      selectedCharts = [chartModeSelectedChart]
      dimetionsCount = cols.items.length
    }
    if (!checkChartEnable(dimetionsCount, metrics.items.length, selectedCharts)) {
      selectedCharts = mode === 'pivot'
        ? getPivotModeSelectedCharts([])
        : [getTable()]
    }

    const requestParamString = JSON.stringify(requestParams)
    if (selectedView && requestParamString !== this.lastRequestParamString) {
      this.lastRequestParamString = requestParamString
      onLoadData(selectedView.id, requestParams, (result) => {
        const { resultList: data, pageNo, pageSize, totalCount } = result
        const updatedPagination = !pagination.withPaging ? pagination : {
          ...pagination,
          pageNo,
          pageSize,
          totalCount
        }
        if (data.length) {
          this.setState({
            widgetProps: {
              cols: cols.items.map((item) => ({...item})),
              rows: rows.items.map((item) => ({...item})),
              metrics: metrics.items.map((item) => ({...item})),
              ...secondaryMetrics && {
                secondaryMetrics: secondaryMetrics.items.map((item) => ({...item}))
              },
              filters: filters.items,
              ...color && {color},
              ...label && {label},
              ...size && {size},
              ...xAxis && {xAxis},
              ...tip && {tip},
              ...yAxis && {yAxis},
              chartStyles: styleParams,
              selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
              data,
              pagination: updatedPagination,
              dimetionAxis: this.getDimetionAxis(selectedCharts),
              renderType: renderType || 'rerender',
              orders,
              mode,
              model: JSON.parse(selectedView.model)
            },
            chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
            pagination: updatedPagination
          })
        } else {
          this.setState({
            widgetProps: {
              cols: [],
              rows: [],
              metrics: [],
              filters: [],
              data: [],
              pagination: updatedPagination,
              chartStyles: styleParams,
              selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
              dimetionAxis: this.getDimetionAxis([getPivot()]),
              renderType: 'rerender',
              orders,
              mode,
              model: JSON.parse(selectedView.model)
            },
            chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
            pagination: updatedPagination
          })
        }
        callback(selectedCharts)
      })
    } else {
      this.setState({
        widgetProps: {
          data: this.state.widgetProps.data,
          cols: cols.items.map((item) => ({...item})),
          rows: rows.items.map((item) => ({...item})),
          metrics: metrics.items.map((item) => ({...item})),
          ...secondaryMetrics && {
            secondaryMetrics: secondaryMetrics.items.map((item) => ({...item}))
          },
          filters: filters.items,
          ...color && {color},
          ...label && {label},
          ...size && {size},
          ...xAxis && {xAxis},
          ...tip && {tip},
          ...yAxis && {yAxis},
          chartStyles: styleParams,
          selectedChart: mode === 'pivot' ? chartModeSelectedChart.id : selectedCharts[0].id,
          pagination,
          dimetionAxis: this.getDimetionAxis(selectedCharts),
          renderType: renderType || 'clear',
          orders,
          mode,
          model: selectedView ? JSON.parse(selectedView.model) : {}
        },
        chartModeSelectedChart: mode === 'pivot' ? chartModeSelectedChart : selectedCharts[0],
        pagination
      })
      callback(selectedCharts)
    }
  }

  private chartSelect = (selectedChart, callback) => {
    this.setState({
      chartModeSelectedChart: selectedChart,
      pagination: { pageNo: 0, pageSize: 0, withPaging: false, totalCount: 0 }
    }, () => {
      callback()
    })
  }

  private modeChange = (mode, callback) => {
    this.setState({
      mode,
      currentWidgetlibs: widgetlibs[mode]
    }, () => {
      callback()
    })
  }

  private reset = () => {
    this.setState({
      chartModeSelectedChart: getTable()
    })
  }

  private saveWidget = () => {
    const { params, onAddWidget, onEditWidget } = this.props
    const { id, name, description, selectedView, queryParams, cache, expired, widgetProps } = this.state
    if (!name.trim()) {
      message.error('Widget名称不能为空')
      return
    }
    const widget = {
      name,
      description,
      type: 1,
      viewId: selectedView.id,
      projectId: Number(params.pid),
      config: JSON.stringify({
        ...widgetProps,
        queryParams,
        cache,
        expired,
        data: []
      }),
      publish: true
    }
    if (id) {
      onEditWidget({...widget, id}, () => {
        message.success('修改成功')
        const editSignDashboard = sessionStorage.getItem('editWidgetFromDashboard')
        const editSignDisplay = sessionStorage.getItem('editWidgetFromDisplay')
        if (editSignDashboard) {
          sessionStorage.removeItem('editWidgetFromDashboard')
          const [pid, portalId, portalName, dashboardId, itemId] = editSignDashboard.split(DEFAULT_SPLITER)
          this.props.router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${dashboardId}`)
        } else if (editSignDisplay) {
          sessionStorage.removeItem('editWidgetFromDisplay')
          const [pid, displayId] = editSignDisplay.split(DEFAULT_SPLITER)
          this.props.router.replace(`/project/${pid}/display/${displayId}`)
        } else {
          this.props.router.replace(`/project/${params.pid}/widgets`)
        }
      })
    } else {
      onAddWidget(widget, () => {
        message.success('添加成功')
        this.props.router.replace(`/project/${params.pid}/widgets`)
      })
    }
  }

  private cancel = () => {
    sessionStorage.removeItem('editWidgetFromDashboard')
    sessionStorage.removeItem('editWidgetFromDisplay')
    this.props.router.goBack()
  }

  private paginationChange = (pageNo: number, pageSize: number) => {
    const { widgetProps } = this.state
    this.setState({
      widgetProps: {
        ...widgetProps,
        pagination: {
          ...widgetProps.pagination,
          pageNo,
          pageSize
        }
      }
    })
  }

  public render () {
    const {
      views,
      loading,
      dataLoading,
      distinctColumnValues,
      columnValueLoading,
      onLoadDistinctValue
    } = this.props
    const {
      name,
      description,
      selectedView,
      mode,
      currentWidgetlibs,
      chartModeSelectedChart,
      pagination,
      queryParams,
      cache,
      expired,
      originalWidgetProps,
      widgetProps
    } = this.state

    return (
      <div className={styles.workbench}>
        <EditorHeader
          currentType="workbench"
          className={styles.header}
          name={name}
          description={description}
          placeholder={this.placeholder}
          onNameChange={this.changeName}
          onDescriptionChange={this.changeDesc}
          onSave={this.saveWidget}
          onCancel={this.cancel}
          loading={loading}
        />
        <div className={styles.body}>
          <OperatingPanel
            views={views}
            originalWidgetProps={originalWidgetProps}
            selectedView={selectedView}
            distinctColumnValues={distinctColumnValues}
            columnValueLoading={columnValueLoading}
            mode={mode}
            currentWidgetlibs={currentWidgetlibs}
            chartModeSelectedChart={chartModeSelectedChart}
            pagination={pagination}
            queryParams={queryParams}
            cache={cache}
            expired={expired}
            onViewSelect={this.viewSelect}
            onChartSelect={this.chartSelect}
            onReset={this.reset}
            onModeChange={this.modeChange}
            onSetQueryParams={this.setQueryParams}
            onCacheChange={this.cacheChange}
            onExpiredChange={this.expiredChange}
            onSetWidgetProps={this.setWidgetProps}
            onLoadDistinctValue={onLoadDistinctValue}
          />
          <div className={styles.viewPanel}>
            <div className={styles.widgetBlock}>
              <Widget
                {...widgetProps}
                loading={dataLoading}
                onPaginationChange={this.paginationChange}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  views: makeSelectBizlogics(),
  currentWidget: makeSelectCurrentWidget(),
  loading: makeSelectLoading(),
  dataLoading: makeSelectDataLoading(),
  distinctColumnValues: makeSelectDistinctColumnValues(),
  columnValueLoading: makeSelectColumnValueLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadWidgetDetail: (id) => dispatch(loadWidgetDetail(id)),
    onLoadData: (viewId, params, resolve) => dispatch(loadData(viewId, params, resolve)),
    onAddWidget: (widget, resolve) => dispatch(addWidget(widget, resolve)),
    onEditWidget: (widget, resolve) => dispatch(editWidget(widget, resolve)),
    onLoadDistinctValue: (viewId, column, parents) => dispatch(loadDistinctValue(viewId, column, parents)),
    onClearCurrentWidget: () => dispatch(clearCurrentWidget())
  }
}

const withConnect = connect<{}, {}>(mapStateToProps, mapDispatchToProps)

const withReducerWidget = injectReducer({ key: 'widget', reducer })
const withSagaWidget = injectSaga({ key: 'widget', saga })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: bizlogicReducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: bizlogicSaga })

export default compose(
  withReducerWidget,
  withReducerBizlogic,
  withSagaBizlogic,
  withSagaWidget,
  withConnect
)(Workbench)
