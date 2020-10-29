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

import React from 'react'
import classnames from 'classnames'
import { Form, Row, Col, Input, Tag, Button, Select, Menu, Icon, Tooltip, Popconfirm, Table, Modal} from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
const styles = require('../Project.less')
import Avatar from 'components/Avatar'
const utilStyles = require('assets/less/util.less')
import ProjectRole from './ProjectRole'
import ProjectAdmin from './ProjectAdmin'

interface IProjectsFormProps {
  type: string
  deleteProject: (id: number) => any
  currentProject: any
  organizations?: any
  onModalOk: () => any
  modalLoading: boolean
  onCancel: () => any
  showEditProjectForm: (e) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
  onTabsChange: (mode: string) => any
}

interface IProjectsFormStates {
  mode: string
  name: string
  description: string
  visibility: string
  relationRoleVisible: boolean
  authSettingVisible: boolean
}

export class ProjectsForm extends React.PureComponent<IProjectsFormProps & FormComponentProps, IProjectsFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      mode: '',
      name: '',
      description: '',
      visibility: '',
      relationRoleVisible: false,
      authSettingVisible: false
    }
  }

  private checkout = ({item, key, keyPath}) => {
    this.setState({
      mode: key
    }, () => {
      const { onTabsChange } = this.props
      if (onTabsChange) {
        onTabsChange(this.state.mode)
      }
    })
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private deleteProject = (id) => () => {
    const {deleteProject, onCancel} = this.props
    deleteProject(id)()
    onCancel()
  }

  private toggleModal = (flag: string) => () => {
    if (flag === 'relationRoleVisible') {
      this.setState({
        relationRoleVisible: !this.state[flag]
      })
    } else {
      this.setState({
        authSettingVisible: !this.state[flag]
      })
    }
  }

  private substr (str: string) {
    return  str?.length > 14 ?  `${str.substr(0, 14)}...` : str
  }

  public render () {
    const { type, organizations, modalLoading, onCheckUniqueName } = this.props
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
              ? <Tag color={`${ disabled ? '#ccc' : '#108ee9'}`}>Owner</Tag>
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
    let modalTitle = '创建'
    if (type === 'edit') {
      modalTitle = '修改'
    } else if (type === 'transfer') {
      modalTitle = '移交'
    }
    let mode = void 0
    if (this.state.mode === 'role') {
      mode = <ProjectRole/>
    } else if (this.state.mode === 'admin') {
      mode = <ProjectAdmin/>
    } else {
      const { currentProject: {name, id, description, visibility, createBy}} = this.props
      const currentState = this.props.form.getFieldsValue()
      const disabled = name !== currentState.name || description !== currentState.description || `${visibility}` !== currentState.visibility
      mode =  (
      <div className={styles.basic}>
        <Form>
            <Row gutter={24}>
                <Col span={12}>
                  {type !== 'add' && (
                    <FormItem className={utilStyles.hide}>
                      {getFieldDecorator('id', {})(
                        <Input />
                      )}
                    </FormItem>
                  )}
                    <FormItem label="名称">
                      {getFieldDecorator('name', {
                      //  hidden: this.props.type === 'transfer',
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
                <Col span={12}>
                  <FormItem label="可见">
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
            </Row>
            <Row gutter={24}>
                <Col span={24}>
                  <FormItem label="描述">
                    {getFieldDecorator('description', {
                    //  hidden: this.props.type === 'transfer',
                      initialValue: ''
                    })(
                      <TextArea
                        placeholder="Description"
                        autosize={{minRows: 2, maxRows: 6}}
                      />
                    )}
                  </FormItem>
                </Col>
            </Row>
        </Form>
        <div className={styles.save}>
            <Row>
                <Col>
                    <Button disabled={!disabled} onClick={this.props.onModalOk}>保存修改</Button>
                </Col>
            </Row>
        </div>
        <Row className={styles.Zone}>
            <div className={styles.title}>
              移交项目
            </div>
            <div className={styles.titleDesc}>
              <p className={styles.desc}> <span className={styles.label}>项目名称</span> <b>{name}</b></p>
              <p className={styles.desc}><span className={styles.label}>创建人</span>  <b>{createBy.username}</b></p>
              <p className={styles.button}>
                <Tooltip title="移交">
                  <Button type="default" onClick={this.props.showEditProjectForm}>移交 {this.substr(name)}</Button>
                </Tooltip>
              </p>
            </div>
        </Row>
        <Row className={styles.dangerZone}>
            <div className={styles.title}>
              删除项目
            </div>
            <div className={styles.titleDesc}>
              <p className={styles.desc}>删除后无法恢复，请确定此次操作</p>
              <p className={styles.button}>
                <Popconfirm
                  title="确定删除？"
                  placement="bottom"
                  onConfirm={this.deleteProject(id)}
                >
                  <Tooltip title="删除">
                    <Button type="danger"  onClick={this.stopPPG} >删除 {this.substr(name)}</Button>
                  </Tooltip>
                </Popconfirm>
              </p>
            </div>
        </Row>
      </div>
      )
    }

    return (
        <div className={styles.filterConfig}>
          <div className={styles.left}>
          <Menu
            defaultSelectedKeys={['basic']}
            onClick={this.checkout}
          >
            <Menu.Item key="basic">
              <Icon type="setting" />
              基础设置
            </Menu.Item>
            <Menu.Item key="role">
              <Icon type="trademark" />
              角色管理
            </Menu.Item>
            <Menu.Item key="admin">
              <Icon type="user" />
              管理员设置
            </Menu.Item>
          </Menu>
          </div>
          <div className={styles.center}>
            {mode}
          </div>
        </div>
      )
  }
}

export default Form.create<IProjectsFormProps & FormComponentProps>()(ProjectsForm)




