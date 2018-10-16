import * as React from 'react'
import {WrappedFormUtils} from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Popconfirm = require('antd/lib/popconfirm')
const Modal = require('antd/lib/modal')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const styles = require('../Organization.less')
const utilStyles = require('../../../assets/less/util.less')
import MemberForm from '../../Teams/component/AddForm'
import Avatar from '../../../components/Avatar'
import * as Organization from '../Organization'
import ChangeRoleForm from './ChangeRoleForm'
import ComponentPermission from '../../Account/components/checkMemberPermission'

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
      const {user: {role}, id} = obj
      this.ChangeRoleForm.setFieldsValue({id, role})
    })
  }

  private hideMemberForm = () => {
    this.setState({
      formKey: this.state.formKey + 10,
      formVisible: false,
      modalLoading: false
    }, () => {
      this.MemberForm.resetFields()
    })
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
          this.props.handleSearchMember(searchValue)
        }
      })
    })
  }

  private hideChangeRoleForm = () => {
    this.setState({
      changeRoleFormVisible: false,
      changeRoleModalLoading: false
    }, () => {
      this.ChangeRoleForm.resetFields()
    })
  }
  private toUserProfile = (obj) => () => {
    const {id} = obj
    if (id) {
      this.props.toThatUserProfile(`account/profile/${id}`)
    }
  }
  public render () {
    const {
      formVisible,
      category,
      modalLoading,
      changeRoleFormVisible,
      changeRoleModalLoading,
      changeRoleFormCategory,
      organizationMembers
    } = this.state
    let isHidden = false
    if (organizationMembers && organizationMembers.length) {
      organizationMembers.forEach((m) => {
        isHidden = m && m.user && m.user.role === 1 ? true : false
      })
    }
    const { inviteMemberList, currentOrganization } = this.props
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Button)
    }
    const addButton =  (
      <Tooltip placement="bottom" title="邀请">
        <CreateButton
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showMemberForm('member')}
        />
      </Tooltip>
    )
    let columns = []
    if (currentOrganization && currentOrganization.role === 1) {
      columns = [{
        title: 'Name',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" enlarge={true}/>
            <span className={styles.avatarName} onClick={this.toUserProfile(text)}>{text.username}</span>
          </div>
        )
      }, {
        title: 'role',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? 'Owner' : 'Member'}</span>
      },
        {
          title: 'team',
          dataIndex: 'teamNum',
          key: 'teamNum'
        }, {
          title: 'settings',
          dataIndex: 'user',
          className: isHidden ? utilStyles.hide : '',
          key: 'settings',
          render: (text, record) => {
            if (text.role === 1) {
              return ''
            }
            return (
              <span>
                <Popconfirm
                  title="确定删除此成员吗？"
                  placement="bottom"
                  onConfirm={this.removeMemberForm(text, record)}
                >
                  <Tooltip title="删除">
                    <a href="javascript:;">从组织里移除</a>
                  </Tooltip>
                </Popconfirm>
                <span className="ant-divider" />
                <a href="javascript:;" onClick={this.showChangeRoleForm('orgMember', record)}>改变角色</a>
              </span>
            )
          }
        }]
    } else {
      columns = [{
        title: 'Name',
        dataIndex: 'user',
        key: 'user',
        render: (text) => (
          <div className={styles.avatarWrapper}>
            <Avatar path={text.avatar} size="small" enlarge={true}/>
            <span className={styles.avatarName} onClick={this.toUserProfile(text)}>{text.username}</span>
          </div>
        )
      }, {
        title: 'role',
        dataIndex: 'user',
        key: 'userKey',
        render: (text) => <span>{text.role === 1 ? 'Owner' : 'Member'}</span>
      },
        {
          title: 'team',
          dataIndex: 'teamNum',
          key: 'teamNum'
        }]
    }
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
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

