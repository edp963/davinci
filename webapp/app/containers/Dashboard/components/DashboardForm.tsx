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
import { connect } from 'react-redux'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Radio = require('antd/lib/radio/radio')
const Select = require('antd/lib/select')
const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group

const utilStyles = require('../../../assets/less/util.less')
import { listToTree } from './localPositionUtil'

interface IDashboardFormProps {
  portalId: number
  type: string
  itemId: number
  form: any
  dashboards: any[]
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class DashboardForm extends React.PureComponent<IDashboardFormProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, type, form, portalId} = this.props
    const { id } = form.getFieldsValue()
    const data = {
      portal: portalId,
      id: type === ('add' || 'copy') ? '' : id,
      name: value
    }

    if (!value) {
      callback()
    }

    type === 'move'
      ? callback()
      : onCheckUniqueName('dashboard', data,
          () => {
            callback()
        }, (err) => {
          callback(err)
        })
  }

  public render () {
    const { getFieldDecorator } = this.props.form
    const { dashboards, type, itemId } = this.props
    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    const dashboardsArr = (dashboards as any[]).filter((d) => d.type === 0)
    const folderOptions = (dashboardsArr as any[]).map((s) => <Option key={`${s.id}`} value={`${s.id}`}>{s.name}</Option>)

    const deleteItem = (dashboards as any[]).find((d) => d.id === Number(itemId))
    let deleteType = ''
    let deleteName = ''
    if (deleteItem) {
      deleteType = deleteItem.type === 0 ? '文件夹' : 'Dashboard'
      deleteName = deleteItem.name
    }

    return (
      <Form>
        <FormItem className={utilStyles.hide}>
          {getFieldDecorator('id', {
            hidden: type === 'add' && 'copy'
          })(
            <Input />
          )}
        </FormItem>
        <Row gutter={8} className={type === 'delete' ? utilStyles.hide : ''}>
          <Col span={24}>
            <FormItem label="所属文件夹" {...commonFormItemStyle}>
              {getFieldDecorator('folder', {
                rules: [{
                  required: true,
                  message: '请选择所属文件夹'
                }],
                // initialValue: (folderOptions as any[]).length ? `${dashboardsArr[0].name}` : ''
                initialValue: '0'
              })(
                <Select>
                  <Option key="0" value="0">根目录</Option>
                  {folderOptions}
                </Select>
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('config', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('index', {})(
                <Input />
              )}
            </FormItem>
            <FormItem
              label={type === 'copy' ? '重命名' : '名称'}
              {...commonFormItemStyle}
              hasFeedback
              className={type === 'move' ? utilStyles.hide : ''}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: 'Name 不能为空'
                }, {
                  validator: this.checkNameUnique
                }]
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
          </Col>
          {/* <Col span={24}>
            <FormItem label="描述" {...commonFormItemStyle}>
              {getFieldDecorator('desc', {
                initialValue: ''
              })(
                <Input
                  placeholder="Description"
                  type="textarea"
                  autosize={{minRows: 2, maxRows: 6}}
                />
              )}
            </FormItem>
          </Col> */}
          <Col span={24}>
            <FormItem
              label="选择类型"
              {...commonFormItemStyle}
              className={type === 'move' ? utilStyles.hide : ''}
            >
              {getFieldDecorator('selectType', {
                initialValue: true
              })(
                <RadioGroup disabled={type === 'edit' || type === 'copy' || type === 'move'}>
                  <Radio value={false}>文件夹</Radio>
                  <Radio value>Dashboard</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <p className={type === 'delete' ? '' : utilStyles.hide}>
          确定要删除 {deleteType}：{deleteName} ？
        </p>
      </Form>
    )
  }
}

export default Form.create()(DashboardForm)

