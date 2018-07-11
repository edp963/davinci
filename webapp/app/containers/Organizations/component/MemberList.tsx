import * as React from 'react'
import {WrappedFormUtils} from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Modal = require('antd/lib/modal')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const styles = require('../Organization.less')
import MemberForm from '../../Teams/component/AddForm'
import Avatar from '../../../components/Avatar'
import * as Organization from '../Organization'
import {IOrganization} from '../Organization'

interface IMembersState {
  category?: string
  formVisible: boolean
  modalLoading: boolean
}

interface IMembersProps {
  organizationMembers: Organization.IOrganizationMembers[]
  currentOrganization: Organization.IOrganization
}

export class MemberList extends React.PureComponent<IMembersProps, IMembersState> {
  constructor (props) {
    super(props)
    this.state = {
      category: '',
      formVisible: false,
      modalLoading: false
    }
  }
  const onSearchMember = () => {

  }
  private MemberForm: WrappedFormUtils
  private showMemberForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      category: type,
      formVisible: true
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
  public render () {
    const { formVisible, category, modalLoading } = this.state
    const { organizationMembers } = this.props
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
      render: (text) => <span>{text.role}</span>
    }, {
      title: 'team',
      dataIndex: 'teamNum',
      key: 'teamNum'
    }, {
      title: 'settings',
      dataIndex: 'user',
      key: 'settings',
      render: (text, record) => (
        <span>
          <a href="javascript:;">从组织里移除</a>
          <span className="ant-divider" />
          <a href="javascript:;">改变角色</a>
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
              <Select.Option value="Owners">Owners</Select.Option>
              <Select.Option value="Members">Members</Select.Option>
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
            organizationOrTeam={this.props.currentOrganization}
            ref={(f) => { this.MemberForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default MemberList

