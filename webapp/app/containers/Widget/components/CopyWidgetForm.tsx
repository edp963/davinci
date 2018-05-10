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
import { connect } from 'react-redux'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const FormItem = Form.Item

import { checkNameAction } from '../../App/actions'

const utilStyles = require('../../../assets/less/util.less')
const styles = require('../Widget.less')

interface ICopyWidgetFormProps {
  form: any,
  type: string,
  onCheckName: (idName: any, value: any, typeName: any, success: (res: any) => void, error: (err: any) => void) => void
}

export class CopyWidgetForm extends React.Component<ICopyWidgetFormProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    const idName = type === 'add' ? '' : id
    const typeName = 'widget'
    onCheckName(idName, value, typeName,
      (res) => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  public render () {
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
              {getFieldDecorator('create_by', {
                hidden: this.props.type === 'copy'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="Widget 名称" {...itemStyle}>
              {getFieldDecorator('name', {
                rules: [{ required: true }, {validator: this.checkNameUnique}]
              })(
                <Input placeholder="Widget Name" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="Widget 描述" {...itemStyle}>
              {getFieldDecorator('desc', {
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

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default Form.create()(connect(null, mapDispatchToProps)(CopyWidgetForm))
