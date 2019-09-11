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
import { Form, Row, Col, Input, Tag, Button, Select } from 'antd'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
const styles = require('../Project.less')
import Avatar from 'components/Avatar'
const utilStyles = require('assets/less/util.less')

interface IProjectsFormProps {
  type: string
  form: any
  onCheckName: (id, name, type, resolve, reject) => void
  organizations?: any
  onTransfer: () => any
  onModalOk: () => any
  modalLoading: boolean
  onWidgetTypeChange: () => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class ProjectsForm extends React.PureComponent<IProjectsFormProps, {}> {
  constructor (props) {
    super(props)
  }
  public render () {
    const { type, organizations, modalLoading, onCheckUniqueName, onWidgetTypeChange } = this.props
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24 }
    }
    const modalButtons = [(
      <Button
        key="submit"
        size="large"
        type="primary"
        htmlType="submit"
        onClick={this.props.onModalOk}
        loading={modalLoading}
        disabled={modalLoading}
      >
        保 存
      </Button>
    )]

    const transferButtons = [(
      <Button
        key="submit"
        size="large"
        type="primary"
        onClick={this.props.onTransfer}
        loading={modalLoading}
        disabled={modalLoading}
      >
        移交
      </Button>
    )]
    const organizationOptions = organizations ? organizations.map((o) => {
      const orgId = this.props.form.getFieldValue('orgId_hc')
      if (this.props.type === 'transfer' && o.id === Number(orgId)) {
        return []
      }
      const disabled = o.allowCreateProject === false
      return (
        <Option key={o.id} value={`${o.id}`} disabled={disabled} className={styles.selectOption}>
          <div className={styles.title}>
            <span className={styles.owner} style={{color: disabled ? '#ccc' : '#444444'}}>{o.name}</span>
            {`${o.id}` !== this.props.form.getFieldValue('orgId')
              ? o.role === 1 ? <Tag color={`${ disabled ? '#ccc' : '#108ee9'}`}>Owner</Tag> : ''
              : ''}
          </div>
          {`${o.id}` !== this.props.form.getFieldValue('orgId')
            ? (<Avatar size="small" path={o.avatar}/>)
            : ''}
        </Option>
      )
    }) : ''
    const isShowOrganization = classnames({
      [utilStyles.hide]: (this.props.type === 'organizationProject') || (this.props.type === 'edit')
    })
    const isShowDesc = classnames({
      [utilStyles.hide]: this.props.type === 'transfer'
    })
    // const isShowVisibility = classnames({
    //   [utilStyles.hide]: this.props.type !== 'edit'
    // })
    let modalTitle = '创建'
    if (type === 'edit') {
      modalTitle = '修改'
    } else if (type === 'transfer') {
      modalTitle = '移交'
    }
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            {modalTitle}项目
          </div>
          <div className={styles.desc}>
            项目属于组织，可以在项目中连接数据源，生成可视化图表
          </div>
        </div>
        <div className={styles.body}>
          <Form>
            <Row gutter={8}>
              <Col span={24}>
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('id', {
                    hidden: this.props.type === 'add'
                  })(
                    <Input />
                  )}
                </FormItem>
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('orgId_hc', {
                    hidden: this.props.type !== 'transfer'
                  })(
                    <Input />
                  )}
                </FormItem>
                <FormItem label="组织" {...commonFormItemStyle} className={isShowOrganization}>
                  {getFieldDecorator('orgId', {
                    hidden: this.props.type === 'organizationProject',
                    rules: [{
                      required: true,
                      message: 'Name 不能为空'
                    }]
                  })(
                    <Select
                      placeholder="Please select a organization"
                      onChange={onWidgetTypeChange}
                    >
                      {organizationOptions}
                    </Select>
                  )}
                </FormItem>
                <FormItem label="名称" {...commonFormItemStyle} className={isShowDesc}>
                  {getFieldDecorator('name', {
                    hidden: this.props.type === 'transfer',
                    rules: [{
                      required: true,
                      message: 'Name 不能为空'
                    }, {
                      validator: onCheckUniqueName
                    }],
                    validateFirst: true
                  })(
                    <Input placeholder="Name" />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="描述" {...commonFormItemStyle} className={isShowDesc}>
                  {getFieldDecorator('description', {
                    hidden: this.props.type === 'transfer',
                    initialValue: ''
                  })(
                    <TextArea
                      placeholder="Description"
                      autosize={{minRows: 2, maxRows: 6}}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="可见" {...commonFormItemStyle}>
                  {getFieldDecorator('visibility', {
                    // hidden: this.props.type !== 'edit',
                    initialValue: 'true'
                  })(
                    <Select>
                      <Option key="visibility" value="true">
                        公开
                      </Option>
                      <Option key="hidden" value="false">
                        授权
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('pic', {
                    hidden: (this.props.type === 'add') || (this.props.type === 'transfer')
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
        <div className={styles.footer}>
          {type === 'transfer' ? transferButtons : modalButtons}
        </div>
      </div>
    )
  }
}

export default Form.create()(ProjectsForm)




