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

import { IViewVariable, IViewModelProps, IViewModel, IExecuteSqlResponse, IViewRoleAuth } from '../types'
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
  onModelChange: (partialModel: IViewModel) => void
  onStepChange: (stepChange: number) => void
}

interface IModelAuthStates {
  modalVisible: boolean
}

export class ModelAuth extends React.Component<IModelAuthProps, IModelAuthStates> {

  public state: Readonly<IModelAuthStates> = {
    modalVisible: false
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

  private setColumnAuth = (roleAuth: IViewRoleAuth) => () => {
    this.setState({
      modalVisible: true

    })
  }

  private getAuthTableColumns = memoizeOne((model: IViewModel, variables: IViewVariable[]) => {
    const columns: Array<ColumnProps<any>> = variables.map((variable) => ({
      title: variable.name
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

  private getAuthDatasource = memoizeOne((roles: any[], variables: IViewVariable[]) => {
    if (!Array.isArray(roles)) { return [] }

    const authDatasource = roles.map<IViewRoleAuth>((role) => {
      const { id: roleId, name: roleName, description: roleDesc } = role
      return {
        roleId,
        roleName,
        roleDesc,
        columnAuth: [],
        rowAuth: []
      }
    })
    return authDatasource
  })

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

  private saveModelAuth = (auth: string[]) => {

  }

  private cancelModelAuth = () => {
    this.setState({ modalVisible: false })
  }

  public render () {
    const { visible, model, variable, sqlColumns, roles, onModelChange } = this.props
    const { modalVisible } = this.state
    const modelDatasource = Object.entries(model).map(([name, value]) => ({ name, ...value }))
    const authColumns = this.getAuthTableColumns(model, variable)
    const authDatasource = this.getAuthDatasource(roles, variable)
    const styleCls = classnames({
      [Styles.containerHorizontal]: true,
      [Styles.modelAuth]: true
    })
    const style = visible ? {} : { display: 'none' }

    return (
      <div className={styleCls} style={style}>
        <div className={Styles.containerHorizontal}>
          <Tabs defaultActiveKey="model">
            <TabPane tab="Model" key="model">
              <Table bordered pagination={false} rowKey="name" dataSource={modelDatasource}>
                <Column title="字段名称" dataIndex="name" />
                <Column title="数据类型" dataIndex="modelType" render={this.renderColumnModelType} />
                <Column title="可视化类型" dataIndex="visualType" render={this.renderColumnVisualType} />
              </Table>
            </TabPane>
            <TabPane tab="Auth" key="auth">
              <Table
                bordered
                rowKey="roleId"
                pagination={false}
                columns={authColumns}
                dataSource={authDatasource}
              />
              <ModelAuthModal
                visible={modalVisible}
                model={model}
                auth={[]}
                onSave={this.saveModelAuth}
                onCancel={this.cancelModelAuth}
              />
            </TabPane>
          </Tabs>
        </div>
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
