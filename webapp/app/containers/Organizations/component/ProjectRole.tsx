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
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Button, Row, Col, Input, Tooltip, Popconfirm, Table, Modal, Form, Divider } from 'antd'
import RoleForm from './Transfer'
import Auth from './ProjectAuth'
import AntdFormType from 'antd/lib/form/Form'
import { OrganizationActions } from '../actions'
const { loadOrganizationRole, loadProjectRoles, getVizVisbility, postVizVisbility } = OrganizationActions
const styles = require('../Project.less')
import {createStructuredSelector} from 'reselect'
import { ProjectActions } from 'containers/Projects/actions'
const { addProjectRole, loadRelRoleProject, updateRelRoleProject, deleteRelRoleProject } = ProjectActions
import {makeSelectCurrentOrganizationProject, makeSelectCurrentOrganizationRole, makeSelectCurrentOrganizationProjectRoles, makeSelectCurrentOrganizations } from '../selectors'
import { makeSelectCurrentProjectRole} from 'containers/Projects/selectors'
import { makeSelectVizs } from 'containers/Schedule/selectors'

interface IRoleStates {
  relationRoleVisible: boolean
  authSettingVisible: boolean
  roleTargetKeys: any[]
  projectRoles: any[]
  searchValue: string
  vizs: any[]
}

export interface IProjectRoles {
  id: number
  name: string
  description: string
}
interface IRoleProps {
  form?: any
  projectRoles: IProjectRoles[]
  projectDetail: any
  organizationRoles: any[]
  currentProjectRole: {
    id: number
    description: string
    name: string
    permission: object
  }
  vizs: any
  currentOrganization: any
  onLoadOrganizationRole: (id: number) => any
  onLoadProjectRoles: (id: number) => any
  onAddProjectRole: (id: number, roleIds: number[], resolve: () => any) => any
  onLoadRelRoleProject: (id: number, roleId: number) => any,
  onUpdateRelRoleProject: (roleId: number, projectId: number, projectRole: object) => any
  onDeleteRelRoleProject: (roleId: number, projectId: number, resolve?: () => any) => () => any
  onLoadVizVisbility: (roleId: number, projectId: number, resolve: any) => any
  onPostVizVisbility: (id: number, permission: object, reslove: any) => any
}

export class ProjectRole extends React.Component<IRoleProps, IRoleStates> {
  private RoleForm: AntdFormType = null
  private refHandlers = {
    RoleForm: (ref) => this.RoleForm = ref
  }
  constructor (props) {
    super(props)
    this.state = {
      vizs: [],
      searchValue: '',
      projectRoles: [],
      roleTargetKeys: [],
      relationRoleVisible: false,
      authSettingVisible: false
    }
  }

  public componentWillMount () {
    const {vizs} = this.props
    this.loadOrganizationRole()
    this.loadProjectRoles(this.props.projectDetail['id'])
    if (vizs && vizs.length) {
      this.setState({vizs})
    }
  }

  private loadOrganizationRole = () => this.props.onLoadOrganizationRole(this.props.currentOrganization['id'])

  private loadProjectRoles = (id) => this.props.onLoadProjectRoles(id)

