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
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import Helmet from 'react-helmet'
import { Link, RouteComponentProps } from 'react-router'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer, { ViewStateType } from './reducer'
import sagas from './sagas'
import reducerSource from 'containers/Source/reducer'
import sagasSource from 'containers/Source/sagas'
import reducerOrganization from 'containers/Organizations/reducer'
import sagasOrganization from 'containers/Organizations/sagas'

import { IRouteParams } from 'app/routes'
import { hideNavigator } from '../App/actions'
import { ViewActions, ViewActionType } from './actions'
import { SourceActions, SourceActionType } from 'containers/Source/actions'
import {
  makeSelectEditingView,
  makeSelectEditingViewInfo,
  makeSelectSources,
  makeSelectSourceTables,
  makeSelectMapTableColumns,
  makeSelectSqlDataSource,
  makeSelectSqlLimit,
  makeSelectSqlValidation,
  makeSelectLoading
} from './selectors'

import { loadProjectRoles } from 'containers/Organizations/actions'
import { makeSelectCurrentOrganizationProjectRoles } from 'containers/Organizations/selectors'

import { IExecuteSqlParams, IViewVariable, IView, IExecuteSqlResponse, IViewLoading, IViewBase, IViewModel, IViewInfo, ISqlValidation } from './types'
import { ISource, ISourceTable, IMapTableColumns } from '../Source/types'

import { ModelTypeSqlTypeSetting, VisualTypeSqlTypeSetting } from './constants'

import { message } from 'antd'
import EditorSteps from './components/EditorSteps'
import EditorContainer from './components/EditorContainer'
import ModelAuth from './components/ModelAuth'

import Styles from './View.less'

interface IViewEditorStateProps {
  editingView: IView
  editingViewInfo: IViewInfo
  sources: ISource[]
  tables: ISourceTable[]
  mapTableColumns: IMapTableColumns
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  sqlValidation: ISqlValidation
  loading: IViewLoading
  projectRoles: any[]
}

interface IViewEditorDispatchProps {
  onHideNavigator: () => void
  onLoadViewDetail: (viewId: number) => void
  onLoadSources: (projectId: number) => void
  onLoadSourceTables: (sourceId: number) => void
  onLoadTableColumns: (sourceId: number, tableName: string) => void
  onExecuteSql: (params: IExecuteSqlParams) => void
  onAddView: (view: IView, resolve: () => void) => void
  onEditView: (view: IView, resolve: () => void) => void
  onSetSqlLimit: (limit: number) => void
  onResetState: () => void
  onLoadProjectRoles: (projectId: number) => void
}

type IViewEditorProps = IViewEditorStateProps & IViewEditorDispatchProps & RouteComponentProps<{}, IRouteParams>

interface IViewEditorStates {
  containerHeight: number
  localEditingView: IView
  localViewInfo: IViewInfo
  sqlValidationCode: number
  init: boolean
  currentStep: number
  nextDisabled: boolean
}

const emptyView = {
  id: null,
  name: '',
  sql: '',
  model: '',
  variable: '',
  config: '',
  description: '',
  projectId: null,
  sourceId: null
}

export class ViewEditor extends React.Component<IViewEditorProps, IViewEditorStates> {

  public state: Readonly<IViewEditorStates> = {
    containerHeight: 0,
    currentStep: 0,
    localEditingView: {...emptyView },
    localViewInfo: {
      model: [],
      variable: []
    },
    sqlValidationCode: null,
    init: true,
    nextDisabled: true
  }

  public constructor (props: IViewEditorProps) {
    super(props)
    const { onLoadSources, onLoadViewDetail, onLoadProjectRoles, params } = this.props
    const { viewId, pid: projectId } = params
    if (projectId) {
      onLoadSources(+projectId)
      onLoadProjectRoles(+projectId)
    }
    if (viewId) {
      onLoadViewDetail(+viewId)
    }
  }

  public static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IViewEditorProps, IViewEditorStates>
  = (props, state) => {
    const { params, editingView, editingViewInfo, sqlValidation } = props
    const { pid: projectId, viewId } = params
    const { init, sqlValidationCode, localEditingView } = state
    let nextDisabled = state.nextDisabled
    if (sqlValidationCode !== sqlValidation.code && sqlValidation.code) {
      message.destroy()
      message.open({
        content: `Syntax check ${sqlValidation.message}`,
        type: sqlValidation.code === 200 ? 'success' : 'error',
        duration: 5
      })
      nextDisabled = (sqlValidation.code !== 200)
    }
    if (editingView && editingView.id === +viewId) {
      if (init) {
        props.onLoadSourceTables(editingView.sourceId)
        return {
          localEditingView: { ...editingView },
          localViewInfo: { ...editingViewInfo },
          init: false,
          sqlValidationCode: sqlValidation.code,
          nextDisabled
        }
      }
    } else {
      return {
        localEditingView: {
          ...localEditingView,
          projectId: +projectId
        },
        localViewInfo: { ...editingViewInfo },
        sqlValidationCode: sqlValidation.code,
        nextDisabled
      }
    }
    return { sqlValidationCode: sqlValidation.code, nextDisabled, localViewInfo: { ...editingViewInfo } }
  }

