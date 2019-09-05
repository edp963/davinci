import React from 'react'
import classnames from 'classnames'
import memoizeOne from 'memoize-one'
import { Table, Tabs, Radio, Checkbox, Select, Row, Col, Button, Tag, Tooltip, Icon } from 'antd'
const { Column } = Table
const { TabPane } = Tabs
const RadioGroup = Radio.Group
const { Option } = Select
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { TableProps, ColumnProps } from 'antd/lib/table'

import { IViewVariable, IViewModelProps, IViewModel, IExecuteSqlResponse, IViewRole, IViewRoleRowAuth } from '../types'
import {
  ViewModelTypesLocale,
  ViewVariableValueTypes,
  ViewModelVisualTypesLocale,
  ViewVariableTypes
} from '../constants'

import OperatorTypes from 'utils/operatorTypes'
import ConditionValuesControl, { ConditionValueTypes } from 'components/ConditionValuesControl'
import ModelAuthModal from './ModelAuthModal'
import Styles from '../View.less'

interface IViewRoleRowAuthConverted {
  name: string
  values: Array<string | number | boolean>
  enable: boolean
  variable: IViewVariable
}

interface IViewRoleConverted {
  roleId: number
  roleName: string
  roleDesc: string
  columnAuth: string[]
  rowAuthConverted: {
    [variableName: string]: IViewRoleRowAuthConverted
  }
}

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

  private setColumnAuth = (viewRole: IViewRoleConverted) => () => {
    const { roleId, columnAuth } = viewRole
    const { model } = this.props
    this.setState({
      modalVisible: true,
      selectedRoleId: roleId,
      selectedColumnAuth: columnAuth.filter((column) => !!model[column])
    })
  }

  private rowAuthCheckedChange = (roleId: number, rowAuthConverted: IViewRoleRowAuthConverted) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked
    const { name, values } = rowAuthConverted
    const updatedRoleAuth: IViewRoleRowAuth = {
      name,
      values,
      enable: checked
    }
    this.viewRoleChange(roleId, updatedRoleAuth)
  }

  private rowAuthValuesChange = (roleId: number, rowAuthConverted: IViewRoleRowAuthConverted) => (values: Array<string | number | boolean>) => {
    const { name, enable } = rowAuthConverted
    const updatedRoleAuth: IViewRoleRowAuth = {
      name,
      values,
      enable
    }
    this.viewRoleChange(roleId, updatedRoleAuth)
  }

  private viewRoleChange = (roleId: number, updatedRoleAuth: IViewRoleRowAuth) => {
    const { onViewRoleChange, viewRoles } = this.props
    let viewRole = viewRoles.find((v) => v.roleId === roleId)
    if (!viewRole) {
      viewRole = {
        roleId,
        columnAuth: [],
        rowAuth: [updatedRoleAuth]
      }
    } else {
      const variableIdx = viewRole.rowAuth.findIndex((auth) => auth.name === updatedRoleAuth.name)
      if (variableIdx < 0) {
        viewRole.rowAuth.push(updatedRoleAuth)
      } else {
        viewRole.rowAuth[variableIdx].values = updatedRoleAuth.values
        viewRole.rowAuth[variableIdx].enable = updatedRoleAuth.enable
      }
    }
    onViewRoleChange({ ...viewRole })
  }

  private getAuthTableColumns = memoizeOne((model: IViewModel, variables: IViewVariable[]) => {
    const columnsChildren = variables
      .filter((v) => (v.type === ViewVariableTypes.Authorization && !v.fromService))
      .map<ColumnProps<IViewRoleConverted>>((variable) => ({
        title: `${variable.alias || variable.name}`,
        dataIndex: 'rowAuthConverted',
        width: 250,
        render: (_, record: IViewRoleConverted) => {
          const { name: variableName, valueType } = variable
          const { roleId, rowAuthConverted } = record
          const { values: rowAuthValues, enable } = rowAuthConverted[variableName]
          const operatorType = (valueType === ViewVariableValueTypes.Boolean ? OperatorTypes.Equal : OperatorTypes.In)
          return (
            <div className={Styles.cellVarValue}>
              <Tooltip title={enable ? '禁用' : '启用'}>
                <Checkbox
                  checked={enable}
                  className={Styles.cellVarCheckbox}
                  onChange={this.rowAuthCheckedChange(roleId, rowAuthConverted[variableName])}
                />
              </Tooltip>
              {enable && (
                <ConditionValuesControl
                  className={Styles.cellVarInput}
                  size="default"
                  visualType={valueType}
                  operatorType={operatorType}
                  conditionValues={rowAuthValues}
                  onChange={this.rowAuthValuesChange(roleId, rowAuthConverted[variableName])}
                />
              )}
            </div>
          )
        }
      }))
    const columns: Array<ColumnProps<IViewRoleConverted>> = [{
      title: '角色',
      dataIndex: 'roleName',
      width: 300,
      render: (roleName: string, record: IViewRoleConverted) => (
        <span>
          {roleName}
          {record.roleDesc && (
            <Tooltip title={record.roleDesc}>
              <Icon className={Styles.cellIcon} type="info-circle" />
            </Tooltip>
          )}
        </span>
      )
    }]
    if (columnsChildren.length > 0) {
      columns.push({
        title: '权限变量值设置',
        children: columnsChildren
      })
    }
    columns.push({
      title: '可见字段',
      dataIndex: 'columnAuth',
      width: 120,
      render: (columnAuth: string[], record) => {
        if (columnAuth.length === 0) {
          return (<Tag onClick={this.setColumnAuth(record)}>全部可见</Tag>)
        }
        if (columnAuth.length === Object.keys(model).length) {
          return (<Tag onClick={this.setColumnAuth(record)} color="#f50">不可见</Tag>)
        }
        return (<Tag color="green" onClick={this.setColumnAuth(record)}>部分可见</Tag>)
      }
    })
    return columns
  })

  private getAuthTableScroll = memoizeOne((columns: Array<ColumnProps<any>>) => {
    const scroll: TableProps<any>['scroll'] = {}
    const columnsTotalWidth = columns.reduce((acc, c) => acc + (c.width as number), 0)
    scroll.x = columnsTotalWidth
    return scroll
  })

  private getAuthDatasource = (roles: any[], varibles: IViewVariable[], viewRoles: IViewRole[]) => {
    if (!Array.isArray(roles)) { return [] }

    const authDatasource = roles.map<IViewRoleConverted>((role) => {
      const { id: roleId, name: roleName, description: roleDesc } = role
      const viewRole = viewRoles.find((v) => v.roleId === roleId)
      const columnAuth = viewRole ? viewRole.columnAuth : []
      const rowAuthConverted = varibles.reduce<IViewRoleConverted['rowAuthConverted']>((obj, variable) => {
        const { name: variableName, type, fromService } = variable
        if (type === ViewVariableTypes.Query) { return obj }
        if (type === ViewVariableTypes.Authorization && fromService) { return obj }

        const authIdx = viewRole ? viewRole.rowAuth.findIndex((auth) => auth.name === variableName) : -1
        obj[variableName] = {
          name: variableName,
          values: [],
          enable: false,
          variable
        }
        if (authIdx >= 0) {
          const { enable, values } = viewRole.rowAuth[authIdx]
          obj[variableName] = {
            ...obj[variableName],
            enable,
            values
          }
        }
        return obj
      }, {})
      return {
        roleId,
        roleName,
        roleDesc,
        columnAuth,
        rowAuthConverted
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
    const { onViewRoleChange, viewRoles } = this.props
    const { selectedRoleId } = this.state
    let viewRole = viewRoles.find((v) => v.roleId === selectedRoleId)
    if (!viewRole) {
      viewRole = {
        roleId: selectedRoleId,
        columnAuth,
        rowAuth: []
      }
    } else {
      viewRole = {
        ...viewRole,
        columnAuth
      }
    }
    onViewRoleChange(viewRole)
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
    const authScroll = this.getAuthTableScroll(authColumns)
    const authDatasource = this.getAuthDatasource(roles, variable, viewRoles)
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
                scroll={authScroll}
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
            <Button onClick={this.stepChange(-2)}>取消</Button>
            <Button onClick={this.stepChange(1)}>保存</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ModelAuth
