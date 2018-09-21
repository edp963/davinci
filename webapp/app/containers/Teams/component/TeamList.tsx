import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Input = require('antd/lib/input')
const Table = require('antd/lib/table')
const Modal = require('antd/lib/modal')
const styles = require('../Team.less')
import AddForm from './AddForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import * as Team from '../Team'
import Avatar from '../../../components/Avatar'

interface ITeamListState {
  modalLoading: boolean,
  formType: string,
  formVisible: boolean
}

interface ITeamListProps {
  currentTeam: any
  toThatTeam: (url: string) => any
  currentTeamTeams: Team.ITeamTeams[]
}

export class TeamList extends React.PureComponent <ITeamListProps, ITeamListState> {

  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false
    }
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

  private toThatTeam = (text, record) => () => {
    const {id} = record
    if (id) {
      this.props.toThatTeam(`account/team/${id}`)
    }
  }
  private isEmptyObj =  (obj) => {
    for (let attr in obj) {
      return false
    }
    return true
  }

  private filter = (array) => {
    if (!Array.isArray(array)) {
      return array
    }
    array.forEach((d) => {
      if (!this.isEmptyObj(d)) {
        d.key = `key${d.id}`
      }
      if (d.children && d.children.length > 0) {
        this.filter(d.children)
      }
      if (d.children && d.children.length === 0) {
        delete d.children
      }
    })
    return array
  }
  public render () {
    const { formVisible } = this.state
    const { currentTeamTeams } = this.props
    this.filter(currentTeamTeams)
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text, record) => <a href="javascript:;" onClick={this.toThatTeam(text, record)} className={styles.avatarName}>{text}</a>
    }, {
      title: 'Member',
      dataIndex: 'users',
      key: 'users',
      width: '30%',
      render: (users) => {
        return (
          <div className={styles.avatarWrapper}>
            {users.map((user, index) => <Tooltip key={`tooltip${index}`} placement="topRight" title={user.username}>
              <span><Avatar key={index} path={user.avatar} size="small" enlarge={true}/></span></Tooltip>)}
            <span className={styles.avatarName}>{`${ users ? users.length : 0 }menbers`}</span>
          </div>
        )
      }
    }
    // {
    //   title: 'Visibility',
    //   dataIndex: 'visibility',
    //   key: 'visibility',
    //   render: (text) => text ? '公开（可见）' : '私密（不可见）'
    // }
  ]
    return (
      <div className={styles.listWrapper}>
        {/* <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchTeam}
            />
          </Col>
        </Row> */}
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={columns}
              dataSource={currentTeamTeams}
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
            ref={(f) => { this.AddForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default TeamList



