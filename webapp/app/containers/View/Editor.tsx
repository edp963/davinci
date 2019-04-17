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
import memoizeOne from 'memoize-one'
import Helmet from 'react-helmet'
import { Link, RouteComponentProps } from 'react-router'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer, { ViewStateType } from './reducer'
import sagas from './sagas'
import reducerSource from 'containers/Source/reducer'
import sagasSource from 'containers/Source/sagas'

import { IRouteParams } from 'app/routes'
import { hideNavigator } from '../App/actions'
import { ViewActions, ViewActionType } from './actions'
import { SourceActions, SourceActionType } from 'containers/Source/actions'
import { makeSelectSources, makeSelectSourceTables, makeSelectMapTableColumns } from './selectors'
import { IExecuteSqlParams, IViewVariable } from './types'
import { ISource, ISourceTable, IMapTableColumns } from '../Source/types'

import EditorSteps from './components/EditorSteps'
import EditorContainer from './components/EditorContainer'
import ModelAuth from './components/ModelAuth'

import Styles from './View.less'

interface IViewEditorStateProps {
  sources: ISource[],
  tables: ISourceTable[],
  mapTableColumns: IMapTableColumns
}

interface IViewEditorDispatchProps {
  onHideNavigator: () => void
  onLoadSources: (projectId: number) => void
  onLoadSourceTables: (sourceId: number, resolve: (tables: ISourceTable[]) => void) => void
  onLoadTableColumns: (sourceId: number, tableName: string, resolve: () => void) => void
  onExecuteSql: (params: IExecuteSqlParams) => void
}

interface IViewEditorStates {
  currentStep: number
}

export class ViewEditor extends React.Component<IViewEditorStateProps & IViewEditorDispatchProps & RouteComponentProps<{}, IRouteParams>, IViewEditorStates> {

  public state: Readonly<IViewEditorStates> = {
    currentStep: 0
  }

  public componentDidMount () {
    this.props.onHideNavigator()
    const { onLoadSources, params } = this.props
    const { pid: projectId, viewId } = params
    if (projectId) {
      onLoadSources(projectId)
    }
  }

  private stepChange = (step: number) => {
    this.setState({ currentStep: this.state.currentStep + step })
  }

  private modelChange = () => {

  }

  public render () {
    const {
      sources, tables, mapTableColumns,
      onLoadSourceTables, onLoadTableColumns, onExecuteSql } = this.props
    const { currentStep } = this.state
    const containerProps = {
      sources, tables, mapTableColumns,
      onLoadSourceTables, onLoadTableColumns, onExecuteSql }

    return (
      <div className={Styles.viewEditor}>
        <div className={Styles.header}>
          <div className={Styles.steps}>
            <EditorSteps current={currentStep} />
          </div>
        </div>
        {
          !currentStep ?
            <EditorContainer
              {...containerProps}
              onStepChange={this.stepChange}
            />
            : <ModelAuth models={[]} variables={[]} onModelChange={this.modelChange} onStepChange={this.stepChange} />
        }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch<ViewActionType | SourceActionType | any>) => ({
  onHideNavigator: () => dispatch(hideNavigator()),
  onLoadSources: (projectId) => dispatch(SourceActions.loadSources(projectId)),
  onLoadSourceTables: (sourceId, resolve) => dispatch(SourceActions.loadSourceTables(sourceId, resolve)),
  onLoadTableColumns: (sourceId, tableName, resolve) => dispatch(SourceActions.loadTableColumns(sourceId, tableName, resolve)),
  onExecuteSql: (params) => dispatch(ViewActions.executeSql(params))
})

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  tables: makeSelectSourceTables(),
  mapTableColumns: makeSelectMapTableColumns()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'view', reducer })
const withSaga = injectSaga({ key: 'view', saga: sagas })
const withReducerSource = injectReducer({ key: 'source', reducer: reducerSource })
const withSagaSource = injectSaga({ key: 'source', saga: sagasSource })

export default compose(
  withReducer,
  withReducerSource,
  withSaga,
  withSagaSource,
  withConnect
)(ViewEditor)
