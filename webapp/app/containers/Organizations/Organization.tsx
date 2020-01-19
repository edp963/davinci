import React from 'react'
import { Link } from 'react-router'
import { Icon, Tabs, Breadcrumb } from 'antd'
import Box from 'components/Box'
const styles = require('./Organization.less')
import { InjectedRouter } from 'react-router/lib/Router'
import MemberList from './component/MemberList'
import ProjectList from './component/ProjectList'
import Setting from './component/Setting'
import RoleList from './component/RoleList'
const utilStyles = require('assets/less/util.less')
const TabPane = Tabs.TabPane
import Avatar from 'components/Avatar'
import { connect } from 'react-redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducerProject from '../Projects/reducer'
import sagaProject from '../Projects/sagas'
import { compose } from 'redux'
import {
  editOrganization,
  deleteOrganization,
  loadOrganizationProjects,
  loadOrganizationMembers,
  loadOrganizationRole,
  loadOrganizationDetail,
  searchMember,
  inviteMember,
  deleteOrganizationMember,
  changeOrganizationMemberRole
} from './actions'
import { makeSelectLoginUser } from 'containers/App/selectors'
import {
  makeSelectOrganizations,
  makeSelectCurrentOrganizations,
  makeSelectCurrentOrganizationProjects,
  makeSelectCurrentOrganizationProjectsDetail,
  makeSelectCurrentOrganizationRole,
  makeSelectCurrentOrganizationMembers,
  makeSelectInviteMemberList
} from './selectors'
import { createStructuredSelector } from 'reselect'
import { addProject, editProject, deleteProject, getProjectStarUser, loadProjects, unStarProject, clickCollectProjects, loadCollectProjects } from 'containers/Projects/actions'
import { makeSelectStarUserList, makeSelectCollectProjects } from '../Projects/selectors'
import { IStarUser, IProject } from '../Projects'

interface IOrganizationProps {
  loginUser: any
  router: InjectedRouter
  organizations: any
  starUserList: IStarUser[]
  params: any
  inviteMemberList: any
  currentOrganization: IOrganization
  collectProjects: IProject[]
  onLoadOrganizationProjects: (param: {id: number, pageNum?: number, pageSize?: number}) => any
  onLoadOrganizationMembers: (id: number) => any
  onLoadOrganizationDetail: (id: number) => any
  onDeleteOrganizationMember: (id: number, resolve: () => any) => any
  onChangeOrganizationMemberRole: (id: number, role: number, resolve: () => any) => any
  currentOrganizationProjects: IOrganizationProjects[]
  currentOrganizationProjectsDetail: {total?: number, list: IOrganizationProjects[]}
  currentOrganizationTeams: IOrganizationTeams[]
  currentOrganizationMembers: IOrganizationMembers[]
  onInviteMember: (ordId: number, memId: number) => any
  onSearchMember: (keywords: string) => any
  onClickCollectProjects: (formType: string, project: object, resolve: (id: number) => any) => any
  onLoadCollectProjects: () => any
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
  roleNum?: number
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

export class Organization extends React.PureComponent <IOrganizationProps, {}> {
  constructor (props) {
    super(props)
  }

  private toProject = (id: number) => () => {
    this.props.router.push(`/project/${id}`)
  }

  private toThatTeam = (url) => {
    if (url) {
      this.props.router.push(url)
    }
  }

  public componentWillMount () {
    const {
      onLoadOrganizationMembers,
      onLoadOrganizationDetail,
      params: { organizationId }
    } = this.props
    onLoadOrganizationMembers(Number(organizationId))
    onLoadOrganizationDetail(Number(organizationId))
  }

  private deleteOrganization = (id) => {
    this.props.onDeleteOrganization(id, () => {
      this.props.router.push(`/account/organizations`)
    })
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
      inviteMemberList,
      starUserList,
      params: {organizationId},
      currentOrganizationProjectsDetail
    } = this.props

    const {avatar, name, memberNum, roleNum} = currentOrganization as IOrganization
    const projectNum = currentOrganizationProjects && currentOrganizationProjects.length ? currentOrganizationProjects.length : 0
    const memeberOfLoginUser = currentOrganizationMembers && currentOrganizationMembers.find((m) => m.user.id === loginUser.id)
    const isLoginUserOwner = !!memeberOfLoginUser && memeberOfLoginUser.user.role === 1
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
                currentOrganization={currentOrganization}
                organizationId={organizationId}
                organizationProjectsDetail={currentOrganizationProjectsDetail}
                toProject={this.toProject}
                loginUser={loginUser}
                organizationMembers={currentOrganizationMembers}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{memberNum}</span></span>} key="members">
              <MemberList
                loginUser={loginUser}
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
            <TabPane tab={<span><Icon type="usergroup-add" />角色<span className={styles.badge}>{roleNum}</span></span>} key="roles">
              <RoleList
                isLoginUserOwner={isLoginUserOwner}
                onLoadOrganizationDetail={this.props.onLoadOrganizationDetail}
                organizations={organizations}
                organizationMembers={currentOrganizationMembers}
                currentOrganization={this.props.currentOrganization}
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
  currentOrganizationTeams: makeSelectCurrentOrganizationRole(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
  inviteMemberList: makeSelectInviteMemberList()
})

export function mapDispatchToProps (dispatch) {
  return {
    onGetProjectStarUser: (id) => dispatch(getProjectStarUser(id)),
    onLoadOrganizationProjects: (param) => dispatch(loadOrganizationProjects(param)),
    onLoadOrganizationMembers: (id) => dispatch(loadOrganizationMembers(id)),
    onLoadOrganizationDetail: (id) => dispatch(loadOrganizationDetail(id)),
    onEditOrganization: (organization) => dispatch(editOrganization(organization)),
    onDeleteOrganization: (id, resolve) => dispatch(deleteOrganization(id, resolve)),
    onSearchMember: (keyword) => dispatch(searchMember(keyword)),
    onInviteMember: (orgId, memId) => dispatch(inviteMember(orgId, memId)),
    onDeleteOrganizationMember: (id, resolve) => dispatch(deleteOrganizationMember(id, resolve)),
    onChangeOrganizationMemberRole: (id, role, resolve) => dispatch(changeOrganizationMemberRole(id, role, resolve))
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





