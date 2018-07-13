import * as React from 'react'
import { connect } from 'react-redux'
const Icon = require('antd/lib/icon')
import { Link } from 'react-router'
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
import MemberList from './component/MemberList'
import ProjectList from './component/ProjectList'
import Setting from './component/Setting'
import TeamList from './component/TeamList'
const styles = require('./Team.less')
const utilStyles = require('../../assets/less/util.less')
const Tabs = require('antd/lib/tabs')
const TabPane = Tabs.TabPane
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'
import {compose} from 'redux'
import injectReducer from '../../utils/injectReducer'
import reducer from './reducer'
import injectSaga from '../../utils/injectSaga'
import saga from './sagas'
import reducerApp from '../App/reducer'
import sagaApp from '../App/sagas'
import { loadTeamProjects, loadTeamMembers, loadTeamTeams, loadTeamDetail, pullProjectInTeam, updateTeamProjectPermission } from './actions'
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'
import {
  makeSelectCurrentTeamMembers,
  makeSelectCurrentTeamProjects,
  makeSelectCurrentTeams,
  makeSelectCurrentTeamTeams,
  makeSelectTeams
} from './selectors'
import {makeSelectCurrentOrganizationMembers, makeSelectCurrentOrganizationProjects, makeSelectCurrentOrganizationTeams} from '../Organizations/selectors'
import {loadOrganizationMembers, loadOrganizationProjects, loadOrganizationTeams} from '../Organizations/actions'
import reducerOrganization from '../Organizations/reducer'
import sagaOrganization from '../Organizations/sagas'

interface ITeamsProps {
  router: InjectedRouter
  loginUser: any
  teams: any
  currentOrganizationProjects: any,
  currentOrganizationTeams: any,
  currentOrganizationMembers: any,
  params: {teamId: number}
  currentTeam: ITeam[]
  currentTeamProjects: ITeamProjects[]
  currentTeamTeams: ITeamTeams[]
  currentTeamMembers: ITeamMembers[]
  onLoadTeamProjects: (id: number) => any
  onLoadTeamMembers: (id: number) => any
  onLoadTeamTeams: (id: number) => any
  onLoadTeamDetail: (id: number, resolve?: () => any) => any
  onLoadOrganizationProjects: (id: number) => any
  onLoadOrganizationMembers: (id: number) => any
  onLoadOrganizationTeams: (id: number) => any
  onPullProjectInTeam: (id: number, projectId: number, resolve: () => any) => any
  onUpdateTeamProjectPermission: (relationId: number, relTeamProjectDto: any, resolve: () => any) => any
}

export interface ITeam {
  id: number
}

export interface ITeamProjects {
  id: number
  downloadPermisstion: boolean
  sharePermisstion: boolean
  project: {id: number, name: string}
  schedulePermisstion: number
  sourcePermisstion: number
  viewPermisstion: number
  vizPermisstion: number
  widgetPermisstion: number
}

export interface ITeamTeams {
  id: number
}

export interface ITeamMembers {
  id: number
  name: string
  description: string
  visibility: boolean
  children?: any
  user: any
}

export class Teams extends React.Component<ITeamsProps> {
  private teamTeams: string[]
  constructor (props) {
    super(props)
    this.teamTeams = []
  }
  private callback = () => {

  }
  public componentWillMount () {
    this.loadDatas()
  }

  private loadDatas = (id = this.props.params.teamId) => {
    const {
      onLoadTeamProjects,
      onLoadTeamMembers,
      onLoadTeamTeams,
      onLoadTeamDetail,
      onLoadOrganizationProjects,
      onLoadOrganizationMembers,
      onLoadOrganizationTeams
    } = this.props
    onLoadTeamProjects(Number(id))
    onLoadTeamMembers(Number(id))
    onLoadTeamTeams(Number(id))
    onLoadTeamDetail(Number(id), (data) => {
        const { organization:{id} } = data
        onLoadOrganizationProjects(Number(id)),
        onLoadOrganizationMembers(Number(id)),
        onLoadOrganizationTeams(Number(id))
      })
  }

  public componentWillReceiveProps (nextProps) {
    const { params: {teamId}, currentTeamTeams } = this.props
    const { params: {teamId: nextTeamId }} = nextProps
    if (teamId !== nextTeamId) {
      this.loadDatas(nextTeamId)
    }
    this.teamTeams = []
    this.computeTeamNum(currentTeamTeams, this.teamTeams)
    this.teamTeams.filter((team, index) => this.teamTeams.indexOf(team) === index)
  }

