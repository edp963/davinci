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
import MemberForm from '../../Teams/component/AddForm'
import Avatar from '../../../components/Avatar'
import * as Organization from '../Organization'
import ChangeRoleForm from './ChangeRoleForm'

interface IMembersState {
  category?: string
  formVisible: boolean
  modalLoading: boolean
  currentMember: {id?: number, name?: string}
  changeRoleFormCategory: string
  changeRoleFormVisible: boolean
  changeRoleModalLoading: boolean
}

interface IMembersProps {
  organizationId: number
  loadOrganizationsMembers: (id: number) => any
  deleteOrganizationMember: (id: number, resolve: () => any) => any
  changeOrganizationMemberRole: (id: number, role: number, resolve: () => any) => any
  organizationMembers: Organization.IOrganizationMembers[]
  currentOrganization: Organization.IOrganization
  inviteMemberList: any
  onInviteMember: (ordId: number, memId: number) => any
  handleSearchMember: (keywords: string) => any
}

export class MemberList extends React.PureComponent<IMembersProps, IMembersState> {
  constructor (props) {
    super(props)
    this.state = {
      category: '',
      changeRoleFormCategory: '',
      currentMember: {},
      formVisible: false,
      modalLoading: false,
      changeRoleFormVisible: false,
      changeRoleModalLoading: false
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

  private showChangeRoleForm = (type: string, obj: { id?: number}) => (e) => {
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
      }
    })
  }

  private search = (val) => {

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

  public render () {
    const {
      formVisible,
      category,
      modalLoading,
      changeRoleFormVisible,
      changeRoleModalLoading,
      changeRoleFormCategory
    } = this.state
    const { organizationMembers, inviteMemberList } = this.props
    const addButton =  (
      <Tooltip placement="bottom" title="创建">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showMemberForm('member')}
        />
      </Tooltip>
    )
    const columns = [{
      title: 'Name',
      dataIndex: 'user',
      key: 'user',
      render: (text) => <div className={styles.avatarWrapper}><Avatar path={text.avatar} size="small" enlarge={true}/><span className={styles.avatarName}>{text.username}</span></div>
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
      key: 'settings',
      render: (text, record) => (
        <span>
          <Popconfirm
            title="确定删除此成员吗？"
            placement="bottom"
            onConfirm={ this.removeMemberForm(text, record)}
          >
            <Tooltip title="删除">
              <a href="javascript:;">从组织里移除</a>
            </Tooltip>
          </Popconfirm>
          <span className="ant-divider" />
          <a href="javascript:;" onClick={this.showChangeRoleForm('orgMember', record)}>改变角色</a>
        </span>
      )
    }]

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={4}>
            <Select
              size="large"
              placeholder="placeholder"
              onChange={this.search}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="everyone">所有人</Select.Option>
              <Select.Option value="Owners">Owners</Select.Option>
              <Select.Option value="Members">Members</Select.Option>
            </Select>
          </Col>
          <Col span={16} offset={1}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.search}
            />
          </Col>
          <Col span={1} offset={2}>
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

