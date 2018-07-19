import * as React from 'react'
import {compose} from 'redux'
import teamReducer from '../../Teams/reducer'
import {makeSelectLoginUser} from '../../App/selectors'
import injectReducer from '../../../utils/injectReducer'
import {loadTeams} from '../../Teams/actions'
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
const Select = require('antd/lib/select')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const Modal = require('antd/lib/modal')
const styles = require('../Organization.less')
import * as Organization from '../Organization'
import {checkNameUniqueAction} from '../../App/actions'
import {addTeam} from '../actions'
import {editTeam, deleteTeam} from '../../Teams/actions'
import Avatar from '../../../components/Avatar'
import sagaApp from '../../App/sagas'
import reducerApp from '../../App/reducer'


interface ITeamsState {
  formVisible: boolean
  modalLoading: boolean
}

interface ITeamsProps {
  router: InjectedRouter
  teams: ITeam[]
  toThatTeam: (url: string) => any
  onAddTeam: (team: ITeam, resolve: () => any) => any
  currentOrganization: Organization.IOrganization
  organizationTeams: Organization.IOrganizationTeams
  organizations: any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export interface ITeam {
  name?: string
  visibility?: boolean
}

export class TeamList extends React.PureComponent<ITeamsProps, ITeamsState> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      modalLoading: false
    }
  }

  private TeamForm: WrappedFormUtils
  private showTeamForm = () => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true
    }, () => {
      // if (team) {
      //   const {orgId, id, name, pic, description} = team
      //   this.organizationTypeChange(`${orgId}`).then(
      //     () => this.TeamForm.setFieldsValue({orgId: `${orgId}`, id, name, pic, description})
      //   )
      // }
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
        this.setState({modalLoading: true})
        // orgId: number
        // name: string,
        // description: string,
        // parentTeamId: number,
        // visibility: boolean
        this.props.onAddTeam({
          ...values,
          ...{
            visibility: !!values.visibility
          },
          orgId: currentOrganization.id,
          pic: `${Math.ceil(Math.random() * 19)}`,
          config: '{}'
        }, () => {
          this.hideTeamForm()
        })
      }
    })
  }
  private hideTeamForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.TeamForm.resetFields()
    })
  }
  private organizationTypeChange = () =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private onSearchTeam = () => {

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
    if (!Array.isArray(array)) return array
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
    const {formVisible, modalLoading} = this.state
    const {organizations, organizationTeams, currentOrganization:{id}} = this.props
    this.filter(organizationTeams)
    const addButton = (
      <Tooltip placement="bottom" title="创建">
        <Button
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
            {users.map((user, index) => <Tooltip key={`tooltip${index}`} placement="topRight" title={user.username}><span><Avatar key={index} path={user.avatar} size="small"
                                                                                                                                  enlarge={true}/></span></Tooltip>)}
            <span className={styles.avatarName}>{`${ users ? users.length : 0 }menbers`}</span>
          </div>
        )
      }
    }, {
      title: 'Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (text) => text ? '公开（可见）' : '私密（不可见）'
    }]

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchTeam}
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
              //  rowSelection={rowSelection}
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
            modalLoading={modalLoading}
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
  loginUser: makeSelectLoginUser()
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

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({key: 'team', reducer: teamReducer})
const withSaga = injectSaga({key: 'team', saga: teamSaga})

const withAppReducer = injectReducer({key: 'app', reducer: reducerApp})
const withAppSaga = injectSaga({key: 'app', saga: sagaApp})

export default compose(
  withReducer,
  withAppReducer,
  withAppSaga,
  withSaga,
  withConnect
)(TeamList)



