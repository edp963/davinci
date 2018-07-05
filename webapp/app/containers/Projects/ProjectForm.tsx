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
const Tag = require('antd/lib/tag')
const Button = require('antd/lib/button')
const Select = require('antd/lib/select')
const Option = Select.Option
const FormItem = Form.Item
const styles = require('./Project.less')
import Avatar from '../../components/Avatar'
const utilStyles = require('../../assets/less/util.less')

interface IProjectsFormProps {
  type: string
  form: any
  onCheckName: (id, name, type, resolve, reject) => void
  organizations: any
  onModalOk: () => any
  modalLoading: boolean
  onWidgetTypeChange: () => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IProjectsFormState {

}

export class ProjectsForm extends React.PureComponent<IProjectsFormProps, IProjectsFormState> {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  public render () {
    const { organizations, modalLoading, onCheckUniqueName, onWidgetTypeChange } = this.props
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
        onClick={this.props.onModalOk}
        loading={modalLoading}
        disabled={modalLoading}
      >
        保 存
      </Button>
    )]

    const organizationOptions = organizations ? organizations.map((o) => (
      <Option key={o.id} value={`${o.id}`} className={styles.selectOption}>
        <div className={styles.title}>
          <span className={styles.owner}>{o.name}</span>
          {`${o.id}` !== this.props.form.getFieldValue('orgId')
            ? (<Tag color="#108ee9">Owner</Tag>)
            : ''}
        </div>
        {`${o.id}` !== this.props.form.getFieldValue('orgId')
          ? (<Avatar size="small" path={o.avatar}/>)
          : ''}
      </Option>
    )) : ''
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            { this.props.type === 'add' ? '创建' : '修改'}项目
          </div>
          <div className={styles.desc}>
            create new project
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
                <FormItem label="组织" {...commonFormItemStyle}>
                  {getFieldDecorator('orgId', {
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
                <FormItem label="名称" {...commonFormItemStyle}>
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true,
                      message: 'Name 不能为空'
                    }, {
                      validator: onCheckUniqueName
                    }]
                  })(
                    <Input placeholder="Name" />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="描述" {...commonFormItemStyle}>
                  {getFieldDecorator('description', {
                    initialValue: ''
                  })(
                    <Input
                      placeholder="Description"
                      type="textarea"
                      autosize={{minRows: 2, maxRows: 6}}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('pic', {
                    hidden: this.props.type === 'add'
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
        <div className={styles.footer}>
          {modalButtons}
        </div>
      </div>
    )
  }
}

export default Form.create()(ProjectsForm)




