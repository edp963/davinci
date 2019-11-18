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
import { Modal, Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { IWidgetBase } from '../types'
const FormItem = Form.Item

interface ICopyModalProps extends FormComponentProps<IWidgetBase> {
  visible: boolean
  loading: boolean
  fromWidget: IWidgetBase
  onCheckUniqueName: (widgetName: string, resolve: () => void, reject: (err: string) => void) => void
  onCopy: (view: IWidgetBase) => void
  onCancel: () => void
}

export class CopyModal extends React.PureComponent<ICopyModalProps> {
  private formItemStyle = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  }

  private save = () => {
    const { form, fromWidget, onCopy } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return }
      const copyWidget: IWidgetBase = { ...fromWidget, ...fieldsValue }
      onCopy(copyWidget)
    })
  }

  private checkName = (_, value, callback) => {
    const { onCheckUniqueName } = this.props
    onCheckUniqueName(value, () => {
      callback()
    }, (err) => {
      callback(err)
    })
  }

  private clearFieldsValue = () => {
    this.props.form.resetFields()
  }

  public render () {
    const { form, visible, loading, fromWidget, onCancel } = this.props
    const { getFieldDecorator } = form
    if (!fromWidget) { return null }

    return (
      <Modal
        title="复制 Widget"
        wrapClassName="ant-modal-small"
        visible={visible}
        onCancel={onCancel}
        onOk={this.save}
        afterClose={this.clearFieldsValue}
        confirmLoading={loading}
      >
        <Form>
          <FormItem label="新名称" {...this.formItemStyle}>
            {getFieldDecorator<IWidgetBase>('name', {
              validateFirst: true,
              rules: [
                { required: true, message: '不能为空' },
                { validator: this.checkName }
              ],
              initialValue: `${fromWidget.name}_copy`
            })(<Input />)}
          </FormItem>
          <FormItem label="描述" {...this.formItemStyle}>
            {getFieldDecorator<IWidgetBase>('description', {
              initialValue: fromWidget.description
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<ICopyModalProps>()(CopyModal)
