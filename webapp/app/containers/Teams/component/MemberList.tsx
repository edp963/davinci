import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const Modal = require('antd/lib/modal')
const styles = require('../Team.less')
import AddForm from './AddForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import * as Team from '../Team'
import Avatar from '../../../components/Avatar'
import ChangeRoleForm from '../../Organizations/component/ChangeRoleForm'

interface IMemberListState {
  modalLoading: boolean
  formType: string
  formVisible: boolean
  category?: string
  currentMember: {id?: number, name?: string}
  changeRoleFormCategory: string
  changeRoleFormVisible: boolean
  changeRoleModalLoading: boolean
}

interface IMemberListProps {
  currentTeam: any
  deleteTeamMember: (id: number) => any
  changeTeamMemberRole: (id: number, role: string) => any
  currentTeamMembers: Team.ITeamMembers[]
}

export class MemberList extends React.PureComponent<IMemberListProps, IMemberListState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      category: '',
      modalLoading: false,
      formVisible: false,
      changeRoleFormCategory: '',
      currentMember: {},
      changeRoleFormVisible: false,
      changeRoleModalLoading: false
    }
  }

  private onSearchMember = () => {

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
      formVisible: false
    })
  }
  private add = () => {
    this.AddForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
      }
    })
  }

  private removeMemberForm = (text, obj) => () => {
    console.log(text, obj)
    // this.props.deleteTeamMember()
  }

  private changRole = () => {
    console.log('changeRole')
   // this.props.changeTeamMemberRole()
  }

  private hideChangeRoleForm = () => {
    this.setState({
      changeRoleFormVisible: false,
      changeRoleModalLoading: false
    }, () => {
      this.ChangeRoleForm.resetFields()
    })
  }

  private showChangeRoleForm = (type: string, obj: {name?: string, id?: number}) => (e) => {
    e.stopPropagation()
    this.setState({
      currentMember: obj,
      changeRoleFormVisible: true,
      changeRoleFormCategory: type
    })
  }
  public render () {
    const {
      formVisible,
      formType,
      changeRoleFormVisible,
      changeRoleModalLoading,
      changeRoleFormCategory
    } = this.state
    const { currentTeamMembers, currentTeam} = this.props
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showAddForm('teamMember')}
        />
      </Tooltip>
    )
    const columns = [{
      title: 'Name',
      dataIndex: 'user',
      key: 'user',
      render: (text) => <div className={styles.avatarWrapper}><Avatar path={text.avatar} size="small" enlarge={true}/><span className={styles.avatarName}>{text.username}</span></div>
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
            onConfirm={ this.removeMemberForm(text, record)}
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

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={4}>
            <Select
              size="large"
              placeholder="placeholder"
              onChange={this.onSearchMember}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="everyone">所有人</Select.Option>
              {/*<Select.Option value="Owners">Owners</Select.Option>*/}
              {/*<Select.Option value="Members">Members</Select.Option>*/}
            </Select>
          </Col>
          <Col span={16} offset={1}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchMember}
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
              dataSource={Array.isArray(currentTeamMembers) ? currentTeamMembers : []}
            />
          </div>
        </Row>
        <Modal
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



