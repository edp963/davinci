import React from 'react'
import classnames from 'classnames'
import memoizeOne from 'memoize-one'
import { Table, Tabs, Radio, Select, Row, Col, Button, Tag } from 'antd'
const { Column } = Table
const { TabPane } = Tabs
const RadioGroup = Radio.Group
const { Option } = Select
import { RadioChangeEvent } from 'antd/lib/radio'
import { ColumnProps } from 'antd/lib/table'

import { IViewVariable, IViewModelProps, IViewModel, IExecuteSqlResponse, IViewRole } from '../types'
import {
  ViewModelTypes,
  ViewModelVisualTypes,
  ViewModelTypesLocale,
  ModelTypeSqlTypeSetting,
  ViewModelVisualTypesLocale,
  VisualTypeSqlTypeSetting
} from '../constants'

import ModelAuthModal from './ModelAuthModal'
import Styles from '../View.less'

interface IModelAuthProps {
  visible: boolean
  model: IViewModel
  variable: IViewVariable[]
  sqlColumns: IExecuteSqlResponse['columns']
  roles: any[] // @FIXME role typing
  viewRoles: IViewRole[]
  onModelChange: (partialModel: IViewModel) => void
  onViewRoleChange: (viewRole: IViewRole) => void
  onStepChange: (stepChange: number) => void
}

interface IModelAuthStates {
  modalVisible: boolean
  selectedRoleId: number
  selectedColumnAuth: string[]
}

export class ModelAuth extends React.PureComponent<IModelAuthProps, IModelAuthStates> {

  public state: Readonly<IModelAuthStates> = {
    modalVisible: false,
    selectedRoleId: 0,
    selectedColumnAuth: []
  }

  private modelTypeOptions = Object.entries(ViewModelTypesLocale).map(([value, label]) => ({
    label,
    value
  }))

  private visualTypeOptions = Object.entries(ViewModelVisualTypesLocale).map(([visualType, text]) => (
    <Option key={visualType} value={visualType}>{text}</Option>
  ))

  private modelChange = (record: IViewModelProps, propName: keyof IViewModelProps) => (e: RadioChangeEvent | string) => {
    const value: string = (e as RadioChangeEvent).target ? (e as RadioChangeEvent).target.value : e
    const { name, ...rest } = record
    const partialModel: IViewModel = {
      [name]: {
        ...rest,
        [propName]: value
      }
    }
    this.props.onModelChange(partialModel)
  }

  private stepChange = (step: number) => () => {
    this.props.onStepChange(step)
  }

  private setColumnAuth = (viewRole: IViewRole) => () => {
    const { roleId, columnAuth } = viewRole
    const { model } = this.props
    this.setState({
      modalVisible: true,
      selectedRoleId: roleId,
      selectedColumnAuth: columnAuth.filter((column) => !!model[column])
    })
  }

  private getAuthTableColumns = memoizeOne((model: IViewModel, variables: IViewVariable[]) => {
    const columns: Array<ColumnProps<any>> = variables.map((variable) => ({
      title: variable.alias || variable.name
    }))
    columns.unshift({
      title: '角色',
      dataIndex: 'roleName'
    }, {
      title: '描述',
      dataIndex: 'roleDesc'
    })
    columns.push({
      title: '可见字段',
      dataIndex: 'columnAuth',
      render: (columnAuth: string[], record) => {
        if (columnAuth.length === 0) {
          return (<Tag onClick={this.setColumnAuth(record)} color="#f50">不可见</Tag>)
        }
        if (columnAuth.length === Object.keys(model).length) {
          return (<Tag onClick={this.setColumnAuth(record)}>全部可见</Tag>)
        }
        return (<Tag color="green" onClick={this.setColumnAuth(record)}>部分可见</Tag>)
      }
    })
    return columns
  })

  private getAuthDatasource = (roles: any[], viewRoles: IViewRole[]) => {
    if (!Array.isArray(roles)) { return [] }

    const authDatasource = roles.map<IViewRole>((role) => {
      const { id: roleId, name: roleName, description: roleDesc } = role
      let columnAuth = []
      let rowAuth = []
      const viewRole = viewRoles.find((v) => v.roleId === roleId)
      if (viewRole) {
        columnAuth = viewRole.columnAuth
        rowAuth = viewRole.rowAuth
      }
      return {
        roleId,
        roleName,
        roleDesc,
        columnAuth,
        rowAuth
      }
    })
    return authDatasource
  }

  private renderColumnModelType = (text: string, record) => (
    <RadioGroup
      options={this.modelTypeOptions}
      value={text}
      onChange={this.modelChange(record, 'modelType')}
    />
  )

  private renderColumnVisualType = (text: string, record) => (
    <Select
      className={Styles.tableControl}
      value={text}
      onChange={this.modelChange(record, 'visualType')}
    >
      {this.visualTypeOptions}
    </Select>
  )

  private saveModelAuth = (columnAuth: string[]) => {
    const { onViewRoleChange, roles, viewRoles } = this.props
    const { selectedRoleId } = this.state
    const authDatasource = this.getAuthDatasource(roles, viewRoles)
    const viewRole = authDatasource.find((v) => v.roleId === selectedRoleId)
    onViewRoleChange({
      ...viewRole,
      columnAuth
    })
    this.closeModelAuth()
  }

  private closeModelAuth = () => {
    this.setState({ modalVisible: false })
  }

  public render () {
    const { visible, model, variable, viewRoles, sqlColumns, roles, onModelChange } = this.props
    const { modalVisible, selectedColumnAuth, selectedRoleId } = this.state
    const modelDatasource = Object.entries(model).map(([name, value]) => ({ name, ...value }))
    const authColumns = this.getAuthTableColumns(model, variable)
    const authDatasource = this.getAuthDatasource(roles, viewRoles)
    const styleCls = classnames({
      [Styles.containerHorizontal]: true,
      [Styles.modelAuth]: true
    })
    const style = visible ? {} : { display: 'none' }

    return (
      <div className={styleCls} style={style}>
        <Tabs defaultActiveKey="model" className={Styles.authTab}>
          <TabPane tab="Model" key="model">
            <div className={Styles.authTable}>
              <Table bordered pagination={false} rowKey="name" dataSource={modelDatasource}>
                <Column title="字段名称" dataIndex="name" />
                <Column title="数据类型" dataIndex="modelType" render={this.renderColumnModelType} />
                <Column title="可视化类型" dataIndex="visualType" render={this.renderColumnVisualType} />
              </Table>
            </div>
          </TabPane>
          <TabPane tab="Auth" key="auth">
            <div className={Styles.authTable}>
              <Table
                bordered
                rowKey="roleId"
                pagination={false}
                columns={authColumns}
                dataSource={authDatasource}
              />
            </div>
            <ModelAuthModal
              visible={modalVisible}
              model={model}
              roleId={selectedRoleId}
              auth={selectedColumnAuth}
              onSave={this.saveModelAuth}
              onCancel={this.closeModelAuth}
            />
          </TabPane>
        </Tabs>
        <Row className={Styles.bottom} type="flex" align="middle" justify="end">
          <Col span={12} className={Styles.toolBtns}>
            <Button type="primary" onClick={this.stepChange(-1)}>上一步</Button>
            <Button>取消</Button>
            <Button onClick={this.stepChange(1)}>保存</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ModelAuth
