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

interface IMemberListState {
  modalLoading: boolean,
  formType: string,
  formVisible: boolean
}
export class MemberList extends React.PureComponent<{}, IMemberListState> {
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
  private onModalOk = () => {

  }
  public render () {
    const { formVisible, formType, modalLoading} = this.state
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showAddForm('member')}
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
          footer={null}
          visible={formVisible}
          onCancel={this.hideAddForm}
        >
          <AddForm
            type={formType}
            ref={(f) => { this.AddForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default MemberList



