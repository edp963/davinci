import React, { Suspense } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import injectReducer from '../../../../utils/injectReducer'
import injectSaga from '../../../../utils/injectSaga'
import reducer from '../../reducer'
import bizlogicReducer from '../../../Bizlogic/reducer'
import saga from '../../sagas'
import bizlogicSaga from '../../../Bizlogic/sagas'
import { hideNavigator } from '../../../App/actions'
import { loadBizlogics, loadData, loadDistinctValue } from '../../../Bizlogic/actions'
import { addWidget, editWidget, loadWidgetDetail, clearCurrentWidget, executeComputed } from '../../actions'
import { makeSelectCurrentWidget, makeSelectLoading, makeSelectDataLoading, makeSelectDistinctColumnValues, makeSelectColumnValueLoading } from '../../selectors'
import { makeSelectBizlogics } from '../../../Bizlogic/selectors'

import OperatingPanel from './OperatingPanel'
import Widget, { IWidgetProps } from '../Widget'
import { IDataRequestParams } from 'app/containers/Dashboard/Grid'
import EditorHeader from '../../../../components/EditorHeader'
import { DEFAULT_SPLITER } from '../../../../globalConstants'
import { getStyleConfig } from 'containers/Widget/components/util'
import ChartTypes from '../../config/chart/ChartTypes'
import message from 'antd/lib/message'
import 'assets/less/resizer.less'
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
  onLoadData: (viewId: number, requestParams: IDataRequestParams, resolve: (data: any) => void) => void
  onAddWidget: (widget: IWidget, resolve: () => void) => void
  onEditWidget: (widget: IWidget, resolve: () => void) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
  onClearCurrentWidget: () => void
  onExecuteComputed: (sql: string) => void
}

interface IWorkbenchStates {
  id: number
  name: string
  description: string
  selectedView: IView
  controls: any[]
  computed: any[]
  cache: boolean
  expired: number
  splitSize: number
  originalWidgetProps: IWidgetProps
  originalComputed: any[]
  widgetProps: IWidgetProps
}

const SplitPane = React.lazy(() => import('react-split-pane'))

export class Workbench extends React.Component<IWorkbenchProps, IWorkbenchStates> {

  private operatingPanel: OperatingPanel = null
  private defaultSplitSize = 440
  private maxSplitSize = this.defaultSplitSize * 1.5

