/*-
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

import React, { PropTypes, PureComponent } from 'react'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
const FormItem = Form.Item

import styles from './Login3.less'

export class LoginForm extends PureComponent {
  render () {
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Row gutter={8}>
          <Col sm={12}>
            <FormItem className={styles.loginFormItem}>
              {getFieldDecorator('username', {
                rules: [{
                  required: true,
                  message: '请输入用户名'
                }],
                initialValue: ''
              })(
                <Input placeholder="用户名" />
              )}
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem className={styles.loginFormItem}>
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: '请输入密码'
                }],
                initialValue: ''
              })(
                <Input placeholder="密码" type="password" />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

LoginForm.propTypes = {
  form: PropTypes.any
}

export default Form.create({withRef: true})(LoginForm)
