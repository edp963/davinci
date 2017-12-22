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

import React, {PropTypes} from 'react'
import classnames from 'classnames'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
import Icon from 'antd/lib/icon'
import Steps from 'antd/lib/steps'
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step

import { iconMapping } from '../../Widget/components/chartUtil'

import utilStyles from '../../../assets/less/util.less'
import widgetStyles from '../../Widget/Widget.less'

export class DashboardItemForm extends React.PureComponent {

  constructor (props) {
    super(props)
    this.state = {
      triggerType: 'manual'
    }
  }

  render () {
    const {
      type,
      form,
      selectedWidget,
      triggerType,
      step,
      loginUser,
      onWidgetSelect,
      onTriggerTypeSelect
    } = this.props

    let {widgets} = this.props
    if (loginUser && loginUser.admin) {
      widgets = widgets.filter(widget => widget['create_by'] === loginUser.id)
    }
    const {getFieldDecorator} = form

    const widgetSelector = widgets.map(w => {
      const widgetType = JSON.parse(w.chart_params).widgetType
      const widgetClassName = classnames({
        [widgetStyles.widget]: true,
        [widgetStyles.selector]: true,
        [widgetStyles.selected]: w.id === selectedWidget
      })

      const checkmark = w.id === selectedWidget
        ? (
          <div className={widgetStyles.checkmark}>
            <Icon type="check" />
          </div>
        )
        : ''

      return (
        <Col
          md={8} sm={12} xs={24}
          key={w.id}
          onClick={onWidgetSelect(w.id)}
        >
          <div className={widgetClassName}>
            <h3 className={widgetStyles.title}>{w.name}</h3>
            <p className={widgetStyles.content}>{w.desc}</p>
            <i className={`${widgetStyles.pic} iconfont ${iconMapping[widgetType]}`} />
            {checkmark}
          </div>
        </Col>
      )
    })

    const selectWidgetStep = classnames({
      [utilStyles.hide]: !!step
    })

    const inputFormStep = classnames({
      [utilStyles.hide]: !step
    })

    const triggerParamsClass = classnames({
      [utilStyles.hide]: triggerType === 'manual'
    })

    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            <Steps current={step}>
              <Step title="Widget" />
              <Step title="Frequent" />
              <Step title="完成" />
            </Steps>
          </Col>
        </Row>
        <Row gutter={20} className={selectWidgetStep}>
          {widgetSelector}
        </Row>
        <div className={inputFormStep}>
          <Row gutter={8}>
            <Col sm={8}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id', {
                  hidden: type === 'add'
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                label="数据刷新模式"
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
              >
                {getFieldDecorator('trigger_type', {
                  initialValue: triggerType
                })(
                  <Select onSelect={onTriggerTypeSelect}>
                    <Option value="manual">手动刷新</Option>
                    <Option value="frequent">定时刷新</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={4} className={triggerParamsClass}>
              <FormItem
                label="时长"
                labelCol={{span: 12}}
                wrapperCol={{span: 12}}
              >
                {getFieldDecorator('trigger_params', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }],
                  initialValue: 60
                })(
                  <InputNumber min={1} placeholder="秒" />
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
      </Form>
    )
  }
}

DashboardItemForm.propTypes = {
  form: PropTypes.any,
  type: PropTypes.string,
  widgets: PropTypes.array,
  selectedWidget: PropTypes.number,
  loginUser: PropTypes.object,
  triggerType: PropTypes.string,
  onWidgetSelect: PropTypes.func,
  onTriggerTypeSelect: PropTypes.func,
  step: PropTypes.number
}

export default Form.create()(DashboardItemForm)
