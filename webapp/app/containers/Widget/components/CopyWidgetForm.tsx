/*
 * <<
 * wormhole
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

import { Form, Row, Col, Input } from 'antd'
const FormItem = Form.Item

const utilStyles = require('assets/less/util.less')
const styles = require('../Widget.less')

interface ICopyWidgetFormProps {
  form: any
  projectId: number
  type: string
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class CopyWidgetForm extends React.Component<ICopyWidgetFormProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { form, onCheckUniqueName, projectId } = this.props
    const { id } = form.getFieldsValue()

    const data = {
      projectId,
      id: '',
      name: value
    }
    onCheckUniqueName('widget', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  public render () {
    const { type } = this.props
    const { getFieldDecorator } = this.props.form

    const itemStyle = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 }
    }

    return (
      <Form className={styles.formView}>
        <Row gutter={8}>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('type', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('viewId', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('config', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('projectId', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('publish', {})(
                <Input />
              )}
            </FormItem>
            <FormItem label="Widget 名称" {...itemStyle} hasFeedback>
              {getFieldDecorator('name', {
                rules: [{ required: true }, {validator: this.checkNameUnique}]
              })(
                <Input placeholder="Widget Name" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="Widget 描述" {...itemStyle}>
              {getFieldDecorator('description', {
                initialValue: ''
              })(
                <Input placeholder="Widget Description" />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create()(CopyWidgetForm)
