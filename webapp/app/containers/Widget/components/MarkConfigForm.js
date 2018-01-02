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

import React, { PropTypes, Component } from 'react'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
const FormItem = Form.Item

import utilStyles from '../../../assets/less/util.less'
import styles from '../Widget.less'

export class MarkConfigForm extends Component {
  render () {
    const {
      form,
      dataSource,
      configOptions,
      onAddConfigValue,
      onChangeConfigValueStatus,
      onUpdateConfigValue,
      onDeleteConfigValue,
      onSaveConfigValue,
      onCancel,
      isCanSaveForm
    } = this.props

    const { getFieldDecorator } = form
    let columns = configOptions ? configOptions.map(config => ({
      title: config.title,
      dataIndex: config.dataIndex,
      render: (text, record) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${record.id}${config.title}`, {
                rules: [{
                  required: true,
                  message: `${config.title}不能为空`
                }],
                initialValue: record[config['dataIndex']]
              })(
                <Input />
                )}
            </FormItem>
          )
        }
      }
    })) : []
    let operating = {
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
    }
    columns.push(operating)
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
        <Col span={24} style={{marginTop: '10px'}}>
          <div className={styles.addCol}>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" disabled={isCanSaveForm} onClick={onSaveConfigValue} style={{marginLeft: '10px'}} >保存</Button>
          </div>
        </Col>
      </Row>
    )
  }
}

MarkConfigForm.propTypes = {
  form: PropTypes.any,
  dataSource: PropTypes.array,
  configOptions: PropTypes.array,
  onAddConfigValue: PropTypes.func,
  onChangeConfigValueStatus: PropTypes.func,
  onUpdateConfigValue: PropTypes.func,
  onDeleteConfigValue: PropTypes.func,
  onSaveConfigValue: PropTypes.func,
  onCancel: PropTypes.func,
  isCanSaveForm: PropTypes.bool
}

export default Form.create()(MarkConfigForm)
