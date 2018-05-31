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

import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import {checkNameAction} from '../App/actions'
import moment from 'moment'
import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import DatePicker from 'antd/lib/date-picker'
import TimePicker from 'antd/lib/time-picker'
const Option = Select.Option
const { RangePicker } = DatePicker
const FormItem = Form.Item
import utilStyles from '../../assets/less/util.less'

export class ScheduleForm extends React.PureComponent {
  checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    let idName = type === 'add' ? '' : id
    let typeName = 'cronjob'
    onCheckName(idName, value, typeName,
      res => {
        callback()
      }, err => {
        callback(err)
      })
  }

  render () {
    let size = 'large'
    const { onShowConfig, configValue } = this.props
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
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
                  validator: this.checkNameUnique
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
          <Col span={24}>
            <FormItem
              label="类型"
              {...commonFormItemStyle}
            >
              {getFieldDecorator('job_type', {
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
                    onChange={this.onChange}
                    onOk={this.onOk}
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
                    <Option value="Minute">Minute</Option>
                    <Option value="Hour">Hour</Option>
                    <Option value="Day">Day</Option>
                    <Option value="Week">Week</Option>
                    <Option value="Month">Month</Option>
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Minute' ? '' : utilStyles.hide}`}>
            <FormItem>
              {
                getFieldDecorator('minute', {
                  initialValue: ''
                })(
                  <Select>
                    <Option value="0">0</Option>
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
                    <Option value="3">3</Option>
                    <Option value="4">4</Option>
                    <Option value="5">5</Option>
                    <Option value="6">6</Option>
                    <Option value="7">7</Option>
                    <Option value="8">8</Option>
                    <Option value="9">9</Option>
                    <Option value="10">10</Option>
                    <Option value="11">11</Option>
                    <Option value="12">12</Option>
                    <Option value="13">13</Option>
                    <Option value="14">14</Option>
                    <Option value="15">15</Option>
                    <Option value="16">16</Option>
                    <Option value="17">17</Option>
                    <Option value="18">18</Option>
                    <Option value="19">19</Option>
                    <Option value="20">20</Option>
                    <Option value="21">21</Option>
                    <Option value="22">22</Option>
                    <Option value="23">23</Option>
                    <Option value="24">24</Option>
                    <Option value="25">25</Option>
                    <Option value="26">26</Option>
                    <Option value="27">27</Option>
                    <Option value="28">28</Option>
                    <Option value="29">29</Option>
                    <Option value="30">30</Option>
                    <Option value="31">31</Option>
                    <Option value="32">32</Option>
                    <Option value="33">33</Option>
                    <Option value="34">34</Option>
                    <Option value="35">35</Option>
                    <Option value="36">36</Option>
                    <Option value="37">37</Option>
                    <Option value="38">38</Option>
                    <Option value="39">39</Option>
                    <Option value="40">40</Option>
                    <Option value="41">41</Option>
                    <Option value="42">42</Option>
                    <Option value="43">43</Option>
                    <Option value="44">44</Option>
                    <Option value="45">45</Option>
                    <Option value="46">46</Option>
                    <Option value="47">47</Option>
                    <Option value="48">48</Option>
                    <Option value="49">49</Option>
                    <Option value="50">50</Option>
                    <Option value="51">51</Option>
                    <Option value="52">52</Option>
                    <Option value="53">53</Option>
                    <Option value="54">54</Option>
                    <Option value="55">55</Option>
                    <Option value="56">56</Option>
                    <Option value="57">57</Option>
                    <Option value="58">58</Option>
                    <Option value="59">59</Option>
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col
            span={5}
            offset={1}
            className={`${this.props.rangeTime === 'Month' ? '' : utilStyles.hide}`}>
            <FormItem>
              {
                  getFieldDecorator('month', {
                    initialValue: ''
                  })(
                    <Select>
                      <Option value="1">1st</Option><Option value="2">2nd</Option><Option value="3">3rd</Option><Option value="4">4th</Option><Option value="5">5th</Option>
                      <Option value="6">6th</Option><Option value="7">7th</Option><Option value="8">8th</Option><Option value="9">9th</Option><Option value="10">10th</Option>
                      <Option value="11">11th</Option><Option value="12">12th</Option><Option value="13">13th</Option><Option value="14">14th</Option><Option value="15">15th</Option>
                      <Option value="16">16th</Option><Option value="17">17th</Option><Option value="18">18th</Option><Option value="19">19th</Option><Option value="20">20th</Option>
                      <Option value="21">21st</Option><Option value="22">22nd</Option><Option value="23">23rd</Option><Option value="24">24th</Option><Option value="25">25th</Option>
                      <Option value="26">26th</Option><Option value="27">27th</Option><Option value="28">28th</Option><Option value="29">29th</Option><Option value="30">30th</Option>
                      <Option value="31">31st</Option>
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
                      <Option value="0">0</Option><Option value="5">5</Option><Option value="10">10</Option><Option value="15">15</Option><Option value="20">20</Option><Option value="25">25</Option>
                      <Option value="30">30</Option><Option value="35">35</Option><Option value="40">40</Option><Option value="45">45</Option><Option value="50">50</Option><Option value="55">55</Option>
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
                      <Option value="0">Sunday</Option>
                      <Option value="1">Monday</Option>
                      <Option value="2">Tuesday</Option>
                      <Option value="3">Wednesday</Option>
                      <Option value="4">Thursday</Option>
                      <Option value="5">Friday</Option>
                      <Option value="6">Saturday</Option>
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

ScheduleForm.propTypes = {
  type: PropTypes.string,
  rangeTime: PropTypes.string,
  form: PropTypes.any,
  changeRange: PropTypes.func,
  configValue: PropTypes.string,
  onCheckName: PropTypes.func,
  onShowConfig: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default Form.create()(connect(null, mapDispatchToProps)(ScheduleForm))
