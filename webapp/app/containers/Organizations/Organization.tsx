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
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'
import {connect} from 'react-redux'
import saga from './sagas'
// import sagaApp from '../App/sagas'
import reducerTeam from '../Teams/reducer'
import sagaTeam from '../Teams/sagas'
import injectReducer from '../../utils/injectReducer'
import reducer from './reducer'
import injectSaga from '../../utils/injectSaga'
// import reducerApp from '../App/reducer'
import reducerProject from '../Projects/reducer'
import sagaProject from '../Projects/sagas'
import {compose} from 'redux'
import {
  editOrganization,
  deleteOrganization,
  loadOrganizationProjects,
  loadOrganizationMembers,
  loadOrganizationTeams,
  loadOrganizationDetail,
  searchMember,
  inviteMember,
  deleteOrganizationMember,
  changeOrganizationMemberRole
} from './actions'
import {makeSelectLoginUser} from '../App/selectors'
import {
  makeSelectOrganizations,
  makeSelectCurrentOrganizations,
  makeSelectCurrentOrganizationProjects,
  makeSelectCurrentOrganizationProjectsDetail,
  makeSelectCurrentOrganizationTeams,
  makeSelectCurrentOrganizationMembers,
  makeSelectInviteMemberList
} from './selectors'
import {createStructuredSelector} from 'reselect'
import {addProject, editProject, deleteProject, getProjectStarUser, loadProjects, unStarProject} from '../Projects/actions'
import {checkNameUniqueAction} from '../App/actions'
import {makeSelectStarUserList} from '../Projects/selectors'
import {IStarUser} from '../Projects'

interface IOrganizationProps {
  loginUser: any
  router: InjectedRouter
  organizations: any
  starUserList: IStarUser[]
  params: any
  inviteMemberList: any
  currentOrganization: IOrganization
  onLoadOrganizationProjects: (param: {id: number, pageNum?: number, pageSize?: number}) => any
  onLoadOrganizationMembers: (id: number) => any
  onLoadOrganizationTeams: (id: number) => any
  onLoadOrganizationDetail: (id: number) => any
  onDeleteOrganizationMember: (id: number, resolve: () => any) => any
  onChangeOrganizationMemberRole: (id: number, role: number, resolve: () => any) => any
  currentOrganizationProjects: IOrganizationProjects[]
  currentOrganizationProjectsDetail: {total?: number, list: IOrganizationProjects[]}
  currentOrganizationTeams: IOrganizationTeams[]
  currentOrganizationMembers: IOrganizationMembers[]
  onInviteMember: (ordId: number, memId: number) => any
  onSearchMember: (keywords: string) => any
  onAddProject: (project: any, resolve: () => any) => any
  onEditProject: (project: any, resolve: () => any) => any
  onDeleteProject: (id: number) => any
  onStarProject: (id: number, resolve: () => any) => any,
  onGetProjectStarUser: (id: number) => any,
  onEditOrganization: (organization: IOrganization) => any
  onDeleteOrganization: (id: number, resolve: () => any) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export interface IOrganization {
  id: number
  name: string
  description: string
  avatar: string
  allowCreateProject?: number
  allowDeleteOrTransferProject?: number
  allowChangeVisibility?: number
  memberPermission?: number
  projectNum?: number
  memberNum?: number
  teamNum?: number
  role?: number
}

export interface IOrganizationProjects {
  id?: number
  description?: string
  name?: string
  total?: number
  isStar?: boolean
  orgId?: number
  pic?: string
  starNum?: number
  userId?: number
  visibility?: boolean
  createBy?: {
    avatar?: string
    id?: number
    username?: string
  }
}
export interface IOrganizationTeams {
  id?: number
  orgId?: number
  name?: string,
  description?: string,
  parentTeamId?: number,
  visibility?: boolean
}
export interface IOrganizationMembers {
  id: number
  teamNum?: number
  user?: {
    id?: number
    role?: number
    avatar?: string
    username?: string
  }
}
interface IOrganizationStates {
  pageNum: number
  pageSize: number
}

export class Organization extends React.PureComponent <IOrganizationProps, IOrganizationStates> {
  constructor (props) {
    super(props)
    this.state = {
      pageNum: 1,
      pageSize: 10
    }
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
    onLoadOrganizationProjects({id: Number(organizationId)})
    onLoadOrganizationMembers(Number(organizationId))
    onLoadOrganizationTeams(Number(organizationId))
    onLoadOrganizationDetail(Number(organizationId))
  }
  private getOrganizationProjectsByPagination = (obj) => {
    const { onLoadOrganizationProjects, params: { organizationId }} = this.props
    this.setState({
      pageNum: obj.pageNum,
      pageSize: obj.pageSize
    })
    const param = {
      keyword: obj.keyword,
      id: organizationId,
      pageNum: obj.pageNum,
      pageSize: obj.pageSize
    }
    onLoadOrganizationProjects(param)
  }
  private deleteOrganization = (id) => () => {
    this.props.onDeleteOrganization(id, () => {
      this.props.router.push(`/account/organizations`)
    })
  }

  private starProject = (id)  => () => {
    const { onStarProject, params: { organizationId } } = this.props
    const param = {
      id: Number(organizationId),
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize
    }
    onStarProject(id, () => {
      this.props.onLoadOrganizationProjects(param)
    })
  }

