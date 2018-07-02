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

interface IMembersState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
}
export class MemberList extends React.PureComponent<{}, IMembersState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
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
      formType: type,
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
    const { formVisible, formType, modalLoading } = this.state
    const addButton =  (
      <Tooltip placement="bottom" title="创建">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showMemberForm('add')}
        />
      </Tooltip>
    )
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href="#">{text}</a>
    }, {
      title: 'role',
      dataIndex: 'role',
      key: 'role'
    }, {
      title: 'team',
      dataIndex: 'team',
      key: 'team'
    }, {
      title: 'settings',
      key: 'settings',
      render: (text, record) => (
        <span>
          <a href="javascript:;">从组织里移除</a>
          <span className="ant-divider" />
          <a href="javascript:;">改变角色</a>
        </span>
      )
    }]

    const data = [{
      key: '1',
      name: 'John Brown',
      role: 32,
      team: 'New York No. 1 Lake Park'
    }, {
      key: '2',
      name: 'Jim Green',
      role: 42,
      team: 'London No. 1 Lake Park'
    }, {
      key: '3',
      name: 'Joe Black',
      role: 32,
      team: 'Sidney No. 1 Lake Park'
    }]
    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideMemberForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]
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
              dataSource={data}
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
            type={formType}
            ref={(f) => { this.MemberForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default MemberList

