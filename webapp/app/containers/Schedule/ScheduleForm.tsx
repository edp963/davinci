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
import { connect } from 'react-redux'
import { checkNameAction, checkNameUniqueAction } from '../App/actions'
import moment from 'moment'
import { Form, Row, Col, Input, Select, DatePicker, TimePicker } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
const { RangePicker } = DatePicker
const utilStyles = require('assets/less/util.less')

interface IScheduleFormProps {
  type: string
  rangeTime: string
  form: any
  projectId: number
  changeRange: (value: string) => any
  configValue: string
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
  onShowConfig: () => any
}

export class ScheduleForm extends React.PureComponent<IScheduleFormProps> {

  private checkUniqueName = (rule, value = '', callback) => {
    const { onCheckUniqueName, projectId } = this.props
    const { getFieldsValue } = this.props.form
    const id = getFieldsValue()['id']
    const data = {
      name: value,
      projectId,
      id
    }
    onCheckUniqueName('cronjob', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  public render () {
    const size = 'large'
    const { onShowConfig, configValue } = this.props
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    let minuteIndex = 0
    let monthIndex = 0
    const minuteOptions = []
    const monthOptions = []
    while (minuteIndex < 60) {
      minuteOptions.push(<Option key={`${minuteIndex}`} value={`${minuteIndex}`}>{minuteIndex}</Option>)
      minuteIndex++
    }
    while (monthIndex < 32) {
      monthOptions.push(<Option key={`${monthIndex}`} value={`${monthIndex}`}>{monthIndex}</Option>)
      monthIndex++
    }
    return (
      <Form>
        <Row>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              label="名称"
              {...commonFormItemStyle}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: 'Name 不能为空'
                }, {
                  validator: this.checkUniqueName
                }]
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem label="描述" {...commonFormItemStyle}>
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
            <FormItem
              label="类型"
              {...commonFormItemStyle}
            >
              {getFieldDecorator('jobType', {
                initialValue: 'email'
              })(
                <Select>
                  <Option value="email">email</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              label="配置"
              {...commonFormItemStyle}
            >
              {getFieldDecorator('config', {
                rules: [{
                  required: true,
                  message: '配置不能为空'
                }],
                initialValue: configValue && configValue.length > 2 ? configValue : ''
              })(
                <Input placeholder="config" readOnly onClick={onShowConfig} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label="范围"
              {...commonFormItemStyle}
            >
              {
                getFieldDecorator('range', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    message: '范围不能为空'
                  }]
                })(
                  <RangePicker
                    style={{width: '300px'}}
                    size={size}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={['Start Time', 'End Time']}
                  />
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <div className="ant-col-4 ant-form-item-label"><label className="" title="每隔">每隔</label></div>
          <Col span={5}>
            <FormItem>
              {
                getFieldDecorator('time_range', {
                  initialValue: ''
                })(
                  <Select onChange={this.props.changeRange}>
                    {['Minute', 'Hour', 'Day', 'Week', 'Month'].map((dimensions) => <Option key={dimensions} value={dimensions}>{dimensions}</Option>)}
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Minute' ? '' : utilStyles.hide}`}
          >
            <FormItem>
              {
                getFieldDecorator('minute', {
                  initialValue: ''
                })(
                  <Select>
                    {
                      minuteOptions
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Month' ? '' : utilStyles.hide}`}
          >
            <FormItem>
              {
                  getFieldDecorator('month', {
                    initialValue: ''
                  })(
                    <Select>
                      {monthOptions}
                    </Select>
                  )
                }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Hour' ? '' : utilStyles.hide}`}
          >
            <FormItem
            >
              {
                  getFieldDecorator('hour', {
                    initialValue: ''
                  })(
                    <Select>
                      <Option value="0">0</Option><Option value="5">5</Option>
                      <Option value="10">10</Option><Option value="15">15</Option>
                      <Option value="20">20</Option><Option value="25">25</Option>
                      <Option value="30">30</Option><Option value="35">35</Option>
                      <Option value="40">40</Option><Option value="45">45</Option>
                      <Option value="50">50</Option><Option value="55">55</Option>
                    </Select>
                  )
                }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Week' ? '' : utilStyles.hide}`}
          >
            <FormItem>
              {
                  getFieldDecorator('week', {
                    initialValue: ''
                  })(
                    <Select>
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                        .map((dimensions, index) => <Option key={`${index}`} value={`${index + 1}`}>{dimensions}</Option>)}
                    </Select>
                  )
                }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${['Day', 'Week', 'Month'].indexOf(this.props.rangeTime) > -1 ? '' : utilStyles.hide}`}
          >
            <FormItem>
              {
                  getFieldDecorator('time', {
                    initialValue: moment('00:00', 'HH:mm'),
                    hidden: ['Day', 'Week', 'Month'].indexOf(this.props.rangeTime) < 0
                  })(
                    <TimePicker format="HH:mm" />
                  )
                }
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default Form.create()(connect<{}, {}, IScheduleFormProps>(null, mapDispatchToProps)(ScheduleForm))
