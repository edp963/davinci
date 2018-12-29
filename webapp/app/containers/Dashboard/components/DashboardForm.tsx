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

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio/radio'
import Select from 'antd/lib/select'
import Tabs from 'antd/lib/tabs'
const TabPane = Tabs.TabPane
const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group

const utilStyles = require('../../../assets/less/util.less')
import { listToTree } from './localPositionUtil'
import AuthControl from '../../Portal/components/AuthControl'

interface IDashboardFormProps {
  portalId: number
  type: string
  itemId: number
  form: any
  dashboards: any[]
  checkedKeys: any[]
  viewTeam: any[]
  initCheckNodes: (checkedKeys: any[]) => any
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
    const { dashboards, type, itemId, initCheckNodes, checkedKeys, viewTeam } = this.props
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
        <Row gutter={8} className={type === 'move' ? '' : utilStyles.hide}>
          <Col span={24}>
            <FormItem label="所属文件夹" {...commonFormItemStyle}>
              {getFieldDecorator('folder', {
                rules: [{
                  required: true,
                  message: '请选择所属文件夹'
                }],
                initialValue: '0'
              })(
                <Select>
                  <Option key="0" value="0">根目录</Option>
                  {folderOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8} className={type === 'delete' || type === 'move' ? utilStyles.hide : ''}>
            <Tabs defaultActiveKey="dashboardInfo">
              <TabPane tab="基本信息" key="dashboardInfo">
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
              </TabPane>
              <TabPane tab="权限管理" key="dashboardControl">
                <AuthControl
                  initCheckNodes={initCheckNodes}
                  checkedKeys={checkedKeys}
                  viewTeam={viewTeam}
                />
              </TabPane>
            </Tabs>
        </Row>
        <p className={type === 'delete' ? '' : utilStyles.hide}>
          确定要删除 {deleteType}：{deleteName} ？
        </p>
      </Form>
    )
  }
}

export default Form.create()(DashboardForm)

