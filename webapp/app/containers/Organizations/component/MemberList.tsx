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
import FormType from 'antd/lib/form/Form'
import {
  Row,
  Col,
  Tooltip,
  Button,
  Input,
  Popconfirm,
  Modal,
  Table,
  Tag
} from 'antd'
const styles = require('../Organization.less')
const utilStyles = require('assets/less/util.less')
import MemberForm from './AddForm'
import Avatar from 'components/Avatar'
import ChangeRoleForm from './ChangeRoleForm'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'
import {
  IOrganization,
  IOrganizationMember,
  IMembersState,
  IMembersProps,
  IMembers
} from '../types'
import { getAntTagColor } from '../utils'

export class MemberList extends React.PureComponent<
  IMembersProps,
  IMembersState
> {
  constructor(props) {
    super(props)
    this.state = {
      formKey: 0,
      category: '',
      changeRoleFormCategory: '',
      currentMember: null,
      formVisible: false,
      modalLoading: false,
      changeRoleFormVisible: false,
      changeRoleModalLoading: false,
      organizationMembers: [],
      cacheOrganizationMembers: []
    }
  }

  private MemberForm: FormType
  private ChangeRoleForm: FormType

  private refHandles = {
    MemberForm: (ref) => (this.MemberForm = ref),
    ChangeRoleForm: (ref) => (this.ChangeRoleForm = ref)
  }

  private showMemberForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      category: type,
      formVisible: true
    })
  }

  private showChangeRoleForm = (type: string, member: IOrganizationMember) => (
    e
  ) => {
    e.stopPropagation()
    this.setState(
      {
        currentMember: member,
        changeRoleFormVisible: true,
        changeRoleFormCategory: type
      },
      () => {
        setTimeout(() => {
          const {
            user: { role },
            id
          } = member
          this.ChangeRoleForm.props.form.setFieldsValue({ id, role })
        }, 0)
      }
    )
  }

  private getRoleListByMemberId = (record: IMembers) => () => {
    const { organizationMembers } = this.state
    const { onGetRoleListByMemberId, organizationId } = this.props
    const { user, id } = record
    onGetRoleListByMemberId(organizationId, user.id, (res) => {
      const currentOrgMembers = organizationMembers.map((member) =>
        member.id === id ? { ...member, roles: res } : member
      )
      this.setState({
        organizationMembers: currentOrgMembers,
        cacheOrganizationMembers: currentOrgMembers
      })
    })
  }

  private hideMemberForm = () => {
    this.setState({
      formKey: this.state.formKey + 10,
      formVisible: false,
      modalLoading: false
    })
  }

  private afterMemberFormClose = () => {
    this.MemberForm.props.form.resetFields()
  }

  private removeMemberForm = (text, obj) => () => {
    this.props.deleteOrganizationMember(obj.id, () => {
      const { organizationId } = this.props
      if (this.props.loadOrganizationsMembers) {
        this.props.loadOrganizationsMembers(Number(organizationId))
      }
    })
  }

  private changRole = () => {
    this.ChangeRoleForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id, role } = values
        this.props.changeOrganizationMemberRole(id, role, () => {
          const { organizationId } = this.props
          if (this.props.loadOrganizationsMembers) {
            this.props.loadOrganizationsMembers(Number(organizationId))
          }
          this.hideChangeRoleForm()
        })
      }
    })
  }

  private add = () => {
    const { currentOrganization } = this.props
    this.MemberForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { projectId } = values
        const orgId = currentOrganization.id
        this.props.onInviteMember(orgId, projectId)
        this.hideMemberForm()
      }
    })
  }

  private search = (event) => {
    const value = event.target.value
    const { cacheOrganizationMembers } = this.state
    const result = (cacheOrganizationMembers as IOrganizationMember[]).filter(
      (member, index) => {
        return member?.user?.username?.indexOf(value.trim()) > -1
      }
    )
    this.setState({
      organizationMembers:
        value && value.length ? result : this.state.cacheOrganizationMembers
    })
  }

  public componentDidMount() {
    const { organizationMembers } = this.props
    if (organizationMembers) {
      this.setState({
        organizationMembers,
        cacheOrganizationMembers: organizationMembers
      })
    }
  }

  public componentWillReceiveProps(nextProps) {
    const { organizationMembers } = this.props
    const nextOrgMembers = nextProps.organizationMembers
    if (nextOrgMembers && nextOrgMembers !== organizationMembers) {
      this.setState({
        organizationMembers: nextOrgMembers,
        cacheOrganizationMembers: nextOrgMembers
      })
    }
  }

  private searchMember = () => {
    this.forceUpdate(() => {
      this.MemberForm.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { searchValue } = values
          if (searchValue) {
            this.props.handleSearchMember(searchValue)
          }
        }
      })
    })
  }

  private hideChangeRoleForm = () => {
    this.setState({
      changeRoleFormVisible: false,
      changeRoleModalLoading: false
    })
  }

  private afterChangeRoleFormClose = () => {
    this.ChangeRoleForm.props.form.resetFields()
  }

  private toUserProfile = (obj) => () => {
    const { id } = obj
    if (id) {
      this.props.toThatUserProfile(`account/profile/${id}`)
    }
  }

  private getRoleTags(text) {
    return text.map((t) => (
      <Tag key={`ind${t.name}ex`} color={`${getAntTagColor(t.name)}`}>
        {t.name}
      </Tag>
    ))
  }

  private getColumns() {
    const { loginUser } = this.props
    const { currentOrganization } = this.props
    let columns = [
      {
        title: '姓名',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" enlarge={true} />
            <span
              className={styles.avatarName}
              onClick={this.toUserProfile(text)}
            >
              {text.username}
            </span>
          </div>
        )
      },
      {
        title: '权限',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? '拥有者' : '成员'}</span>
      },
      {
        title: '角色列表',
        dataIndex: 'roles',
        key: `rolelist`,
        width: 200,
        render: (text, record) => {
          if (Array.isArray(text)) {
            if (text.length) {
              return <span>{this.getRoleTags(text)}</span>
            } else {
              return <span>暂无角色</span>
            }
          }
          return (
            <span>
              <a
                href="javascript:;"
                onClick={this.getRoleListByMemberId(record)}
              >
                获取角色列表
              </a>
            </span>
          )
        }
      }
    ]

    if (currentOrganization && currentOrganization.role === 1) {
      columns = [...columns].concat([{
        title: '设置',
        dataIndex: 'user',
        key: 'settings',
        width: 200,
        render: (text, record) => {
          if (record.user.id === loginUser.id) {
            return ''
          }
          return (
            <span>
              <Popconfirm
                title="确定删除？"
                placement="bottom"
                onConfirm={this.removeMemberForm(text, record)}
              >
                <a href="javascript:;">从组织里移除</a>
              </Popconfirm>
              <span className="ant-divider" />
              <a
                href="javascript:;"
                onClick={this.showChangeRoleForm('orgMember', record)}
              >
                改变角色
              </a>
            </span>
          )
        }
      }])
    }

    return columns
  }
  public render() {
    const {
      formVisible,
      category,
      currentMember,
      modalLoading,
      changeRoleFormVisible,
      changeRoleModalLoading,
      changeRoleFormCategory,
      organizationMembers
    } = this.state
    const { inviteMemberList, currentOrganization } = this.props
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Button)
    }
    const addButton = (
      <Tooltip placement="bottom" title="邀请">
        <CreateButton
          type="primary"
          icon="plus"
          onClick={this.showMemberForm('member')}
        />
      </Tooltip>
    )
    const columns = this.getColumns()
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search placeholder="搜索成员" onChange={this.search} />
          </Col>
          <Col span={1} offset={7}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={columns}
              dataSource={organizationMembers}
            />
          </div>
        </Row>
        <Modal
          key={this.state.formKey}
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideMemberForm}
          afterClose={this.afterMemberFormClose}
        >
          <MemberForm
            category={category}
            submitLoading={modalLoading}
            inviteMemberList={inviteMemberList}
            handleSearchMember={this.searchMember}
            organizationOrTeam={this.props.currentOrganization}
            wrappedComponentRef={this.refHandles.MemberForm}
            addHandler={this.add}
          />
        </Modal>
        <Modal
          title={null}
          visible={changeRoleFormVisible}
          footer={null}
          onCancel={this.hideChangeRoleForm}
          afterClose={this.afterChangeRoleFormClose}
        >
          <ChangeRoleForm
            category={changeRoleFormCategory}
            organizationOrTeam={this.props.currentOrganization}
            member={currentMember}
            submitLoading={changeRoleModalLoading}
            wrappedComponentRef={this.refHandles.ChangeRoleForm}
            changeHandler={this.changRole}
          />
        </Modal>
      </div>
    )
  }
}

export default MemberList
