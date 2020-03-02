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

import React, { useCallback } from 'react'

import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  TreeSelect,
  Radio,
  Checkbox
} from 'antd'
const FormItem = Form.Item
const { TreeNode } = TreeSelect
const RadioGroup = Radio.Group
import { FormComponentProps } from 'antd/lib/form'

import useDashboardTreeNodes from '../hooks/dashboardTreeNodes'

import { IDashboardWithRole } from './types'
import { DashboardTypes } from './constants'
import { IDashboardNode } from '../types'

interface IDashboardConfigModalProps
  extends FormComponentProps<IDashboardWithRole> {
  visible: boolean
  loading: boolean
  dashboard: IDashboardWithRole
  dashboardNodes: IDashboardNode[]
  onCancel: () => void
  onSave: (dashboard: IDashboardWithRole) => void
}

const DashboardConfigModal: React.FC<IDashboardConfigModalProps> = (props) => {
  const {
    visible,
    loading,
    dashboard,
    dashboardNodes,
    form,
    onCancel,
    onSave
  } = props
  const { id, type } = dashboard
  const { getFieldDecorator } = form
  const nameTitle = type === DashboardTypes.Dashboard ? 'Dashboard ' : '文件夹'
  const modalTitle = `${id > 0 ? '修改' : '新增'} ${nameTitle}}`

  const save = useCallback(() => {
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      onSave(values)
    })
  }, [onSave])

  return (
    <Modal
      title={modalTitle}
      wrapClassName="ant-modal-small"
      visible={visible}
      onCancel={onCancel}
      onOk={save}
      afterClose={form.resetFields}
      confirmLoading={loading}
    >
      <Form>
        <FormItem label={`${nameTitle}名称`}>
          {getFieldDecorator<IDashboardWithRole>('name', {
            rules: [
              {
                required: true,
                message: '名称不能为空'
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem label="所属文件夹">
          {getFieldDecorator<IDashboardWithRole>('parentId', {
            rules: [{ required: true }]
          })(
            <TreeSelect treeDefaultExpandAll>
              {useDashboardTreeNodes(dashboardNodes, true, true)}
            </TreeSelect>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator<IDashboardWithRole>('type', {
            rules: [{ required: true }]
          })(
            <RadioGroup>
              <Radio value={DashboardTypes.Folder}>文件夹</Radio>
              <Radio value={DashboardTypes.Dashboard}>Dashboard</Radio>
            </RadioGroup>
          )}
        </FormItem>
      </Form>
    </Modal>
  )
}

export default DashboardConfigModal
