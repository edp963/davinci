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
import { addWidget } from '../../actions'
import { makeSelectWidgets, makeSelectLoading, makeSelectDataLoading, makeSelectDistinctColumnValues, makeSelectColumnValueLoading } from '../../selectors'
import { makeSelectBizlogics } from '../../../Bizlogic/selectors'

import OperatingPanel from './OperatingPanel'
import { IPivotProps } from '../Pivot/Pivot'
import ScrollablePivot from '../Pivot'
const Button = require('antd/lib/button')
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
  widgets: IWidget[],
  views: IView[]
  loading: boolean
  dataLoading: boolean
  distinctColumnValues: any[]
  columnValueLoading: boolean
  router: any
  params: { pid: string, wid: string }
  onHideNavigator: () => void
  onLoadBizlogics: (projectId: number, resolve?: any) => void
  onLoadData: (viewId: number, params: object, resolve: (data: any[]) => void) => void
  onAddWidget: (widget: IWidget, resolve: () => void) => void
  onLoadDistinctValue: (viewId: number, column: string, parents?: Array<{column: string, value: string}>) => void
}

interface IWorkbenchStates {
  name: string
  description: string
  selectedView: IView
  currentWidgetConfig: IPivotProps
  pivotProps: IPivotProps
}

export class Workbench extends React.Component<IWorkbenchProps, IWorkbenchStates> {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      description: '',
      selectedView: null,
      currentWidgetConfig: null,
      pivotProps: {
        data: [],
        cols: [],
        rows: [],
        metrics: [],
        filters: [],
        chart: []
      }
    }
  }

  private namePlaceholder = '请输入Widget名称'
  private descPlaceholder = '请输入描述…'

  public componentWillMount () {
    const { params, views, widgets, onLoadBizlogics } = this.props
    onLoadBizlogics(Number(params.pid))
    if (params.wid !== 'add' && !Number.isNaN(Number(params.wid))) {
      const currentWidget = widgets.find((w) => w.id === Number(params.wid))
      this.setState({
        selectedView: views.find((v) => v.id === currentWidget.viewId),
        currentWidgetConfig: JSON.parse(currentWidget.config)
      })
    }
  }

  public componentDidMount () {
    this.props.onHideNavigator()
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
    this.setState({ selectedView })
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
    const { params, onAddWidget } = this.props
    const { name, description, selectedView, pivotProps } = this.state
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
      config: JSON.stringify({...pivotProps, data: []}),
      publish: true
    }
    onAddWidget(widget, () => {
      message.success('添加成功')
      this.props.router.replace(`/project/${params.pid}/widgets`)
    })
  }

  private cancel = () => {
    this.props.router.goBack()
  }

  public render () {
    const { views, loading, distinctColumnValues, columnValueLoading, onLoadDistinctValue, onLoadData } = this.props
    const {
      name,
      description,
      selectedView,
      currentWidgetConfig,
      pivotProps
    } = this.state

    return (
      <div className={styles.workbench}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.name}>
              <input type="text" placeholder={this.namePlaceholder} onChange={this.changeName} />
              <span>{name || this.namePlaceholder}</span>
            </div>
            <div className={styles.desc}>
              <input type="text" placeholder={this.descPlaceholder} onChange={this.changeDesc} />
              <span>{description || this.descPlaceholder}</span>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              type="primary"
              loading={loading}
              disabled={loading}
              onClick={this.saveWidget}
            >
              保存
            </Button>
            <Button onClick={this.cancel}>取消</Button>
          </div>
        </div>
        <div className={styles.body}>
          <OperatingPanel
            views={views}
            currentWidgetConfig={currentWidgetConfig}
            selectedView={selectedView}
            distinctColumnValues={distinctColumnValues}
            columnValueLoading={columnValueLoading}
            onViewSelect={this.viewSelect}
            onLoadData={onLoadData}
            onSetPivotProps={this.setPivotProps}
            onLoadDistinctValue={onLoadDistinctValue}
          />
          <div className={styles.viewPanel}>
            <ScrollablePivot {...pivotProps} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  views: makeSelectBizlogics(),
  widgets: makeSelectWidgets(),
  loading: makeSelectLoading(),
  dataLoading: makeSelectDataLoading(),
  distinctColumnValues: makeSelectDistinctColumnValues(),
  columnValueLoading: makeSelectColumnValueLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadData: (viewId, params, resolve) => dispatch(loadData(viewId, params, resolve)),
    onAddWidget: (widget, resolve) => dispatch(addWidget(widget, resolve)),
    onLoadDistinctValue: (viewId, column, parents) => dispatch(loadDistinctValue(viewId, column, parents))
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