  public componentDidMount () {
    this.props.onHideNavigator()

  }

  public componentWillUnmount () {
    this.props.onResetState()
  }

  private stepChange = (step: number) => {
    const { currentStep } = this.state
    if (currentStep + step < 0) {
      this.goToViewList()
      return
    }
    this.setState({ currentStep: currentStep + step }, () => {
      const { localEditingView, localViewInfo } = this.state
      const { model, variable } = localViewInfo
      if (this.state.currentStep > 1) {
        const { onAddView, onEditView } = this.props
        const { id: viewId } = localEditingView
        const editingView: IView = {
          ...localEditingView,
          model: JSON.stringify(model),
          variable: JSON.stringify(variable)
        }
        viewId ? onEditView(editingView, this.goToViewList) : onAddView(editingView, this.goToViewList)
      }
    })
  }

  private goToViewList = () => {
    const { router, params } = this.props
    const { pid: projectId } = params
    router.push(`/project/${projectId}/views`)
  }

  private viewChange = (propName: keyof IView, value: string | number) => {
    this.setState(({ localEditingView, nextDisabled }) => ({
      localEditingView: {
        ...localEditingView,
        [propName]: value
      },
      nextDisabled: propName === 'sql' && value !== localEditingView.sql ? true : nextDisabled
    }))
  }

  private modelChange = (partialModel: IViewModel) => {
    this.setState(({ localViewInfo }) => {
      const { model, variable } = localViewInfo
      return {
        localViewInfo: {
          model: { ...model, ...partialModel },
          variable: [...variable]
        }
      }
    })
  }

  public render () {
    const {
      sources, tables, mapTableColumns, sqlDataSource, sqlLimit, loading, projectRoles,
      onLoadSourceTables, onLoadTableColumns, onSetSqlLimit, onExecuteSql } = this.props
    const { currentStep, localEditingView: view, localViewInfo, nextDisabled } = this.state
    const { model, variable } = localViewInfo
    const containerProps = {
      view, sources, tables, mapTableColumns, sqlDataSource, sqlLimit, loading, nextDisabled,
      onLoadSourceTables, onLoadTableColumns, onSetSqlLimit, onExecuteSql }
    const containerVisible = !currentStep
    const modelAuthVisible = !!currentStep

    return (
      <div className={Styles.viewEditor}>
        <div className={Styles.header}>
          <div className={Styles.steps}>
            <EditorSteps current={currentStep} />
          </div>
        </div>
        <EditorContainer
          {...containerProps}
          visible={containerVisible}
          onStepChange={this.stepChange}
          onViewChange={this.viewChange}
        />
        <ModelAuth
          visible={modelAuthVisible}
          model={model}
          variable={variable}
          sqlColumns={sqlDataSource.columns}
          roles={projectRoles}
          onModelChange={this.modelChange}
          onStepChange={this.stepChange}
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch<ViewActionType | SourceActionType | any>) => ({
  onHideNavigator: () => dispatch(hideNavigator()),
  onLoadViewDetail: (viewId: number) => dispatch(ViewActions.loadViewDetail(viewId)), // @FIXME only load current editing view
  onLoadSources: (projectId) => dispatch(SourceActions.loadSources(projectId)),
  onLoadSourceTables: (sourceId) => dispatch(SourceActions.loadSourceTables(sourceId)),
  onLoadTableColumns: (sourceId, tableName) => dispatch(SourceActions.loadTableColumns(sourceId, tableName)),
  onExecuteSql: (params) => dispatch(ViewActions.executeSql(params)),
  onAddView: (view, resolve) => dispatch(ViewActions.addView(view, resolve)),
  onEditView: (view, resolve) => dispatch(ViewActions.editView(view, resolve)),
  onSetSqlLimit: (limit: number) => dispatch(ViewActions.setSqlLimit(limit)),
  onResetState: () => dispatch(ViewActions.resetViewState()),
  onLoadProjectRoles: (projectId) => dispatch(loadProjectRoles(projectId))
})

const mapStateToProps = createStructuredSelector({
  editingView: makeSelectEditingView(),
  editingViewInfo: makeSelectEditingViewInfo(),
  sources: makeSelectSources(),
  tables: makeSelectSourceTables(),
  mapTableColumns: makeSelectMapTableColumns(),
  sqlDataSource: makeSelectSqlDataSource(),
  sqlLimit: makeSelectSqlLimit(),
  sqlValidation: makeSelectSqlValidation(),
  loading: makeSelectLoading(),
  projectRoles: makeSelectCurrentOrganizationProjectRoles()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'view', reducer })
const withSaga = injectSaga({ key: 'view', saga: sagas })
const withReducerSource = injectReducer({ key: 'source', reducer: reducerSource })
const withSagaSource = injectSaga({ key: 'source', saga: sagasSource })
const withReducerOrganization = injectReducer({ key: 'organization', reducer: reducerOrganization })
const withSagaOrganization = injectSaga({ key: 'organization', saga: sagasOrganization })

export default compose(
  withReducer,
  withReducerSource,
  withSaga,
  withSagaSource,
  withReducerOrganization,
  withSagaOrganization,
  withConnect
)(ViewEditor)
