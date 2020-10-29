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
import FormType, { WrappedFormUtils } from 'antd/lib/form/Form'
import {
  Row,
  Col,
  Tooltip,
  Button,
  Input,
  Popconfirm,
  Modal,
  Table,
  Tag,
  Popover,
  Icon
} from 'antd'
const styles = require('../Organization.less')
const utilStyles = require('assets/less/util.less')
import MemberForm from './AddForm'
import Avatar from 'components/Avatar'
import ChangeRoleForm from './ChangeRoleForm'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'
import {
  IOrganizationMember,
  IMembersState,
  IMembersProps,
  IMembers,
  ISetRange
} from '../types'

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
      currentMemberId: 0,
      keywords: ''
    }
  }

  private MemberForm: WrappedFormUtils
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

  private hideMemberForm = () => {
    this.setState({
      formKey: this.state.formKey + 10,
      formVisible: false,
      modalLoading: false
    })
  }

  private afterMemberFormClose = () => {
    this.MemberForm.resetFields()
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
    this.MemberForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { members, needEmail } = values
        const orgId = currentOrganization.id
        this.props.onInviteMember(orgId, members, needEmail, () => {
          this.props.loadOrganizationsMembers(Number(orgId))
        })
        this.hideMemberForm()
      }
    })
  }

  private search = (event) => {
    const value = event.target.value
    const { organizationMembers } = this.props
    const result = this.getOrgMembersBysearch(organizationMembers, value)
    this.updateOrganizationMembers(
      value && value.length ? result : this.props.organizationMembers
    )
    this.setState({ keywords: value })
  }

  private getOrgMembersBysearch(
    orgMembers: IOrganizationMember[],
    keywords: string
  ) {
    return orgMembers.filter((member) => {
      return member?.user?.username?.indexOf(keywords.trim()) > -1
    })
  }

  public updateOrganizationMembers = (orgMembers) => {
    this.setState({ organizationMembers: orgMembers })
  }

  public componentDidMount() {
    const { organizationMembers } = this.props
    if (organizationMembers) {
      this.updateOrganizationMembers(organizationMembers)
    }
  }

  public componentWillReceiveProps(nextProps) {
    const { keywords } = this.state
    const { organizationMembers } = this.props
    const nextOrgMembers = nextProps.organizationMembers
    if (nextOrgMembers && nextOrgMembers !== organizationMembers) {
      keywords && keywords.length
        ? this.updateOrganizationMembers(
            this.getOrgMembersBysearch(nextOrgMembers, keywords)
          )
        : this.updateOrganizationMembers(nextOrgMembers)
    }
  }

  private searchMember = (searchValue: string) => {
    if (searchValue && searchValue.length) {
      this.props.handleSearchMember(searchValue)
    }
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

  private getContent(record: IMembers) {
    const { id } = record
    const { currentMemberId, organizationMembers } = this.state
    const content = <Icon type="loading" />
    if (currentMemberId !== id) {
      return content
    } else {
      const member = organizationMembers.find(
        (member) => member.id === currentMemberId
      )
      const { roles } = member
      return Array.isArray(roles) && roles.length
        ? this.getRoleTags(roles)
        : '暂无角色'
    }
  }

  private getRoleTags(text) {
    return text.map((t) => <Tag key={`ind${t.name}ex`}>{t.name}</Tag>)
  }

  private getRoleList = (record: IMembers) => () => {
    const { onGetRoleListByMemberId, organizationId } = this.props
    const { user, id } = record
    onGetRoleListByMemberId(organizationId, user.id, () => {
      this.setState({
        currentMemberId: id
      })
    })
  }

  private getPagination() {
    const { organizationMembers } = this.props
    return {
      defaultCurrent: 1,
      defaultPageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      total: organizationMembers.length,
      showTotal: (total) => `共 ${total} 条`
    }
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
    const { inviteMemberList, currentOrganization, loginUser } = this.props
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
    const columns = [
      {
        title: '姓名',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" border enlarge={true} />
            <span
              className={styles.avatarName}
            >
              {text.username}
            </span>
          </div>
        )
      },
      {
        title: '成员类型',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? '拥有者' : '成员'}</span>
      },
      {
        title: '设置',
        dataIndex: 'user',
        key: 'settings',
        width: 300,
        render: (text, record) => {
          return (
            <span>
              <Popover title="角色列表" content={this.getContent(record)}>
                <a href="javascript:;" onMouseEnter={this.getRoleList(record)}>
                  获取角色列表
                </a>
              </Popover>
              {record?.user?.id !== loginUser.id ? (
                currentOrganization?.role === 1 ? (
                  <>
                    <span className="ant-divider" />
                    <a
                      href="javascript:;"
                      onClick={this.showChangeRoleForm('orgMember', record)}
                    >
                      更改成员类型
                    </a>
                    <span className="ant-divider" />
                    <Popconfirm
                      title="确定删除？"
                      placement="bottom"
                      onConfirm={this.removeMemberForm(text, record)}
                    >
                      <a href="javascript:;">移除成员</a>
                    </Popconfirm>
                  </>
                ) : (
                  ''
                )
              ) : (
                ''
              )}
            </span>
          )
        }
      }
    ]
    const pagination = this.getPagination()
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
              rowKey="id"
              columns={columns}
              dataSource={organizationMembers}
              pagination={pagination}
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
            addHandler={this.add}
            inviteMemberList={inviteMemberList}
            handleSearchMember={this.searchMember}
            wrappedComponentRef={this.refHandles.MemberForm}
            organizationDetail={this.props.currentOrganization}
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
            member={currentMember}
            category={changeRoleFormCategory}
            organizationOrTeam={this.props.currentOrganization}
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
