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
import Form from 'antd/lib/form'
import { FormComponentProps } from 'antd/lib/form/Form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio/radio'
import Button from 'antd/lib/button'
const TextArea = Input.TextArea
const FormItem = Form.Item
const RadioGroup = Radio.Group
import Modal from 'antd/lib/modal'
import { IDisplay } from './DisplayList'

const utilStyles = require('../../../assets/less/util.less')

interface IDisplayFormProps {
  projectId: number
  display: IDisplay,
  visible: boolean
  loading: boolean
  type: 'add' | 'edit'
  onCheckName: (type, data, resolve, reject) => void
  onSave: (display, type: string) => void
  onCancel: () => void
}

export class DisplayForm extends React.PureComponent<IDisplayFormProps & FormComponentProps, {}> {

  public componentWillReceiveProps (nextProps: IDisplayFormProps & FormComponentProps) {
    const { form, display } = nextProps
    if (display !== this.props.display) {
      this.initFormValue(form, display)
    }
  }

  public componentDidMount () {
    const { form, display } = this.props
    this.initFormValue(form, display)
  }

  private initFormValue (form, display: IDisplay) {
    if (display) {
      form.setFieldsValue({ ...display })
    } else {
      form.resetFields()
    }
  }

  private checkNameUnique = (_, value = '', callback) => {
    const { projectId, onCheckName, type, form } = this.props
    const { id } = form.getFieldsValue() as any
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

  private onModalOk = () => {
    const { type, projectId, onSave } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onSave({ ...values, projectId }, type)
      }
    })
  }

  private commonFormItemStyle = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
  }

  public render () {
    const { type, visible, loading, form, onCancel } = this.props
    const { getFieldDecorator } = form

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={onCancel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={loading}
        disabled={loading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
          title={`${type === 'add' ? '新增' : '修改'} Display`}
          wrapClassName="ant-modal-small"
          visible={visible}
          footer={modalButtons}
          onCancel={onCancel}
      >
        <Form>
          <Row gutter={8}>
            <Col span={24}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('projectId')(
                  <Input />
                )}
              </FormItem>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id')(
                  <Input />
                )}
              </FormItem>
              <FormItem label="名称" {...this.commonFormItemStyle}>
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
              <FormItem label="描述" {...this.commonFormItemStyle}>
                {getFieldDecorator('description', {
                  initialValue: ''
                })(
                  <TextArea
                    placeholder="Description"
                    autosize={{minRows: 2, maxRows: 6}}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="是否发布" {...this.commonFormItemStyle}>
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
                {getFieldDecorator('avatar')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IDisplayFormProps>()(DisplayForm)