  private getStarProjectUserList = (id) => () => {
    const { onGetProjectStarUser } = this.props
    onGetProjectStarUser(id)
  }

  private editOrganization = (organization) => () => {
    this.props.onEditOrganization(organization)
  }

  public render () {
    const {
      loginUser,
      organizations,
      currentOrganization,
      currentOrganizationProjects,
      currentOrganizationMembers,
      currentOrganizationTeams,
      inviteMemberList,
      starUserList,
      params: {organizationId},
      currentOrganizationProjectsDetail,
      onCheckUniqueName
    } = this.props
    const {avatar, name, memberNum, teamNum} = currentOrganization as IOrganization
    const projectNum = currentOrganizationProjects && currentOrganizationProjects.length ? currentOrganizationProjects.length : 0
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
          <Tabs>
            <TabPane tab={<span><Icon type="api" />项目<span className={styles.badge}>{projectNum}</span></span>} key="projects">
              <ProjectList
                unStar={this.starProject}
                userList={this.getStarProjectUserList}
                getOrganizationProjectsByPagination={this.getOrganizationProjectsByPagination}
                currentOrganization={currentOrganization}
                deleteProject={this.delete}
                onCheckUniqueName={this.props.onCheckUniqueName}
                onAddProject={this.props.onAddProject}
                onEditProject={this.props.onEditProject}
                onLoadOrganizationProjects={this.props.onLoadOrganizationProjects}
                organizationId={this.props.params['organizationId']}
                organizationProjects={currentOrganizationProjects}
                organizationProjectsDetail={currentOrganizationProjectsDetail}
                toProject={this.toProject}
                loginUser={loginUser}
                starUser={starUserList}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{memberNum}</span></span>} key="members">
              <MemberList
                toThatUserProfile={this.toThatTeam}
                organizationId={organizationId}
                loadOrganizationsMembers={this.props.onLoadOrganizationMembers}
                organizationMembers={currentOrganizationMembers}
                currentOrganization={currentOrganization}
                inviteMemberList={inviteMemberList}
                onInviteMember={this.props.onInviteMember}
                handleSearchMember={this.props.onSearchMember}
                deleteOrganizationMember={this.props.onDeleteOrganizationMember}
                changeOrganizationMemberRole={this.props.onChangeOrganizationMemberRole}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />团队<span className={styles.badge}>{teamNum}</span></span>} key="teams">
              <TeamList
                loadOrganizationTeams={this.props.onLoadOrganizationTeams}
                organizations={organizations}
                currentOrganization={this.props.currentOrganization}
                organizationTeams={currentOrganizationTeams}
                toThatTeam={this.toThatTeam}
              />
            </TabPane>
            {
              currentOrganization && currentOrganization.role === 1 ? <TabPane tab={<span><Icon type="setting" />设置</span>} key="settings">
                <Setting
                  currentOrganization={this.props.currentOrganization}
                  editOrganization={this.editOrganization}
                  deleteOrganization={this.deleteOrganization}
                />
              </TabPane> : ''}
          </Tabs>
        </Box.Body>
      </Box>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  starUserList: makeSelectStarUserList(),
  loginUser: makeSelectLoginUser(),
  organizations: makeSelectOrganizations(),
  currentOrganization: makeSelectCurrentOrganizations(),
  currentOrganizationProjects: makeSelectCurrentOrganizationProjects(),
  currentOrganizationProjectsDetail: makeSelectCurrentOrganizationProjectsDetail(),
  currentOrganizationTeams: makeSelectCurrentOrganizationTeams(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
  inviteMemberList: makeSelectInviteMemberList()
})

export function mapDispatchToProps (dispatch) {
  return {
    onStarProject: (id, resolve) => dispatch(unStarProject(id, resolve)),
    onGetProjectStarUser: (id) => dispatch(getProjectStarUser(id)),
    onLoadOrganizationProjects: (param) => dispatch(loadOrganizationProjects(param)),
    onLoadOrganizationMembers: (id) => dispatch(loadOrganizationMembers(id)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id)),
    onLoadOrganizationDetail: (id) => dispatch(loadOrganizationDetail(id)),
    onEditOrganization: (organization) => dispatch(editOrganization(organization)),
    onDeleteOrganization: (id, resolve) => dispatch(deleteOrganization(id, resolve)),
    onSearchMember: (keyword) => dispatch(searchMember(keyword)),
    onInviteMember: (orgId, memId) => dispatch(inviteMember(orgId, memId)),
    onDeleteProject: (id) => dispatch(deleteProject(id)),
    onDeleteOrganizationMember: (id, resolve) => dispatch(deleteOrganizationMember(id, resolve)),
    onChangeOrganizationMemberRole: (id, role, resolve) => dispatch(changeOrganizationMemberRole(id, role, resolve)),
    onAddProject: (project, resolve) => dispatch(addProject(project, resolve)),
    onEditProject: (project, resolve) => dispatch(editProject(project, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withProjectReducer = injectReducer({ key: 'project', reducer: reducerProject })
const withProjectSaga = injectSaga({ key: 'project', saga: sagaProject })
export default compose(
  withProjectReducer,
  withProjectSaga,
  withConnect
)(Organization)





