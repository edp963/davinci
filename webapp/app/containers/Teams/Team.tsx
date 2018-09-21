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
// import reducerApp from '../App/reducer'
// import sagaApp from '../App/sagas'
import {
  loadTeamProjects, loadTeamMembers, loadTeamTeams, loadTeamDetail, pullProjectInTeam, updateTeamProjectPermission, deleteTeamProject, deleteTeamMember, changeTeamMemberRole,
  editTeam, deleteTeam, loadTeams, pullMemberInTeam
} from './actions'
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'
import {
  makeSelectCurrentTeamMembers,
  makeSelectCurrentTeamProjects,
  makeSelectCurrentTeams,
  makeSelectCurrentTeamTeams,
  makeSelectTeams,
  makeSelectTeamRouter
} from './selectors'
import {makeSelectCurrentOrganizationMembers, makeSelectCurrentOrganizationProjects, makeSelectCurrentOrganizationTeams} from '../Organizations/selectors'
import {loadOrganizationMembers, loadOrganizationProjects, loadOrganizationTeams} from '../Organizations/actions'
import reducerOrganization from '../Organizations/reducer'
import sagaOrganization from '../Organizations/sagas'

export interface ITeam {
  id?: number
  avatar?: string
  name?: string
  role?: number
}

interface ITeamsProps {
  router: InjectedRouter
  loginUser: any
  teamRouter: any
  currentOrganizationProjects: any,
  currentOrganizationTeams: any,
  currentOrganizationMembers: any,
  params: {teamId: number}
  currentTeam: ITeam
  teams: ITeam[]
  currentTeamProjects: ITeamProjects[]
  currentTeamTeams: ITeamTeams[]
  currentTeamMembers: ITeamMembers[]
  onLoadTeams: () => any
  onEditTeam: (team: ITeam) => any
  onDeleteTeam: (id: number, resolve: () => any) => any
  onLoadTeamProjects: (id: number) => any
  onLoadTeamMembers: (id: number) => any
  onLoadTeamTeams: (id: number) => any
  onLoadTeamDetail: (id: number, resolve?: (data: any) => any) => any
  onLoadOrganizationProjects: (param: {id: number, pageNum?: number, pageSize?: number}) => any
  onLoadOrganizationMembers: (id: number) => any
  onLoadOrganizationTeams: (id: number) => any
  onDeleteTeamProject: (id: number) => any
  onDeleteTeamMember: (id: number) => any
  onChangeTeamMemberRole: (id: number, role: string) => any
  onPullProjectInTeam: (id: number, projectId: number, resolve: () => any) => any
  onPullMemberInTeam: (teamId: number, memberId: number, resolve: () => any) => any
  onUpdateTeamProjectPermission: (relationId: number, relTeamProjectDto: any, resolve: () => any) => any
}

export interface ITeamProjects {
  id: number
  downloadPermission: boolean
  sharePermission: boolean
  project: {id: number, name: string}
  schedulePermission: number
  sourcePermission: number
  viewPermission: number
  vizPermission: number
  widgetPermission: number
}

export interface ITeamTeams {
  id: number
  name?: string
  description?: string
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
  private tabChange = () => {

  }

