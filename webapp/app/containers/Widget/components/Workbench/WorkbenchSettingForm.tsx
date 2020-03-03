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

import React, { PureComponent } from 'react'

import { Form, Modal, Row, Col, Radio, Button } from 'antd'
import { IWorkbenchSettings, WorkbenchQueryMode } from './types'
import { FormComponentProps } from 'antd/lib/form'
const FormItem = Form.Item
const RadioGroup = Radio.Group

interface IWorkbenchSettingFormProps {
  visible: boolean
  settings: IWorkbenchSettings
  onSave: (values: any) => void
  onClose: () => void
}

export class WorkbenchSettingForm extends PureComponent<IWorkbenchSettingFormProps & FormComponentProps, {}> {

  private commonFormItemStyle = {
    labelCol: { span: 9 },
    wrapperCol: { span: 13 }
  }

  public componentDidUpdate (prevProps: IWorkbenchSettingFormProps & FormComponentProps) {
    const { form, settings, visible } = this.props
    if (settings !== prevProps.settings || visible !== prevProps.visible) {
      form.setFieldsValue(settings)
    }
  }

  private save = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSave(values)
      }
    })
  }

  private reset = () => {
    this.props.form.resetFields()
  }

  public render () {
    const {
      form,
      visible,
      onClose
    } = this.props

    const { getFieldDecorator } = form

    const modalButtons = ([(
      <Button
        key="submit"
        size="large"
        type="primary"
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

    return (
      <Modal
        title="Widget 编辑器设置"
        wrapClassName="ant-modal-small"
        visible={visible}
        footer={modalButtons}
        onCancel={onClose}
        afterClose={this.reset}
      >
        <Form>
          <Row gutter={8}>
            <Col span={24}>
              <FormItem label="查询触发模式" {...this.commonFormItemStyle}>
                {getFieldDecorator('queryMode', {})(
                  <RadioGroup>
                    <Radio value={WorkbenchQueryMode.Manually}>手动</Radio>
                    <Radio value={WorkbenchQueryMode.Immediately}>立即</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="多选拖拽" {...this.commonFormItemStyle}>
                {getFieldDecorator('multiDrag', {})(
                  <RadioGroup>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IWorkbenchSettingFormProps & FormComponentProps>()(WorkbenchSettingForm)