  constructor (props) {
    super(props)
    const splitSize = +localStorage.getItem('workbenchSplitSize') || this.defaultSplitSize
    this.state = {
      id: 0,
      name: '',
      description: '',
      selectedView: null,
      controls: [],
      computed: [],
      originalComputed: [],
      cache: false,
      expired: 300,
      splitSize,
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
      const { controls, cache, expired, computed, ...rest } = JSON.parse(currentWidget.config)
      this.setState({
        id: currentWidget.id,
        name: currentWidget.name,
        description: currentWidget.description,
        selectedView: views.find((v) => v.id === currentWidget.viewId),
        controls,
        cache,
        expired,
        originalWidgetProps: {...rest},
        widgetProps: {...rest},
        originalComputed: computed
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
      controls: [],
      cache: false,
      expired: 300
    })
  }

  private setControls = (controls: any[]) => {
    this.setState({
      controls
    })
  }

  private deleteComputed = (computeField) => {
    console.log({computeField})
    const { from } = computeField
    const { params, onEditWidget } = this.props
    const { id, name, description, selectedView, controls, cache, expired, widgetProps, computed, originalWidgetProps, originalComputed } = this.state
    if (from === 'originalComputed') {
      this.setState({
        originalComputed: originalComputed.filter((oc) => oc.id !== computeField.id)
      }, () => {
        const {originalComputed, computed} = this.state
        const widget = {
          name,
          description,
          type: 1,
          viewId: selectedView.id,
          projectId: Number(params.pid),
          config: JSON.stringify({
            ...widgetProps,
            controls,
            computed: originalComputed && originalComputed ? [...computed, ...originalComputed] : [...computed],
            cache,
            expired,
            data: []
          }),
          publish: true
        }
        if (id) {
          onEditWidget({...widget, id}, () => void 0)
        }
      })
    } else if (from === 'computed') {
      this.setState({
        computed: computed.filter((cm) => cm.id !== computeField.id)
      }, () => {
        const {originalComputed, computed} = this.state
        const widget = {
          name,
          description,
          type: 1,
          viewId: selectedView.id,
          projectId: Number(params.pid),
          config: JSON.stringify({
            ...widgetProps,
            controls,
            computed: originalComputed && originalComputed ? [...computed, ...originalComputed] : [...computed],
            cache,
            expired,
            data: []
          }),
          publish: true
        }
        if (id) {
          onEditWidget({...widget, id}, () => void 0)
        }
      })
    }
  }

  private setComputed = (computeField) => {
    const {computed, originalComputed} = this.state
    const {from, sqlExpression} = computeField
    // todo  首先做sql合法校验； sqlExpression
    let isEdit = void 0
    let newComputed = null
    if (from === 'originalComputed') {
      isEdit = originalComputed ? originalComputed.some((cm) => cm.id === computeField.id) : false
      newComputed =  isEdit ? originalComputed.map((cm) => {
        if (cm.id === computeField.id) {
          return computeField
        } else {
          return cm
        }
      }) : originalComputed.concat(computeField)
      this.setState({
        originalComputed: newComputed
      })
    } else if (from === 'computed') {
      isEdit = computed.some((cm) => cm.id === computeField.id)
      newComputed =  isEdit ? computed.map((cm) => {
        if (cm.id === computeField.id) {
          return computeField
        } else {
          return cm
        }
      }) : computed.concat(computeField)
      this.setState({
        computed: newComputed
      })
    } else {
      this.setState({
        computed: computed.concat(computeField)
      })
    }
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

  private setWidgetProps = (widgetProps: IWidgetProps) => {
    this.setState({
      widgetProps: {
        ...widgetProps,
        data: widgetProps.data || this.state.widgetProps.data
      }
    })
  }

  private saveWidget = () => {
    const { params, onAddWidget, onEditWidget } = this.props
    const { id, name, description, selectedView, controls, cache, expired, widgetProps, computed, originalWidgetProps, originalComputed } = this.state
    if (!name.trim()) {
      message.error('Widget名称不能为空')
      return
    }
    if (!selectedView) {
      message.error('请选择一个View')
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
        controls,
        computed: originalComputed && originalComputed ? [...computed, ...originalComputed] : [...computed],
        cache,
        expired,
        data: []
      }),
      publish: true
    }
    console.info({
      widget
    })
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
    this.operatingPanel.triggerWidgetRefresh(pageNo, pageSize)
  }

  private saveSplitSize (newSize: number) {
    localStorage.setItem('workbenchSplitSize', newSize.toString())
  }

  private resizeChart = () => {
    this.setState({
      widgetProps: {
        ...this.state.widgetProps,
        renderType: 'resize'
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
      onLoadData,
      onLoadDistinctValue
    } = this.props
    const {
      name,
      description,
      selectedView,
      controls,
      cache,
      expired,
      computed,
      splitSize,
      originalWidgetProps,
      originalComputed,
      widgetProps
    } = this.state
    console.log({originalComputed})
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
          <Suspense fallback={null}>
            <SplitPane
              split="vertical"
              defaultSize={splitSize}
              minSize={this.defaultSplitSize}
              maxSize={this.maxSplitSize}
              onChange={this.saveSplitSize}
              onDragFinished={this.resizeChart}
            >
          <OperatingPanel
            ref={(f) => this.operatingPanel = f}
            views={views}
            originalWidgetProps={originalWidgetProps}
            originalComputed={originalComputed}
            selectedView={selectedView}
            distinctColumnValues={distinctColumnValues}
            columnValueLoading={columnValueLoading}
            controls={controls}
            cache={cache}
            expired={expired}
            computed={computed}
            onViewSelect={this.viewSelect}
            onSetControls={this.setControls}
            onCacheChange={this.cacheChange}
            onExpiredChange={this.expiredChange}
            onSetWidgetProps={this.setWidgetProps}
            onSetComputed={this.setComputed}
            onDeleteComputed={this.deleteComputed}
            onLoadData={onLoadData}
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
            </SplitPane>
          </Suspense>
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
    onLoadData: (viewId, requestParams, resolve) => dispatch(loadData(viewId, requestParams, resolve)),
    onAddWidget: (widget, resolve) => dispatch(addWidget(widget, resolve)),
    onEditWidget: (widget, resolve) => dispatch(editWidget(widget, resolve)),
    onLoadDistinctValue: (viewId, column, parents) => dispatch(loadDistinctValue(viewId, column, parents)),
    onClearCurrentWidget: () => dispatch(clearCurrentWidget()),
    onExecuteComputed: (sql) => dispatch(executeComputed(sql))
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
