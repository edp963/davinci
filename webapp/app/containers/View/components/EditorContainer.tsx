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

import { ISource, ISourceTable, IMapTableColumns } from 'containers/source/types'
import { IExecuteSqlParams, IViewVariable, IView, IExecuteSqlResponse, IViewLoading } from '../types'
import { DEFAULT_SQL_LIMIT, DEFAULT_PAGE_SIZE } from '../constants'

import { InputNumber, Button, Row, Col, Tooltip } from 'antd'
import Resizable, { IResizeCallbackData } from 'libs/react-resizable/lib/Resizable'
import SourceTable from './SourceTable'
import SqlEditor from './SqlEditor'
import ViewVariableList from './ViewVariableList'
import VariableModal from './VariableModal'
import SqlPreview from './SqlPreview'

import Styles from '../View.less'

interface IEditorContainerProps {
  view: IView
  sources: ISource[],
  tables: ISourceTable[],
  mapTableColumns: IMapTableColumns
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  loading: IViewLoading
  nextDisabled: boolean
  onLoadSourceTables: (sourceId: number) => void
  onLoadTableColumns: (sourceId: number, tableName: string) => void
  onSetSqlLimit: (limit: number) => void
  onExecuteSql: (params: IExecuteSqlParams) => void
  onStepChange: (stepChange: number) => void
  onViewChange: (propName: keyof(IView), value: string | number) => void
}

interface IEditorContainerStates {
  editorHeight: number
  siderWidth: number
  previewHeight: number
  viewVariables: IViewVariable[]
  variableModalVisible: boolean
  editingVariable: IViewVariable
}

export class EditorContainer extends React.Component<IEditorContainerProps, IEditorContainerStates> {

  private editor = React.createRef<HTMLDivElement>()
  public static SiderMinWidth = 250
  public static EditorMinHeight = 100

  public state: Readonly<IEditorContainerStates> = {
    editorHeight: 0,
    siderWidth: EditorContainer.SiderMinWidth,
    previewHeight: 0,
    viewVariables: [],
    variableModalVisible: false,
    editingVariable: null
  }

