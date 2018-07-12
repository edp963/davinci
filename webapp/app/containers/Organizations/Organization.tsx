import * as React from 'react'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
import Box from '../../components/Box'
const styles = require('./Organization.less')
import {InjectedRouter} from 'react-router/lib/Router'
import MemberList from './component/MemberList'
import ProjectList from './component/ProjectList'
import Setting from './component/Setting'
import TeamList from './component/TeamList'
const utilStyles = require('../../assets/less/util.less')
const Tabs = require('antd/lib/tabs')
const TabPane = Tabs.TabPane
const Badge = require('antd/lib/badge')
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'
import {connect} from 'react-redux'
import saga from './sagas'
import sagaApp from '../App/sagas'
import injectReducer from '../../utils/injectReducer'
import reducer from './reducer'
import injectSaga from '../../utils/injectSaga'
import reducerApp from '../App/reducer'
import reducerProject from '../Projects/reducer'
import sagaProject from '../Projects/sagas'
import {compose} from 'redux'
import {
  loadOrganizationProjects,
  loadOrganizationMembers,
  loadOrganizationTeams,
  loadOrganizationDetail,
  searchMember,
  inviteMember} from './actions'
import {makeSelectLoginUser} from '../App/selectors'
import {
  makeSelectOrganizations,
  makeSelectCurrentOrganizations,
  makeSelectCurrentOrganizationProjects,
  makeSelectCurrentOrganizationTeams,
  makeSelectCurrentOrganizationMembers,
  makeSelectInviteMemberList
} from './selectors'
import {createStructuredSelector} from 'reselect'
import {addProject, deleteProject} from '../Projects/actions'
import {checkNameUniqueAction} from '../App/actions'

interface IOrganizationProps {
  loginUser: any
  router: InjectedRouter
  organizations: any
  params: {organizationId: number}
  inviteMemberList: any
  currentOrganization: IOrganization
  onLoadOrganizationProjects: (id: number) => any
  onLoadOrganizationMembers: (id: number) => any
  onLoadOrganizationTeams: (id: number) => any
  onLoadOrganizationDetail: (id: number) => any
  currentOrganizationProjects: IOrganizationProjects[]
  currentOrganizationTeams: IOrganizationTeams[]
  currentOrganizationMembers: IOrganizationMembers[]
  onInviteMember: (ordId: number, memId: number) => any
  onSearchMember: (keywords: string) => any
  onAddProject: (project: any, resolve: () => any) => any
  onDeleteProject: (id: number) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export interface IOrganization {
  id: number
  name: string
  description: string
  avatar: string
  allowCreateProject: number
  allowDeleteOrTransferProject: number
  allowChangeVisibility: number
  memberPermission: number
  projectNum: number
  memberNum: number
  teamNum: number
}

export interface IOrganizationProjects {
  id: number
  description: string
  name: string
}
export interface IOrganizationTeams {
  id: number
  orgId: number
  name: string,
  description: string,
  parentTeamId: number,
  visibility: boolean
}
export interface IOrganizationMembers {
  id: number
}

export class Organization extends React.PureComponent <IOrganizationProps> {
  private callback = () => {

  }
  private toProject = (id: number) => () => {
    this.props.router.push(`/project/${id}`)
  }
  private toThatTeam = (url) => {
    if (url) {
      this.props.router.push(url)
    }
  }
  private delete = (id) => () => {
    if (id) {
      this.props.onDeleteProject(id)
    }
  }
  public componentWillMount () {
    const {
      onLoadOrganizationProjects,
      onLoadOrganizationMembers,
      onLoadOrganizationTeams,
      onLoadOrganizationDetail,
      params: { organizationId }
    } = this.props
    onLoadOrganizationProjects(Number(organizationId))
    onLoadOrganizationMembers(Number(organizationId))
    onLoadOrganizationTeams(Number(organizationId))
    onLoadOrganizationDetail(Number(organizationId))
  }
  public render () {
    const {
      loginUser,
      organizations,
      currentOrganization,
      currentOrganizationProjects,
      currentOrganizationMembers,
      currentOrganizationTeams,
      inviteMemberList
    } = this.props
    const {avatar, name, projectNum, memberNum, teamNum} = currentOrganization as IOrganization
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/organizations">
                  <Icon type="left-circle-o" />返回组织列表
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.organizationLogo}>
            <Avatar path={avatar} enlarge={false} size="small"/>
            <div className={styles.title}>{name}</div>
          </div>
          <Tabs onChange={this.callback} >
            <TabPane tab={<span><Icon type="api" />项目<span className={styles.badge}>{projectNum}</span></span>} key="projects">
              <ProjectList
                deleteProject={this.delete}
                onCheckUniqueName={this.props.onCheckUniqueName}
                onAddProject={this.props.onAddProject}
                organizationId={this.props.params['organizationId']}
                organizationProjects={currentOrganizationProjects}
                toProject={this.toProject}
                loginUser={loginUser}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{memberNum}</span></span>} key="members">
              <MemberList
                organizationMembers={currentOrganizationMembers}
                currentOrganization={currentOrganization}
                inviteMemberList={inviteMemberList}
                onInviteMember={this.props.onInviteMember}
                handleSearchMember={this.props.onSearchMember}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />团队<span className={styles.badge}>{teamNum}</span></span>} key="teams">
              <TeamList
                toThatTeam={this.toThatTeam}
                organizations={organizations}
                currentOrganization={this.props.currentOrganization}
                organizationTeams={currentOrganizationTeams}
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
  organizations: makeSelectOrganizations(),
  currentOrganization: makeSelectCurrentOrganizations(),
  currentOrganizationProjects: makeSelectCurrentOrganizationProjects(),
  currentOrganizationTeams: makeSelectCurrentOrganizationTeams(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
  inviteMemberList: makeSelectInviteMemberList()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadOrganizationProjects: (id) => dispatch(loadOrganizationProjects(id)),
    onLoadOrganizationMembers: (id) => dispatch(loadOrganizationMembers(id)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id)),
    onLoadOrganizationDetail: (id) => dispatch(loadOrganizationDetail(id)),
    onSearchMember: (keyword) => dispatch(searchMember(keyword)),
    onInviteMember: (orgId, memId) => dispatch(inviteMember(orgId, memId)),
    onDeleteProject: (id) => dispatch(deleteProject(id)),
    onAddProject: (project, resolve) => dispatch(addProject(project, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'organization', reducer })
const withSaga = injectSaga({ key: 'organization', saga })

const withProjectReducer = injectReducer({ key: 'project', reducer: reducerProject })
const withProjectSaga = injectSaga({ key: 'project', saga: sagaProject })

const withAppReducer = injectReducer({key: 'app', reducer: reducerApp})
const withAppSaga = injectSaga({key: 'app', saga: sagaApp})

export default compose(
  withReducer,
  withAppReducer,
  withProjectReducer,
  withProjectSaga,
  withAppSaga,
  withSaga,
  withConnect
)(Organization)





