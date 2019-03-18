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

import React from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { ICSVMetaInfo } from '.'

import { Modal, Form, Row, Col, Input, Radio, Upload, Icon, Popover, Button, Steps } from 'antd'
const RadioGroup = Radio.Group
const Step = Steps.Step
const FormItem = Form.Item

import { setUploadFormValue } from './actions'
import { makeSelectUploadFormValues } from './selectors'
const utilStyles = require('./upload.less')

interface IUploadCsvFormProps {
  formKey: string
  visible: boolean
  step: any
  uploadProps: any
  form: any
  uploadFormValues: ICSVMetaInfo
  onStepChange: (step: number, values?: ICSVMetaInfo) => void
  onUpload: () => void
  onClose: () => void
  onAfterClose: () => void
  onSetUploadFormValue: (changedValues: ICSVMetaInfo) => void
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

  private changeStep = (step) => () => {
    if (step) {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.props.onStepChange(step, values)
        }
      })
    } else {
      this.props.onStepChange(step)
    }
  }

  private reset = () => {
    const { form, onAfterClose } = this.props
    form.resetFields()
    onAfterClose()
  }

  public render () {
    const {
      formKey,
      visible,
      step,
      form,
      uploadProps,
      onUpload,
      onClose
    } = this.props
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

    const modalButtons = step
      ? [(
      <Button
        key="submit"
        size="large"
        type="primary"
        onClick={onUpload}
      >
          保 存
      </Button>)
      ]
      : [(
      <Button
        key="forward"
        size="large"
        type="primary"
        onClick={this.changeStep(1)}
      >
          下一步
      </Button>)
      ]

    return (
      <Modal
        title="上传CSV"
        visible={visible}
        wrapClassName="ant-modal-small"
        footer={modalButtons}
        onCancel={onClose}
        afterClose={this.reset}
      >
        <Form key={formKey}>
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
                {getFieldDecorator('tableName', {
                  rules: [{
                    required: true,
                    message: '表格名不能为空'
                  }]
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem label="Source ID" className={utilStyles.hide}>
                {getFieldDecorator('sourceId')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="主键" {...commonFormItemStyle}>
                {getFieldDecorator('primaryKeys', {
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="索引键" {...commonFormItemStyle}>
                {getFieldDecorator('indexKeys', {
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="导入方式" {...commonFormItemStyle}>
                {getFieldDecorator('replaceMode', {
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
                    <p>首次上传文件到新表请选择"新增"</p>
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
      </Modal>
    )
  }
}

const formOptions = {
  onValuesChange (props: IUploadCsvFormProps, values) {
    const { uploadFormValues, onSetUploadFormValue } = props
    onSetUploadFormValue({
      ...uploadFormValues,
      ...values
    })
  },
  mapPropsToFields (props: IUploadCsvFormProps) {
    return Object.entries(props.uploadFormValues)
      .reduce((result, [key, value]) => {
        result[key] = Form.createFormField({ value })
        return result
      }, {})
  }
}

const mapStateToProps = createStructuredSelector({
  uploadFormValues: makeSelectUploadFormValues()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSetUploadFormValue: (values) => dispatch(setUploadFormValue(values))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create(formOptions)(UploadCsvForm))

