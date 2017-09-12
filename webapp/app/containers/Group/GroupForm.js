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

import React, { PropTypes } from 'react'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
const FormItem = Form.Item

import utilStyles from '../../assets/less/util.less'

export class GroupForm extends React.PureComponent {

  render () {
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
                }]
              })(
                <Input placeholder="Name" />
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
        </Row>
      </Form>
    )
  }
}

GroupForm.propTypes = {
  type: PropTypes.string,
  form: PropTypes.any
}

export default Form.create({withRef: true})(GroupForm)