  public componentDidMount () {
    window.addEventListener('resize', this.setEditorHeight, false)
    // @FIX for this init height, 64px is the height of the hidden navigator in Main.tsx
    const editorHeight = this.editor.current.clientHeight + 64
    this.setState({
      editorHeight
    })
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.setEditorHeight, false)
  }

  public static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IEditorContainerProps, IEditorContainerStates>
  = (props, state) => {
    const { sqlDataSource } = props
    const { previewHeight } = state
    if (previewHeight === 0 && sqlDataSource.columns.length > 0) {
      return { previewHeight: 200 }
    }
    return null
  }

  public setEditorHeight = () => {
    const editorHeight = this.editor.current.clientHeight
    const { previewHeight, editorHeight: oldEditorHeight } = this.state
    const newPreviewHeight = Math.min(Math.floor(previewHeight * (editorHeight / oldEditorHeight)), editorHeight)
    this.setState({
      editorHeight,
      previewHeight: newPreviewHeight
    })
  }

  private siderResize = (_: any, { size }: IResizeCallbackData) => {
    const { width } = size
    this.setState({ siderWidth: width })
  }

  private previewResize = (_: any, { size }: IResizeCallbackData) => {
    const { height } = size
    this.setState(({ editorHeight }) => ({ previewHeight: editorHeight - height }))
  }

  private sourceSelect = (sourceId: number) => {
    const { onViewChange, onLoadSourceTables } = this.props
    onViewChange('sourceId', sourceId)
    onLoadSourceTables(sourceId)
  }

  private tableSelect = (sourceId: number, tableName: string) => {
    this.props.onLoadTableColumns(sourceId, tableName)
  }

  private addVariable = () => {
    this.setState({
      editingVariable: null,
      variableModalVisible: true
    })
  }

  private saveVariable = (variable: IViewVariable) => {
    const { viewVariables, editingVariable } = this.state
    const updatedViewVariables = [...viewVariables]
    if (!editingVariable) {
      updatedViewVariables.push({ ...variable })
    } else {
      const idx = viewVariables.findIndex((v) => v.name === variable.name)
      updatedViewVariables[idx] = { ...variable }
    }
    this.setState({
      viewVariables: updatedViewVariables,
      variableModalVisible: false
    })
  }

  private deleteVariable = (name: string) => {
    this.setState({
      viewVariables: this.state.viewVariables.filter((v) => v.name !== name)
    })
  }

  private editVariable = (variable: IViewVariable) => {
    this.setState({
      editingVariable: variable,
      variableModalVisible: true
    })
  }

  private variableNameValidate = (name: string, callback: (msg?: string) => void) => {
    const { viewVariables } = this.state
    const exists = viewVariables.findIndex((v) => v.name === name) >= 0
    exists ? callback('名称不能重复') : callback()
  }

  private closeVariableModal = () => {
    this.setState({ variableModalVisible: false })
  }

  private sqlChange = (sql: string) => {
    this.props.onViewChange('sql', sql)
  }

  private initExecuteSql = () => {
    this.executeSql()
  }

  private executeSql = (params?: Partial<IExecuteSqlParams>) => {
    const { onExecuteSql, view, sqlLimit } = this.props
    const { sourceId, sql } = view
    const updatedParams: IExecuteSqlParams = {
      sourceId,
      sql,
      limit: sqlLimit,
      ...params
    }
    onExecuteSql(updatedParams)
  }

  private cancel = () => {
    this.props.onStepChange(-1)
  }

  private nextStep = () => {
    this.props.onStepChange(1)
  }

  public render () {
    const {
      view, sources, tables, mapTableColumns, sqlDataSource, sqlLimit, loading, nextDisabled,
      onViewChange, onSetSqlLimit
    } = this.props
    const {
      editorHeight, siderWidth, previewHeight,
      viewVariables, variableModalVisible, editingVariable } = this.state
    const { execute: loadingExecute } = loading

    return (
      <>
        <div className={Styles.containerVertical}>
          <div className={Styles.sider} style={{ width: siderWidth }}>
            <Resizable
              axis="x"
              width={siderWidth}
              height={0}
              minConstraints={[EditorContainer.SiderMinWidth, 0]}
              maxConstraints={[EditorContainer.SiderMinWidth * 1.5, 0]}
              onResize={this.siderResize}
            >
              <div>
                <SourceTable
                  view={view}
                  sources={sources}
                  tables={tables}
                  mapTableColumns={mapTableColumns}
                  onViewChange={onViewChange}
                  onSourceSelect={this.sourceSelect}
                  onTableSelect={this.tableSelect}
                />
              </div>
            </Resizable>
          </div>
          <div className={Styles.containerHorizontal}>
            <div className={Styles.containerHorizontal} ref={this.editor}>
              <div className={Styles.right} style={{ height: editorHeight - previewHeight }}>
                <Resizable
                  axis="y"
                  width={0}
                  height={editorHeight - previewHeight}
                  minConstraints={[0, EditorContainer.EditorMinHeight]}
                  maxConstraints={[0, editorHeight]}
                  onResize={this.previewResize}
                >
                  <div className={Styles.containerVertical}>
                    <div className={Styles.editor}>
                      <SqlEditor
                        value={view.sql}
                        onSqlChange={this.sqlChange}
                      />
                    </div>
                    <div className={Styles.list}>
                      <ViewVariableList
                        variables={viewVariables}
                        onAdd={this.addVariable}
                        onDelete={this.deleteVariable}
                        onEdit={this.editVariable}
                      />
                    </div>
                  </div>
                </Resizable>
              </div>
              <div className={Styles.preview} style={{height: previewHeight}}>
                  <SqlPreview
                    loading={loadingExecute}
                    response={sqlDataSource}
                    onChange={this.executeSql}
                  />
              </div>
            </div>
            <Row className={Styles.bottom} type="flex" align="middle" justify="start">
              <Col span={12} className={Styles.previewInput}>
                <span>展示前</span>
                <InputNumber value={sqlLimit} onChange={onSetSqlLimit} />
                <span>条数据</span>
              </Col>
              <Col span={12} className={Styles.toolBtns}>
                <Button onClick={this.cancel}>取消</Button>
                <Button
                  type="primary"
                  disabled={loadingExecute}
                  loading={loadingExecute}
                  icon="caret-right"
                  onClick={this.initExecuteSql}
                >
                  执行
                </Button>
                <Tooltip title={nextDisabled ? '执行后下一步可用' : ''}>
                  <Button onClick={this.nextStep} disabled={nextDisabled}>
                    下一步
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </div>
        </div>
        <VariableModal
          visible={variableModalVisible}
          variable={editingVariable}
          nameValidator={this.variableNameValidate}
          onCancel={this.closeVariableModal}
          onSave={this.saveVariable}
        />
      </>
    )
  }
}

export default EditorContainer