  private toThatTeam = (url) => {
    if (url) {
      console.log(url)
      this.props.router.push(url)
    }
  }

  private computeTeamNum = (arr, wrapper) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].name) {
        wrapper.push(arr[i].name)
      }
      if (arr[i] && arr[i].children && arr[i].children.length > 0) {
        this.computeTeamNum(arr[i].children, wrapper)
      }
    }
  }

  private pullProjectInTeam = (target) => {
    const { params: {teamId} } = this.props.router
    const { onPullProjectInTeam, onLoadTeamDetail } = this.props
    if (target) {
      onPullProjectInTeam(Number(teamId), target, () => {
          onLoadTeamDetail(Number(teamId))
      })
    }
  }
  public render () {
    const {
      currentTeam,
      currentTeamProjects,
      currentTeamTeams,
      currentTeamMembers,
      currentOrganizationProjects
    } = this.props
    const { avatar, name } = currentTeam
    const  projectNum = currentTeamProjects.length
    const  memberNum = currentTeamMembers.length
    const teamNum = this.teamTeams.length
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/teams">
                  <Icon type="left-circle-o" />返回我的团队
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.teamLogo}>
            <Avatar path={avatar} enlarge={false} size="small"/>
            <div className={styles.title}>{name}</div>
          </div>
          <Tabs onChange={this.callback} >
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{memberNum}</span></span>} key="members">
              <MemberList
                currentTeam={currentTeam}
                currentTeamMembers={currentTeamMembers}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="api" />项目<span className={styles.badge}>{projectNum}</span></span>} key="projects">
              <ProjectList
                currentTeam={currentTeam}
                currentTeamProjects={currentTeamProjects}
                currentOrganizationProjects={currentOrganizationProjects}
                pullProjectInTeam={this.pullProjectInTeam}
                onUpdateTeamProjectPermission={this.props.onUpdateTeamProjectPermission}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />团队<span className={styles.badge}>{teamNum}</span></span>} key="teams">
              <TeamList
                toThatTeam={this.toThatTeam}
                currentTeam={currentTeam}
                currentTeamTeams={currentTeamTeams}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="setting" />设置</span>} key="settings">
              <Setting/>
            </TabPane>
          </Tabs>
        </Box.Body>
      </Box>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  teams: makeSelectTeams(),
  currentTeam: makeSelectCurrentTeams(),
  currentTeamProjects: makeSelectCurrentTeamProjects(),
  currentTeamTeams: makeSelectCurrentTeamTeams(),
  currentTeamMembers: makeSelectCurrentTeamMembers(),
  currentOrganizationProjects: makeSelectCurrentOrganizationProjects(),
  currentOrganizationTeams: makeSelectCurrentOrganizationTeams(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeamProjects: (id) => dispatch(loadTeamProjects(id)),
    onLoadTeamMembers: (id) => dispatch(loadTeamMembers(id)),
    onLoadTeamTeams: (id) => dispatch(loadTeamTeams(id)),
    onLoadTeamDetail: (id, resolve) => dispatch(loadTeamDetail(id, resolve)),
    onLoadOrganizationProjects: (id) => dispatch(loadOrganizationProjects(id)),
    onLoadOrganizationMembers: (id) => dispatch(loadOrganizationMembers(id)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id)),
    onPullProjectInTeam: (id, projectId, resolve) => dispatch(pullProjectInTeam(id, projectId, resolve)),
    onUpdateTeamProjectPermission: (relationId, relTeamProjectDto, resolve) => dispatch(updateTeamProjectPermission(relationId, relTeamProjectDto, resolve))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'team', reducer })
const withSaga = injectSaga({ key: 'team', saga })

const withOrganizationReducer = injectReducer({ key: 'organization', reducer: reducerOrganization })
const withOrganizationSaga = injectSaga({ key: 'organization', saga: sagaOrganization })

const withAppReducer = injectReducer({key: 'app', reducer: reducerApp})
const withAppSaga = injectSaga({key: 'app', saga: sagaApp})

export default compose(
  withReducer,
  withAppReducer,
  withOrganizationReducer,
  withOrganizationSaga,
  withAppSaga,
  withSaga,
  withConnect
)(Teams)

