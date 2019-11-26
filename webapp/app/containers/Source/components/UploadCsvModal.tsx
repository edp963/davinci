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
import { ICSVMetaInfo } from '../types'

import { Modal, Form, Row, Col, Input, Radio, Upload, Icon, Popover, Button, Steps } from 'antd'
const RadioGroup = Radio.Group
const Step = Steps.Step
const FormItem = Form.Item
import { FormComponentProps } from 'antd/lib/form/Form'
import { UploadProps } from 'antd/lib/upload/Upload'

const styles = require('../Source.less')

interface IUploadCsvFormProps {
  visible: boolean
  step: number
  uploadProps: UploadProps
  csvMeta: ICSVMetaInfo
  onStepChange: (step: number, values?: ICSVMetaInfo) => void
  onUpload: () => void
  onClose: () => void
  onAfterClose: () => void
}

export class UploadCsvForm extends React.PureComponent<IUploadCsvFormProps & FormComponentProps> {

  private commonFormItemStyle = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
  }

  public componentDidUpdate (prevProps: IUploadCsvFormProps & FormComponentProps) {
    const { form, csvMeta, visible } = this.props
    if (csvMeta !== prevProps.csvMeta || visible !== prevProps.visible) {
      form.setFieldsValue(csvMeta)
    }
  }

  private changeStep = (step: number) => () => {
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
      visible,
      step,
      form,
      uploadProps,
      onUpload,
      onClose
    } = this.props
    const { getFieldDecorator } = form

    const baseInfoStyle = classnames({
      [styles.hide]: !!step
    })

    const authInfoStyle = classnames({
      [styles.hide]: !step
    })

    const submitDisabled = uploadProps.fileList.length <= 0 || uploadProps.fileList[0].status !== 'success'

    const modalButtons = step
      ? [(
      <Button
        key="submit"
        size="large"
        type="primary"
        disabled={submitDisabled}
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
        maskClosable={false}
        visible={visible}
        wrapClassName="ant-modal-small"
        footer={modalButtons}
        onCancel={onClose}
        afterClose={this.reset}
      >
        <Form>
          <Row className={styles.formStepArea}>
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
              <FormItem label="表名" {...this.commonFormItemStyle}>
                {getFieldDecorator<ICSVMetaInfo>('tableName', {
                  rules: [{
                    required: true,
                    message: '表格名不能为空'
                  }]
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem label="Source ID" className={styles.hide}>
                {getFieldDecorator<ICSVMetaInfo>('sourceId')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="主键" {...this.commonFormItemStyle}>
                {getFieldDecorator<ICSVMetaInfo>('primaryKeys', {
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="索引键" {...this.commonFormItemStyle}>
                {getFieldDecorator<ICSVMetaInfo>('indexKeys', {
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="导入方式" {...this.commonFormItemStyle}>
                {getFieldDecorator<ICSVMetaInfo>('replaceMode', {
                  initialValue: 0
                })(
                  <RadioGroup>
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
                {...this.commonFormItemStyle}
                label="上传"
              >
                <Upload {...uploadProps} >
                  <Button>
                    <Icon type="upload" />Click to Upload CSV
                  </Button>
                </Upload>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IUploadCsvFormProps & FormComponentProps>()(UploadCsvForm)

