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
import AdminForm from './Transfer'
import AntdFormType from 'antd/lib/form/Form'
import Auth from './ProjectAuth'
const styles = require('../Project.less')
const utilStyles =  require('assets/less/util.less')
import { createStructuredSelector } from 'reselect'
import { makeSelectCurrentOrganizationProject, makeSelectCurrentOrganizationMembers, makeSelectCurrentOrganizationProjectAdmins } from '../selectors'
import { addProjectAdmin, deleteProjectAdmin} from 'containers/Projects/actions'
import { loadProjectAdmin } from '../actions'

interface IProjectAdminStates {
  relationRoleVisible: boolean
  authSettingVisible: boolean
  adminTargetKeys: []
  searchValue: string
  projectAdmins: any[]
  adminFormVisible: boolean
}

interface IProjectAdminProps {
  form?: any
  projectDetail: any
  organizationMembers: any[]
  projectAdmins: any[]
  onLoadProjectAdmin: (projectId: number) => any
  onAddProjectAdmin: (projectId: number, adminIds: number[], resolve?: (result: any) => any) => any
  onDeleteProjectAdmin: (projectId: number, adminId: number , resolve: () => any) => any
}

export class ProjectAdmin extends React.PureComponent<IProjectAdminProps, IProjectAdminStates> {

  private AdminForm: AntdFormType = null
  private refHandlers = {
    AdminForm: (ref) => this.AdminForm = ref
  }
  constructor (props) {
    super(props)
    this.state = {
      searchValue: '',
      projectAdmins: [],
      relationRoleVisible: false,
      authSettingVisible: false,
      adminTargetKeys: [],
      adminFormVisible: false
    }
  }

  public componentWillMount () {
      this.loadAdmins(this.props.projectDetail['id'])
  }

  private loadAdmins = (id) => this.props.onLoadProjectAdmin(id)

  private onSaveAdmin = () => {
    const { adminTargetKeys } = this.state
    const { projectDetail: {id} } = this.props
    const adminIds = adminTargetKeys.map((admin) => Number(admin))
    this.props.onAddProjectAdmin(id, adminIds, (result) => {
        this.loadAdmins(id)
        this.toggleAdminForm()
        this.setState({ adminTargetKeys: []})
    })
  }

  public componentWillReceiveProps (nextProps) {
    const { projectAdmins, projectDetail: {id} } = nextProps
    if (projectAdmins !== this.props.projectAdmins) {
        this.setState ({
            projectAdmins
        })
    }
    if (id !== this.props.projectDetail['id']) {
      this.loadAdmins(id)
    }
  }

  private searchChange = (e) => {
    const searchValue = e.target.value
    const result = (this.props.projectAdmins as any[]).filter((admin) => {
      return admin && admin.user.username.indexOf(searchValue.trim()) > -1
    })
    this.setState({
      searchValue,
      projectAdmins: searchValue && searchValue.length ? result : this.props.projectAdmins
    })
  }

  private deleteAdmin = (option) => () => {
    const { projectDetail, onDeleteProjectAdmin } = this.props
    const {id, relationId} = option
    onDeleteProjectAdmin(id, relationId, () => {
      this.loadAdmins(projectDetail.id)
      this.setState({ adminTargetKeys: []})
    })
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

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private toggleAdminForm = () => {
      this.setState({adminFormVisible: !this.state.adminFormVisible})
  }

  private afterAdminFormClose = () => {
    this.AdminForm.props.form.resetFields()
  }

  private setRowKeys = (item) => item.user.id
  private setTransferOptionTitle = (item) => item.user.username
  private transferFilterOption = (inputValue, option) => option.user.username.indexOf(inputValue) > -1
  private setAdminTargetKeys = (newTargetKeys) => {
    if (newTargetKeys) {
      this.setState({adminTargetKeys: newTargetKeys})
    }
  }

  private isInArray <T> (source: T[], target: T) {
     return source.some((s) => s === target)
  }

  public render () {
    const { projectAdmins } = this.state
    const { organizationMembers, projectDetail: {id} } = this.props
    let pAdmins = []
    if (this.props.projectAdmins && this.props.projectAdmins.length) {
       pAdmins = this.props.projectAdmins.map((admin) => admin && admin.user ? admin.user.id : void 0).filter((s) => s)
    }

    const notAdminMembers = organizationMembers.filter((member) => {
        const orgMemberId = member && member.user && member.user.id
        if (typeof orgMemberId === 'number') {
          return !this.isInArray<number>(pAdmins, orgMemberId)
        }
    })


    const admins = projectAdmins && projectAdmins.length ? projectAdmins : []
    const addButton =  (
        <Tooltip placement="bottom" title="添加">
          <Button
            type="primary"
            icon="plus"
            onClick={this.toggleAdminForm}
          >
            添加管理员
          </Button>
        </Tooltip>
      )
    const columns = [
{
    title: '管理员名称',
    dataIndex: 'user',
    key: 'userKey',
    render: (text) => {
        return <span>{text.username}</span>
    }
},
{
    title: '设置',
    dataIndex: 'id',
    // className: isHidden ? utilStyles.hide : '',
    key: 'settings',
    width: 200,
    render: (text, record) => {
        return (
        <span>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.deleteAdmin({id, relationId: Number(text)})}
          >
            <a href="javascript:;" onClick={this.stopPPG}>删除管理员</a>
          </Popconfirm>
        </span>
        )
    }
  }]

    const adminButton =
    (
      <Button
        key="submit"
        type="primary"
      //  loading={adminModalLoading}
      //  disabled={adminModalLoading}
        onClick={this.onSaveAdmin}
      >
        保 存
      </Button>
    )
    return (
        <div className={styles.admin}>
            <Row>
            <Col span={14}>
                <Input.Search
                    placeholder="搜索管理员"
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
                        dataSource={admins}
                        pagination={false}
                    />
                </div>
            </Row>
            <Modal
                key="adminFormKey"
                title="添加管理员"
                visible={this.state.adminFormVisible}
                footer={adminButton}
                onCancel={this.toggleAdminForm}
                afterClose={this.afterAdminFormClose}
            >
                <AdminForm
                    wrappedComponentRef={this.refHandlers.AdminForm}
                    dataSource={notAdminMembers}
                    optionTitle={this.setTransferOptionTitle}
                    filterOption={this.transferFilterOption}
                    adminTargetKeys={this.state.adminTargetKeys}
                    targetKeys={this.state.adminTargetKeys}
                    setTargetKeys={this.setAdminTargetKeys}
                    rowKeys={this.setRowKeys}
                />
            </Modal>
        </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
    projectDetail: makeSelectCurrentOrganizationProject(),
    organizationMembers: makeSelectCurrentOrganizationMembers(),
    projectAdmins: makeSelectCurrentOrganizationProjectAdmins()
})

export function mapDispatchToProps (dispatch) {
    return {
        onLoadProjectAdmin: (projectId) => dispatch(loadProjectAdmin(projectId)),
        onAddProjectAdmin: (projectId, adminIds, resolve) => dispatch(addProjectAdmin(projectId, adminIds, resolve)),
        onDeleteProjectAdmin: (projectId, relationId , resolve) => dispatch(deleteProjectAdmin (projectId, relationId , resolve))
    }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
export default compose(withConnect)(ProjectAdmin)






