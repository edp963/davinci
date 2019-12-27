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

import React, { useCallback } from 'react'

import { Modal, Form, Card, Row, Col, InputNumber, Radio, Select } from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option } = Select

import { FormComponentProps, FormItemProps } from 'antd/lib/form'
import { IDisplayParams } from 'containers/Viz/types'

import { DefaultDisplayParams } from './constants'

interface IDisplaySettingModalProps extends FormComponentProps<IDisplayParams> {
  visible: boolean
  displayParams: IDisplayParams
  onCancel: () => void
  onOk: (params: IDisplayParams) => void
}

const transitionStyleOptions: Array<{
  label: string
  value: IDisplayParams['transitionStyle']
}> = [
  {
    label: '无',
    value: 'none'
  },
  {
    label: '淡入淡出',
    value: 'fade'
  },
  {
    label: '滑动',
    value: 'slide'
  },
  {
    label: '凸镜',
    value: 'convex'
  },
  {
    label: '凹镜',
    value: 'concave'
  },
  {
    label: '缩放',
    value: 'zoom'
  }
]

const formItemStyle: Partial<FormItemProps> = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
}

const DisplaySettingModal: React.FC<IDisplaySettingModalProps> = (props) => {
  const { visible, displayParams, form, onCancel, onOk } = props
  const { getFieldDecorator } = form
  const { autoSlide, transitionStyle, transitionSpeed, grid } =
    displayParams || DefaultDisplayParams

  const ok = useCallback(() => {
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      onOk(values)
    })
  }, [onOk])

  return (
    <Modal
      visible={visible}
      title="大屏设置"
      wrapClassName="ant-modal-large"
      onCancel={onCancel}
      onOk={ok}
    >
      <Form>
        <Row gutter={8}>
          <Col span={12}>
            <Card title="全局动画设置" size="small">
              <FormItem label="每页停留时间（秒）" {...formItemStyle}>
                {getFieldDecorator<IDisplayParams>('autoSlide', {
                  initialValue: autoSlide,
                  validateFirst: true,
                  rules: [{ required: true, message: '请输入数字' }]
                })(<InputNumber min={3} />)}
              </FormItem>
              <FormItem label="过渡动画" {...formItemStyle}>
                {getFieldDecorator<IDisplayParams>('transitionStyle', {
                  initialValue: transitionStyle
                })(<RadioGroup options={transitionStyleOptions} />)}
              </FormItem>
              <FormItem label="动画速度" {...formItemStyle}>
                {getFieldDecorator<IDisplayParams>('transitionSpeed', {
                  initialValue: transitionSpeed
                })(
                  <Select>
                    <Option value="default">默认</Option>
                    <Option value="fast">快</Option>
                    <Option value="slow">慢</Option>
                  </Select>
                )}
              </FormItem>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="拖动栅格设置（像素）" size="small">
              <Row>
                <Col span={11}>
                  <FormItem label="x轴方向" {...formItemStyle}>
                    {getFieldDecorator('grid[0]', {
                      initialValue: grid[0],
                      rules: [{ required: true, message: '请填入数字' }]
                    })(<InputNumber min={1} />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="y轴方向" {...formItemStyle}>
                    {getFieldDecorator('grid[1]', {
                      initialValue: grid[1],
                      rules: [{ required: true, message: '请填入数字' }]
                    })(<InputNumber min={1} />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default Form.create<IDisplaySettingModalProps>()(DisplaySettingModal)
