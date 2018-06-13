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
import classnames from 'classnames'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio'
const RadioGroup = Radio.Group
import Upload from 'antd/lib/upload'
import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
import Steps from 'antd/lib/steps'
const Step = Steps.Step
const FormItem = Form.Item

import utilStyles from './upload.less'

export class UploadCsvForm extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      replaceModeState: 0
    }
  }
  replaceModeChange = (e) => {
    this.setState({
      replaceModeState: e.target.value
    })
  }
  render () {
    const {step, form, uploadProps} = this.props
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
                initialValue: 1
              })(
                <RadioGroup onChange={this.replaceModeChange} value={this.state.replaceModeState}>
                  <Radio value={0}>追加</Radio>
                  <Radio value={1}>替换</Radio>
                </RadioGroup>
              )}
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

UploadCsvForm.propTypes = {
  form: PropTypes.any,
  step: PropTypes.any,
  uploadProps: PropTypes.any
}

export default Form.create()(UploadCsvForm)

