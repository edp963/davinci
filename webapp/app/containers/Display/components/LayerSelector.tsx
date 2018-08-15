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
import * as classnames from 'classnames'

const Modal = require('antd/lib/modal')
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Select = require('antd/lib/select')
const Icon = require('antd/lib/icon')
const Steps = require('antd/lib/steps')
const Pagination = require('antd/lib/pagination')
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step
const Search = Input.Search
import { WrappedFormUtils } from 'antd/lib/form/Form'

import { iconMapping } from '../../Widget/components/chartUtil'
import WidgetSelector from '../../Widget/components/WidgetSelector'

const utilStyles = require('../../../assets/less/util.less')

interface ILayerSelectorProps {
  visible: boolean
  form: WrappedFormUtils
  multiple: boolean
  modalLoading: boolean
  widgets: any[]
  selectedWidgets: any[]
  triggerType: string
  onSelectDone: (widgets: any[], values: any) => void
  onCancel: () => void
}

interface ILayerSelectorStates {
  step: number
  tempSelectedWidgets: any[]
  tempTriggerType: string
}

export class LayerSelector extends React.Component<ILayerSelectorProps, ILayerSelectorStates> {
  constructor (props) {
    super(props)
    this.state = {
      step: 0,
      tempSelectedWidgets: [],
      tempTriggerType: this.props.triggerType || 'manual'
    }
  }

  private onWidgetsSelect = (widgets) => {
    this.setState({
      tempSelectedWidgets: [...widgets]
    })
  }

  private onTriggerTypeSelect = (val) => {
    this.setState({
      tempTriggerType: val
    })
  }

  private onStepChange = (step) => () => {
    this.setState({ step })
  }

  private save = () => {
    this.props.onSelectDone([...this.state.tempSelectedWidgets], this.props.form.getFieldsValue())
  }

  private afterClose = () => {
    this.setState({
      tempSelectedWidgets: [],
      step: 0
    })
    this.props.form.resetFields()
  }

  public render () {
    const {
      visible,
      multiple,
      modalLoading,
      form,
      widgets,
      triggerType
    } = this.props

    const { step, tempSelectedWidgets, tempTriggerType } = this.state

    const { getFieldDecorator } = form

    const selectWidgetStep = classnames({
      [utilStyles.hide]: !!step
    })

    const inputFormStep = classnames({
      [utilStyles.hide]: !step
    })

    const triggerParamsClass = classnames({
      [utilStyles.hide]: tempTriggerType === 'manual'
    })

    const modalButtons = step
      ? [(
        <Button key="back" size="large" onClick={this.onStepChange(0)}>上一步</Button>
      ), (
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={modalLoading}
          disabled={modalLoading}
          onClick={this.save}
        >保 存
        </Button>
      )] : [(
        <Button
          key="forward"
          size="large"
          type="primary"
          disabled={tempSelectedWidgets.length === 0}
          onClick={this.onStepChange(1)}
        >下一步
        </Button>
      )]

    return (
      <Modal
        title="选择 Widgets"
        wrapClassName="ant-modal-large"
        visible={visible}
        footer={modalButtons}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
      >
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
          <WidgetSelector
            className={selectWidgetStep}
            widgets={widgets}
            multiple={multiple}
            widgetsSelected={tempSelectedWidgets}
            onWidgetsSelect={this.onWidgetsSelect}
          />
          <div className={inputFormStep}>
            <Row gutter={8}>
              <Col sm={8}>
                <FormItem
                  label="数据刷新模式"
                  labelCol={{span: 10}}
                  wrapperCol={{span: 14}}
                >
                  {getFieldDecorator('triggerType', {
                    initialValue: tempTriggerType
                  })(
                    <Select onSelect={this.onTriggerTypeSelect}>
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
                  {getFieldDecorator('triggerParams', {
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
      </Modal>
    )
  }
}

export default Form.create()(LayerSelector)