  private loopVizs = (key, value, tree) => {
    tree.forEach((viz) => {
      if (viz.children) {
        this.loopVizs(key, value, viz.children)
      }
      if (viz.vizType === key.slice(0, -1)) {
        viz.permission = value.some((val) => val === viz.id) ? 0 : 1
      } else {
        return
      }
    })
  }
  private toggleModal = (flag: string, id?: number) => () => {
    if (id) {
      const {onLoadRelRoleProject, projectDetail, onLoadVizVisbility} = this.props
      const vizs = this.state.vizs
      onLoadRelRoleProject(projectDetail.id, id)
      onLoadVizVisbility(id, projectDetail.id, (result) => {
        Object.entries(result).forEach(([key, value]) => {
          this.loopVizs(key, value, vizs)
          this.setState({
            vizs
          })
        })
      })
    }
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

  public componentWillReceiveProps (nextProps) {
    const { projectRoles, projectDetail: {id} } = nextProps
    if (projectRoles !== this.props.projectRoles) {
        this.setState ({
          projectRoles
        })
        const roled = projectRoles.map((role) => role.id)
        this.setState({roleTargetKeys: roled})
    }
    if (id !== this.props.projectDetail['id']) {
      this.loadProjectRoles(id)
    }
  }

  private searchChange = (e) => {
    const searchValue = e.target.value
    const result = (this.props.projectRoles as any[]).filter((role) => {
      return role && role.name.trim().indexOf(searchValue.trim()) > -1
    })
    this.setState({
      searchValue,
      projectRoles: searchValue && searchValue.length ? result : this.props.projectRoles
    })
  }


  private onRelProjectrole = () => {
    const { roleTargetKeys } = this.state
    const { projectDetail: {id} } = this.props
    this.props.onAddProjectRole(id, roleTargetKeys, () => {
        this.loadProjectRoles(id)
        this.toggleModal('relationRoleVisible')()
    })
  }

  private setRowKeys = (item) => item.id
  private setTransferOptionTitle = (item) => item.name
  private transferFilterOption = (inputValue, option) => option.user.username.indexOf(inputValue) > -1
  private setRoleTargetKeys = (newTargetKeys) => {
    if (newTargetKeys) {
      this.setState({roleTargetKeys: newTargetKeys})
    }
  }

  private changeModulePermission = (record, event) => {
    const { user } = record
    const { onUpdateRelRoleProject, currentProjectRole, projectDetail} = this.props
    onUpdateRelRoleProject(currentProjectRole.id, projectDetail.id, {
      ...currentProjectRole.permission,
      [`${user}Permission`] : event.target.value
    })
  }

  private changeVizPermission = (record, event) => {
    const { onPostVizVisbility, currentProjectRole: {id} } = this.props
    const { vizs } = this.state
    onPostVizVisbility(id, {
      id: record.id,
      visible: event.target.value,
      viz: record.vizType
    }, (result) => {
      loop(vizs, record)
      this.setState({vizs}, () => console.log(this.state.vizs))
    })
    function loop (arr, record) {
      arr.forEach((a) => {
        if (a.children && a.children.length) {
          loop(a.children, record)
        }
        if (a.id && a.id === record.id && a.vizType === record.vizType) {
          a.permission = event.target.value
        } else {
          return
        }
      })
    }
  }



  public render () {
    const { organizationRoles, projectDetail } = this.props
    const { projectRoles } = this.state
    const roles = projectRoles && projectRoles.length ? projectRoles : []
    const addButton =  (
      <Tooltip placement="bottom" title="关联">
        <Button
          type="primary"
          icon="plus"
          onClick={this.toggleModal('relationRoleVisible')}
        >
          关联角色
        </Button>
      </Tooltip>
    )

    const relButton =
    (
      <Button
        key="submit"
        type="primary"
      //  loading={adminModalLoading}
      //  disabled={adminModalLoading}
        onClick={this.onRelProjectrole}
      >
        保 存
      </Button>
    )

    const columns = [
      {
        title: '角色名称',
        dataIndex: 'name',
        key: 'rolename',
        // render: (text) => <span>{text.role === 1 ? '拥有者' : '成员'}</span>
      },
      {
          title: '设置',
          dataIndex: 'user',
          // className: isHidden ? utilStyles.hide : '',
          key: 'settings',
          render: (text, record) => {
            return (
              <span>
                <a href="javascript:;" onClick={this.toggleModal('authSettingVisible', record.id)}>权限设置</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="确定删除？"
                  placement="bottom"
                  onConfirm={this.props.onDeleteRelRoleProject(record.id, projectDetail.id, () => this.loadProjectRoles(projectDetail.id))}
                >
                  <Tooltip title="删除">
                   <a href="javascript:;">删除角色</a>
                  </Tooltip>
                </Popconfirm>
              </span>
            )
          }
        }]
    return (
      <div className={styles.role}>
        <Row>
          <Col span={14}>
              <Input.Search
                  placeholder="搜索角色"
                  value={this.state.searchValue}
                  onChange={this.searchChange}
              />
          </Col>
          <Col span={2} offset={6}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={columns}
              dataSource={roles}
              pagination={false}
            />
          </div>
        </Row>
        <Modal
          key="roleFormKey"
          title="关联角色"
          visible={this.state.relationRoleVisible}
          footer={relButton}
          onCancel={this.toggleModal('relationRoleVisible')}
          // afterClose={this.afterMemberFormClose}
        >
          <RoleForm
            wrappedComponentRef={this.refHandlers.RoleForm}
            dataSource={organizationRoles}
            optionTitle={this.setTransferOptionTitle}
            filterOption={this.transferFilterOption}
            adminTargetKeys={this.state.roleTargetKeys}
            targetKeys={this.state.roleTargetKeys}
            setTargetKeys={this.setRoleTargetKeys}
            rowKeys={this.setRowKeys}
          />
        </Modal>
        <Modal
          footer={null}
          title="权限设置"
          visible={this.state.authSettingVisible}
          onCancel={this.toggleModal('authSettingVisible')}
          // afterClose={this.afterChangeRoleFormClose}
          wrapClassName="ant-modal-large ant-modal-center"
        >
          <Auth
            vizs={this.state.vizs}
            currentProjectRole={this.props.currentProjectRole}
            onChangeModulePermission={this.changeModulePermission}
            onChangeVizPermission={this.changeVizPermission}
          />
        </Modal>
      </div>
    )
  }
}



const mapStateToProps = createStructuredSelector({
  vizs: makeSelectVizs(),
  currentOrganization: makeSelectCurrentOrganizations(),
  projectDetail: makeSelectCurrentOrganizationProject(),
  organizationRoles: makeSelectCurrentOrganizationRole(),
  projectRoles: makeSelectCurrentOrganizationProjectRoles(),
  currentProjectRole: makeSelectCurrentProjectRole()
})

export function mapDispatchToProps (dispatch) {
  return {
     onLoadOrganizationRole: (id) => dispatch(loadOrganizationRole(id)),
     onLoadProjectRoles: (id) => dispatch(loadProjectRoles(id)),
     onAddProjectRole: (id, roleIds, resolve) => dispatch(addProjectRole(id, roleIds, resolve)),
     onLoadRelRoleProject: (id, roleId) => dispatch(loadRelRoleProject(id, roleId)),
     onUpdateRelRoleProject: (roleId, projectId, projectRole) => dispatch(updateRelRoleProject(roleId, projectId, projectRole)),
     onDeleteRelRoleProject: (roleId, projectId, resolve) => () => dispatch(deleteRelRoleProject(roleId, projectId, resolve)),
     onLoadVizVisbility: (roleId, projectId, resolve) => dispatch(getVizVisbility(roleId, projectId, resolve)),
     onPostVizVisbility: (id, permission, reslove) => dispatch(postVizVisbility(id, permission, reslove))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
export default compose(withConnect)(ProjectRole)






