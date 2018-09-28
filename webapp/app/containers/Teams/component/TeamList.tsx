import * as React from 'react'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Input = require('antd/lib/input')
const Table = require('antd/lib/table')
const Modal = require('antd/lib/modal')
const Button = require('antd/lib/button')
const styles = require('../Team.less')
import AddForm from './AddForm'
import TeamForm from '../../Organizations/component/TeamForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import * as Team from '../Team'
import Avatar from '../../../components/Avatar'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { checkNameUniqueAction } from '../../App/actions'
import { addTeam } from '../../Organizations/actions'
import { loadTeamTeams } from '../../Teams/actions'
import { makeSelectTeamModalLoading } from '../../Organizations/selectors'

interface ITeamListState {
  modalLoading: boolean
  formType: string
  formVisible: boolean
  teamFormVisible: boolean
  listType: string
}

interface ITeamListProps {
  teamModalLoading?: boolean
  currentTeam: any
  toThatTeam: (url: string) => any
  currentTeamTeams: Team.ITeamTeams[]
  onAddTeam?: (team: object, resolve: () => any) => any
  onLoadTeamTeams?: (id: number) => any
  onCheckUniqueName?: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class TeamList extends React.PureComponent <ITeamListProps, ITeamListState> {

  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false,
      teamFormVisible: false,
      listType: ''
    }
  }

  private TeamForm: WrappedFormUtils
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
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        return false
      }
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

  private checkNameUnique = (rule, value = '', callback) => {
    const {onCheckUniqueName, currentTeam} = this.props
    const data = {
      name: value,
      orgId: currentTeam.organization.id,
      id: null
    }
    onCheckUniqueName('team', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private showTeamForm = () => (e) => {
    const { currentTeam } = this.props
    e.stopPropagation()
    this.setState({
      teamFormVisible: true,
      listType: 'teamTeamList'
    }, () => {
      this.TeamForm.setFieldsValue({
        parentTeamId: currentTeam.name
      })
    })
  }

  private onTeamFormModalOk = () => {
    const { currentTeam } = this.props
    this.TeamForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, description } = values
        this.props.onAddTeam({
          parentTeamId: currentTeam.id,
          name,
          description,
          ...{ visibility: !!values.visibility },
          orgId: currentTeam.organization.id,
          pic: `${Math.ceil(Math.random() * 19)}`,
          config: '{}'
        }, () => {
          this.props.onLoadTeamTeams(currentTeam.id)
          this.hideTeamForm()
        })
      }
    })
  }

  private hideTeamForm = () => {
    this.setState({
      teamFormVisible: false
    }, () => {
      this.TeamForm.resetFields()
    })
  }

  public render () {
    const { formVisible, teamFormVisible, listType } = this.state
    const { currentTeamTeams, currentTeam, teamModalLoading } = this.props
    this.filter(currentTeamTeams)

    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
    }
    const addButton = (
      <Tooltip placement="bottom" title="创建">
        <CreateButton
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showTeamForm()}
        />
      </Tooltip>
    )

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
        <Row>
          {/* <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchTeam}
            />
          </Col> */}
          <Col span={1} offset={23}>
            {addButton}
          </Col>
        </Row>
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
        <Modal
          title={null}
          visible={teamFormVisible}
          footer={null}
          onCancel={this.hideTeamForm}
        >
          <TeamForm
            listType={listType}
            onModalOk={this.onTeamFormModalOk}
            modalLoading={teamModalLoading}
            onCheckUniqueName={this.checkNameUnique}
            ref={(f) => {
              this.TeamForm = f
            }}
          />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  teamModalLoading: makeSelectTeamModalLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onAddTeam: (team, resolve) => dispatch(addTeam(team, resolve)),
    onLoadTeamTeams: (id) => dispatch(loadTeamTeams(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default connect<{}, {}, ITeamListProps>(mapStateToProps, mapDispatchToProps)(TeamList)



