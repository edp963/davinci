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

import React, { useState } from 'react'
import { Form, Row, Col, Select, InputNumber } from 'antd'
const FormItem = Form.Item
const { Option } = Select

import { FormItemProps, FormComponentProps } from 'antd/lib/form'

export type PollingSetting = {
  polling: 'true' | 'false'
  frequency?: number
}

const FormItemStyle: Partial<FormItemProps> = {
  labelCol: { xl: 8, lg: 10, md: 14, sm: 8 },
  wrapperCol: { xl: 14, lg: 12, md: 10, sm: 14 }
}

type PollingConfigProps = Partial<PollingSetting> &
  FormComponentProps<PollingSetting>

const PollingConfig: React.FC<PollingConfigProps> = (props) => {
  const { form, polling, frequency } = props
  const { getFieldDecorator } = form

  const currentPolling = form.getFieldValue('polling')

  return (
    <Form>
      <Row>
        <Col span={12}>
          <FormItem label="数据刷新模式" {...FormItemStyle}>
            {getFieldDecorator<PollingSetting>('polling', {
              initialValue: polling || 'false'
            })(
              <Select>
                <Option value="false">手动刷新</Option>
                <Option value="true">定时刷新</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        {currentPolling === 'true' && (
          <Col span={12}>
            <FormItem label="时长（秒）" {...FormItemStyle}>
              {getFieldDecorator<PollingSetting>('frequency', {
                rules: [
                  {
                    required: true,
                    message: '时长不能为空'
                  }
                ],
                initialValue: frequency
              })(<InputNumber />)}
            </FormItem>
          </Col>
        )}
      </Row>
    </Form>
  )
}

export default Form.create<PollingConfigProps>()(PollingConfig)
