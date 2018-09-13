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

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Radio = require('antd/lib/radio/radio')
const RadioGroup = require('antd/lib/radio/group')
const Upload = require('antd/lib/upload')
const Icon = require('antd/lib/icon')
const Popover = require('antd/lib/popover')
const Button = require('antd/lib/button')
const Steps = require('antd/lib/steps')
const Step = Steps.Step
const FormItem = Form.Item

const utilStyles = require('./upload.less')

interface IUploadCsvFormProps {
  form: any
  step: any
  uploadProps: any
}

interface IUploadCsvFormStates {
  replaceModeState: number
}

export class UploadCsvForm extends React.PureComponent<IUploadCsvFormProps, IUploadCsvFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      replaceModeState: 0
    }
  }

  private replaceModeChange = (e) => {
    this.setState({
      replaceModeState: e.target.value as number
    })
  }

  public render () {
    const { step, form, uploadProps } = this.props
    const { getFieldDecorator } = form

    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    const baseInfoStyle = classnames({
      [utilStyles.hide]: !!step
    })

    const authInfoStyle = classnames({
      [utilStyles.hide]: !step
    })

    const uploadComponent = (
      <Upload {...uploadProps} >
        <Button>
          <Icon type="upload" /> Click to Upload CSV
        </Button>
      </Upload>
    )

    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            <Steps current={step}>
              <Step title="导入方式" />
              <Step title="上传CSV" />
              <Step title="完成" />
            </Steps>
          </Col>
        </Row>
        <Row gutter={8} className={baseInfoStyle}>
          <Col span={24}>
            <FormItem label="表名" {...commonFormItemStyle}>
              {getFieldDecorator('table_name', {
                rules: [{
                  required: true,
                  message: '表格名不能为空'
                }]
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="source_id" className={utilStyles.hide}>
              {getFieldDecorator('source_id')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="主键" {...commonFormItemStyle}>
              {getFieldDecorator('primary_keys', {
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="索引键" {...commonFormItemStyle}>
              {getFieldDecorator('index_keys', {
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="导入方式" {...commonFormItemStyle}>
              {getFieldDecorator('replace_mode', {
                valuePropName: 'checked',
                initialValue: 0
              })(
                <RadioGroup onChange={this.replaceModeChange} value={this.state.replaceModeState}>
                  <Radio value={0}>新增</Radio>
                  <Radio value={1}>替换</Radio>
                  <Radio value={2}>追加</Radio>
                </RadioGroup>
              )}
              <Popover
                placement="right"
                content={
                  <p>首次上传文件到新表请选择"替换"</p>
                }
              >
                <Icon type="question-circle-o" />
              </Popover>
            </FormItem>
          </Col>
        </Row>
        <Row className={authInfoStyle}>
          <Col span={24}>
            <FormItem
              {...commonFormItemStyle}
              label="上传"
            >
              {uploadComponent}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create()(UploadCsvForm)

