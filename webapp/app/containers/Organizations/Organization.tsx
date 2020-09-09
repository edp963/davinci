import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Tabs, Breadcrumb } from 'antd'
import Box from 'components/Box'
const styles = require('./Organization.less')
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
import { OrganizationActions } from './actions'
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
import { ProjectActions } from 'containers/Projects/actions'
import { makeSelectStarUserList, makeSelectCollectProjects } from '../Projects/selectors'
import { RouteComponentWithParams } from 'utils/types'
import { IOrganization, IOrganizationProps } from './types'



export class Organization extends React.PureComponent <IOrganizationProps & RouteComponentWithParams, {}> {
  constructor (props) {
    super(props)
  }

  private toProject = (id: number) => () => {
    this.props.history.push(`/project/${id}`)
  }

  public componentWillMount () {
    const {
      onLoadOrganizationMembers,
      onLoadOrganizationDetail,
      onLoadOrganizationRole,
      match
    } = this.props
    const organizationId = +match.params.organizationId
    onLoadOrganizationMembers(organizationId)
    onLoadOrganizationDetail(organizationId)
    onLoadOrganizationRole(organizationId)
  }

  private deleteOrganization = (id) => {
    this.props.onDeleteOrganization(id, () => {
      this.props.history.push(`/account/organizations`)
    })
  }


  private editOrganization = (organization) => () => {
    this.props.onEditOrganization(organization)
  }

  private getRolesTotal (): number {
    const { currentOrganizationRole } = this.props
    return Array.isArray(currentOrganizationRole) ? currentOrganizationRole.length : 0
  }

  private getProjectsTotal () {
    const { currentOrganizationProjects } = this.props
    return Array.isArray(currentOrganizationProjects) ? currentOrganizationProjects.length : 0
  }

  private getMembersTotal () {
    const { currentOrganizationMembers } = this.props
    return Array.isArray(currentOrganizationMembers) ? currentOrganizationMembers.length : 0
  }

  public render () {
    const {
      loginUser,
      organizations,
      currentOrganization,
      currentOrganizationMembers,
      inviteMemberList,
      match: { params: { organizationId } },
      currentOrganizationProjectsDetail
    } = this.props

    if (!currentOrganization) { return null }
    const { avatar, name} = currentOrganization as IOrganization
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
            <TabPane tab={<span><Icon type="api" />项目<span className={styles.badge}>{this.getProjectsTotal()}</span></span>} key="projects">
              <ProjectList
                toProject={this.toProject}
                organizationId={+organizationId}
                currentOrganization={currentOrganization}
                organizationMembers={currentOrganizationMembers}
                organizationProjectsDetail={currentOrganizationProjectsDetail}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员<span className={styles.badge}>{this.getMembersTotal()}</span></span>} key="members">
              <MemberList
                loginUser={loginUser}
                organizationId={+organizationId}
                loadOrganizationsMembers={this.props.onLoadOrganizationMembers}
                organizationMembers={currentOrganizationMembers}
                currentOrganization={currentOrganization}
                inviteMemberList={inviteMemberList}
                onInviteMember={this.props.onInviteMember}
                handleSearchMember={this.props.onSearchMember}
                deleteOrganizationMember={this.props.onDeleteOrganizationMember}
                changeOrganizationMemberRole={this.props.onChangeOrganizationMemberRole}
                onGetRoleListByMemberId={this.props.onGetRoleListByMemberId}
              />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />角色<span className={styles.badge}>{this.getRolesTotal()}</span></span>} key="roles">
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
  loginUser: makeSelectLoginUser(),
  starUserList: makeSelectStarUserList(),
  organizations: makeSelectOrganizations(),
  inviteMemberList: makeSelectInviteMemberList(),
  currentOrganization: makeSelectCurrentOrganizations(),
  currentOrganizationRole: makeSelectCurrentOrganizationRole(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
  currentOrganizationProjects: makeSelectCurrentOrganizationProjects(),
  currentOrganizationProjectsDetail: makeSelectCurrentOrganizationProjectsDetail()
})

export function mapDispatchToProps (dispatch) {
  return {
    onGetProjectStarUser: (id) => dispatch(ProjectActions.getProjectStarUser(id)),
    onLoadOrganizationProjects: (param) => dispatch(OrganizationActions.loadOrganizationProjects(param)),
    onLoadOrganizationRole: (orgId) => dispatch(OrganizationActions.loadOrganizationRole(orgId)),
    onLoadOrganizationMembers: (id) => dispatch(OrganizationActions.loadOrganizationMembers(id)),
    onLoadOrganizationDetail: (id) => dispatch(OrganizationActions.loadOrganizationDetail(id)),
    onEditOrganization: (organization) => dispatch(OrganizationActions.editOrganization(organization)),
    onDeleteOrganization: (id, resolve) => dispatch(OrganizationActions.deleteOrganization(id, resolve)),
    onSearchMember: (keyword) => dispatch(OrganizationActions.searchMember(keyword)),
    onInviteMember: (orgId, members, needEmail, resolve) => dispatch(OrganizationActions.inviteMember(orgId, members, needEmail, resolve)),
    onDeleteOrganizationMember: (id, resolve) => dispatch(OrganizationActions.deleteOrganizationMember(id, resolve)),
    onChangeOrganizationMemberRole: (id, role, resolve) => dispatch(OrganizationActions.changeOrganizationMemberRole(id, role, resolve)),
    onGetRoleListByMemberId: (orgId, memberId, resolve) => dispatch(OrganizationActions.getRoleListByMemberId(orgId, memberId, resolve))
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





