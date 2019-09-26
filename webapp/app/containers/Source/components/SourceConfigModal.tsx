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

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import pick from 'lodash/pick'
import { ISourceFormValues, IDatasourceInfo } from '../types'

import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Input,
  Select,
  Icon,
  Cascader
} from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form/Form'
import { CascaderOptionType } from 'antd/lib/cascader'
import { SourceProperty } from './types'
import {
  EditableFormTable,
  EditableColumnProps
} from 'components/Table/Editable'

const utilStyles = require('assets/less/util.less')

interface ISourceConfigModalProps
  extends FormComponentProps<ISourceFormValues> {
  visible: boolean
  formLoading: boolean
  testLoading: boolean
  source: ISourceFormValues
  datasourcesInfo: IDatasourceInfo[]
  onSave: (values: any) => void
  onClose: () => void
  onTestSourceConnection: (
    username: string,
    password: string,
    jdbcUrl: string,
    ext: boolean,
    version: string
  ) => any
  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
}

const commonFormItemStyle = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
}

const longFormItemStyle = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
}

const datasourceInfoDisplayRender = (label: string[]) => label.join(' : ')

const columns: Array<EditableColumnProps<SourceProperty>> = [
  {
    title: 'Key',
    dataIndex: 'key',
    width: '30%',
    editable: true,
    inputType: 'input'
  },
  {
    title: 'Value',
    dataIndex: 'value',
    editable: true,
    inputType: 'input'
  }
]
const SourceConfigModal: React.FC<ISourceConfigModalProps> = (props) => {
  const {
    visible,
    source,
    datasourcesInfo,
    form,
    formLoading,
    testLoading,
    onTestSourceConnection,
    onCheckUniqueName,
    onSave,
    onClose
  } = props
  if (!source) {
    return null
  }
  const { id: sourceId } = source
  const { getFieldDecorator } = form
  const [sourceProperties, setSourceProperties] = useState<SourceProperty[]>([])

  useEffect(
    () => {
      let fieldsKeys: Array<keyof ISourceFormValues> = [
        'id',
        'name',
        'type',
        'datasourceInfo',
        'description'
      ]
      // @FIXME nested object properties name typing
      fieldsKeys = []
        .concat(fieldsKeys)
        .concat(['config.username', 'config.password', 'config.url'])

      const fieldsValue = pick(source, fieldsKeys)
      form.setFieldsValue(fieldsValue)
    },
    [source, visible]
  )

  useEffect(
    () => {
      setSourceProperties([...(source.config.properties || [])])
    },
    [source]
  )

  const addProperty = useCallback(
    () => {
      const propertySerial = sourceProperties.length + 1
      setSourceProperties([
        ...sourceProperties,
        {
          key: `New Key ${propertySerial}`,
          value: `New Value ${propertySerial}`
        }
      ])
    },
    [sourceProperties]
  )

  const saveProperties = useCallback((properties: SourceProperty[]) => {
    setSourceProperties(properties)
  }, [])

  const checkNameUnique = useCallback(
    (_, name = '', callback) => {
      const { id, projectId } = source
      const data = { id, name, projectId }
      if (!name) {
        callback()
      }
      onCheckUniqueName(
        'source',
        data,
        () => {
          callback()
        },
        (err) => callback(err)
      )
    },
    [onCheckUniqueName, source]
  )

  const datasourceInfoChange = useCallback(
    (value: string[]) => {
      const datasourceName = value[0]
      const selectedDatasource = datasourcesInfo.find(
        ({ name }) => name === datasourceName
      )
      const prefix = selectedDatasource.prefix
      const currentUrl = form.getFieldValue('config.url') as string
      let hasMatched = false
      let newUrl = currentUrl.replace(/^jdbc:([\w:]+):/, (match) => {
        hasMatched = !!match
        return prefix
      })
      if (!hasMatched) {
        newUrl = prefix + currentUrl
      }
      form.setFieldsValue({ 'config.url': newUrl })
    },
    [datasourcesInfo]
  )

  const testSourceConnection = useCallback(
    () => {
      const {
        datasourceInfo,
        config
      } = form.getFieldsValue() as ISourceFormValues
      const { username, password, url } = config
      const version =
        datasourceInfo[1] === 'Default' ? '' : datasourceInfo[1] || ''
      onTestSourceConnection(username, password, url, !!version, version)
    },
    [form, onTestSourceConnection]
  )

  const save = useCallback(
    () => {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          values.config.properties = sourceProperties.filter(({ key }) => !!key)
          onSave(values)
        }
      })
    },
    [form, sourceProperties, onSave]
  )

  const reset = useCallback(
    () => {
      form.resetFields()
      setSourceProperties([])
    },
    [form]
  )

  const cascaderOptions: CascaderOptionType[] = useMemo(
    () =>
      datasourcesInfo.map(({ name, versions }) => ({
        label: name,
        value: name,
        ...(versions && {
          children: versions.map((ver) => ({
            label: ver,
            value: ver
          }))
        })
      })),
    [datasourcesInfo]
  )

  const modalButtons = useMemo(
    () => [
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={save}
      >
        保 存
      </Button>,
      <Button key="back" size="large" onClick={onClose}>
        取 消
      </Button>
    ],
    [form, formLoading, sourceProperties, onSave, onClose]
  )

  return (
    <Modal
      title={`${!sourceId ? '新增' : '修改'} Source`}
      wrapClassName="ant-modal-large"
      maskClosable={false}
      visible={visible}
      footer={modalButtons}
      onCancel={onClose}
      afterClose={reset}
    >
      <Form>
        <Row>
          <FormItem className={utilStyles.hide}>
            {getFieldDecorator<ISourceFormValues>('id')(<Input />)}
          </FormItem>
          <Col span={12}>
            <FormItem label="名称" {...commonFormItemStyle} hasFeedback>
              {getFieldDecorator<ISourceFormValues>('name', {
                rules: [
                  {
                    required: true,
                    message: '名称不能为空'
                  },
                  {
                    validator: checkNameUnique
                  }
                ]
              })(<Input autoComplete="off" placeholder="Name" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="类型" {...commonFormItemStyle}>
              {getFieldDecorator<ISourceFormValues>('type', {
                initialValue: 'jdbc'
              })(
                <Select>
                  <Option value="jdbc">JDBC</Option>
                  <Option value="csv">CSV文件</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="数据库" {...commonFormItemStyle}>
              {getFieldDecorator<ISourceFormValues>('datasourceInfo', {
                initialValue: []
              })(
                <Cascader
                  options={cascaderOptions}
                  displayRender={datasourceInfoDisplayRender}
                  onChange={datasourceInfoChange}
                />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="用户名" {...commonFormItemStyle}>
              {getFieldDecorator('config.username', {
                initialValue: ''
              })(<Input autoComplete="off" placeholder="User" />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="密码" {...commonFormItemStyle}>
              {getFieldDecorator('config.password', {
                initialValue: ''
              })(
                <Input
                  autoComplete="off"
                  placeholder="Password"
                  type="password"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <FormItem label="连接Url" {...longFormItemStyle}>
          {getFieldDecorator('config.url', {
            rules: [
              {
                required: true,
                message: 'Url 不能为空'
              }
            ],
            initialValue: ''
          })(
            <Input
              placeholder="Connection Url"
              autoComplete="off"
              addonAfter={
                testLoading ? (
                  <Icon type="loading" />
                ) : (
                  <span
                    onClick={testSourceConnection}
                    style={{ cursor: 'pointer' }}
                  >
                    点击测试
                  </span>
                )
              }
            />
          )}
        </FormItem>
        <FormItem label="描述" {...longFormItemStyle}>
          {getFieldDecorator('description', {
            initialValue: ''
          })(
            <TextArea
              placeholder="Description"
              autosize={{ minRows: 2, maxRows: 6 }}
            />
          )}
        </FormItem>
      </Form>
      <FormItem label="配置信息" {...longFormItemStyle}>
        <Button
          type="primary"
          size="small"
          shape="circle"
          icon="plus"
          onClick={addProperty}
        />
        <EditableFormTable
          data={sourceProperties}
          dataKey="key"
          columns={columns}
          onSave={saveProperties}
        />
      </FormItem>
    </Modal>
  )
}

export default Form.create<ISourceConfigModalProps>()(SourceConfigModal)
