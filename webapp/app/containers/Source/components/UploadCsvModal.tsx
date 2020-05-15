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

import React, { useCallback, useState } from 'react'

import {
  Modal,
  Form,
  Input,
  Radio,
  Popover,
  Upload,
  Icon,
  Button,
  message
} from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { FormItemProps, FormComponentProps } from 'antd/lib/form'
import { UploadProps } from 'antd/lib/upload'

import { ICSVMetaInfo } from '../types'

const formItemLayout: Partial<FormItemProps> = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
}

interface IUploadCsvModalProps extends FormComponentProps<ICSVMetaInfo> {
  visible: boolean
  sourceId: number
  uploading: boolean
  onValidate: (
    values: Pick<ICSVMetaInfo, 'sourceId' | 'tableName' | 'mode'>,
    callback: (errMsg?: string) => void
  ) => void
  onOk: (value: ICSVMetaInfo) => void
  onCancel: () => void
}

const UploadCsvModal: React.FC<IUploadCsvModalProps> = (props) => {
  const { visible, sourceId, uploading, form, onValidate, onOk, onCancel } = props
  const { getFieldDecorator } = form

  const [files, setFiles] = useState([])

  const preventUpload: UploadProps['beforeUpload'] = useCallback((file) => {
    setFiles([file])
    return false
  }, [])

  const save = useCallback(() => {
    if (!files.length) {
      message.error('请上传 csv 文件！')
      return
    }
    form.validateFields((err, values) => {
      if (err) {
        return
      }
      values.file = files[0]
      values.sourceId = sourceId
      onOk(values)
    })
  }, [sourceId, files, onOk])

  const validateTableName = useCallback(
    (_, tableName: string, callback) => {
      onValidate(
        {
          sourceId,
          tableName,
          mode: form.getFieldValue('mode')
        },
        callback
      )
    },
    [sourceId, onValidate]
  )

  const resetFields = useCallback(() => {
    form.resetFields()
    setFiles([])
  }, [])

  return (
    <Modal
      title="上传 CSV 文件"
      visible={visible}
      maskClosable={false}
      afterClose={resetFields}
      confirmLoading={uploading}
      onOk={save}
      onCancel={onCancel}
    >
      <Form>
        <FormItem label="表名" {...formItemLayout}>
          {getFieldDecorator<ICSVMetaInfo>('tableName', {
            rules: [
              {
                required: true,
                message: '表名不能为空'
              },
              {
                validator: validateTableName
              }
            ],
            validateFirst: true,
            validateTrigger: ''
          })(<Input />)}
        </FormItem>
        <FormItem label="主键" {...formItemLayout}>
          {getFieldDecorator<ICSVMetaInfo>('primaryKeys', {})(<Input />)}
        </FormItem>
        <FormItem label="索引键" {...formItemLayout}>
          {getFieldDecorator<ICSVMetaInfo>('indexKeys', {})(<Input />)}
        </FormItem>
        <FormItem label="导入方式" {...formItemLayout}>
          {getFieldDecorator<ICSVMetaInfo>('mode', {
            initialValue: 0
          })(
            <RadioGroup>
              <Radio value={0}>新增</Radio>
              <Radio value={1}>替换</Radio>
              <Radio value={2}>追加</Radio>
              <Radio value={3}>覆盖</Radio>
            </RadioGroup>
          )}
          <Popover
            placement="right"
            content={
              <>
                <p>新增：首次上传文件到新表</p>
                <p>替换：保持原有表结构不变，清空原有表数据后上传</p>
                <p>追加：保持原有表结构不变，保持原有表数据并追加</p>
                <p>覆盖：重建表结构并替换数据</p>
              </>
            }
          >
            <Icon type="question-circle-o" />
          </Popover>
        </FormItem>
        <FormItem label="上传" {...formItemLayout}>
          <Upload
            accept=".csv"
            multiple={false}
            fileList={files}
            beforeUpload={preventUpload}
          >
            <Button>
              <Icon type="upload" />
              Click to Upload CSV
            </Button>
          </Upload>
        </FormItem>
      </Form>
    </Modal>
  )
}

export default Form.create<IUploadCsvModalProps>()(UploadCsvModal)
