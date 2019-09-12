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

import * as React from 'react'

import { Form, Row, Col, Table, Input, Select, Button, Checkbox } from 'antd'
const FormItem = Form.Item
const Option = Select.Option

const utilStyles = require('assets/less/util.less')
const styles = require('../Widget.less')

interface IVariableConfigTableProps {
  form: any
  dataSource: any[]
  variableSource: any[]
  hasRelatedComponent: boolean
  chosenType: string
  isMultiple: boolean
  onAddConfigValue: () => void
  onChangeConfigValueStatus: (id: any) => any
  onUpdateConfigValue: (id: any) => any
  onDeleteConfigValue: (id: any) => any
  onChangeRelatedComponent: (status: boolean) => any
}

interface IVariableConfigTableState {
  isRelationcCtrl: boolean
}

export class VariableConfigTable extends React.Component<IVariableConfigTableProps, IVariableConfigTableState> {
  constructor (props) {
    super(props)
    this.state = {
      isRelationcCtrl: false
    }
  }
  private isRelationcCtrl = (e) => {
    this.setState({
      isRelationcCtrl: !this.state.isRelationcCtrl
    }, () => {
      this.props.onChangeRelatedComponent(this.state.isRelationcCtrl)
    })
  }

  public componentWillMount () {
    const { hasRelatedComponent } = this.props
    this.setState({
      isRelationcCtrl: hasRelatedComponent
    })
  }

  public render () {
    const {
      form,
      dataSource,
      variableSource,
      hasRelatedComponent,
      isMultiple,
      chosenType,
      onAddConfigValue,
      onChangeConfigValueStatus,
      onUpdateConfigValue,
      onDeleteConfigValue
    } = this.props

    const { getFieldDecorator } = form

    const variableOptions = variableSource.map((r) => (
      <Option key={r} value={r}>{r}</Option>
    ))

    const controlTypeOptions = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '日期选择', value: 'date' },
      { text: '日期多选', value: 'multiDate' },
      { text: '日期范围选择', value: 'dateRange' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期时间范围选择', value: 'datetimeRange' }
    ].map((o) => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))

    const columns = [{
      title: 'Text',
      dataIndex: 'text',
      render: (text, record) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${record.id}Text`, {
                rules: [{
                  required: true,
                  message: 'Text 不能为空'
                }],
                initialValue: record.text
              })(
                <Input />
              )}
            </FormItem>
          )
        }
      }
    }, {
      title: 'Value',
      dataIndex: 'value',
      render: (text, record) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${record.id}Value`, {
                rules: [{
                  required: true,
                  message: 'Value 不能为空'
                }],
                initialValue: record.value
              })(
                <Input />
              )}
            </FormItem>
          )
        }
      }
    }, {
      title: '关联变量',
      dataIndex: 'variables',
      render: (text, record, index) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${record.id}Variables`, {
                rules: [{
                  required: true,
                  message: '关联变量不能为空'
                }],
                initialValue: record.variables && record.variables.length ? record.variables : variableSource[0]
              })(
                <Select placeholder="未选择" allowClear mode="multiple">
                  {variableOptions}
                </Select>
              )}
            </FormItem>
          )
        }
      }
    }, {
      title: '操作',
      width: 200,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => {
        if (record.status) {
          return (
            <span className={styles.actions}>
              <Checkbox onChange={this.isRelationcCtrl} checked={this.state.isRelationcCtrl} disabled={!!record.status}>
                <span className={`${this.state.isRelationcCtrl ? utilStyles.highlight : utilStyles.unSelected}`}>关联控件</span>
              </Checkbox>
              <a onClick={onChangeConfigValueStatus(record.id)}>修改</a>
              <a onClick={onDeleteConfigValue(record.id)}>删除</a>
            </span>
          )
        } else {
          return (
            <span className={styles.actions}>
              <Checkbox onChange={this.isRelationcCtrl} checked={this.state.isRelationcCtrl} disabled={!!record.status}>
                <span className={`${this.state.isRelationcCtrl ? utilStyles.highlight : utilStyles.unSelected}`}>关联控件</span>
              </Checkbox>
              <a onClick={onUpdateConfigValue(record.id)}>保存</a>
              <a onClick={onDeleteConfigValue(record.id)}>删除</a>
            </span>
          )
        }
      }
    }]

    if (this.state.isRelationcCtrl === true) {
      columns.splice(3, 0, {
        title: '关联控件类别',
        dataIndex: 'variableType',
        render: (text, record, index) => {
          if (record.status) {
            return (
              <span>{text}</span>
            )
          } else {
            return (
              <FormItem className={styles.formItem}>
                {getFieldDecorator(`${record.id}VariableType`, {
                  rules: [{
                    required: true,
                    message: '关联控件类型不能为空'
                  }],
                  initialValue: record.variableType
                })(
                  <Select placeholder="未选择" allowClear>
                    {controlTypeOptions}
                  </Select>
                )}
              </FormItem>
            )
          }
        }
      })
    }
    if (chosenType === 'select' && isMultiple === true) {
      columns.splice(2, 1)
    }
    return (
      <Row className={styles.variableConfigTable}>
        <Col span={24} className={styles.addCol}>
          <Button type="primary" icon="plus" onClick={onAddConfigValue}>添加选项</Button>
        </Col>
        <Col span={24}>
          <Form>
            <Table
              dataSource={dataSource}
              columns={columns}
              rowKey="id"
              pagination={false}
            />
          </Form>
        </Col>
      </Row>
    )
  }
}

export default Form.create()(VariableConfigTable)
