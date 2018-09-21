import * as React from 'react'
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
import { addWidget, editWidget, loadWidgetDetail, clearCurrentWidget } from '../../actions'
import { makeSelectCurrentWidget, makeSelectLoading, makeSelectDataLoading, makeSelectDistinctColumnValues, makeSelectColumnValueLoading } from '../../selectors'
import { makeSelectBizlogics } from '../../../Bizlogic/selectors'

import OperatingPanel from './OperatingPanel'
import { IPivotProps } from '../Pivot/Pivot'
import ScrollablePivot from '../Pivot'
import EditorHeader from '../../../../components/EditorHeader'
import { DEFAULT_SPLITER } from '../../../../globalConstants'
import { getStyleConfig } from 'containers/Widget/components/util'
const message = require('antd/lib/message')
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
  onLoadData: (viewId: number, params: object, resolve: (data: any[]) => void) => void
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
  queryParams: any[]
  cache: boolean
  expired: number
  currentWidgetConfig: IPivotProps
  pivotProps: IPivotProps
}

export class Workbench extends React.Component<IWorkbenchProps, IWorkbenchStates> {
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      name: '',
      description: '',
      selectedView: null,
      queryParams: [],
      cache: false,
      expired: 300,
      currentWidgetConfig: null,
      pivotProps: {
        data: [],
        cols: [],
        rows: [],
        metrics: [],
        filters: [],
        chartStyles: getStyleConfig({}),
        orders: [],
        queryParams: [],
        cache: false,
        expired: 300
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
      const { queryParams, cache, expired, ...rest } = JSON.parse(currentWidget.config)
      this.setState({
        id: currentWidget.id,
        name: currentWidget.name,
        description: currentWidget.description,
        selectedView: views.find((v) => v.id === currentWidget.viewId),
        queryParams,
        cache,
        expired,
        currentWidgetConfig: {...rest}
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

  private setPivotProps = (pivotProps: IPivotProps) => {
    const data = pivotProps.data || this.state.pivotProps.data
    this.setState({
      pivotProps: {
        ...pivotProps,
        data
      }
    })
  }

  private saveWidget = () => {
    const { params, onAddWidget, onEditWidget } = this.props
    const { id, name, description, selectedView, queryParams, cache, expired, pivotProps } = this.state
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
        ...pivotProps,
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
        const editSign = localStorage.getItem('editWidgetFromDashboard')
        if (editSign) {
          localStorage.removeItem('editWidgetFromDashboard')
          const [pid, portalId, portalName, dashboardId, itemId] = editSign.split(DEFAULT_SPLITER)
          this.props.router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${dashboardId}`)
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
    localStorage.removeItem('editWidgetFromDashboard')
    this.props.router.goBack()
  }

  public render () {
    const {
      views,
      loading,
      dataLoading,
      distinctColumnValues,
      columnValueLoading,
      onLoadDistinctValue,
      onLoadData
    } = this.props
    const {
      name,
      description,
      selectedView,
      queryParams,
      cache,
      expired,
      currentWidgetConfig,
      pivotProps
    } = this.state

    return (
      <div className={styles.workbench}>
        <EditorHeader
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
            currentWidgetConfig={currentWidgetConfig}
            selectedView={selectedView}
            distinctColumnValues={distinctColumnValues}
            columnValueLoading={columnValueLoading}
            queryParams={queryParams}
            cache={cache}
            expired={expired}
            onViewSelect={this.viewSelect}
            onSetQueryParams={this.setQueryParams}
            onCacheChange={this.cacheChange}
            onExpiredChange={this.expiredChange}
            onLoadData={onLoadData}
            onSetPivotProps={this.setPivotProps}
            onLoadDistinctValue={onLoadDistinctValue}
          />
          <div className={styles.viewPanel}>
            <div className={styles.pivotBlock}>
              <ScrollablePivot
                {...pivotProps}
                loading={dataLoading}
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
