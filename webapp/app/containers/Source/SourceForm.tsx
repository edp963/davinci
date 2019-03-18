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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { ISource } from '.'

import { Modal, Form, Row, Col, Button, Input, Select, Icon } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option

import { setSourceFormValue } from './actions'
import { makeSelectSourceFormValues } from './selectors'
const utilStyles = require('../../assets/less/util.less')

interface ISourceFormProps {
  projectId: number
  type: string
  visible: boolean
  formLoading: boolean
  testLoading: boolean
  form: any
  sourceFormValues: ISource
  onSave: (values: any) => void
  onClose: () => void
  onAfterClose: () => void
  onTestSourceConnection: (username: string, password: string, jdbcUrl: string) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onSetSourceFormValue: (changedValues: ISource) => void
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

  private testSourceConnection = () => {
    const { username, password, jdbcUrl } = this.props.form.getFieldsValue()
    this.props.onTestSourceConnection(username, password, jdbcUrl)
  }

  private save = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSave(values)
      }
    })
  }

  private reset = () => {
    const { form, onAfterClose } = this.props
    form.resetFields()
    onAfterClose()
  }

  public render () {
    const {
      type,
      visible,
      formLoading,
      testLoading,
      form,
      onClose
    } = this.props
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

    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    return (
      <Modal
        title={`${type === 'add' ? '新增' : '修改'} Source`}
        wrapClassName="ant-modal-small"
        visible={visible}
        footer={modalButtons}
        onCancel={onClose}
        afterClose={this.reset}
      >
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
                {getFieldDecorator('username', {
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
                {getFieldDecorator('jdbcUrl', {
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
                        : <span onClick={this.testSourceConnection} style={{cursor: 'pointer'}}>点击测试</span>
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="描述" {...commonFormItemStyle}>
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
              <FormItem label="配置信息" {...commonFormItemStyle}>
                {getFieldDecorator('config', {
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

const formOptions = {
  onValuesChange (props: ISourceFormProps, values) {
    const { sourceFormValues, onSetSourceFormValue } = props
    onSetSourceFormValue({
      ...sourceFormValues,
      ...values
    })
  },
  mapPropsToFields (props: ISourceFormProps) {
    return Object.entries(props.sourceFormValues)
      .reduce((result, [key, value]) => {
        result[key] = Form.createFormField({ value })
        return result
      }, {})
  }
}

const mapStateToProps = createStructuredSelector({
  sourceFormValues: makeSelectSourceFormValues()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSetSourceFormValue: (values) => dispatch(setSourceFormValue(values))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create(formOptions)(SourceForm))

