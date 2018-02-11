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

import React, { PropTypes } from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import { makeSelectSqlValidateCode, makeSelectSqlValidateMsg } from './selectors'
import {checkNameAction} from '../App/actions'
import Form from 'antd/lib/form'
import Checkbox from 'antd/lib/checkbox'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Steps from 'antd/lib/steps'
import Table from 'antd/lib/table'
import Alert from 'antd/lib/alert'
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step

import utilStyles from '../../assets/less/util.less'

export class BizlogicForm extends React.Component {

  checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    let idName = type === 'add' ? '' : id
    let typeName = 'view'
    onCheckName(idName, value, typeName,
      res => {
        callback()
      }, err => {
        callback(err)
      })
  }
  render () {
    const {
      form,
      step,
      sources,
      groups,
      groupParams,
      selectedGroups,
      onGroupSelect,
      onGroupParamChange,
      onAuthorityChange,
      sqlValidateCode,
      sqlValidateMessage,
      isShowUpdateSql,
      isShowSqlValidateAlert
    } = this.props
    const { getFieldDecorator } = form

    const commonFormItemStyle = {
      labelCol: { span: 2 },
      wrapperCol: { span: 21 }
    }

    const sourceOptions = sources.map(s => (
      <Option key={`${s.id}`} value={`${s.id}`}>{s.name}</Option>
    ))

    const baseInfoStyle = classnames({
      [utilStyles.hide]: !!step
    })
    const authInfoStyle = classnames({
      [utilStyles.hide]: !step
    })

    let columns = [{
      title: '用户组',
      dataIndex: 'name',
      className: `${utilStyles.textAlignLeft}`,
      width: 140,
      key: 'name'
    }, {
      title: '权限',
      dataIndex: 'authority',
      key: 'authority',
      width: 500,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) =>
        <CheckboxGroup
          options={['share', 'download']}
          value={record.authority}
          disabled={!record.checked}
          onChange={(e) => onAuthorityChange(e, record)}
        />
    }]
    groupParams.forEach((gp, index) => {
      columns.push({
        title: gp,
        key: gp,
        className: `${utilStyles.textAlignCenter}`,
        width: 80,
        render: (text, record) => (
          <Input
            value={record.params.length ? record.params[index].v : ''}
            onChange={onGroupParamChange(record.id, index)}
            className="ant-input ant-input-lg"
            disabled={!record.checked}
          />
        )
      })
    })
    const sqlValidatePanel = isShowSqlValidateAlert ? <Alert
      message={`syntax check ${sqlValidateCode === 200 ? 'success' : 'error'}`}
      description={`${sqlValidateMessage || ''}`}
      type={`${sqlValidateCode === 200 ? 'success' : 'error'}`}
      showIcon
    /> : ''
    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            <Steps current={step}>
              <Step title="基本信息" />
              <Step title="权限配置" />
              <Step title="完成" />
            </Steps>
          </Col>
        </Row>
        <Row className={baseInfoStyle}>
          <Col span={12}>
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
            <FormItem
              label="名称"
              labelCol={{span: 4}}
              wrapperCol={{span: 18}}
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
          <Col span={12}>
            <FormItem
              label="Source"
              labelCol={{span: 4}}
              wrapperCol={{span: 18}}
            >
              {getFieldDecorator('source_id', {
                initialValue: sources.length ? `${sources[0].id}` : ''
              })(
                <Select>
                  {sourceOptions}
                </Select>
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
            <FormItem label="QUERY" {...commonFormItemStyle}>
              {getFieldDecorator('sql_tmpl', {
                initialValue: ''
              })(
                <Input
                  placeholder="QUERY SQL Template"
                  type="textarea"
                  autosize={{minRows: 8, maxRows: 24}}
                />
              )}
            </FormItem>
          </Col>
          <Col span={24} style={{display: isShowUpdateSql ? 'block' : 'none'}}>
            <FormItem label="UPDATE" {...commonFormItemStyle}>
              {getFieldDecorator('update_sql', {
                initialValue: ''
              })(
                <Input
                  placeholder="UPDATE SQL Template"
                  type="textarea"
                  autosize={{minRows: 4, maxRows: 24}}
                />
              )}
            </FormItem>
          </Col>
          <Col span={21} offset={2}>
            {sqlValidatePanel}
          </Col>
        </Row>
        <Row className={authInfoStyle}>
          <Col span={24}>
            <Table
              dataSource={groups}
              columns={columns}
              rowSelection={{
                selectedRowKeys: selectedGroups,
                onChange: onGroupSelect
              }}
              pagination={false}
              scroll={{y: 360}}
            />
          </Col>
        </Row>
      </Form>
    )
  }
  componentDidUpdate (prevProps) {
    const {onCodeMirrorChange} = this.props
    let queryTextarea = document.querySelector('#sql_tmpl')
    let updateTextarea = document.querySelector('#update_sql')
    if (onCodeMirrorChange) {
      onCodeMirrorChange(queryTextarea, updateTextarea)
    }
  }
}

const mapStateToProps = createStructuredSelector({
  sqlValidateCode: makeSelectSqlValidateCode(),
  sqlValidateMessage: makeSelectSqlValidateMsg()
})

BizlogicForm.propTypes = {
  type: PropTypes.string,
  step: PropTypes.number,
  sources: PropTypes.array,
  groups: PropTypes.array,
  groupParams: PropTypes.array,
  selectedGroups: PropTypes.array,
  onGroupSelect: PropTypes.func,
  onGroupParamChange: PropTypes.func,
  onAuthorityChange: PropTypes.func,
  onCodeMirrorChange: PropTypes.func,
  sqlValidateCode: PropTypes.any,
  sqlValidateMessage: PropTypes.any,
  isShowSqlValidateAlert: PropTypes.bool,
  isShowUpdateSql: PropTypes.bool,
  form: PropTypes.any,
  onCheckName: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(BizlogicForm))

