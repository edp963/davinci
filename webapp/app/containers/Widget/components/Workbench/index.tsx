import React, { Suspense } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from 'containers/Widget/reducer'
import viewReducer from 'containers/View/reducer'
import saga from 'containers/Widget/sagas'
import viewSaga from 'containers/View/sagas'
import controlReducer from 'containers/ControlPanel/reducer'
import { hideNavigator } from 'containers/App/actions'
import { ViewActions } from 'containers/View/actions'
const {
  loadViews,
  loadViewsDetail,
  loadViewData,
  loadColumnDistinctValue
} = ViewActions
import { WidgetActions } from 'containers/Widget/actions'
import {
  makeSelectCurrentWidget,
  makeSelectLoading,
  makeSelectDataLoading
} from 'containers/Widget/selectors'
import {
  makeSelectViews,
  makeSelectFormedViews
} from 'containers/View/selectors'

import { RouteComponentWithParams } from 'utils/types'
import { IViewBase, IFormedViews, IView } from 'containers/View/types'
import OperatingPanel from './OperatingPanel'
import Widget, { IWidgetProps } from '../Widget'
import { IDataRequestBody } from 'app/containers/Dashboard/types'
import EditorHeader from 'components/EditorHeader'
import WorkbenchSettingForm from './WorkbenchSettingForm'
import DashboardItemMask, {
  IDashboardItemMaskProps
} from 'containers/Dashboard/components/DashboardItemMask'
import { DEFAULT_SPLITER, DEFAULT_CACHE_EXPIRED } from 'app/globalConstants'
import { getStyleConfig } from 'containers/Widget/components/util'
import ChartTypes from '../../config/chart/ChartTypes'
import { FieldSortTypes, fieldGroupedSort } from '../Config/Sort'
import { message } from 'antd'
import 'assets/less/resizer.less'
import {
  IDistinctValueReqeustParams,
  IControl
} from 'app/components/Control/types'
import { IReference } from './Reference/types'
import { IWorkbenchSettings, WorkbenchQueryMode } from './types'
import { IWidgetFormed, IWidgetRaw } from '../../types'
import { ControlQueryMode } from 'app/components/Control/constants'

const styles = require('./Workbench.less')

interface IWorkbenchProps {
  views: IViewBase[]
  formedViews: IFormedViews
  currentWidget: IWidgetFormed
  loading: boolean
  dataLoading: boolean
  onHideNavigator: () => void
  onLoadViews: (projectId: number, resolve?: () => void) => void
  onLoadViewDetail: (
    viewIds: number[],
    resolve?: (views: IView[]) => void
  ) => void
  onLoadWidgetDetail: (id: number) => void
  onLoadViewData: (
    viewId: number,
    requestParams: IDataRequestBody,
    resolve: (data) => void,
    reject: (error) => void
  ) => void
  onAddWidget: (widget: Omit<IWidgetRaw, 'id'>, resolve: () => void) => void
  onEditWidget: (widget: IWidgetRaw, resolve: () => void) => void
  onLoadColumnDistinctValue: (
    paramsByViewId: {
      [viewId: string]: Omit<IDistinctValueReqeustParams, 'cache' | 'expired'>
    },
    callback: (options?: object[]) => void
  ) => void
  onClearCurrentWidget: () => void
  onExecuteComputed: (sql: string) => void
}

interface IWorkbenchStates {
  id: number
  name: string
  description: string
  selectedViewId: number
  controls: any[]
  references: IReference[]
  computed: any[]
  autoLoadData: boolean
  controlQueryMode: ControlQueryMode
  limit: number
  cache: boolean
  expired: number
  splitSize: number
  originalWidgetProps: IWidgetProps
  originalComputed: any[]
  widgetProps: IWidgetProps
  settingFormVisible: boolean
  settings: IWorkbenchSettings
}

const SplitPane = React.lazy(() => import('react-split-pane'))

export class Workbench extends React.Component<
  IWorkbenchProps & RouteComponentWithParams,
  IWorkbenchStates
