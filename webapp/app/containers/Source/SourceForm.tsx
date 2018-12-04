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
import {connect} from 'react-redux'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Icon = require('antd/lib/icon')
const FormItem = Form.Item
const Option = Select.Option
const utilStyles = require('../../assets/less/util.less')

interface ISourceFormProps {
  projectId: number
  type: string
  testLoading: boolean
  form: any
  onTestSourceConnection: () => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class SourceForm extends React.PureComponent<ISourceFormProps, {}> {

  public checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, type, projectId, form } = this.props
    const { id } = form.getFieldsValue()

    const data = {
      projectId,
      id: type === 'add' ? '' : id,
      name: value
    }
    if (!value) {
      callback()
    }
    onCheckUniqueName('source', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  public render () {
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
            <FormItem label="名称" {...commonFormItemStyle} hasFeedback>
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
                initialValue: 'jdbc'
              })(
                <Select>
                  <Option value="jdbc">JDBC</Option>
                  <Option value="csv">CSV文件</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="用户名" {...commonFormItemStyle}>
              {getFieldDecorator('user', {
                // rules: [{
                //   required: true,
                //   message: 'User 不能为空'
                // }],
                initialValue: ''
              })(
                <Input placeholder="User" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="密码" {...commonFormItemStyle}>
              {getFieldDecorator('password', {
                // rules: [{
                //   required: true,
                //   message: 'Password 不能为空'
                // }],
                initialValue: ''
              })(
                <Input placeholder="Password" type="password" />
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

export default Form.create()(SourceForm)

