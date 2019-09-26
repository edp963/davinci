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
import * as classnames from 'classnames'
import { connect } from 'react-redux'
import { Form, Row, Col, Input, Radio, Steps, Transfer } from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Step = Steps.Step

import { checkNameAction } from '../App/actions'

const utilStyles = require('assets/less/util.less')

interface IUserFormProps {
  form: any
  type: string
  step: number
  groupSource: any[]
  groupTarget: any[]
  onGroupChange: (targets) => any
  onCheckName: (
    id: number,
    name: string,
    type: string,
    param?: any,
    resolve?: (res: any) => void,
    reject?: (err: any) => void
  ) => any
}

export class UserForm extends React.PureComponent<IUserFormProps, {}> {
  private checkPasswordConfirm = (rule, value, callback) => {
    if (value && value !== this.props.form.getFieldValue('password')) {
      callback('两次输入的密码不一致')
    } else {
      callback()
    }
  }

  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    const idName = type === 'add' ? '' : id
    const typeName = 'user'
    onCheckName(idName, value, typeName,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private forceCheckConfirm = (rule, value, callback) => {
    const { form } = this.props
    if (form.getFieldValue('confirmPassword')) {
      form.validateFields(['confirmPassword'], { force: true })
    }
    callback()
  }

  private getTransferRowKey = (g) => g.id
  private transferRender = (item) => item.name
  private onTransferChange = (cb) => (nextTargetKeys, direction, moveKeys) => {
    cb(nextTargetKeys)
  }

  public render () {
    const {
      form,
      type,
      step,
      groupSource,
      groupTarget,
      onGroupChange
    } = this.props
    const { getFieldDecorator } = form

    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 }
    }

    const baseInfoStyle = classnames({
      [utilStyles.hide]: !!step
    })
    const groupInfoStyle = classnames({
      [utilStyles.hide]: !step
    })
    const passwordStyle = classnames({
      [utilStyles.hide]: type === 'edit'
    })
    // Transfer 初次渲染如果在 display:none 情况下，列表文字会不渲染
    const groupTransfer = step
      ? (
        <Transfer
          titles={['列表', '已选']}
          listStyle={{width: '220px'}}
          dataSource={groupSource}
          rowKey={this.getTransferRowKey}
          targetKeys={groupTarget}
          render={this.transferRender}
          onChange={this.onTransferChange(onGroupChange)}
        />
      )
      : ''

    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            <Steps current={step}>
              <Step title="基本信息" />
              <Step title="用户组" />
              <Step title="完成" />
            </Steps>
          </Col>
        </Row>
        <Row className={baseInfoStyle}>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {
                hidden: type === 'add'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="Email" {...commonFormItemStyle}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: 'Email 不能为空'
                }, {
                  type: 'email',
                  message: '请输入正确的 Email 格式'
                }, {
                  validator: this.checkNameUnique
                }]
              })(
                <Input placeholder="Email" />
              )}
            </FormItem>
          </Col>
          <Col span={24} className={passwordStyle}>
            <FormItem label="密码" {...commonFormItemStyle}>
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: '密码不能为空'
                }, {
                  min: 6,
                  max: 20,
                  message: '密码长度为6-20位'
                }, {
                  validator: this.forceCheckConfirm
                }],
                hidden: type === 'edit'
              })(
                <Input type="password" placeholder="Password" />
              )}
            </FormItem>
          </Col>
          <Col span={24} className={passwordStyle}>
            <FormItem label="确认密码" {...commonFormItemStyle}>
              {getFieldDecorator('confirmPassword', {
                rules: [{
                  required: true,
                  message: '请确认密码'
                }, {
                  validator: this.checkPasswordConfirm
                }],
                hidden: type === 'edit'
              })(
                <Input type="password" placeholder="Confirm Password" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="姓名" {...commonFormItemStyle}>
              {getFieldDecorator('name', {
                initialValue: ''
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="职位" {...commonFormItemStyle}>
              {getFieldDecorator('title', {
                initialValue: ''
              })(
                <Input placeholder="Title" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="用户类型" {...commonFormItemStyle}>
              {getFieldDecorator('admin', {
                initialValue: false
              })(
                <RadioGroup>
                  <Radio value={false}>普通用户</Radio>
                  <Radio value>管理员</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row className={groupInfoStyle}>
          <Col span={24}>
            {groupTransfer}
          </Col>
        </Row>
      </Form>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, param, resolve, reject) => dispatch(checkNameAction(id, name, type, param, resolve, reject))
  }
}

export default Form.create()(connect(null, mapDispatchToProps)(UserForm))