> {
  private operatingPanel: OperatingPanel = null
  private defaultSplitSize = 440
  private maxSplitSize = this.defaultSplitSize * 1.5

  constructor(props) {
    super(props)
    const splitSize =
      +localStorage.getItem('workbenchSplitSize') || this.defaultSplitSize
    this.state = {
      id: 0,
      name: '',
      description: '',
      selectedViewId: null,
      controls: [],
      references: [],
      computed: [],
      originalComputed: [],
      cache: false,
      autoLoadData: true,
      controlQueryMode: ControlQueryMode.Immediately,
      limit: null,
      expired: DEFAULT_CACHE_EXPIRED,
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
        secondaryMetrics: [],
        filters: [],
        chartStyles: getStyleConfig({}),
        selectedChart: ChartTypes.Table,
        orders: [],
        mode: 'pivot',
        model: {},
        onPaginationChange: this.paginationChange
      },
      settingFormVisible: false,
      settings: this.initSettings()
    }
  }

  private placeholder = {
    name: '请输入Widget名称',
    description: '请输入描述…'
  }

  public componentWillMount() {
    const { match, onLoadWidgetDetail } = this.props
    const { widgetId } = match.params
    this.loadViews(() => {
      if (widgetId !== 'add' && !Number.isNaN(Number(widgetId))) {
        onLoadWidgetDetail(+widgetId)
      }
    })
  }

  public componentDidMount() {
    this.props.onHideNavigator()
  }

  public componentWillReceiveProps(nextProps: IWorkbenchProps) {
    const { currentWidget } = nextProps
    if (currentWidget && currentWidget !== this.props.currentWidget) {
      const { id, name, description, viewId, config } = currentWidget
      const {
        controls,
        references,
        limit,
        cache,
        expired,
        computed,
        autoLoadData,
        queryMode,
        ...rest
      } = config
      this.setState({
        id,
        name,
        description,
        controls,
        references,
        cache,
        autoLoadData,
        controlQueryMode: queryMode,
        limit,
        expired,
        selectedViewId: viewId,
        originalWidgetProps: { ...rest },
        widgetProps: { ...rest },
        originalComputed: computed
      })
    }
  }

  public componentWillUnmount() {
    this.props.onClearCurrentWidget()
  }

  private initSettings = (): IWorkbenchSettings => {
    let workbenchSettings = {
      queryMode: WorkbenchQueryMode.Immediately,
      multiDrag: false
    }
    try {
      const loginUser = JSON.parse(localStorage.getItem('loginUser'))
      const currentUserWorkbenchSetting = JSON.parse(
        localStorage.getItem(`${loginUser.id}_workbench_settings`)
      )
      if (currentUserWorkbenchSetting) {
        workbenchSettings = currentUserWorkbenchSetting
      }
    } catch (err) {
      throw new Error(err)
    }
    return workbenchSettings
  }

  private loadViews = (callback?: () => void) => {
    const { match, onLoadViews } = this.props
    const { projectId } = match.params
    onLoadViews(Number(projectId), () => {
      if (callback) {
        callback()
      }
    })
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

  private viewSelect = (viewId: number) => {
    const { formedViews } = this.props
    const nextState = {
      selectedViewId: viewId,
      controls: [],
      controlQueryMode: ControlQueryMode.Immediately,
      references: [],
      cache: false,
      expired: DEFAULT_CACHE_EXPIRED
    }
    if (formedViews[viewId]) {
      this.setState(nextState)
    } else {
      this.props.onLoadViewDetail([viewId], () => {
        this.setState(nextState)
      })
    }
  }

  private setControls = (controls: IControl[], queryMode: ControlQueryMode) => {
    this.setState({
      controls,
      controlQueryMode: queryMode
    })
  }

  private setReferences = (references: IReference[]) => {
    this.setState({
      references,
      widgetProps: {
        ...this.state.widgetProps,
        references
      }
    })
  }

  private deleteComputed = (computeField) => {
    const { from } = computeField
    const { match, onEditWidget } = this.props
    const {
      id,
      name,
      description,
      selectedViewId,
      controls,
      references,
      cache,
      autoLoadData,
      limit,
      expired,
      widgetProps,
      computed,
      originalWidgetProps,
      originalComputed
    } = this.state
    if (from === 'originalComputed') {
      this.setState(
        {
          originalComputed: originalComputed.filter(
            (oc) => oc.id !== computeField.id
          )
        },
        () => {
          const { originalComputed, computed } = this.state
          const widget = {
            name,
            description,
            type: 1,
            viewId: selectedViewId,
            projectId: Number(match.params.projectId),
            config: JSON.stringify({
              ...widgetProps,
              controls,
              references,
              computed:
                originalComputed && originalComputed
                  ? [...computed, ...originalComputed]
                  : [...computed],
              limit,
              cache,
              autoLoadData,
              expired,
              data: []
            }),
            publish: true
          }
          if (id) {
            onEditWidget({ ...widget, id }, () => void 0)
          }
        }
      )
    } else if (from === 'computed') {
      this.setState(
        {
          computed: computed.filter((cm) => cm.id !== computeField.id)
        },
        () => {
          const { originalComputed, computed } = this.state
          const widget = {
            name,
            description,
            type: 1,
            viewId: selectedViewId,
            projectId: Number(match.params.projectId),
            config: JSON.stringify({
              ...widgetProps,
              controls,
              references,
              computed:
                originalComputed && originalComputed
                  ? [...computed, ...originalComputed]
                  : [...computed],
              limit,
              cache,
              autoLoadData,
              expired,
              data: []
            }),
            publish: true
          }
          if (id) {
            onEditWidget({ ...widget, id }, () => void 0)
          }
        }
      )
    }
  }

  private setComputed = (computeField) => {
    const { computed, originalComputed } = this.state
    const { from, sqlExpression } = computeField
    // todo  首先做sql合法校验； sqlExpression
    let isEdit = void 0
    let newComputed = null
    if (from === 'originalComputed') {
      isEdit = originalComputed
        ? originalComputed.some((cm) => cm.id === computeField.id)
        : false
      newComputed = isEdit
        ? originalComputed.map((cm) => {
            if (cm.id === computeField.id) {
              return computeField
            } else {
              return cm
            }
          })
        : originalComputed.concat(computeField)
      this.setState({
        originalComputed: newComputed
      })
    } else if (from === 'computed') {
      isEdit = computed.some((cm) => cm.id === computeField.id)
      newComputed = isEdit
        ? computed.map((cm) => {
            if (cm.id === computeField.id) {
              return computeField
            } else {
              return cm
            }
          })
        : computed.concat(computeField)
      this.setState({
        computed: newComputed
      })
    } else {
      this.setState({
        computed: computed.concat(computeField)
      })
    }
  }

  private limitChange = (value) => {
    this.setState({
      limit: value
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

  private setWidgetProps = (widgetProps: IWidgetProps) => {
    const { cols, rows } = widgetProps
    const data = [...(widgetProps.data || this.state.widgetProps.data)]
    const customOrders = cols
      .concat(rows)
      .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
      .map(({ name, sort }) => ({
        name,
        list: sort[FieldSortTypes.Custom].sortList
      }))
    fieldGroupedSort(data, customOrders)
    this.setState({
      widgetProps: {
        ...widgetProps,
        data,
        references: this.state.references
      }
    })
  }

  private saveWidget = () => {
    const { match, onAddWidget, onEditWidget } = this.props
    const {
      id,
      name,
      description,
      selectedViewId,
      controls,
      controlQueryMode,
      references,
      limit,
      cache,
      expired,
      widgetProps,
      computed,
      originalComputed,
      autoLoadData
    } = this.state
    if (!name.trim()) {
      message.error('Widget名称不能为空')
      return
    }
    if (!selectedViewId) {
      message.error('请选择一个View')
      return
    }
    const widget = {
      name,
      description,
      type: 1,
      viewId: selectedViewId,
      projectId: Number(match.params.projectId),
      config: JSON.stringify({
        ...widgetProps,
        controls,
        queryMode: controlQueryMode,
        references,
        computed:
          originalComputed && originalComputed
            ? [...computed, ...originalComputed]
            : [...computed],
        limit,
        cache,
        expired,
        autoLoadData,
        data: []
      }),
      publish: true
    }
    if (id) {
      onEditWidget({ ...widget, id }, () => {
        message.success('修改成功')
        const editSignDashboard = sessionStorage.getItem(
          'editWidgetFromDashboard'
        )
        const editSignDisplay = sessionStorage.getItem('editWidgetFromDisplay')
        if (editSignDashboard) {
          sessionStorage.removeItem('editWidgetFromDashboard')
          const [
            projectId,
            portalId,
            dashboardId,
            itemId
          ] = editSignDashboard.split(DEFAULT_SPLITER)
          this.props.history.replace(
            `/project/${projectId}/portal/${portalId}/dashboard/${dashboardId}`
          )
        } else if (editSignDisplay) {
          sessionStorage.removeItem('editWidgetFromDisplay')
          const [projectId, displayId] = editSignDisplay.split(DEFAULT_SPLITER)
          this.props.history.replace(
            `/project/${projectId}/display/${displayId}`
          )
        } else {
          this.props.history.replace(
            `/project/${match.params.projectId}/widgets`
          )
        }
      })
    } else {
      onAddWidget(widget, () => {
        message.success('添加成功')
        this.props.history.replace(`/project/${match.params.projectId}/widgets`)
      })
    }
  }

  private cancel = () => {
    sessionStorage.removeItem('editWidgetFromDashboard')
    sessionStorage.removeItem('editWidgetFromDisplay')
    this.props.history.goBack()
  }

  private paginationChange = (pageNo: number, pageSize: number, orders) => {
    this.operatingPanel.flipPage(pageNo, pageSize, orders)
  }

  private chartStylesChange = (propPath: string[], value: string) => {
    const { widgetProps } = this.state
    const { chartStyles } = widgetProps
    const updatedChartStyles = { ...chartStyles }
    propPath.reduce((subObj, propName, idx) => {
      if (idx === propPath.length - 1) {
        subObj[propName] = value
      }
      return subObj[propName]
    }, updatedChartStyles)
    this.setWidgetProps({
      ...widgetProps,
      chartStyles: updatedChartStyles
    })
  }

  private saveSplitSize(newSize: number) {
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

  private changeAutoLoadData = (e) => {
    this.setState({
      autoLoadData: e.target.value
    })
  }

  private openSettingForm = () => {
    this.setState({
      settingFormVisible: true
    })
  }

  private saveSettingForm = (values: IWorkbenchSettings) => {
    try {
      const loginUser = JSON.parse(localStorage.getItem('loginUser'))
      localStorage.setItem(
        `${loginUser.id}_workbench_settings`,
        JSON.stringify(values)
      )
      this.setState({
        settings: values
      })
    } catch (err) {
      throw new Error(err)
    }
    this.closeSettingForm()
  }

  private closeSettingForm = () => {
    this.setState({
      settingFormVisible: false
    })
  }

  public render() {
    const {
      views,
      formedViews,
      loading,
      dataLoading,
      onLoadViewData,
      onLoadColumnDistinctValue,
      onLoadViewDetail
    } = this.props
    const {
      name,
      description,
      selectedViewId,
      controls,
      controlQueryMode,
      references,
      limit,
      cache,
      autoLoadData,
      expired,
      computed,
      splitSize,
      originalWidgetProps,
      originalComputed,
      widgetProps,
      settingFormVisible,
      settings
    } = this.state
    const { queryMode: workbenchQueryMode, multiDrag } = settings

    const { selectedChart, cols, rows, metrics, data } = widgetProps
    const hasDataConfig = !!(cols.length || rows.length || metrics.length)
    const maskProps: IDashboardItemMaskProps = {
      loading: dataLoading,
      chartType: selectedChart,
      empty: !data.length,
      hasDataConfig
    }

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
          onSetting={this.openSettingForm}
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
                ref={(f) => (this.operatingPanel = f)}
                views={views}
                formedViews={formedViews}
                selectedViewId={selectedViewId}
                originalWidgetProps={originalWidgetProps}
                originalComputed={originalComputed}
                controls={controls}
                controlQueryMode={controlQueryMode}
                references={references}
                limit={limit}
                cache={cache}
                autoLoadData={autoLoadData}
                expired={expired}
                workbenchQueryMode={workbenchQueryMode}
                multiDrag={multiDrag}
                computed={computed}
                onViewSelect={this.viewSelect}
                onChangeAutoLoadData={this.changeAutoLoadData}
                onSetControls={this.setControls}
                onSetReferences={this.setReferences}
                onLimitChange={this.limitChange}
                onCacheChange={this.cacheChange}
                onExpiredChange={this.expiredChange}
                onSetWidgetProps={this.setWidgetProps}
                onSetComputed={this.setComputed}
                onDeleteComputed={this.deleteComputed}
                onLoadData={onLoadViewData}
                onLoadColumnDistinctValue={onLoadColumnDistinctValue}
                onLoadViews={this.loadViews}
                onLoadViewDetail={onLoadViewDetail}
              />
              <div className={styles.viewPanel}>
                <div className={styles.widgetBlock}>
                  <Widget
                    {...widgetProps}
                    loading={<DashboardItemMask.Loading {...maskProps} />}
                    empty={<DashboardItemMask.Empty {...maskProps} />}
                    editing={true}
                    onPaginationChange={this.paginationChange}
                    onChartStylesChange={this.chartStylesChange}
                  />
                </div>
              </div>
            </SplitPane>
          </Suspense>
          <WorkbenchSettingForm
            visible={settingFormVisible}
            settings={settings}
            onSave={this.saveSettingForm}
            onClose={this.closeSettingForm}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  views: makeSelectViews(),
  formedViews: makeSelectFormedViews(),
  currentWidget: makeSelectCurrentWidget(),
  loading: makeSelectLoading(),
  dataLoading: makeSelectDataLoading()
})

export function mapDispatchToProps(dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadViews: (projectId, resolve) =>
      dispatch(loadViews(projectId, resolve)),
    onLoadViewDetail: (viewIds, resolve) =>
      dispatch(loadViewsDetail(viewIds, resolve)),
    onLoadWidgetDetail: (id) => dispatch(WidgetActions.loadWidgetDetail(id)),
    onLoadViewData: (viewId, requestParams, resolve, reject) =>
      dispatch(loadViewData(viewId, requestParams, resolve, reject)),
    onAddWidget: (widget, resolve) =>
      dispatch(WidgetActions.addWidget(widget, resolve)),
    onEditWidget: (widget, resolve) =>
      dispatch(WidgetActions.editWidget(widget, resolve)),
    onLoadColumnDistinctValue: (
      paramsByViewId: {
        [viewId: string]: Omit<IDistinctValueReqeustParams, 'cache' | 'expired'>
      },
      callback: (options?: object[]) => void
    ) => dispatch(loadColumnDistinctValue(paramsByViewId, callback)),
    onClearCurrentWidget: () => dispatch(WidgetActions.clearCurrentWidget()),
    onExecuteComputed: (sql) => dispatch(WidgetActions.executeComputed(sql))
  }
}

const withConnect = connect<{}, {}>(mapStateToProps, mapDispatchToProps)

const withReducerWidget = injectReducer({ key: 'widget', reducer })
const withSagaWidget = injectSaga({ key: 'widget', saga })

const withReducerView = injectReducer({ key: 'view', reducer: viewReducer })
const withSagaView = injectSaga({ key: 'view', saga: viewSaga })

const withControlReducer = injectReducer({
  key: 'control',
  reducer: controlReducer
})

export default compose(
  withReducerWidget,
  withReducerView,
  withControlReducer,
  withSagaView,
  withSagaWidget,
  withConnect
)(Workbench)
