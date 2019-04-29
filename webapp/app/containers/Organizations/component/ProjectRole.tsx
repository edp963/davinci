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
import * as classnames from 'classnames'
import { Icon, Button, Row, Col, Input, Tooltip, Popconfirm, Table, Modal, Form } from 'antd'
const FormItem = Form.Item
const InputGroup = Input.Group
import Avatar from '../../../components/Avatar/index'
import RoleForm from './Transfer'
import Auth from './ProjectAuth'
import AntdFormType from 'antd/lib/form/Form'
import { loadOrganizationRole, loadProjectRoles } from '../actions'
const styles = require('../containers/Projects/Project.less')
const utilStyles =  require('../../../assets/less/util.less')
import {createStructuredSelector} from 'reselect'
import { addProjectRole, addProjectRoleFail, loadRelRoleProject, updateRelRoleProject} from '../containers/Projects/actions'
import {makeSelectCurrentOrganizationProject, makeSelectCurrentOrganizationRole, makeSelectCurrentOrganizationProjectRoles } from '../selectors'
import { makeSelectCurrentProjectRole} from '../containers/Projects/selectors'

interface IRoleStates {
  relationRoleVisible: boolean
  authSettingVisible: boolean
  roleTargetKeys: any[]
  projectRoles: any[]
  searchValue: string
}

interface IRoleProps {
  form?: any
  projectRoles: any[]
  projectDetail: any
  organizationRoles: any[]
  currentProjectRole: any[]
  onLoadOrganizationRole: (id: number) => any
  onLoadProjectRoles: (id: number) => any
  onAddProjectRole: (id: number, roleIds: number[], resolve: () => any) => any
  onLoadRelRoleProject: (id: number, roleId: number) => any,
  onUpdateRelRoleProject: (relationId: number, projectRole: object) => any
}

export class ProjectRole extends React.PureComponent<IRoleProps, IRoleStates> {
  private RoleForm: AntdFormType = null
  private refHandlers = {
    RoleForm: (ref) => this.RoleForm = ref
  }
  constructor (props) {
    super(props)
    this.state = {
      searchValue: '',
      projectRoles: [],
      roleTargetKeys: [],
      relationRoleVisible: false,
      authSettingVisible: false
    }
  }

  public componentWillMount () {
    this.loadOrganizationRole()
    this.loadProjectRoles()
  }

  private loadOrganizationRole = () => this.props.onLoadOrganizationRole(this.props.projectDetail['id'])

  private loadProjectRoles = () => this.props.onLoadProjectRoles(this.props.projectDetail['id'])

  private toggleModal = (flag: string, id?: number) => () => {
    if (id) {
      const {onLoadRelRoleProject, projectDetail} = this.props
      onLoadRelRoleProject(projectDetail.id, id)
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
    const { projectRoles } = nextProps
    if (projectRoles !== this.props.projectRoles) {
        this.setState ({
          projectRoles
        })
        const roled = projectRoles.map((role) => role.id)
        this.setState({roleTargetKeys: roled})
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
        this.loadProjectRoles()
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

  private changePermission = (record, event) => {
    // const value = event.target.value
    // const [ keys ] = Object.keys(record)
    // const { onUpdateRelRoleProject, currentProjectRole} = this.props
    // onUpdateRelRoleProject(currentProjectRole.id, {
    //   ...currentProjectRole.permission,
      
    // })
  }

  public render () {
    const { organizationRoles } = this.props
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
        title: 'role',
        dataIndex: 'name',
        key: 'rolename',
        // render: (text) => <span>{text.role === 1 ? 'Owner' : 'Member'}</span>
      },
      {
          title: 'settings',
          dataIndex: 'user',
          // className: isHidden ? utilStyles.hide : '',
          key: 'settings',
          render: (text, record) => {
            return (
              <span>
                <a href="javascript:;" onClick={this.toggleModal('authSettingVisible', record.id)}>权限设置</a>
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
            currentProjectRole={this.props.currentProjectRole}
            onChangePermission={this.changePermission}
          />
        </Modal>
      </div>
    )
  }
}



const mapStateToProps = createStructuredSelector({
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
     onUpdateRelRoleProject: (relationId, projectRole) => dispatch(updateRelRoleProject(relationId, projectRole))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
export default compose(withConnect)(ProjectRole)






