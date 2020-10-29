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

import React, {
  useImperativeHandle,
  useMemo,
  forwardRef
} from 'react'
import classnames from 'classnames'
import { Form, Row, Col, Input, Tag, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
const styles = require('../../Organizations/Project.less')
import Avatar from 'components/Avatar'
const utilStyles = require('assets/less/util.less')
import { IProjectFormFieldProps, IProjectsFormProps, FormType } from '../types'
import {uuid} from 'utils/util'



const EnhanceButton: React.FC<Partial<IProjectsFormProps>> = ({
  onModalOk, modalLoading, onTransfer, type
}) => {

  const getType = useMemo(() => {
    if (type === 'transfer') {
      return '移 交'
    }
    return '保 存'
  }, [type])

  return (
    <Button
      key={`submit${uuid(8, 16)}`}
      size="large"
      type="primary"
      htmlType="submit"
      onClick={type==='transfer' ? onTransfer : onModalOk }
      loading={modalLoading}
      disabled={modalLoading}
    >
      {getType}
    </Button>
  )
}

const ProjectsForm: React.FC<IProjectsFormProps & FormComponentProps> = ({
  form, type, organizations, modalLoading, onCheckUniqueName,
  onModalOk, onTransfer, currentPro
}, ref) => {

    const commonFormItemStyle = useMemo(() => (
      {
        labelCol: { span: 3 },
        wrapperCol: { span: 24 }
      }
    ), ['nf'])

    const isShowOrganization = useMemo(() => {
      return classnames({
        [utilStyles.hide]: (type === 'organizationProject') || (type === 'edit')
      })
    }, [type])

    const isShowDesc = useMemo(() => {
      return classnames({
        [utilStyles.hide]: type === 'transfer'
      })
    }, [type])

    const getModalTitle = useMemo(() => {
      return FormType[type]
    }, [type])


    useImperativeHandle(ref, () => ({form}))

    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            {getModalTitle}项目
          </div>
          <div className={styles.desc}>
            项目属于组织，可以在项目中连接数据源，生成可视化图表
          </div>
        </div>
        <div className={styles.body}>
          <Form>
            <Row gutter={8}>
              <Col span={24}>
                {type !== 'add' && (
                  <FormItem className={utilStyles.hide}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('id', {
                      initialValue: currentPro.id
                    })(
                      <Input />
                    )}
                  </FormItem>
                )}
                {type === 'transfer' && (
                  <FormItem className={utilStyles.hide}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('orgId_hc', {
                      initialValue: `${currentPro.orgId}`
                    })(
                      <Input />
                    )}
                  </FormItem>
                )}
                {type !== 'organizationProject' && (
                  <FormItem label="组织" {...commonFormItemStyle} className={isShowOrganization}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('orgId', {
                      initialValue: `${type !== 'transfer' ? currentPro.orgId ? currentPro.orgId : '' : ''}`,
                      rules: [{
                        required: true,
                        message: '组织名称 不能为空'
                      }]
                    })(
                      <Select
                        placeholder="Please select a organization"
                      >
                        {
                          organizations ? organizations.map((o) => {
                            const orgId = form.getFieldValue('orgId_hc')
                            if (type === 'transfer' && o.id === Number(orgId)) {
                              return []
                            }
                            const disabled = o.allowCreateProject === false
                            return (
                              <Option key={o.id} value={`${o.id}`} disabled={disabled} className={styles.selectOption}>
                                <div className={styles.title}>
                                  <span className={styles.owner} style={{color: disabled ? '#ccc' : '#444444'}}>{o.name}</span>
                                  {`${o.id}` !== form.getFieldValue('orgId')
                                    ? o.role === 1 ? <Tag color={`${ disabled ? '#ccc' : '#108ee9'}`}>Owner</Tag> : ''
                                    : ''}
                                </div>
                                {`${o.id}` !== form.getFieldValue('orgId')
                                  ? (<Avatar size="small" path={o.avatar}/>)
                                  : ''}
                              </Option>
                            )
                          }) : []
                        }
                      </Select>
                    )}
                  </FormItem>
                )}
                {type !== 'transfer' && (
                  <FormItem label="名称" {...commonFormItemStyle} className={isShowDesc}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('name', {
                      initialValue: currentPro.name,
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
                )}
              </Col>
              <Col span={24}>
                {type !== 'transfer' && (
                  <FormItem label="描述" {...commonFormItemStyle} className={isShowDesc}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('description', {
                      initialValue: currentPro.description
                    })(
                      <TextArea
                        placeholder="Description"
                        autosize={{minRows: 2, maxRows: 6}}
                      />
                    )}
                  </FormItem>
                )}
              </Col>
              <Col span={24}>
                <FormItem label="可见" {...commonFormItemStyle}>
                  {form.getFieldDecorator<IProjectFormFieldProps>('visibility', {
                    initialValue: type !== 'add' ? `${currentPro.visibility}` : 'true'
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
                {type !== 'add' && type !== 'transfer' && (
                  <FormItem className={utilStyles.hide}>
                    {form.getFieldDecorator<IProjectFormFieldProps>('pic', {
                      initialValue: currentPro.pic
                    })(
                      <Input />
                    )}
                  </FormItem>
                )}
              </Col>
            </Row>
          </Form>
        </div>
        <div className={styles.footer}>
          <EnhanceButton 
            type={type}
            modalLoading={modalLoading}
            onModalOk={onModalOk}
            onTransfer={onTransfer}
          />
        </div>
      </div>
    )
  }


export default Form.create<IProjectsFormProps & FormComponentProps>()(forwardRef(ProjectsForm))




