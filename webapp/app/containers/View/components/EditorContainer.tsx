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
import memoizeOne from 'memoize-one'

import { ISource, ISourceTable, IMapTableColumns } from 'containers/source/types'
import {
  IViewVariable, IView,
  IExecuteSqlResponse, IViewLoading,
  IDacChannel, IDacTenant, IDacBiz
} from '../types'

import { uuid } from 'utils/util'
import { InputNumber, Button, Row, Col, Tooltip } from 'antd'
import Resizable, { IResizeCallbackData } from 'libs/react-resizable/lib/Resizable'
import SourceTable from './SourceTable'
import SqlEditor from './SqlEditor'
import ViewVariableList from './ViewVariableList'
import VariableModal from './VariableModal'
import SqlPreview from './SqlPreview'

import Styles from '../View.less'

interface IEditorContainerProps {
  visible: boolean
  view: IView
  variable: IViewVariable[]
  sources: ISource[],
  tables: ISourceTable[],
  mapTableColumns: IMapTableColumns
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  loading: IViewLoading
  nextDisabled: boolean

  channels: IDacChannel[]
  tenants: IDacTenant[]
  bizs: IDacBiz[]

  onLoadSourceTables: (sourceId: number) => void
  onLoadTableColumns: (sourceId: number, tableName: string) => void
  onSetSqlLimit: (limit: number) => void
  onExecuteSql: () => void
  onVariableChange: (variable: IViewVariable[]) => void
  onStepChange: (stepChange: number) => void
  onViewChange: (propName: keyof(IView), value: string | number) => void

  onLoadDacTenants: (channelName: string) => void
  onLoadDacBizs: (channelName: string, tenantId: number) => void
}

interface IEditorContainerStates {
  editorHeight: number
  siderWidth: number
  previewHeight: number
  variableModalVisible: boolean
  editingVariable: IViewVariable
}

export class EditorContainer extends React.Component<IEditorContainerProps, IEditorContainerStates> {

  private editor = React.createRef<HTMLDivElement>()
  public static SiderMinWidth = 250
  public static EditorMinHeight = 100
  public static DefaultPreviewHeight = 300

  public state: Readonly<IEditorContainerStates> = {
    editorHeight: 0,
    siderWidth: EditorContainer.SiderMinWidth,
    previewHeight: EditorContainer.DefaultPreviewHeight,
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

  private saveVariable = (updatedVariable: IViewVariable) => {
    const { variable, onVariableChange } = this.props
    const updatedViewVariables = [...variable]
    if (!updatedVariable.key) {
      updatedVariable.key = uuid(5)
      updatedViewVariables.push(updatedVariable)
    } else {
      const idx = variable.findIndex((v) => v.key === updatedVariable.key)
      updatedViewVariables[idx] = updatedVariable
    }
    onVariableChange(updatedViewVariables)
    this.setState({
      variableModalVisible: false
    })
  }

  private deleteVariable = (key: string) => {
    const { variable, onVariableChange } = this.props
    const updatedViewVariables = variable.filter((v) => v.key !== key)
    onVariableChange(updatedViewVariables)
  }

  private editVariable = (variable: IViewVariable) => {
    this.setState({
      editingVariable: variable,
      variableModalVisible: true
    })
  }

  private variableNameValidate = (key: string, name: string, callback: (msg?: string) => void) => {
    const { variable } = this.props
    const existed = variable.findIndex((v) => ((!key || v.key !== key) && v.name === name)) >= 0
    if (existed) {
      callback('名称不能重复')
      return
    }
    callback()
  }

  private closeVariableModal = () => {
    this.setState({ variableModalVisible: false })
  }

  private sqlChange = (sql: string) => {
    this.props.onViewChange('sql', sql)
  }

  private cancel = () => {
    this.props.onStepChange(-1)
  }

  private nextStep = () => {
    this.props.onStepChange(1)
  }

  private getSqlHints = memoizeOne((tables: string[], mapTableColumns: IMapTableColumns, variables: IViewVariable[]) => {
    const variableHints = variables.reduce((acc, v) => {
      acc[`$${v.name}$`] = []
      return acc
    }, {})
    const hints = tables.reduce((acc, tableName) => {
      acc[tableName] = !mapTableColumns[tableName] ? [] : mapTableColumns[tableName].columns.map((c) => c.name)
      return acc
    }, variableHints)
    return hints
  })

  public render () {
    const {
      visible, view, variable, sources, tables, mapTableColumns, sqlDataSource, sqlLimit, loading, nextDisabled,
      channels, tenants, bizs,
      onViewChange, onSetSqlLimit, onExecuteSql, onLoadDacTenants, onLoadDacBizs
    } = this.props
    const {
      editorHeight, siderWidth, previewHeight,
      variableModalVisible, editingVariable } = this.state
    const { execute: loadingExecute } = loading
    const style = visible ? {} : { display: 'none' }
    const hints = this.getSqlHints(tables, mapTableColumns, variable)

    return (
      <>
        <div className={Styles.containerVertical} style={style}>
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
                        hints={hints}
                        onSqlChange={this.sqlChange}
                      />
                    </div>
                    <div className={Styles.list}>
                      <ViewVariableList
                        variables={variable}
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
                    size="small"
                    loading={loadingExecute}
                    response={sqlDataSource}
                    height={previewHeight}
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
                  onClick={onExecuteSql}
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

          channels={channels}
          tenants={tenants}
          bizs={bizs}

          onCancel={this.closeVariableModal}
          onSave={this.saveVariable}

          onLoadDacTenants={onLoadDacTenants}
          onLoadDacBizs={onLoadDacBizs}
        />
      </>
    )
  }
}

export default EditorContainer
