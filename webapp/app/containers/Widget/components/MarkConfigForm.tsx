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

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Button = require('antd/lib/button')
const FormItem = Form.Item

const utilStyles = require('../../../assets/less/util.less')
const styles = require('../Widget.less')

interface IMarkConfigFormProps {
  form: any,
  onCancel: () => void,
  onSaveMarkConfigValue: () => void
}

export class MarkConfigForm extends React.Component<IMarkConfigFormProps, {}> {
  public render () {
    const {
      form,
      onCancel,
      onSaveMarkConfigValue
    } = this.props

    const { getFieldDecorator } = form
    return (
      <div className={styles.variableConfigForm}>
        <Form>
          <Row gutter={8}>
            <Col span={8}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id', {})(
                  <Input />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('text', {
                  rules: [{
                    required: true,
                    message: '文本不能为空'
                  }]
                })(
                  <Input placeholder="文本" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('value', {
                  rules: [{
                    required: true,
                    message: '值不能为空'
                  }]
                })(
                  <Input placeholder="值" />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div className={styles.footer}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onSaveMarkConfigValue}>保存</Button>
        </div>
      </div>
    )
  }
}

export default Form.create()(MarkConfigForm)
