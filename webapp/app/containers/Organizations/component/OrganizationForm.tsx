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
const Button = require('antd/lib/button')
const Radio = require('antd/lib/radio/radio')
const FormItem = Form.Item
const RadioGroup = Radio.Group
const styles = require('../Organization.less')
import { checkNameUniqueAction } from '../../App/actions'

const utilStyles = require('../../../assets/less/util.less')

interface IProjectsFormProps {
  type: string
  form: any
  onCheckName: (id, name, type, resolve, reject) => void
}

export class OrganizationForm extends React.PureComponent<IProjectsFormProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    // const { onCheckUniqueName, loginUser: {id} } = this.props
    // // const { getFieldsValue } = this.props.form
    // // const { id } = getFieldsValue()
    // const data = {
    //   username: value,
    //   id
    // }
    // onCheckUniqueName('user', data,
    //   () => {
    //     callback()
    //   }, (err) => {
    //     callback(err)
    //   })
  }
  public render () {
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24}
    }
    const modalButtons = [(
      <Button
        key="submit"
        size="large"
        type="primary"
       // onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            Create New Projects
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
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('create_by', {
                    hidden: this.props.type === 'add'
                  })(
                    <Input />
                  )}
                </FormItem>
                <FormItem className={utilStyles.hide}>
                  {getFieldDecorator('visibility', {})(
                    <Input />
                  )}
                </FormItem>
                <FormItem label="组织" {...commonFormItemStyle}>
                  {getFieldDecorator('orgId', {
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
                <FormItem label="名称" {...commonFormItemStyle}>
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
              <Col span={24}>
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

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default Form.create()(connect<{}, {}, IProjectsFormProps>(null, mapDispatchToProps)(OrganizationForm))