  public componentWillMount () {
    const { onLoadTeams } = this.props
    onLoadTeams()
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
        const { organization: {id} } = data
        onLoadOrganizationProjects({id: Number(id)})
        onLoadOrganizationMembers(Number(id))
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
  private deleteProject = (e, id) => () => {
    e.stopPropagation()
    if (id) {
      this.props.onDeleteTeamProject(id)
    }
  }

  private pullProjectInTeam = (target) => {
   // const { params: {teamId} } = this.props.router
    const { onPullProjectInTeam, onLoadTeamDetail, params: {teamId} } = this.props
    if (target) {
      onPullProjectInTeam(Number(teamId), target, () => {
          onLoadTeamDetail(Number(teamId))
      })
    }
  }
  private createTeamRouter = (source) => {
    const arr = []
    function find (wrapper, data) {
      if (data && data.hasOwnProperty('id') && data.hasOwnProperty('name')) {
        wrapper.push({
          id: data['id'],
          name: data['name']
        })
        if (data.hasOwnProperty('child') && data['child'] !== '') {
          find(wrapper, data['child'])
        }
      }
      return wrapper
    }
    find(arr, source)
    return arr
  }

  private deleteTeam = (id) => () => {
    this.props.onDeleteTeam(id, () => {
      this.props.router.push(`/account/teams`)
    })
  }

  private editTeam = (team) => () => {
    const obj = {
      ...team
    }
    delete obj.parentTeamId
    this.props.onEditTeam(obj)
  }

  public render () {
    const {
      teamRouter,
      currentTeam,
      currentTeamProjects,
      currentTeamTeams,
      currentTeamMembers,
      currentOrganizationProjects,
      currentOrganizationMembers
    } = this.props
    const { avatar, name } = currentTeam
    const  projectNum = currentTeamProjects.length
    const  memberNum = currentTeamMembers.length
    const teamNum = this.teamTeams.length
    const teamRouterSource = this.createTeamRouter(teamRouter)
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item key="accountTeams">
                <Link to="/account/teams">
                  <Icon type="left-circle-o" />返回我的团队
                </Link>
              </Breadcrumb.Item>
              {
                teamRouterSource ? teamRouterSource.map((team) => (
                  <Breadcrumb.Item key={`${team.name}@@@${team.id}`}>
                    <Link to={`/account/team/${team.id}`}>
                      {team.name}
                    </Link>
                  </Breadcrumb.Item>
                )) : ''
              }
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.teamLogo}>
            <Avatar path={avatar} enlarge={false} size="small"/>
            <div className={styles.title}>{name}</div>
          </div>
          <Tabs onChange={this.tabChange} >
          <TabPane tab={<span><Icon type="api" />项目<span className={styles.badge}>{projectNum}</span></span>} key="projects">
              <ProjectList
                deleteProject={this.deleteProject}
                currentTeam={currentTeam}
                currentTeamProjects={currentTeamProjects}
                currentOrganizationProjects={currentOrganizationProjects}
                pullProjectInTeam={this.pullProjectInTeam}
                onUpdateTeamProjectPermission={this.props.onUpdateTeamProjectPermission}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{memberNum}</span></span>} key="members">
              <MemberList
                currentTeam={currentTeam}
                deleteTeamMember={this.props.onDeleteTeamMember}
                pullMemberInTeam={this.props.onPullMemberInTeam}
                changeTeamMemberRole={this.props.onChangeTeamMemberRole}
                currentTeamMembers={currentTeamMembers}
                currentOrganizationMembers={currentOrganizationMembers}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />团队<span className={styles.badge}>{teamNum}</span></span>} key="teams">
              <TeamList
                toThatTeam={this.toThatTeam}
                currentTeam={currentTeam}
                currentTeamTeams={currentTeamTeams}
              />
            </TabPane>
            {
              currentTeam && currentTeam.role === 1 ? <TabPane tab={<span><Icon type="setting" />设置</span>} key="settings">
                <Setting
                  teams={this.props.teams}
                  currentTeam={currentTeam}
                  editTeam={this.editTeam}
                  deleteTeam={this.deleteTeam}
                />
              </TabPane> : ''
            }
          </Tabs>
        </Box.Body>
      </Box>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  teams: makeSelectTeams(),
  teamRouter: makeSelectTeamRouter(),
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
    onEditTeam: (team) => dispatch(editTeam(team)),
    onLoadTeams: () => dispatch(loadTeams()),
    onDeleteTeam: (id, resolve) => dispatch(deleteTeam(id, resolve)),
    onLoadTeamProjects: (id) => dispatch(loadTeamProjects(id)),
    onLoadTeamMembers: (id) => dispatch(loadTeamMembers(id)),
    onLoadTeamTeams: (id) => dispatch(loadTeamTeams(id)),
    onDeleteTeamProject: (id) => dispatch(deleteTeamProject(id)),
    onDeleteTeamMember: (id) => dispatch(deleteTeamMember(id)),
    onChangeTeamMemberRole: (id, role) => dispatch(changeTeamMemberRole(id, role)),
    onLoadTeamDetail: (id, resolve) => dispatch(loadTeamDetail(id, resolve)),
    onLoadOrganizationProjects: (id) => dispatch(loadOrganizationProjects(id)),
    onLoadOrganizationMembers: (id) => dispatch(loadOrganizationMembers(id)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id)),
    onPullProjectInTeam: (id, projectId, resolve) => dispatch(pullProjectInTeam(id, projectId, resolve)),
    onPullMemberInTeam: (teamId, memberId, resolve) => dispatch(pullMemberInTeam(teamId, memberId, resolve)),
    onUpdateTeamProjectPermission: (relationId, relTeamProjectDto, resolve) => dispatch(updateTeamProjectPermission(relationId, relTeamProjectDto, resolve))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(Teams)

