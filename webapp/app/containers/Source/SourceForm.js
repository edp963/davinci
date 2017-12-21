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

import React, { PropTypes } from 'react'
import {connect} from 'react-redux'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Icon from 'antd/lib/icon'
const FormItem = Form.Item
const Option = Select.Option
import {checkNameAction} from '../App/actions'

import utilStyles from '../../assets/less/util.less'

export class SourceForm extends React.PureComponent {

  checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    let idName = type === 'add' ? '' : id
    let typeName = 'source'
    onCheckName(idName, value, typeName,
      res => {
        callback()
      }, err => {
        callback(err)
      })
  }
  render () {
    const { testLoading, form, onTestSourceConnection } = this.props
    const { getFieldDecorator } = form

    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    return (
      <Form>
        <Row gutter={8}>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="名称" {...commonFormItemStyle}>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: 'Name 不能为空'
                }, {
                  validator: this.checkNameUnique
                }]
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="类型" {...commonFormItemStyle}>
              {getFieldDecorator('type', {
                initialValue: 'moonbox'
              })(
                <Select>
                  <Option value="moonbox">Moonbox</Option>
                  <Option value="jdbc">JDBC</Option>
                  <Option value="csv">CSV文件</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="用户名" {...commonFormItemStyle}>
              {getFieldDecorator('user', {
                rules: [{
                  required: true,
                  message: 'User 不能为空'
                }],
                initialValue: ''
              })(
                <Input placeholder="User" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="密码" {...commonFormItemStyle}>
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: 'Password 不能为空'
                }],
                initialValue: ''
              })(
                <Input placeholder="Password" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="连接Url" {...commonFormItemStyle}>
              {getFieldDecorator('url', {
                rules: [{
                  required: true,
                  message: 'Url 不能为空'
                }],
                initialValue: ''
              })(
                <Input
                  placeholder="Connection Url"
                  addonAfter={
                    testLoading
                      ? <Icon type="loading" />
                      : <span onClick={onTestSourceConnection} style={{cursor: 'pointer'}}>点击测试</span>
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="描述" {...commonFormItemStyle}>
              {getFieldDecorator('desc', {
                initialValue: ''
              })(
                <Input
                  placeholder="Description"
                  type="textarea"
                  autosize={{minRows: 2, maxRows: 6}}
                />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="配置信息" {...commonFormItemStyle}>
              {getFieldDecorator('config', {
                initialValue: ''
              })(
                <Input
                  placeholder="Config"
                  type="textarea"
                  autosize={{minRows: 2, maxRows: 6}}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

SourceForm.propTypes = {
  type: PropTypes.string,
  testLoading: PropTypes.bool,
  form: PropTypes.any,
  onTestSourceConnection: PropTypes.func,
  onCheckName: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default Form.create()(connect(null, mapDispatchToProps)(SourceForm))
