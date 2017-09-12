/*-
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

import React, { PropTypes, Component } from 'react'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Button from 'antd/lib/button'
const FormItem = Form.Item
const Option = Select.Option

import utilStyles from '../../assets/less/util.less'
import styles from './Widget.less'

export class VariableConfigTable extends Component {
  render () {
    const {
      form,
      dataSource,
      variableSource,
      onAddConfigValue,
      onChangeConfigValueStatus,
      onUpdateConfigValue,
      onDeleteConfigValue
    } = this.props

    const { getFieldDecorator } = form

    const variableOptions = variableSource.map(r => (
      <Option key={r} value={r}>{r}</Option>
    ))

    const controlTypeOptions = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '单选下拉菜单', value: 'select' },
      { text: '多选下拉菜单', value: 'multiSelect' },
      { text: '日期选择', value: 'date' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期范围选择', value: 'dateRange' },
      { text: '日期时间范围选择', value: 'datetimeRange' }
    ].map(o => (
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
    }, {
      title: '关联',
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
                initialValue: record.variables
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
      width: 80,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => {
        if (record.status) {
          return (
            <span className={styles.actions}>
              <a onClick={onChangeConfigValueStatus(record.id)}>修改</a>
              <a onClick={onDeleteConfigValue(record.id)}>删除</a>
            </span>
          )
        } else {
          return (
            <span className={styles.actions}>
              <a onClick={onUpdateConfigValue(record.id)}>保存</a>
              <a onClick={onDeleteConfigValue(record.id)}>删除</a>
            </span>
          )
        }
      }
    }]

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

VariableConfigTable.propTypes = {
  form: PropTypes.any,
  dataSource: PropTypes.array,
  variableSource: PropTypes.array,
  onAddConfigValue: PropTypes.func,
  onChangeConfigValueStatus: PropTypes.func,
  onUpdateConfigValue: PropTypes.func,
  onDeleteConfigValue: PropTypes.func
}

export default Form.create({withRef: true})(VariableConfigTable)
