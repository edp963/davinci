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
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
const FormItem = Form.Item

import utilStyles from '../../../assets/less/util.less'
import styles from '../Widget.less'

export class MarkConfigForm extends Component {
  render () {
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

MarkConfigForm.propTypes = {
  form: PropTypes.any,
  onCancel: PropTypes.func,
  onSaveMarkConfigValue: PropTypes.func
}

export default Form.create()(MarkConfigForm)
