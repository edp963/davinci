import * as React from 'react'
import {compose} from 'redux'
import teamReducer from '../../Teams/reducer'
import {makeSelectLoginUser} from '../../App/selectors'
import injectReducer from '../../../utils/injectReducer'
import {createStructuredSelector} from 'reselect'
import injectSaga from '../../../utils/injectSaga'
import TeamForm from './TeamForm'
import {makeSelectTeams} from '../../Teams/selectors'
import {connect} from 'react-redux'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {InjectedRouter} from 'react-router/lib/Router'
import teamSaga from '../../Teams/sagas'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Table = require('antd/lib/table')
const Modal = require('antd/lib/modal')
const styles = require('../Organization.less')
import * as Organization from '../Organization'
import {checkNameUniqueAction} from '../../App/actions'
import {addTeam} from '../actions'
import {loadTeams, editTeam, deleteTeam} from '../../Teams/actions'
import Avatar from '../../../components/Avatar'
// import sagaApp from '../../App/sagas'
// import reducerApp from '../../App/reducer'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { makeSelectTeamModalLoading } from '../selectors'

interface ITeamsState {
  formVisible: boolean
}

interface ITeamsProps {
  router?: InjectedRouter
  teams?: ITeam[]
  onLoadTeams?: () => any
  toThatTeam: (url: string) => any
  onAddTeam?: (team: ITeam, resolve: () => any) => any
  currentOrganization: Organization.IOrganization
 // organizationTeams: Organization.IOrganizationTeams
  organizationTeams: any
  organizations: any
  teamModalLoading?: boolean
  loadOrganizationTeams: (id: number) => any
  onLoadOrganizationDetail?: (id: number) => any
  onCheckUniqueName?: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}


export interface ITeam {
  id?: number
  role?: number
  avatar?: string
  organization?: Organization.IOrganization
  name?: string
  visibility?: boolean
  description: string
  parentTeamId: number
}

export class TeamList extends React.PureComponent<ITeamsProps, ITeamsState> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false
    }
  }
  public componentWillMount () {
    const { onLoadTeams } = this.props
    onLoadTeams()
  }
  private TeamForm: WrappedFormUtils
  private showTeamForm = () => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true
    })
  }

  private checkNameUnique = (rule, value = '', callback) => {
    const {onCheckUniqueName, currentOrganization: {id}} = this.props
    const data = {
      name: value,
      orgId: id,
      id: null
    }
    onCheckUniqueName('team', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private onModalOk = () => {
    const {currentOrganization} = this.props
    this.TeamForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onAddTeam({
          ...values,
          ...{
            visibility: !!values.visibility
          },
          orgId: currentOrganization.id,
          pic: `${Math.ceil(Math.random() * 19)}`,
          config: '{}'
        }, () => {
          const { id } = currentOrganization
          if (this.props.loadOrganizationTeams) {
            this.props.loadOrganizationTeams(Number(id))
            this.props.onLoadOrganizationDetail(Number(id))
            this.props.onLoadTeams()
          }
          this.hideTeamForm()
        })
      }
    })
  }
  private hideTeamForm = () => {
    this.setState({
      formVisible: false
    }, () => {
      this.TeamForm.resetFields()
    })
  }
  private organizationTypeChange = () =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private enterTeam = (text, record) => () => {
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

  public render () {
    const { formVisible } = this.state
    const {organizationTeams, currentOrganization, currentOrganization: {id}, teamModalLoading} = this.props
    this.filter(organizationTeams)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Button)
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
      render: (text, record) => <a href="javascript:;" onClick={this.enterTeam(text, record)} className={styles.avatarName}>{text}</a>
    }, {
      title: 'Member',
      dataIndex: 'users',
      key: 'users',
      width: '30%',
      render: (users) => {
        return (
          <div className={styles.avatarWrapper}>
            {users.map((user, index) => <Tooltip key={`tooltip${index}`} placement="topRight" title={user.username}><span>
                <Avatar key={index} path={user.avatar} size="small" enlarge={true}/></span></Tooltip>)}
            <span className={styles.avatarName}>{`${ users ? users.length : 0 }members`}</span>
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
              dataSource={organizationTeams}
            />
          </div>
        </Row>
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideTeamForm}
        >
          <TeamForm
            orgId={id}
            teams={this.props.teams}
            onModalOk={this.onModalOk}
            modalLoading={teamModalLoading}
            onOrganizationTypeChange={this.organizationTypeChange}
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
  teams: makeSelectTeams(),
  loginUser: makeSelectLoginUser(),
  teamModalLoading: makeSelectTeamModalLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeams: () => dispatch(loadTeams()),
    onAddTeam: (team, resolve) => dispatch(addTeam(team, resolve)),
    onEditTeam: (team) => dispatch(editTeam(team)),
    onDeleteTeam: (id, resolve) => () => dispatch(deleteTeam(id, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default connect<{}, {}, ITeamsProps>(mapStateToProps, mapDispatchToProps)(TeamList)

