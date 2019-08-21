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

import { Modal, Form, Row, Col, Button, InputNumber, Select, Steps } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step
import { FormComponentProps } from 'antd/lib/form/Form'

// TODO widgets icon display
// import { iconMapping } from 'containers/Widget/components/chartUtil'
import WidgetSelector from 'containers/Widget/components/WidgetSelector'

const utilStyles = require('assets/less/util.less')

interface ILayerSelectorProps extends FormComponentProps {
  visible: boolean
  multiple: boolean
  modalLoading: boolean
  widgets: any[]
  selectedWidgets: any[]
  onSelectDone: (widgets: any[], values: any) => void
  onCancel: () => void
}

interface ILayerSelectorStates {
  step: number
  tempSelectedWidgets: any[]
  showFrequency: boolean
}

export class LayerSelector extends React.Component<ILayerSelectorProps, ILayerSelectorStates> {
  constructor (props) {
    super(props)
    this.state = {
      step: 0,
      tempSelectedWidgets: [],
      showFrequency: false
    }
  }

  private onWidgetsSelect = (widgets) => {
    this.setState({
      tempSelectedWidgets: [...widgets]
    })
  }

  private onStepChange = (step) => () => {
    this.setState({ step })
  }

  private onPollingSelect = (polling) => {
    this.setState({ showFrequency: polling === 'true' })
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
      widgets
    } = this.props

    const { step, tempSelectedWidgets, showFrequency } = this.state

    const { getFieldDecorator } = form

    const selectWidgetStep = classnames({
      [utilStyles.hide]: !!step
    })

    const inputFormStep = classnames({
      [utilStyles.hide]: !step
    })

    const frequencyClass = classnames({
      [utilStyles.hide]: !showFrequency
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
                <Step title="数据更新" />
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
                  {getFieldDecorator('polling', {
                    initialValue: 'false'
                  })(
                    <Select onSelect={this.onPollingSelect}>
                      <Option value="false">手动刷新</Option>
                      <Option value="true">定时刷新</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col sm={4} className={frequencyClass}>
                <FormItem
                  label="时长"
                  labelCol={{span: 12}}
                  wrapperCol={{span: 12}}
                >
                  {getFieldDecorator('frequency', {
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

export default Form.create<ILayerSelectorProps>()(LayerSelector)
