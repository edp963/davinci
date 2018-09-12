import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Table = require('antd/lib/table')
const Modal = require('antd/lib/modal')
const styles = require('../Team.less')
import AddForm from './AddForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import * as Team from '../Team'
import Avatar from '../../../components/Avatar'
import ChangeRoleForm from '../../Organizations/component/ChangeRoleForm'
import {IOrganizationMembers} from '../../Organizations/Organization'
import ComponentPermission from '../../Account/components/checkMemberPermission'


interface IMemberListState {
  modalLoading: boolean
  formType: string
  formKey?: number
  formVisible: boolean
  category?: string
  currentMember: {id?: number, name?: string}
  changeRoleFormCategory: string
  changeRoleFormVisible: boolean
  changeRoleModalLoading: boolean
  currentTeamMembers: any[]
}

interface IMemberListProps {
  currentTeam: Team.ITeam
  deleteTeamMember: (id: number) => any
  pullMemberInTeam: (teamId: number, memberId: number, resolve: () => any) => any
  changeTeamMemberRole: (id: number, role: string) => any
  currentTeamMembers: Team.ITeamMembers[]
  currentOrganizationMembers: IOrganizationMembers[]
}

export class MemberList extends React.PureComponent<IMemberListProps, IMemberListState> {
  constructor (props) {
    super(props)
    this.state = {
      formKey: 0,
      formType: '',
      category: '',
      modalLoading: false,
      formVisible: false,
      changeRoleFormCategory: '',
      currentMember: {},
      changeRoleFormVisible: false,
      changeRoleModalLoading: false,
      currentTeamMembers: []
    }
  }
  public componentDidMount () {
    const {currentTeamMembers} = this.props
    if (currentTeamMembers) {
      this.setState({
        currentTeamMembers
      })
    }
  }
  public componentWillReceiveProps (nextProps) {
    const {currentTeamMembers} = this.props
    const nextCurrentTeamMembers = nextProps.currentTeamMembers
    if (nextCurrentTeamMembers && nextCurrentTeamMembers !== currentTeamMembers) {
      this.setState({
        currentTeamMembers: nextCurrentTeamMembers
      })
    }
  }
  private onSearchMember = (event) => {
    const value = event.target.value
    const {currentTeamMembers} = this.props
    const result = (currentTeamMembers as Team.ITeamMembers[]).filter((member, index) => {
      return member && member.user && member.user.username.indexOf(value.trim()) > -1
    })
    this.setState({
      currentTeamMembers: value && value.length ? result : this.props.currentTeamMembers
    })
  }
  private AddForm: WrappedFormUtils
  private ChangeRoleForm: WrappedFormUtils
  private showAddForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formType: type,
      formVisible: true
    })
  }
  private hideAddForm = () => {
    this.setState({
      formVisible: false,
      formKey: this.state.formKey + 11
    })
  }
  private add = () => {
    const { currentTeam } = this.props
    this.AddForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const memberId = values.projectId
        const teamId = currentTeam.id
        this.props.pullMemberInTeam(teamId, memberId, () => {
          this.hideAddForm()
        })
      }
    })
  }

  private removeMemberForm = (text, obj) => () => {
    this.props.deleteTeamMember(obj.id)
  }

  private changRole = () => {
    this.ChangeRoleForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id, role } = values
        this.props.changeTeamMemberRole(id, role)
        this.hideChangeRoleForm()
      }
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
  public render () {
    const {
      formVisible,
      formType,
      changeRoleFormVisible,
      changeRoleModalLoading,
      changeRoleFormCategory,
      currentTeamMembers
    } = this.state
    const { currentTeam} = this.props
    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
    }
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <CreateButton
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showAddForm('teamMember')}
        />
      </Tooltip>
    )
    let columns = []
    if (currentTeam && currentTeam.role === 1) {
      columns = [{
        title: 'Name',
        dataIndex: 'user',
        key: 'user',
        render: (text) => <div className={styles.avatarWrapper}>
          <Avatar path={text.avatar} size="small" enlarge={true}/>
          <span className={styles.avatarName}>{text.username}</span>
        </div>
      },
        {
          title: 'role',
          dataIndex: 'user',
          key: 'userKey',
          render: (text) => <span>{text.role === 1 ? 'Maintainer' : 'Member'}</span>
        },
        {
          title: 'settings',
          dataIndex: 'user',
          key: 'settings',
          render: (text, record) => (
            <span>
          <Popconfirm
            title="确定删除此成员吗？"
            placement="bottom"
            onConfirm={this.removeMemberForm(text, record)}
          >
            <Tooltip title="删除">
              <a href="javascript:;">从团队里移除</a>
            </Tooltip>
          </Popconfirm>
          <span className="ant-divider" />
          <a href="javascript:;" onClick={this.showChangeRoleForm('teamMember', record)}>改变角色</a>
        </span>
          )
        }]
    } else {
      columns = [{
        title: 'Name',
        dataIndex: 'user',
        key: 'user',
        render: (text) => <div className={styles.avatarWrapper}>
          <Avatar path={text.avatar} size="small" enlarge={true}/>
          <span className={styles.avatarName}>{text.username}</span>
        </div>
      },
        {
          title: 'role',
          dataIndex: 'user',
          key: 'userKey',
          render: (text) => <span>{text.role === 1 ? 'Maintainer' : 'Member'}</span>
        }]
    }
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onChange={this.onSearchMember}
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
              dataSource={currentTeamMembers as Team.ITeamMembers[]}
            />
          </div>
        </Row>
        <Modal
          key={this.state.formKey}
          title={null}
          footer={null}
          visible={formVisible}
          onCancel={this.hideAddForm}
        >
          <AddForm
            category={formType}
            organizationOrTeam={currentTeam}
            addHandler={this.add}
            ref={(f) => { this.AddForm = f }}
            currentOrganizationMembers={this.props.currentOrganizationMembers}
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
            organizationOrTeam={this.props.currentTeam}
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



