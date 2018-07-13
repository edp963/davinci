import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
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

interface IMemberListState {
  modalLoading: boolean,
  formType: string,
  formVisible: boolean
}

interface IMemberListProps {
  currentTeam: any
  currentTeamMembers: Team.ITeamMembers[]
}

export class MemberList extends React.PureComponent<IMemberListProps, IMemberListState> {
  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false
    }
  }

  private onSearchMember = () => {

  }
  private AddForm: WrappedFormUtils
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
      if(!err) {
        console.log(values)
      }
    })
  }
  public render () {
    const { formVisible, formType} = this.state
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
    }, {
      title: 'role',
      dataIndex: 'user',
      key: 'userKey',
      render: (text) => <span>{text.role}</span>
    },{
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
      </div>
    )
  }
}

export default MemberList



