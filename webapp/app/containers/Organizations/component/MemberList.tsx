import React from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { Row, Col, Tooltip, Button, Input, Popconfirm, Modal, Table } from 'antd'
const styles = require('../Organization.less')
const utilStyles = require('assets/less/util.less')
import MemberForm from './AddForm'
import Avatar from 'components/Avatar'
import * as Organization from '../Organization'
import ChangeRoleForm from './ChangeRoleForm'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'

interface IMembersState {
  category?: string
  formKey?: number
  formVisible: boolean
  modalLoading: boolean
  currentMember: {id?: number, name?: string}
  changeRoleFormCategory: string
  changeRoleFormVisible: boolean
  changeRoleModalLoading: boolean
  organizationMembers: any[]
}

interface IMembersProps {
  loginUser: any
  organizationId: number
  loadOrganizationsMembers: (id: number) => any
  deleteOrganizationMember: (id: number, resolve: () => any) => any
  organizationMembers: any[]
  changeOrganizationMemberRole: (id: number, role: number, resolve: () => any) => any
  currentOrganization: Organization.IOrganization
  inviteMemberList: any
  onInviteMember: (ordId: number, memId: number) => any
  handleSearchMember: (keywords: string) => any
  toThatUserProfile: (url: string) => any
}

export class MemberList extends React.PureComponent<IMembersProps, IMembersState> {
  constructor (props) {
    super(props)
    this.state = {
      formKey: 0,
      category: '',
      changeRoleFormCategory: '',
      currentMember: {},
      formVisible: false,
      modalLoading: false,
      changeRoleFormVisible: false,
      changeRoleModalLoading: false,
      organizationMembers: []
    }
  }

  private MemberForm: WrappedFormUtils
  private ChangeRoleForm: WrappedFormUtils

  private showMemberForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      category: type,
      formVisible: true
    })
  }

  private showChangeRoleForm = (type: string, obj: { id?: number, user?: {role?: number}}) => (e) => {
    e.stopPropagation()
    this.setState({
      currentMember: obj,
      changeRoleFormVisible: true,
      changeRoleFormCategory: type
    }, () => {
      setTimeout(() => {
        const {user: {role}, id} = obj
        this.ChangeRoleForm.setFieldsValue({id, role})
      }, 0)
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
    this.ChangeRoleForm.validateFieldsAndScroll((err, values) => {
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
         const { projectId } = values
         const orgId = currentOrganization.id
         this.props.onInviteMember(orgId, projectId)
         this.hideMemberForm()
      }
    })
  }

  private search = (event) => {
    const value = event.target.value
    const {organizationMembers} = this.props
    const result = (organizationMembers as Organization.IOrganizationMembers[]).filter((member, index) => {
      return member && member.user && member.user.username.indexOf(value.trim()) > -1
    })
    this.setState({
      organizationMembers: value && value.length ? result : this.props.organizationMembers
    })
  }

  public componentDidMount () {
    const {organizationMembers} = this.props
    if (organizationMembers) {
      this.setState({
        organizationMembers
      })
    }
  }

  public componentWillReceiveProps (nextProps) {
    const {organizationMembers} = this.props
    const nextOrgMembers = nextProps.organizationMembers
    if (nextOrgMembers && nextOrgMembers !== organizationMembers) {
      this.setState({
        organizationMembers: nextOrgMembers
      })
    }
  }

  private searchMember = () => {
    this.forceUpdate(() => {
      this.MemberForm.validateFieldsAndScroll((err, values) => {
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
    this.ChangeRoleForm.resetFields()
  }

  private toUserProfile = (obj) => () => {
    const {id} = obj
    if (id) {
      this.props.toThatUserProfile(`account/profile/${id}`)
    }
  }
  public render () {
    const {
      loginUser
    } = this.props
    const {
      formVisible,
      category,
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
    const addButton =  (
      <Tooltip placement="bottom" title="邀请">
        <CreateButton
          type="primary"
          icon="plus"
          onClick={this.showMemberForm('member')}
        />
      </Tooltip>
    )
    let columns = []
    if (currentOrganization && currentOrganization.role === 1) {
      columns = [{
        title: '姓名',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" enlarge={true}/>
            <span className={styles.avatarName} onClick={this.toUserProfile(text)}>{text.username}</span>
          </div>
        )
      }, {
        title: '权限',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? '拥有者' : '成员'}</span>
      }, {
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
                <a href="javascript:;" onClick={this.showChangeRoleForm('orgMember', record)}>改变角色</a>
              </span>
            )
          }
        }]
    } else {
      columns = [{
        title: '姓名',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" enlarge={true}/>
            <span className={styles.avatarName} onClick={this.toUserProfile(text)}>{text.username}</span>
          </div>
        )
      }, {
        title: '权限',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? '拥有者' : '成员'}</span>
      }]
    }
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              placeholder="搜索成员"
              onChange={this.search}
            />
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
            ref={(f) => { this.MemberForm = f }}
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
            submitLoading={changeRoleModalLoading}
            ref={(f) => { this.ChangeRoleForm = f }}
            changeHandler={this.changRole}
          />
        </Modal>
      </div>
    )
  }
}

export default MemberList

