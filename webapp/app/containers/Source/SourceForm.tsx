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
import { ISourceFormValues } from './types'

import { Modal, Form, Row, Col, Button, Input, Select, Icon, Cascader } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form/Form'
import { CascaderOptionType } from 'antd/lib/cascader'

const utilStyles = require('assets/less/util.less')

interface ISourceFormProps {
  visible: boolean
  formLoading: boolean
  testLoading: boolean
  source: ISourceFormValues
  datasourcesInfo: CascaderOptionType[]
  onSave: (values: any) => void
  onClose: () => void
  onTestSourceConnection: (username: string, password: string, jdbcUrl: string, ext: boolean, version: string) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class SourceForm extends React.PureComponent<ISourceFormProps & FormComponentProps> {

  private commonFormItemStyle = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
  }

  public componentDidUpdate (prevProps: ISourceFormProps & FormComponentProps) {
    const { form, source, visible } = this.props
    if (source !== prevProps.source || visible !== prevProps.visible) {
      form.setFieldsValue(source)
    }
  }

  public checkNameUnique = (rule, name = '', callback) => {
    const { onCheckUniqueName, source } = this.props
    const { id, projectId } = source

    const data = { id, name, projectId }
    if (!name) {
      callback()
    }
    onCheckUniqueName('source', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private testSourceConnection = () => {
    const { datasourceInfo, config } = this.props.form.getFieldsValue() as ISourceFormValues
    const { username, password, url } = config
    const version = datasourceInfo[1] === 'Default' ? '' : (datasourceInfo[1] || '')
    this.props.onTestSourceConnection(
      username,
      password,
      url,
      !!version,
      version
    )
  }

  private save = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSave(values)
      }
    })
  }

  private reset = () => {
    this.props.form.resetFields()
  }

  private datasourcesInfoDisplayRender = (label) => label.join(' : ')

  public render () {
    const {
      source,
      datasourcesInfo,
      visible,
      formLoading,
      testLoading,
      form,
      onClose
    } = this.props
    if (!source) { return null }
    const { id: sourceId } = source
    const { getFieldDecorator } = form

    const modalButtons = ([(
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={this.save}
      >
        保 存
      </Button>),
      (
      <Button
        key="back"
        size="large"
        onClick={onClose}
      >
        取 消
      </Button>)
    ])

    return (
      <Modal
        title={`${!sourceId ? '新增' : '修改'} Source`}
        wrapClassName="ant-modal-small"
        maskClosable={false}
        visible={visible}
        footer={modalButtons}
        onCancel={onClose}
        afterClose={this.reset}
      >
        <Form>
          <Row gutter={8}>
            <Col span={24}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator<ISourceFormValues>('id')(
                  <Input />
                )}
              </FormItem>
              <FormItem label="名称" {...this.commonFormItemStyle} hasFeedback>
                {getFieldDecorator<ISourceFormValues>('name', {
                  rules: [{
                    required: true,
                    message: '名称不能为空'
                  }, {
                    validator: this.checkNameUnique
                  }]
                })(
                  <Input autoComplete="off" placeholder="Name" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="类型" {...this.commonFormItemStyle}>
                {getFieldDecorator<ISourceFormValues>('type', {
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
              <FormItem label="数据库" {...this.commonFormItemStyle}>
                {getFieldDecorator<ISourceFormValues>('datasourceInfo', {
                  initialValue: []
                })(
                  <Cascader
                    options={datasourcesInfo}
                    displayRender={this.datasourcesInfoDisplayRender}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="用户名" {...this.commonFormItemStyle}>
                {getFieldDecorator('config.username', {
                  initialValue: ''
                })(
                  <Input autoComplete="off" placeholder="User" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="密码" {...this.commonFormItemStyle}>
                {getFieldDecorator('config.password', {
                  initialValue: ''
                })(
                  <Input autoComplete="off" placeholder="Password" type="password" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="连接Url" {...this.commonFormItemStyle}>
                {getFieldDecorator('config.url', {
                  rules: [{
                    required: true,
                    message: 'Url 不能为空'
                  }],
                  initialValue: ''
                })(
                  <Input
                    placeholder="Connection Url"
                    autoComplete="off"
                    addonAfter={
                      testLoading
                        ? <Icon type="loading" />
                        : <span onClick={this.testSourceConnection} style={{cursor: 'pointer'}}>点击测试</span>
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="描述" {...this.commonFormItemStyle}>
                {getFieldDecorator('description', {
                  initialValue: ''
                })(
                  <TextArea
                    placeholder="Description"
                    autosize={{minRows: 2, maxRows: 6}}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="配置信息" {...this.commonFormItemStyle}>
                {getFieldDecorator('config.parameters', {
                  initialValue: ''
                })(
                  <TextArea
                    placeholder="Config"
                    autosize={{minRows: 2, maxRows: 6}}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<ISourceFormProps & FormComponentProps>()(SourceForm)

