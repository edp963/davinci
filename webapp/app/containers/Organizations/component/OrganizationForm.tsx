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
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Button = require('antd/lib/button')
const Radio = require('antd/lib/radio/radio')
const FormItem = Form.Item
const RadioGroup = Radio.Group
const styles = require('../Organization.less')
const utilStyles = require('../../../assets/less/util.less')

interface IProjectsFormProps {
  form: any
  modalLoading: boolean
  onModalOk: () => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class OrganizationForm extends React.PureComponent<IProjectsFormProps, {}> {
  public render () {
    const { getFieldDecorator } = this.props.form
    const { modalLoading } = this.props
    const commonFormItemStyle = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24}
    }
    const modalButtons = [(
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.props.onModalOk}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            创建组织
          </div>
          <div className={styles.desc}>
            {/* 用户创建组织，邀请成员加入，创建团队 */}
          </div>
        </div>
        <div className={styles.body}>
          <Form>
            <Row gutter={8}>
              <Col span={24}>
                <FormItem label="名称" {...commonFormItemStyle}>
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true,
                      message: 'Name 不能为空'
                    }, {
                      validator: this.props.onCheckUniqueName
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


export default Form.create()((OrganizationForm))
