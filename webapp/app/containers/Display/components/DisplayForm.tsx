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
import { connect } from 'react-redux'
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Radio = require('antd/lib/radio/radio')
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { checkNameUniqueAction } from '../../App/actions'

const utilStyles = require('../../../assets/less/util.less')

interface IDisplayFormProps {
  projectId: number
  type: string
  form: any
  onCheckName: (type, data, resolve, reject) => void
}

export class DisplayForm extends React.PureComponent<IDisplayFormProps, {}> {

  constructor (props) {
    super(props)
  }

  private checkNameUnique = (_, value = '', callback) => {
    const { projectId, onCheckName, type, form } = this.props
    const { id } = form.getFieldsValue()
    const typeName = 'display'
    if (!value) {
      callback()
    }
    onCheckName(typeName, {
      projectId,
      id,
      name: value
    },
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  public render () {
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }
    return (
      <Form>
        <Row gutter={8}>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('projectId', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
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
            <FormItem label="描述" {...commonFormItemStyle}>
              {getFieldDecorator('description', {
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
            <FormItem label="是否发布" {...commonFormItemStyle}>
              {getFieldDecorator('publish', {
                initialValue: true
              })(
                <RadioGroup>
                  <Radio value>发布</Radio>
                  <Radio value={false}>编辑</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('avatar', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (type, data, resolve, reject) => dispatch(checkNameUniqueAction(type, data, resolve, reject))
  }
}

export default Form.create()(connect<{}, {}, IDisplayFormProps>(null, mapDispatchToProps)(DisplayForm))
